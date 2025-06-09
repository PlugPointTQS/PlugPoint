package tqs.plugpoint.backend.controllers; // <-- ajusta ao teu package

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tqs.plugpoint.backend.dto.DailyEnergyDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.services.StatisticsService;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

@RestController
@RequestMapping("/api/admin/stations")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    /** JSON – estatísticas agregadas */
    @Operation(summary = "Get station aggregated stats", description = "Fetches the aggregated statistics of a charging station within the given date range.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the station statistics."),
            @ApiResponse(responseCode = "400", description = "Invalid date format or station ID."),
            @ApiResponse(responseCode = "404", description = "Station not found with the provided ID."),
    })
    @GetMapping("/{id}/stats")
    public StationStatsDTO getStationStats(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        return statisticsService.getStats(id, from, to);
    }

    /** CSV – download */
    @Operation(summary = "Export station statistics to CSV", description = "Exports the station statistics for a given date range to a CSV file.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully exported the station statistics to CSV."),
            @ApiResponse(responseCode = "400", description = "Invalid date format or station ID."),
            @ApiResponse(responseCode = "500", description = "Error generating the CSV file.")
    })
    @GetMapping(value = "/{id}/stats/export", produces = "text/csv")
    public void exportStationStatsCsv(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            HttpServletResponse response) throws IOException {

        StationStatsDTO dto = statisticsService.getStats(id, from, to);

        String filename = "station-" + id + "-stats-" +
                DateTimeFormatter.ofPattern("yyyyMMddHHmm").format(LocalDateTime.now()) + ".csv";

        response.setHeader("Content-Disposition", "attachment; filename=" + filename);
        response.setContentType(MediaType.TEXT_PLAIN_VALUE);

        try (PrintWriter out = response.getWriter()) {
            out.println("energyDeliveredKWh,sessions,averageOccupancyPct");
            out.printf(Locale.US, "%.2f,%d,%.2f%n",
                    dto.energyDeliveredKWh(),
                    dto.sessions(),
                    dto.averageOccupancyPct());
        }
    }

    @Operation(summary = "Get daily energy stats", description = "Fetches the daily energy statistics of a station within a given date range.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the daily energy statistics."),
            @ApiResponse(responseCode = "400", description = "Invalid date format or station ID."),
            @ApiResponse(responseCode = "404", description = "Station not found with the provided ID."),
    })
    @GetMapping("/{id}/stats/daily-energy")
    public ResponseEntity<List<DailyEnergyDTO>> getDailyEnergy(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<DailyEnergyDTO> result = statisticsService.getDailyEnergyByStation(id, from, to);
        return ResponseEntity.ok(result);
    }
}

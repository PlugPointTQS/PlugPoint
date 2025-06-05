package tqs.plugpoint.backend.controllers;   // <-- ajusta ao teu package

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

@RestController
@RequestMapping("/api/admin/stations")
public class StatisticsController {

    @Autowired
    private StatisticsService statisticsService;

    /** JSON – estatísticas agregadas */
    @GetMapping("/{id}/stats")
    public StationStatsDTO getStationStats(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        return statisticsService.getStats(id, from, to);
    }

    /** CSV – download */
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

    @GetMapping("/{id}/stats/daily-energy")
    public ResponseEntity<List<DailyEnergyDTO>> getDailyEnergy(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

        List<DailyEnergyDTO> result = statisticsService.getDailyEnergyByStation(id, from, to);
        return ResponseEntity.ok(result);
    }

}

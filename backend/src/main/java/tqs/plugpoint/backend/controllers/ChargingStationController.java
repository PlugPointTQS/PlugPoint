package tqs.plugpoint.backend.controllers;

import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import tqs.plugpoint.backend.dto.StationAvailabilityDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.services.ChargingStationService;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class ChargingStationController {

private final ChargingStationService service;
private final ChargingStationService stationService;

@Operation(summary = "Get all charging stations", description = "Fetches a list of all charging stations.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the list of stations."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
})
@GetMapping
public ResponseEntity<List<ChargingStation>> getAllStations() {
    return ResponseEntity.ok(service.getAllStations());
}

@Operation(summary = "Get a charging station by ID", description = "Fetches a charging station by its unique ID.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the charging station."),
        @ApiResponse(responseCode = "404", description = "Charging station not found.")
})
@GetMapping("/{id}")
public ResponseEntity<ChargingStation> getStationById(@PathVariable Long id) {
    return service.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
}

@Operation(summary = "Create a new charging station", description = "Creates a new charging station and stores it in the system.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully created the charging station."),
        @ApiResponse(responseCode = "400", description = "Bad request: Invalid station data.")
})
@PostMapping
public ResponseEntity<?> createStation(@RequestBody ChargingStation station) {
    if (service.nameExists(station.getName())) {
        return ResponseEntity.badRequest().body("Station name already exists.");
    }
    return ResponseEntity.ok(service.createStation(station));
}

@Operation(summary = "Get charging stations by operator", description = "Fetches a list of charging stations for a specific operator.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the charging stations for the operator."),
        @ApiResponse(responseCode = "404", description = "No stations found for the given operator.")
})
@GetMapping("/operator/{operatorId}")
public ResponseEntity<List<ChargingStation>> getByOperator(@PathVariable Long operatorId) {
    return ResponseEntity.ok(service.getStationsByOperator(operatorId));
}

@Operation(summary = "Delete a charging station", description = "Deletes a charging station by its ID.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Successfully deleted the charging station."),
        @ApiResponse(responseCode = "404", description = "Charging station not found with the provided ID.")
})
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
    service.deleteStation(id);
    return ResponseEntity.noContent().build();
}

@Operation(summary = "Get nearby charging stations", description = "Fetches a list of nearby charging stations based on latitude, longitude, and optional radius.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the nearby charging stations."),
        @ApiResponse(responseCode = "400", description = "Invalid latitude, longitude, or radius.")
})
@GetMapping("/nearby")
public ResponseEntity<List<ChargingStation>> getNearbyStations(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "5.0") double radiusKm) {
    return ResponseEntity.ok(service.getStationsNearby(lat, lng, radiusKm));
}

@Operation(summary = "Get station availability", description = "Fetches the availability status of charging stations.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the availability of the stations."),
        @ApiResponse(responseCode = "500", description = "Internal server error.")
})
@GetMapping("/availability")
public ResponseEntity<List<StationAvailabilityDTO>> getStationAvailability() {
    return ResponseEntity.ok(service.getStationAvailability());
}

@Operation(summary = "Get station statistics", description = "Fetches statistics for a specific charging station between the given date range.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved the station statistics."),
        @ApiResponse(responseCode = "400", description = "Invalid date format or station ID."),
        @ApiResponse(responseCode = "404", description = "Charging station not found.")
})
@GetMapping("/admin/stations/{id}/stats")
public StationStatsDTO stats(
        @PathVariable Long id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {

    return stationService.getStationStats(id, from, to);
}

@Operation(summary = "Export station statistics to CSV", description = "Exports the statistics of a specific station to a CSV file.")
@ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully exported the station statistics to CSV."),
        @ApiResponse(responseCode = "500", description = "Error generating the CSV file.")
})
@GetMapping(value = "/admin/stations/{id}/stats/export", produces = "text/csv")
public void exportCsv(
        @PathVariable Long id,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
        HttpServletResponse res) throws IOException {

    StationStatsDTO dto = stationService.getStationStats(id, from, to);
    res.setHeader("Content-Disposition",
            "attachment; filename=station-" + id + "-stats.csv");

    try (PrintWriter out = res.getWriter()) {
        out.println("energyDeliveredKWh,sessions,averageOccupancyPct");
        out.printf(Locale.US, "%.2f,%d,%.2f%n",
                dto.energyDeliveredKWh(), dto.sessions(), dto.averageOccupancyPct());
    }
}
}

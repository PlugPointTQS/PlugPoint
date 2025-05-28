package tqs.plugpoint.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.services.ChargingStationService;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class ChargingStationController {

    private final ChargingStationService service;

    @GetMapping
    public ResponseEntity<List<ChargingStation>> getAllStations() {
        return ResponseEntity.ok(service.getAllStations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChargingStation> getStationById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createStation(@RequestBody ChargingStation station) {
        if (service.nameExists(station.getName())) {
            return ResponseEntity.badRequest().body("Station name already exists.");
        }
        return ResponseEntity.ok(service.createStation(station));
    }

    @GetMapping("/operator/{operatorId}")
    public ResponseEntity<List<ChargingStation>> getByOperator(@PathVariable Long operatorId) {
        return ResponseEntity.ok(service.getStationsByOperator(operatorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStation(@PathVariable Long id) {
        service.deleteStation(id);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/nearby")
    public ResponseEntity<List<ChargingStation>> getNearbyStations(
        @RequestParam double lat,
        @RequestParam double lng,
        @RequestParam(defaultValue = "5.0") double radiusKm) {
        return ResponseEntity.ok(service.getStationsNearby(lat, lng, radiusKm));
}

}

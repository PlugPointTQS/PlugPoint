package tqs.plugpoint.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.services.ChargingStationService;

import java.util.List;

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
}

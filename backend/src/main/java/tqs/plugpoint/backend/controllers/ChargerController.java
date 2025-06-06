package tqs.plugpoint.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.services.ChargerService;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/chargers")
@RequiredArgsConstructor
public class ChargerController {

    private final ChargerService chargerService;

    @GetMapping
    public ResponseEntity<List<Charger>> getAllChargers() {
        return ResponseEntity.ok(chargerService.getAllChargers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Charger> getChargerById(@PathVariable Long id) {
        return chargerService.getChargerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Charger>> getChargersByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(chargerService.getChargersByStationId(stationId));
    }
    
    @PostMapping
    public ResponseEntity<Charger> createCharger(@RequestBody Charger charger) {
        if (charger.getId() != null) {
            return ResponseEntity.badRequest().build(); // Não deve vir com ID
        }
    
        // Garantir valores default seguros (opcional, se aplicável)
        if (charger.getStatus() == null) {
            charger.setStatus(Charger.ChargerStatus.AVAILABLE);
        }
        if (charger.getType() == null) {
            charger.setType(Charger.ChargerType.TYPE2);
        }
    
        return ResponseEntity.ok(chargerService.createCharger(charger));
    }
    

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharger(@PathVariable Long id) {
        chargerService.deleteCharger(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Charger> updateCharger(@PathVariable Long id, @RequestBody Charger updatedCharger) {
        try {
            Charger charger = chargerService.updateCharger(id, updatedCharger);
            return ResponseEntity.ok(charger);
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

}
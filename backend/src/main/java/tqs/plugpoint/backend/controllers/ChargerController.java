package tqs.plugpoint.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

    @Operation(summary = "Get all chargers", description = "Fetches a list of all chargers in the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the list of chargers."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @GetMapping
    public ResponseEntity<List<Charger>> getAllChargers() {
        return ResponseEntity.ok(chargerService.getAllChargers());
    }

    @Operation(summary = "Get charger by ID", description = "Fetches a charger by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the charger."),
            @ApiResponse(responseCode = "404", description = "Charger not found with the provided ID.")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Charger> getChargerById(@PathVariable Long id) {
        return chargerService.getChargerById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get chargers by station ID", description = "Fetches a list of chargers for a specific station.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the chargers for the station."),
            @ApiResponse(responseCode = "404", description = "No chargers found for the provided station ID.")
    })
    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Charger>> getChargersByStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(chargerService.getChargersByStationId(stationId));
    }

    @Operation(summary = "Create a new charger", description = "Creates a new charger and stores it in the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully created the new charger."),
            @ApiResponse(responseCode = "400", description = "Bad request: Invalid charger data.")
    })
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

    @Operation(summary = "Delete a charger", description = "Deletes a charger by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted the charger."),
            @ApiResponse(responseCode = "404", description = "Charger not found with the provided ID.")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCharger(@PathVariable Long id) {
        chargerService.deleteCharger(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Update an existing charger", description = "Updates an existing charger with new data.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated the charger."),
            @ApiResponse(responseCode = "404", description = "Charger not found with the provided ID."),
            @ApiResponse(responseCode = "400", description = "Bad request: Invalid charger data.")
    })
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

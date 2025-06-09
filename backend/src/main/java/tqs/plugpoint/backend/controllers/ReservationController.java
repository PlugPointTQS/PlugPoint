package tqs.plugpoint.backend.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.services.ReservationService;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "Get all reservations", description = "Fetches a list of all reservations.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the list of reservations."),
            @ApiResponse(responseCode = "500", description = "Internal server error.")
    })
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @Operation(summary = "Get a reservation by ID", description = "Fetches a reservation by its unique ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the reservation."),
            @ApiResponse(responseCode = "404", description = "Reservation not found.")
    })
    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Get reservations by user ID", description = "Fetches a list of reservations made by a specific user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the user's reservations."),
            @ApiResponse(responseCode = "404", description = "No reservations found for the given user.")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUserId(userId));
    }

    @Operation(summary = "Get reservations by charger ID", description = "Fetches a list of reservations associated with a specific charger.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved the reservations for the charger."),
            @ApiResponse(responseCode = "404", description = "No reservations found for the given charger.")
    })
    @GetMapping("/charger/{chargerId}")
    public ResponseEntity<List<Reservation>> getByCharger(@PathVariable Long chargerId) {
        return ResponseEntity.ok(reservationService.getReservationsByChargerId(chargerId));
    }

    @Operation(summary = "Create a new reservation", description = "Creates a new reservation in the system.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully created the reservation."),
            @ApiResponse(responseCode = "400", description = "Bad request: Invalid reservation data.")
    })
    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.createReservation(reservation));
    }

    @Operation(summary = "Update reservation status", description = "Updates the status of an existing reservation.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully updated the reservation status."),
            @ApiResponse(responseCode = "404", description = "Reservation not found with the provided ID."),
            @ApiResponse(responseCode = "400", description = "Bad request: Invalid status or user ID.")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<Reservation> updateStatus(
            @PathVariable Long id,
            @RequestParam Reservation.Status status,
            @RequestParam Long userId) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status, userId));
    }

    @Operation(summary = "Delete a reservation", description = "Deletes a reservation by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Successfully deleted the reservation."),
            @ApiResponse(responseCode = "404", description = "Reservation not found with the provided ID.")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Cancel a reservation", description = "Cancels an existing reservation by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully cancelled the reservation."),
            @ApiResponse(responseCode = "404", description = "Reservation not found with the provided ID."),
            @ApiResponse(responseCode = "400", description = "Bad request: Invalid user ID.")
    })
    @PostMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable Long id, @RequestParam Long userId) {
        Reservation cancelled = reservationService.updateReservationStatus(id, Reservation.Status.CANCELLED, userId);
        return ResponseEntity.ok(cancelled);
    }
}

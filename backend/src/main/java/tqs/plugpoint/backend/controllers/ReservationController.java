package tqs.plugpoint.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.services.ReservationService;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reservation> getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUserId(userId));
    }
    
    @GetMapping("/charger/{chargerId}")
    public ResponseEntity<List<Reservation>> getByCharger(@PathVariable Long chargerId) {
        return ResponseEntity.ok(reservationService.getReservationsByChargerId(chargerId));
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestBody Reservation reservation) {
        return ResponseEntity.ok(reservationService.createReservation(reservation));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Reservation> updateStatus(
            @PathVariable Long id,
            @RequestParam Reservation.Status status) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        reservationService.deleteReservation(id);
        return ResponseEntity.noContent().build();
    }
}

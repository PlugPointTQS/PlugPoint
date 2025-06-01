package tqs.plugpoint.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.repositories.ReservationRepository;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getReservationsByChargerId(Long chargerId) {
        return reservationRepository.findByChargerId(chargerId);
    }

    public Reservation createReservation(Reservation reservation) {
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setStatus(Reservation.Status.CONFIRMED);
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }

    public Reservation updateReservationStatus(Long id, Reservation.Status status, Long userId) {
        Optional<Reservation> optional = reservationRepository.findById(id);
        if (optional.isEmpty()) {
            throw new RuntimeException("Reservation not found");
        }
        Reservation reservation = optional.get();

        // Verifica se a reserva pertence ao userId informado
        if (!reservation.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: this reservation does not belong to the user");
        }

        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }

}

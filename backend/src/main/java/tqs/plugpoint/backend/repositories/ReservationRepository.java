package tqs.plugpoint.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tqs.plugpoint.backend.entities.Reservation;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserId(Long userId);

    List<Reservation> findByChargerId(Long chargerId);

    List<Reservation> findByChargerIdInAndStartTimeBetween(
        List<Long> chargerIds,
        LocalDateTime start, LocalDateTime end);

}

package tqs.plugpoint.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tqs.plugpoint.backend.entities.Charger;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Long> {
    List<Charger> findByStationId(Long stationId);
    long countByStationIdAndStatus(Long stationId, Charger.ChargerStatus status);
}



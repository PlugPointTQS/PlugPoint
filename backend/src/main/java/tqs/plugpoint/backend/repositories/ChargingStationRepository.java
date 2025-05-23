package tqs.plugpoint.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tqs.plugpoint.backend.entities.ChargingStation;

import java.util.List;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {
    boolean existsByName(String name);

    List<ChargingStation> findByOperatorId(Long operatorId);
}

package tqs.plugpoint.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import tqs.plugpoint.backend.entities.ChargingStation;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Long> {
    boolean existsByName(String name);

    List<ChargingStation> findByOperatorId(Long operatorId);
    
}

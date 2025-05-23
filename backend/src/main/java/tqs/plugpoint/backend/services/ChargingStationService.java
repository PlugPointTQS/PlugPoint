package tqs.plugpoint.backend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.repositories.ChargingStationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository repository;

    public List<ChargingStation> getAllStations() {
        return repository.findAll();
    }

    public Optional<ChargingStation> getById(Long id) {
        return repository.findById(id);
    }

    public ChargingStation createStation(ChargingStation station) {
        station.setCreatedAt(LocalDateTime.now());
        return repository.save(station);
    }

    public void deleteStation(Long id) {
        repository.deleteById(id);
    }

    public boolean nameExists(String name) {
        return repository.existsByName(name);
    }

    public List<ChargingStation> getStationsByOperator(Long operatorId) {
        return repository.findByOperatorId(operatorId);
    }
}

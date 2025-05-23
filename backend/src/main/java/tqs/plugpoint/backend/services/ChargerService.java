package tqs.plugpoint.backend.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.repositories.ChargerRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChargerService {

    private final ChargerRepository chargerRepository;

    public List<Charger> getAllChargers() {
        return chargerRepository.findAll();
    }

    public Optional<Charger> getChargerById(Long id) {
        return chargerRepository.findById(id);
    }

    public List<Charger> getChargersByStationId(Long stationId) {
        return chargerRepository.findByStationId(stationId);
    }

    public Charger createCharger(Charger charger) {
        return chargerRepository.save(charger);
    }

    public void deleteCharger(Long id) {
        chargerRepository.deleteById(id);
    }
}

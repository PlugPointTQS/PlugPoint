package tqs.plugpoint.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import tqs.plugpoint.backend.dto.StationAvailabilityDTO;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.repositories.ChargerRepository;
import tqs.plugpoint.backend.repositories.ChargingStationRepository;

@Service
@RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository repository;
    private final ChargerRepository chargerRepository;

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

    public List<ChargingStation> getStationsNearby(double lat, double lng, double radiusKm) {
    // Substituir pela lógica real se o banco não suportar função nativa
        return repository.findAll().stream()
        .filter(station -> {
            double distance = haversine(lat, lng, station.getLatitude(), station.getLongitude());
            return distance <= radiusKm;
        })
        .toList();
    }

    // Função auxiliar usando fórmula de Haversine
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // raio da Terra em km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    public List<StationAvailabilityDTO> getStationAvailability() {
        List<ChargingStation> stations = repository.findAll();
        return stations.stream()
                .map(station -> {
                    long availableChargers = chargerRepository.countByStationIdAndStatus(
                            station.getId(), Charger.ChargerStatus.AVAILABLE);
                    return new StationAvailabilityDTO(
                            station.getId(),
                            station.getName(),
                            availableChargers
                    );
                }).collect(Collectors.toList());
    }


    


    
}

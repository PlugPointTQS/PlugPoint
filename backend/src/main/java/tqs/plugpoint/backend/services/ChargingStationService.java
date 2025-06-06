package tqs.plugpoint.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Map;
import java.time.Duration;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import tqs.plugpoint.backend.dto.StationAvailabilityDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.repositories.ChargerRepository;
import tqs.plugpoint.backend.repositories.ChargingStationRepository;
import tqs.plugpoint.backend.repositories.ReservationRepository;

@Service
@RequiredArgsConstructor
public class ChargingStationService {

    private final ChargingStationRepository repository;
    private final ChargerRepository chargerRepository;
    private final ReservationRepository reservationRepository;

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


    public StationStatsDTO getStationStats(
        Long stationId, LocalDateTime from, LocalDateTime to) {

        List<Charger> chargers = chargerRepository.findByStationId(stationId);
        if (chargers.isEmpty()) throw new EntityNotFoundException("Station not found");

        List<Long> chargerIds = chargers.stream().map(Charger::getId).toList();
        List<Reservation> reservations =
            reservationRepository.findByChargerIdInAndStartTimeBetween(chargerIds, from, to);

        double hoursRange = Duration.between(from, to).toMinutes() / 60.0;

        double totalEnergy = 0, timeBooked = 0;
        Map<Long, Double> powerByCharger = chargers.stream()
            .collect(Collectors.toMap(Charger::getId, Charger::getPower));

        for (Reservation r : reservations) {
            LocalDateTime s = r.getStartTime().isBefore(from) ? from : r.getStartTime();
            LocalDateTime e = r.getEndTime().isAfter(to)     ? to   : r.getEndTime();

            double hours = Duration.between(s, e).toMinutes() / 60.0;
            timeBooked  += hours;
            totalEnergy += hours * powerByCharger.get(r.getChargerId());
        }

        double occupancy = chargers.isEmpty()
            ? 0 : (timeBooked / (chargers.size() * hoursRange)) * 100;

        return new StationStatsDTO(totalEnergy, reservations.size(), occupancy);
    }



    
}

package tqs.plugpoint.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import tqs.plugpoint.backend.dto.DailyEnergyDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.entities.*;
import tqs.plugpoint.backend.repositories.ReservationRepository;
import tqs.plugpoint.backend.repositories.ChargerRepository;

import jakarta.persistence.EntityNotFoundException;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatisticsService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ChargerRepository chargerRepository;

    /**
     * Calcula energia, número de sessões e ocupação média da estação no intervalo [from,to].
     */
    public StationStatsDTO getStats(Long stationId, LocalDateTime from, LocalDateTime to) {

        List<Charger> chargers = chargerRepository.findByStationId(stationId);
        if (chargers.isEmpty()) {
            throw new EntityNotFoundException("Station " + stationId + " not found");
        }

        // IDs dos carregadores dessa estação
        List<Long> chargerIds = chargers.stream().map(Charger::getId).toList();

        // Reservas dentro (ou sobrepondo) o intervalo
        List<Reservation> reservations = reservationRepository
                .findByChargerIdInAndStartTimeBetween(chargerIds, from, to);

        // Potência por carregador (kW)
        Map<Long, Double> powerMap = chargers.stream()
                .collect(Collectors.toMap(Charger::getId, Charger::getPower));

        double totalEnergy = 0.0;   // kWh
        double timeBooked  = 0.0;   // horas

        for (Reservation r : reservations) {
            LocalDateTime start = r.getStartTime().isBefore(from) ? from : r.getStartTime();
            LocalDateTime end   = r.getEndTime().isAfter(to)     ? to   : r.getEndTime();

            double hours = Duration.between(start, end).toMinutes() / 60.0;
            timeBooked  += hours;

            Double chargerPower = powerMap.get(r.getChargerId());
            if (chargerPower != null) {
                totalEnergy += hours * chargerPower;   // kWh = kW * h
            }
        }

        double intervalHours = Duration.between(from, to).toMinutes() / 60.0;
        double averageOccupancy = chargers.isEmpty() ? 0 :
                (timeBooked / (chargers.size() * intervalHours)) * 100.0;

        return new StationStatsDTO(totalEnergy, reservations.size(), averageOccupancy);
    }

    public List<DailyEnergyDTO> getDailyEnergyByStation(Long stationId, LocalDateTime from, LocalDateTime to) {
    List<Charger> chargers = chargerRepository.findByStationId(stationId);
    if (chargers.isEmpty()) {
        throw new EntityNotFoundException("Station " + stationId + " not found");
    }

    List<Long> chargerIds = chargers.stream().map(Charger::getId).toList();

    List<Reservation> reservations = reservationRepository
            .findByChargerIdInAndStartTimeBetween(chargerIds, from, to);

    // Potência por carregador
    Map<Long, Double> powerMap = chargers.stream()
            .collect(Collectors.toMap(Charger::getId, Charger::getPower));

    // Agrupar por dia
    Map<LocalDate, Double> energyPerDay = new HashMap<>();

    for (Reservation r : reservations) {
        LocalDateTime start = r.getStartTime().isBefore(from) ? from : r.getStartTime();
        LocalDateTime end = r.getEndTime().isAfter(to) ? to : r.getEndTime();
        double hours = Duration.between(start, end).toMinutes() / 60.0;
        Double chargerPower = powerMap.get(r.getChargerId());
        if (chargerPower != null) {
            double energy = hours * chargerPower;
            LocalDate date = start.toLocalDate();
            energyPerDay.put(date, energyPerDay.getOrDefault(date, 0.0) + energy);
        }
    }

    return energyPerDay.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(e -> new DailyEnergyDTO(e.getKey(), e.getValue()))
            .toList();
    }
}


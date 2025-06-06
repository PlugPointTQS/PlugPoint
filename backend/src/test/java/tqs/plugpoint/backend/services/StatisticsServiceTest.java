package tqs.plugpoint.backend.services;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import tqs.plugpoint.backend.dto.DailyEnergyDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.repositories.ChargerRepository;
import tqs.plugpoint.backend.repositories.ReservationRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class StatisticsServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ChargerRepository chargerRepository;

    @InjectMocks
    private StatisticsService statisticsService;

    private Charger charger;
    private Reservation reservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        charger = Charger.builder()
                .id(1L)
                .stationId(1L)
                .power(22.0)
                .build();

        reservation = Reservation.builder()
                .chargerId(1L)
                .startTime(LocalDateTime.of(2024, 6, 1, 10, 0))
                .endTime(LocalDateTime.of(2024, 6, 1, 12, 0))
                .build();
    }

    @Test
    void getStats_shouldReturnCorrectValues() {
        LocalDateTime from = LocalDateTime.of(2024, 6, 1, 9, 0);
        LocalDateTime to = LocalDateTime.of(2024, 6, 1, 13, 0);

        when(chargerRepository.findByStationId(1L)).thenReturn(List.of(charger));
        when(reservationRepository.findByChargerIdInAndStartTimeBetween(
                anyList(), eq(from), eq(to))).thenReturn(List.of(reservation));

        StationStatsDTO stats = statisticsService.getStats(1L, from, to);

        assertEquals(44.0, stats.energyDeliveredKWh());
        assertEquals(1, stats.sessions());
        assertTrue(stats.averageOccupancyPct() > 0);
    }

    @Test
    void getStats_shouldThrowIfNoChargers() {
        when(chargerRepository.findByStationId(1L)).thenReturn(List.of());

        assertThrows(EntityNotFoundException.class,
                () -> statisticsService.getStats(1L, LocalDateTime.now(), LocalDateTime.now().plusHours(1)));
    }

    @Test
    void getDailyEnergyByStation_shouldReturnGroupedByDay() {
        LocalDateTime from = LocalDateTime.of(2024, 6, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2024, 6, 2, 0, 0);

        when(chargerRepository.findByStationId(1L)).thenReturn(List.of(charger));
        when(reservationRepository.findByChargerIdInAndStartTimeBetween(anyList(), eq(from), eq(to)))
                .thenReturn(List.of(reservation));

        List<DailyEnergyDTO> result = statisticsService.getDailyEnergyByStation(1L, from, to);

        assertEquals(1, result.size());
        assertEquals(LocalDate.of(2024, 6, 1), result.get(0).getDate());
        assertEquals(44.0, result.get(0).getEnergyKWh());
    }

    @Test
    void getDailyEnergyByStation_shouldThrowIfNoChargers() {
        when(chargerRepository.findByStationId(1L)).thenReturn(List.of());

        assertThrows(EntityNotFoundException.class, () -> statisticsService.getDailyEnergyByStation(1L,
                LocalDateTime.now(), LocalDateTime.now().plusDays(1)));
    }
}

package tqs.plugpoint.backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import tqs.plugpoint.backend.dto.StationAvailabilityDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.entities.Charger.ChargerStatus;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.repositories.ChargerRepository;
import tqs.plugpoint.backend.repositories.ChargingStationRepository;
import tqs.plugpoint.backend.repositories.ReservationRepository;

import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChargingStationServiceTest {

    @Mock
    private ChargingStationRepository stationRepository;

    @Mock
    private ChargerRepository chargerRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ChargingStationService stationService;

    private ChargingStation station;
    private Charger charger;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        station = ChargingStation.builder()
                .id(1L)
                .name("Station A")
                .latitude(38.7369)
                .longitude(-9.1427)
                .build();

        charger = Charger.builder()
                .id(1L)
                .stationId(1L)
                .power(22.0)
                .status(ChargerStatus.AVAILABLE)
                .build();
    }

    @Test
    void getAllStations_shouldReturnAllStations() {
        when(stationRepository.findAll()).thenReturn(List.of(station));
        List<ChargingStation> result = stationService.getAllStations();
        assertEquals(1, result.size());
        verify(stationRepository).findAll();
    }

    @Test
    void getById_shouldReturnStationIfExists() {
        when(stationRepository.findById(1L)).thenReturn(Optional.of(station));
        Optional<ChargingStation> result = stationService.getById(1L);
        assertTrue(result.isPresent());
        assertEquals("Station A", result.get().getName());
    }

    @Test
    void createStation_shouldSetCreatedAtAndSave() {
        when(stationRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        ChargingStation created = stationService.createStation(station);
        assertNotNull(created.getCreatedAt());
        verify(stationRepository).save(station);
    }

    @Test
    void deleteStation_shouldCallDeleteById() {
        stationService.deleteStation(1L);
        verify(stationRepository).deleteById(1L);
    }

    @Test
    void nameExists_shouldReturnTrueIfExists() {
        when(stationRepository.existsByName("Station A")).thenReturn(true);
        assertTrue(stationService.nameExists("Station A"));
    }

    @Test
    void getStationsByOperator_shouldReturnList() {
        when(stationRepository.findByOperatorId(1L)).thenReturn(List.of(station));
        List<ChargingStation> result = stationService.getStationsByOperator(1L);
        assertEquals(1, result.size());
    }

    @Test
    void getStationsNearby_shouldReturnFilteredByDistance() {
        ChargingStation near = ChargingStation.builder()
                .id(2L).latitude(38.737).longitude(-9.14).build();
        ChargingStation far = ChargingStation.builder()
                .id(3L).latitude(41.0).longitude(-8.0).build();

        when(stationRepository.findAll()).thenReturn(List.of(near, far));

        List<ChargingStation> result = stationService.getStationsNearby(38.7369, -9.1427, 10);
        assertEquals(1, result.size());
        assertEquals(2L, result.get(0).getId());
    }

    @Test
    void getStationAvailability_shouldReturnDTOs() {
        when(stationRepository.findAll()).thenReturn(List.of(station));
        when(chargerRepository.countByStationIdAndStatus(1L, ChargerStatus.AVAILABLE)).thenReturn(3L);

        List<StationAvailabilityDTO> result = stationService.getStationAvailability();

        assertEquals(1, result.size());
        assertEquals(3L, result.get(0).getAvailableChargers());
    }

    @Test
    void getStationStats_shouldReturnStats() {
        Reservation res = Reservation.builder()
                .chargerId(1L)
                .startTime(LocalDateTime.of(2024, 1, 1, 12, 0))
                .endTime(LocalDateTime.of(2024, 1, 1, 14, 0))
                .build();

        when(chargerRepository.findByStationId(1L)).thenReturn(List.of(charger));
        when(reservationRepository.findByChargerIdInAndStartTimeBetween(anyList(), any(), any()))
                .thenReturn(List.of(res));

        LocalDateTime from = LocalDateTime.of(2024, 1, 1, 11, 0);
        LocalDateTime to = LocalDateTime.of(2024, 1, 1, 15, 0);

        StationStatsDTO stats = stationService.getStationStats(1L, from, to);

        assertEquals(44.0, stats.energyDeliveredKWh());
        assertEquals(1, stats.sessions());
        assertTrue(stats.averageOccupancyPct() > 0);
    }

    @Test
    void getStationStats_shouldThrowIfNoChargers() {
        when(chargerRepository.findByStationId(1L)).thenReturn(List.of());
        assertThrows(EntityNotFoundException.class,
                () -> stationService.getStationStats(1L, LocalDateTime.now(), LocalDateTime.now().plusHours(1)));
    }
}

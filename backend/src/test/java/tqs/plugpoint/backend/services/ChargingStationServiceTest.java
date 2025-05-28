package tqs.plugpoint.backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.entities.ChargingStation.Status;
import tqs.plugpoint.backend.repositories.ChargingStationRepository;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class ChargingStationServiceTest {

    @Mock
    private ChargingStationRepository repository;

    @InjectMocks
    private ChargingStationService service;

    private ChargingStation aveiroStation;
    private ChargingStation lisboaStation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        aveiroStation = ChargingStation.builder()
                .id(1L)
                .name("Aveiro EV")
                .latitude(40.6405)
                .longitude(-8.6538)
                .address("Aveiro")
                .operatorId(1L)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        lisboaStation = ChargingStation.builder()
                .id(2L)
                .name("Lisboa EV")
                .latitude(38.7169)
                .longitude(-9.1399)
                .address("Lisboa")
                .operatorId(2L)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testGetStationsNearby_withinRadius() {
        when(repository.findAll()).thenReturn(List.of(aveiroStation, lisboaStation));

        double userLat = 40.64;
        double userLng = -8.65;
        double radiusKm = 5.0;

        List<ChargingStation> nearby = service.getStationsNearby(userLat, userLng, radiusKm);

        assertThat(nearby).contains(aveiroStation).doesNotContain(lisboaStation);
    }

    @Test
    void testGetStationsNearby_noStationsFound() {
        when(repository.findAll()).thenReturn(List.of(aveiroStation, lisboaStation));

        double userLat = 41.0;
        double userLng = -8.0;
        double radiusKm = 1.0;

        List<ChargingStation> nearby = service.getStationsNearby(userLat, userLng, radiusKm);

        assertThat(nearby).isEmpty();
    }
}

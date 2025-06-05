package tqs.plugpoint.backend.controllers;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import tqs.plugpoint.backend.dto.StationAvailabilityDTO;
import tqs.plugpoint.backend.dto.StationStatsDTO;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.services.ChargingStationService;

import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChargingStationController.class)
class ChargingStationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChargingStationService service;

    private ChargingStation station;

    @BeforeEach
    void setUp() {
        station = ChargingStation.builder()
                .id(1L)
                .name("Test Station")
                .latitude(40.0)
                .longitude(-8.0)
                .build();
    }

    @Test
    void getAllStations_shouldReturnList() throws Exception {
        Mockito.when(service.getAllStations()).thenReturn(List.of(station));

        mockMvc.perform(get("/api/stations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Station"));
    }

    @Test
    void getStationById_found() throws Exception {
        Mockito.when(service.getById(1L)).thenReturn(Optional.of(station));

        mockMvc.perform(get("/api/stations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Station"));
    }

    @Test
    void getStationById_notFound() throws Exception {
        Mockito.when(service.getById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/stations/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void createStation_shouldCreateIfNameNotExists() throws Exception {
        Mockito.when(service.nameExists(anyString())).thenReturn(false);
        Mockito.when(service.createStation(any())).thenReturn(station);

        mockMvc.perform(post("/api/stations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                            {
                                "name": "Test Station",
                                "latitude": 40.0,
                                "longitude": -8.0
                            }
                        """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test Station"));
    }

    @Test
    void createStation_shouldRejectIfNameExists() throws Exception {
        Mockito.when(service.nameExists(anyString())).thenReturn(true);

        mockMvc.perform(post("/api/stations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                            {
                                "name": "Duplicate Station"
                            }
                        """))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(containsString("already exists")));
    }

    @Test
    void deleteStation_shouldReturnNoContent() throws Exception {
        mockMvc.perform(delete("/api/stations/1"))
                .andExpect(status().isNoContent());
        Mockito.verify(service).deleteStation(1L);
    }

    @Test
    void getByOperator_shouldReturnStations() throws Exception {
        Mockito.when(service.getStationsByOperator(1L)).thenReturn(List.of(station));

        mockMvc.perform(get("/api/stations/operator/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Station"));
    }

    @Test
    void getNearbyStations_shouldReturnFilteredStations() throws Exception {
        Mockito.when(service.getStationsNearby(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(station));

        mockMvc.perform(get("/api/stations/nearby")
                .param("lat", "40.0")
                .param("lng", "-8.0")
                .param("radiusKm", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Test Station"));
    }

    @Test
    void getStationAvailability_shouldReturnList() throws Exception {
        Mockito.when(service.getStationAvailability())
                .thenReturn(List.of(new StationAvailabilityDTO(1L, "Station A", 3)));

        mockMvc.perform(get("/api/stations/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].availableChargers").value(3));
    }

    @Test
    void stats_shouldReturnStationStats() throws Exception {
        Mockito.when(service.getStationStats(anyLong(), any(), any()))
                .thenReturn(new StationStatsDTO(100.0, 2, 50.0));

        mockMvc.perform(get("/api/stations/admin/stations/1/stats")
                .param("from", "2025-06-01T00:00:00")
                .param("to", "2025-06-01T23:59:59"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sessions").value(2));
    }

    @Test
    void exportCsv_shouldReturnCsvFile() throws Exception {
        Mockito.when(service.getStationStats(anyLong(), any(), any()))
                .thenReturn(new StationStatsDTO(123.0, 4, 80.0));

        mockMvc.perform(get("/api/stations/admin/stations/1/stats/export")
                .param("from", "2025-06-01T00:00:00")
                .param("to", "2025-06-01T23:59:59")
                .accept("text/csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", containsString("station-1-stats.csv")))
                .andExpect(content().string(containsString("energyDeliveredKWh,sessions,averageOccupancyPct")))
                .andExpect(content().string(containsString("123.00,4,80.00")));
    }
}

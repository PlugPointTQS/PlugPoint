package tqs.plugpoint.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.entities.ChargingStation.Status;
import tqs.plugpoint.backend.services.ChargingStationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChargingStationController.class)
class ChargingStationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChargingStationService service;

    @Autowired
    private ObjectMapper objectMapper;

    private ChargingStation sampleStation() {
        return ChargingStation.builder()
                .id(1L)
                .name("Aveiro EV")
                .latitude(40.6405)
                .longitude(-8.6538)
                .address("Aveiro")
                .operatorId(1L)
                .status(Status.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testGetAllStations() throws Exception {
        Mockito.when(service.getAllStations()).thenReturn(List.of(sampleStation()));

        mockMvc.perform(get("/api/stations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Aveiro EV"));
    }

    @Test
    void testGetStationById_found() throws Exception {
        Mockito.when(service.getById(1L)).thenReturn(Optional.of(sampleStation()));

        mockMvc.perform(get("/api/stations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void testGetStationById_notFound() throws Exception {
        Mockito.when(service.getById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/stations/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateStation_success() throws Exception {
        ChargingStation station = sampleStation();
        Mockito.when(service.nameExists(station.getName())).thenReturn(false);
        Mockito.when(service.createStation(any())).thenReturn(station);

        mockMvc.perform(post("/api/stations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(station)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Aveiro EV"));
    }

    @Test
    void testCreateStation_duplicateName() throws Exception {
        ChargingStation station = sampleStation();
        Mockito.when(service.nameExists(station.getName())).thenReturn(true);

        mockMvc.perform(post("/api/stations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(station)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Station name already exists."));
    }

    @Test
    void testGetByOperator() throws Exception {
        Mockito.when(service.getStationsByOperator(1L)).thenReturn(List.of(sampleStation()));

        mockMvc.perform(get("/api/stations/operator/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].operatorId").value(1));
    }

    @Test
    void testDeleteStation() throws Exception {
        Mockito.doNothing().when(service).deleteStation(1L);

        mockMvc.perform(delete("/api/stations/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void testGetNearbyStations() throws Exception {
        ChargingStation station = sampleStation();
        Mockito.when(service.getStationsNearby(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of(station));

        mockMvc.perform(get("/api/stations/nearby")
                        .param("lat", "40.64")
                        .param("lng", "-8.65")
                        .param("radiusKm", "5.0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Aveiro EV"))
                .andExpect(jsonPath("$[0].latitude").value(40.6405));
    }

    @Test
    void testGetNearbyStations_emptyResult() throws Exception {
        Mockito.when(service.getStationsNearby(anyDouble(), anyDouble(), anyDouble()))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/stations/nearby")
                        .param("lat", "0.0")
                        .param("lng", "0.0")
                        .param("radiusKm", "1.0"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }
}

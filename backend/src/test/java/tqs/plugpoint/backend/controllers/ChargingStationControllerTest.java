package tqs.plugpoint.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.cucumber.java.bs.A;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tqs.plugpoint.backend.entities.ChargingStation;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.services.ChargerService;
import tqs.plugpoint.backend.services.ChargingStationService;
import java.util.NoSuchElementException;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import app.getxray.xray.junit.customjunitxml.annotations.XrayTest;
import app.getxray.xray.junit.customjunitxml.annotations.Requirement;

@WebMvcTest(ChargingStationController.class)
public class ChargingStationControllerTest{
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private ChargerService chargerService;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private ChargingStationService chargingStationService;
    private ChargingStation mockChargingStation() {
        return ChargingStation.builder()
                .id(1L)
                .name("Test Station")
                .address("123 Test St")
                .latitude(40.7128)
                .longitude(-74.0060)
                .build();
    }
    // teste the creation of a charging station
    @Test
    @XrayTest(key = "PP-42")
    @Requirement("PP-23")
    void testCreateChargingStation() throws Exception {
        ChargingStation station = ChargingStation.builder()
                .id(1L)
                .name("Estação Teste")
                .address("Porto")
                .latitude(41.1579)
                .longitude(-8.6291)
                .build();

        when(chargingStationService.createStation(any())).thenReturn(station);

        mockMvc.perform(post("/api/stations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(station)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Estação Teste"))
                .andExpect(jsonPath("$.address").value("Porto"));
    }

}
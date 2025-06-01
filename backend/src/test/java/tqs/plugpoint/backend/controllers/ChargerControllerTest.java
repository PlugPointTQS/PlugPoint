package tqs.plugpoint.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.services.ChargerService;
import java.util.NoSuchElementException;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;



@WebMvcTest(ChargerController.class)
public class ChargerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ChargerService chargerService;

    @Autowired
    private ObjectMapper objectMapper;

    private Charger mockCharger() {
        return Charger.builder()
                .id(1L)
                .stationId(2L)
                .power(22.0)
                .status(Charger.ChargerStatus.AVAILABLE)
                .type(Charger.ChargerType.TYPE2)
                .build();
    }

    @Test
    void testUpdateCharger_success() throws Exception {
        Charger updated = mockCharger();
        updated.setPower(50.0);

        Mockito.when(chargerService.updateCharger(eq(1L), any())).thenReturn(updated);

        mockMvc.perform(put("/api/chargers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.power").value(50.0));
    }

    @Test
    void testUpdateCharger_notFound() throws Exception {
        Charger updated = mockCharger();

        Mockito.when(chargerService.updateCharger(eq(99L), any()))
                .thenThrow(new NoSuchElementException("Charger not found"));

        mockMvc.perform(put("/api/chargers/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isNotFound());
    }
}


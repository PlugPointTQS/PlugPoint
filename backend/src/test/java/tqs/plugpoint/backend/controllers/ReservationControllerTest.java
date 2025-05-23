package tqs.plugpoint.backend.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.entities.Reservation.Status;
import tqs.plugpoint.backend.services.ReservationService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReservationController.class)
class ReservationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ReservationService reservationService;

    @Autowired
    private ObjectMapper objectMapper;

    private Reservation sampleReservation() {
        return Reservation.builder()
                .id(1L)
                .userId(5L)
                .chargerId(7L)
                .startTime(LocalDateTime.of(2025, 5, 25, 10, 0))
                .endTime(LocalDateTime.of(2025, 5, 25, 11, 0))
                .status(Status.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateReservation() throws Exception {
        Reservation reservation = sampleReservation();
        Mockito.when(reservationService.createReservation(any())).thenReturn(reservation);

        mockMvc.perform(post("/api/reservations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reservation)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(reservation.getId()))
                .andExpect(jsonPath("$.userId").value(reservation.getUserId()));
    }

    @Test
    void testGetReservationById() throws Exception {
        Reservation reservation = sampleReservation();
        Mockito.when(reservationService.getReservationById(1L)).thenReturn(Optional.of(reservation));

        mockMvc.perform(get("/api/reservations/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void testGetReservationById_NotFound() throws Exception {
        Mockito.when(reservationService.getReservationById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/reservations/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetReservationsByUserId() throws Exception {
        Reservation reservation = sampleReservation();
        Mockito.when(reservationService.getReservationsByUserId(5L)).thenReturn(List.of(reservation));

        mockMvc.perform(get("/api/reservations/user/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(5));
    }

    @Test
    void testUpdateReservationStatus() throws Exception {
        Reservation reservation = sampleReservation();
        reservation.setStatus(Status.CONFIRMED);

        Mockito.when(reservationService.updateReservationStatus(1L, Status.CONFIRMED))
                .thenReturn(reservation);

        mockMvc.perform(patch("/api/reservations/1/status")
                        .param("status", "CONFIRMED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    void testDeleteReservation() throws Exception {
        mockMvc.perform(delete("/api/reservations/1"))
                .andExpect(status().isNoContent());

        Mockito.verify(reservationService).deleteReservation(1L);
    }
}

package tqs.plugpoint.backend.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import tqs.plugpoint.backend.entities.Reservation;
import tqs.plugpoint.backend.entities.Reservation.Status;
import tqs.plugpoint.backend.repositories.ReservationRepository;

class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private ReservationService reservationService;

    private Reservation mockReservation;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        mockReservation = Reservation.builder()
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
    void testGetAllReservations() {
        when(reservationRepository.findAll()).thenReturn(List.of(mockReservation));

        List<Reservation> result = reservationService.getAllReservations();

        assertThat(result).hasSize(1).contains(mockReservation);
        verify(reservationRepository, times(1)).findAll();
    }

    @Test
    void testGetReservationById() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(mockReservation));

        Optional<Reservation> result = reservationService.getReservationById(1L);

        assertThat(result).isPresent().contains(mockReservation);
    }

    @Test
    void testGetReservationsByUserId() {
        when(reservationRepository.findByUserId(5L)).thenReturn(List.of(mockReservation));

        List<Reservation> result = reservationService.getReservationsByUserId(5L);

        assertThat(result).hasSize(1).contains(mockReservation);
    }

    @Test
    void testGetReservationsByChargerId() {
        when(reservationRepository.findByChargerId(7L)).thenReturn(List.of(mockReservation));

        List<Reservation> result = reservationService.getReservationsByChargerId(7L);

        assertThat(result).hasSize(1).contains(mockReservation);
    }

    @Test
    void testCreateReservationSetsDefaultsAndSaves() {
        Reservation newReservation = Reservation.builder()
                .userId(10L)
                .chargerId(20L)
                .startTime(LocalDateTime.of(2025, 5, 30, 8, 0))
                .endTime(LocalDateTime.of(2025, 5, 30, 9, 0))
                .build();

        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Reservation saved = reservationService.createReservation(newReservation);

        assertThat(saved.getStatus()).isEqualTo(Status.CONFIRMED);
        assertThat(saved.getCreatedAt()).isNotNull();
        verify(reservationRepository).save(saved);
    }

    @Test
    void testUpdateReservationStatusSuccess() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(mockReservation));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Reservation updated = reservationService.updateReservationStatus(1L, Status.CONFIRMED, mockReservation.getUserId());

        assertThat(updated.getStatus()).isEqualTo(Status.CONFIRMED);
        verify(reservationRepository).save(mockReservation);
    }
    
    
    @Test
    void testUpdateReservationStatusThrowsIfNotFound() {
        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() ->
                reservationService.updateReservationStatus(999L, Status.CANCELLED, mockReservation.getUserId()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Reservation not found");

        verify(reservationRepository, never()).save(any());
    }

    @Test
    void testCancelReservationSuccessfully() {
        // Simula a reserva existente
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(mockReservation));
        when(reservationRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // Chama o método de atualização de status com CANCELLED
        Reservation cancelled = reservationService.updateReservationStatus(1L, Status.CANCELLED, mockReservation.getUserId());

        // Verifica se o status foi alterado para CANCELLED
        assertThat(cancelled.getStatus()).isEqualTo(Status.CANCELLED);

        // Verifica se o save foi chamado com a reserva atualizada
        verify(reservationRepository).save(mockReservation);
    }

    @Test
    void testDeleteReservation() {
        doNothing().when(reservationRepository).deleteById(1L);

        reservationService.deleteReservation(1L);

        verify(reservationRepository).deleteById(1L);
    }
}

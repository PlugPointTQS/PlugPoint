package tqs.plugpoint.backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.repositories.ChargerRepository;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ChargerServiceTest {

    @Mock
    private ChargerRepository chargerRepository;

    @InjectMocks
    private ChargerService chargerService;

    private Charger charger;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        charger = Charger.builder()
                .id(1L)
                .stationId(1L)
                .type(Charger.ChargerType.AC)
                .power(22.0)
                .status(Charger.ChargerStatus.AVAILABLE)
                .build();
    }

    @Test
    void testGetAllChargers() {
        when(chargerRepository.findAll()).thenReturn(List.of(charger));

        List<Charger> result = chargerService.getAllChargers();

        assertEquals(1, result.size());
        verify(chargerRepository, times(1)).findAll();
    }

    @Test
    void testGetChargerById_Found() {
        when(chargerRepository.findById(1L)).thenReturn(Optional.of(charger));

        Optional<Charger> result = chargerService.getChargerById(1L);

        assertTrue(result.isPresent());
        assertEquals(Charger.ChargerType.AC ,result.get().getType());
    }

    @Test
    void testGetChargersByStationId() {
        when(chargerRepository.findByStationId(1L)).thenReturn(List.of(charger));

        List<Charger> result = chargerService.getChargersByStationId(1L);

        assertEquals(1, result.size());
        verify(chargerRepository).findByStationId(1L);
    }

    @Test
    void testCreateCharger() {
        when(chargerRepository.save(charger)).thenReturn(charger);

        Charger result = chargerService.createCharger(charger);

        assertNotNull(result);
        assertEquals(Charger.ChargerType.AC, result.getType());
    }

    @Test
    void testDeleteCharger() {
        doNothing().when(chargerRepository).deleteById(1L);

        chargerService.deleteCharger(1L);

        verify(chargerRepository).deleteById(1L);
    }

    @Test
    void testUpdateCharger_Success() {
        Charger updated = Charger.builder()
                .type(Charger.ChargerType.DC)
                .power(50.0)
                .status(Charger.ChargerStatus.AVAILABLE)
                .build();

        when(chargerRepository.findById(1L)).thenReturn(Optional.of(charger));
        when(chargerRepository.save(any(Charger.class))).thenAnswer(i -> i.getArgument(0));

        Charger result = chargerService.updateCharger(1L, updated);

        assertEquals(Charger.ChargerType.DC , result.getType());
        assertEquals(50.0, result.getPower());
        assertEquals(Charger.ChargerStatus.AVAILABLE, result.getStatus());
    }

    @Test
    void testUpdateCharger_NotFound() {
        when(chargerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> {
            chargerService.updateCharger(1L, charger);
        });
    }
}

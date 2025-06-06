package tqs.plugpoint.backend.repositories;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.entities.Charger.ChargerStatus;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:postgresql://deti-tqs-13.ua.pt:5555/plugpoint",
    "spring.datasource.username=postgres",
    "spring.datasource.password=postgres"
})
class ChargerRepositoryIntegrationDockerTest {

    @Autowired
    private ChargerRepository chargerRepository;

    @BeforeEach
    void setUp() {
        // Limpar dados antes do teste
        chargerRepository.deleteAll();

        // Preparar dados
        Charger charger1 = Charger.builder()
                .stationId(1L)
                .status(ChargerStatus.AVAILABLE)
                .power(50.0)
                .type(Charger.ChargerType.TYPE2)
                .build();

        Charger charger2 = Charger.builder()
                .stationId(1L)
                .status(ChargerStatus.AVAILABLE)
                .power(50.0)
                .type(Charger.ChargerType.TYPE2)
                .build();

        Charger charger3 = Charger.builder()
                .stationId(1L)
                .status(ChargerStatus.IN_USE)
                .power(50.0)
                .type(Charger.ChargerType.TYPE2)
                .build();

        chargerRepository.save(charger1);
        chargerRepository.save(charger2);
        chargerRepository.save(charger3);
    }

    @AfterEach
    void cleanUp() {
        chargerRepository.deleteAll();
    }

    @Test
    void testCountByStationIdAndStatus() {
        long count = chargerRepository.countByStationIdAndStatus(1L, ChargerStatus.AVAILABLE);
        assertThat(count).isEqualTo(2L);
    }
}

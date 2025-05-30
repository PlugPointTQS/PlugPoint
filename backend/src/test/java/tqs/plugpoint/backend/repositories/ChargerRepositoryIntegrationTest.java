package tqs.plugpoint.backend.repositories;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tqs.plugpoint.backend.entities.Charger;
import tqs.plugpoint.backend.entities.Charger.ChargerStatus;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataJpaTest
class ChargerRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("plugpoint")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private ChargerRepository chargerRepository;

    @BeforeAll
    static void start() {
        postgres.start();
    }

    @AfterAll
    static void stop() {
        postgres.stop();
    }

    @Test
    void testCountByStationIdAndStatus() {
        // Criar e salvar carregadores com diferentes status
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

        // Contar carregadores disponíveis
        long count = chargerRepository.countByStationIdAndStatus(1L, ChargerStatus.AVAILABLE);

        // Verificar resultado
        assertThat(count).isEqualTo(2L);
    }
}

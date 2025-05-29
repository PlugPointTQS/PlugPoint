package tqs.plugpoint.backend.config;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import tqs.plugpoint.backend.entities.*;
import tqs.plugpoint.backend.repositories.*;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            // Create Driver
            User driver = User.builder()
                    .name("Driver1")
                    .password("driver123")
                    .role(User.Role.DRIVER)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(driver);

            // Create Operator
            User operator = User.builder()
                    .name("Operator1")
                    .password("operator123")
                    .role(User.Role.OPERATOR)
                    .createdAt(LocalDateTime.now())
                    .build();
            userRepository.save(operator);

            // Create Stations
            List<ChargingStation> realStations = List.of(
                    ChargingStation.builder()
                            .name("MOBI.E - Aveiro - Fórum Aveiro")
                            .address("Rua Batalhão Caçadores 10, Aveiro")
                            .latitude(40.6405).longitude(-8.6538)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Beja - Jardim Público")
                            .address("Rua Frei Amador Arrais, Beja")
                            .latitude(38.0151).longitude(-7.8650)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Braga - Altice Forum")
                            .address("Av. Dr. Francisco Pires Gonçalves, Braga")
                            .latitude(41.5473).longitude(-8.4265)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Bragança - Estação CP")
                            .address("Av. das Forças Armadas, Bragança")
                            .latitude(41.8062).longitude(-6.7572)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Castelo Branco - Piscinas")
                            .address("Av. Pedro Álvares Cabral, Castelo Branco")
                            .latitude(39.8225).longitude(-7.4950)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Coimbra - Av. Fernão de Magalhães")
                            .address("Av. Fernão de Magalhães, Coimbra")
                            .latitude(40.2101).longitude(-8.4281)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Évora - Parque Industrial")
                            .address("Rua Circular Norte, Évora")
                            .latitude(38.5712).longitude(-7.9135)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Faro - Largo da Estação")
                            .address("Largo da Estação, Faro")
                            .latitude(37.0186).longitude(-7.9309)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Guarda - Av. Bombeiros Voluntários")
                            .address("Av. Bombeiros Voluntários, Guarda")
                            .latitude(40.5373).longitude(-7.2683)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Leiria - Mercado Municipal")
                            .address("Rua Capitão Mouzinho de Albuquerque, Leiria")
                            .latitude(39.7483).longitude(-8.8043)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Lisboa - EMEL Av. Liberdade")
                            .address("Av. da Liberdade 110, Lisboa")
                            .latitude(38.7169).longitude(-9.1399)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Portalegre - Praça do Município")
                            .address("Praça do Município, Portalegre")
                            .latitude(39.2938).longitude(-7.4307)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Porto - Rua de Camões")
                            .address("Rua de Camões 484, Porto")
                            .latitude(41.1575).longitude(-8.6090)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Santarém - WShopping")
                            .address("Av. Dr. João Afonso Calado da Maia, Santarém")
                            .latitude(39.2323).longitude(-8.6826)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Setúbal - Praça do Brasil")
                            .address("Praça do Brasil, Setúbal")
                            .latitude(38.5235).longitude(-8.8882)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Viana do Castelo - Praça da Liberdade")
                            .address("Praça da Liberdade, Viana do Castelo")
                            .latitude(41.6932).longitude(-8.8301)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Vila Real - UTAD")
                            .address("Av. Almeida Lucena, Vila Real")
                            .latitude(41.2875).longitude(-7.7391)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build(),

                    ChargingStation.builder()
                            .name("MOBI.E - Viseu - Av. Emídio Navarro")
                            .address("Av. Emídio Navarro, Viseu")
                            .latitude(40.6566).longitude(-7.9137)
                            .operatorId(operator.getId()).status(ChargingStation.Status.ACTIVE)
                            .createdAt(LocalDateTime.now()).build());

            stationRepository.saveAll(realStations);

            // Create Chargers for each station
            for (ChargingStation s : realStations) {
                Charger c1 = Charger.builder()
                        .stationId(s.getId())
                        .power(5)
                        .type(Charger.ChargerType.AC)
                        .status(Charger.ChargerStatus.AVAILABLE)
                        .build();

                Charger c2 = Charger.builder()
                        .stationId(s.getId())
                        .power(200)
                        .type(Charger.ChargerType.DC)
                        .status(Charger.ChargerStatus.AVAILABLE)
                        .build();
                Charger c3 = Charger.builder()
                        .stationId(s.getId())
                        .power(50)
                        .type(Charger.ChargerType.TYPE2)
                        .status(Charger.ChargerStatus.AVAILABLE)
                        .build();
                Charger c4 = Charger.builder()
                        .stationId(s.getId())
                        .power(150)
                        .type(Charger.ChargerType.CHADEMO)
                        .status(Charger.ChargerStatus.AVAILABLE)
                        .build();
                chargerRepository.saveAll(List.of(c1, c2,c3,c4));
            }

            System.out.println("✅ Dados iniciais carregados.");
        }
    }
}
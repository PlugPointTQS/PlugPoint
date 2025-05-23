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
            ChargingStation s1 = ChargingStation.builder()
                    .name("Station A")
                    .address("Rua A, Lisboa")
                    .latitude(38.736946)
                    .longitude(-9.142685)
                    .operatorId(operator.getId())
                    .status(ChargingStation.Status.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .build();

            ChargingStation s2 = ChargingStation.builder()
                    .name("Station B")
                    .address("Rua B, Porto")
                    .latitude(41.14961)
                    .longitude(-8.61099)
                    .operatorId(operator.getId())
                    .status(ChargingStation.Status.ACTIVE)
                    .createdAt(LocalDateTime.now())
                    .build();

            stationRepository.saveAll(List.of(s1, s2));

            // Create Chargers for each station
            for (ChargingStation s : List.of(s1, s2)) {
                Charger c1 = Charger.builder()
                        .stationId(s.getId())
                        .mode(Charger.ChargingMode.FAST)
                        .status(Charger.ChargerStatus.AVAILABLE)
                        .build();

                Charger c2 = Charger.builder()
                        .stationId(s.getId())
                        .mode(Charger.ChargingMode.SLOW)
                        .status(Charger.ChargerStatus.AVAILABLE)
                        .build();

                chargerRepository.saveAll(List.of(c1, c2));
            }

            System.out.println("✅ Dados iniciais carregados.");
        }
    }
}

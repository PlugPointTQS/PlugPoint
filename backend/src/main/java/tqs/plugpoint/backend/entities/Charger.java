package tqs.plugpoint.backend.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Charger {
    @Id
    @GeneratedValue
    private Long id;

    private Long stationId; 

    @Enumerated(EnumType.STRING)
    private ChargingMode mode; // SLOW, MEDIUM, FAST, ULTRA_FAST

    @Enumerated(EnumType.STRING)
    private ChargerStatus status; // AVAILABLE, IN_USE, MAINTENANCE
    
    public enum ChargingMode {
        SLOW, // < 7.4 kW
        MEDIUM, // 7.4 - 22 kW
        FAST, // > 22 - 150 kW
        ULTRA_FAST // ≥ 150 kW
    }
    
    public enum ChargerStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE
    }

}

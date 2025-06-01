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
    private double power;


    
    @Enumerated(EnumType.STRING)
    private ChargerStatus status; // AVAILABLE, IN_USE, MAINTENANCE
    @Enumerated(EnumType.STRING)
    private ChargerType type; // TYPE2, CHADEMO, CCS, etc.


    
    public enum ChargerStatus {
        AVAILABLE,
        IN_USE,
        MAINTENANCE
    }
    
    public enum ChargerType {
        TYPE2,
        CHADEMO,
        CCS,
        TESLA,
        AC,
        DC
    }

    public void setType(ChargerType type) {
        this.type = type;
    }

    public void setPower(double power) {
        this.power = power;
    }

    public void setStatus(ChargerStatus status) {
        this.status = status;
    }

    public ChargerType getType() {
        return type;
    }

    public double getPower() {
        return power;
    }

    public ChargerStatus getStatus() {
        return status;
    }


}

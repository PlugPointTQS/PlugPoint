package tqs.plugpoint.backend.entities;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChargingStation {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String address;

    private double latitude;
    private double longitude;

    private Long operatorId; 

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    public enum Status {
        ACTIVE, INACTIVE, MAINTENANCE
    }
}

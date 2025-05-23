
package tqs.plugpoint.backend.entities;
import  lombok.AllArgsConstructor;
import  lombok.Builder;
import  lombok.Data;
import  lombok.NoArgsConstructor;
import  jakarta.persistence.*;
import  java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    @Id
    @GeneratedValue
    private Long id;

    private Long userId; 

    private Long chargerId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime createdAt;

    public enum Status {
        PENDING, CONFIRMED, CANCELLED
    }
}

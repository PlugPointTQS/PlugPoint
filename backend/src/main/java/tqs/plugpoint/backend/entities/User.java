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
@Table(name = "users")
@AllArgsConstructor
@Table(name = "users")

@Builder
public class User {
    @Id
    @GeneratedValue
    private Long id;

    private String name;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private LocalDateTime createdAt;

    public enum Role {
        DRIVER, OPERATOR, ADMIN
    }
}

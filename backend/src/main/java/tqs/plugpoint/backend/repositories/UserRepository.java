package tqs.plugpoint.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tqs.plugpoint.backend.entities.User;


@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
}

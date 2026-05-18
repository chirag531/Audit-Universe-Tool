package com.internship.tool.repository;

import com.internship.tool.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameIgnoreCaseAndDeletedFalse(String username);

    boolean existsByUsernameIgnoreCaseAndDeletedFalse(String username);

    boolean existsByEmailIgnoreCaseAndDeletedFalse(String email);
}

package com.internship.tool;

import com.internship.tool.entity.AuditItem;
import com.internship.tool.entity.User;
import com.internship.tool.repository.AuditItemRepository;
import com.internship.tool.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final AuditItemRepository auditItemRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, AuditItemRepository auditItemRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditItemRepository = auditItemRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            userRepository.save(admin);

            User user = new User();
            user.setUsername("user");
            user.setEmail("user@example.com");
            user.setPasswordHash(passwordEncoder.encode("user123"));
            user.setRole("ROLE_USER");
            userRepository.save(user);
            log.info("Seeded default users admin and user");
        }

        long active = auditItemRepository.countByDeletedFalse();
        int target = 30;
        if (active < target) {
            String owner = userRepository.findByUsernameIgnoreCaseAndDeletedFalse("admin").map(User::getUsername).orElse("admin");
            int need = target - (int) active;
            for (int n = 0; n < need; n++) {
                int seq = (int) active + n + 1;
                AuditItem item = new AuditItem();
                item.setTitle("Seeded audit item " + seq);
                item.setPayload("Sample audit payload for seeded record " + seq + ". Controls and scope for review.");
                item.setAiSummary("Seeded summary for item " + seq);
                item.setCreatedBy(owner);
                auditItemRepository.save(item);
            }
            log.info("Seeded {} audit_items (target {} active rows)", need, target);
        }
    }
}

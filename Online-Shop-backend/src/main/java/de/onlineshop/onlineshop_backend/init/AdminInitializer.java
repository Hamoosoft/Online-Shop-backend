package de.onlineshop.onlineshop_backend.init;

import de.onlineshop.onlineshop_backend.model.Role;
import de.onlineshop.onlineshop_backend.model.User;
import de.onlineshop.onlineshop_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Bean
    public CommandLineRunner initAdmin(UserRepository userRepository,
                                       PasswordEncoder passwordEncoder) {

        return args -> {
            // Wenn kein Admin existiert → anlegen
            if (userRepository.findByEmail("admin@hsig.de").isEmpty()) {

                User admin = User.builder()
                        .email("admin@hsig.de")
                        .name("HSIG Admin")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(admin);

                System.out.println(">>> ADMIN erstellt: admin@hsig.de / admin123");
            }
        };
    }
}

package de.onlineshop.onlineshop_backend.service;

import de.onlineshop.onlineshop_backend.dto.ChangePasswordRequest;
import de.onlineshop.onlineshop_backend.dto.UpdateProfileRequest;
import de.onlineshop.onlineshop_backend.dto.UserProfileResponse;
import de.onlineshop.onlineshop_backend.model.User;
import de.onlineshop.onlineshop_backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileService(UserRepository userRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User getCurrentUser(Principal principal) {
        String email = principal.getName(); // im JWT: subject = email
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }

    public UserProfileResponse getProfile(Principal principal) {
        User user = getCurrentUser(principal);
        return UserProfileResponse.fromUser(user);
    }

    public UserProfileResponse updateProfile(Principal principal,
                                             UpdateProfileRequest request) {
        User user = getCurrentUser(principal);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        userRepository.save(user);
        return UserProfileResponse.fromUser(user);
    }

    public void changePassword(Principal principal,
                               ChangePasswordRequest request) {
        User user = getCurrentUser(principal);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Aktuelles Passwort ist falsch.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}

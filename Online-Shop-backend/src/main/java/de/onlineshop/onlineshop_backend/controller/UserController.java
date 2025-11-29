package de.onlineshop.onlineshop_backend.controller;

import de.onlineshop.onlineshop_backend.dto.ChangePasswordRequest;
import de.onlineshop.onlineshop_backend.dto.UpdateProfileRequest;
import de.onlineshop.onlineshop_backend.dto.UserProfileResponse;
import de.onlineshop.onlineshop_backend.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService userProfileService;

    public UserController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getProfile(Principal principal) {
        return ResponseEntity.ok(userProfileService.getProfile(principal));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateProfile(
            Principal principal,
            @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userProfileService.updateProfile(principal, request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<String> changePassword(
            Principal principal,
            @RequestBody ChangePasswordRequest request
    ) {
        userProfileService.changePassword(principal, request);
        return ResponseEntity.ok("Passwort erfolgreich geändert.");
    }
}

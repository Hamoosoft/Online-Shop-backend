package de.onlineshop.onlineshop_backend.controller;

import de.onlineshop.onlineshop_backend.dto.AddressRequest;
import de.onlineshop.onlineshop_backend.dto.AddressResponse;
import de.onlineshop.onlineshop_backend.service.AddressService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    private final AddressService addressService;

    public AddressController(AddressService addressService) {
        this.addressService = addressService;
    }

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getMyAddresses(Principal principal) {
        return ResponseEntity.ok(addressService.getAddressesForUser(principal));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            Principal principal,
            @RequestBody AddressRequest request
    ) {
        return ResponseEntity.ok(addressService.createAddress(principal, request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            Principal principal,
            @PathVariable Long id,
            @RequestBody AddressRequest request
    ) {
        return ResponseEntity.ok(addressService.updateAddress(principal, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            Principal principal,
            @PathVariable Long id
    ) {
        addressService.deleteAddress(principal, id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponse> setDefault(
            Principal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(addressService.setDefault(principal, id));
    }
}

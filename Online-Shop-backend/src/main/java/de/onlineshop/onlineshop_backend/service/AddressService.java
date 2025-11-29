package de.onlineshop.onlineshop_backend.service;

import de.onlineshop.onlineshop_backend.dto.AddressRequest;
import de.onlineshop.onlineshop_backend.dto.AddressResponse;
import de.onlineshop.onlineshop_backend.model.Address;
import de.onlineshop.onlineshop_backend.model.User;
import de.onlineshop.onlineshop_backend.repository.AddressRepository;
import de.onlineshop.onlineshop_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public AddressService(AddressRepository addressRepository,
                          UserRepository userRepository) {
        this.addressRepository = addressRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser(Principal principal) {
        String email = principal.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }

    public List<AddressResponse> getAddressesForUser(Principal principal) {
        User user = getCurrentUser(principal);
        return addressRepository.findByUserOrderByDefaultAddressDescCreatedAtDesc(user)
                .stream()
                .map(AddressResponse::fromEntity)
                .toList();
    }

    public AddressResponse createAddress(Principal principal, AddressRequest request) {
        User user = getCurrentUser(principal);

        Address address = new Address();
        address.setUser(user);
        copyRequestToEntity(request, address);

        if (request.isDefaultAddress()) {
            clearDefaultForUser(user);
            address.setDefaultAddress(true);
        }

        Address saved = addressRepository.save(address);
        return AddressResponse.fromEntity(saved);
    }

    public AddressResponse updateAddress(Principal principal, Long id, AddressRequest request) {
        User user = getCurrentUser(principal);

        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Adresse nicht gefunden"));

        copyRequestToEntity(request, address);

        if (request.isDefaultAddress()) {
            clearDefaultForUser(user);
            address.setDefaultAddress(true);
        }

        Address saved = addressRepository.save(address);
        return AddressResponse.fromEntity(saved);
    }

    public void deleteAddress(Principal principal, Long id) {
        User user = getCurrentUser(principal);

        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Adresse nicht gefunden"));

        addressRepository.delete(address);
    }

    public AddressResponse setDefault(Principal principal, Long id) {
        User user = getCurrentUser(principal);

        Address address = addressRepository.findById(id)
                .filter(a -> a.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Adresse nicht gefunden"));

        clearDefaultForUser(user);
        address.setDefaultAddress(true);
        Address saved = addressRepository.save(address);

        return AddressResponse.fromEntity(saved);
    }

    private void clearDefaultForUser(User user) {
        List<Address> existing = addressRepository.findByUserOrderByDefaultAddressDescCreatedAtDesc(user);
        existing.forEach(a -> a.setDefaultAddress(false));
        addressRepository.saveAll(existing);
    }

    private void copyRequestToEntity(AddressRequest req, Address a) {
        a.setFirstName(req.getFirstName());
        a.setLastName(req.getLastName());
        a.setStreet(req.getStreet());
        a.setPostalCode(req.getPostalCode());
        a.setCity(req.getCity());
        a.setCountry(req.getCountry());
        a.setAdditionalInfo(req.getAdditionalInfo());
    }
}

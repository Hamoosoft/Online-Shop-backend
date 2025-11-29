package de.onlineshop.onlineshop_backend.dto;

import de.onlineshop.onlineshop_backend.model.Address;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AddressResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String street;
    private String postalCode;
    private String city;
    private String country;
    private String additionalInfo;
    private boolean defaultAddress;

    public static AddressResponse fromEntity(Address a) {
        return new AddressResponse(
                a.getId(),
                a.getFirstName(),
                a.getLastName(),
                a.getStreet(),
                a.getPostalCode(),
                a.getCity(),
                a.getCountry(),
                a.getAdditionalInfo(),
                a.isDefaultAddress()
        );
    }
}

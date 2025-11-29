package de.onlineshop.onlineshop_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {

    private String firstName;
    private String lastName;
    private String street;
    private String postalCode;
    private String city;
    private String country;
    private String additionalInfo;
    private boolean defaultAddress;
}

package de.onlineshop.onlineshop_backend.repository;

import de.onlineshop.onlineshop_backend.model.Address;
import de.onlineshop.onlineshop_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AddressRepository extends JpaRepository<Address, Long> {

    List<Address> findByUserOrderByDefaultAddressDescCreatedAtDesc(User user);
}

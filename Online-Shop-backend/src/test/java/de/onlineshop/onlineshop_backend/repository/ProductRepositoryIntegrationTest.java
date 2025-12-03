package de.onlineshop.onlineshop_backend.repository;

import de.onlineshop.onlineshop_backend.model.Product;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class ProductRepositoryIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void dataInitializer_createsSampleProducts() {
        // act
        List<Product> products = productRepository.findAll();

        // assert
        assertThat(products).isNotNull();
        assertThat(products.size()).isGreaterThanOrEqualTo(3);
    }
}

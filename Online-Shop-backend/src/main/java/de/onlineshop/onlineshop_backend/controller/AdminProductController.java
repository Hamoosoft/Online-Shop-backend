package de.onlineshop.onlineshop_backend.controller;

import de.onlineshop.onlineshop_backend.model.Product;
import de.onlineshop.onlineshop_backend.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')") // nur Admin
public class AdminProductController {

    private final ProductRepository productRepository;

    public AdminProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET /api/admin/products -> alle Produkte (für Admin-UI)
    @GetMapping
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    // POST /api/admin/products -> neues Produkt anlegen
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        if (product.getId() != null) {
            // zur Sicherheit: ID muss null sein beim Anlegen
            product.setId(null);
        }
        Product saved = productRepository.save(product);
        return ResponseEntity
                .created(URI.create("/api/admin/products/" + saved.getId()))
                .body(saved);
    }

    // PUT /api/admin/products/{id} -> Produkt bearbeiten
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @RequestBody Product request
    ) {
        return productRepository.findById(id)
                .map(existing -> {
                    existing.setName(request.getName());
                    existing.setDescription(request.getDescription());
                    existing.setPrice(request.getPrice());
                    existing.setImageUrl(request.getImageUrl());
                    Product updated = productRepository.save(existing);
                    return ResponseEntity.ok(updated);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE /api/admin/products/{id} -> löschen
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

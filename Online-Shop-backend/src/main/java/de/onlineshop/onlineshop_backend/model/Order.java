package de.onlineshop.onlineshop_backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders") // "order" ist ein SQL-Keyword, also besser "orders"
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // sehr einfache Kundendaten
    @Setter
    @Column(nullable = false)
    private String customerName;

    @Setter
    @Column(nullable = false)
    private String customerEmail;

    @Setter
    @Column(nullable = false)
    private BigDecimal totalAmount;

    @Column(nullable = false)
    private LocalDateTime createdAt;
    @Setter
    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // --- Getter/Setter ---

    public Long getId() {
        return id;
    }

    public String getCustomerName() {
        return customerName;
    }
    public void setOrderStatus(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getOrderStatus() {
        return status;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}

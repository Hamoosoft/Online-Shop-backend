package de.onlineshop.onlineshop_backend.controller;

import de.onlineshop.onlineshop_backend.dto.OrderResponse;
import de.onlineshop.onlineshop_backend.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')") // nur Admin
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // GET /api/admin/orders -> alle Bestellungen für Admin
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }
}

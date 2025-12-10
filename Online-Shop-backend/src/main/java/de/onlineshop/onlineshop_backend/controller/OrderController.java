package de.onlineshop.onlineshop_backend.controller;

import de.onlineshop.onlineshop_backend.dto.CreateOrderRequest;
import de.onlineshop.onlineshop_backend.dto.OrderResponse;
import de.onlineshop.onlineshop_backend.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // POST /api/orders -> Bestellung anlegen
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody CreateOrderRequest request) {
        try {
            OrderResponse created = orderService.createOrder(request);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException ex) {
            // z.B. keine Items, Produkt nicht gefunden, etc.
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("Ungültige Bestellung: " + ex.getMessage());
        } catch (IllegalStateException ex) {
            // z.B. Payment abgelehnt oder Payment-Service down
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(ex.getMessage());
        }
    }

    // GET /api/orders?email=...
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrdersByEmail(@RequestParam("email") String email) {
        List<OrderResponse> orders = orderService.getOrdersByEmail(email);
        return ResponseEntity.ok(orders);
    }
}

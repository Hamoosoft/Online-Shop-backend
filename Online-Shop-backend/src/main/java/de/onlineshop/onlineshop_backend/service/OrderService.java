package de.onlineshop.onlineshop_backend.service;

import de.onlineshop.onlineshop_backend.dto.CreateOrderRequest;
import de.onlineshop.onlineshop_backend.dto.OrderResponse;
import de.onlineshop.onlineshop_backend.model.Order;
import de.onlineshop.onlineshop_backend.model.OrderItem;
import de.onlineshop.onlineshop_backend.model.Product;
import de.onlineshop.onlineshop_backend.payment.PaymentClient;
import de.onlineshop.onlineshop_backend.payment.PaymentRequest;
import de.onlineshop.onlineshop_backend.payment.PaymentResponse;
import de.onlineshop.onlineshop_backend.payment.PaymentStatus;
import de.onlineshop.onlineshop_backend.repository.OrderRepository;
import de.onlineshop.onlineshop_backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final PaymentClient paymentClient;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        PaymentClient paymentClient) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.paymentClient = paymentClient;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        // Sehr einfache Validierung
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException("Bestellung muss mindestens einen Artikel enthalten.");
        }

        Order order = new Order();
        order.setCustomerName(request.getCustomerName());
        order.setCustomerEmail(request.getCustomerEmail());

        BigDecimal total = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Produkt nicht gefunden: " + itemRequest.getProductId()));

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(product.getPrice());

            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            order.addItem(item);
        }

        // -------------------------------
        // NEU: Payment-Service aufrufen
        // -------------------------------
        // Temporäre Order-ID für den Payment-Service
        String tempOrderId = UUID.randomUUID().toString();

        PaymentRequest paymentRequest = new PaymentRequest(
                total,
                "EUR",
                tempOrderId,
                request.getCustomerEmail(),
                "CREDIT_CARD"
        );

        PaymentResponse paymentResponse;
        try {
            paymentResponse = paymentClient.charge(paymentRequest);
        } catch (Exception ex) {
            // Resilienz-Verhalten: Payment-Service nicht erreichbar
            throw new IllegalStateException("Zahlungsservice aktuell nicht erreichbar.", ex);
        }

        if (paymentResponse == null || paymentResponse.getStatus() != PaymentStatus.PAID) {
            String msg = (paymentResponse != null && paymentResponse.getMessage() != null)
                    ? paymentResponse.getMessage()
                    : "Zahlung abgelehnt oder keine Antwort vom Zahlungsservice.";
            throw new IllegalStateException("Bestellung konnte nicht bezahlt werden: " + msg);
        }

        // -------------------------------
        // Nur wenn Payment OK -> Order speichern
        // -------------------------------
        order.setTotalAmount(total);

        //  Feld für Transaktions-ID
        // order.setPaymentTransactionId(paymentResponse.getTransactionId());

        Order saved = orderRepository.save(order);

        return mapToResponse(saved);
    }

    public List<OrderResponse> getOrdersByEmail(String email) {
        List<Order> orders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();

        // Neueste Bestellungen zuerst
        orders.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));

        return orders.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerEmail(order.getCustomerEmail());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt());

        List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderResponse.OrderItemResponse ir = new OrderResponse.OrderItemResponse();
            ir.setProductId(item.getProduct().getId());
            ir.setProductName(item.getProduct().getName());
            ir.setUnitPrice(item.getUnitPrice());
            ir.setQuantity(item.getQuantity());
            return ir;
        }).collect(Collectors.toList());

        response.setItems(itemResponses);

        return response;
    }
}

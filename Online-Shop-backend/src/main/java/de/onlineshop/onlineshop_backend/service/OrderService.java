package de.onlineshop.onlineshop_backend.service;

import de.onlineshop.onlineshop_backend.dto.CreateOrderRequest;
import de.onlineshop.onlineshop_backend.dto.OrderResponse;
import de.onlineshop.onlineshop_backend.rabbitmq.messages.PaymentCommand;
import de.onlineshop.onlineshop_backend.model.Order;
import de.onlineshop.onlineshop_backend.model.OrderItem;
import de.onlineshop.onlineshop_backend.model.OrderStatus;
import de.onlineshop.onlineshop_backend.model.Product;
import de.onlineshop.onlineshop_backend.rabbitmq.RabbitConfig;
import de.onlineshop.onlineshop_backend.repository.OrderRepository;
import de.onlineshop.onlineshop_backend.repository.ProductRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final RabbitTemplate rabbitTemplate;

    public OrderService(OrderRepository orderRepository,
                        ProductRepository productRepository,
                        RabbitTemplate rabbitTemplate) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
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

        order.setTotalAmount(total);

        //  einheitlich: orderStatus
        order.setOrderStatus(OrderStatus.PENDING_PAYMENT);

        //  zuerst speichern (damit Order-ID existiert)
        Order saved = orderRepository.save(order);

        //  PaymentCommand in RabbitMQ senden
        PaymentCommand cmd = new PaymentCommand(
                saved.getId(),
                total,
                "EUR",
                saved.getCustomerEmail(),
                request.getPaymentMethod() != null ? request.getPaymentMethod() : "INVOICE"
        );

        rabbitTemplate.convertAndSend(RabbitConfig.PAYMENT_COMMANDS_QUEUE, cmd);

        //  sofort antworten (User merkt Payment-Probleme nicht)
        return mapToResponse(saved);
    }

    public List<OrderResponse> getOrdersByEmail(String email) {
        List<Order> orders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        orders.sort((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()));
        return orders.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private OrderResponse mapToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());

        //  Status richtig mappen
        response.setStatus(order.getOrderStatus() != null ? order.getOrderStatus().name() : "UNKNOWN");


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

package de.onlineshop.onlineshop_backend.rabbitmq;

import de.onlineshop.onlineshop_backend.model.OrderStatus;
import de.onlineshop.onlineshop_backend.rabbitmq.messages.PaymentResult;
import de.onlineshop.onlineshop_backend.repository.OrderRepository;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class PaymentResultListener {

    private final OrderRepository orderRepository;

    public PaymentResultListener(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @RabbitListener(queues = RabbitConfig.PAYMENT_RESULTS_QUEUE)
    public void handleResult(PaymentResult result) {
        if (result == null || result.getOrderId() == null) return;

        orderRepository.findById(result.getOrderId()).ifPresent(order -> {

            if ("PAID".equalsIgnoreCase(result.getStatus())) {
                order.setOrderStatus(OrderStatus.PAID);
            } else {
                order.setOrderStatus(OrderStatus.PAYMENT_FAILED);
            }

            orderRepository.save(order);
        });
    }
}
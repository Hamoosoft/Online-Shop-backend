package die.onlineshop.payment.rabbitmq;

import die.onlineshop.payment.rabbitmq.messages.PaymentCommand;
import die.onlineshop.payment.rabbitmq.messages.PaymentResult;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentMessageListener {

    private final RabbitTemplate rabbitTemplate;

    public PaymentMessageListener(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @RabbitListener(queues = RabbitConfig.PAYMENT_COMMANDS_QUEUE)
    public void handlePayment(PaymentCommand cmd) {
        //throw new RuntimeException("simulate failure");
        System.out.println("Received payment command for order " + cmd.getOrderId());

        BigDecimal amount = cmd.getAmount();
        if (amount == null) {
            amount = BigDecimal.ZERO; //
        }

        PaymentResult result;

        if (amount.compareTo(BigDecimal.valueOf(500)) < 0 && amount.intValue() > 0) {
            result = new PaymentResult(
                    cmd.getOrderId(),
                    "PAID",
                    "Zahlung erfolgreich (Demo).",
                    "TX-" + System.currentTimeMillis()
            );
        } else {
            result = new PaymentResult(
                    cmd.getOrderId(),
                    "DECLINED",
                    "Zahlung abgelehnt (Demo-Limit oder ungültiger Betrag).",
                    null
            );
        }

        rabbitTemplate.convertAndSend(
                RabbitConfig.PAYMENT_RESULTS_QUEUE,
                result
        );

        System.out.println("Payment result sent for order " + cmd.getOrderId());
    }

}


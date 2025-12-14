package die.onlineshop.payment.rabbitmq.messages;

import java.io.Serializable;

public class PaymentResult implements Serializable {

    private Long orderId;
    private String status;
    private String message;
    private String transactionId;

    public PaymentResult() {
        // wichtig für Jackson
    }

    public PaymentResult(Long orderId, String status, String message, String transactionId) {
        this.orderId = orderId;
        this.status = status;
        this.message = message;
        this.transactionId = transactionId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }
}

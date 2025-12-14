package die.onlineshop.payment.rabbitmq.messages;

import java.math.BigDecimal;

public class PaymentCommand {

    private Long orderId;
    private BigDecimal amount;
    private String currency;
    private String customerEmail;
    private String paymentMethod;

    public PaymentCommand() {}

    public PaymentCommand(Long orderId, BigDecimal amount, String currency,
                          String customerEmail, String paymentMethod) {
        this.orderId = orderId;
        this.amount = amount;
        this.currency = currency;
        this.customerEmail = customerEmail;
        this.paymentMethod = paymentMethod;
    }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; } // ✅ FIX

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getCustomerEmail() { return customerEmail; }
    public void setCustomerEmail(String customerEmail) { this.customerEmail = customerEmail; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}

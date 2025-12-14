package die.onlineshop.payment.rabbitmq;

import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.listener.ConditionalRejectingErrorHandler;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RabbitListenerConfig {

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter converter
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);

        // ✅ DAS ist wichtig:
        factory.setMessageConverter(converter);

        factory.setDefaultRequeueRejected(false);
        factory.setErrorHandler(new ConditionalRejectingErrorHandler());

        factory.setAdviceChain(
                RetryInterceptorBuilder.stateless()
                        .maxRetries(3)
                        .backOffOptions(500, 2.0, 5000)
                        .recoverer(new RejectAndDontRequeueRecoverer())
                        .build()
        );

        return factory;
    }
}
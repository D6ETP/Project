package com.booking.bookingservice.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    /**
     * Spring-managed, load-balanced RestTemplate bean.
     * - @LoadBalanced enables Eureka-based service discovery (resolve service names like "auth-service")
     * - Timeouts prevent threads from hanging on unresponsive downstream services
     */
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000); // 5s connect timeout
        factory.setReadTimeout(5000);    // 5s read timeout
        return new RestTemplate(factory);
    }
}

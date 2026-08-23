package com.booking.gateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Component
public class GlobalLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(GlobalLoggingFilter.class);

    private final WebClient webClient;

    public GlobalLoggingFilter(@Value("${logging.service.url:http://logging-service:8086}") String loggingServiceUrl) {
        this.webClient = WebClient.builder()
                .baseUrl(loggingServiceUrl)
                .build();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            ServerHttpRequest request = exchange.getRequest();
            ServerHttpResponse response = exchange.getResponse();

            String path = request.getURI().getPath();

            // Skip logging for swagger and internal health requests
            if (path.contains("/swagger") || path.contains("/api-docs") || path.contains("/actuator")) {
                return;
            }

            HttpStatus status = (HttpStatus) response.getStatusCode();
            int statusCode = status != null ? status.value() : 200;

            String userId = request.getHeaders().getFirst("X-User-Id");
            String userEmail = request.getHeaders().getFirst("X-User-Email");
            String userRole = request.getHeaders().getFirst("X-User-Role");
            String clientIp = request.getRemoteAddress() != null
                    ? request.getRemoteAddress().getAddress().getHostAddress()
                    : "UNKNOWN";

            if (statusCode >= 400) {
                // Log Error payload
                Map<String, Object> errorPayload = new HashMap<>();
                errorPayload.put("serviceName", "API_GATEWAY");
                errorPayload.put("endpoint", path);
                errorPayload.put("httpMethod", request.getMethod().name());
                errorPayload.put("statusCode", statusCode);
                errorPayload.put("errorMessage", "Request failed with HTTP " + statusCode + " for path: " + path);
                errorPayload.put("exceptionType", "HTTP_" + statusCode);
                errorPayload.put("clientIp", clientIp);

                webClient.post()
                        .uri("/logs/error")
                        .bodyValue(errorPayload)
                        .retrieve()
                        .toBodilessEntity()
                        .subscribe(
                                null,
                                err -> log.warn("Could not send error log to LoggingService: {}", err.getMessage())
                        );
            } else {
                // Log Operation payload
                Map<String, Object> opsPayload = new HashMap<>();
                opsPayload.put("userId", userId != null ? userId : "ANONYMOUS");
                opsPayload.put("username", userEmail != null ? userEmail : "guest");
                opsPayload.put("role", userRole != null ? userRole : "ROLE_USER");
                opsPayload.put("httpMethod", request.getMethod().name());
                opsPayload.put("endpoint", path);
                opsPayload.put("statusCode", statusCode);
                opsPayload.put("description", "User performed " + request.getMethod().name() + " on " + path);
                opsPayload.put("clientIp", clientIp);
                opsPayload.put("responseTimeMs", duration);

                webClient.post()
                        .uri("/logs/operation")
                .bodyValue(opsPayload)
                        .retrieve()
                        .toBodilessEntity()
                        .subscribe(
                                null,
                                err -> log.warn("Could not send operation log to LoggingService: {}", err.getMessage())
                        );
            }
        }));
    }

    @Override
    public int getOrder() {
        return LOWEST_PRECEDENCE;
    }
}

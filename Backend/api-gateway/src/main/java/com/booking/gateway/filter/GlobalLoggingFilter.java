package com.booking.gateway.filter;

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

    private final WebClient webClient;

    public GlobalLoggingFilter() {
        this.webClient = WebClient.builder()
                .baseUrl("http://localhost:8086")
                .build();
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        long startTime = System.currentTimeMillis();
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        // Skip logging requests that go directly to logging service itself to avoid infinite loop
        if (path.startsWith("/api/logs") || path.startsWith("/logs")) {
            return chain.filter(exchange);
        }

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            ServerHttpResponse response = exchange.getResponse();
            HttpStatus status = (HttpStatus) response.getStatusCode();
            int statusCode = status != null ? status.value() : 200;

            String userId = request.getHeaders().getFirst("X-User-Id");
            String userRole = request.getHeaders().getFirst("X-User-Role");
            String userEmail = request.getHeaders().getFirst("X-User-Email");
            String clientIp = request.getRemoteAddress() != null ? request.getRemoteAddress().getAddress().getHostAddress() : "127.0.0.1";

            if (statusCode >= 400) {
                // Log Error payload
                Map<String, Object> errorPayload = new HashMap<>();
                errorPayload.put("userId", userId != null ? userId : "ANONYMOUS");
                errorPayload.put("username", userEmail != null ? userEmail : "guest");
                errorPayload.put("role", userRole != null ? userRole : "ROLE_USER");
                errorPayload.put("httpMethod", request.getMethod().name());
                errorPayload.put("endpoint", path);
                errorPayload.put("statusCode", statusCode);
                errorPayload.put("errorMessage", "Request failed with HTTP status " + statusCode + " (" + (status != null ? status.getReasonPhrase() : "") + ")");
                errorPayload.put("exceptionType", "HTTP_" + statusCode);
                errorPayload.put("clientIp", clientIp);

                webClient.post()
                        .uri("/logs/error")
                        .bodyValue(errorPayload)
                        .retrieve()
                        .toBodilessEntity()
                        .subscribe(
                                null,
                                err -> System.err.println("⚠️ Could not send error log to LoggingService: " + err.getMessage())
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
                                err -> System.err.println("⚠️ Could not send operation log to LoggingService: " + err.getMessage())
                        );
            }
        }));
    }

    @Override
    public int getOrder() {
        return LOWEST_PRECEDENCE;
    }
}

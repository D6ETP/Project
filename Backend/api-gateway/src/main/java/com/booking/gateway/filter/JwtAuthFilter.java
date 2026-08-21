package com.booking.gateway.filter;

import com.booking.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

	@Autowired
	private JwtUtil jwtUtil;

	// Public routes where authentication is optional (guests allowed)
	private static final List<String> openRoutes = List.of(
			"/api/auth/login",
			"/api/auth/register",
			"/api/auth/send-otp",
			"/api/auth/verify-otp",
			"/api/auth/forgot-password-otp",
			"/api/auth/reset-password",
			"/api/routes",
			"/routes",
			"/api/seats",
			"/seats",
			"/api/reviews",
			"/reviews"
	);

	public JwtAuthFilter() {
		super(Config.class);
	}

	@Override
	public GatewayFilter apply(Config config) {
		return (exchange, chain) -> {

			// Allow CORS preflight requests without authentication
			if (org.springframework.http.HttpMethod.OPTIONS.equals(exchange.getRequest().getMethod())) {
				return chain.filter(exchange);
			}

			String path = exchange.getRequest().getURI().getPath();

			boolean isOpen = openRoutes.stream().anyMatch(path::startsWith);
			boolean hasAuthHeader = exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION);

			String token = null;
			if (hasAuthHeader) {
				String header = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
				if (header != null && header.startsWith("Bearer ")) {
					token = header.substring(7);
				}
			}

			// If token is present, try to extract claims & populate X-User headers for downstream services & logging
			if (token != null) {
				try {
					jwtUtil.extractAllClaims(token);
					ServerHttpRequest mutatedReq = exchange.getRequest().mutate()
							.header("X-User-Id", jwtUtil.getUserId(token))
							.header("X-User-Role", jwtUtil.getRole(token))
							.header("X-User-Email", jwtUtil.getEmail(token))
							.build();
					return chain.filter(exchange.mutate().request(mutatedReq).build());
				} catch (Exception e) {
					System.out.println("JWT validation failed: " + e.getMessage());
					if (!isOpen) {
						return sendError(exchange, HttpStatus.UNAUTHORIZED, "Token is invalid or expired");
					}
				}
			}

			// No token provided (or token invalid on an open/public route)
			if (isOpen) {
				return chain.filter(exchange);
			}

			return sendError(exchange, HttpStatus.UNAUTHORIZED, "No token provided");
		};
	}

	private Mono<Void> sendError(ServerWebExchange exchange, HttpStatus status, String msg) {
		ServerHttpResponse response = exchange.getResponse();
		response.setStatusCode(status);
		response.getHeaders().add("Content-Type", "application/json");

		String body = "{\"error\": \"" + msg + "\", \"status\": " + status.value() + "}";
		var bytes = body.getBytes();
		var buffer = response.bufferFactory().wrap(bytes);

		return response.writeWith(Mono.just(buffer));
	}

	public static class Config {
	}
}

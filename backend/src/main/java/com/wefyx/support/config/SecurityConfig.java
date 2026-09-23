package com.wefyx.support.config;

import com.wefyx.support.auth.JwtService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.io.IOException;
import java.util.List;

@Configuration
public class SecurityConfig {
    @Bean CorsConfigurationSource corsConfigurationSource(){
        var config=new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://127.0.0.1:*","http://localhost:*","https://wefyx.pro","https://www.wefyx.pro"));
        config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);
        var source=new UrlBasedCorsConfigurationSource();source.registerCorsConfiguration("/**",config);return source;
    }
    @Bean SecurityFilterChain security(HttpSecurity http,JwtFilter jwt)throws Exception{return http.csrf(c->c.disable()).cors(c->{}).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS)).exceptionHandling(e->e.authenticationEntryPoint((request,response,error)->response.sendError(HttpServletResponse.SC_UNAUTHORIZED))).authorizeHttpRequests(a->a.requestMatchers("/","/index.html","/assets/**","/images/**","/favicon.ico","/portal","/register","/careers","/privacy-policy","/rent","/rent/**","/cart","/services","/data-center","/about","/contact","/shop","/api/auth/login","/api/auth/register","/error").permitAll().anyRequest().authenticated()).addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();}
}
@Component class JwtFilter extends OncePerRequestFilter {
    private final JwtService jwt; JwtFilter(JwtService jwt){this.jwt=jwt;}
    @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain)throws ServletException,IOException{String auth=request.getHeader("Authorization");if(auth!=null&&auth.startsWith("Bearer ")){String email=jwt.validate(auth.substring(7));if(email!=null)SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(email,null,List.of()));}chain.doFilter(request,response);}
}

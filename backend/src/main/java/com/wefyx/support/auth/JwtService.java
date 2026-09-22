package com.wefyx.support.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class JwtService {
    private final ObjectMapper json;
    private final byte[] secret;
    private final long expirationSeconds;
    public JwtService(ObjectMapper json,@Value("${wefyx.auth.secret}") String secret,@Value("${wefyx.auth.expiration-seconds}") long expirationSeconds){this.json=json;this.secret=secret.getBytes(StandardCharsets.UTF_8);this.expirationSeconds=expirationSeconds;}
    public String issue(String email,String role){try{String header=encode(json.writeValueAsBytes(Map.of("alg","HS256","typ","JWT")));String payload=encode(json.writeValueAsBytes(Map.of("sub",email,"role",role,"exp",Instant.now().getEpochSecond()+expirationSeconds)));String content=header+"."+payload;return content+"."+encode(sign(content));}catch(Exception e){throw new IllegalStateException("Unable to issue token",e);}}
    public TokenIdentity validateIdentity(String token){try{String[] parts=token.split("\\.");if(parts.length!=3)return null;String content=parts[0]+"."+parts[1];if(!java.security.MessageDigest.isEqual(sign(content),Base64.getUrlDecoder().decode(parts[2])))return null;Map<?,?> claims=json.readValue(Base64.getUrlDecoder().decode(parts[1]),Map.class);if(((Number)claims.get("exp")).longValue()<Instant.now().getEpochSecond())return null;return new TokenIdentity(String.valueOf(claims.get("sub")),String.valueOf(claims.get("role")));}catch(Exception e){return null;}}
    public String validate(String token){TokenIdentity identity=validateIdentity(token);return identity==null?null:identity.email();}
    private byte[] sign(String content)throws Exception{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret,"HmacSHA256"));return mac.doFinal(content.getBytes(StandardCharsets.UTF_8));}
    private String encode(byte[] bytes){return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);}
    public record TokenIdentity(String email,String role){}
}

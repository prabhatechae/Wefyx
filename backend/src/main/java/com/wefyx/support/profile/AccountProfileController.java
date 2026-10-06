package com.wefyx.support.profile;

import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashMap;
import com.wefyx.support.user.UserRepository;
import com.wefyx.support.user.UserIdentity;

@RestController
@RequestMapping("/api/profile")
public class AccountProfileController {
    private static final long MAX_SIZE=3L*1024*1024;
    private static final Set<String> TYPES=Set.of("image/jpeg","image/png","image/webp");
    private final AccountProfilePhotoRepository photos;
    private final UserRepository users;
    public AccountProfileController(AccountProfilePhotoRepository photos,UserRepository users){this.photos=photos;this.users=users;}

    @GetMapping
    public Map<String,Object> profile(Authentication auth){return view(account(auth));}

    @PutMapping
    public Map<String,Object> update(@RequestBody Map<String,String> body,Authentication auth){
        var user=account(auth);
        String name=required(body.get("name"),"Name");
        String organization=required(body.get("organization"),"Company / organization");
        String phone=UserIdentity.phone(body.get("phone"),true);
        if(users.existsByPhoneAndIdNot(phone,user.getId()))throw new ResponseStatusException(HttpStatus.CONFLICT,"This mobile number is already registered");
        user.setName(name);user.setOrganization(organization);user.setPhone(phone);
        user.setJobTitle(clean(body.get("jobTitle")));user.setWebsite(clean(body.get("website")));user.setEmirate(clean(body.get("emirate")));
        user.setAddress(clean(body.get("address")));user.setCountry(clean(body.get("country")));user.setLocation(clean(body.get("address")));
        return view(users.save(user));
    }

    @GetMapping("/photo")
    public ResponseEntity<byte[]> photo(Authentication auth){
        var item=photos.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Profile photo not set"));
        return ResponseEntity.ok().cacheControl(CacheControl.noCache()).contentType(MediaType.parseMediaType(item.getContentType())).contentLength(item.getContent().length).body(item.getContent());
    }

    @PutMapping(value="/photo",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String,Object> upload(@RequestParam("file") MultipartFile file,Authentication auth)throws IOException{
        if(file.isEmpty())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Choose a profile image");
        if(file.getSize()>MAX_SIZE)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,"Profile image must be 3 MB or smaller");
        String type=String.valueOf(file.getContentType()).toLowerCase();
        if(!TYPES.contains(type))throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,"Use a PNG, JPEG or WebP image");
        var item=photos.findByEmailIgnoreCase(auth.getName()).orElseGet(AccountProfilePhoto::new);
        item.setEmail(auth.getName().toLowerCase());item.setContentType(type);item.setContent(file.getBytes());photos.save(item);
        return Map.of("message","Profile photo updated","contentType",type,"size",file.getSize());
    }

    @DeleteMapping("/photo") @ResponseStatus(HttpStatus.NO_CONTENT) @Transactional
    public void remove(Authentication auth){photos.deleteByEmailIgnoreCase(auth.getName());}

    private com.wefyx.support.user.SupportUser account(Authentication auth){return users.findByEmailIgnoreCase(auth.getName()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Account not found"));}
    private Map<String,Object> view(com.wefyx.support.user.SupportUser user){Map<String,Object> result=new LinkedHashMap<>();result.put("name",user.getName());result.put("email",user.getEmail());result.put("organization",user.getOrganization());result.put("phone",clean(user.getPhone()));result.put("jobTitle",clean(user.getJobTitle()));result.put("website",clean(user.getWebsite()));result.put("emirate",clean(user.getEmirate()));result.put("address",clean(user.getAddress()));result.put("country",clean(user.getCountry()));result.put("role",user.getRole());return result;}
    private static String required(String value,String label){if(value==null||value.isBlank())throw new ResponseStatusException(HttpStatus.BAD_REQUEST,label+" is required");return value.trim();}
    private static String clean(String value){return value==null?"":value.trim();}
}

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

@RestController
@RequestMapping("/api/profile")
public class AccountProfileController {
    private static final long MAX_SIZE=3L*1024*1024;
    private static final Set<String> TYPES=Set.of("image/jpeg","image/png","image/webp");
    private final AccountProfilePhotoRepository photos;
    public AccountProfileController(AccountProfilePhotoRepository photos){this.photos=photos;}

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
}

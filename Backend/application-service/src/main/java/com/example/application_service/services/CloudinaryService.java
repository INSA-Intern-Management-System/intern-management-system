
package com.example.application_service.services;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;


    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file) throws IOException {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), Map.of());
            System.out.println("Cloudinary upload response: " + result);
            return (String) result.get("secure_url");

        } catch (Exception e) {
            e.printStackTrace(); // Log full stack trace
            throw new IOException("Cloudinary upload failed: " + e.getMessage());
        }
    }
}

package com.example.userservice.service;

import com.example.userservice.dto.SystemStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.net.InetSocketAddress;
import java.net.Socket;

import javax.sql.DataSource;
import java.io.File;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.List;

@Service
public class SystemHealthService {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private RestTemplate restTemplate; // for API check

    /**
     * Check database health
     */
    public SystemStatus checkDatabase() {
        try (Connection conn = dataSource.getConnection()) {
            if (conn.isValid(2)) {
                return new SystemStatus("Database", "Healthy", "Connection successful");
            } else {
                return new SystemStatus("Database", "Error", "Connection invalid");
            }
        } catch (SQLException e) {
            return new SystemStatus("Database", "Error", e.getMessage());
        }
    }

    /**
     * Check email server health
     */
    
    public SystemStatus checkEmail() {
        String host = "smtp.example.com";
        int port = 587;
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), 2000);
            return new SystemStatus("Email", "Healthy", "SMTP reachable");
        } catch (Exception e) {
            return new SystemStatus("Email", "Error", e.getMessage());
        }
    }

    /**
     * Check storage space
     */
    public SystemStatus checkStorage() {
        File file = new File("/");
        long freeSpaceGB = file.getFreeSpace() / (1024 * 1024 * 1024);
        if (freeSpaceGB > 1) {
            return new SystemStatus("Storage", "Healthy", "Enough free space available");
        } else {
            return new SystemStatus("Storage", "Warning", "Low disk space");
        }
    }

    /**
     * Check backup health
     */
    public SystemStatus checkBackup() {
        File backupFolder = new File("/var/backups"); // adjust path
        if (!backupFolder.exists()) {
            return new SystemStatus("Backup", "Error", "Backup folder does not exist");
        }
        long lastModified = backupFolder.lastModified();
        long oneDayMillis = 24 * 60 * 60 * 1000;
        if (System.currentTimeMillis() - lastModified < oneDayMillis) {
            return new SystemStatus("Backup", "Healthy", "Backup updated within last 24h");
        } else {
            return new SystemStatus("Backup", "Error", "Backup outdated");
        }
    }

        /**
     * Check health of all microservice APIs
     */
    public SystemStatus checkApi() {
        // List of your local microservice health endpoints
        List<String> apis = Arrays.asList(
                "http://localhost:8080/actuator/health",  // user-service
                "http://localhost:8081/actuator/health",  // activity-service
                "http://localhost:8082/actuator/health",  // application-service
                "http://localhost:8083/actuator/health",  // leave-service
                "http://localhost:8084/actuator/health",  // message-service
                "http://localhost:8085/actuator/health",  // notification-service
                "http://localhost:8086/actuator/health",  // project-service
                "http://localhost:8087/actuator/health",  // report-service
                "http://localhost:8088/actuator/health"   // schedule-service
        );

        for (String apiUrl : apis) {
            try {
                ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
                if (!response.getStatusCode().is2xxSuccessful()) {
                    return new SystemStatus("API", "Error", "Service down at: " + apiUrl);
                }
            } catch (Exception e) {
                return new SystemStatus("API", "Error", "Cannot reach " + apiUrl + " → " + e.getMessage());
            }
        }

        return new SystemStatus("API", "Healthy", "All APIs are reachable");
    }


    /**
     * Return full system health
     */
    public List<SystemStatus> getSystemHealth() {
        return Arrays.asList(
                checkDatabase(),
                checkEmail(),
                checkStorage(),
                checkApi(),      
                checkBackup()
        );
    }
}

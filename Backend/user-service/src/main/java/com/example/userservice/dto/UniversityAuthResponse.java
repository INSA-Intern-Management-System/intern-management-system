package com.example.userservice.dto;

public class UniversityAuthResponse {
    private String message;
//    private String token;
    private UniversityDto university;

    public UniversityAuthResponse(String message,  UniversityDto university) {
        this.message = message;
//        this.token = token;
        this.university = university;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

//    public String getToken() {
//        return token;
//    }
//
//    public void setToken(String token) {
//        this.token = token;
//    }

    public UniversityDto getUniversity() {
        return university;
    }

    public void setUniversity(UniversityDto university) {
        this.university = university;
    }
}

package com.example.project_service.dto;

public class UniversityStatsResponseDTO {
    private Long withStatus;
    private Long withOutStatus;

    public UniversityStatsResponseDTO(Long withStatus, Long withOutStatus) {
        this.withStatus = withStatus;
        this.withOutStatus = withOutStatus;
    }

    public void setWithStatus(Long withStatus) {
        this.withStatus = withStatus;
    }

    public void setWithOutStatus(Long withOutStatus) {
        this.withOutStatus = withOutStatus;
    }
    public Long getWithStatus() {
        return withStatus;
        }

    public Long getWithOutStatus() {
        return withOutStatus;
    }
}

package com.example.userservice.dto;

public class InternStatusesCount {

    private long activeIntern;
    private long completedIntern;

    public InternStatusesCount(long activeIntern, long completedIntern) {
        this.activeIntern = activeIntern;
        this.completedIntern = completedIntern;
    }

    // Getters and setters
    public long getActiveIntern() {
        return activeIntern;
    }

    public void setActiveIntern(long activeIntern) {
        this.activeIntern = activeIntern;
    }

    public long getCompletedIntern() {
        return completedIntern;
    }

    public void setCompletedIntern(long completedIntern) {
        this.completedIntern = completedIntern;
    }
}

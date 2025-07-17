package com.example.leave_service.dto;

import java.util.Date;

public class LeaveResponse {

    private Long leaveId;
    private Long userId;
    private String leaveType;
    private Date fromDate;
    private Date toDate;
    private String reason;
    private String leaveStatus;
    private Date createdAt;

    public LeaveResponse() {
    }

    public LeaveResponse(Long leaveId, Long userId, String leaveType, Date fromDate,
                         Date toDate, String reason, String leaveStatus, Date createdAt) {
        this.leaveId = leaveId;
        this.userId = userId;
        this.leaveType = leaveType;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.reason = reason;
        this.leaveStatus = leaveStatus;
        this.createdAt = createdAt;
    }

    public Long getLeaveId() {
        return leaveId;
    }

    public void setLeaveId(Long leaveId) {
        this.leaveId = leaveId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getLeaveType() {
        return leaveType;
    }

    public void setLeaveType(String leaveType) {
        this.leaveType = leaveType;
    }

    public Date getFromDate() {
        return fromDate;
    }

    public void setFromDate(Date fromDate) {
        this.fromDate = fromDate;
    }

    public Date getToDate() {
        return toDate;
    }

    public void setToDate(Date toDate) {
        this.toDate = toDate;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getLeaveStatus() {
        return leaveStatus;
    }

    public void setLeaveStatus(String leaveStatus) {
        this.leaveStatus = leaveStatus;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}

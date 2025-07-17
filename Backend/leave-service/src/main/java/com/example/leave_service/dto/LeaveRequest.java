package com.example.leave_service.dto;

import java.util.Date;

public class LeaveRequest {

    private String leaveType;
    private Date fromDate;
    private Date toDate;
    private String reason;

    public LeaveRequest() {
    }

    public LeaveRequest(String leaveType, Date fromDate, Date toDate, String reason) {
        this.leaveType = leaveType;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.reason = reason;
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
}

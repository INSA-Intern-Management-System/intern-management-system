package com.example.leave_service.dto;
import java.util.Date;

import com.example.leave_service.model.LeaveStatus;

public class LeaveResult {

    private Long leaveId;
    private Long userId;
    private String leaveType;
    private Date fromDate;
    private Date toDate;
    private String reason;
    private LeaveStatus leaveStatus;
    private Long receiverID;
    private Date createdAt;
    private String FristName;
    private String LastName;
    private String University;
    private String FeildOfStudy;



    public LeaveResult() {
    }

    public LeaveResult(Long leaveId, Long userId, String leaveType, Date fromDate,
                         Date toDate, String reason, LeaveStatus leaveStatus,Long receiverID, Date createdAt,
                         String fristName, String lastName, String university, String feildOfStudy) {
        this.leaveId = leaveId;
        this.userId = userId;
        this.leaveType = leaveType;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.reason = reason;
        this.leaveStatus = leaveStatus;
        this.receiverID = receiverID;
        this.createdAt = createdAt;
        FristName = fristName;
        LastName = lastName;
        University = university;
        FeildOfStudy = feildOfStudy;

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

    public LeaveStatus getLeaveStatus() {
        return leaveStatus;
    }

    public void setLeaveStatus(LeaveStatus leaveStatus) {
        this.leaveStatus = leaveStatus;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public Long getReceiverID() {
        return receiverID;
    }

    public void setReceiverID(Long receiverID) {
        this.receiverID = receiverID;
    }


    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public String getFristName() {
        return FristName;
    }

    public void setFristName(String fristName) {
        FristName = fristName;
    }
    public String getLastName() {
        return LastName;
    }

    public void setLastName(String lastName) {
        LastName = lastName;
    }
    public String getUniversity() {
        return University;
    }

    public void setUniversity(String university) {
        University = university;
    }
    public String getFeildOfStudy() {
        return FeildOfStudy;
    }

    public void setFeildOfStudy(String feildOfStudy) {
        FeildOfStudy = feildOfStudy;
    }
}

package com.example.userservice.dto;

import java.util.List;

public class PagedUserPerformanceDTO {
    private List<UserPerformanceDTO> users;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;

    // Getters and setters
    public List<UserPerformanceDTO> getUsers() { return users; }
    public void setUsers(List<UserPerformanceDTO> users) { this.users = users; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }

    public int getPageSize() { return pageSize; }
    public void setPageSize(int pageSize) { this.pageSize = pageSize; }

    public long getTotalElements() { return totalElements; }
    public void setTotalElements(long totalElements) { this.totalElements = totalElements; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}


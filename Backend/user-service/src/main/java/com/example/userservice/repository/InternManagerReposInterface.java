package com.example.userservice.repository;

import java.util.ArrayList;
import java.util.List;

import com.example.userservice.model.InternManager;


public interface InternManagerReposInterface {
    InternManager getInfo(Long userId);
    List<InternManager> getInfos(List<Long> userids);
}


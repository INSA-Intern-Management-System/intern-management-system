package com.example.userservice.repository;


import com.example.userservice.model.Role;
import com.example.userservice.model.User;
import com.example.userservice.model.UserStatus;
import com.example.userservice.model.UserStatusCount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Page<User> findByRoleAndInstitution( Role role ,String institution, Pageable pageable);

    //add other method here for searhcing user using role,institiution,and keyword(firstname,or last name) and return it a pageable format like above method

    User findByEmail(String email);

    Page<User> findByRole(Role role, Pageable pageable);

    List<User> findByRoleId(Long roleId);

    long countByRoleIdAndUserStatus(Long roleId, UserStatus userStatus);

    Long countByRole(Role role);
    List<User> findByFirstNameContainingIgnoreCaseAndRole_Name(String firstName, String roleName);
    List<User> findAll();

    Page<User> findByFirstNameContainingIgnoreCase(String firstName, Pageable pageable);

    Page<User> findByRoleAndFirstNameContainingIgnoreCaseOrRoleAndFieldOfStudyContainingIgnoreCase(
            Role role1, String firstName,
            Role role2, String fieldOfStudy,
            Pageable pageable
    );

    Page<User> findByRoleAndInstitutionAndFirstNameEqualsIgnoreCaseOrRoleAndInstitutionAndFieldOfStudyEqualsIgnoreCase(
            Role role1, String institution1, String firstName,
            Role role2, String institution2, String fieldOfStudy,
            Pageable pageable
    );



   Page<User> findByRoleAndUserStatus(Role role, UserStatus userStatus, Pageable pageable);

   Page<User> findByRoleAndFieldOfStudyContainingIgnoreCase(Role role, String fieldOfStudy, Pageable pageable);


    Page<User> findByUserStatus(UserStatus userStatus, Pageable pageable);
    Page<User> findBySupervisorIdAndRole(Long supervisorId, Role role, Pageable pageable);



    @Query("SELECT u.userStatus AS userStatus, COUNT(u) AS count FROM User u GROUP BY u.userStatus")
    List<UserStatusCount> countUsersByStatus();

    Page<User> findByRoleAndSupervisor_FirstNameContainingIgnoreCase(
            Role role1, String firstName, Pageable pageable
    );

    //count the number of user based on user status 
    //int countByRoleIdAndUserStatus(Long role_id, UserStatus userStatus);

    //get list of user based on list on user id
    List<User> findByIdIn(List<Long> ids);

    Page<User> findBySupervisor_IdIn(List<Long> supervisorIds, Pageable pageable);

    @Query("SELECT u FROM User u " +
       "JOIN u.supervisor s " +
       "WHERE u.role = :role " +
       "AND u.institution = :institution " +
       "AND s.id = :supervisorId " + // ✅ filter by supervisor
       "AND (:keyword IS NULL OR :keyword = '' OR (" +
       "LOWER(TRIM(u.firstName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) " +
       "OR LOWER(TRIM(u.lastName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) " +
       "OR LOWER(TRIM(s.firstName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) " +
       "OR LOWER(TRIM(s.lastName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) " +
       "))")
        Page<User> searchByRoleInstitutionAndSupervisor(Role role,
                                                        String institution,
                                                        Long supervisorId,
                                                        String keyword,
                                                        Pageable pageable);



    @Query("SELECT u FROM User u " +
       "JOIN u.supervisor s " +
       "WHERE u.role = :role " +
       "AND u.institution = :institution " +
       "AND (:supervisorName IS NULL OR :supervisorName = '' OR (" +
       "LOWER(TRIM(s.firstName)) LIKE LOWER(CONCAT('%', TRIM(:supervisorName), '%')) " +
       "OR LOWER(TRIM(s.lastName)) LIKE LOWER(CONCAT('%', TRIM(:supervisorName), '%')) " +
       "))")
        Page<User> findByRoleAndInstitutionAndSupervisorName(Role role, String institution, String supervisorName, Pageable pageable);


        @Query("SELECT u FROM User u " +
        "JOIN u.supervisor s " +
        "WHERE u.role = :role " +
        "AND u.institution = :institution " +
        "AND (:supervisorName IS NULL OR :supervisorName = '' OR (" +
        "LOWER(TRIM(s.firstName)) LIKE LOWER(CONCAT('%', TRIM(:supervisorName), '%')) " +
        "OR LOWER(TRIM(s.lastName)) LIKE LOWER(CONCAT('%', TRIM(:supervisorName), '%')) " +
        ")) " +
        "AND (:supervisorId IS NULL OR s.id = :supervisorId)")
        Page<User> findByRoleInstitutionSupervisorNameAndId(
                Role role,
                String institution,
                String supervisorName,
                Long supervisorId,
                Pageable pageable
        );



    //Page<User> findByRoleAndInstitution(Role role, String institution, Pageable pageable);

    @Query("SELECT u FROM User u " +
       "WHERE u.role = :role " +
       "AND u.institution = :institution " +
       "AND (:keyword IS NULL OR :keyword = '' OR (" +
       "LOWER(TRIM(u.firstName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%')) " +
       "OR LOWER(TRIM(u.lastName)) LIKE LOWER(CONCAT('%', TRIM(:keyword), '%'))" +
       "))")
        Page<User> searchByRoleInstitution(Role role,
                                        String institution,
                                        String keyword,
                                        Pageable pageable);



}



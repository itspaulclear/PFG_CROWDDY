package com.app.persistence.entity.repository;

import com.app.persistence.entity.UserEntity;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends CrudRepository<UserEntity, Long> {
    Optional<UserEntity> findUserEntityByUsername(String username);

    @Query("SELECT u FROM UserEntity u LEFT JOIN FETCH u.contacts")
    List<UserEntity> getUsers();

    @Modifying
    @Transactional
    @Query("DELETE FROM UserEntity u WHERE u.username = :username")
    void deleteUserEntityByUsername(@Param("username") String username);

}

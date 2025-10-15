package com.example.demo.repository;

import com.example.demo.entity.Glucose;
import com.example.demo.entity.GlucoseId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface GlucoseRepository extends JpaRepository<Glucose, GlucoseId> {
    List<Glucose> findByUserIdAndMeasuredAtAfterOrderByMeasuredAtAsc(String userId, LocalDateTime start);
}

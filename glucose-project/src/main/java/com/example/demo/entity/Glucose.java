package com.example.demo.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name = "glucose_level")
@IdClass(GlucoseId.class)
public class Glucose implements Serializable {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Id
    @Column(name = "measured_at")
    private LocalDateTime measuredAt;

    @Column(name = "glucose_value")
    private Integer glucoseValue;

    public Glucose() {}

    public Glucose(String userId, LocalDateTime measuredAt, Integer glucoseValue) {
        this.userId = userId;
        this.measuredAt = measuredAt;
        this.glucoseValue = glucoseValue;
    }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }

    public Integer getGlucoseValue() { return glucoseValue; }
    public void setGlucoseValue(Integer glucoseValue) { this.glucoseValue = glucoseValue; }
}

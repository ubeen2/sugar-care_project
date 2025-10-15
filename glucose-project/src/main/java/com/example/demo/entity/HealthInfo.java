package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "health_Info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class HealthInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "data_id")
    private Long dataId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "sugar")
    private int sugar;

    @Column(name = "exercise")
    private int exercise;

    private int stress;

    @Column(name = "sleep_hours")
    private int sleepHours;

    @Column(name = "is_drinking")
    private int isDrinking;

    @Column(name = "fatigue_level")
    private int fatigueLevel;

    @Column(name = "post_meal")
    private int postMeal;

    @Column(name = "weight_change_kg")
    private int weightChangeKg;

    @Column(name = "visit_dentist")
    private int visitDentist;

    @Column(name = "has_caries")
    private int hasCaries;

    private int fbs;

    @Column(name = "ldl_mg")
    private int ldlMg;

    @Column(name = "hdl_mg")
    private int hdlMg;

    @Column(name = "total_chol_mg")
    private int totalCholMg;

    @Column(name = "tg_mg")
    private int tgMg;

    @Column(name = "uric_acid_mg_dl")
    private int uricAcidMgDl;

    @Column(name = "hgb_g_dl")
    private int hgbGDl;

    @Column(name = "platelet_count")
    private int plateletCount;

    private int height=0;
    private int weight=0;

    @Column(name="risk_score")
    private int riskScore;

    @Column(name="risk_level")
    private String riskLevel;

}

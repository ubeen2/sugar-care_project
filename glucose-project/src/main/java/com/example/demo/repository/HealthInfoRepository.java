package com.example.demo.repository;

import com.example.demo.entity.HealthInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.beans.JavaBean;
import java.util.List;

public interface HealthInfoRepository extends JpaRepository<HealthInfo, Long> {
    List<HealthInfo> findTop7ByUserIdOrderByCreatedAtDesc   (String userId);


    // ✅ 1. 생활습관 통계
    @Query(value = """
        SELECT
            SUM(CASE WHEN exercise = 0 THEN 1 ELSE 0 END) AS exerciseNone,
            SUM(CASE WHEN exercise = 1 THEN 1 ELSE 0 END) AS exercise10min,
            SUM(CASE WHEN exercise = 2 THEN 1 ELSE 0 END) AS exercise30min,

            SUM(CASE WHEN sugar = 0 THEN 1 ELSE 0 END) AS sugarNone,
            SUM(CASE WHEN sugar = 1 THEN 1 ELSE 0 END) AS sugarSome,
            SUM(CASE WHEN sugar = 2 THEN 1 ELSE 0 END) AS sugarOften,

            SUM(CASE WHEN stress = 0 THEN 1 ELSE 0 END) AS stressLow,
            SUM(CASE WHEN stress = 1 THEN 1 ELSE 0 END) AS stressMid,
            SUM(CASE WHEN stress = 2 THEN 1 ELSE 0 END) AS stressHigh,

            SUM(CASE WHEN sleep_hours = 0 THEN 1 ELSE 0 END) AS sleepGood,
            SUM(CASE WHEN sleep_hours = 1 THEN 1 ELSE 0 END) AS sleepNormal,
            SUM(CASE WHEN sleep_hours = 2 THEN 1 ELSE 0 END) AS sleepBad,

            SUM(CASE WHEN is_drinking = 0 THEN 1 ELSE 0 END) AS drinkNone,
            SUM(CASE WHEN is_drinking = 1 THEN 1 ELSE 0 END) AS drinkSome,
            SUM(CASE WHEN is_drinking = 2 THEN 1 ELSE 0 END) AS drinkOften,

            SUM(CASE WHEN fatigue_level = 0 THEN 1 ELSE 0 END) AS fatigueNone,
            SUM(CASE WHEN fatigue_level = 1 THEN 1 ELSE 0 END) AS fatigueSome,
            SUM(CASE WHEN fatigue_level = 2 THEN 1 ELSE 0 END) AS fatigueHigh,

            SUM(CASE WHEN post_meal = 0 THEN 1 ELSE 0 END) AS postMealNone,
            SUM(CASE WHEN post_meal = 1 THEN 1 ELSE 0 END) AS postMealSome,
            SUM(CASE WHEN post_meal = 2 THEN 1 ELSE 0 END) AS postMealOften
        FROM health_Info
        WHERE user_id = :userId
        """, nativeQuery = true)
    Object getLifestyleSummaryRaw(@Param("userId") String userId);


    // ✅ 2. 최신 건강검진 1건
    @Query(value = "SELECT * FROM health_Info WHERE user_id = :userId ORDER BY created_at DESC LIMIT 1", nativeQuery = true)
    HealthInfo findLatestByUserId(@Param("userId") String userId);


    // ✅ 3. 리스크 통계
    @Query(value = """
        SELECT 
            AVG(risk_score) AS avgScore,
            SUM(CASE WHEN risk_level = '양호' THEN 1 ELSE 0 END) AS goodCount,
            SUM(CASE WHEN risk_level = '주의' THEN 1 ELSE 0 END) AS warningCount,
            SUM(CASE WHEN risk_level = '위험' THEN 1 ELSE 0 END) AS dangerCount
        FROM health_Info
        WHERE user_id = :userId
        """, nativeQuery = true)
    Object getRiskSummaryRaw(@Param("userId") String userId);
}

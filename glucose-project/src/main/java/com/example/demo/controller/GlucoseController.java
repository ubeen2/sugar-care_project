    package com.example.demo.controller;

    import com.example.demo.entity.Glucose;
    import com.example.demo.entity.HealthInfo;
    import com.example.demo.entity.LifeStyleSummary;
    import com.example.demo.entity.RiskSummary;
    import com.example.demo.repository.GlucoseRepository;
    import com.example.demo.repository.HealthInfoRepository;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.time.LocalDateTime;
    import java.util.*;
    import java.util.stream.Collectors;

    @RestController
    @RequestMapping("/bloodsugar")
    @CrossOrigin(origins = "http://localhost:3000")
    public class GlucoseController {

        private final GlucoseRepository glucoseRepository;
        private final HealthInfoRepository healthInfoRepository;

        public GlucoseController(GlucoseRepository glucoseRepository, HealthInfoRepository healthInfoRepository) {
            this.glucoseRepository = glucoseRepository;
            this.healthInfoRepository = healthInfoRepository;
        }

        @GetMapping("/recent")
        public ResponseEntity<?> getRecentBloodSugar(
                @RequestParam String userId,
                @RequestParam(defaultValue = "30") int days
        ) {
            LocalDateTime baseTime = LocalDateTime.of(2021, 8, 30, 11, 0, 0); // 테스트용
            LocalDateTime start = baseTime.minusDays(days);

            List<Glucose> records = glucoseRepository
                    .findByUserIdAndMeasuredAtAfterOrderByMeasuredAtAsc(userId, start);

            return ResponseEntity.ok(records);
        }

        @GetMapping("/summary")
        public ResponseEntity<?> getBloodSugarSummary(
                @RequestParam String userId,
                @RequestParam(defaultValue = "30") int days
        ) {
            LocalDateTime baseTime = LocalDateTime.of(2021, 8, 30, 11, 0, 0); // 테스트용
            LocalDateTime start = baseTime.minusDays(days);

            List<Glucose> list = glucoseRepository
                    .findByUserIdAndMeasuredAtAfterOrderByMeasuredAtAsc(userId, start);

            if (list.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                        "weeklyAvgBloodSugar", 0,
                        "breakfastAvg", 0,
                        "lunchAvg", 0,
                        "dinnerAvg", 0
                ));
            }

            double totalAvg = list.stream()
                    .filter(g -> g.getGlucoseValue() != null)
                    .collect(Collectors.averagingDouble(Glucose::getGlucoseValue));

            double breakfastAvg = avgByHourRange(list, 6, 10);
            double lunchAvg = avgByHourRange(list, 11, 15);
            double dinnerAvg = avgByHourRange(list, 17, 21);

            Map<String, Object> summary = new HashMap<>();
            summary.put("weeklyAvgBloodSugar", Math.round(totalAvg));
            summary.put("breakfastAvg", Math.round(breakfastAvg));
            summary.put("lunchAvg", Math.round(lunchAvg));
            summary.put("dinnerAvg", Math.round(dinnerAvg));

            return ResponseEntity.ok(summary);
        }

        @GetMapping("/selfTest/summary")
        public Map<String, Object> getSummary(@RequestParam String userId,
                                            @RequestParam(defaultValue = "30") int days) {
            Map<String, Object> result = new HashMap<>();

            // ✅ 1. 생활습관 요약
            Object[] lifeRaw = (Object[]) healthInfoRepository.getLifestyleSummaryRaw(userId);
            LifeStyleSummary lifestyle = new LifeStyleSummary(
                    ((Number) lifeRaw[0]).longValue(),
                    ((Number) lifeRaw[1]).longValue(),
                    ((Number) lifeRaw[2]).longValue(),
                    ((Number) lifeRaw[3]).longValue(),
                    ((Number) lifeRaw[4]).longValue(),
                    ((Number) lifeRaw[5]).longValue(),
                    ((Number) lifeRaw[6]).longValue(),
                    ((Number) lifeRaw[7]).longValue(),
                    ((Number) lifeRaw[8]).longValue(),
                    ((Number) lifeRaw[9]).longValue(),
                    ((Number) lifeRaw[10]).longValue(),
                    ((Number) lifeRaw[11]).longValue(),
                    ((Number) lifeRaw[12]).longValue(),
                    ((Number) lifeRaw[13]).longValue(),
                    ((Number) lifeRaw[14]).longValue(),
                    ((Number) lifeRaw[15]).longValue(),
                    ((Number) lifeRaw[16]).longValue(),
                    ((Number) lifeRaw[17]).longValue(),
                    ((Number) lifeRaw[18]).longValue(),
                    ((Number) lifeRaw[19]).longValue(),
                    ((Number) lifeRaw[20]).longValue()
            );

            // ✅ 2. 최신 건강검진
            HealthInfo latest = healthInfoRepository.findLatestByUserId(userId);

            // ✅ 3. 리스크 요약
            Object[] riskRaw = (Object[]) healthInfoRepository.getRiskSummaryRaw(userId);
            RiskSummary risk = new RiskSummary(
                    ((Number) riskRaw[0]).doubleValue(),
                    ((Number) riskRaw[1]).longValue(),
                    ((Number) riskRaw[2]).longValue(),
                    ((Number) riskRaw[3]).longValue()
            );

            result.put("lifestyle", lifestyle);
            result.put("latestCheckup", latest);
            result.put("risk", risk);

            return result;
        }

        @GetMapping("/weekly")
        public ResponseEntity<?> getWeeklyBloodSugar(
                @RequestParam String userId,
                @RequestParam(defaultValue = "30") int days
        ) {
            System.out.println("위클리 도착");
            LocalDateTime baseTime = LocalDateTime.of(2021, 8, 30, 11, 0, 0);
            LocalDateTime start = baseTime.minusDays(days);

            List<Glucose> list = glucoseRepository
                    .findByUserIdAndMeasuredAtAfterOrderByMeasuredAtAsc(userId, start);

            if (list.isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            // ✅ 주차별 그룹핑 (예: 1주차, 2주차 ...)
            Map<Integer, List<Glucose>> grouped = list.stream()
                    .filter(g -> g.getMeasuredAt() != null && g.getGlucoseValue() != null)
                    .collect(Collectors.groupingBy(g -> getWeekOfMonth(g.getMeasuredAt())));

            // ✅ 주차별 평균 계산
            List<Map<String, Object>> result = grouped.entrySet().stream()
                    .sorted(Map.Entry.comparingByKey())
                    .map(entry -> {
                        int week = entry.getKey();
                        List<Glucose> weekData = entry.getValue();

                        double breakfastAvg = avgByHourRange(weekData, 6, 10);
                        double lunchAvg = avgByHourRange(weekData, 11, 15);
                        double dinnerAvg = avgByHourRange(weekData, 17, 21);

                        double overallAvg = weekData.stream()
                                .collect(Collectors.averagingDouble(Glucose::getGlucoseValue));

                        Map<String, Object> map = new LinkedHashMap<>();
                        map.put("week", week + "주차");
                        map.put("breakfast", Math.round(breakfastAvg));
                        map.put("lunch", Math.round(lunchAvg));
                        map.put("dinner", Math.round(dinnerAvg));
                        map.put("average", Math.round(overallAvg));
                        return map;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(result);
        }

        // ✅ Helper 함수 (주차 계산)
        private int getWeekOfMonth(LocalDateTime dateTime) {
            if (dateTime == null) return 0; // ✅ null-safe 처리
            LocalDateTime first = dateTime.withDayOfMonth(1);
            int dayOfWeek = first.getDayOfWeek().getValue(); // 월(1)~일(7)
            return (int) Math.ceil((dateTime.getDayOfMonth() + dayOfWeek - 1) / 7.0);
        }

        private double avgByHourRange(List<Glucose> list, int startHour, int endHour) {
            return list.stream()
                    .filter(r -> r.getMeasuredAt() != null && r.getGlucoseValue() != null)
                    .filter(r -> {
                        int h = r.getMeasuredAt().getHour();
                        return h >= startHour && h < endHour;
                    })
                    .collect(Collectors.averagingDouble(Glucose::getGlucoseValue));
        }
    }

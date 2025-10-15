package com.example.demo.controller;

import com.example.demo.entity.HealthInfo;
import com.example.demo.repository.HealthInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/selfTest")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class SelfTestController {

    private final HealthInfoRepository healthInfoRepository;


    @PostMapping("/save")
    public ResponseEntity<?> saveSelfTest(@RequestBody HealthInfo record){
        try{
            record.setCreatedAt(LocalDateTime.now());
            healthInfoRepository.save(record);
            return ResponseEntity.ok("자가테스트 데이터 저장 완료 ✅");
        }catch(Exception e){
            e.printStackTrace();
            return ResponseEntity.status(500).body("저장 실패: " + e.getMessage());
        }
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(@RequestParam String userId,
                                     @RequestParam(required = false, defaultValue = "7") int days) {
        try {
            List<HealthInfo> logs = healthInfoRepository.findTop7ByUserIdOrderByCreatedAtDesc(userId);

            List<HealthInfo> sortedLogs = logs.stream()
                    .sorted(Comparator.comparing(HealthInfo::getCreatedAt))
                    .collect(Collectors.toList());

            List<Map<String, Object>> result = sortedLogs.stream().map(l -> {
                Map<String, Object> map = new LinkedHashMap<>();

                // ✅ 날짜 포맷: YYYY-MM-DD
                map.put("date", l.getCreatedAt().toLocalDate().toString());

                // 변환용 매핑
                String[] level3 = {"아니오", "10분 이상", "30분 이상"};
                String[] freq3 = {"안 먹음", "조금", "자주"};
                String[] stress3 = {"거의 없음", "조금", "많음"};
                String[] fatigue3 = {"아니오", "조금", "많이"};

                // 실제 점수 → 문자열 변환
                map.put("exercise", level3[Math.min(l.getExercise(), 2)]);
                map.put("sugar", freq3[Math.min(l.getSugar(), 2)]);
                map.put("stress", stress3[Math.min(l.getStress(), 2)]);
                map.put("fatigue", fatigue3[Math.min(l.getFatigueLevel(), 2)]);
                map.put("sleep", l.getSleepHours());

                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(result);


        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("데이터 조회 실패: " + e.getMessage());
        }
    }

}

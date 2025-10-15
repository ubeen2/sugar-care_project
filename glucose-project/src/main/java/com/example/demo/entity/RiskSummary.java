package com.example.demo.entity;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RiskSummary {
    private double avgScore;
    private long goodCount;
    private long warningCount;
    private long dangerCount;
}

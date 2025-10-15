package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LifeStyleSummary {
    private long exerciseNone;
    private long exercise10min;
    private long exercise30min;

    private long sugarNone;
    private long sugarSome;
    private long sugarOften;

    private long stressLow;
    private long stressMid;
    private long stressHigh;

    private long sleepGood;
    private long sleepNormal;
    private long sleepBad;

    private long drinkNone;
    private long drinkSome;
    private long drinkOften;

    private long fatigueNone;
    private long fatigueSome;
    private long fatigueHigh;

    private long postMealNone;
    private long postMealSome;
    private long postMealOften;
}

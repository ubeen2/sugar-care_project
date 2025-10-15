package com.example.demo.entity;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

public class GlucoseId implements Serializable {
    private String userId;
    private LocalDateTime measuredAt;

    public GlucoseId() {}

    public GlucoseId(String userId, LocalDateTime measuredAt) {
        this.userId = userId;
        this.measuredAt = measuredAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GlucoseId)) return false;
        GlucoseId that = (GlucoseId) o;
        return Objects.equals(userId, that.userId) &&
                Objects.equals(measuredAt, that.measuredAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, measuredAt);
    }
}

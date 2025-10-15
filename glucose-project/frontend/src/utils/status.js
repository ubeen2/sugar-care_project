
// src/utils/status.js
export function statusOf(glucose) {
    if (glucose < 100) return "정상";
    if (glucose < 140) return "경계";
    return "위험";
}

export function statusColor(status) {
    return {정상: "#16a34a", 경계: "#ca8a04"}[status] || "#dc2626";
}

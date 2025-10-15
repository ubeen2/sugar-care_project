// src/utils/monthGrid.js
export default function monthGrid(year, month) {
    const first = new Date(year, month - 1, 1);
    const startWeekday = first.getDay(); // 0:일
    const last = new Date(year, month, 0).getDate();
    const cells = [];
    let d = 1;
    for (let r = 0; r < 6; r++) {
        const row = [];
        for (let c = 0; c < 7; c++) {
            if (cells.length === 0 && c < startWeekday) row.push("");
            else if (d <= last) row.push(d++);
            else row.push("");
        }
        cells.push(row);
    }
    return cells;
}

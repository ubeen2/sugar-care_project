// src/theme.js
export const THEME_PRESETS = {
    스카이: {PRIMARY: "#38BDF8", PRIMARY2: "#7DD3FC", PRGBA: "56, 189, 248"},
    "연한 레드": {PRIMARY: "#F87171", PRIMARY2: "#FCA5A5", PRGBA: "248, 113, 113"},
    "진한 레드": {PRIMARY: "#EF4444", PRIMARY2: "#F87171", PRGBA: "239, 68, 68"},
    보라: {PRIMARY: "#A78BFA", PRIMARY2: "#C4B5FD", PRGBA: "167, 139, 250"},
    "딥 그린": {PRIMARY: "#166534", PRIMARY2: "#22C55E", PRGBA: "22, 101, 52"},
    틸: {PRIMARY: "#0D9488", PRIMARY2: "#14B8A6", PRGBA: "13, 148, 136"},
};

export const defaultState = {
    page: "홈",
    isLoggedIn: false,
    dark: false,
    big: false,
    entries: {},
    foods: [],
    profile: {
        name: "게스트",
        height: 0,
        weight: 0,
        waist: 0,
    },
};

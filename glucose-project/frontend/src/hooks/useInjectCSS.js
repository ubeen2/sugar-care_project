// src/hooks/useInjectCSS.js
import {useEffect} from "react";

export default function useInjectCSS({dark, big}) {
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--bg-light", dark ? "#0B1218" : "#f9fdfb");
        root.style.setProperty("--fg-light", dark ? "#E6E9EF" : "#092870");
        root.style.setProperty("--card-light", dark ? "#0F172A" : "#FFFFFF");
        root.style.setProperty("--border-light", dark ? "#243243" : "#D7E7E1");
        root.style.setProperty("--size-normal", big ? "23px" : "16px");
        // root.style.setProperty("--shadow-light", dark ? "0 10px 30px rgba(0,0,0,.35)" : "0 8px 24px rgba(0,0,0,.10)");
        // 💡 네비게이션 배경색
        root.style.setProperty("--nav-bg", dark ? "var(--nav-dark)" : "var(--nav-light)");

    }, [dark, big]);
}

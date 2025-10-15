import { useState, useEffect } from "react";
import { defaultState } from "../theme";  // defaultState 위치에 맞춰 수정

export default function useLocalState() {
    const [state, setState] = useState(() => {
        const raw = localStorage.getItem("odang-state");
        try {
            return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
        } catch (_) {
            return defaultState;
        }
    });

    useEffect(() => {
        localStorage.setItem("odang-state", JSON.stringify(state));
    }, [state]);

    return [state, setState];
}

// src/components/Segmented.jsx
export default function Segmented({value, onChange, options}) {
    return (
        <div style={{display: "inline-flex", gap: 8, margin: "8px 0"}}>
            {options.map((opt) => (
                <button
                    key={opt}
                    className={value === opt ? "primary" : ""}
                    onClick={() => onChange(opt)}
                >
                    {opt}
                </button>
            ))}
        </div>
    );
}

import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "./css/market.css";

const categories = [
    { name: "신선식품", query: "저당 신선식품", color: "#00B894" },
    { name: "냉동제품", query: "저당 냉동", color: "#2979FF" },
    { name: "소스류", query: "저당 소스", color: "#FB8C00" },
    { name: "레토르트", query: "저당 레토르트", color: "#8E24AA" },
    { name: "특가", query: "저당 할인", color: "#E53935" },
];

const USER_ID =
    localStorage.getItem("uid") ||
    (() => {
        const u = "u_" + Math.random().toString(36).slice(2, 10);
        localStorage.setItem("uid", u);
        return u;
    })();

function sendTrack(payload) {
    try {
        navigator.sendBeacon(
            "/api/track",
            new Blob([JSON.stringify(payload)], { type: "application/json" })
        );
    } catch {
        fetch("/api/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
    }
}

function CategoryCard({ cat }) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        async function fetchRecs() {
            const rec = await fetch(`/api/recommend?category=${encodeURIComponent(cat.name)}`)
                .then((r) => r.json())
                .catch(() => ({ items: [] }));

            let list = rec.items || [];

            if (list.length < 5) {
                const more = await fetch(`/api/products?q=${encodeURIComponent(cat.query)}&category=${encodeURIComponent(cat.name)}`)
                    .then((r) => r.json())
                    .catch(() => ({ items: [] }));

                const have = new Set(list.map((x) => x.item_id || x.link || x.productId));
                (more.items || []).forEach((m) => {
                    const iid = m.productId || m.link;
                    if (!have.has(iid)) {
                        list.push({
                            item_id: iid,
                            title: (m.title || "").replace(/<[^>]+>/g, ""),
                            link: m.link,
                            image: m.image,
                            lprice: m.lprice,
                            category: cat.name,
                        });
                    }
                });
            }
            setItems(list);
        }
        fetchRecs();
    }, [cat]);

    return (
        <div className="category-card">
            <div className="category-header-row">
                <div className="category-icon" style={{ backgroundColor: cat.color }}></div>
                <h3>{cat.name}</h3>
            </div>

            <div className="category-body">
                <Swiper
                    spaceBetween={12}
                    slidesPerView={1}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    modules={[Autoplay]}
                >
                    {items.length > 0 ? (
                        items.map((item, idx) => {
                            const price =
                                item.lprice && item.lprice !== "0"
                                    ? Number(item.lprice).toLocaleString() + "원"
                                    : "가격 정보 없음";
                            return (
                                <SwiperSlide key={idx}>
                                    <a
                                        href={item.link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="product-box"
                                        onClick={() =>
                                            sendTrack({
                                                user_id: USER_ID,
                                                item_id: item.item_id,
                                                event_type: "click",
                                                category: cat.name,
                                                slot_index: idx,
                                            })
                                        }
                                    >
                                        <img src={item.image} alt={item.title} />
                                    </a>
                                    <div className="info">
                                        <span className="item-title">{item.title}</span>
                                        <b className="item-price">{price}</b>
                                    </div>
                                </SwiperSlide>
                            );
                        })
                    ) : (
                        <div className="empty-box">상품 준비 중</div>
                    )}
                </Swiper>
            </div>
        </div>
    );
}

export default function FoodRecs() {
    return (
        <div className="market market-section">
            <div className="section-header">
                <div>
                    <h2 className="section-title">저당 식품 추천 🍱</h2>
                    <p className="section-subtitle">건강한 식단을 위한 맞춤 상품</p>
                </div>

                <a
                    href="/marketDetail"
                    className="more-link"
                >
                    더 보기 &gt;
                </a>
            </div>

            <div className="category-container">
                {categories.map((cat, i) => (
                    <CategoryCard key={i} cat={cat} />
                ))}
            </div>
        </div>
    );
}


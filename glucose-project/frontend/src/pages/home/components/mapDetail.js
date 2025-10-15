import React, {useEffect, useRef, useState} from "react";
import L from "leaflet";
import "./css/mapDetail.css";
import "leaflet/dist/leaflet.css";
import parkIcon from "../../../assets/icon/공원-1.png";
import hospitalIcon from "../../../assets/icon/병원.png";
import gymIcon from "../../../assets/icon/헬스장.png";
import clinicIcon from "../../../assets/icon/내과.png";

export default function MapDetail({state, setState}) {
    const mapRef = useRef(null);
    const meMarkerRef = useRef(null);
    const placeLayerRef = useRef(null);

    const [coord, setCoord] = useState(""); // 입력창
    const [category, setCategory] = useState("전체");
    const [sort, setSort] = useState("accuracy");
    const [radius, setRadius] = useState(3);
    const [places, setPlaces] = useState([]); // 카드용 데이터

    // const ICONS = {
    //     "헬스장": "https://raw.githubusercontent.com/seonghuyn/icon_list/master/weightlifter.png",
    //     "공원": "https://github.com/seonghuyn/icon_list/blob/master/park%20(1).png?raw=true",
    //     "내과": "https://raw.githubusercontent.com/seonghuyn/icon_list/master/stethoscope1.png",
    //     "종합병원": "https://raw.githubusercontent.com/seonghuyn/icon_list/master/hospital.png",
    //     "내분비내과": "https://img.icons8.com/ios/50/pills.png"
    // };
    const ICONS = {
        "공원": parkIcon,
        "종합병원": hospitalIcon,
        "헬스장": gymIcon,
        "내과": clinicIcon,
    };
    //<a href="https://www.flaticon.com/kr/free-icons/" title="박사님 아이콘">박사님 아이콘 제작자: juicy_fish - Flaticon</a>
    <a href="https://www.flaticon.com/kr/free-icons/" title="박사님 아이콘">박사님 아이콘 제작자: juicy_fish - Flaticon</a>
    // 지도 초기화
    useEffect(() => {
        const map = L.map("map").setView([37.5665, 126.9780], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
            maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;
        placeLayerRef.current = L.layerGroup().addTo(map);

        // 안전 invalidateSize
        setTimeout(() => {
            map.invalidateSize();
        }, 300);

        const handleResize = () => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        };
        window.addEventListener("resize", handleResize);

        getMyLocation(true);

        return () => {
            window.removeEventListener("resize", handleResize);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // === 유틸 ===
    const defaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [30, 50],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    function setMeMarker(lat, lon) {
        if (meMarkerRef.current) mapRef.current.removeLayer(meMarkerRef.current);
        meMarkerRef.current = L.marker([lat, lon], {icon: defaultIcon})
            .addTo(mapRef.current)
            .bindPopup("<b>내 위치</b>")
            .openPopup();
        mapRef.current.setView([lat, lon], 14);
    }

    // === API ===
    async function geocode(q) {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        //const res = await fetch(`http://localhost:8080/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        console.log("geocode" + data);
        if (!data.ok) throw new Error(data.error || "geocode failed");
        return {lat: data.lat, lon: data.lon};
    }

    async function searchAround(lat, lon) {
        const url = `/api/search?lat=${lat}&lon=${lon}&category=${encodeURIComponent(
            //const url = `http://localhost:8080/api/search?lat=${lat}&lon=${lon}&category=${encodeURIComponent(
            category
        )}&sort=${sort}&radius_km=${radius}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!data.ok) {
            alert("검색 실패");
            return;
        }

        setPlaces(data.places); // 카드 렌더링은 state로
        placeLayerRef.current.clearLayers();

        for (const p of data.places) {
            const rating =
                typeof p["평점"] === "number" ? p["평점"].toFixed(1) : "정보 없음";
            const popupHtml = `
        <b>${p["이름"]}</b><br>
        카테고리: ${p["카테고리"]}<br>
        주소: ${p["주소"] || "-"}<br>
        전화: ${p["전화번호"] || "-"}<br>
        ⭐ 평점: ${rating}<br>
        <a href="${p["링크"]}" target="_blank" rel="noopener">카카오맵에서 보기</a>
      `;
            // ✅ 카테고리에 맞는 아이콘 선택
            const iconUrl = ICONS[p["카테고리"]];
            const icon = iconUrl
                ? L.icon({iconUrl, iconSize: [32, 32], iconAnchor: [16, 32]})
                : defaultIcon;

            // ✅ 마커 생성
            L.marker([p["위도"], p["경도"]], {icon})
                .addTo(placeLayerRef.current)
                .bindPopup(popupHtml);
        }
    }

    function getMyLocation(focus) {
        if (!navigator.geolocation) {
            alert("브라우저가 위치정보를 지원하지 않습니다.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = +pos.coords.latitude.toFixed(6);
                const lon = +pos.coords.longitude.toFixed(6);
                setCoord(`(${lat},${lon})`);
                if (focus) setMeMarker(lat, lon);
                searchAround(lat, lon);
            },
            (err) => alert("위치 정보를 가져올 수 없습니다: " + err.message)
        );
    }

    // === 이벤트 핸들러 ===
    const handleSearch = async () => {
        let lat, lon;
        if (coord.startsWith("(") && coord.includes(",")) {
            try {
                const [a, b] = coord.replace(/[()]/g, "").split(",");
                lat = parseFloat(a);
                lon = parseFloat(b);
            } catch (e) {
                alert("좌표 형식 오류");
                return;
            }
        } else {
            try {
                const p = await geocode(coord);
                lat = p.lat;
                lon = p.lon;
            } catch (e) {
                console.log("[handleSearch] Error" + e);
                alert("주소 변환 실패");
                return;
            }
        }
        setMeMarker(lat, lon);
        searchAround(lat, lon);
    };

    return (
        <div className="wrap">
            <div id="map"></div>

            <div className="side p-">
                {/* 🔹 내 위치 텍스트 (우측 상단) */}
                <div className="d-flex justify-content-start mb-1">
                <span
                    className="text-primary fw-semibold"
                    style={{cursor: "pointer"}}
                    onClick={() => getMyLocation(true)}
                >
                  📍 내 위치
                </span>
                </div>

                {/* 🔹 1행: 카테고리 / 정렬기준 / 검색 */}
                <div className="row g-2 align-items-center mb-2">
                    <div className="col-md-4 col-12">
                        <select
                            className="form-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="전체">전체</option>
                            <option value="헬스장">헬스장</option>
                            <option value="공원">공원</option>
                            <option value="내과">내과</option>
                            <option value="종합병원">종합병원</option>
                            <option value="내분비내과">내분비내과</option>
                        </select>
                    </div>

                    <div className="col-md-4 col-12">
                        <select
                            className="form-select"
                            value={sort}
                            onChange={(e) => setSort(e.target.value)}
                        >
                            <option value="accuracy">정확도순</option>
                            <option value="distance">가까운순</option>
                            <option value="rating">평점순</option>
                        </select>
                    </div>

                    <div className="col-md-4 col-12 d-flex align-items-stretch">
                        {sort === "distance" && (
                            <input
                                type="number"
                                className="form-control me-2"
                                value={radius}
                                min={1}
                                max={20}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                style={{width: "80px"}}
                                placeholder="km"
                            />
                        )}
                        <button className="btn btn-outline-success btn-map  w-100 h-100" onClick={handleSearch}>
                            검색
                        </button>
                    </div>
                </div>

                {/* 🔹 2행: 주소 입력 / 주소로 검색 */}
                <div className="row g-2 mb-3">
                    <div className="col-8">
                        <input
                            type="text"
                            className="form-control"
                            // value={coord}
                            onChange={(e) => setCoord(e.target.value)}
                            placeholder="주소를 입력해주세요"
                        />
                    </div>
                    <div className="col-4">
                        <button className="btn btn-outline-success btn-map w-100 h-100" onClick={handleSearch}>
                            검색
                        </button>
                    </div>
                </div>

                {/* 🔹 결과 카드 */}
                <div className="cards-map">
                    {places.length === 0 ? (
                        <div className="text-muted text-center py-3">표시할 결과가 없습니다.</div>
                    ) : (
                        places.map((p, idx) => (
                            <div key={idx} className="card-map mb-2 shadow-sm">
                                {p["대표이미지"] && (
                                    <img
                                        src={p["대표이미지"]}
                                        className="card-img-top"
                                        alt={p["이름"]}
                                        style={{objectFit: "cover", height: "140px"}}
                                    />
                                )}
                                <div className="card-map-body">
                                    <span className="badge bg-secondary mb-2">{p["카테고리"]}</span>
                                    <h6 className="fw-semibold mb-1">{p["이름"]}</h6>
                                    <p className="text-muted mb-1">
                                        ⭐ {typeof p["평점"] === "number" ? p["평점"].toFixed(1) : "정보 없음"}
                                    </p>
                                    <p className="text-muted small mb-2">{p["주소"] || ""}</p>
                                    <a
                                        href={p["링크"]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-decoration-none small text-primary"
                                    >
                                        카카오맵에서 보기 →
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );

}
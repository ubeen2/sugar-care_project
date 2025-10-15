import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import mapUrl from "../../../utils/mapUrl";
import {statusOf} from "../../../utils/status";

export default function Map({state, setState}){
    const todayBlood = 132;

    // const cities = [
    //     ["서울", 37.5665, 126.978],
    //     ["부산", 35.1796, 129.0756],
    //     ["대구", 35.8714, 128.6014],
    //     ["인천", 37.4563, 126.7052],
    // ];
    return (
        <div className="card">
            <div className="title">운동 장소 지도</div>
            {/*<div style={{display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8}}>*/}
            {/*    {cities.map(([n, la, lo]) => (*/}
            {/*        <button key={n} onClick={() => setState((s) => ({...s, city: n, coords: {lat: la, lon: lo}}))}>*/}
            {/*            {n}*/}
            {/*        </button>*/}
            {/*    ))}*/}
            {/*</div>*/}
            {/*<div className="muted" style={{marginTop: 6}}>현재 선택: {state.city}</div>*/}
            <iframe
                src={mapUrl(state.coords.lat, state.coords.lon)}
                style={{width: "100%", height: 180, border: 0, borderRadius: 10}}
                title="map"
            />
        </div>
    )
}
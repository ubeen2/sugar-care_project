# app.py
import os, re, time, math, threading
from dotenv import load_dotenv ## 추가
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

# ====== Selenium ======
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi import APIRouter
from dotenv import load_dotenv

router = APIRouter()

KAKAO_API_KEY = os.getenv('KAKAO_API_KEY')
NAVER_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
NAVER_CLIENT_SECRET = os.getenv('NAVER_CLIENT_SECRET')

# ====== 네이버 이미지 ======
def _normalize(s: str) -> str:
    if not isinstance(s, str): return ""
    return re.sub(r"[\s\-_|\(\)\[\]{}·•∙,.;:!?'\"<>@#%^&*+=/\\ ]", "", s.lower())

def _extract_region_token(addr_text: str) -> str:
    if not isinstance(addr_text, str): return ""
    toks = [t for t in addr_text.split() if t]
    for suf in ("동","구","읍","면"):
        cand = [t for t in toks if t.endswith(suf)]
        if cand: return cand[0]
    return ""

def _is_good_ext(link: str) -> bool:
    if not isinstance(link, str): return False
    base = link.lower().split("?")[0]
    return base.endswith((".jpg",".jpeg",".png",".webp")) or link.startswith("http")

def _score_naver_item(item, name_norm: str, region_norm: str) -> int:
    title = (item.get("title") or ""); link  = (item.get("link") or "")
    w = int(item.get("sizewidth", 0) or 0); h = int(item.get("sizeheight", 0) or 0)
    if not link.startswith("http") or not _is_good_ext(link): return -999
    low_title, low_link = title.lower(), link.lower()
    bad = ("치킨","맛집","식당","카페","메뉴","배달","분식","술집","맥주",
           "dessert","bread","recipe","food","mangoplate","siksin","coupon","banner","ad")
    if any(b in low_title or b in low_link for b in bad): return -999
    score = 0
    t_norm = _normalize(title); l_norm = _normalize(link)
    if name_norm and (name_norm in t_norm or name_norm in l_norm): score += 3
    if region_norm and (region_norm in t_norm or region_norm in l_norm): score += 2
    if w >= 400 and h >= 300: score += 1
    return score

def get_naver_image(place_name: str, addr_text: str):
    region = _extract_region_token(addr_text)
    positive = "헬스장 체육관 실내 gym fitness 시설 내부"
    negative = "-치킨 -맛집 -식당 -카페 -메뉴 -배달 -분식 -술집 -맥주 -dessert -bread -recipe -food -mangoplate -siksin -coupon -banner -ad"
    base_query = f"{region} {place_name}".strip() if region else f"{place_name} {addr_text}".strip()

    def _search_once(q: str):
        url = "https://openapi.naver.com/v1/search/image"
        headers = {"X-Naver-Client-Id": NAVER_CLIENT_ID, "X-Naver-Client-Secret": NAVER_CLIENT_SECRET}
        params = {"query": q, "display": 10, "sort": "sim"}
        try:
            r = requests.get(url, headers=headers, params=params, timeout=8)
            r.raise_for_status()
            items = r.json().get("items", []) or []
            if not items: return None
            best, best_score = None, -999
            name_norm = _normalize(place_name); region_norm = _normalize(region)
            for it in items:
                sc = _score_naver_item(it, name_norm, region_norm)
                if sc > best_score: best, best_score = it, sc
            if best and best_score >= 2: return best.get("link")
        except:
            return None
        return None

    return _search_once(f"{base_query} {positive} {negative}") \
        or _search_once(f"{place_name} {positive}")

# ====== Kakao: 지오코딩/키워드 ======
def kakao_geocode(address: str):
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    # 주소
    try:
        url = "https://dapi.kakao.com/v2/local/search/address.json"
        r = requests.get(url, headers=headers, params={"query": address}, timeout=7).json()
        docs = r.get("documents") or []
        if docs:
            y, x = float(docs[0]["y"]), float(docs[0]["x"])
            return {"lat": y, "lon": x, "type": "address"}
    except: pass
    # 키워드
    try:
        url = "https://dapi.kakao.com/v2/local/search/keyword.json"
        r = requests.get(url, headers=headers, params={"query": address, "size": 1}, timeout=7).json()
        docs = r.get("documents") or []
        if docs:
            y, x = float(docs[0]["y"]), float(docs[0]["x"])
            return {"lat": y, "lon": x, "type": "keyword"}
    except: pass
    return None

def kakao_places(lat: float, lon: float, category: str, radius: int, sort: str):
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {
        "query": category,
        "x": lon, "y": lat,
        "radius": radius,   # 10 ~ 20000
        "size": 15,
        "sort": "distance" if sort == "distance" else "accuracy",
    }
    try:
        r = requests.get(url, headers=headers, params=params, timeout=7)
        return r.json().get("documents", [])
    except:
        return []

# ====== Selenium 드라이버 풀 ======
class DriverPool:
    def __init__(self, size=2):
        self._size = size
        self._lock = threading.Lock()
        self._drivers = []
        for _ in range(size):
            self._drivers.append(self._create())

    def _create(self):
        options = webdriver.ChromeOptions()
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--window-size=1280,2000")
        options.add_argument("--blink-settings=imagesEnabled=false")
        options.add_argument("user-agent=Mozilla/5.0")
        return webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    def acquire(self):
        with self._lock:
            return self._drivers.pop() if self._drivers else self._create()

    def release(self, drv):
        with self._lock:
            if len(self._drivers) < self._size:
                self._drivers.append(drv)
            else:
                try: drv.quit()
                except: pass

    def close_all(self):
        with self._lock:
            while self._drivers:
                drv = self._drivers.pop()
                try: drv.quit()
                except: pass

driver_pool = DriverPool(size=2)

RATING_SELECTORS = [
    "span.num_star", "span.txt_score", "em.num_rate", "strong.score_num",
    ".place_detail .evaluation .num", ".grade_star .num", "span.score_num", ".rating .num"
]

def scrape_rating(place_url: str, timeout=8):
    """Selenium으로 카카오 장소 페이지에서 평점 숫자만 추출"""
    drv = driver_pool.acquire()
    rating = None
    try:
        drv.get(place_url)
        WebDriverWait(drv, timeout).until(lambda d: d.execute_script("return document.readyState") == "complete")
        try: drv.execute_script("window.scrollTo(0, 400);")
        except: pass
        for sel in RATING_SELECTORS:
            try:
                elem = WebDriverWait(drv, 4).until(EC.presence_of_element_located((By.CSS_SELECTOR, sel)))
                txt = (elem.text or "").strip()
                m = re.search(r'(\d+(?:\.\d+)?)', txt)
                if m:
                    rating = float(m.group(1)); break
            except: continue
    except:
        rating = None
    finally:
        driver_pool.release(drv)
    return rating

# ====== 평점 캐시 (메모리) ======
# key: place_url, value: (rating_float_or_None, expire_at)
RATING_CACHE = {}
CACHE_TTL = timedelta(hours=6)
CACHE_LOCK = threading.Lock()

def get_rating_cached(place_url: str):
    now = datetime.utcnow()
    with CACHE_LOCK:
        v = RATING_CACHE.get(place_url)
        if v and v[1] > now:
            return v[0]
    rating = scrape_rating(place_url)
    with CACHE_LOCK:
        RATING_CACHE[place_url] = (rating, now + CACHE_TTL)
    return rating

# @router.get("/")
# def root():
#     return FileResponse("static/index.html")
@router.get("/api/geocode")
def api_geocode(q: str = Query(...)):
    try:
        print("api_geocode")
        q = q.strip()
        if not q:
            return JSONResponse({"ok": False, "error": "missing q"}, status_code=400)

        if q.startswith("(") and "," in q:
            try:
                a, b = q.strip("() ").split(",")
                return {"ok": True, "lat": float(a), "lon": float(b), "via": "coords"}
            except Exception:
                return JSONResponse({"ok": False, "error": "invalid coords"}, status_code=400)

        res = kakao_geocode(q)
        if not res:
            return JSONResponse({"ok": False, "error": "geocode failed"}, status_code=404)

        return {"ok": True, "lat": res["lat"], "lon": res["lon"], "via": res["type"]}
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)


@router.get("/api/search")
def api_search(
    lat: float,
    lon: float,
    category: str = "전체",
    sort: str = "accuracy",
    radius_km: int = 3
):
    try:
        print("search")
        radius = max(10, min(20000, radius_km * 1000))
        categories = ["헬스장", "공원", "내과", "종합병원", "내분비내과"] if category == "전체" else [category]

        # (1) 카카오 검색 + 대표이미지
        places = []
        for cat in categories:
            docs = kakao_places(lat, lon, cat, radius, sort)
            for p in docs:
                pid = p.get("id")
                name = p.get("place_name")
                addr = p.get("road_address_name") or p.get("address_name")
                y, x = float(p.get("y")), float(p.get("x"))
                link = f"https://place.map.kakao.com/{pid}" if pid else (p.get("place_url") or "")
                img = get_naver_image(name, addr) or ""
                places.append({
                    "id": pid,
                    "이름": name,
                    "카테고리": cat,
                    "주소": addr,
                    "위도": y,
                    "경도": x,
                    "전화번호": p.get("phone") or "",
                    "링크": link,
                    "대표이미지": img,
                    "평점": None
                })

        # (2) 평점 병렬 수집
        MAX_SCRAPE = 30
        targets = [pl for pl in places if pl["링크"]][:MAX_SCRAPE]

        with ThreadPoolExecutor(max_workers=4) as ex:
            future_map = {ex.submit(get_rating_cached, pl["링크"]): pl for pl in targets}
            for fut in as_completed(future_map):
                pl = future_map[fut]
                try:
                    pl["평점"] = fut.result()
                except Exception:
                    pl["평점"] = None

        # (3) 정렬 옵션
        if sort == "rating":
            places.sort(key=lambda r: (-(r["평점"] if isinstance(r["평점"], (int, float)) else -1)))

        return {"ok": True, "count": len(places), "places": places}
    except Exception as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=500)
@router.on_event("shutdown")
def shutdown_event():
    try:
        driver_pool.close_all()
    except:
        pass
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
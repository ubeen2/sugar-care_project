import os, re, math
from datetime import datetime
import requests
from collections import defaultdict
from fastapi import APIRouter, Query
from pydantic import BaseModel
from dotenv import load_dotenv
router = APIRouter()

# ───────────────────────────────
# 환경설정 (키는 환경변수 권장)
# ───────────────────────────────
CLIENT_ID = os.getenv('NAVER_SHOPPING_CLIENT_ID')
CLIENT_SECRET = os.getenv('NAVER_SHOPPING_CLIENT_SECRET')
# ───────────────────────────────
# 개인화/벡터 유틸
# ───────────────────────────────
EVENTS = []   # view/click 로그 (데모: 메모리)
ITEM_VECTORS = {}  # item_id -> {token: weight}
USER_VECTORS = defaultdict(lambda: defaultdict(float))  # user_id -> token weight
ITEM_META = {}  # item_id -> meta

TOKEN_RE = re.compile(r"[가-힣a-zA-Z0-9]+")

def tokenize(text: str):
    return [t.lower() for t in TOKEN_RE.findall(text or "") if len(t) > 1]

def build_item_vector(title: str, category: str = ""):
    toks = tokenize((title or "") + " " + (category or ""))
    vec = defaultdict(float)
    for t in toks:
        vec[t] += 1.0
    norm = math.sqrt(sum(v*v for v in vec.values())) or 1.0
    return {k: v/norm for k, v in vec.items()}

def cosine(a: dict, b: dict):
    if not a or not b: return 0.0
    if len(a) > len(b): a, b = b, a
    return sum(w * b.get(t, 0.0) for t, w in a.items())

def update_user_vector(user_id: str, item_id: str, weight: float):
    ivec = ITEM_VECTORS.get(item_id, {})
    if not ivec: return
    for t, w in ivec.items():
        USER_VECTORS[user_id][t] += weight * w
    norm = math.sqrt(sum(v*v for v in USER_VECTORS[user_id].values())) or 1.0
    for t in list(USER_VECTORS[user_id].keys()):
        USER_VECTORS[user_id][t] /= norm

# ───────────────────────────────
# 저당 키워드/필터
# ───────────────────────────────
POSITIVE = ["저당","무설탕","무가당","당줄인","당저감","로우슈가","로슈가","슈가프리","당함량낮음","당감소",
            "알룰로스","에리스리톨","스테비아","수크랄로스","자일리톨"]

NEGATIVE = ["냉장고","냉동고","업소용","쇼케이스","제빙기","김치냉장고","스탠드형","가전","가전제품",
            "전자레인지","에어프라이어","압력밥솥","쿠커","믹서기","블렌더","전기레인지","인덕션",
            "포장","봉투","택배봉투","지퍼백","비닐","롤백","HDPE","OPP","랩","용기","뚜껑","컵","접시",
            "도시락용기","락앤락","일회용","수저","젓가락","빨대",
            "케이블","케이스","액정","보호필름","충전기","마우스","키보드","원피스","후드","의류","가방",
            "스티커","장난감","피규어","레고","프라모델","도서","소설","교재","강의",
            "차량용","카매트","타이어","공구","드릴","스크류",
            "강아지","고양이","펫","사료","간식(반려)"]

CATEGORY_SEEDS = {
    "신선식품": ["요거트","그릭","두유","우유","두부","닭가슴살","샐러드","치즈","과일","채소","빵"],
    "냉동제품": ["냉동식품","냉동볶음밥","냉동만두","냉동피자","아이스크림","젤라또","냉동과일","닭가슴살"],
    "소스류":   ["소스","드레싱","시럽","스프레드","케첩","마요네즈","잼","소이소스"],
    "레토르트": ["레토르트","즉석","밀키트","HMR","컵밥","죽","수프","즉석국","즉석카레"],
    "특가":     []
}

def clean_title(t: str) -> str:
    t = re.sub(r"<[^>]+>", "", t or "")
    t = t.replace("&nbsp;"," ").strip()
    return t

def has_positive(title: str) -> bool:
    return any(k in title for k in POSITIVE)

def has_negative(title: str) -> bool:
    return any(k in title for k in NEGATIVE)

def naver_shop(query: str, display: int = 20):
    url = "https://openapi.naver.com/v1/search/shop.json"
    headers = {"X-Naver-Client-Id": CLIENT_ID, "X-Naver-Client-Secret": CLIENT_SECRET}
    params = {"query": query, "display": display}
    r = requests.get(url, headers=headers, params=params, timeout=6)
    r.raise_for_status()
    return r.json()

def gather_candidates(category: str, fallback: str, display_each: int = 20, need: int = 60):
    seeds = CATEGORY_SEEDS.get(category, []) or [fallback or "저당식품"]
    q_terms = []
    for s in seeds[:4]:
        for p in POSITIVE[:6]:
            q_terms.append(f"{s} {p}")
    q_terms += POSITIVE[:6]

    seen, ordered = set(), []
    for q in q_terms:
        if q not in seen:
            ordered.append(q); seen.add(q)

    items, ids = [], set()
    for q in ordered:
        try:
            data = naver_shop(q, display=display_each)
            for it in data.get("items", []):
                iid = it.get("productId") or it.get("link")
                if iid in ids: continue
                ids.add(iid)
                items.append(it)
                if len(items) >= need:
                    return items
        except Exception:
            continue
    return items

def filter_items(items, category: str):
    seeds = set(CATEGORY_SEEDS.get(category, []))
    out = []
    fallback = []  # 👈 seed만 맞는 애들 저장

    for it in items:
        title = clean_title(it.get("title",""))
        if has_negative(title):
            continue

        pos_hits  = sum(1 for k in POSITIVE if k in title)
        seed_hits = sum(1 for k in seeds if k in title)

        if pos_hits == 0 and seed_hits == 0:
            continue  # 전혀 관련 없는 건 제외

        # fallback 후보: seed만 맞고 저당 키워드 없음
        if pos_hits == 0 and seed_hits > 0:
            fallback.append(it)

        score = pos_hits + 0.5*seed_hits
        it["_filter_score"] = score
        it["title"] = title
        out.append(it)

    out.sort(key=lambda x: x.get("_filter_score", 0), reverse=True)

    # 👇 결과가 부족하면 seed fallback에서 채우기
    if len(out) < 5 and fallback:
        needed = 5 - len(out)
        out.extend(fallback[:needed])

    # 👇 그래도 없으면 그냥 원본에서 일부라도
    if not out:
        return items[:8]

    return out

# ───────────────────────────────
# 라우팅 (FastAPI)
# ───────────────────────────────

@router.get("/api/products")
def api_products(
        q: str = Query("저당식품"),
        category: str = Query("", description="카테고리명 (신선식품, 냉동제품, 소스류, 레토르트, 특가)")
):
    print(f"[api_products] q={q}, category={category}")
    cand = gather_candidates(category=category, fallback=q, display_each=20, need=80)
    items = filter_items(cand, category=category)
    return {"items": items[:8]}

class TrackEvent(BaseModel):
    user_id: str
    item_id: str
    event_type: str

@router.post("/api/track")
def api_track(event: TrackEvent):
    data = event.dict()
    data["ts"] = datetime.utcnow().isoformat()
    EVENTS.append(data)
    uid = data.get("user_id", "anon")
    iid = data.get("item_id")
    et  = data.get("event_type")
    if iid:
        update_user_vector(uid, iid, 1.0 if et == "click" else 0.3 if et == "view" else 0.0)
    return {"ok": True}

@router.get("/api/recommend")
def api_recommend(user_id: str = "anon", category: str = "", limit: int = 10):
    seed = category if category else "저당식품"
    cand = gather_candidates(category, fallback=seed, display_each=20, need=max(80, limit*6))
    items = filter_items(cand, category=category)

    for it in items:
        iid = it.get("productId") or it.get("link")
        title = it.get("title","")
        ITEM_META[iid] = {
            "item_id": iid, "title": title, "link": it.get("link"),
            "image": it.get("image"), "lprice": it.get("lprice"), "category": category,
        }
        if iid not in ITEM_VECTORS:
            ITEM_VECTORS[iid] = build_item_vector(title, category)

    uvec = USER_VECTORS[user_id]
    seen = {e.get("item_id") for e in EVENTS if e.get("user_id")==user_id}

    def price_int(iid: str) -> int:
        try: return int((ITEM_META[iid].get("lprice") or "0").replace(",", ""))
        except Exception: return 0

    def price_fit(iid: str) -> float:
        p = price_int(iid)
        if p <= 0: return 0.0
        recent = [price_int(e.get("item_id","")) for e in EVENTS
                  if e.get("user_id")==user_id and e.get("event_type")=="click"]
        recent = [x for x in recent if x>0][-20:]
        if not recent: return 0.0
        mu = sum(recent)/len(recent)
        sigma = (sum((x-mu)**2 for x in recent)/len(recent))**0.5 or 1.0
        z = abs(p - mu)/sigma
        return max(0.0, 1.5 - z)

    scored = []
    for it in items:
        iid = it.get("productId") or it.get("link")
        c_sim = cosine(uvec, ITEM_VECTORS.get(iid, {}))
        nov   = 0.2 if iid in seen else 1.0
        s = 0.85*c_sim + 0.15*price_fit(iid) + 0.05*nov
        if category == "특가":
            p = price_int(iid)
            s += 0.0003 * min(100000, max(0, 100000 - p))
        scored.append((float(s), iid))

    lambda_ = 0.7
    selected = []
    pool = sorted(scored, key=lambda x: x[0], reverse=True)

    def item_sim(a, b):
        return cosine(ITEM_VECTORS.get(a, {}), ITEM_VECTORS.get(b, {}))

    while pool and len(selected) < limit:
        if not selected:
            selected.append(pool.pop(0)); continue
        best_idx, best_val = 0, -1e9
        for idx, (score, iid) in enumerate(pool[:50]):
            max_sim = 0.0
            for _, sid in selected:
                max_sim = max(max_sim, item_sim(iid, sid))
            val = lambda_ * score - (1 - lambda_) * max_sim
            if val > best_val:
                best_val, best_idx = val, idx
        selected.append(pool.pop(best_idx))

    out = [{**ITEM_META[iid], "score": round(s,4)} for s, iid in selected]
    print(f"[DEBUG] gathered={len(cand)} filtered={len(items)} category='{category}' user='{user_id}'")
    return {"items": out[:limit]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
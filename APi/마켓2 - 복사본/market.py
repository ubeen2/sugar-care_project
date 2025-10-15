# app.py  (Flask · 저당식품 개인화 + 모아검색 + 필터 + MMR 다양성)
from flask import Flask, request, jsonify, send_from_directory
import requests, os, re, math
from collections import defaultdict
from datetime import datetime

app = Flask(__name__, static_folder="static")

# ───────────────────────────────────────────────────────────────────
# 0) 환경설정 (키는 환경변수 권장)
#    PowerShell:  $env:NAVER_CLIENT_ID="..." ; $env:NAVER_CLIENT_SECRET="..."
#    mac/Linux :  export NAVER_CLIENT_ID=... ; export NAVER_CLIENT_SECRET=...
# ───────────────────────────────────────────────────────────────────
CLIENT_ID = os.getenv("NAVER_CLIENT_ID", "")
CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET", "")

# ───────────────────────────────────────────────────────────────────
# 1) 개인화/벡터 유틸
# ───────────────────────────────────────────────────────────────────
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

# ───────────────────────────────────────────────────────────────────
# 2) 저당 전용 키워드/필터
# ───────────────────────────────────────────────────────────────────
POSITIVE = [
    "저당","무설탕","무가당","당줄인","당저감","로우슈가","로슈가","슈가프리","당함량낮음","당감소",
    # 감미료/대체당(실제 쇼핑 타이틀 자주 등장)
    "알룰로스","에리스리톨","스테비아","수크랄로스","자일리톨"
]

# 비식품/가전/포장 등 강제 제외
NEGATIVE = [
    # 가전/주방기기
    "냉장고","냉동고","업소용","쇼케이스","제빙기","김치냉장고","스탠드형","가전","가전제품",
    "전자레인지","에어프라이어","압력밥솥","쿠커","믹서기","블렌더","전기레인지","인덕션",
    # 포장/소모품
    "포장","봉투","택배봉투","지퍼백","비닐","롤백","HDPE","OPP","랩","용기","뚜껑","컵","접시",
    "도시락용기","락앤락","일회용","수저","젓가락","빨대",
    # 의류/잡화/문구/완구/차량/공구
    "케이블","케이스","액정","보호필름","충전기","마우스","키보드","원피스","후드","의류","가방",
    "스티커","장난감","피규어","레고","프라모델","도서","소설","교재","강의",
    "차량용","카매트","타이어","공구","드릴","스크류",
    # 반려/사료
    "강아지","고양이","펫","사료","간식(반려)"
]

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

# ── (핵심) 단순 쿼리를 여러 번 호출해서 후보를 많이 모음 ──
def naver_shop(query: str, display: int = 20):
    url = "https://openapi.naver.com/v1/search/shop.json"
    headers = {"X-Naver-Client-Id": CLIENT_ID, "X-Naver-Client-Secret": CLIENT_SECRET}
    params = {"query": query, "display": display}
    r = requests.get(url, headers=headers, params=params, timeout=6)
    r.raise_for_status()
    return r.json()

def gather_candidates(category: str, fallback: str, display_each: int = 20, need: int = 60):
    """카테고리 시드 + 저당 키워드를 단순 조합해서 다회수집"""
    seeds = CATEGORY_SEEDS.get(category, []) or [fallback or "저당식품"]
    q_terms = []
    # 1) 카테고리 시드 × 저당 키워드 일부 조합
    for s in seeds[:4]:
        for p in POSITIVE[:6]:
            q_terms.append(f"{s} {p}")
    # 2) 저당 키워드 단독
    q_terms += POSITIVE[:6]

    # 중복 제거(앞쪽 가중)
    seen = set()
    ordered = []
    for q in q_terms:
        if q not in seen:
            ordered.append(q); seen.add(q)

    items, ids = [], set()
    for q in ordered:
        try:
            data = naver_shop(q, display=display_each)
            for it in data.get("items", []):
                iid = it.get("productId") or it.get("link")
                if iid in ids:
                    continue
                ids.add(iid)
                items.append(it)
                if len(items) >= need:
                    return items
        except Exception:
            continue
    return items

def filter_items(items, category: str):
    """화이트리스트(저당/감미료) + 블랙리스트 + 카테고리 시드 가중"""
    seeds = set(CATEGORY_SEEDS.get(category, []))
    out = []
    for it in items:
        title = clean_title(it.get("title",""))
        if has_negative(title):
            continue
        # 저당/감미료 키워드 중 '하나라도' 포함해야 통과
        if not has_positive(title):
            continue
        pos_hits  = sum(1 for k in POSITIVE if k in title)
        seed_hits = sum(1 for k in seeds if k in title)
        score = pos_hits + 0.5*seed_hits
        # 소스류에서 일반 '시럽'은 무설탕/대체당 없으면 제외
        if category == "소스류" and ("시럽" in title) and all(
            x not in title for x in ["무설탕","무가당","슈가프리","알룰로스","에리스리톨","스테비아"]
        ):
            continue
        it["_filter_score"] = score
        it["title"] = title
        out.append(it)
    out.sort(key=lambda x: x.get("_filter_score", 0), reverse=True)
    return out

# ───────────────────────────────────────────────────────────────────
# 3) 라우팅
# ───────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_from_directory(app.static_folder, "index.html")

# 폴백 검색(모아수집 + 필터)
@app.get("/api/products")
def api_products():
    raw_q = request.args.get("q", "저당식품")
    cand = gather_candidates(category="", fallback=raw_q, display_each=20, need=80)
    items = filter_items(cand, category="")
    return jsonify({"items": items[:8]})

# 트래킹
@app.post("/api/track")
def api_track():
    data = request.get_json(force=True) or {}
    data["ts"] = datetime.utcnow().isoformat()
    EVENTS.append(data)
    uid = data.get("user_id", "anon")
    iid = data.get("item_id")
    et  = data.get("event_type")
    if iid:
        update_user_vector(uid, iid, 1.0 if et == "click" else 0.3 if et == "view" else 0.0)
    return jsonify({"ok": True})

# 개인화 추천
@app.get("/api/recommend")
def api_recommend():
    user_id = request.args.get("user_id", "anon")
    category = request.args.get("category", "")
    limit = int(request.args.get("limit", 10))

    seed = category if category else "저당식품"
    cand = gather_candidates(category, fallback=seed, display_each=20, need=max(80, limit*6))
    items = filter_items(cand, category=category)

    # 메타/벡터 캐시
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

    # 점수화
    scored = []
    for it in items:
        iid = it.get("productId") or it.get("link")
        c_sim = cosine(uvec, ITEM_VECTORS.get(iid, {}))
        nov   = 0.2 if iid in seen else 1.0
        s = 0.85*c_sim + 0.15*price_fit(iid) + 0.05*nov
        # 특가: 가격이 낮을수록 약간 보너스
        if category == "특가":
            p = price_int(iid)
            s += 0.0003 * min(100000, max(0, 100000 - p))  # 최대 +0.03
        scored.append((float(s), iid))

    # 다양성(MMR)
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
    # 디버그(원한다면 확인): 수집/필터 결과량 출력
    print(f"[DEBUG] gathered={len(cand)} filtered={len(items)} category='{category}' user='{user_id}'")
    return jsonify({"items": out[:limit]})

# ───────────────────────────────────────────────────────────────────
# 4) 실행
# ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

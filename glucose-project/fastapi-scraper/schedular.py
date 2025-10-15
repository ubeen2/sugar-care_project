# scheduler.py
import time
import json
from apscheduler.schedulers.background import BackgroundScheduler
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

CHROME_DRIVER_PATH = "C:/수업자료_황민영/유틸/chromedriver-win64/chromedriver.exe"
CACHE_FILE = "ratings_cache.json"

def scrape_ratings():
    print("크롤링 시작...")
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    service = Service(CHROME_DRIVER_PATH)
    driver = webdriver.Chrome(service=service, options=options)

    places = {
        "헬스장A": "https://place.map.kakao.com/123456",
        "헬스장B": "https://place.map.kakao.com/7891011"
    }

    results = {}
    for name, url in places.items():
        try:
            driver.get(url)
            time.sleep(2)
            rating = driver.find_element(By.CSS_SELECTOR, "span.num_star").text
            results[name] = rating
        except:
            results[name] = None

    driver.quit()
    with open(CACHE_FILE, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("크롤링 완료, 저장됨!")

# 스케줄러 실행
sched = BackgroundScheduler()
sched.add_job(scrape_ratings, "interval", hours=6)  # 6시간마다 실행
sched.start()

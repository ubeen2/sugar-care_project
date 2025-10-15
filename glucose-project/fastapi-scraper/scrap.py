# # backend/python/scrape.py
# import sys, json
# import requests
# from bs4 import BeautifulSoup
#
# def scrape(query: str = "저당"):
#     url = f"https://search.shopping.naver.com/search/all?query={query}"
#     headers = {"User-Agent": "Mozilla/5.0"}
#     res = requests.get(url, headers=headers)
#     soup = BeautifulSoup(res.text, "html.parser")
#
#     items = []
#     for product in soup.select("a.product_link")[:20]:
#         title = product.get_text(strip=True)
#         link = product["href"]
#         price_tag = product.select_one("span.price_num")
#         price = price_tag.get_text(strip=True) if price_tag else "가격정보 없음"
#         img_tag = product.select_one("img")
#         img = img_tag["src"] if img_tag else ""
#         items.append({"title": title, "price": price, "link": link, "image": img})
#     return items
#
# if __name__ == "__main__":
#     query = sys.argv[1] if len(sys.argv) > 1 else "저당"
#     result = scrape(query)
#     print(json.dumps(result, ensure_ascii=False))

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time
import json
#
# def scrape(query: str = "저당"):
#     url = f"https://search.shopping.naver.com/search/all?query={query}"
#
#     # 크롬 옵션
#     options = webdriver.ChromeOptions()
#     options.add_argument("--headless")   # 브라우저 창 안 띄움
#     options.add_argument("--no-sandbox")
#     options.add_argument("--disable-dev-shm-usage")
#
#     # 드라이버 실행
#     driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
#     print(driver.page_source[:2000])
#     driver.get(url)
#
#     time.sleep(2)  # JS 렌더링 대기
#
#     items = []
#     products = driver.find_elements(By.CSS_SELECTOR, "div.product_item")[:20]
#     for p in products:
#         try:
#             title_elem = p.find_element(By.CSS_SELECTOR, "a.product_link")
#             title = title_elem.text
#             link = title_elem.get_attribute("href")
#
#             price_elem = p.find_element(By.CSS_SELECTOR, "span.price_num")
#             price = price_elem.text if price_elem else "가격정보 없음"
#
#             img_elem = p.find_element(By.CSS_SELECTOR, "img")
#             img = img_elem.get_attribute("src") if img_elem else ""
#
#             items.append({"title": title, "price": price, "link": link, "image": img})
#         except Exception as e:
#             continue
#
#     driver.quit()
#     return items
#
#
# if __name__ == "__main__":
#     result = scrape("저당")
#     print(json.dumps(result, ensure_ascii=False, indent=2))
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
import time

def scrape(query: str = "저당"):
    url = f"https://search.shopping.naver.com/search/all?query={query}"

    options = webdriver.ChromeOptions()
    # headless 끄고 눈으로 먼저 확인
    # options.add_argument("--headless")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                         "AppleWebKit/537.36 (KHTML, like Gecko) "
                         "Chrome/120.0.0.0 Safari/537.36")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.get(url)

    time.sleep(3)  # 페이지 로딩 대기
    print(driver.title)  # 페이지 제목 확인
    print(driver.page_source[:1000])  # HTML 앞부분 확인

    driver.quit()

if __name__ == "__main__":
    scrape("저당")

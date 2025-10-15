# backend/python/scrape.py
import sys, json
import requests
from bs4 import BeautifulSoup
from fastapi import FastAPI

def scrape(query: str = "저당"):
    url = f"https://search.shopping.naver.com/search/all?query={query}"
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(url, headers=headers)
    soup = BeautifulSoup(res.text, "html.parser")

    items = []
    for product in soup.select(".product_title")[:20]:
        title = product.get_text(strip=True)
        link = product.a["href"]
        price = product.find_next("span", class_="price_num").get_text(strip=True) if product.find_next("span", class_="price_num") else "가격정보 없음"
        img = product.find_previous("img")["src"] if product.find_previous("img") else ""
        items.append({"title": title, "price": price, "link": link, "image": img})
    return items

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "저당"
    result = scrape(query)
    print(json.dumps(result, ensure_ascii=False))

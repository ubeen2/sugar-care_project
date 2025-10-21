 **AI 기반 금융보안 솔루션 개발자 이력서 | Yubin Kang (유빈 강)**

---

###  **Profile**

* **이름**: 강유빈 (Yubin Kang)
* **이메일**: [[your_email@example.com](mailto:your_email@example.com)]
* **연락처**: [010-XXXX-XXXX]
* **GitHub**: [https://github.com/ubeen123](https://github.com/ubeen123)
* **LinkedIn / Notion 포트폴리오**: [https://notion.so/yubinAI](https://notion.so/yubinAI)
* **희망직무**: 금융보안 AI/머신러닝 개발, 데이터 분석 기반 이상거래탐지 모델링

---

###  **요약 (Summary)**

데이터 기반 문제 해결과 머신러닝 모델 개발에 집중해온 개발자입니다.
실제 사용자 건강 데이터를 활용한 예측 모델링 프로젝트를 수행하며, 데이터 정제부터 모델 성능 개선까지 전 과정을 경험했습니다.
금융보안 영역에서 이상거래탐지(FDS), 자금세탁방지(AML) 등 데이터 중심 의사결정을 위한 AI 모델링을 구현하고자 합니다.

* Python 기반 데이터 분석 및 머신러닝 개발 경험 다수
* FastAPI, MySQL, React 연동 환경 구축 및 백엔드 API 설계 경험
* 데이터 보안 및 비식별화 프로세스 이해도 보유
* LightGBM, RandomForest, LSTM 등 다양한 모델 경험

---

###  **핵심 프로젝트 | SugarCare: 개인 혈당 데이터 기반 예측·관리 플랫폼**

**기간**: 2024.03 – 2024.08
**역할**: 데이터 분석 및 AI 모델 개발 총괄
**기술스택**: Python, Pandas, LightGBM, FastAPI, MySQL, React, Chart.js
**성과**: 모델 예측 정확도 91.2%, 사용자 리스크 예측 기능 개발

####  프로젝트 개요

사용자의 혈당 데이터를 분석하여, 120분 이후의 혈당 변동을 예측하고 리스크 수준을 사전 알림하는 개인 맞춤형 헬스케어 플랫폼을 구축하였습니다.

####  주요 기여

* **데이터 전처리 및 이상치 탐지**: 공공데이터(국민건강보험공단 검진데이터)를 가공 및 통합
* **머신러닝 모델 개발**: LightGBM 기반 혈당 예측 모델 구현 → RMSE 0.18 개선
* **특징 엔지니어링**: 최근 12개 혈당값 + 30/60/120분 윈도우 통계 + Δ변화율 feature 구성
* **백엔드 연동**: FastAPI로 모델 API화, React와 실시간 연동
* **보안 고려**: 사용자 식별정보 비식별화 처리, DB 접근 권한 분리 설계

####  프로젝트 결과 및 인사이트

* 예측 정확도 91% 달성, 위험 구간 자동 감지 기능 구현
* 데이터 기반 리스크 알림 UX 설계로 사용자 참여율 20% 향상
* 향후 금융 데이터 이상탐지 모델(FDS/AML)로 확장 가능성 검증

---

###  **기술 역량 (Skills)**

| 분야        | 기술 스택                                               |
| --------- | --------------------------------------------------- |
| 프로그래밍     | Python, JavaScript, Java                            |
| 데이터 분석/ML | Pandas, Scikit-learn, LightGBM, TensorFlow, Prophet |
| 백엔드/API   | FastAPI, Flask, Node.js                             |
| 데이터베이스    | MySQL, MySQL Workbench, SQLAlchemy                  |
| 시각화       | Chart.js, Recharts, Matplotlib                      |
| 협업/형상관리   | Git, GitHub, Notion, Figma                          |

---

###  **교육 및 자격**

* ○○대학교 데이터사이언스학과 졸업 (예정: 2025.02)
* SQLD (SQL 개발자) 자격증 보유
* 정보처리기사 필기 합격 / 실기 준비 중

---

###  **입사 후 포부 (Career Vision)**

금융보안 데이터를 분석해 이상거래탐지(FDS) 및 자금세탁방지(AML) 모델을 고도화하는 AI 엔지니어로 성장하고자 합니다.
YH데이터베이스의 보안 플랫폼 내에서 데이터 기반 의사결정을 강화하고, Explainable AI(설명 가능한 인공지능) 모델을 통해 신뢰성 높은 금융보안 솔루션을 개발하겠습니다.

---

# 📊 데이터 분석 리포트 | SugarCare AI Model Overview

> **프로젝트: 개인 혈당 기반 AI 리스크 예측 플랫폼**
>
> 이 섹션은 프로젝트의 핵심 데이터 분석 과정을 시각화한 PPT 기반 리포트입니다.  
> 각 슬라이드는 주요 실험, 모델 성능, 데이터 인사이트를 설명합니다.

---

## 🔹 분석 시각자료 (총 15장)

| No | 슬라이드 제목 | 미리보기 | 설명 |
|----|----------------|----------|------|
| 1 | **데이터 전처리 & 통합 파이프라인** | ![slide1](./데이터분석/slide1.png) | 국민건강보험 데이터 및 사용자 로그 병합 후, 결측치 처리·스케일링 수행 |
| 2 | **EDA: 혈당 분포 및 피처 상관관계** | ![slide2](./데이터분석/slide2.png) | 혈당 평균과 BMI, HDL 등 주요 변수의 상관관계 분석 (Pearson r = 0.64) |
| 3 | **Feature Engineering 구조** | ![slide3](./데이터분석/slide3.png) | 12개 시계열 혈당값 + 윈도우 통계(30/60/120분) + Δ5, Δ30 변화율 feature 생성 |
| 4 | **모델 비교 (LGBM vs RF vs LSTM)** | ![slide4](./데이터분석/slide4.png) | RMSE 기준 LGBM 0.18로 최적, LSTM은 장기 추세 대응 우수 |
| 5 | **훈련-검증 구조 (LOPO vs Self)** | ![slide5](./데이터분석/slide5.png) | 환자별 Leave-One-Patient-Out vs 자기 데이터 Self 훈련 비교 |
| 6 | **예측 결과 시각화 (120분 예측)** | ![slide6](./데이터분석/slide6.png) | 미래 120분 혈당 변화 예측 그래프 — 실제값 대비 ±5mg/dL 수준 |
| 7 | **위험 구간 자동 알림 로직** | ![slide7](./데이터분석/slide7.png) | 120분 후 예측값이 140 이상일 경우 주의/위험 신호 전송 구조 |
| 8 | **FastAPI 연동 구조** | ![slide8](./데이터분석/slide8.png) | `/predict` 엔드포인트를 통해 모델 → 프론트엔드 JSON 응답 |
| 9 | **React 대시보드 구조** | ![slide9](./데이터분석/slide9.png) | TodayBlood / HabitInsight 컴포넌트 내 데이터 렌더링 |
| 10 | **UX 개선 전후 비교** | ![slide10](./데이터분석/slide10.png) | 시각적 경고, 영양제 추천 추가로 사용자 피드백 긍정 20%↑ |
| 11 | **데이터 파이프라인 요약** | ![slide11](./데이터분석/slide11.png) | ETL → Feature Store → Model Training → REST API 구조 |
| 12 | **모델 성능 리포트 (ROC/AUC, MAE)** | ![slide12](./데이터분석/slide12.png) | ROC-AUC: 0.94 / MAE: 0.15 / Feature importance top5 변수 시각화 |
| 13 | **이상치 탐지 및 안정성 테스트** | ![slide13](./데이터분석/slide13.png) | 데이터 이상치 제거로 예측 안정성 8% 향상 |
| 14 | **미래 확장 (FDS/AML 모델화)** | ![slide14](./데이터분석/slide14.png) | 금융거래 데이터에도 적용 가능한 시계열 이상탐지 구조 설계 |
| 15 | **요약 및 기대효과** | ![slide15](./데이터분석/slide15.png) | 데이터 기반 건강/금융 리스크 조기탐지, Explainable AI 가능성 제시 |

---

---

## 🧠 분석 개요 요약 블록

> ### 🩺 데이터 통합 & Feature Engineering  
> 공공데이터 + 사용자 로그 병합 후, 시간 기반 통계 feature 생성  
> → 모델 입력 피처 17개, 시계열 패턴 중심 학습  

> ### ⚙️ 머신러닝 모델링  
> LightGBM / RandomForest / LSTM 실험 → RMSE 0.18 달성  
> Class weight 조정(`scale_pos_weight`)으로 불균형 대응  

> ### 💬 시각화 & 결과  
> Recharts / Chart.js 기반 실시간 예측 그래프  
> FastAPI → React 데이터 파이프라인 구축  

---

## 📸 참고 (README 내 미리보기)

```html
<p align="center">
  <img src="./데이터분석/slide3_Feature.png" width="600"/>
  <br>
  <em>Feature Engineering 구조 요약</em>
</p>

---

###  **추가 링크 및 자료**

* GitHub 프로젝트 코드: [github.com/SugarCare_project](https://github.com/ubeen2/sugar-care_project)
* 
* 포트폴리오 PDF: [별첨파일]

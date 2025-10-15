import React from "react";
import "./css/Footer.css";

export default function Footer(){
    return (<footer className="footer text-gray-300 py-12">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div>
                    <h3 className="text-white font-bold mb-4">회사 정보</h3>
                    <ul className="space-y-2">
                        <li><a href="#" >회사 소개</a></li>
                        <li><a href="#" >채용</a></li>
                        <li><a href="#" >제휴 문의</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">고객 지원</h3>
                    <ul className="space-y-2">
                        <li><a href="#" >자주 묻는 질문</a></li>
                        <li><a href="#" >배송 안내</a></li>
                        <li><a href="#" >반품/교환</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">쇼핑 가이드</h3>
                    <ul className="space-y-2">
                        <li><a href="#" >이용 약관</a></li>
                        <li><a href="#" >개인정보 처리방침</a></li>
                        <li><a href="#" >이벤트</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-white font-bold mb-4">고객센터</h3>
                    <p className="text-2xl text-white font-bold mb-2">1588-1234</p>
                    <p className="text-sm">평일 09:00 - 18:00</p>
                    <p className="text-sm">(주말 및 공휴일 휴무)</p>
                </div>
            </div>
            <div className="border-t border-gray-700 pt-8 text-sm text-center footer-info">
                <p>© 2025 WELL-DANG. All rights reserved.</p>
            </div>
        </div>
    </footer>)
}
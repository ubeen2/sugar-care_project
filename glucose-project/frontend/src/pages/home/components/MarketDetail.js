import React from 'react';
import { Search, ShoppingCart, User, Heart, ArrowRight } from 'lucide-react';
// import "./css/mapDetail.css";
// 로고 이미지 URL (실제 로고로 교체하세요)
const LOGO_URL = 'https://via.placeholder.com/150x40?text=WELL-DANG';

// 유틸리티 함수 - classNames 병합
function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

// Button 컴포넌트
const Button = ({
                    children,
                    variant = 'default',
                    size = 'default',
                    className = '',
                    ...props
                }) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-all disabled:pointer-events-none disabled:opacity-50 outline-none';

    const variants = {
        default: 'bg-primary text-white hover:bg-opacity-90',
        ghost: 'hover:bg-gray-100',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300'
    };

    const sizes = {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-10 px-6',
        icon: 'h-9 w-9'
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
};

// Badge 컴포넌트
const Badge = ({ children, className = '', ...props }) => {
    return (
        <span
            className={cn(
                'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium',
                className
            )}
            {...props}
        >
      {children}
    </span>
    );
};

// Input 컴포넌트
const Input = ({ className = '', ...props }) => {
    return (
        <input
            className={cn(
                'flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            {...props}
        />
    );
};

// Header 컴포넌트
// Header 컴포넌트r
const Header = () => {
    return (
        <header className="border-b sticky top-0 bg-white z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <img src={LOGO_URL} alt="WELL-DANG" className="h-8" />

                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#" className="hover:opacity-70 transition-opacity">신제품</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">베스트</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">스낵바</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">쿠키</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">초콜릿</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">견과류</a>
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="search"
                                placeholder="검색"
                                className="w-64 pl-10 bg-gray-100 border-0"
                            />
                        </div>
                        <Button variant="ghost" size="icon">
                            <Heart className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <User className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
};

// ProductCard 컴포넌트
const ProductCard = ({
                         image,
                         title,
                         price,
                         originalPrice,
                         discount,
                         brand,
                         badge,
                         sugarContent
                     }) => {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-gray-100">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {badge && (
                    <Badge className="absolute top-2 left-2 bg-black text-white">
                        {badge}
                    </Badge>
                )}
                {sugarContent && (
                    <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                        {sugarContent}
                    </Badge>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="w-8 h-8 rounded-full">
                        <Heart className="w-4 h-4" />
                    </Button>
                </div>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" className="w-8 h-8 rounded-full">
                        <ShoppingCart className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-1">
                {brand && <p className="text-gray-500 text-sm">{brand}</p>}
                <h3 className="line-clamp-2 min-h-[3rem]">{title}</h3>
                <div className="flex items-center gap-2">
                    {discount && (
                        <span className="text-red-600">{discount}%</span>
                    )}
                    <span className="font-medium">{price.toLocaleString()}원</span>
                </div>
                {originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                        {originalPrice.toLocaleString()}원
                    </p>
                )}
            </div>
        </div>
    );
};

// Main App 컴포넌트
function MarketDetail() {
    const categories = [
        { name: "스낵바", icon: "🥜" },
        { name: "쿠키", icon: "🍪" },
        { name: "초콜릿", icon: "🍫" },
        { name: "견과류", icon: "🌰" },
        { name: "말린과일", icon: "🍇" },
        { name: "시리얼", icon: "🥣" },
        { name: "음료", icon: "🥤" },
        { name: "요거트", icon: "🥛" },
    ];

    const bestProducts = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400",
            title: "프리미엄 프로틴 바 믹스 12입",
            price: 19900,
            originalPrice: 29900,
            discount: 33,
            brand: "웰당",
            badge: "BEST",
            sugarContent: "당 3g"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1554175231-8367073ba4e3?w=400",
            title: "저당 초코칩 쿠키 (설탕 50% 감소)",
            price: 12900,
            originalPrice: 16900,
            discount: 24,
            brand: "웰당",
            badge: "HOT",
            sugarContent: "당 2g"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1633360821154-1935fb5671e6?w=400",
            title: "오트밀 그래놀라 바 6종 세트",
            price: 15900,
            brand: "웰당",
            sugarContent: "당 4g"
        },
        {
            id: 4,
            image: "https://images.unsplash.com/photo-1505253827648-b4de98bc66b4?w=400",
            title: "다크 초콜릿 70% (무설탕)",
            price: 8900,
            originalPrice: 12900,
            discount: 31,
            brand: "웰당",
            sugarContent: "당 1g"
        },
    ];

    const newProducts = [
        {
            id: 5,
            image: "https://images.unsplash.com/photo-1669219510558-56d14e7927b9?w=400",
            title: "프리미엄 아몬드 믹스 (무염, 무설탕)",
            price: 18900,
            brand: "웰당",
            badge: "NEW",
            sugarContent: "당 0g"
        },
        {
            id: 6,
            image: "https://images.unsplash.com/photo-1641291361624-38b69b86b1cf?w=400",
            title: "무설탕 말린과일 세트 (사과, 배, 딸기)",
            price: 14900,
            brand: "웰당",
            badge: "NEW",
            sugarContent: "당 5g"
        },
        {
            id: 7,
            image: "https://images.unsplash.com/photo-1571230389215-b34a89739ef1?w=400",
            title: "그릭 요거트 파르페 (저당, 고단백)",
            price: 9900,
            brand: "웰당",
            badge: "NEW",
            sugarContent: "당 6g"
        },
        {
            id: 8,
            image: "https://images.unsplash.com/photo-1627308594190-a057cd4bfac8?w=400",
            title: "저당 그래놀라 시리얼 (메이플 맛)",
            price: 13900,
            brand: "웰당",
            badge: "NEW",
            sugarContent: "당 4g"
        },
    ];

    const snackBars = [
        {
            id: 9,
            image: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400",
            title: "초콜릿 프로틴바 10입 (초코칩)",
            price: 16900,
            originalPrice: 21900,
            discount: 23,
            brand: "웰당",
            sugarContent: "당 3g"
        },
        {
            id: 10,
            image: "https://images.unsplash.com/photo-1633360821154-1935fb5671e6?w=400",
            title: "넛츠 그래놀라 바 (아몬드&캐슈넛)",
            price: 17900,
            brand: "웰당",
            sugarContent: "당 4g"
        },
        {
            id: 11,
            image: "https://images.unsplash.com/photo-1569420067112-b57b4f024595?w=400",
            title: "베리 에너지 바 믹스 (블루베리&크랜베리)",
            price: 14900,
            brand: "웰당",
            sugarContent: "당 5g"
        },
        {
            id: 12,
            image: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=400",
            title: "피넛버터 프로틴 바 (고단백 20g)",
            price: 18900,
            originalPrice: 24900,
            discount: 24,
            brand: "웰당",
            sugarContent: "당 2g"
        },
    ];

    const cookies = [
        {
            id: 13,
            image: "https://images.unsplash.com/photo-1554175231-8367073ba4e3?w=400",
            title: "오트밀 다크초콜릿 쿠키 (무설탕)",
            price: 11900,
            brand: "웰당",
            sugarContent: "당 1g"
        },
        {
            id: 14,
            image: "https://images.unsplash.com/photo-1724072013765-bb4773d63d6d?w=400",
            title: "아몬드 비스킷 (저당, 버터 풍미)",
            price: 10900,
            originalPrice: 13900,
            discount: 22,
            brand: "웰당",
            sugarContent: "당 2g"
        },
        {
            id: 15,
            image: "https://images.unsplash.com/photo-1554175231-8367073ba4e3?w=400",
            title: "코코넛 마카롱 (천연 감미료)",
            price: 15900,
            brand: "웰당",
            sugarContent: "당 3g"
        },
        {
            id: 16,
            image: "https://images.unsplash.com/photo-1724072013765-bb4773d63d6d?w=400",
            title: "녹차 쿠키 세트 (스테비아 첨가)",
            price: 12900,
            brand: "웰당",
            sugarContent: "당 2g"
        },
    ];

    return (
        <div className="min-h-screen bg-white">
            {/*<Header/>*/}
            {/* 메인 프로모션 배너 */}
            <section className="bg-gradient-to-r from-green-50 to-blue-50 py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center space-y-4">
                        <Badge className="bg-green-600 text-white text-lg px-6 py-2">
                            저당 혁명
                        </Badge>
                        <h1 className="text-5xl font-bold">
                            건강한 단맛, 웰당과 함께
                        </h1>
                        <p className="text-xl text-gray-600">
                            설탕을 줄이고 건강을 더하는 저당식품 전문 브랜드
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Button size="lg" className="px-8">
                                전체 상품 보기
                            </Button>
                            <Button size="lg" variant="outline" className="px-8">
                                할인 상품
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 카테고리 */}
            <section className="py-8 border-b">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        {categories.map((category) => (
                            <Button
                                key={category.name}
                                variant="outline"
                                className="px-6 py-6 rounded-full hover:bg-black hover:text-white transition-colors"
                            >
                                <span className="mr-2">{category.icon}</span>
                                {category.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </section>

            {/* 특별 혜택 배너 */}
            <section className="bg-yellow-400 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between max-w-6xl mx-auto">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">🎉</div>
                            <div>
                                <h2 className="text-2xl font-bold">신규 가입 시 전 상품 10% 할인 쿠폰</h2>
                                <p className="text-lg">지금 가입하고 저당식품을 더 건강하게 즐기세요!</p>
                            </div>
                        </div>
                        <Button size="lg" variant="secondary" className="px-8">
                            쿠폰 받기
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </div>
                </div>
            </section>

            {/* 베스트 상품 */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">베스트 상품</h2>
                            <p className="text-gray-600">가장 인기있는 저당식품을 만나보세요</p>
                        </div>
                        <Button variant="ghost">
                            전체보기
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {bestProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 신제품 */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">신제품</h2>
                            <p className="text-gray-600">새롭게 출시된 저당식품을 확인하세요</p>
                        </div>
                        <Button variant="ghost">
                            전체보기
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newProducts.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 스낵바 카테고리 */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">🥜 스낵바</h2>
                            <p className="text-gray-600">간편하고 건강한 영양 간식</p>
                        </div>
                        <Button variant="ghost">
                            전체보기
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {snackBars.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 쿠키 카테고리 */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">🍪 쿠키</h2>
                            <p className="text-gray-600">달콤하지만 건강한 쿠키</p>
                        </div>
                        <Button variant="ghost">
                            전체보기
                            <ArrowRight className="ml-2 w-4 h-4"/>
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {cookies.map((product) => (
                            <ProductCard key={product.id} {...product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* 웰당 소개 섹션 */}
            <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-4xl font-bold">왜 웰당을 선택해야 할까요?</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                            <div className="space-y-3">
                                <div className="text-5xl">✓</div>
                                <h3 className="text-xl font-bold">저당 보장</h3>
                                <p className="text-green-100">
                                    모든 제품 당 함량 50% 이하로 설계되었습니다
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="text-5xl">✓</div>
                                <h3 className="text-xl font-bold">천연 원료</h3>
                                <p className="text-green-100">
                                    인공 첨가물 없이 천연 재료만 사용합니다
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="text-5xl">✓</div>
                                <h3 className="text-xl font-bold">맛과 건강</h3>
                                <p className="text-green-100">
                                    맛을 포기하지 않으면서도 건강을 챙깁니다
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 리뷰 섹션 */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">고객 후기</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                            <div className="flex text-yellow-400 text-xl">
                                ★★★★★
                            </div>
                            <p className="text-lg">
                                "다이어트 중인데 단 것이 너무 먹고 싶을 때 웰당 제품들이 정말 도움이 됐어요!"
                            </p>
                            <p className="text-gray-600">- 김미영 님</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                            <div className="flex text-yellow-400 text-xl">
                                ★★★★★
                            </div>
                            <p className="text-lg">
                                "당뇨 관리하면서도 맛있는 간식을 즐길 수 있어서 좋습니다. 강추!"
                            </p>
                            <p className="text-gray-600">- 이정호 님</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                            <div className="flex text-yellow-400 text-xl">
                                ★★★★★
                            </div>
                            <p className="text-lg">
                                "아이들 간식으로 안심하고 줄 수 있어요. 맛도 좋아해서 만족스럽습니다."
                            </p>
                            <p className="text-gray-600">- 박서현 님</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}

export default MarketDetail;
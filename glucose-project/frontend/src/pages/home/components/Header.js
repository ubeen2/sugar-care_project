import { Search, ShoppingCart, User, Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import logoImage from "figma:asset/0abcf8121e936d7c9a9ac788ff64ad012077f6c2.png";

export function Header() {
    return (
        <header className="border-b sticky top-0 bg-white z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* 로고 */}
                    <div className="flex items-center gap-8">
                        <img src={logoImage} alt="WELL-DANG" className="h-8" />

                        {/* 네비게이션 */}
                        <nav className="hidden md:flex items-center gap-6">
                            <a href="#" className="hover:opacity-70 transition-opacity">신제품</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">베스트</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">스낵바</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">쿠키</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">초콜릿</a>
                            <a href="#" className="hover:opacity-70 transition-opacity">견과류</a>
                        </nav>
                    </div>

                    {/* 검색 및 아이콘 */}
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                type="search"
                                placeholder="검색"
                                className="w-64 pl-10 bg-input-background border-0"
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
}

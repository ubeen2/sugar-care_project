import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./utils/dialog";
import { Button } from "./utils/button";
import { Check } from "lucide-react";
import "bootstrap/dist/css/bootstrap.min.css";
export function SubscriptionModal({ isOpen, onClose }) {
    const personalFeatures = [
        "운동기구 세트 제공",
        "유료 운동영상 제공",
        "혈당 측정키트 제공",
    ];

    const familyFeatures = [
        "Personal 서비스 모두 포함",
        "운동기구 세트 제공",
        "유료 운동영상 제공",
        "혈당 측정키트 제공",
        "병원 연동 서비스",
    ];

    const handleSubscribe = (plan) => {
        alert(`${plan} 플랜이 선택되었습니다.`);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl bg-white rounded-2xl shadow-xl p-8">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-semibold">
                        구독 플랜 선택
                    </DialogTitle>
                </DialogHeader>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Personal Plan */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-gray-50 flex flex-col hover:shadow-md transition">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                Personal
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">₩29,900</span>
                                <span className="text-gray-500">/월</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 mb-6">
                            {personalFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2 text-gray-700">
                                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => handleSubscribe("Personal")}
                            variant="outline"
                            className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Personal 선택
                        </Button>
                    </div>

                    {/* Family Plan */}
                    <div className="border-2 border-indigo-500 rounded-xl p-6 bg-indigo-50 flex flex-col relative hover:shadow-md transition">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            추천
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2 text-gray-800">
                                Family
                            </h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">₩49,900</span>
                                <span className="text-gray-500">/월</span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3 mb-6">
                            {familyFeatures.map((feature, index) => (
                                <div key={index} className="flex items-start gap-2 text-gray-700">
                                    <Check className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={() => handleSubscribe("Family")}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Family 선택
                        </Button>
                    </div>
                </div>

                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>언제든지 구독을 취소하실 수 있습니다.</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Zap, Check } from "lucide-react";
import { useState } from "react";
import { redirectToCheckout } from "@/lib/stripe";

interface PremiumStreamCardProps {
  position?: number;
  onUpgrade?: () => void;
}

export default function PremiumStreamCard({
  position = 1,
  onUpgrade = () => {},
}: PremiumStreamCardProps) {
  const [showPricing, setShowPricing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (plan: "monthly" | "quarterly" | "yearly") => {
    setIsLoading(true);
    try {
      await redirectToCheckout(plan);
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-white border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] group hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-all rounded-3xl border-4">
      <div className="relative aspect-video bg-white flex items-center justify-center overflow-hidden">
        {/* Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-white/30" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative bg-red-600 h-16 w-16 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-sm tracking-tight">
                MSW
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-gray-900 font-bold text-xl">Premium Access</h3>

            {/* Value Propositions */}
            <div className="space-y-2 text-left">
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-xs">
                  Watch Streams From Any Service - YouTube, KICK, Twitch!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-xs">
                  Unlock up to +6 Streams!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-xs">
                  Have your followed streamers automatically populate at the top
                  once logged in!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-xs">
                  Skip ads seamlessly - If 1 stream is showing an AD simply
                  watch another!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Check className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-600 text-xs">
                  Pop Out chat feature where you can pop out the chat and extend
                  it to never miss what anyone saying!
                </p>
              </div>
            </div>
          </div>

          {!showPricing ? (
            <Button
              onClick={() => setShowPricing(true)}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="h-4 w-4 mr-2" />
              Subscribe Now
            </Button>
          ) : (
            <div className="w-full space-y-2">
              {/* Free Plan */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Free</p>
                    <p className="text-xs text-gray-500">Basic features</p>
                  </div>
                  <Button
                    onClick={() => setShowPricing(false)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Current Plan
                  </Button>
                </div>
              </div>

              {/* Monthly Plan */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-3 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-red-900 text-sm">Monthly</p>
                    <p className="text-xs text-red-700">$5.00/month</p>
                  </div>
                  <Button
                    onClick={() => handleCheckout("monthly")}
                    disabled={isLoading}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                  >
                    {isLoading ? "Loading..." : "Subscribe"}
                  </Button>
                </div>
              </div>

              {/* Quarterly Plan */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-lg p-3 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-0.5 rounded-bl-lg font-bold shadow-[0_0_0_2px_white]">
                  MOST POPULAR
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-red-900 text-sm">Quarterly</p>
                    <p className="text-xs text-red-700">$12.00/3 months</p>
                  </div>
                  <Button
                    onClick={() => handleCheckout("quarterly")}
                    disabled={isLoading}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs shadow-[0_0_0_2px_white]"
                  >
                    {isLoading ? "Loading..." : "Subscribe"}
                  </Button>
                </div>
              </div>

              {/* Yearly Plan */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-lg p-3 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-2 py-0.5 rounded-bl-lg font-bold shadow-[0_0_0_2px_white]">
                  SAVE 17%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-red-900 text-sm">Yearly</p>
                    <p className="text-xs text-red-700">$49.99/year</p>
                  </div>
                  <Button
                    onClick={() => handleCheckout("yearly")}
                    disabled={isLoading}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs shadow-[0_0_0_2px_white]"
                  >
                    {isLoading ? "Loading..." : "Subscribe"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 bg-slate-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-gray-400" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            <div className="h-1.5 w-1.5 rounded-full bg-gray-300" />
          </div>
        </div>
      </div>
    </Card>
  );
}
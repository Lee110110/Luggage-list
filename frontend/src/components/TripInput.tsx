import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAppStore } from "../store";

const EXAMPLES = [
  "下周五去东京出差3天，有个正式晚宴",
  "7月中旬带老婆孩子去三亚玩一周",
  "6月1号飞伦敦，待5天，主要是开会",
];

export function TripInput() {
  const { tripInput, setTripInput, submitTripInput, loading } = useAppStore();
  const [focused, setFocused] = useState(false);

  const handleSubmit = () => {
    if (tripInput.trim() && !loading) {
      submitTripInput();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-text mb-2">
          AI 行李清单生成器
        </h1>
        <p className="text-text-secondary">
          描述你的出行计划，一键生成智能行李清单
        </p>
      </div>

      <div
        className={`w-full max-w-2xl rounded-2xl border-2 bg-surface p-1 transition-colors ${
          focused ? "border-primary" : "border-border"
        }`}
      >
        <textarea
          value={tripInput}
          onChange={(e) => setTripInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="告诉我你的出行计划..."
          rows={3}
          className="w-full resize-none rounded-xl p-4 text-base text-text placeholder:text-text-secondary/50 focus:outline-none"
        />
        <div className="flex justify-end p-2">
          <Button
            onClick={handleSubmit}
            disabled={!tripInput.trim() || loading}
            size="lg"
          >
            {loading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {loading ? "分析中..." : "生成清单"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <span className="text-sm text-text-secondary">试试：</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => setTripInput(ex)}
            className="rounded-full bg-surface border border-border px-3 py-1 text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}

import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { TripInput } from "../components/TripInput";
import { TripConfirmCard } from "../components/TripConfirmCard";
import { WeatherForecast } from "../components/WeatherForecast";
import { DestinationAlerts } from "../components/DestinationAlerts";
import { ChecklistCategory } from "../components/ChecklistCategory";
import { ProgressBar } from "../components/ProgressBar";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useAppStore } from "../store";
import { CATEGORIES } from "../utils/constants";

function LoadingState() {
  const [msg, setMsg] = useState("正在查询目的地天气...");
  useEffect(() => {
    const t1 = setTimeout(() => setMsg("正在生成行李清单..."), 8000);
    const t2 = setTimeout(() => setMsg("正在获取目的地提醒..."), 40000);
    const t3 = setTimeout(() => setMsg("即将完成，请稍候..."), 60000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-text-secondary">{msg}</p>
      <p className="text-xs text-text-secondary/60">AI 生成可能需要 1-2 分钟</p>
    </div>
  );
}

export function HomePage() {
  const {
    step,
    loading,
    error,
    trip,
    weather,
    checklist,
    alerts,
    reset,
    addCustomItem,
  } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "其他",
    quantity: 1,
    priority: "选带",
  });

  const groupedItems = useMemo(() => {
    const groups: Record<string, typeof checklist> = {};
    for (const cat of CATEGORIES) {
      const items = checklist.filter((i) => i.category === cat);
      if (items.length > 0) groups[cat] = items;
    }
    return groups;
  }, [checklist]);

  const checkedCount = checklist.filter((i) => i.checked).length;

  if (loading && step === "confirm") {
    return <LoadingState />;
  }

  if (step === "input") {
    return <TripInput />;
  }

  if (step === "confirm") {
    return (
      <div className="py-8 px-4">
        <TripConfirmCard />
      </div>
    );
  }

  // Result view
  return (
    <div className="py-6 px-4 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={reset}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="font-semibold">
            🧳 {trip?.destination} · {trip?.duration_days}天{trip?.purpose}
          </h2>
          <p className="text-sm text-text-secondary">
            {trip?.start_date} ~ {trip?.end_date}
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Weather */}
      {weather && (
        <WeatherForecast
          daily={weather.daily}
          summary={weather.summary}
          destination={trip?.destination || ""}
        />
      )}

      {/* Alerts */}
      {alerts.length > 0 && <DestinationAlerts alerts={alerts} />}

      {/* Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">📋 行李清单</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            添加物品
          </Button>
        </div>

        <ProgressBar checked={checkedCount} total={checklist.length} />

        {showAddForm && (
          <Card>
            <div className="flex flex-wrap gap-2">
              <input
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                placeholder="物品名称"
                className="flex-1 min-w-[120px] rounded-lg border border-border px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
              />
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className="rounded-lg border border-border px-3 py-1.5 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={newItem.quantity}
                min={1}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-16 rounded-lg border border-border px-3 py-1.5 text-sm"
              />
              <Button
                size="sm"
                disabled={!newItem.name.trim()}
                onClick={() => {
                  addCustomItem(newItem);
                  setNewItem({ name: "", category: "其他", quantity: 1, priority: "选带" });
                  setShowAddForm(false);
                }}
              >
                添加
              </Button>
            </div>
          </Card>
        )}

        {Object.entries(groupedItems).map(([category, items]) => (
          <ChecklistCategory key={category} category={category} items={items} />
        ))}
      </div>
    </div>
  );
}

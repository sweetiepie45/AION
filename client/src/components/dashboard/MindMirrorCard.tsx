import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface MoodOption {
  label: string;
  emoji: string;
  selected: boolean;
}

interface MoodTrend {
  day: string;
  score: number;
  isToday: boolean;
}

interface MindMirrorCardProps {
  currentMood?: MoodOption;
  moodOptions: MoodOption[];
  moodTrends: MoodTrend[];
  lastUpdated: string;
  aiInsight: string;
  onSelectMood: (mood: string) => void;
  onViewFullReport: () => void;
}

export default function MindMirrorCard({
  currentMood,
  moodOptions = [],
  moodTrends = [],
  lastUpdated = "2h ago",
  aiInsight = "",
  onSelectMood,
  onViewFullReport,
}: MindMirrorCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 h-full">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-800">Mind Mirror</h3>
          <Button
            variant="link"
            className="text-xs font-medium text-primary p-0 h-auto"
            onClick={onViewFullReport}
          >
            Full report
          </Button>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Today's mood</span>
            <span className="text-xs font-medium text-neutral-500">Updated {lastUpdated}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
            <div className="flex space-x-3 overflow-x-auto pb-1">
              {moodOptions.map((mood) => (
                <button
                  key={mood.label}
                  className="flex flex-col items-center"
                  onClick={() => onSelectMood(mood.label)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 bg-white ${
                      mood.selected
                        ? "border-2 border-primary"
                        : "border border-neutral-200 opacity-60"
                    }`}
                  >
                    <span className="text-xl">{mood.emoji}</span>
                  </div>
                  <span className="text-xs text-neutral-600">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">Weekly trends</span>
          </div>
          <div className="h-32 flex items-end space-x-1">
            {moodTrends.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div
                  className={`w-full ${
                    day.isToday ? "bg-primary" : "bg-primary-100"
                  } rounded-t-sm`}
                  style={{
                    height: `${day.score}%`,
                    transition: "height 1s ease-out",
                  }}
                ></div>
                <span className="text-xs text-neutral-500 mt-1">{day.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-neutral-600">AI Insight</span>
          </div>
          <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
            <p className="text-sm text-neutral-700">
              <Lightbulb className="inline-block h-4 w-4 text-primary mr-2" />
              {aiInsight}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

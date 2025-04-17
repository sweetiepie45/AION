import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Heart, 
  Briefcase, 
  Users, 
  BookOpen, 
  Smile, 
  ChevronsDown,
  Brain,
} from "lucide-react";
import { useEffect, useState } from "react";

interface LifeDomain {
  id: number;
  name: string;
  score: number;
  icon: string;
  color: string;
}

const defaultDomains: LifeDomain[] = [
  { id: 1, name: "Health", score: 82, icon: "heart", color: "bg-primary-100 text-primary" },
  { id: 2, name: "Work", score: 75, icon: "briefcase", color: "bg-green-100 text-green-500" },
  { id: 3, name: "Social", score: 65, icon: "users", color: "bg-amber-100 text-amber-500" },
  { id: 4, name: "Learning", score: 80, icon: "book", color: "bg-pink-100 text-pink-500" },
  { id: 5, name: "Fun", score: 90, icon: "smile", color: "bg-purple-100 text-purple-500" },
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "heart":
      return <Heart className="h-5 w-5" />;
    case "briefcase":
      return <Briefcase className="h-5 w-5" />;
    case "users":
      return <Users className="h-5 w-5" />;
    case "book":
      return <BookOpen className="h-5 w-5" />;
    case "smile":
      return <Smile className="h-5 w-5" />;
    default:
      return <Brain className="h-5 w-5" />;
  }
};

interface LifeBalanceCardProps {
  domains?: LifeDomain[];
  overallScore?: number;
  period?: string;
}

export default function LifeBalanceCard({ 
  domains = defaultDomains,
  overallScore = 78, 
  period = "Last 7 days" 
}: LifeBalanceCardProps) {
  const [animateCircle, setAnimateCircle] = useState(false);

  useEffect(() => {
    // Trigger animation after a small delay
    const timer = setTimeout(() => {
      setAnimateCircle(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  // Calculate stroke-dashoffset
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - overallScore / 100);

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-800">Life Balance Score</h3>
          <div className="text-xs font-medium text-neutral-500 flex items-center cursor-pointer hover:text-neutral-700">
            <span>{period}</span>
            <ChevronsDown className="ml-1 h-3 w-3" />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-40 h-40 relative mb-5 md:mb-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="hsl(var(--primary))" 
                strokeWidth="10" 
                strokeDasharray={circumference} 
                strokeDashoffset={animateCircle ? strokeDashoffset : circumference}
                transform="rotate(-90 50 50)"
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold" fill="#1F2937">{overallScore}</text>
              <text x="50" y="65" textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#6B7280">/100</text>
            </svg>
          </div>
          
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 md:ml-6">
            {domains.map((domain) => (
              <div 
                key={domain.id}
                className="flex flex-col items-center p-3 rounded-lg border border-neutral-200 hover:border-primary transition-all duration-200 cursor-pointer transform hover:-translate-y-1"
              >
                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", domain.color || "bg-primary-100 text-primary")}>
                  {getIconComponent(domain.icon)}
                </div>
                <span className="text-xs font-medium text-neutral-600 mb-1">{domain.name}</span>
                <span className="text-sm font-semibold text-neutral-800">{domain.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

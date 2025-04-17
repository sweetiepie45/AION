import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { useState } from "react";

interface SmartAgentAlertProps {
  suggestion: string;
  timestamp: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export default function SmartAgentAlert({ 
  suggestion, 
  timestamp, 
  onAccept, 
  onDismiss 
}: SmartAgentAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <Card className="bg-white border border-amber-500 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-amber-500 text-white p-2 rounded-lg">
          <Lightbulb className="h-4 w-4" />
        </div>
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">Smart Suggestion</h3>
            <span className="text-xs text-neutral-500">{timestamp}</span>
          </div>
          <p className="mt-1 text-sm text-neutral-600">{suggestion}</p>
          <div className="mt-3 flex space-x-3">
            <Button 
              variant="default" 
              className="px-3 py-1.5 h-auto bg-amber-500 hover:bg-amber-600 text-xs"
              onClick={handleAccept}
            >
              Schedule it
            </Button>
            <Button 
              variant="outline" 
              className="px-3 py-1.5 h-auto text-neutral-600 text-xs"
              onClick={handleDismiss}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

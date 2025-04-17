import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageSquare, Cake, Lightbulb, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Contact {
  id: number;
  name: string;
  avatarUrl?: string;
  lastContact: string;
  lastContactStatus: 'good' | 'warn' | 'overdue';
}

interface NetworkInsight {
  id: number;
  content: string;
  type: 'birthday' | 'suggestion' | 'trend';
}

interface HumanNetworkCardProps {
  contacts: Contact[];
  insights: NetworkInsight[];
  onContactAction: (id: number) => void;
  onViewAll: () => void;
}

export default function HumanNetworkCard({ 
  contacts = [], 
  insights = [], 
  onContactAction, 
  onViewAll 
}: HumanNetworkCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warn':
        return 'text-amber-500';
      case 'overdue':
        return 'text-red-500';
      default:
        return 'text-neutral-500';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return <Cake className="text-primary text-xs" />;
      case 'suggestion':
        return <Lightbulb className="text-primary text-xs" />;
      case 'trend':
        return <TrendingUp className="text-amber-500 text-xs" />;
      default:
        return <Lightbulb className="text-primary text-xs" />;
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-neutral-200 h-full">
      <CardContent className="pt-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-neutral-800">Human Network</h3>
          <Button 
            variant="link" 
            className="text-xs font-medium text-primary p-0 h-auto"
            onClick={onViewAll}
          >
            View all
          </Button>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-neutral-700 mb-2">Priority connections</div>
          {contacts.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500">No priority connections</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div key={contact.id} className="flex items-center">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatarUrl} alt={contact.name} />
                    <AvatarFallback>
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-neutral-800">{contact.name}</span>
                    <span className={cn("block text-xs", getStatusColor(contact.lastContactStatus))}>
                      Last contact: {contact.lastContact}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto w-8 h-8 p-0 rounded-full"
                    onClick={() => onContactAction(contact.id)}
                  >
                    <MessageSquare className="text-primary text-sm" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <div className="text-sm text-neutral-700 mb-3">Network Insights</div>
          {insights.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-500">No insights available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight) => (
                <div key={insight.id} className="p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      {getInsightIcon(insight.type)}
                    </div>
                    <p className="ml-2 text-xs text-neutral-700">
                      {insight.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

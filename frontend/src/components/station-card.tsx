"use client";

import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MinusCircle,
  Download,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { toText } from "@/lib/ai/gemini-core";
import { Badge } from "./ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";

interface Station {
  id: number;
  name: string;
  description: string;
  Icon: LucideIcon;
}

type Status = "pending" | "running" | "completed" | "failed";

interface StationCardProps {
  station: Station;
  status: Status;
  results: any;
  isActive: boolean;
}

/**
 * Export station text to file
 */
function exportStationToFile(
  stationNum: number,
  content: string,
  stationName: string
) {
  const header = `===========================================
المحطة ${stationNum} - ${stationName}
===========================================

`;
  const fullContent = header + content;
  const blob = new Blob([fullContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `station-${stationNum}-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Get full text output from station result
 */
function getStationFullText(id: number, data: any): string {
  if (!data) return "";

  // If data is already a string, return it
  if (typeof data === "string") {
    return data;
  }

  // Try to extract text from common structures
  let text = "";

  switch (id) {
    case 1:
      text += "## الشخصيات الرئيسية:\n";
      if (Array.isArray(data.majorCharacters)) {
        text += data.majorCharacters
          .map((c: any) => `- ${toText(c)}`)
          .join("\n");
      } else {
        text += toText(data.majorCharacters);
      }
      text += "\n\n## التحليل السردي:\n";
      text += `النغمة العامة: ${toText(data.narrativeStyleAnalysis?.overallTone)}\n`;
      text += `تحليل الوتيرة: ${toText(data.narrativeStyleAnalysis?.pacingAnalysis)}\n`;
      text += `أسلوب اللغة: ${toText(data.narrativeStyleAnalysis?.languageStyle)}\n`;
      break;

    case 2:
      text += "## بيان القصة:\n";
      text += toText(data.storyStatement) + "\n\n";
      text += "## النوع الهجين:\n";
      text += toText(
        typeof data.hybridGenre === "object"
          ? data.hybridGenre?.genre
          : data.hybridGenre
      );
      break;

    case 3:
      text += "## ملخص الشبكة:\n";
      text += `عدد الشخصيات: ${toText(data.networkSummary?.charactersCount)}\n`;
      text += `عدد العلاقات: ${toText(data.networkSummary?.relationshipsCount)}\n`;
      text += `عدد الصراعات: ${toText(data.networkSummary?.conflictsCount)}\n`;
      if (data.conflictNetwork) {
        text += "\n## شبكة الصراع:\n" + toText(data.conflictNetwork);
      }
      break;

    case 4:
      text += "## مقاييس الكفاءة:\n";
      text += `الدرجة الإجمالية: ${toText(data.efficiencyMetrics?.overallEfficiencyScore)}/100\n\n`;
      if (data.recommendations?.priorityActions) {
        text += "## التوصيات ذات الأولوية:\n";
        if (Array.isArray(data.recommendations.priorityActions)) {
          text += data.recommendations.priorityActions
            .map((a: any) => `- ${toText(a)}`)
            .join("\n");
        } else {
          text += toText(data.recommendations.priorityActions);
        }
      }
      break;

    case 5:
      text += "## التحليل الديناميكي:\n";
      text += toText(data.dynamicAnalysisResults || data);
      break;

    case 6:
      text += "## تقرير التشخيص:\n";
      text += `درجة الصحة العامة: ${toText(data.diagnosticsReport?.overallHealthScore)}/100\n\n`;
      if (data.diagnosticsReport?.criticalIssues) {
        text += "## المشاكل الحرجة:\n";
        if (Array.isArray(data.diagnosticsReport.criticalIssues)) {
          text += data.diagnosticsReport.criticalIssues
            .map((i: any) => `- ${toText(i.description || i)}`)
            .join("\n");
        } else {
          text += toText(data.diagnosticsReport.criticalIssues);
        }
      }
      break;

    case 7:
      text += "## التقرير النهائي:\n";
      text += toText(
        data.finalReport?.executiveSummary || data.executiveSummary || data
      );
      break;

    default:
      // Try to convert entire object to text
      text = JSON.stringify(data, null, 2);
  }

  return text || toText(data);
}

const StationCard = ({
  station,
  status,
  results,
  isActive,
}: StationCardProps) => {
  const { id, name, description, Icon } = station;
  const hasResults = status === "completed" && results[id];
  const [showModal, setShowModal] = useState(false);

  const statusIcons: Record<Status, JSX.Element> = {
    pending: <MinusCircle className="text-muted-foreground" />,
    running: <Loader2 className="animate-spin text-primary" />,
    completed: <CheckCircle2 className="text-green-500" />,
    failed: <AlertCircle className="text-destructive" />,
  };

  const handleExport = () => {
    const data = results[id];
    if (!data) return;
    const fullText = getStationFullText(id, data);
    exportStationToFile(id, fullText, name);
  };

  const handleView = () => {
    setShowModal(true);
  };

  const renderSummary = () => {
    const data = results[id];
    if (!data) return null;

    // Get first 300 characters for summary
    const fullText = getStationFullText(id, data);
    const summary = fullText.substring(0, 300);

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {summary}
          {fullText.length > 300 && "..."}
        </p>
      </div>
    );
  };

  const renderFullContent = () => {
    const data = results[id];
    if (!data) return null;

    const fullText = getStationFullText(id, data);

    return (
      <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
        <pre className="whitespace-pre-wrap text-sm font-sans" dir="rtl">
          {fullText}
        </pre>
      </ScrollArea>
    );
  };

  return (
    <>
      <Card
        className={cn(
          "flex h-full flex-col transition-all duration-300",
          isActive ? "border-primary shadow-lg" : "border-dashed",
          status === "pending" && "bg-muted/30"
        )}
      >
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <CardTitle className="font-headline text-lg">{name}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div>{statusIcons[status]}</div>
        </CardHeader>
        {(hasResults || isActive) && (
          <CardContent className="flex-1">
            {isActive && status === "running" && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {hasResults && renderSummary()}
          </CardContent>
        )}
        {hasResults && (
          <CardFooter className="flex gap-2 flex-wrap">
            <Badge variant="secondary">مكتمل</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={handleView}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              عرض
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              تصدير
            </Button>
          </CardFooter>
        )}
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="font-headline text-xl">
              {name} - التقرير الكامل
            </DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {renderFullContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StationCard;

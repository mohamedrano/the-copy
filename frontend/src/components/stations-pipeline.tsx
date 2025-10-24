"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  AreaChart,
  BookOpenText,
  BrainCircuit,
  Gauge,
  Network,
  Play,
  Stethoscope,
  Users,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { runFullPipeline } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import StationCard from "./station-card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
// Dynamically import heavy components
const FileUpload = dynamic(() => import("./file-upload"), {
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  ),
});

const stations = [
  {
    id: 1,
    name: "المحطة 1: التحليل الأساسي",
    description: "يستخرج الشخصيات وعلاقاتهم.",
    Icon: Users,
  },
  {
    id: 2,
    name: "المحطة 2: التحليل المفاهيمي",
    description: "يحدد بيان القصة والنوع.",
    Icon: BookOpenText,
  },
  {
    id: 3,
    name: "المحطة 3: بناء الشبكة",
    description: "يبني هيكل شبكة الصراع.",
    Icon: Network,
  },
  {
    id: 4,
    name: "المحطة 4: مقاييس الكفاءة",
    description: "يقيس كفاءة وفعالية النص.",
    Icon: Gauge,
  },
  {
    id: 5,
    name: "المحطة 5: التحليل المتقدم",
    description: "يحلل الديناميكيات والرموز.",
    Icon: BrainCircuit,
  },
  {
    id: 6,
    name: "المحطة 6: التشخيص والعلاج",
    description: "يشخص الشبكة ويقترح تحسينات.",
    Icon: Stethoscope,
  },
  {
    id: 7,
    name: "المحطة 7: التقرير النهائي",
    description: "يولد التصورات والملخصات النهائية.",
    Icon: AreaChart,
  },
];

const StationsPipeline = () => {
  const [text, setText] = useState("");
  const [results, setResults] = useState({});
  const [statuses, setStatuses] = useState(
    Array(stations.length).fill("pending")
  );
  const [activeStation, setActiveStation] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const progress =
    (statuses.filter((s) => s === "completed").length / stations.length) * 100;

  const handleReset = () => {
    setText("");
    setResults({});
    setStatuses(Array(stations.length).fill("pending"));
    setActiveStation(null);
    setErrorMessage(null);
  };

  const handleStartAnalysis = () => {
    if (!text.trim()) {
      toast({
        title: "الإدخال مطلوب",
        description: "الرجاء إدخال بعض النصوص لتحليلها.",
        variant: "destructive",
      });
      return;
    }

    setStatuses(Array(stations.length).fill("pending"));
    setResults({});
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const pipelineResult = await runFullPipeline({
          fullText: text,
          projectName: "My Dramatic Analysis",
        });

        const formattedResults = {
          1: pipelineResult.stationOutputs.station1,
          2: pipelineResult.stationOutputs.station2,
          3: pipelineResult.stationOutputs.station3,
          4: pipelineResult.stationOutputs.station4,
          5: pipelineResult.stationOutputs.station5,
          6: pipelineResult.stationOutputs.station6,
          7: pipelineResult.stationOutputs.station7,
        };

        setResults(formattedResults);
        setStatuses(Array(stations.length).fill("completed"));
        setActiveStation(null);
        toast({
          title: "اكتمل التحليل",
          description: "لقد عالجت جميع المحطات النص بنجاح.",
        });
      } catch (error: any) {
        setErrorMessage(`فشل التحليل: ${error?.message || 'خطأ غير معروف'}`);
        toast({
          title: "فشل التحليل",
          description: error?.message || 'خطأ غير معروف',
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <FileUpload
          onFileContent={(content, filename) => {
            setText(content);
            toast({
              title: "تم تحميل الملف",
              description: `تم تحميل ${filename} بنجاح`,
            });
          }}
        />
        <Textarea
          placeholder="ألصق النص الدرامي هنا لبدء التحليل ..."
          className="min-h-48 w-full rounded-lg border-2 bg-card p-4 shadow-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isPending}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex gap-2">
            <Button
              onClick={handleStartAnalysis}
              disabled={isPending || !text}
              className="w-full sm:w-auto"
            >
              {isPending ? (
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="ml-2 h-4 w-4" />
              )}
              {isPending ? "جاري التحليل..." : "ابدأ التحليل"}
            </Button>
            {text && (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={isPending}
              >
                <X className="ml-2 h-4 w-4" />
                إعادة تعيين
              </Button>
            )}
          </div>
        </div>
      </div>

      {(isPending || progress > 0 || errorMessage) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-lg font-medium">
              خط أنابيب التحليل
            </h3>
            <span className="text-sm font-medium text-primary">{`${Math.round(progress)}%`}</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stations.map((station, index) => (
          <StationCard
            key={station.id}
            station={station}
            status={statuses[index]}
            results={results}
            isActive={activeStation === station.id}
          />
        ))}
      </div>
    </div>
  );
};

export default StationsPipeline;

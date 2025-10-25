"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect, useCallback } from "react";
import { TaskCategory, TaskType } from "@/lib/drama-analyst/enums";
import { useToast } from "@/hooks/use-toast";
import {
  AIResponse,
  ProcessedFile,
  AgentId,
  AIRequest,
} from "@/lib/drama-analyst/types";
import { submitTask } from "@/lib/drama-analyst/orchestration/executor";
import {
  MIN_FILES_REQUIRED,
  TASKS_REQUIRING_COMPLETION_SCOPE,
  COMPLETION_ENHANCEMENT_OPTIONS,
  TASK_LABELS,
  TASK_CATEGORY_MAP,
} from "@/lib/drama-analyst/constants";
import { agentIdToTaskTypeMap } from "@/lib/drama-analyst/agents/taskInstructions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Upload,
  Sparkles,
  Lightbulb,
  PenTool,
  FileText,
  Beaker,
  BarChart,
  Users,
  Search,
  Film,
  Globe,
  Code,
  Clipboard,
} from "lucide-react";
// Dynamically import heavy components
const FileUpload = dynamic(() => import("@/components/file-upload"), {
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});

const DramaAnalystApp: React.FC = () => {
  const [textInput, setTextInput] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [specialRequirements, setSpecialRequirements] = useState<string>("");
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [completionScope, setCompletionScope] = useState<string>("");
  const [selectedCompletionEnhancements, setSelectedCompletionEnhancements] =
    useState<TaskType[]>([]);

  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleTaskSelect = useCallback((task: TaskType) => {
    setSelectedTask(task);
    setError(null);
    setAiResponse(null);
    if (!TASKS_REQUIRING_COMPLETION_SCOPE.includes(task)) {
      setCompletionScope("");
    }
    if (task !== TaskType.COMPLETION) {
      setSelectedCompletionEnhancements([]);
    }
  }, []);

  const handleToggleEnhancement = useCallback((enhancementId: TaskType) => {
    setSelectedCompletionEnhancements((prev) =>
      prev.includes(enhancementId)
        ? prev.filter((id) => id !== enhancementId)
        : [...prev, enhancementId]
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selectedTask || textInput.length < 100) {
      setError("يرجى اختيار مهمة وإدخال نص لا يقل عن 100 حرف");
      return;
    }

    if (
      TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) &&
      !completionScope.trim()
    ) {
      setError(
        `لهذه المهمة (${TASK_LABELS[selectedTask] || selectedTask})، يرجى تحديد "نطاق الإكمال المطلوب"`
      );
      return;
    }

    setError(null);
    setAiResponse(null);
    setIsLoading(true);

    const agentId = Object.keys(agentIdToTaskTypeMap).find(
      (key) => agentIdToTaskTypeMap[key as AgentId] === selectedTask
    ) as AgentId;

    if (!agentId) {
      setError(`لا يمكن العثور على وكيل صالح للمهمة المحددة: ${selectedTask}`);
      setIsLoading(false);
      return;
    }

    const processedFile: ProcessedFile = {
      fileName: "input.txt",
      textContent: textInput,
      size: textInput.length,
      sizeBytes: textInput.length,
    };

    const request: AIRequest = {
      agent: agentId,
      prompt: specialRequirements,
      files: [processedFile],
      params: {
        additionalInfo,
        completionScope: TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask)
          ? completionScope
          : undefined,
        selectedCompletionEnhancements:
          selectedTask === TaskType.COMPLETION
            ? selectedCompletionEnhancements
            : undefined,
      },
    };

    try {
      const result = await submitTask(request);

      if (result.ok && result.value) {
        setAiResponse(result.value);
        toast({
          title: "تم التحليل بنجاح",
          description: "تم إكمال المهمة بنجاح",
        });
      } else if ("error" in result) {
        setError(result.error.message);
        toast({
          variant: "destructive",
          title: "خطأ في التحليل",
          description: result.error.message,
        });
      }
    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع أثناء الإرسال");
      toast({
        variant: "destructive",
        title: "خطأ في التحليل",
        description: e.message || "حدث خطأ غير متوقع",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    textInput,
    selectedTask,
    specialRequirements,
    additionalInfo,
    completionScope,
    selectedCompletionEnhancements,
    toast,
  ]);

  const getTaskIcon = (taskType: TaskType) => {
    const taskCategory = TASK_CATEGORY_MAP[taskType];

    switch (taskCategory) {
      case TaskCategory.CORE:
        if (taskType === TaskType.ANALYSIS)
          return <Lightbulb className="w-4 h-4" />;
        if (taskType === TaskType.CREATIVE)
          return <Sparkles className="w-4 h-4" />;
        if (taskType === TaskType.INTEGRATED)
          return <FileText className="w-4 h-4" />;
        if (taskType === TaskType.COMPLETION)
          return <PenTool className="w-4 h-4" />;
        break;
      case TaskCategory.ANALYSIS:
        return <Lightbulb className="w-4 h-4" />;
      case TaskCategory.CREATIVE:
        return <Sparkles className="w-4 h-4" />;
      case TaskCategory.PREDICTIVE:
        return <Beaker className="w-4 h-4" />;
      case TaskCategory.ADVANCED_MODULES:
        switch (taskType) {
          case TaskType.CHARACTER_DEEP_ANALYZER:
            return <Users className="w-4 h-4" />;
          case TaskType.DIALOGUE_ADVANCED_ANALYZER:
            return <Search className="w-4 h-4" />;
          case TaskType.VISUAL_CINEMATIC_ANALYZER:
            return <Film className="w-4 h-4" />;
          case TaskType.THEMES_MESSAGES_ANALYZER:
            return <Lightbulb className="w-4 h-4" />;
          case TaskType.CULTURAL_HISTORICAL_ANALYZER:
            return <Globe className="w-4 h-4" />;
          case TaskType.PRODUCIBILITY_ANALYZER:
            return <BarChart className="w-4 h-4" />;
          case TaskType.TARGET_AUDIENCE_ANALYZER:
            return <Users className="w-4 h-4" />;
          case TaskType.LITERARY_QUALITY_ANALYZER:
            return <PenTool className="w-4 h-4" />;
          case TaskType.RECOMMENDATIONS_GENERATOR:
            return <Sparkles className="w-4 h-4" />;
          default:
            return <Clipboard className="w-4 h-4" />;
        }
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const tasksByCategory = Object.entries(TASK_CATEGORY_MAP).reduce(
    (acc, [task, category]) => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(task as TaskType);
      return acc;
    },
    {} as Record<TaskCategory, TaskType[]>
  );

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            المحلل الدرامي والمبدع المحاكي
          </CardTitle>
          <CardDescription className="text-center">
            منصة ذكية لتحليل النصوص الدرامية وإنتاج محتوى إبداعي محاكي باستخدام
            الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
      </Card>

      {/* إدخال النص */}
      <Card>
        <CardHeader>
          <CardTitle>إدخال النص</CardTitle>
          <CardDescription>الصق النص الدرامي هنا أو حمل ملف</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            onFileContent={(content, filename) => {
              setTextInput(content);
              toast({
                title: "تم تحميل الملف",
                description: `تم تحميل ${filename} بنجاح`,
              });
            }}
          />
          <Textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="min-h-40 w-full"
            placeholder="الصق النص الدرامي هنا... (100 حرف على الأقل)"
          />
          <p className="text-sm text-muted-foreground mt-2">
            عدد الأحرف: {textInput.length}
          </p>
        </CardContent>
      </Card>

      {/* اختيار المهمة */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار نوع التحليل</CardTitle>
          <CardDescription>اختر نوع التحليل أو المهمة المطلوبة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tasksByCategory).map(([category, tasks]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">
                  {category}
                </h4>
                {tasks.map((task) => (
                  <Button
                    key={task}
                    variant={selectedTask === task ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleTaskSelect(task)}
                  >
                    {getTaskIcon(task)}
                    <span className="mr-2">{TASK_LABELS[task] || task}</span>
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* تحسينات الإكمال */}
      {selectedTask === TaskType.COMPLETION && (
        <Card>
          <CardHeader>
            <CardTitle>تحسينات الإكمال</CardTitle>
            <CardDescription>اختر التحسينات الإضافية للإكمال</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {COMPLETION_ENHANCEMENT_OPTIONS.map((enhancement) => (
                <div key={enhancement} className="flex items-center space-x-2">
                  <Checkbox
                    id={enhancement}
                    checked={selectedCompletionEnhancements.includes(
                      enhancement
                    )}
                    onCheckedChange={() => handleToggleEnhancement(enhancement)}
                  />
                  <Label htmlFor={enhancement} className="text-sm">
                    {TASK_LABELS[enhancement] || enhancement}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* نطاق الإكمال */}
      {selectedTask &&
        TASKS_REQUIRING_COMPLETION_SCOPE.includes(selectedTask) && (
          <Card>
            <CardHeader>
              <CardTitle>نطاق الإكمال المطلوب</CardTitle>
              <CardDescription>حدد مدى الإكمال المطلوب</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={completionScope}
                onChange={(e) => setCompletionScope(e.target.value)}
                placeholder="مثال: فصل واحد، 3 مشاهد، حتى نهاية المسرحية، حلقتان..."
              />
            </CardContent>
          </Card>
        )}

      {/* متطلبات خاصة */}
      <Card>
        <CardHeader>
          <CardTitle>متطلبات خاصة (اختياري)</CardTitle>
          <CardDescription>أضف أي متطلبات أو توجيهات خاصة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="specialRequirements">متطلبات خاصة</Label>
            <Textarea
              id="specialRequirements"
              value={specialRequirements}
              onChange={(e) => setSpecialRequirements(e.target.value)}
              placeholder="أضف أي متطلبات خاصة هنا..."
            />
          </div>
          <div>
            <Label htmlFor="additionalInfo">معلومات إضافية</Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="أضف أي معلومات إضافية هنا..."
            />
          </div>
        </CardContent>
      </Card>

      {/* زر الإرسال */}
      <div className="text-center">
        <Button
          onClick={handleSubmit}
          disabled={isLoading || !selectedTask || textInput.length < 100}
          size="lg"
          className="px-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              {selectedTask
                ? TASK_LABELS[selectedTask] || "بدء المعالجة"
                : "بدء المعالجة"}
            </>
          )}
        </Button>
      </div>

      {/* رسائل الخطأ */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>خطأ</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* النتائج */}
      {aiResponse && (
        <Card>
          <CardHeader>
            <CardTitle>نتائج التحليل</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertTitle>التحليل الدرامي</AlertTitle>
              <AlertDescription className="prose prose-sm dark:prose-invert mt-2 whitespace-pre-wrap">
                {aiResponse.raw || JSON.stringify(aiResponse.parsed, null, 2)}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DramaAnalystApp;

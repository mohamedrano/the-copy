"use client";

import dynamic from "next/dynamic";

const StationsPipeline = dynamic(
  () => import("@/components/stations-pipeline"),
  {
    loading: () => (
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              جاري تحميل نظام التحليل العميق...
            </p>
          </div>
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function DeepAnalysisPage() {
  return (
    <div className="container mx-auto max-w-7xl">
      <StationsPipeline />
    </div>
  );
}

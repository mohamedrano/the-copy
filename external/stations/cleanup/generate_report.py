#!/usr/bin/env python3

import json

# قائمة الملفات المرشحة للحذف
files_to_remove = [
    # ملفات examples (مكررة)
    {"file": "src/components/examples/AnalysisCard.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/CharacterNode.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/ConflictNetwork.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/DiagnosticPanel.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/Header.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/HeroSection.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/MetricCard.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/StationProgress.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    {"file": "src/components/examples/TextInput.tsx", "reason": "duplicate", "risk": "low", "evidence": "Example file that imports and uses the main component - safe to remove", "category": "examples"},
    
    # ملفات الخادم غير المستخدمة
    {"file": "server/services/ai/result-selector.ts", "reason": "unused", "risk": "medium", "evidence": "File not imported anywhere in the codebase", "category": "server_unused"},
    {"file": "server/storage.ts", "reason": "unused", "risk": "high", "evidence": "File not imported anywhere in the codebase - investigate before removal", "category": "server_unused"},
    {"file": "server/vite.ts", "reason": "unused", "risk": "medium", "evidence": "File not imported anywhere in the codebase", "category": "server_unused"},
    {"file": "server/middleware/auth.ts", "reason": "unused", "risk": "high", "evidence": "Middleware file not imported in routes.ts - investigate before removal", "category": "server_unused"},
    {"file": "server/middleware/rate-limit.ts", "reason": "unused", "risk": "high", "evidence": "Middleware file not imported in routes.ts - investigate before removal", "category": "server_unused"},
    {"file": "server/middleware/sanitize.ts", "reason": "unused", "risk": "high", "evidence": "Middleware file not imported in routes.ts - investigate before removal", "category": "server_unused"},
    
    # ملفات مولدة
    {"file": "stations.thecopy.code-workspace", "reason": "generated", "risk": "low", "evidence": "VS Code workspace file - safe to remove", "category": "generated"},
    {"file": "debug.log", "reason": "generated", "risk": "low", "evidence": "Debug log file - safe to remove", "category": "generated"},
    
    # ملفات مكررة
    {"file": "QUICKSTART.md.pdf", "reason": "redundant", "risk": "low", "evidence": "PDF version of markdown file - redundant", "category": "redundant"},
    {"file": "السياق الهندسي للتطبيق كاملا.ini", "reason": "redundant", "risk": "low", "evidence": "INI file with Arabic name - likely configuration artifact", "category": "redundant"},
]

# كتابة التقرير
with open('cleanup/trash_report.jsonl', 'w', encoding='utf-8') as f:
    for item in files_to_remove:
        f.write(json.dumps(item, ensure_ascii=False) + '\n')

print("Report generated successfully in cleanup/trash_report.jsonl")
print(f"Total files: {len(files_to_remove)}")

# Statistics
categories = {}
risks = {}
for item in files_to_remove:
    cat = item['category']
    risk = item['risk']
    categories[cat] = categories.get(cat, 0) + 1
    risks[risk] = risks.get(risk, 0) + 1

print("\nStatistics:")
print("Categories:")
for cat, count in categories.items():
    print(f"  {cat}: {count}")
print("Risk levels:")
for risk, count in risks.items():
    print(f"  {risk}: {count}")

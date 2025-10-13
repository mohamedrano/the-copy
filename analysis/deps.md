# خريطة اعتماديات الوحدات

```mermaid
graph LR
  CleanEditor[CleanIntegratedScreenplayEditor]
  CleanEditor --> TextOps[AdvancedSearchEngine]
  CleanEditor --> Classifier[ScreenplayClassifier]
  CleanEditor --> StateMgr[StateManager]
  CleanEditor --> AutoSave
  CleanEditor --> Collab[CollaborationSystem]
  CleanEditor --> Projects[ProjectManager]
  CleanEditor --> Planning[VisualPlanningSystem]

  GeminiIndex[agents/core/index] --> GeminiSvc[processTextsWithGemini]
  GeminiSvc --> FilePrep[processFilesForGemini]
  GeminiSvc --> PromptParts[constructPromptParts]

  TextOps -.future-> TextKit[@app/editor/text-kit]
  Classifier -.future-> ClassifierPkg[@app/domain/screenplay-classifier]
  StateMgr -.future-> StatePkg[@app/editor/state]
  Collab -.future-> CollabPkg[@app/collab/management]
  GeminiSvc -.future-> GeminiPkg[@app/integration/gemini]
```


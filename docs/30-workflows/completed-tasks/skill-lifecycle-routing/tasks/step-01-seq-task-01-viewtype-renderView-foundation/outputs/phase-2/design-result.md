# Phase 2: 設計 - 設計結果

## 設計日時

2026-03-17

## 1. ViewType 変更設計

### 変更後の完全な型定義

```typescript
export type ViewType =
  | "dashboard"
  | "workspace"
  | "editor"
  | "chat"
  | "graph"
  | "settings"
  | "agent"
  | "skillCenter"
  | "historySearch"
  | "chainBuilder"
  | "scheduleManager"
  | "debugPanel"
  | "analyticsDashboard"
  | "skill-editor"
  | "skill-center"
  | "skillAnalysis"
  | "skillCreate";
```

合計17メンバー。既存15 + 新規2。

## 2. renderView() case 設計

### 追加するコードスニペット（skill-editor caseの直後に配置）

```typescript
case "skillAnalysis":
  return (
    <SkillAnalysisView
      skillName={currentSkillName ?? "demo-skill"}
      onClose={() => {
        setCurrentView("skillCenter");
        setCurrentSkillName(null);
      }}
    />
  );
case "skillCreate":
  return (
    <SkillCreateWizard
      onClose={() => setCurrentView("skillCenter")}
    />
  );
```

### 設計根拠

- skillAnalysis: skill-editorと同パターン。currentSkillNameをリセットする
- skillCreate: 新規作成のためcurrentSkillNameは不要
- 閉じる先は両方とも "skillCenter"

## 3. SkillLifecycleJobGuide 型設計

### 変更後のインターフェース

```typescript
export interface SkillLifecycleJobGuide {
  id: SkillLifecycleJob;
  title: string;
  entryLabel: string;
  handoffLabel: string;
  summary: string;
  completion: string;
  onAction?: () => void;
}
```

### 設計根拠

- onActionはオプショナル: SKILL_LIFECYCLE_JOB_GUIDES定数のas const定義を変更せずに済む
- Task02がJourneyPanel CTAで使用する

## 4. 変更影響範囲

| 変更           | 影響ファイル                        | 影響内容                          |
| -------------- | ----------------------------------- | --------------------------------- |
| ViewType +2    | navigationSlice.ts                  | 自動拡張（変更不要）              |
| ViewType +2    | normalizeSkillLifecycleView戻り値型 | Exclude結果に含まれる（変更不要） |
| ViewType +2    | shouldResetUnauthenticatedView.ts   | exhaustive checkなし（変更不要）  |
| onAction? 追加 | SKILL_LIFECYCLE_JOB_GUIDES          | オプショナル（変更不要）          |

## Phase 3 への引き継ぎ

- 設計スニペットは現状コードと整合している
- 破壊的変更はない

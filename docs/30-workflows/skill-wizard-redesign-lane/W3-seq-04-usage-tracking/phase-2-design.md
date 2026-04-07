# Phase 2: 設計

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| タスクID   | UT-SKILL-WIZARD-W3-seq-04    |
| 機能名     | 使用率計装（usage tracking） |
| 前提Phase  | Phase 1                      |
| 後続Phase  | Phase 3                      |
| 作成日     | 2026-04-07                   |
| ステータス | pending                      |

## 目的

`trackEvent` 関数の実装方針を確定し、呼び出し側を増やさずに将来の差し替えができる最小構成を固定する。  
このタスクは visible surface を変えない NON_VISUAL であり、計装は renderer 内部の副作用として閉じる。
既存の `SkillAnalytics` / `AnalyticsStore` は execution-centric のため、W3 の UI イベントは renderer-local の薄い抽象に留める。

## trackEvent 関数設計

### 実装方針

`trackEvent` は 1 ファイルに閉じる。`SkillWizardEvents` の型定義と実装を同じ境界に置き、呼び出し側は 5 つのイベント名だけを扱う。

```typescript
// apps/desktop/src/renderer/utils/trackEvent.ts
import type { SkillCategory } from "packages/shared/src/types/skill";

export type SkillWizardEvents = {
  skill_wizard_started: Record<never, never>;
  skill_wizard_step1_completed: {
    method: "complete" | "skip";
    skippedAtQuestion: number | null;
  };
  skill_wizard_generation_completed: {
    method: "complete" | "skip";
    category: SkillCategory;
    hasExternalIntegration: boolean;
  };
  skill_skeleton_quality_feedback: {
    satisfied: boolean;
    generationMethod: "complete" | "skip";
  };
  skill_wizard_next_action: {
    action: "execute" | "open_editor" | "create_another";
  };
};

export function trackEvent<K extends keyof SkillWizardEvents>(
  eventName: K,
  payload: SkillWizardEvents[K],
): void {
  if (process.env.NODE_ENV !== "production") {
    console.info("[trackEvent]", eventName, payload);
  }
}
```

### 拡張方針

- 現行: 開発環境だけ `console.info`、本番は no-op
- 方針: `trackEvent` は renderer-local の薄い抽象に閉じ、`SkillAnalytics` / `AnalyticsStore` は execution イベント系と切り分ける
- 将来: 呼び出し側を変えずに、内部の sink を analytics adapter に差し替える
- 避けること: localEventStore や dashboard 連携を今の時点で分割しすぎないこと

### 責務の置き場所

| 境界                                | 責務                                                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SkillCreateWizard.tsx`             | `skill_wizard_started` / `skill_wizard_step1_completed` / `skill_wizard_generation_completed` / `skill_skeleton_quality_feedback` / `skill_wizard_next_action` の発火点を持つ |
| `CompleteStep.tsx`                  | next action の UI と `onNextAction` の通知のみを持つ。trackEvent は呼ばない                                                                                                   |
| `trackEvent.ts`                     | 型安全なイベント定義と開発時ログを持つ renderer-local 抽象                                                                                                                    |
| `SkillAnalytics` / `AnalyticsStore` | execution-centric の既存基盤として維持し、W3 の UI 計装とは直接接続しない                                                                                                     |

## 計装ポイント配置設計

| ファイル                | 関数/フック               | 計装イベント                             |
| ----------------------- | ------------------------- | ---------------------------------------- |
| `SkillCreateWizard.tsx` | `useEffect`（マウント時） | `skill_wizard_started`                   |
| `SkillCreateWizard.tsx` | `handleGenerate()`        | `skill_wizard_step1_completed`（生成前） |
| `SkillCreateWizard.tsx` | `handleGenerate()` 完了後 | `skill_wizard_generation_completed`      |
| `SkillCreateWizard.tsx` | `handleQualityFeedback()` | `skill_skeleton_quality_feedback`        |
| `SkillCreateWizard.tsx` | `handleNextAction()`      | `skill_wizard_next_action`               |

## 参照資料

| 資料名               | パス                                                                 | 用途           |
| -------------------- | -------------------------------------------------------------------- | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`                         | Phase 1 成果物 |
| イベントスキーマ定義 | `outputs/phase-1/event-schema-definition.md`                         | Phase 1 成果物 |
| W2-seq-03a成果物     | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`   | 計装先確認     |
| CompleteStep         | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx` | 計装先確認     |

## 実行タスク

1. Phase 1 成果物を確認し、設計の前提を固める。
2. 既存 `trackEvent` 実装の有無を調査する。
3. スタブ実装の設計を確定する。
4. `CompleteStep` は presentational に留め、next action の計装責務を親へ寄せる。
5. 計装ポイント配置設計テーブルを完成させる。

## 統合テスト連携

- Phase 4 で `trackEvent` の mock テストを作成し、Phase 1 の AC-01〜AC-05 と 1 対 1 で紐付ける。
- Phase 6 で complete / skip / feedback / next action の edge case を追加し、payload の欠落がないことを確認する。
- Phase 11 では visible surface 変更なしのため NON_VISUAL 扱いで console ログと自動テスト結果を証跡にする。

## 成果物

| 成果物     | パス                                       | 説明                     |
| ---------- | ------------------------------------------ | ------------------------ |
| 実装設計書 | `outputs/phase-2/implementation-design.md` | trackEvent実装方針       |
| 拡張設計書 | `outputs/phase-2/extension-design.md`      | 将来的な分析基盤接続設計 |
| テスト戦略 | `outputs/phase-2/test-strategy.md`         | モックテスト方針         |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] trackEvent スタブ実装の設計が確定していること
- [ ] 将来の差し替えは 1 つの sink 境界として記述されていること
- [ ] 型安全な計装設計が記述されていること
- [ ] visible surface を変えない NON_VISUAL 方針が明記されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 既存基盤調査
3. スタブ実装設計の確定
4. 将来拡張設計の記述
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビュー

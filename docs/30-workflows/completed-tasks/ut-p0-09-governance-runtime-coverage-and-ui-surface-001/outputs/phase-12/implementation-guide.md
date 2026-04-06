# Implementation Guide

## UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001

作成日: 2026-04-02

## 概要

このタスクでは、Skill Creator runtime の governance が `plan` / `execute` / `verify` / `improve` の全フェーズで同じ前提で追跡できることを確認し、その状態を renderer で見えるようにしました。あわせて system spec に残っていた execute-only 前提の表現を current facts に合わせて修正しました。

## 変更ファイル一覧

### 新規作成

| ファイル                                                                                             | 説明                              |
| ---------------------------------------------------------------------------------------------------- | --------------------------------- |
| `apps/desktop/src/renderer/components/organisms/AgentView/GovernanceSummaryPanel.tsx`                | governance 状態表示コンポーネント |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/GovernanceSummaryPanel.test.tsx` | renderer 単体テスト 13 ケース     |
| `apps/desktop/src/main/services/runtime/__tests__/governance/GovernanceAllPhases.test.ts`            | 全フェーズ配線テスト 12 ケース    |

### 修正

| ファイル                                                                                             | 変更内容                                    |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `apps/desktop/src/renderer/components/organisms/AgentView/AdvancedSettingsPanel.tsx`                 | `GovernanceSummaryPanel` を統合             |
| `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/AdvancedSettingsPanel.test.tsx`  | 統合テストと preload mock を追加            |
| `.claude/skills/aiworkflow-requirements/references/lessons-learned-governance-hooks-phase-policy.md` | execute-only 前提を current facts に更新    |
| `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md`          | follow-up 表現を完了状態へ更新              |
| `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`                       | 本 UT の完了記録を追記                      |
| `docs/30-workflows/unassigned-task/UT-P0-09-GOVERNANCE-RUNTIME-COVERAGE-AND-UI-SURFACE-001.md`       | source unassigned task を完了済み前提へ更新 |

## Part 1

### なぜ必要か

governance は「今この作業で、どの道具をどこまで使ってよいか」を決める安全ルールです。これが内部でしか分からないままだと、なぜ拒否されたのか、今どのフェーズなのか、前のセッションで何が起きたのかが見えません。見えないと、使う人は「壊れたのか」「設定ミスか」「仕様どおりか」を判断できません。

### 何をするか

今回の実装では、詳細設定パネルの中に `GovernanceSummaryPanel` を追加し、次の 3 つを見えるようにしました。

| 見えるようになったもの | 意味                                                    |
| ---------------------- | ------------------------------------------------------- |
| 現在フェーズ           | 今が `plan` / `execute` / `verify` / `improve` のどれか |
| 許可モード             | 現在の policy がどの permission mode で動いているか     |
| 最近の拒否とイベント数 | 直近で拒否された操作と、最近の監査イベント件数          |

### 日常の例え

たとえば: 空港の保安ゲートのようなものです。入口で「この人はここまで進める」「この荷物は止める」と判定していても、利用者側に何が理由で止まったか見えなければ混乱します。今回の UI は、その判定結果を電光掲示板のように表示する役目です。

### 今回作ったもの

| 項目                          | 今回の役割                                  |
| ----------------------------- | ------------------------------------------- |
| `GovernanceSummaryPanel`      | governance 状態の表示                       |
| `AdvancedSettingsPanel`       | 表示場所の提供                              |
| `GovernanceAllPhases.test.ts` | 全フェーズで policy が有効か確認            |
| Phase 11 成果物               | スクリーンショット実施可否と N/A 根拠の記録 |

## Part 2

### 型定義

```ts
export interface SkillCreatorGovernanceState {
  phase: SkillCreatorGovernancePhase;
  activePolicy: SkillCreatorSdkPolicy;
  recentAuditEvents: SkillCreatorGovernanceAuditEvent[];
  recentDenials: SkillCreatorSdkPermissionDenial[];
}
```

### API シグネチャ

```ts
getGovernanceState(): Promise<IpcResult<SkillCreatorGovernanceState>>
```

Renderer は preload 経由で `window.electronAPI.skillCreator.getGovernanceState()` を呼びます。

### 使用例

```tsx
import { GovernanceSummaryPanel } from "./GovernanceSummaryPanel";

export const AdvancedSettingsPanel = () => {
  return (
    <div>
      <GovernanceSummaryPanel />
    </div>
  );
};
```

### 実装詳細

`GovernanceSummaryPanel` は Props を持たない自己完結型です。`useEffect` で初回取得し、その後 `setInterval(5_000)` でポーリングします。表示状態は `loading` / `error` / `data` の 3 系統です。

全フェーズ配線は `RuntimeSkillCreatorFacade` の既存 public surface を再確認しました。

| フェーズ  | メソッド        | 配線                               |
| --------- | --------------- | ---------------------------------- |
| `plan`    | `plan()`        | `createGovernanceHooks("plan")`    |
| `execute` | `execute()`     | `createGovernanceHooks("execute")` |
| `verify`  | `verifySkill()` | `createGovernanceHooks("verify")`  |
| `improve` | `improve()`     | `createGovernanceHooks("improve")` |

### エラーハンドリング

| ケース                         | 挙動                                     |
| ------------------------------ | ---------------------------------------- |
| IPC が `success: false` を返す | `取得エラー` を表示                      |
| IPC 呼び出しが例外を投げる     | 例外メッセージを表示                     |
| preload API が未注入           | `Governance API が利用できません` を表示 |

### エッジケース

| ケース                    | 対応                              |
| ------------------------- | --------------------------------- |
| `recentDenials` が空配列  | `No recent denials` を表示        |
| `recentDenials` が 5 件超 | 先頭 5 件に切り詰めて表示         |
| `allowedTools` が空配列   | クラッシュさせず panel を継続表示 |
| アンマウント              | `clearInterval` で polling を停止 |

### 設定項目と定数一覧

| 名前                        | 値       | 用途                             |
| --------------------------- | -------- | -------------------------------- |
| `POLL_INTERVAL_MS`          | `5000`   | governance 状態の再取得間隔      |
| `GOVERNANCE_FALLBACK_ERROR` | 固定文言 | preload 未注入時のフォールバック |

### テスト構成

| テストスイート                    | 件数 | 役割                                              |
| --------------------------------- | ---- | ------------------------------------------------- |
| `GovernanceSummaryPanel.test.tsx` | 13   | loading / error / data / polling / preload 未注入 |
| `AdvancedSettingsPanel.test.tsx`  | 15   | 親パネル統合と既存 UI 回帰                        |
| `GovernanceAllPhases.test.ts`     | 12   | 全フェーズ配線と denial 記録                      |

カバレッジレポート上の実測記録:

| 対象                     | Line   | Branch | Function |
| ------------------------ | ------ | ------ | -------- |
| `GovernanceSummaryPanel` | 約 85% | 約 75% | 100%     |
| `GovernanceAllPhases`    | 80%+   | 65%+   | 85%+     |

### Phase 11 スクリーンショット参照

このタスクは UI surface 追加を含みますが、現ワークツリーでは Electron 実行環境がないため、Phase 11 は N/A 根拠つきで閉じています。参照先は以下です。

- `outputs/phase-11/screenshots/screenshot-plan.json`
- `outputs/phase-11/screenshots/phase11-capture-metadata.json`
- `outputs/phase-11/manual-test-report.md`
- `outputs/phase-11/screenshot-coverage.md`

### 受入条件確認

| AC   | 条件                             | 結果                       |
| ---- | -------------------------------- | -------------------------- |
| AC-1 | 全フェーズ governance hooks 配線 | PASS                       |
| AC-2 | `GovernanceSummaryPanel` 実装    | PASS                       |
| AC-3 | denial / summary 表示            | PASS                       |
| AC-4 | Phase 11 evidence 記録           | PASS（N/A 根拠を成果物化） |
| AC-5 | execute-only 文言除去            | PASS                       |

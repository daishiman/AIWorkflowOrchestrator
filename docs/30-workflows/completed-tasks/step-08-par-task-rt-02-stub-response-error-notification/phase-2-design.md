# Phase 2: 設計

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 2                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

explicit error union を既存契約に最も少ない差分で導入する。

## 実行タスク

- plan error union を設計する
- improve degraded path の再利用方針を設計する
- execute 抑止フローを設計する
- IPC / renderer 境界を設計する

## 参照資料

| 資料名       | パス                                                                  | 説明                 |
| ------------ | --------------------------------------------------------------------- | -------------------- |
| Phase 1 要件 | `phase-1-requirements.md`                                             | 問題点と影響範囲     |
| shared types | `packages/shared/src/types/skillCreator.ts`                           | existing union 契約  |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | degraded 実装        |
| IPC handler  | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | outer IpcResult 境界 |
| renderer     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | type guard 運用箇所  |

## 実行手順

### ステップ1: 型設計

```typescript
type RuntimeSkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable";

interface RuntimeSkillCreatorPlanErrorResponse {
  success: false;
  error: {
    code: RuntimeSkillCreatorDegradedReason | "VALIDATION_ERROR";
    message: string;
  };
}

type RuntimeSkillCreatorPlanResponse =
  | RuntimeSkillCreatorPlanResult
  | RuntimeSkillCreatorPlanErrorResponse
  | { type: "terminal_handoff"; guidance: HandoffGuidance };
```

- `status` 追加は採用しない
- reason code は `error.code` に集約する
- `RuntimeSkillCreatorImproveErrorResponse` と shape を揃える

### ステップ2: Facade 設計

- `plan()` の stub success を `RuntimeSkillCreatorPlanErrorResponse` に置換する
- `improve()` の空 suggestion 返却を `RuntimeSkillCreatorImproveErrorResponse` に置換する
- `execute()` は response shape を変えず、renderer 側が invalid plan を実行しない設計にする

### ステップ3: IPC / renderer 設計

| 層       | 方針                                                                   |
| -------- | ---------------------------------------------------------------------- |
| IPC      | outer `success:false` は validation / exception のみ                   |
| IPC      | logical error は `success:true, data:<error union>` で返す             |
| renderer | `isRuntimePlanErrorResponse()` を追加する                              |
| renderer | plan logical error 時は execute CTA を無効化し、error state を表示する |

## 統合テスト連携

- Phase 4 で union type guard と transport failure を分離したテストを定義する
- Phase 6 で unknown reason fallback と wizard/lifecycle parity を追加する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                   |
| ------------------ | -------- | -------------------------------------------- |
| アーキテクチャ     | 必須     | `aiworkflow-requirements: architecture-*.md` |
| API設計            | 必須     | `aiworkflow-requirements: api-*.md`          |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`        |

## 成果物

| 成果物               | パス                                       | 説明                |
| -------------------- | ------------------------------------------ | ------------------- |
| 設計書               | `phase-2-design.md`                        | 契約と責務分解      |
| error union 設計     | `outputs/phase-2/error-response-design.md` | plan / improve 契約 |
| reason code カタログ | `outputs/phase-2/reason-code-catalog.md`   | error.code 一覧     |

## 完了条件

- [ ] `status` 横展開案を破棄し union 契約へ整理している
- [ ] plan / improve / execute の責務差が明文化されている
- [ ] IPC outer error と logical error の境界が定義されている
- [ ] renderer の execute 抑止条件が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

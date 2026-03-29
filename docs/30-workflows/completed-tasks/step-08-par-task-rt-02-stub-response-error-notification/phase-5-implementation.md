# Phase 5: 実装

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 5                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

explicit error union を shared types / facade / renderer に実装し、false-success を除去する。

## 実行タスク

- plan error union を shared types に追加する
- Facade の false-success を explicit error に置換する
- renderer に plan error type guard と execute 抑止を追加する
- IPC handler の境界を維持する
- テストを更新する

## 参照資料

| 資料名       | パス                                                                  | 説明       |
| ------------ | --------------------------------------------------------------------- | ---------- |
| Phase 2 設計 | `phase-2-design.md`                                                   | 実装方針   |
| shared types | `packages/shared/src/types/skillCreator.ts`                           | 契約追加先 |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 実装対象   |
| renderer     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`  | UI 変更点  |

## 実行手順

### ステップ1: shared type を追加する

- `RuntimeSkillCreatorDegradedReason` を追加する
- `RuntimeSkillCreatorPlanErrorResponse` を追加する
- `RuntimeSkillCreatorPlanResponse` を union 拡張する
- `RuntimeSkillCreatorImproveErrorResponse` の code を degraded reason と整合させる

### ステップ2: Facade を修正する

- `plan()` の stub success を error union に置換する
- `improve()` の空 suggestions を error response に置換する
- `execute()` は shape を維持し、invalid plan 実行を UI 側で抑止する

### ステップ3: renderer を修正する

- `isRuntimePlanErrorResponse()` を追加する
- logical error 受信時に error state を表示する
- execute 開始ボタン / 次段導線を無効化する
- `SkillCreateWizard.tsx` でも同じ表示規則に揃える

## 統合テスト連携

- Phase 6 で wizard/lifecycle parity と fallback 文言を補強する
- Phase 9 で union 追加後の typecheck/lint を再監査する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| アーキテクチャ     | 必須     | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信            | 必須     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`                  |

## 成果物

| 成果物   | パス                                       | 説明               |
| -------- | ------------------------------------------ | ------------------ |
| 実装記録 | `phase-5-implementation.md`                | 実装方針と変更点   |
| 実装ログ | `outputs/phase-5/implementation-record.md` | ファイル別実施内容 |

## 完了条件

- [ ] `status/degradedReason/userMessage` 横展開案を実装していない
- [ ] plan / improve の false-success が除去されている
- [ ] execute 抑止が renderer に実装されている
- [ ] IPC outer wrapper の責務が壊れていない
- [ ] **本Phase内の全タスクを100%実行完了**

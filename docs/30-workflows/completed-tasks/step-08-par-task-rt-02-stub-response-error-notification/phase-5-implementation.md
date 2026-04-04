# Phase 5: 実装

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 5                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |
| 更新日 | 2026-04-04（実装状況反映）       |

## 目的

explicit error union を shared types / facade / renderer に実装し、false-success を除去する。

## 実行タスク

- plan error union を shared types に追加する
- Facade の false-success を explicit error に置換する
- renderer に plan error type guard と execute 抑止を追加する
- IPC handler の境界を維持する
- テストを更新する

## 参照資料

| 資料名       | パス                                                                                                                                      | 説明       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Phase 2 設計 | `phase-2-design.md`                                                                                                                       | 実装方針   |
| shared types | `packages/shared/src/types/skillCreator.ts`                                                                                               | 契約追加先 |
| Facade       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                                                     | 実装対象   |
| renderer     | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` / `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx` | UI 変更点  |

## 実装状況（2026-04-04 確認済み）

### 実装済み

| 項目                                      | ファイル                                                                                              | 行           | 状態 |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------ | ---- |
| `RuntimeSkillCreatorDegradedReason` 型    | `packages/shared/src/types/skillCreator.ts`                                                           | :744         | [x]  |
| `RuntimeSkillCreatorPlanErrorResponse` 型 | `packages/shared/src/types/skillCreator.ts`                                                           | :751         | [x]  |
| `buildDegradedError()` ヘルパー           | `RuntimeSkillCreatorFacade.ts`                                                                        | :1706        | [x]  |
| `DEGRADED_REASON_MESSAGES` マップ         | `RuntimeSkillCreatorFacade.ts`                                                                        | :1696        | [x]  |
| `plan()` の `!this.llmAdapter` ガード     | `RuntimeSkillCreatorFacade.ts`                                                                        | :814         | [x]  |
| `plan()` の `!this.resourceLoader` ガード | `RuntimeSkillCreatorFacade.ts`                                                                        | :818         | [x]  |
| `improve()` の同型ガード                  | `RuntimeSkillCreatorFacade.ts`                                                                        | :1275        | [x]  |
| `execute()` の `!this.llmAdapter` ガード  | `RuntimeSkillCreatorFacade.ts`                                                                        | :1056        | [x]  |
| `stub-elimination.test.ts`                | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts` | -            | [x]  |
| `isRuntimePlanErrorResponse()` type guard | `SkillLifecyclePanel.tsx`                                                                             | :241         | [x]  |
| UI plan エラー表示                        | `SkillLifecyclePanel.tsx` / `SkillCreateWizard.tsx`                                                   | :1187 / :254 | [x]  |
| UI execute エラー表示                     | `SkillLifecyclePanel.tsx`                                                                             | :1309        | [x]  |

### 残課題

なし

## 実行手順

### ステップ1: shared type を追加する（完了済み）

- [x] `RuntimeSkillCreatorDegradedReason` を追加する
- [x] `RuntimeSkillCreatorPlanErrorResponse` を追加する
- [x] `RuntimeSkillCreatorPlanResponse` を union 拡張する
- [x] `RuntimeSkillCreatorImproveErrorResponse` の code を degraded reason と整合させる

### ステップ2: Facade を修正する（完了済み）

- [x] `plan()` の stub success を error union に置換する
- [x] `improve()` の空 suggestions を error response に置換する
- [x] `_executeInternal()` の `!this.llmAdapter` ガードを追加する（Facade.ts:1046 直後）

### ステップ3: renderer を修正する（完了済み）

- [x] `isRuntimePlanErrorResponse()` を追加する
- [x] logical error 受信時に error state を表示する
- [x] execute 開始ボタン / 次段導線を無効化する
- `SkillCreateWizard.tsx` も同じ表示規則に揃っているため、Phase 6 TC-12 では parity を再確認する

### ステップ4: stub-elimination テスト作成（T-02 完了済み）

- [x] **T-02**: 以下パスに新規テストファイルを作成する
  - パス: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts`
  - 既存パターン参照: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts`

**テストケース一覧:**

| TC    | 条件                                       | 期待結果                                  |
| ----- | ------------------------------------------ | ----------------------------------------- |
| TC-10 | `llmAdapter` 未注入時に `execute()` を呼ぶ | `success: false` を返す                   |
| TC-11 | `llmAdapter` 注入済みで `execute()` を呼ぶ | 正常処理される（回帰テスト）              |
| TC-12 | `plan()` で `llmAdapter` 未注入            | `success: false` を返す（既存実装の回帰） |
| TC-13 | `plan()` で `resourceLoader` 未注入        | `success: false` を返す（既存実装の回帰） |

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

- [x] `status/degradedReason/userMessage` 横展開案を実装していない
- [x] plan / improve の false-success が除去されている
- [x] execute 抑止が renderer に実装されている
- [x] IPC outer wrapper の責務が壊れていない
- [x] T-01: `_executeInternal()` の `!this.llmAdapter` ガードが実装されている
- [x] T-02: `stub-elimination.test.ts` が作成・PASS している
- [x] **本Phase内の全タスクを100%実行完了**

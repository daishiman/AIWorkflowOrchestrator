# Phase 1: 要件定義

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 1                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

false-success が発生する実装点と、最小変更で直せる公開契約を固定する。

## 実行タスク

- plan / improve の degraded 実装事実を確定する
- execute の責務を「実行防止」に限定する
- explicit error union の要件を定義する
- IPC / renderer の境界条件を定義する
- AC-1〜AC-7 と実装ポイントの対応を固定する

## 参照資料

| 資料名           | パス                                                                  | 説明                            |
| ---------------- | --------------------------------------------------------------------- | ------------------------------- |
| lane 要件草案    | `../skill-creator-agent-sdk-lane/requirements-draft.md`               | 親レーンの runtime / UI 要件    |
| 親 workflow pack | `../skill-creator-agent-sdk-lane/root-workflow-pack/index.md`         | lane 共通不変条件               |
| Facade           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | current false-success 実装      |
| IPC handler      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | outer IpcResult の運搬契約      |
| 共有型           | `packages/shared/src/types/skillCreator.ts`                           | existing union / error response |

## 実行手順

### ステップ1: current facts を固定する

- `plan()` には `llmAdapter` / `resourceLoader` 不足時の stub success がある
- `improve()` には degraded 条件で `suggestions: []` を返す経路がある
- `execute()` は degraded stub ではなく `SkillExecutor.execute()` 委譲である
- `RuntimeSkillCreatorImproveErrorResponse` は既存で存在する

### ステップ2: 必須契約を定義する

| 契約                  | 要件                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| plan logical error    | `RuntimeSkillCreatorPlanResponse` に error union を追加                          |
| improve logical error | existing `RuntimeSkillCreatorImproveErrorResponse` を degraded 条件にも使う      |
| reason code           | `error.code` に `llm_adapter_unavailable` / `resource_loader_unavailable` を格納 |
| user message          | `error.message` に UI 表示文言を格納                                             |
| execute guard         | logical error plan では execute 導線を無効化する                                 |

### ステップ3: 影響範囲を固定する

| 層           | ファイル                                    | 変更内容                              |
| ------------ | ------------------------------------------- | ------------------------------------- |
| shared types | `packages/shared/src/types/skillCreator.ts` | plan error union / reason code 型     |
| main facade  | `RuntimeSkillCreatorFacade.ts`              | false-success を explicit error 化    |
| main ipc     | `creatorHandlers.ts`                        | transport / logical error の境界整理  |
| renderer     | `SkillLifecyclePanel.tsx`                   | plan logical error 表示、execute 抑止 |
| renderer     | `SkillCreateWizard.tsx`                     | wizard 側の同契約反映                 |

## 統合テスト連携

- Phase 4 で false-success 再発防止ケースを定義する
- Phase 7 で plan / improve / renderer guard / transport failure の coverage を確認する

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 仕様参照先                                             |
| ------------------ | -------- | ------------------------------------------------------ |
| アーキテクチャ     | 必須     | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信            | 必須     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| エラーハンドリング | 必須     | `aiworkflow-requirements: error-handling.md`           |
| UI/UX              | 必須     | `aiworkflow-requirements: ui-ux-*.md`                  |

## 成果物

| 成果物         | パス                                     | 説明                     |
| -------------- | ---------------------------------------- | ------------------------ |
| 要件定義書     | `phase-1-requirements.md`                | current facts と契約要件 |
| 要件抽出マップ | `outputs/phase-1/spec-extraction-map.md` | AC と実装ポイントの対応  |

## 完了条件

- [ ] false-success の発火点が `plan` / `improve` に限定されている
- [ ] execute の責務が「invalid plan 防止」に整理されている
- [ ] explicit error union の要件が定義されている
- [ ] IPC / renderer 影響範囲が明記されている
- [ ] AC-1〜AC-7 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

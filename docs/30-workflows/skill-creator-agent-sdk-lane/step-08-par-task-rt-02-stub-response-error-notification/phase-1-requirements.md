# Phase 1: 要件定義

## メタ情報

| 項目   | 値                               |
| ------ | -------------------------------- |
| Phase  | 1                                |
| 機能名 | stub-response-error-notification |
| 作成日 | 2026-03-29                       |

## 目的

スタブレスポンスの問題箇所を特定し、エラー返却に必要な型拡張・reason code・影響範囲を要件として固定する。

## 実行タスク

- plan() / execute() / improve() のスタブレスポンス箇所を洗い出す
- エラーレスポンスに必要な型フィールドを定義する
- reason code の列挙と意味を定義する
- IPC handler / renderer への影響範囲を特定する
- AC-1〜AC-7 への写像を確認する

## 参照資料

| 資料名           | パス                                                                  | 説明                                     |
| ---------------- | --------------------------------------------------------------------- | ---------------------------------------- |
| 要件草案         | `../requirements-draft.md`                                            | FR-01 plan / FR-02 execute 契約          |
| 親 workflow pack | `../root-workflow-pack/index.md`                                      | lane 共通不変条件                        |
| Facade           | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | plan/execute/improve スタブの現状        |
| IPC handler      | `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 現行の IPC エラーハンドリング            |
| 型定義           | `packages/shared/src/types/skillCreator.ts`                           | `RuntimeSkillCreatorPlanResponse` 現行型 |

### 現行コードアンカー

| ファイル                                                              | 観察点                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | L306-327: plan() スタブ。`skillName: ""`, `agents: []` を返却             |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | execute() / improve() にも同様の early return パスが存在                  |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | `IpcResult` パターンで `{ success: false, error }` を返す既存パターンあり |
| `packages/shared/src/types/skillCreator.ts`                           | `RuntimeSkillCreatorPlanResponse` に `status` フィールドが存在しない      |

## 実行手順

### ステップ1: スタブレスポンス箇所を洗い出す

**plan() スタブ（L306-327）**:

- 条件: `!this.llmAdapter || (!this.resourceLoader && !this.hasDynamicResourcePipeline())`
- 返却値: `{ planId, skillSpec, estimatedSteps: 3, skillName: "", description: "", agents: [], scripts: [], triggers: [], anchors: [] }`
- 問題: 空データを正常レスポンスとして返す

**execute() スタブ**:

- 条件: llmAdapter / resourceLoader 未設定時
- 返却値: 空の実行結果
- 問題: 同上

**improve() スタブ**:

- 条件: degraded 状態時
- 返却値: 空の改善結果
- 問題: 同上

### ステップ2: エラーレスポンス型フィールドを定義する

`RuntimeSkillCreatorPlanResponse` への追加フィールド:

| フィールド       | 型                                                                   | 説明                       |
| ---------------- | -------------------------------------------------------------------- | -------------------------- |
| `status`         | `"ok" \| "degraded" \| "error"`                                      | レスポンスの状態           |
| `degradedReason` | `"llm_adapter_unavailable" \| "resource_loader_unavailable" \| null` | degraded/error 時の原因    |
| `userMessage`    | `string \| null`                                                     | ユーザー向け表示メッセージ |

### ステップ3: reason code を定義する

| reason code                   | 発火条件                                                     | ユーザー向けメッセージ                               |
| ----------------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| `llm_adapter_unavailable`     | `!this.llmAdapter`                                           | LLM アダプタが利用できません。設定を確認してください |
| `resource_loader_unavailable` | `!this.resourceLoader && !this.hasDynamicResourcePipeline()` | リソースローダーが利用できません                     |

### ステップ4: 影響範囲を特定する

| 層          | ファイル                              | 変更内容                                         |
| ----------- | ------------------------------------- | ------------------------------------------------ |
| 型定義      | `packages/shared/.../skillCreator.ts` | `status` / `degradedReason` / `userMessage` 追加 |
| Facade      | `RuntimeSkillCreatorFacade.ts`        | スタブ → エラーレスポンス変換                    |
| IPC handler | `creatorHandlers.ts`                  | エラー検出 → `IpcResult` 変換                    |
| renderer    | `SkillLifecyclePanel.tsx`             | エラー状態の条件分岐・表示                       |
| renderer    | `SkillCreateWizard.tsx`               | エラー状態の条件分岐・表示                       |

## 統合テスト連携

- Phase 4 で plan/execute/improve のスタブ条件を test case へ変換する。
- Phase 7 で全 reason code の coverage を確認する。
- Phase 9 で既存正常系パスとの互換性を監査する。

## 成果物

| 成果物              | パス                                      | 説明                                   |
| ------------------- | ----------------------------------------- | -------------------------------------- |
| 要件定義書          | `phase-1-requirements.md`                 | スタブ箇所・型拡張・reason code の固定 |
| spec extraction map | `{outputs/phase-1/spec-extraction-map.md` | AC → 実装ポイントの対応表              |

## 完了条件

- [ ] plan() / execute() / improve() のスタブ箇所が列挙されている
- [ ] 型拡張フィールドが定義されている
- [ ] reason code が列挙され意味が定義されている
- [ ] IPC / renderer への影響範囲が特定されている
- [ ] AC-1〜AC-7 への写像が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

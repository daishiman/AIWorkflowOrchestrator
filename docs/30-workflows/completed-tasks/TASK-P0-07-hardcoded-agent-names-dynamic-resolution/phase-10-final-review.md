# Phase 10: 最終レビューゲート - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 10                                                  |
| Phase名   | 最終レビューゲート                                  |
| カテゴリ  | 品質ゲート                                          |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 9: 品質保証                                   |
| 後続Phase | Phase 11: 手動テスト検証                            |

## 目的

実装完了後、全体的な品質・整合性を検証する。本 Phase では AC-1〜AC-8 の全受け入れ基準の充足確認・設計原則遵守・スコープ外変更の有無を包括的にレビューし、PASS / MINOR / MAJOR / CRITICAL の判定を下す。

## 実行タスク

### Task 10-1: AC（受け入れ基準）全達成確認

Phase 1 で定義した AC-1〜AC-8 を全て満たしていることを確認する。

| AC番号 | 内容                                                                                                              | 検証方法       | 判定 |
| ------ | ----------------------------------------------------------------------------------------------------------------- | -------------- | ---- |
| AC-1   | `plan()` の動的パスで manifest の `plan` フェーズ `resourceIds` からエージェントリストが組み立てられる            | automated-test | --   |
| AC-2   | `improve()` の動的パスで manifest の `improve` フェーズ `resourceIds` からエージェントリストが組み立てられる      | automated-test | --   |
| AC-3   | manifest にフェーズが存在しない場合、`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックする  | automated-test | --   |
| AC-4   | manifest の `resourceIds` が空の場合、`PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` にフォールバックする | automated-test | --   |
| AC-5   | フォールバック発動時にログ出力がある                                                                              | automated-test | --   |
| AC-6   | `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` は削除されず保持されている                                 | code-review    | --   |
| AC-7   | 既存テスト `T-P7-04` が PASS する                                                                                 | automated-test | --   |
| AC-8   | typecheck / lint がエラーなし                                                                                     | automated-test | --   |

### Task 10-2: 新規ファイルの責務境界確認

- `manifestResourceResolver.ts` が純粋関数のみで構成されていること（副作用なし、ログ出力のみ例外）
- `manifestResourceResolver.ts` が `RuntimeSkillCreatorFacade` の内部状態に直接アクセスしていないこと
- `manifestResourceResolver.ts` が既存の責務境界（Facade / Engine / Service / Loader）を侵していないこと

**確認コマンド（参考）**:

```bash
# manifestResourceResolver が Facade の内部状態にアクセスしていないことを確認
grep -rn "RuntimeSkillCreatorFacade\|this\." apps/desktop/src/main/services/runtime/manifestResourceResolver.ts

# 他のサービスへの直接依存がないことを確認
grep -rn "import.*from.*services" apps/desktop/src/main/services/runtime/manifestResourceResolver.ts
```

### Task 10-3: エージェント名の新規ハードコード確認

- `manifestResourceResolver.ts` にエージェント名がハードコードされていないこと
- `RuntimeSkillCreatorFacade.ts` の変更箇所に新たなエージェント名のハードコードが追加されていないこと

**確認コマンド（参考）**:

```bash
# manifestResourceResolver にエージェント名がハードコードされていないことを確認
grep -rn "discover-problem\|design-workflow\|plan-structure\|improve-prompt" apps/desktop/src/main/services/runtime/manifestResourceResolver.ts

# Facade の変更差分にエージェント名がハードコードされていないことを確認
git diff HEAD~1 -- apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | grep -E "^\+" | grep -E "discover-problem|design-workflow|plan-structure|improve-prompt"
```

### Task 10-4: フォールバック条件の設計通り実装確認

Phase 2 で設計した5パターンのフォールバック条件が全て正しく実装されていることを確認する。

| #   | フォールバック条件                              | 期待動作                                       | 確認方法       |
| --- | ----------------------------------------------- | ---------------------------------------------- | -------------- |
| 1   | manifest に対象 phaseId が存在しない            | `fallback` パラメータをそのまま返す + warn     | automated-test |
| 2   | フェーズの `resourceIds` が undefined           | `fallback` パラメータをそのまま返す + warn     | automated-test |
| 3   | フェーズの `resourceIds` が空配列 `[]`          | `fallback` パラメータをそのまま返す + warn     | automated-test |
| 4   | resourceIds の全 ID が resources に見つからない | `fallback` パラメータをそのまま返す + warn     | automated-test |
| 5   | `hasDynamicResourcePipeline()` が false         | 既存の静的フォールバックパスを使用（変更なし） | code-review    |

### Task 10-5: スコープ外変更の有無確認

以下のファイルが変更されていないことを確認する。

| ファイル / ディレクトリ                           | 変更不可の理由                      |
| ------------------------------------------------- | ----------------------------------- |
| `planPromptConstants.ts`（定数の内容）            | FR-05: 静的フォールバックとして保持 |
| `improvePromptConstants.ts`（定数の内容）         | FR-05: 静的フォールバックとして保持 |
| `ManifestLoader.ts`                               | TASK-P0-04 の責務（スコープ外）     |
| `workflow-manifest.json`                          | TASK-P0-03 の責務（スコープ外）     |
| `SkillCreatorWorkflowEngine.ts`                   | phase 状態機械の変更はスコープ外    |
| IPC チャンネル定義（`packages/shared/src/ipc/`）  | IPC 変更なし                        |
| Preload スクリプト（`apps/desktop/src/preload/`） | Preload 変更なし                    |
| UI コンポーネント（`apps/desktop/src/renderer/`） | UI 変更なし                         |

**確認コマンド（参考）**:

```bash
# 変更されたファイル一覧を確認
git diff --name-only HEAD~1

# スコープ外ファイルの変更がないことを確認
git diff HEAD~1 -- apps/desktop/src/main/services/runtime/ManifestLoader.ts
git diff HEAD~1 -- .claude/skills/skill-creator/workflow-manifest.json
git diff HEAD~1 -- apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts
git diff HEAD~1 -- packages/shared/src/ipc/
git diff HEAD~1 -- apps/desktop/src/preload/
git diff HEAD~1 -- apps/desktop/src/renderer/
```

スコープ外変更が発見された場合は MAJOR 以上の判定とし、変更を差し戻す。

### Task 10-6: 判定と MINOR 指摘の未タスク化

以下の判定基準に従い総合判定を行う。

| 判定     | 基準                                                           |
| -------- | -------------------------------------------------------------- |
| PASS     | 全 AC 達成・スコープ外変更なし・設計原則遵守                   |
| MINOR    | 軽微な改善点あり（機能には影響なし）・次スプリント以降で対応可 |
| MAJOR    | AC 未達成または設計原則違反あり・本スプリント内で修正が必要    |
| CRITICAL | スコープ外の破壊的変更あり・即時ロールバックが必要             |

- MAJOR / CRITICAL の場合は該当 Phase に戻り修正を行う
- MINOR 指摘は `outputs/phase-10/final-review-result.md` に記録し、未タスクとして Phase 11 へ進行する

## 参照資料

| 資料名                           | パス                                                                                      | 説明                          |
| -------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------- |
| Phase 1 要件定義                 | `phase-1-requirements.md`                                                                 | AC-1〜AC-8 の定義             |
| Phase 2 設計                     | `phase-2-design.md`                                                                       | フォールバック5パターンの設計 |
| Phase 3 設計レビュー             | `phase-3-design-review.md`                                                                | 設計レビュー判定              |
| Phase 9 品質レポート             | `outputs/phase-9/quality-report.md`                                                       | 前 Phase の品質ゲート結果     |
| manifestResourceResolver         | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                      | レビュー対象（新規）          |
| RuntimeSkillCreatorFacade        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | レビュー対象（Facade）        |
| planPromptConstants              | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | 静的定数保持確認対象          |
| improvePromptConstants           | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                        | 静的定数保持確認対象          |
| テスト: manifestResourceResolver | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`       | レビュー対象のテスト          |
| テスト: Facade plan              | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | レビュー対象のテスト          |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |

## 統合テスト連携

| テスト観点               | 内容                                                               |
| ------------------------ | ------------------------------------------------------------------ |
| Phase 9 の品質ゲート通過 | Phase 9 の全品質ゲートが PASS であることを前提とする               |
| AC 全達成の自動検証      | automated-test で検証可能な AC は全てテスト結果から判定する        |
| Phase 11 の事前チェック  | 本 Phase の PASS / MINOR 判定が Phase 11（手動テスト）の前提となる |

## 成果物

| 成果物           | パス                                      | 説明             |
| ---------------- | ----------------------------------------- | ---------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | レビュー判定結果 |

### `final-review-result.md` 記載項目

- 実行日時
- 総合判定: PASS / MINOR / MAJOR / CRITICAL
- AC-1〜AC-8 の個別判定結果
- 新規ファイルの責務境界確認結果
- エージェント名の新規ハードコード確認結果
- フォールバック条件の設計通り実装確認結果（5パターン）
- スコープ外変更有無
- MINOR 指摘一覧（0 件でも記載）
- MAJOR / CRITICAL 指摘がある場合の対応方針

## 完了条件

- [ ] AC-1〜AC-8 が全て PASS
- [ ] `manifestResourceResolver.ts` が既存の責務境界を侵していないことを確認済み
- [ ] エージェント名の新規ハードコードが追加されていないことを確認済み
- [ ] フォールバック条件が Phase 2 設計通り実装されていることを確認済み（5パターン）
- [ ] スコープ外変更が存在しないことを確認済み
- [ ] 総合判定が PASS または MINOR
- [ ] MINOR 指摘が未タスク化されている（0 件の場合は記録のみ）
- [ ] `outputs/phase-10/final-review-result.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 11: 手動テスト検証

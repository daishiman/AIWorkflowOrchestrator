# Phase 9: 品質保証 - TASK-P0-07 ハードコードされた AGENT_NAMES の動的解決

## メタ情報

| 項目      | 値                                                  |
| --------- | --------------------------------------------------- |
| Phase     | 9                                                   |
| Phase名   | 品質保証                                            |
| カテゴリ  | 品質ゲート                                          |
| 機能名    | TASK-P0-07-hardcoded-agent-names-dynamic-resolution |
| 作成日    | 2026-04-06                                          |
| 前提Phase | Phase 8: リファクタリング（TDD: Refactor）          |
| 後続Phase | Phase 10: 最終レビューゲート                        |

## 目的

定義された品質基準を全て満たすことを検証する。本 Phase では typecheck・lint・全テスト実行・セキュリティチェック・静的定数保持確認の5つの品質ゲートを通過させる。

## 実行タスク

### Task 9-1: 型チェック

**実行コマンド**:

```bash
pnpm --filter @repo/desktop typecheck
```

- エラー 0 件であること
- 警告が出た場合はその内容を `outputs/phase-9/quality-report.md` に記録する
- `manifestResourceResolver.ts` で定義した型が `PhaseResourceRequest` と正しく適合していることを確認する

### Task 9-2: Lint チェック

**実行コマンド**:

```bash
pnpm --filter @repo/desktop lint
```

- エラー 0 件であること
- 警告が出た場合はその内容を `outputs/phase-9/quality-report.md` に記録する

### Task 9-3: RuntimeSkillCreatorFacade テスト実行

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --run RuntimeSkillCreatorFacade
```

- `RuntimeSkillCreatorFacade` 関連の全テスト（plan / improve 含む）が PASS すること
- 既存テスト `T-P7-04` が引き続き PASS すること（NFR-01）
- 失敗 0 件であること

### Task 9-4: manifestResourceResolver テスト実行

**実行コマンド**:

```bash
pnpm --filter @repo/desktop test -- --run manifestResourceResolver
```

- `manifestResourceResolver.test.ts` の全テストが PASS すること
- 動的パス / フォールバック5パターンの全テストケースが PASS すること
- 失敗 0 件であること

### Task 9-5: セキュリティチェック

**確認内容**:

- manifest はローカルファイルのため外部入力リスクなし
- `buildPhaseResourceRequestsFromManifest()` がネットワークアクセスを行っていないことを確認
- manifest のパス解決が `path.join()` 等を使用しパストラバーサルの可能性がないことを確認

**確認コマンド（参考）**:

```bash
# ネットワークアクセスの有無を確認
grep -rn "fetch\|axios\|http\|https\|net\." apps/desktop/src/main/services/runtime/manifestResourceResolver.ts

# パストラバーサルの可能性を確認
grep -rn "\.\.\/" apps/desktop/src/main/services/runtime/manifestResourceResolver.ts
```

### Task 9-6: 静的定数保持確認

**目的**: `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` が削除されていないことを確認する（FR-05 / AC-6）

**実行コマンド**:

```bash
# PLAN_RESOURCE_REQUESTS がエクスポートされていることを確認
grep -n "export.*PLAN_RESOURCE_REQUESTS" apps/desktop/src/main/services/runtime/planPromptConstants.ts

# IMPROVE_RESOURCE_REQUESTS がエクスポートされていることを確認
grep -n "export.*IMPROVE_RESOURCE_REQUESTS" apps/desktop/src/main/services/runtime/improvePromptConstants.ts

# 静的定数が import されていることを確認（フォールバック用途）
grep -rn "PLAN_RESOURCE_REQUESTS\|IMPROVE_RESOURCE_REQUESTS" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

- `PLAN_RESOURCE_REQUESTS` が `planPromptConstants.ts` にエクスポートとして存在すること
- `IMPROVE_RESOURCE_REQUESTS` が `improvePromptConstants.ts` にエクスポートとして存在すること
- `RuntimeSkillCreatorFacade.ts` から両定数が import / 参照されていること

### Task 9-7: `any` 型不使用の確認

以下のファイルに `any` 型が使用されていないことを確認する。

- `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`（変更箇所のみ）

**確認コマンド（参考）**:

```bash
grep -rn ": any" apps/desktop/src/main/services/runtime/manifestResourceResolver.ts
grep -rn ": any" apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts | head -20
```

結果: `any` 型が検出された場合は即時修正してから再度 Task 9-1/9-2 を実施する。

## 参照資料

| 資料名                           | パス                                                                                      | 説明                         |
| -------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------- |
| Phase 1 要件定義                 | `phase-1-requirements.md`                                                                 | FR-05 / AC-6 / NFR-01 の定義 |
| Phase 2 設計                     | `phase-2-design.md`                                                                       | 設計書（フォールバック条件） |
| Phase 8 リファクタリング         | `outputs/phase-8/refactoring-report.md`                                                   | リファクタリング結果         |
| manifestResourceResolver         | `apps/desktop/src/main/services/runtime/manifestResourceResolver.ts`                      | 品質確認対象（新規）         |
| RuntimeSkillCreatorFacade        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | 品質確認対象（Facade）       |
| planPromptConstants              | `apps/desktop/src/main/services/runtime/planPromptConstants.ts`                           | 静的定数保持確認対象         |
| improvePromptConstants           | `apps/desktop/src/main/services/runtime/improvePromptConstants.ts`                        | 静的定数保持確認対象         |
| テスト: manifestResourceResolver | `apps/desktop/src/main/services/runtime/__tests__/manifestResourceResolver.test.ts`       | テスト実行対象               |
| テスト: Facade plan              | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts` | テスト実行対象               |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                                        | 内容                               |
| -------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------- |
| アーキテクチャ概要   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`                | Main Process サービス設計          |
| 実装パターン         | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | リファクタリングパターン           |
| インターフェース契約 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill Creator SDK インターフェース |

## 統合テスト連携

| テスト観点           | 内容                                                                             |
| -------------------- | -------------------------------------------------------------------------------- |
| ユニットテスト全成功 | manifestResourceResolver と RuntimeSkillCreatorFacade の全テストが PASS すること |
| IPC 変更なし         | 本タスクは IPC 変更なしのため、IPC 結合テストは非対象                            |
| 静的定数保持         | フォールバック用静的定数が保持されていることの自動確認                           |

## 成果物

| 成果物       | パス                                | 説明           |
| ------------ | ----------------------------------- | -------------- |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質ゲート結果 |

### `quality-report.md` 記載項目

- 実行日時
- typecheck 結果（エラー件数・警告内容）
- lint 結果（エラー件数・警告内容）
- RuntimeSkillCreatorFacade テスト実行結果（成功件数 / 失敗件数）
- manifestResourceResolver テスト実行結果（成功件数 / 失敗件数）
- セキュリティチェック結果（ネットワークアクセス有無・パストラバーサル可能性）
- 静的定数保持確認結果（PLAN_RESOURCE_REQUESTS / IMPROVE_RESOURCE_REQUESTS の存在確認）
- `any` 型不使用確認結果
- 総合判定: PASS / FAIL

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなし
- [ ] `pnpm --filter @repo/desktop lint` がエラーなし
- [ ] `pnpm --filter @repo/desktop test -- --run RuntimeSkillCreatorFacade` 全成功
- [ ] `pnpm --filter @repo/desktop test -- --run manifestResourceResolver` 全成功
- [ ] セキュリティチェック: ネットワークアクセスなし・パストラバーサルリスクなし
- [ ] `PLAN_RESOURCE_REQUESTS` / `IMPROVE_RESOURCE_REQUESTS` が削除されていないことを grep で確認済み
- [ ] 実装ファイルに `any` 型が存在しない
- [ ] `outputs/phase-9/quality-report.md` が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビューゲート

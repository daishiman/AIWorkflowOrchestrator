# Phase 2: 設計

## メタ情報

| 項目       | 値                        |
| ---------- | ------------------------- |
| Phase      | 2                         |
| 機能名     | task-rt-05-test-rerun-ac4 |
| 前提Phase  | Phase 1                   |
| 後続Phase  | Phase 3                   |
| ステータス | 未実施                    |
| 作成日     | 2026-03-31                |

## 目的

テスト再実行の実行計画（環境クリーンアップ手順・テスト実行順序・ドキュメント更新手順）を設計し、Phase 3 の設計レビューで承認可能な状態にする。

## 実行タスク

- 環境クリーンアップ戦略を設計し、Phase 1 の対象範囲と整合させる
- テスト実行順序を AC-1〜AC-3 に対応付ける
- ドキュメント更新手順を Phase 9/10 close-out として固定する
- `artifacts.json` と `outputs/artifacts.json` の同期を前提条件に含める
- 30思考法の適用観点を Phase 3 レビュー項目へ引き渡す

### タスク1: 環境クリーンアップ戦略の設計

**目的**: esbuild platform mismatch を確実に解消する手順を定義する

**設計内容**:

| ステップ | コマンド                                                                                              | 目的                           |
| -------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1        | `rm -rf node_modules apps/desktop/node_modules packages/shared/node_modules packages/ui/node_modules` | バイナリ不整合の根本原因を除去 |
| 2        | `pnpm install`                                                                                        | クリーンな状態で再インストール |
| 3        | `node -e "require('esbuild')"`                                                                        | esbuild 動作確認               |
| 4        | `pnpm exec vitest --version`                                                                          | Vitest 起動確認                |

**フォールバック手順**（Step 2 後もエラーが残る場合）:

```bash
pnpm store prune
pnpm install
```

### タスク2: テスト実行計画の設計

**目的**: AC-1〜AC-3 を確認するテスト実行順序を設計する

**実行順序**:

| 順序 | 対象            | AC   | コマンド                                                                                                                      |
| ---- | --------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1    | Engine テスト   | AC-1 | `cd apps/desktop && pnpm exec vitest run src/main/services/runtime/__tests__/SkillCreatorWorkflowEngine.test.ts`              |
| 2    | Renderer テスト | AC-2 | `cd apps/desktop && pnpm exec vitest run src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` |
| 3    | typecheck       | 品質 | `pnpm typecheck`                                                                                                              |
| 4    | lint            | 品質 | `pnpm lint`                                                                                                                   |

### タスク3: ドキュメント更新計画の設計

**目的**: AC-4・AC-5 を満たすドキュメント更新の手順を設計する

**更新対象**:

| ファイル                                                                                                                        | 更新内容                                                 | 更新タイミング                   |
| ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------- |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-9/quality-report.md`       | テスト結果（件数・日時・環境）を反映し「PASS」状態に更新 | Phase 9 完了後（Phase 10で実施） |
| `docs/30-workflows/completed-tasks/step-09-par-task-rt-05-multi-select-user-input-kind/outputs/phase-10/final-review-result.md` | 「AC-4: 要再確認」を「PASS」に更新、ブロッカー解除を記録 | Phase 10 で実施                  |

## 参照資料

| 資料名             | パス                                                             | 内容             |
| ------------------ | ---------------------------------------------------------------- | ---------------- |
| 元の未タスク指示書 | `docs/30-workflows/unassigned-task/task-rt-05-test-rerun-ac4.md` | 苦戦箇所と解決策 |
| Phase 1 要件定義   | `phase-1-requirements.md`                                        | AC・スコープ     |
| artifacts 台帳     | `outputs/artifacts.json`                                         | 成果物同期の基準 |

## 成果物

| 成果物     | パス                                | 内容                             |
| ---------- | ----------------------------------- | -------------------------------- |
| 設計書     | `phase-2-design.md`                 | 実行計画・環境クリーンアップ設計 |
| 実行計画書 | `outputs/phase-2/execution-plan.md` | コマンド一覧・更新対象ファイル   |

## 統合テスト連携

- Phase 5 でこの環境クリーンアップ手順を実行する
- Phase 9 でこのテスト実行計画を使って実際にテストを実行する
- Phase 10 でこのドキュメント更新計画に従ってファイルを更新する

## 完了条件

- [ ] 環境クリーンアップ手順（コマンド一覧）が定義されている
- [ ] フォールバック手順が定義されている
- [ ] テスト実行順序（AC との対応付き）が定義されている
- [ ] ドキュメント更新対象ファイルと更新内容が定義されている
- [ ] `artifacts.json` / `outputs/artifacts.json` の同期前提が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## Phase末端アクション【必須】

- `outputs/phase-2/execution-plan.md` を作成し、コマンド一覧と更新対象を記録する
- `artifacts.json` の Phase 2 ステータスを `completed` に更新する

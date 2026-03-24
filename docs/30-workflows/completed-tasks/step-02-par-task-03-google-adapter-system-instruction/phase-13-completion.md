# Phase 13: 完了 - GoogleAdapter system_instruction 対応

## メタ情報

| 項目     | 値                                |
| -------- | --------------------------------- |
| Phase    | 13                                |
| 機能名   | google-adapter-system-instruction |
| 作成日   | 2026-03-23                        |
| タスクID | TASK-LLM-MOD-03                   |
| 依存     | phase-12-documentation.md         |

## 目的

全 Phase の成果物を最終確認し、ユーザー承認を得た上で PR 準備を完了させる。

## 実行タスク

- 全Phase完了チェック: Phase 1-12 の完了条件を逐一確認
- 成果物の最終確認: 変更ファイル・仕様書ファイルの存在確認
- 最終テスト実行: 全テスト PASS の確認
- ユーザー承認取得: PR作成前にユーザーの明示的承認を取得【必須】
- PR準備: ブランチ作成・コミット・PR本文作成
- タスク完了処理: ステータス更新・移動
- 並列タスク完了状況確認: Task02 の完了確認

## 参照資料

| 資料名             | パス                                                  | 内容                              |
| ------------------ | ----------------------------------------------------- | --------------------------------- |
| Git ルール         | `.claude/rules/07-git-and-tooling.md`                 | PR 作成ルール・コミット前チェック |
| Task03 概要        | `./index.md`                                          | タスクの完了条件                  |
| PR作成コマンド     | `task-specification-creator: commands.md`             | `/ai:diff-to-pr` の使用方法       |
| レビューゲート基準 | `task-specification-creator: review-gate-criteria.md` | 判定基準                          |

## 実行手順

### Task 13-1: 全 Phase 完了チェック

| Phase | 名称             | 完了条件の主要項目                                  | 確認   |
| ----- | ---------------- | --------------------------------------------------- | ------ |
| 1     | 要件定義         | FR-03-01〜FR-03-04・AC 定義完了                     | 要確認 |
| 2     | 設計             | `buildRequestBody` 設計・`v1beta` 判断記録          | 要確認 |
| 3     | 設計レビュー     | PASS 判定済み                                       | 要確認 |
| 4     | テスト作成       | Red テスト追加・MSW URL 更新                        | 要確認 |
| 5     | 実装             | 全テスト Green・typecheck PASS                      | 要確認 |
| 6     | テスト拡充       | T6-01〜T6-03 追加                                   | 要確認 |
| 7     | カバレッジ確認   | Line 80%・Branch 60%・Function 80% 達成             | 要確認 |
| 8     | リファクタリング | JSDoc 更新・不要コード削除                          | 要確認 |
| 9     | 品質保証         | Lint・typecheck・全テスト PASS                      | 要確認 |
| 10    | 最終レビュー     | PASS 判定（または MINOR 対応済み）                  | 要確認 |
| 11    | 手動テスト       | API 確認またはスキップ記録                          | 要確認 |
| 12    | ドキュメント     | 実装ガイド・LOGS.md 2ファイル更新・topic-map 再生成 | 要確認 |

### Task 13-2: 成果物の最終確認

**変更したファイルの確認**:

```bash
git diff HEAD --name-only
```

**期待するファイル一覧**:

- `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`
- `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts`
- `.claude/skills/aiworkflow-requirements/LOGS.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `.claude/skills/task-specification-creator/LOGS.md`
- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
- `.claude/skills/aiworkflow-requirements/indexes/keywords.json`

**仕様書ファイルの確認**:

```bash
ls docs/30-workflows/step-02-par-task-03-google-adapter-system-instruction/
```

**期待するファイル一覧** (13 ファイル):

- `index.md` (既存)
- `phase-1-requirements.md`
- `phase-2-design.md`
- `phase-3-design-review.md`
- `phase-4-test-creation.md`
- `phase-5-implementation.md`
- `phase-6-test-expansion.md`
- `phase-7-coverage.md`
- `phase-8-refactoring.md`
- `phase-9-quality-assurance.md`
- `phase-10-final-review.md`
- `phase-11-manual-testing.md`
- `phase-12-documentation.md`
- `phase-13-completion.md` (本ファイル)

### Task 13-3: 最終テスト実行

```bash
cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts
```

**期待する結果**: 全テスト PASS（失敗テスト 0 件）。

### Task 13-4: ユーザー承認取得【必須】

**重要**: PR作成前にユーザーの明示的な承認を取得する。承認なしでの PR 作成・コミットは禁止。

```
Phase 1-12 の全完了条件を満たしました。
PR を作成してよろしいですか？

変更概要:
- GoogleAdapter の systemPrompt 処理を system_instruction に移行
- baseUrl を v1 -> v1beta に変更
- buildRequestBody ヘルパーメソッドを追加

承認いただければ `/ai:diff-to-pr` で PR を作成します。
```

- [ ] ユーザーから明示的な承認を取得した
- [ ] 承認前に PR を作成していない

### Task 13-5: PR 準備

**PR 作成方法**: `/ai:diff-to-pr` コマンドを使用して PR を作成する。

**ブランチ名** (命名規則準拠):

```
feat/task-llm-mod-03-google-adapter-system-instruction
```

**PR タイトル** (70 文字以内):

```
feat(adapters): GoogleAdapter system_instruction 対応・v1beta移行
```

**PR 本文テンプレート**:

```markdown
## Summary

- `GoogleAdapter` の systemPrompt 処理を `user` ロール埋め込みから Gemini API 公式の `system_instruction` フィールドに移行した
- `baseUrl` のデフォルト値を `v1` から `v1beta` に変更した（`system_instruction` の確実なサポートのため）
- リクエストボディ構築を `buildRequestBody` ヘルパーメソッドに統合し、`sendChat` / `streamChat` の重複ロジックを排除した

## Changes

- `GoogleAdapter.ts`: `formatContents` リファクタリング、`buildRequestBody` 追加、`baseUrl` 変更
- `GoogleAdapter.test.ts`: MSW URL を `v1beta` に更新、system_instruction テスト 5 件追加

## Test Plan

- `cd apps/desktop && pnpm vitest run src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` で全テスト PASS を確認
- `pnpm typecheck` でコンパイルエラー 0 件を確認

## Breaking Changes

なし（`config?.baseUrl` によるカスタム baseUrl は引き続き有効）

## Related

- Task01 (PROVIDER_CONFIGS 更新) への依存
- Task04 (テスト更新) をブロックする
- Closes: TASK-LLM-MOD-03
```

**PR本文セクション連携ルール**:

- Summary: Phase 1 の要件概要を要約
- Changes: Phase 5 の実装内容を要約
- Test Plan: Phase 4/6 のテスト戦略を要約

### Task 13-6: タスク完了処理

PR 作成後に以下を実施:

- [ ] 仕様書ディレクトリを `completed-tasks/` に移動（またはその旨を記録）
- [ ] task-workflow.md の該当タスクステータスを「完了」に更新

### Task 13-7: 並列タスク完了状況確認

本タスク（Task03）は Task02（AnthropicAdapter更新）と並列実行されている。PR 作成前に Task02 の完了状況を確認する。

| タスク                   | 状態   | 確認方法                                     |
| ------------------------ | ------ | -------------------------------------------- |
| Task02 (TASK-LLM-MOD-02) | 要確認 | `git branch -a` で Task02 のブランチ存在確認 |
| Task03 (本タスク)        | 完了   | 本 Phase 完了                                |

Task02 が未完了の場合: Task03 の PR を先に作成することは可能だが、Task04（テスト更新）は Task02 の完了も待つ必要がある。

## 統合テスト連携【必須】

最終確認で統合テスト結果を検証:

| 確認項目     | 確認内容                    | 結果       |
| ------------ | --------------------------- | ---------- |
| 全テスト結果 | ユニット/統合テスト全て成功 | {{RESULT}} |
| カバレッジ   | Phase 7 基準達成            | {{RESULT}} |
| 品質ゲート   | Phase 9 全クリア            | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断                           | 仕様参照先                                   |
| -------------- | ---------------------------------- | -------------------------------------------- |
| セキュリティ   | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |

## 成果物

| 成果物               | パス                                                                 | 説明                                    |
| -------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| ローカルチェック結果 | `outputs/phase-13/local-check-result.md`                             | 最終テスト実行結果                      |
| 変更サマリー         | `outputs/phase-13/change-summary.md`                                 | 変更ファイル一覧・概要                  |
| PR情報               | `outputs/phase-13/pr-info.md`                                        | PR URL・タイトル・ブランチ名            |
| 実装済みアダプター   | `apps/desktop/src/main/adapters/llm/GoogleAdapter.ts`                | system_instruction 対応・v1beta移行済み |
| 更新済みテスト       | `apps/desktop/src/main/adapters/llm/__tests__/GoogleAdapter.test.ts` | system_instruction テスト追加済み       |
| 全 Phase 仕様書      | `phase-1-requirements.md` 〜 `phase-13-completion.md` (本ファイル)   | Phase 1-13 完了記録                     |

## 完了条件

- [ ] 全 Phase (1-12) の完了条件が満たされている
- [ ] 変更ファイルが期待通りである（`git diff HEAD --name-only` で確認）
- [ ] 最終テストが全て PASS している
- [ ] ユーザーから PR 作成の明示的承認を取得している
- [ ] PR タイトルが 70 文字以内
- [ ] PR 本文に Summary・Changes・Test Plan が含まれている
- [ ] `git commit --no-verify` を使用していないこと
- [ ] Task02 の完了状況を確認している
- [ ] タスク完了処理が実施されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## タスク完了宣言

本ファイルの全完了条件にチェックが入ったことをもって、**TASK-LLM-MOD-03: GoogleAdapter system_instruction 対応** を完了とする。

次のアクション: Task04（step-03-seq-task-04-test-update）への移行（Task02 完了確認後）

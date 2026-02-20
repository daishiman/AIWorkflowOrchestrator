# Phase 13: PR作成 — TypeScript `@repo/shared` モジュール解決エラー修正

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| Phase      | 13                                       |
| Phase名    | PR作成                                   |
| 前提Phase  | Phase 12（ドキュメント更新）             |
| 後続Phase  | なし（完了）                             |
| ステータス | 未実施                                   |
| 作成日     | 2026-02-20                               |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Issue      | #837                                     |

## 目的

Phase 1〜12 で実装・テスト・ドキュメント化が完了した成果物を Pull Request として提出し、レビュー・マージの準備を完了する。

## 背景

`pnpm typecheck` で発生していた `@repo/shared` モジュール解決エラー 228件の根本修正が完了し、全品質ゲートをクリアした。この成果物を main ブランチにマージするための PR を作成する。

---

## 実行タスク

- タスク1: ローカル動作確認（ユーザーへの確認依頼）を実施する
- タスク2: 変更サマリー提示と許可確認を実施する
- タスク3: Issue 連携確認を実施する
- タスク4: `/ai:diff-to-pr` 実行（ユーザー許可後）を実施する
- タスク5: CI 結果確認を実施する
- タスク6: タスクディレクトリ移動準備を実施する

> 以下のタスクを順番に実行してください。
> **重要**: PR 作成はユーザーの明示的な許可を得てから実行すること。

### タスク1: ローカル動作確認（ユーザーへの確認依頼）

**目的**: PR 作成前の最終ローカル確認をユーザーに依頼する

**実行手順**:

1. ユーザーに以下のコマンド実行を依頼する:

   ```bash
   # 1. @repo/shared のビルド
   pnpm --filter @repo/shared build

   # 2. 型チェック（全パッケージ）— エラー 0件を確認
   pnpm typecheck

   # 3. Lint — エラー 0件を確認
   pnpm lint

   # 4. desktop テスト — 全 PASS を確認
   pnpm --filter @repo/desktop exec vitest run
   ```

2. 全てパスすることを確認
3. 問題がある場合は修正してから次のタスクに進む

**期待される成果物**:

- ローカル確認結果（全項目 PASS）

---

### タスク2: 変更サマリー提示と許可確認

**目的**: 変更内容をユーザーに提示し、PR 作成の許可を得る

**実行手順**:

1. 変更ファイルを確認:

   ```bash
   git status
   git diff --stat main...HEAD
   ```

2. 以下の変更サマリーをユーザーに提示:

   ```markdown
   ## 変更サマリー

   ### 問題

   `pnpm typecheck` で `Cannot find module '@repo/shared'` 系エラーが 228件発生

   ### 原因

   - `packages/shared/package.json` の `exports` フィールドにサブパスエクスポートが不足
   - `apps/desktop/tsconfig.json` の `paths` と `vitest.config.ts` の `resolve.alias` が二重管理
   - TypeScript の `moduleResolution` 設定とサブパスエクスポートの不整合

   ### 修正内容

   1. `packages/shared/package.json` — `exports` フィールドに全サブパスエクスポートを定義
   2. `packages/shared/tsconfig.json` — TypeScript モジュール解決設定の修正
   3. `apps/desktop/tsconfig.json` — `paths` の更新（一元管理化）
   4. `apps/desktop/vitest.config.ts` — `resolve.alias` の一元管理化
   5. テストコード — リグレッション防止テスト追加

   ### 品質確認結果

   - `pnpm typecheck`: `@repo/shared` 関連エラー 0件 ✅
   - `pnpm lint`: エラー 0件 ✅
   - `pnpm --filter @repo/desktop exec vitest run`: 全テスト PASS ✅
   ```

3. **ユーザーの明示的な許可を得てから**次のタスクに進む

**期待される成果物**:

- ユーザーからの PR 作成許可

---

### タスク3: Issue 連携確認

**目的**: GitHub Issue #837 との連携を確認する

**実行手順**:

1. Issue #837 の内容を確認:

   ```bash
   gh issue view 837
   ```

2. 実装内容が Issue の要件を満たしていることを確認:
   - [ ] `pnpm typecheck` で `@repo/shared` 関連エラー 0件
   - [ ] Vitest alias と TypeScript paths の一元管理化
   - [ ] 新規サブパスエクスポート追加手順の明確化

3. PR に Issue 番号を関連付けることを確認

**期待される成果物**:

- Issue 連携確認結果

---

### タスク4: `/ai:diff-to-pr` 実行

**目的**: コミット・PR 作成・CI 確認を実行する

**実行手順**:

1. `/ai:diff-to-pr` スキルを実行:

   ```
   /ai:diff-to-pr
   ```

2. スキルが以下を自動実行:
   - リモート main 同期・コンフリクト解消
   - 品質検証（typecheck, lint, test）
   - 差分分析・ブランチ作成・コミット
   - PR 本文生成・PR 作成
   - 補足コメント投稿
   - CI/CD 完了確認

3. PR 本文に以下を含めることを確認:
   - `Closes #837` または `Fixes #837`（Issue 自動クローズ）
   - 変更サマリー（タスク2で提示した内容）
   - テスト結果

**PR タイトル案**:

```
fix(shared): @repo/shared モジュール解決エラー228件の根本修正
```

**PR 本文テンプレート**:

```markdown
## Summary

- `pnpm typecheck` で発生していた `Cannot find module '@repo/shared'` 系エラー 228件を根本修正
- `package.json` exports / `tsconfig.json` paths / `vitest.config.ts` alias の一元管理化
- リグレッション防止テストを追加

## Test plan

- [ ] `pnpm typecheck` で `@repo/shared` 関連エラー 0件
- [ ] `pnpm --filter @repo/desktop exec vitest run` で全テスト PASS
- [ ] `pnpm lint` でエラー 0件
- [ ] 新規テスト（設定ファイル整合性テスト）が PASS

Closes #837

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**期待される成果物**:

- PR URL
- CI 結果

---

### タスク5: CI 結果確認

**目的**: CI パイプラインの結果を確認する

**実行手順**:

1. PR の CI ステータスを確認:

   ```bash
   gh pr checks <PR_NUMBER>
   ```

2. 全チェックが PASS であることを確認
3. 失敗がある場合:
   - エラー内容を確認
   - ローカルで修正
   - 追加コミットを push
   - CI 再実行を待機

**期待される成果物**:

- CI 結果（全チェック PASS）

---

### タスク6: タスクディレクトリの移動

**目的**: 完了したタスクのディレクトリを `completed-tasks/` に移動する

**実行手順**:

1. タスクディレクトリを移動:

   ```bash
   mv docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 \
      docs/30-workflows/completed-tasks/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001
   ```

2. 移動後のディレクトリ構成を確認:

   ```bash
   ls docs/30-workflows/completed-tasks/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/
   ```

3. Git にステージング:
   ```bash
   git add docs/30-workflows/completed-tasks/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/
   git add docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/
   ```

> **注意**: この移動は PR マージ後、または PR 作成時のコミットに含める。タイミングはワークフローに従う。

**期待される成果物**:

- 移動完了の確認

---

## 参照資料

| 資料名                   | パス                                                                         | 説明                  |
| ------------------------ | ---------------------------------------------------------------------------- | --------------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`                                                    | 要件充足の根拠        |
| Phase 2 設計             | `phase-2-design.md`                                                          | 設計判断の根拠        |
| Phase 5 実装             | `phase-5-implementation.md`                                                  | 実装差分の根拠        |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`                                                  | 追加テストの根拠      |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`                                                  | カバレッジ達成根拠    |
| Phase 8 リファクタリング | `phase-8-refactoring.md`                                                     | リファクタ結果        |
| Phase 9 品質保証         | `phase-9-quality-assurance.md`                                               | 品質ゲート結果        |
| Phase 10 最終レビュー    | `phase-10-final-review.md`                                                   | ゲート判定結果        |
| Phase 11 手動テスト結果  | `phase-11-manual-test.md`                                                    | Phase 11 成果物       |
| Phase 12 ドキュメント    | `phase-12-documentation.md`                                                  | Phase 12 成果物       |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | PR前品質確認基準      |
| モノレポ要件             | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | 依存境界の確認基準    |
| タスク運用要件           | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`         | 完了/未タスク運用基準 |
| `/ai:diff-to-pr` スキル  | `.claude/skills/ai-diff-to-pr/`                                              | PR 作成自動化スキル   |

## 成果物

| 成果物名 | パス                            | 説明                |
| -------- | ------------------------------- | ------------------- |
| PR 情報  | `outputs/phase-13/pr-info.md`   | PR URL・ブランチ名  |
| CI 結果  | `outputs/phase-13/ci-result.md` | CI パイプライン結果 |

## 完了条件

- [ ] タスク1: ローカル動作確認が全項目 PASS
- [ ] タスク2: ユーザーから PR 作成の明示的許可を取得
- [ ] タスク3: Issue #837 との連携を確認
- [ ] タスク4: `/ai:diff-to-pr` による PR 作成完了
- [ ] タスク4: PR 本文に `Closes #837` が含まれている
- [ ] タスク5: CI 全チェック PASS
- [ ] タスク6: タスクディレクトリが `completed-tasks/` に移動されている
- [ ] artifacts.json の Phase 13 ステータスが更新されている

## 次のPhase

なし（タスク完了）。

> **マージ**: ユーザーが GitHub UI で手動実行する。`/ai:diff-to-pr` はマージを自動実行しない。

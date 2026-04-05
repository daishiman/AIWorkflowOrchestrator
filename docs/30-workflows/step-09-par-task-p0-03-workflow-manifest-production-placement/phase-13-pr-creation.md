# Phase 13: PR作成

## メタ情報

| 項目       | 値                                     |
| ---------- | -------------------------------------- |
| Phase      | 13                                     |
| タスクID   | TASK-P0-03                             |
| 機能名     | workflow-manifest-production-placement |
| カテゴリ   | 新機能（Spec P0系）                    |
| タスク分類 | NON_VISUAL（UIタスクではない）         |
| 規模       | 小規模                                 |
| 作成日     | 2026-04-04                             |

## 目的

Phase 1〜12 の全成果物をコミットし、Pull Request を作成する。ユーザーからの明示的な許可を得た上で、変更を main ブランチへマージ可能な状態にする。

> **重要: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。**

## 実行タスク

### Task 13-1: ユーザーへのローカル動作確認依頼

PR 作成前に、ユーザーに以下のローカル動作確認を依頼する:

```bash
# 1. テスト実行
pnpm --filter @repo/desktop test ManifestLoader.production-manifest
pnpm --filter @repo/desktop test ManifestLoader

# 2. 型チェック
pnpm --filter @repo/desktop typecheck

# 3. Lint
pnpm --filter @repo/desktop lint
```

全コマンドがエラーなしで完了することを確認する。

### Task 13-2: 変更サマリー提示と PR 作成許可確認

ユーザーに以下の変更サマリーを提示し、PR 作成の許可を求める:

- 変更ファイル一覧（`git diff --stat` の出力）
- 新規追加ファイル一覧
- テスト通過件数
- 配置パス（canonical / mirror）

**ユーザーが「許可」を明示するまで、次のステップに進まない。**

### Task 13-3: PR 作成

`/ai:diff-to-pr` を使用して PR を作成する。

#### PR タイトル

```
feat(manifest): TASK-P0-03 workflow-manifest.json 本番配置
```

#### PR 本文に含める内容

| セクション       | 内容                                                                  |
| ---------------- | --------------------------------------------------------------------- |
| 概要             | ManifestLoader 用の workflow-manifest.json を canonical/mirror に配置 |
| 配置ファイルパス | canonical: `.claude/skills/skill-creator/workflow-manifest.json`      |
|                  | mirror: `.agents/skills/skill-creator/workflow-manifest.json`         |
| テスト通過件数   | `ManifestLoader.production-manifest`: 15 ケース全 PASS                |
|                  | `ManifestLoader`: 全 PASS（リグレッションなし）                       |
| 後続タスク依存   | P0-04（ManifestLoader デフォルト有効化）                              |
|                  | P0-07（動的エージェント名解決）                                       |
|                  | P0-09（permission/hooks governance）                                  |
| 変更スコープ     | manifest JSON の配置のみ。ManifestLoader.ts のコード変更なし          |

#### PR 本文テンプレート

```markdown
## Summary

- ManifestLoader 用の `workflow-manifest.json` を本番パスに配置
- canonical (`.claude/skills/skill-creator/`) と mirror (`.agents/skills/skill-creator/`) に同一内容を配置
- ManifestLoader.ts のコード変更なし（既存の検証ロジックをそのまま活用）

## 配置ファイル

| パス                                                  | 説明              |
| ----------------------------------------------------- | ----------------- |
| `.claude/skills/skill-creator/workflow-manifest.json` | canonical（正本） |
| `.agents/skills/skill-creator/workflow-manifest.json` | mirror（複製）    |

## テスト結果

- `ManifestLoader.production-manifest`: 15 ケース全 PASS
- `ManifestLoader` 全体: 全 PASS（リグレッションなし）
- typecheck: PASS
- lint: PASS

## 後続タスク依存

このPRの完了により、以下のタスクがブロック解除されます:

- **P0-04**: ManifestLoader デフォルト有効化
- **P0-07**: 動的エージェント名解決
- **P0-09**: permission/hooks governance

## Test plan

- [ ] `pnpm --filter @repo/desktop test ManifestLoader.production-manifest` -- 15ケース全PASS
- [ ] `pnpm --filter @repo/desktop test ManifestLoader` -- リグレッションなし
- [ ] `pnpm --filter @repo/desktop typecheck` -- エラーなし
- [ ] `pnpm --filter @repo/desktop lint` -- エラーなし
- [ ] canonical/mirror ファイルの差分がゼロ
```

### Task 13-4: CI 確認

PR 作成後、CI パイプラインの結果を確認する:

```bash
gh pr checks <PR番号>
```

全チェックが PASS であることを確認する。失敗がある場合は原因を調査し、修正コミットを追加する。

### Task 13-5: タスクディレクトリの completed-tasks 移動

CI 通過後、タスク仕様書ディレクトリを `completed-tasks/` に移動する:

```bash
# 移動先ディレクトリ
docs/30-workflows/completed-tasks/step-09-par-task-p0-03-workflow-manifest-production-placement/
```

## 参照資料

| 資料名                       | パス                                                                                          | 説明                     |
| ---------------------------- | --------------------------------------------------------------------------------------------- | ------------------------ |
| Phase 1                      | `phase-1-requirements.md`                                                                     | 要件定義                 |
| Phase 2                      | `phase-2-design.md`                                                                           | 設計                     |
| Phase 11                     | `phase-11-manual-test.md`                                                                     | 手動テスト検証           |
| Phase 12                     | `phase-12-documentation.md`                                                                   | ドキュメント更新         |
| ManifestLoader               | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                    | 検証ロジック本体         |
| production-manifest テスト   | `apps/desktop/src/main/services/runtime/__tests__/ManifestLoader.production-manifest.test.ts` | テスト期待値（15ケース） |
| canonical manifest           | `.claude/skills/skill-creator/workflow-manifest.json`                                         | 本番 manifest            |
| mirror manifest              | `.agents/skills/skill-creator/workflow-manifest.json`                                         | ミラー manifest          |
| 最終レビュー結果             | `outputs/phase-10/final-review-result.md`                                                     | Phase 10 成果物          |
| 手動テスト結果               | `outputs/phase-11/manual-test-result.md`                                                      | Phase 11 成果物          |
| 発見された問題一覧           | `outputs/phase-11/discovered-issues.md`                                                       | Phase 11 成果物          |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                                                    | Phase 12 成果物          |
| システム仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`                                              | Phase 12 成果物          |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`                                                 | Phase 12 成果物          |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md`                                               | Phase 12 成果物          |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                                                   | Phase 12 成果物          |

## 成果物

| 成果物  | パス                          | 必須 |
| ------- | ----------------------------- | ---- |
| PR 情報 | `outputs/phase-13/pr-info.md` | ✅   |

`pr-info.md` に記録する内容:

- PR 番号
- PR URL
- PR タイトル
- マージ先ブランチ
- CI ステータス
- 作成日時

## 完了条件

- [ ] Task 13-1: ユーザーにローカル動作確認を依頼し、全コマンド PASS を確認
- [ ] Task 13-2: 変更サマリーを提示し、ユーザーから PR 作成の明示的許可を取得
- [ ] Task 13-3: PR が作成され、タイトルが `feat(manifest): TASK-P0-03 workflow-manifest.json 本番配置` である
- [ ] Task 13-3: PR 本文に配置ファイルパス、テスト通過件数、後続タスク依存が含まれている
- [ ] Task 13-4: CI 全チェックが PASS
- [ ] Task 13-5: タスクディレクトリが `completed-tasks/` に移動されている
- [ ] `outputs/phase-13/pr-info.md` が作成されている
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

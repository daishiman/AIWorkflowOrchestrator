# Phase 13: PR 作成

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 13                                 |
| 機能名 | terminal-handoff-adapter-placement |
| 作成日 | 2026-03-22                         |

## 目的

変更をコミットし、ユーザーの明示的な許可を得てから Pull Request を作成し、CI を確認する。

## 実行タスク

- ローカル動作確認依頼: ユーザーにローカルでの動作確認を依頼
- 変更サマリー提示: 変更内容のサマリーを提示し PR 作成の許可を確認
- PR 作成: ユーザーの許可後に `/ai:diff-to-pr` を実行
- CI 確認: CI が通過したことを確認
- タスクディレクトリ移動: completed-tasks への移動

## 参照資料

| 資料名               | パス                                                                     | 説明                                 |
| -------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| 最終レビュー         | `outputs/phase-10/final-review-result.md`                                | Phase 10 成果物                      |
| 手動テスト           | `outputs/phase-11/manual-test-result.md`                                 | Phase 11 成果物                      |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`                               | Phase 12 成果物（PR コメント投稿用） |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`                            | Phase 12 成果物                      |
| GitHub Issue         | [#1457](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1457) | 元タスク定義                         |

## Phase 12 完了根拠

Phase 13 着手前に、Phase 12 までの全完了を確認する:

- [ ] Phase 1-12 の全てが artifacts.json で `completed` ステータスになっている
- [ ] Phase 12 の全成果物（implementation-guide.md, documentation-changelog.md, unassigned-task-detection.md, skill-feedback-report.md, phase12-task-spec-compliance-check.md）が存在する

## Blocked ルール

Phase 13 はユーザーの明示的な承認がない限り blocked のままにする。

| 状態      | 条件                                           |
| --------- | ---------------------------------------------- |
| blocked   | ユーザーからのPR作成承認がない                 |
| unblocked | ユーザーが「PR作成してよい」と明示的に承認した |

## 実行手順

### 1. ユーザーにローカル動作確認を依頼

PR 作成前に、ユーザーにローカル環境での動作確認を依頼する。

確認依頼内容:

```bash
# adapter ユニットテスト
cd apps/desktop && pnpm vitest run src/main/adapters/handoff/

# 型チェック
pnpm typecheck

# Lint
pnpm lint

# 既存テスト（リグレッション確認）
cd apps/desktop && pnpm vitest run src/main/services/chat-edit/ src/main/services/runtime/
```

### 2. 変更サマリーの提示と許可確認

変更内容のサマリーを提示し、PR を作成してよいかユーザーに確認する。

**変更サマリー**:

| カテゴリ          | 変更内容                                                           |
| ----------------- | ------------------------------------------------------------------ |
| 新規追加          | `apps/desktop/src/main/adapters/handoff/` ディレクトリ一式         |
| 新規追加          | `toHandoffGuidance.ts` adapter 関数本体                            |
| 新規追加          | `types.ts` Discriminated Union 型定義（`HandoffSource`）           |
| 新規追加          | `index.ts` re-export                                               |
| 新規追加          | `__tests__/toHandoffGuidance.test.ts` ユニットテスト               |
| 変更（型 import） | `HandoffBlock.tsx` のローカル型定義を `@repo/shared` import に置換 |

**重要**: ユーザーから明示的な許可を得るまで PR 作成を実行しないこと。

### 3. `/ai:diff-to-pr` を実行

ユーザーの許可を得た後、PR 作成を実行する。

```
/ai:diff-to-pr
```

**PR 本文セクション連携ルール**:

- `/ai:diff-to-pr` の Phase 3.6 で、staged 差分から `TARGET_WORKFLOW_DIR` を 1 件特定する
- Phase 12 の実装ガイド（`implementation-guide.md`）を PR コメントとして投稿する
- PR 本文 `## その他` に、Phase 12 実装ガイド反映元パスと要点（Part 1/Part 2）を記載する
- `implementation-guide.md` の全文を PR コメントとして投稿し、`## 実装ガイド（全文）` 見出しと Part 1/Part 2 を含むことを `gh api .../issues/<PR_NUMBER>/comments` で検証する
- **UI 変更なし**のため PR 本文 `## スクリーンショット` セクションは**削除**する
- 関連 Issue: `Closes #1457`

**PR 本文の自動投稿内容**:

1. **PR 本文**（`.github/pull_request_template.md` 準拠）:
   概要・変更内容・変更タイプ・テスト・関連 Issue・破壊的変更・チェックリスト・その他
2. **PR コメント 1**: 実装の詳細・レビュー注意点・テスト方法・参考資料
3. **PR コメント 2**（Phase 12 成果物あり）: implementation-guide.md の全文

※ UI 変更なしのため、PR コメント 3（スクリーンショットギャラリー）は不要

### 4. 実行結果の確認

- [ ] PR が作成されていること
- [ ] CI が通過していること
- [ ] PR コメントに implementation-guide.md の全文が投稿されていること

### 5. フォールバック（必要時）

`/ai:diff-to-pr` が使えない場合は、git/gh CLI で手動対応する。

```bash
# ブランチ名の例
git checkout -b feature/terminal-handoff-adapter-placement

# コミット
git add -A
git commit -m "feat(adapters): toHandoffGuidance adapter配置先確定と統一実装 (#1457)"

# PR 作成
gh pr create \
  --title "feat(adapters): toHandoffGuidance adapter配置先確定と統一実装 (#1457)" \
  --body-file outputs/phase-13/pr-body.md \
  --base main
```

## 統合テスト連携（Phase 13）

PR 作成前の最終確認:

| テスト項目      | 確認内容                      | 期待結果 | 実行結果   |
| --------------- | ----------------------------- | -------- | ---------- |
| 全テスト PASS   | `pnpm test` が exit 0         | 全 PASS  | {{RESULT}} |
| 型チェック PASS | `pnpm typecheck` が exit 0    | 全 PASS  | {{RESULT}} |
| Lint PASS       | `pnpm lint` が exit 0         | 全 PASS  | {{RESULT}} |
| CI PASS         | GitHub Actions が全ジョブ成功 | 全 PASS  | {{RESULT}} |

## 多角的チェック観点

| 観点           | 適用判断                       | 仕様参照先                              |
| -------------- | ------------------------------ | --------------------------------------- |
| アーキテクチャ | PR の変更が設計と一致している  | `phase-2-design.md`                     |
| セキュリティ   | 機密情報がコミットに含まれない | `.claude/rules/04-electron-security.md` |

## 成果物

| 成果物           | パス                                     | 説明                     |
| ---------------- | ---------------------------------------- | ------------------------ |
| PR 情報          | `outputs/phase-13/pr-info.md`            | PR URL、PR 番号、CI 結果 |
| ローカル確認結果 | `outputs/phase-13/local-check-result.md` | ローカル動作確認結果     |
| 変更サマリー     | `outputs/phase-13/change-summary.md`     | 変更内容のサマリー       |

## 完了条件

- [ ] ユーザーにローカル動作確認を依頼している
- [ ] 変更サマリーを提示し PR 作成の許可を得ている
- [ ] 全変更がコミットされている
- [ ] PR が作成されている（`Closes #1457` を含む）
- [ ] PR コメントに implementation-guide.md の全文が投稿されている
- [ ] PR 本文にスクリーンショットセクションが含まれていない（UI 変更なしのため削除済み）
- [ ] CI が通過している
- [ ] レビュー準備が完了している
- [ ] タスクディレクトリが completed-tasks に移動されている
- [ ] **本 Phase 内の全作業を 100% 完了（PR 作成・CI 確認・移動）**

## タスク完了処理

**PR が作成され、CI が通過した後、タスクディレクトリを完了タスクフォルダに移動する。**

### 移動手順

```bash
# タスクディレクトリを completed-tasks に移動
mv docs/30-workflows/terminal-handoff-adapter-placement/ docs/30-workflows/completed-tasks/

# 移動を確認
ls docs/30-workflows/completed-tasks/ | grep terminal-handoff-adapter-placement

# 変更をコミット
git add docs/30-workflows/
git commit -m "docs(workflows): terminal-handoff-adapter-placementをcompleted-tasksに移動"
git push
```

## サブタスク管理

Phase 実行開始時に、TodoWrite ツールで以下のサブタスクを作成すること:

1. ユーザーへのローカル動作確認依頼
2. 変更サマリー提示と PR 作成許可確認
3. `/ai:diff-to-pr` 実行（または手動フォールバック）
4. CI 確認
5. タスクディレクトリの completed-tasks への移動
6. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐに completed に更新すること。

## タスク 100% 実行確認

Phase 完了前に以下を確認:

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている
- [ ] Phase 末端で各タスクを 100% 完了し、完了を明記している

```bash
# Phase 完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 13
```

## 次の Phase

なし（本タスク完了）

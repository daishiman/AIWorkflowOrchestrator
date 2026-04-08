# task-fix-worktree-conflict-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                     |
| ---------- | -------------------------------------------------------- |
| タスクID   | TASK-FIX-WORKTREE-CONFLICT-001                           |
| タスク名   | 並列ワークツリー `.claude/`・`.agents/` コンフリクト解消 |
| タスク分類 | インフラ改善 / 開発体験 (DX)                             |
| タスク種別 | NON_VISUAL                                               |
| 優先度     | 高（開発速度に直接影響）                                 |
| 機能名     | task-fix-worktree-conflict-001                           |
| 作成日     | 2026-04-08                                               |
| ステータス | spec_created                                             |
| 総Phase数  | 13                                                       |

---

## 目的

50〜60本の並列worktreeブランチが `.claude/skills/` と `.agents/skills/` 配下のファイルを更新するため、マージ時にコンフリクトが頻発している。
このタスクは `.gitattributes` のマージ戦略設定・CI最適化・post-mergeフック・SKILL.md構造分割の4軸で根本解決を行い、さらに 2 つの skill 定義に対する準拠確認と 30 種の思考法による再設計を通じて、**保存すべき情報は両方残し、上書きしてよい情報は再生成で戻せる**開発体制を確立する。

---

## 実行オーケストレーション

### 並列検証

- `task-specification-creator` と `aiworkflow-requirements` の 2 つの skill 定義を先に読み、今回の変更分が両方に漏れなく反映されているかを照合する
- 30 種の思考法は別系統の SubAgent に集約し、批判的思考から KJ 法までを重複なく通して改善案を比較する
- どちらか一方でも未完了なら、改善フェーズには進まない

### 実装分割

- FIX-001-A〜D は独立性が高いため並列実施する
- FIX-001-C 完了後に FIX-001-E / FIX-001-F を直列で実施する
- FIX-001-E / FIX-001-F は運用補助であり、core conflict remediation の完了を前提にする

### 判断基準

- 既存実装をパッチ修正するより再構成した方がエレガントな場合は、その場で再構成に切り替える
- ただし、skill 準拠を犠牲にする再構成は禁止する

## 保存管理ポリシー

| 情報の種類     | 代表ファイル                                       | 保存方針                           | 失われるリスクへの対策                                |
| -------------- | -------------------------------------------------- | ---------------------------------- | ----------------------------------------------------- |
| 追記型情報     | `LOGS.md`, `references/*.md`, `SKILL-changelog.md` | 両方保持（`merge=union`）          | 追記をそのまま残す                                    |
| 再生成可能情報 | `indexes/*.json`                                   | 片側を採用（`merge=ours`）         | post-merge フックで再生成する                         |
| 状態値情報     | `EVALS.json`                                       | 現時点の正本を採用（`merge=ours`） | JSON 破損を防ぎ、長期は JSONL 移行を follow-up 化する |
| 静的仕様       | `SKILL.md`                                         | 変更頻度を低く保つ                 | 変更履歴を別ファイルへ分離する                        |

> つまり、「両方保持するもの」「片側を採用して再生成するもの」「長期移行を前提に現状を守るもの」を分けて扱う。ここが曖昧だと、新しく作成した情報が静かに失われる。

---

## 問題の根本原因

| 原因                                                           | 影響                                       |
| -------------------------------------------------------------- | ------------------------------------------ |
| LOGS.md / references/\*.md が追記型なのに merge=union 未設定   | マージのたびにコンフリクト発生             |
| EVALS.json が JSON 構造を持つのに merge=union が設定されていた | マージ後に重複キーで無効 JSON になるリスク |
| indexes/\*.json が自動生成ファイルなのに merge 戦略が未設定    | コンフリクトを手動解消するしかなかった     |
| `.claude/**` のみ変更した PR でも CI が全件実行される          | 30分 × 直列マージ待ちが発生                |
| SKILL.md に静的仕様と変更履歴が混在している                    | 変更履歴部分が毎回コンフリクト候補になる   |

> 注: `.gitattributes` への LOGS.md / references/_.md / indexes/_.json 設定はこの会話で実施済み。本タスクは core 4 サブタスク（FIX-001-A〜D）を主軸に、依存する 2 サブタスク（FIX-001-E / FIX-001-F）まで含めて解消する。

---

## 実装対象（4 core + 2 dependent サブタスク）

| ID        | サブタスク名                            | 変更ファイル                                                                                              | 概要                                                                           | 並列可否                 |
| --------- | --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| FIX-001-A | EVALS.json merge 戦略修正               | `.gitattributes`                                                                                          | `merge=union` → `merge=ours` に変更                                            | 並列可                   |
| FIX-001-B | CI 設定更新                             | `.github/workflows/ci.yml`                                                                                | `paths-ignore` に `.claude/**`・`.agents/**` 追加、`merge_group:` トリガー追加 | 並列可                   |
| FIX-001-C | post-merge インデックス再生成フック     | `.claude/hooks/post-merge-index-regenerate.sh`、`.claude/scripts/install-git-hooks.sh`、`session-init.sh` | マージ後に indexes/\*.json を自動再生成                                        | 並列可                   |
| FIX-001-D | SKILL.md 構造分割                       | 全スキルの `SKILL.md`、新規 `SKILL-changelog.md`、`.gitattributes`                                        | 変更履歴を別ファイルに切り出し merge=union 設定                                | 並列可                   |
| FIX-001-E | gwt() post-merge フック自動インストール | `~/.config/zsh/conf.d/73-git-worktree.zsh`                                                                | worktree 作成時に post-merge フックが未インストールなら自動設定                | FIX-001-C 完了後         |
| FIX-001-F | B レイアウト重いフックスキップ          | `~/.tmux.conf`                                                                                            | `gwt-layout-init` 実行時に `CLAUDE_SKIP_HEAVY_HOOKS=1` を設定                  | FIX-001-C 完了後・並列可 |

> A〜D は独立して並列化できる。E / F は C の成果物を前提にするため、C 完了後に直列で着手する。

---

## 受け入れ基準

| AC番号 | 基準                                                                          | 検証方法                                                                                              |
| ------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| AC-1   | 並列ブランチが LOGS.md を更新してもマージコンフリクトが発生しない             | git merge テスト                                                                                      |
| AC-2   | EVALS.json が並列マージで破損しない（JSON 構造が有効であること）              | `jq . EVALS.json` で検証                                                                              |
| AC-3   | `.claude/**` のみを変更した PR は CI をスキップして即マージ可能               | CI ログ確認                                                                                           |
| AC-4   | `indexes/*.json` がマージ後に自動再生成される（post-merge フック）            | `git merge` 後のファイル内容確認                                                                      |
| AC-5   | SKILL.md の変更履歴部分はコンフリクトなしにマージできる                       | git merge テスト                                                                                      |
| AC-6   | 全スキルの SKILL-changelog.md が存在し、SKILL.md から変更履歴が削除されている | ファイル存在確認 + grep                                                                               |
| AC-7   | `gwt` で新規 worktree 作成後に post-merge フックが自動インストールされる      | worktree 作成後 `HOOK_PATH=$(git rev-parse --git-path hooks/post-merge); test -x "$HOOK_PATH"` で確認 |
| AC-8   | B レイアウト起動時の `gwt-layout-init` が重いフックをスキップして完了する     | tmux B 起動時のログ確認                                                                               |

---

## Phase 一覧

| Phase | 名称                 | 仕様書                                                       | ステータス                  |
| ----- | -------------------- | ------------------------------------------------------------ | --------------------------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | not-started                 |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | not-started                 |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | not-started                 |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | not-started                 |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | not-started                 |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | not-started                 |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | not-started                 |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | not-started                 |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | not-started                 |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | not-started                 |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | not-started                 |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | not-started                 |
| 13    | PR 作成              | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | ユーザー指示待ち（blocked） |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase 完了時の必須アクション

1. **タスク 100% 実行**: Phase 内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json 更新**: `complete-phase.js` で Phase 完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase 完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-fix-worktree-conflict-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物

| Phase | 主要成果物                                                                                                                                                                                                                                                                              |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | outputs/phase-1/acceptance-criteria.md, outputs/phase-1/scope-definition.md, outputs/phase-1/root-cause-analysis.md                                                                                                                                                                     |
| 2     | outputs/phase-2/design-decisions.md, outputs/phase-2/subtask-design.md, outputs/phase-2/gitattributes-diff.md                                                                                                                                                                           |
| 3     | outputs/phase-3/design-review-result.md, outputs/phase-3/minor-tracking.md                                                                                                                                                                                                              |
| 4     | outputs/phase-4/test-matrix.md, outputs/phase-4/verification-scenarios.md                                                                                                                                                                                                               |
| 5     | outputs/phase-5/implementation-result.md, outputs/phase-5/green-confirmation.md                                                                                                                                                                                                         |
| 6     | outputs/phase-6/test-expansion-result.md                                                                                                                                                                                                                                                |
| 7     | outputs/phase-7/coverage-report.md                                                                                                                                                                                                                                                      |
| 8     | outputs/phase-8/refactoring-result.md                                                                                                                                                                                                                                                   |
| 9     | outputs/phase-9/quality-check-result.md                                                                                                                                                                                                                                                 |
| 10    | outputs/phase-10/final-review-result.md, outputs/phase-10/ac-verification.md                                                                                                                                                                                                            |
| 11    | outputs/phase-11/manual-test-checklist.md, outputs/phase-11/manual-test-result.md, outputs/phase-11/manual-test-report.md, outputs/phase-11/discovered-issues.md                                                                                                                        |
| 12    | outputs/phase-12/implementation-guide.md, outputs/phase-12/system-spec-update-summary.md, outputs/phase-12/documentation-changelog.md, outputs/phase-12/unassigned-task-detection.md, outputs/phase-12/skill-feedback-report.md, outputs/phase-12/phase12-task-spec-compliance-check.md |
| 13    | outputs/phase-13/local-check-result.md, outputs/phase-13/change-summary.md, outputs/phase-13/pr-info.md, outputs/phase-13/pr-ready-report.md                                                                                                                                            |

---

## 依存関係

| 種別             | 説明                                                                                              |
| ---------------- | ------------------------------------------------------------------------------------------------- |
| 前提（実施済み） | `.gitattributes` への LOGS.md / references/_.md / indexes/_.json マージ戦略追加（この会話で実施） |
| 関連             | 将来タスク: EVALS.json を JSONL 形式に移行（FIX-001-A の長期対策）                                |

---

## 完了記録

_Phase 13 完了後に記録する_

| 項目   | 内容 |
| ------ | ---- |
| 完了日 | -    |
| PR URL | -    |
| 実装者 | -    |
| 備考   | -    |

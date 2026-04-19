# Phase 2: `.gitattributes` 修正パッチ案

## 1. Before / After 差分

### Before（現行）

```gitattributes
# Visual regression baseline 画像を binary として扱う（git diff を抑制）
apps/desktop/e2e/ui-ux/*.spec.ts-snapshots/*.png binary
apps/desktop/e2e/ui-ux/snapshots/*.png binary

# ── マージ戦略 ──────────────────────────────────────────────────────────────
# 追記型ログ・評価記録: 並列ブランチからの追記を自動統合
.claude/skills/*/LOGS.md          merge=union
.agents/skills/*/LOGS.md          merge=union
.claude/skills/*/EVALS.json       merge=ours
.agents/skills/*/EVALS.json       merge=ours

# リファレンス・記録ファイル（append-only）
.claude/skills/*/references/*.md  merge=union     # ❌ 構造化も巻き込む
.agents/skills/*/references/*.md  merge=union     # ❌ 構造化も巻き込む

# SKILL-changelog.md
.claude/skills/*/SKILL-changelog.md  merge=union
.agents/skills/*/SKILL-changelog.md  merge=union

# auto-generated indexes
.claude/skills/*/indexes/*.json   merge=ours
.claude/skills/*/indexes/*.md     merge=ours
.agents/skills/*/indexes/*.json   merge=ours
.agents/skills/*/indexes/*.md     merge=ours
```

### After（推奨案 A - 採用）

```gitattributes
# Visual regression baseline 画像を binary として扱う（git diff を抑制）
apps/desktop/e2e/ui-ux/*.spec.ts-snapshots/*.png binary
apps/desktop/e2e/ui-ux/snapshots/*.png binary

# === 関連リソース ===
# - merge ドライバー登録: bash .claude/scripts/setup-merge-drivers.sh
# - 判断ガイドライン: docs/30-workflows/gitattributes-merge-union-reeval-001/
# - 元タスク Issue: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281

# ── [append-only] 末尾追記型ファイル: merge=union で並列追記を自動統合 ──
# 新規ファイル追加判断: 末尾追記が支配的で行順序が意味を持たない場合に append-only 扱い
.claude/skills/*/LOGS.md                                   merge=union
.agents/skills/*/LOGS.md                                   merge=union
.claude/skills/*/SKILL-changelog.md                        merge=union
.agents/skills/*/SKILL-changelog.md                        merge=union
.claude/skills/*/references/LOGS.md                        merge=union
.agents/skills/*/references/LOGS.md                        merge=union
.claude/skills/*/references/SKILL-changelog.md             merge=union
.agents/skills/*/references/SKILL-changelog.md             merge=union
.claude/skills/*/references/task-workflow-completed*.md    merge=union
.agents/skills/*/references/task-workflow-completed*.md    merge=union
.claude/skills/*/references/lessons-learned-*.md           merge=union
.agents/skills/*/references/lessons-learned-*.md           merge=union

# ── [auto-generated] インデックス・評価結果: merge=ours でマージ後に再生成 ──
# 新規ファイル追加判断: スクリプトで再生成可能かつ自ブランチ側を正としたい場合
# 注意: merge=ours はカスタムドライバー。初回 clone 後 `bash .claude/scripts/setup-merge-drivers.sh` を実行
.claude/skills/*/EVALS.json                                merge=ours
.agents/skills/*/EVALS.json                                merge=ours
.claude/skills/*/indexes/*.json                            merge=ours
.agents/skills/*/indexes/*.json                            merge=ours
.claude/skills/*/indexes/*.md                              merge=ours
.agents/skills/*/indexes/*.md                              merge=ours

# ── [structured] 構造化ドキュメント ──
# 新規ファイル追加判断: 見出し・表・節構造があり、衝突は人手解決すべき場合
# 明示指定せずデフォルト 3-way マージ: task-workflow.md / task-workflow-rules.md / task-workflow-phases.md
# / task-workflow-active.md / task-workflow-backlog*.md / lessons-learned.md (root) / api-*.md / arch-*.md
# / quick-reference*.md / resource-map*.md / topic-map*.md / phase-template-*.md / unassigned-task-*.md
```

## 2. 選択肢 A vs B のトレードオフ評価

### 選択肢 A: glob 細分割（推奨）

- **内容**: append-only の代表パターンを明示列挙。構造化は指定なし。
- 誤適用リスク: **低**。明示列挙されたファイルだけが union 対象になる。
- 可読性: **中**。エントリ数が増える（約 30 行）が、コメントでカテゴリ分けすれば辿りやすい。
- 追加ファイル時の事故率: **低**。新規ファイル名が既存 glob にマッチしなければデフォルト扱い。
  誤って `task-workflow-completed-foo.md` のような命名すれば union に合流（これは意図通り）。

### 選択肢 B: glob 粗いまま＋コメント注釈

- **内容**: 現行の `references/*.md merge=union` を残し、コメントで「構造化には使わないこと」と注釈。
- 誤適用リスク: **高**。命名ルール違反があれば依然として構造化ファイルに union が当たる。
- 可読性: **高**。エントリ数は少ないが、実際の挙動と意図が乖離する。
- 追加ファイル時の事故率: **高**。`arch-ipc.md` のような新規構造化ファイルも無条件で union 対象。

### 比較表

| 評価軸                  | A（細分割）            | B（粗いまま+注釈） |
| ----------------------- | ---------------------- | ------------------ |
| 誤適用リスク            | 低 ✅                  | 高 ❌              |
| 可読性（静的）          | 中                     | 高                 |
| 追加ファイル時の事故率  | 低 ✅                  | 高 ❌              |
| AC-1 達成度             | 完全達成 ✅            | 未達 ❌            |
| `git check-attr` 透明性 | 高 ✅（glob が具体的） | 中                 |
| **推奨**                | **採用**               | 不採用             |

## 3. 推奨案: 選択肢 A

Phase 1 の分類インベントリ（`outputs/phase-1/file-classification-inventory.md`）に沿い、
構造化ドキュメントへの誤適用を物理的に排除する選択肢 A を採用する。
AC-1（構造化ドキュメントから `merge=union` 除去）・AC-2（append-only 維持）を
同時に機械検証可能にする。

## 4. 実装時の注意

1. 既存の `.claude/skills/*/references/*.md merge=union` 行（line 15-16）を **完全削除**。
2. 新規 glob は **カテゴリ別**にグループ化し、グループ見出しコメントを付ける。
3. mirror 側（`.agents/skills/*`）を必ず同時に追加（parity 100%）。
4. Phase 8 で再度順序整列・コメントスタイル統一を行う（本 Phase では機能面を確定）。

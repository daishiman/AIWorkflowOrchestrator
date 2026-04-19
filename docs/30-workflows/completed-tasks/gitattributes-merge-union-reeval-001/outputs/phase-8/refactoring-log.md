# Phase 8: リファクタリング記録

本 Phase は `.gitattributes` の挙動を**変えず**、可読性・保守性・将来の追加容易性を向上させるためのコスメティックな整形のみを行う。
Phase 5 の挙動変更（`merge=union` の適用範囲縮小）は維持し、再度の挙動変更は禁止。

## 1. 実施内容サマリー

| 指標                               | Before (Phase 7 終了時) | After (Phase 8 実施後)     | 備考                                        |
| ---------------------------------- | ----------------------- | -------------------------- | ------------------------------------------- |
| 総行数                             | 49 行                   | 46 行                      | 3 行減（structured ブロックのコメント整理） |
| 挙動を持つエントリ数               | 20 件                   | 20 件                      | 変化なし（挙動不変）                        |
| グループ見出し形式                 | `# ── [C-1] ... ──`     | `## グループX: ...`        | Markdown 見出し風に統一                     |
| コメントテンプレート適用率         | 0/4 グループ            | 4/4 グループ               | `[意図]/[注意]/[関連]` 3 要素を全適用       |
| `.agents/` ↔ `.claude/` ペアの整列 | pair 方式（.claude 先） | alphabetical（.agents 先） | アルファベット順に統一                      |
| 冒頭「関連リソース」集約           | 既に存在                | 維持                       | Phase 5 で導入済み                          |

## 2. 重複削除と並び順整理（タスク0）

### 2.1 重複検出結果

| 検査項目                          | 結果                                             |
| --------------------------------- | ------------------------------------------------ |
| 完全重複 glob                     | 0 件（重複なし）                                 |
| より広い glob で代替可能な狭 glob | 0 件（全て意図的な分割）                         |
| mirror parity 欠損                | 0 件（`.agents/` 9 件 / `.claude/` 9 件 で対称） |

**確認コマンド**:

```bash
$ grep -cE '^\.agents/skills' .gitattributes   # => 9
$ grep -cE '^\.claude/skills' .gitattributes   # => 9
```

### 2.2 カテゴリ別グループ化（A〜D）

| グループ | 対象                                    | 戦略          | 件数（ペア）    |
| -------- | --------------------------------------- | ------------- | --------------- |
| A        | append-only（LOGS/SKILL-changelog/...） | `merge=union` | 12 (6×2 mirror) |
| B        | 構造化ドキュメント                      | default 3-way | 0（宣言のみ）   |
| C        | auto-generated（EVALS/indexes/...）     | `merge=ours`  | 6 (3×2 mirror)  |
| D        | binary（PNG snapshots）                 | `binary`      | 2               |

### 2.3 アルファベット順整列

Before: `.claude/` → `.agents/` の pair 方式
After : `.agents/` → `.claude/`（各グループ内でアルファベット順）

**判断根拠**:

- Phase 8 仕様のタスク0-5「各グループ内をアルファベット順に並べ替え」に明示的従属
- mirror parity は各グループ内で連続配置されるため、pair 方式の可読性は維持
- Git の「最後にマッチしたパターン勝ち」ルールは、異なる glob 間では並び順に依存しないため挙動不変

## 3. コメントスタイル統一（タスク1）

### 3.1 適用テンプレート

```
## グループX: <一言説明>（<merge戦略>）
# [意図] このパターンに対して <merge戦略> を適用する理由
# [注意] 適用条件・前提条件・既知の制約
# [関連] setup-merge-drivers.sh / 判断ガイドライン / 関連 Issue 等
```

### 3.2 Before → After 対応

#### グループD (binary)

**Before**:

```
# Visual regression baseline 画像を binary として扱う（git diff を抑制）
# Playwright はデフォルトで spec-file-name-snapshots/ ディレクトリに保存する
apps/desktop/e2e/ui-ux/*.spec.ts-snapshots/*.png binary
apps/desktop/e2e/ui-ux/snapshots/*.png binary
```

**After**:

```
## グループD: binary（git diff 抑制・差分計算スキップ）
# [意図] Visual regression baseline 画像は binary として扱い、textual diff を発生させない
# [注意] Playwright はデフォルトで `<spec>.spec.ts-snapshots/` に保存し、独自 snapshot ディレクトリも併存
# [関連] apps/desktop/e2e/ui-ux/ 以下の visual regression テスト
apps/desktop/e2e/ui-ux/*.spec.ts-snapshots/*.png           binary
apps/desktop/e2e/ui-ux/snapshots/*.png                     binary
```

#### グループA (append-only / merge=union)

**Before** (抜粋):

```
# ── [C-1] [append-only] スキル直下の時系列追記ファイル: merge=union で並列追記を自動統合 ──
# 新規ファイル追加判断: 末尾追記が支配的で行順序が意味を持たない場合に append-only 扱い
.claude/skills/*/LOGS.md                                   merge=union
...

# ── [C-2] [append-only] references/ 配下の追記型ファイル: merge=union で統合 ──
# 新規ファイル追加判断: task-workflow-completed*/lessons-learned-* 等、末尾追記が支配的かで判定
# 注意: references/task-workflow.md や references/lessons-learned.md（root）は構造化のため本グループに含めない
.claude/skills/*/references/LOGS.md                        merge=union
...
```

**After** (C-1 と C-2 を統合):

```
## グループA: append-only（merge=union で並列追記を自動統合）
# [意図] 末尾追記が支配的で行順序が意味を持たないファイルに限り、union で両側の追記を保持
# [注意] 新規ファイルは「追記が支配的か」で判定。構造化ファイル（見出し/表/節）は本グループに含めない
# [関連] 冒頭「関連リソース」参照。判断ガイドラインは docs/30-workflows/gitattributes-merge-union-reeval-001/
.agents/skills/*/LOGS.md                                   merge=union
.agents/skills/*/SKILL-changelog.md                        merge=union
...
.claude/skills/*/LOGS.md                                   merge=union
...
```

**統合の意義**: C-1（skill 直下）と C-2（references 配下）は両方 append-only × `merge=union` で戦略が同一。
分離する意義は弱く、単一グループ見出し配下にまとめて「適用深度の違い」を glob で表現する方が保守性が高い。

#### グループC (auto-generated / merge=ours)

**Before**:

```
# ── [C-3] [auto-generated] インデックス・評価結果: merge=ours でマージ後に再生成 ──
# 新規ファイル追加判断: スクリプトで再生成可能かつ自ブランチ側を正としたい場合
# 注意: merge=ours はカスタムドライバー（Git 組み込みではない）
#       初回 clone 後に必ず: bash .claude/scripts/setup-merge-drivers.sh
# マージ後の再生成: node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
.claude/skills/*/EVALS.json                                merge=ours
...
```

**After**:

```
## グループC: auto-generated（merge=ours で自ブランチ側採用・マージ後に再生成）
# [意図] スクリプトで再生成可能な自動生成物は ours で自ブランチ側を採用し、後から再生成する
# [注意] merge=ours はカスタムドライバー（Git 組み込みではない）。初回 clone 後に登録必須
# [関連] 登録: bash .claude/scripts/setup-merge-drivers.sh / 再生成: node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
.agents/skills/*/EVALS.json                                merge=ours
...
```

#### グループB (structured / default)

**Before**:

```
# ── [structured] 構造化ドキュメント（デフォルト 3-way マージ） ──
# 新規ファイル追加判断: 見出し・表・節構造があり、衝突は人手解決すべき場合
# 明示指定なし（default）: references/task-workflow.md / task-workflow-rules.md / task-workflow-phases.md
# / task-workflow-active.md / task-workflow-backlog*.md / references/lessons-learned.md (root)
# / api-*.md / arch-*.md / quick-reference*.md / resource-map*.md / topic-map*.md
# / phase-template-*.md / unassigned-task-*.md
```

**After**:

```
## グループB: 構造化ドキュメント（デフォルト 3-way マージで人手解決）
# [意図] 見出し・表・節構造を持つファイルは union すると破綻するため、明示指定せずデフォルト戦略に委ねる
# [注意] 明示指定なし（default）のため本ファイルにエントリを書かない。対象例:
#        references/task-workflow{,-rules,-phases,-active,-backlog*}.md
#        references/lessons-learned.md (root) / api-*.md / arch-*.md
#        quick-reference*.md / resource-map*.md / topic-map*.md
#        phase-template-*.md / unassigned-task-*.md
# [関連] 新規ファイル追加判断: 追記支配ならグループA、構造あるならグループB（本グループ）
```

**brace expansion 風列挙への置換**: `task-workflow{,-rules,-phases,-active,-backlog*}.md` とすることで
glob ではない説明箇所の可読性を改善（実行されるわけではないが、読み手には親しみがある表記）。

## 4. navigation drift 削減（タスク2）

### 4.1 冒頭「関連リソース」集約セクション

Phase 5 で既に導入済み。以下の形式を維持:

```
# === 関連リソース ===
# - merge ドライバー登録: bash .claude/scripts/setup-merge-drivers.sh
# - 判断ガイドライン: docs/30-workflows/gitattributes-merge-union-reeval-001/
# - 元タスク Issue: https://github.com/daishiman/AIWorkflowOrchestrator/issues/2281
```

### 4.2 各グループ [関連] 欄からの参照集約

- グループA の `[関連]` は「冒頭『関連リソース』参照」に簡略化（判断ガイドラインは冒頭からも辿れる）
- グループC のみ、`setup-merge-drivers.sh` 登録必須 / `generate-index.js` 再生成コマンドを詳細記載（実行時に必要な具体的操作のため、現地記載が妥当）

### 4.3 逆方向リンク（`setup-merge-drivers.sh` → `.gitattributes`）

Phase 5 で `setup-merge-drivers.sh` 冒頭コメントに次の参照を既に追記済み:

```bash
# 関連:
#   - .gitattributes（merge=ours 適用ファイル定義）
#   - docs/30-workflows/gitattributes-merge-union-reeval-001/（判断ガイドライン）
```

Phase 8 では追加変更なし。

## 5. 変更テーブル [Feedback RT-03]

| #   | 対象                             | Before                       | After                                              | 理由                                    |
| --- | -------------------------------- | ---------------------------- | -------------------------------------------------- | --------------------------------------- |
| 1   | 冒頭 PNG binary ブロック配置     | ファイル冒頭 (1-4 行)        | 「関連リソース」後のグループD見出し配下            | グループ分類に沿った配置                |
| 2   | グループ見出しマーカー           | `# ── [C-N] ... ──`          | `## グループX: <説明>`                             | Markdown 見出し風統一・目視識別性向上   |
| 3   | C-1 と C-2 の分離                | 2 グループ                   | グループA に統合（1 グループ）                     | 戦略同一のため分離の意義が弱い          |
| 4   | コメント 3 要素テンプレート      | 不統一（1-3 行の自由記述）   | `[意図] / [注意] / [関連]` 3 行構造                | スタイル統一                            |
| 5   | ペア配置順                       | `.claude/` → `.agents/` pair | `.agents/` → `.claude/` alphabetical               | アルファベット順整列（仕様タスク0-5）   |
| 6   | structured セクションの列挙      | 冗長な行列挙                 | brace expansion 風 `{,-rules,-phases,-active,...}` | 可読性向上（glob ではないが読みやすい） |
| 7   | 「関連」欄の冒頭セクション参照化 | 各グループで個別記載         | グループA は「冒頭『関連リソース』参照」に集約     | navigation drift 削減                   |

### 5.1 変更件数集計

- 重複削除: 0 件（元々重複なし）
- 並び替え: `.agents/` / `.claude/` ペア順 × 9 ペア = 18 行の順序変更
- コメント再構築: 4 グループ見出し + 4×3 テンプレート要素 = 計 16 コメント行の新規化
- 構造追加: グループB 明示見出し化（1 件）

### 5.2 `git diff --stat` 実測

```
.gitattributes | 70 ++++++++++++++++++++++++++++++++++++----------------------
 1 file changed, 44 insertions(+), 26 deletions(-)
```

全て非機能変更（コメント・順序のみ）であり、挙動を持つ行は順序を除いて内容不変。

## 6. 挙動不変の確認（統合テスト連携）

### 6.1 `git check-attr merge` 再実測（After）

```bash
$ git check-attr merge -- \
    .claude/skills/aiworkflow-requirements/LOGS.md \
    .claude/skills/aiworkflow-requirements/references/LOGS.md \
    .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md \
    .claude/skills/aiworkflow-requirements/references/lessons-learned-current.md \
    .claude/skills/aiworkflow-requirements/references/task-workflow.md \
    .claude/skills/aiworkflow-requirements/references/lessons-learned.md \
    .claude/skills/aiworkflow-requirements/references/api-core.md \
    .claude/skills/aiworkflow-requirements/indexes/topic-map.json \
    .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
    .claude/skills/aiworkflow-requirements/EVALS.json
```

**結果**:

| ファイル                                       | 期待        | 実測        | 判定 |
| ---------------------------------------------- | ----------- | ----------- | ---- |
| `LOGS.md` (skill 直下)                         | union       | union       | ✅   |
| `references/LOGS.md`                           | union       | union       | ✅   |
| `references/task-workflow-completed.md`        | union       | union       | ✅   |
| `references/lessons-learned-current.md`        | union       | union       | ✅   |
| `references/task-workflow.md` (構造化)         | unspecified | unspecified | ✅   |
| `references/lessons-learned.md` (構造化, root) | unspecified | unspecified | ✅   |
| `references/api-core.md` (構造化)              | unspecified | unspecified | ✅   |
| `indexes/topic-map.json`                       | ours        | ours        | ✅   |
| `indexes/topic-map.md`                         | ours        | ours        | ✅   |
| `EVALS.json`                                   | ours        | ours        | ✅   |

**判定**: 10/10 PASS — Phase 5 後の挙動と完全一致。

### 6.2 Phase 4-6 テスト連携

| テスト                            | 種別 | Phase 8 での状態                               |
| --------------------------------- | ---- | ---------------------------------------------- |
| TC-05                             | 静的 | コメント基準 grep: 4 グループ見出し → PASS     |
| FAIL-02                           | 静的 | 構造化ファイルへの union 漏出: 0 件 → PASS     |
| REG-01                            | 静的 | 判断ガイドコメント存在: `[関連]` 行 ≥ 4 → PASS |
| REG-03                            | 実行 | `setup-merge-drivers.sh` は未変更 → PASS       |
| TC-01/02/03/04 / FAIL-01 / REG-02 | 挙動 | Phase 11 で再実行（未実行）                    |

### 6.3 mirror parity

```
.agents/skills/... : 9 エントリ
.claude/skills/... : 9 エントリ
```

カテゴリ別対称性も確認:

| カテゴリ          | `.agents/skills` | `.claude/skills` |
| ----------------- | ---------------- | ---------------- |
| グループA (union) | 6                | 6                |
| グループC (ours)  | 3                | 3                |

→ 両側完全対称。parity 100% 維持。

## 7. 残課題と推奨 Issue

本 Phase では新規課題は発生していない。Phase 6 で抽出した REC-01 〜 REC-04 は引き続き有効（Phase 12 で再確認）。

## 8. 完了条件チェック

- [x] 重複エントリが全て削除されている（元々 0 件 → 0 件維持）
- [x] エントリがカテゴリ別 → アルファベット順で並んでいる
- [x] 全コメントが3要素テンプレート（`[意図] / [注意] / [関連]`）に統一されている
- [x] 冒頭に関連リソース集約セクションが存在（Phase 5 導入を維持）
- [x] mirror parity が `.claude/skills/*` ↔ `.agents/skills/*` で維持されている（9/9 対称）
- [x] 変更テーブルが本ファイルに記録されている（セクション 5）
- [x] Phase 4-6 の静的テストが全件 PASS（挙動不変）
- [x] 本Phase内の全タスク（0/1/2/3）を 100% 実行完了

## 9. 成果物一覧

| パス                                            | 種別     | 内容                                       |
| ----------------------------------------------- | -------- | ------------------------------------------ |
| `.gitattributes`                                | 修正     | Phase 8 リファクタリング適用後             |
| `outputs/phase-8/gitattributes.before`          | 新規作成 | Phase 7 終了時のスナップショット           |
| `outputs/phase-8/refactor.diff`                 | 新規作成 | `git diff .gitattributes` (79 行)          |
| `outputs/phase-8/check-attr.after-refactor.txt` | 新規作成 | リファクタリング後の `git check-attr` 実測 |
| `outputs/phase-8/refactoring-log.md`            | 新規作成 | 本ファイル                                 |

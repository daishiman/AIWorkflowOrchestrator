# Phase 2: マージ戦略設計書

## 1. 現行パターン依存関係分析（3 列対照）

| 現行パターン                                      | 影響ファイル                                            | 想定マージ挙動                    |
| ------------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| `.claude/skills/*/LOGS.md merge=union`            | スキル直下の `LOGS.md`（7 skill）                       | 行連結（union）                   |
| `.agents/skills/*/LOGS.md merge=union`            | mirror 側 LOGS.md                                       | 行連結（union）                   |
| `.claude/skills/*/EVALS.json merge=ours`          | `.claude/skills/*/EVALS.json`（存在する場合）           | カスタムドライバー ours（要登録） |
| `.agents/skills/*/EVALS.json merge=ours`          | mirror 側 EVALS.json                                    | カスタムドライバー ours（要登録） |
| `.claude/skills/*/references/*.md merge=union` ❌ | 609 件 全 references/\*.md（append-only + 構造化 混在） | 行連結（union）→ **構造化を破損** |
| `.agents/skills/*/references/*.md merge=union` ❌ | mirror 側 609 件                                        | 行連結（union）→ **構造化を破損** |
| `.claude/skills/*/SKILL-changelog.md merge=union` | スキル直下の `SKILL-changelog.md`                       | 行連結（union）                   |
| `.agents/skills/*/SKILL-changelog.md merge=union` | mirror 側 SKILL-changelog.md                            | 行連結（union）                   |
| `.claude/skills/*/indexes/*.{json,md} merge=ours` | `indexes/keywords.md` 等                                | カスタムドライバー ours（要登録） |
| `.agents/skills/*/indexes/*.{json,md} merge=ours` | mirror 側 indexes                                       | カスタムドライバー ours（要登録） |

❌ 印: 本タスクで分割・精緻化する対象。

## 2. マージ戦略選定基準（判断順序）

判断順: **まず append-only か → 次にカスタム ours が必要か → それ以外はデフォルト**

### 2.1 `merge=union` の適用条件

- 末尾追記が支配的で行順序が意味を持たないファイル
- 並列ブランチで異なる行の追記が頻発する
- 行レベルで結合しても意味構造が壊れない
- **代表例**: `LOGS.md`, `SKILL-changelog.md`, `task-workflow-completed*.md`, `lessons-learned-*.md`

### 2.2 `merge=ours`（カスタム）の適用条件

- 自ブランチ（統合先）側の状態を常に正とすべきファイル
- 双方の変更を自動統合するとデータが壊れる（JSON・Markdown インデックス）
- マージ後にスクリプトで再生成可能
- **代表例**: `indexes/*.json`, `indexes/*.md`, `EVALS.json`

### 2.3 デフォルト 3-way マージの適用条件

- 構造化されており、衝突は人手解決すべきファイル
- 見出し階層・表・箇条書き・コードフェンスを保持する運用
- **代表例**: `task-workflow.md`, `api-*.md`, `arch-*.md`, `phase-template-*.md`, `lessons-learned.md`（root）

### 2.4 判断フローチャート

```
新規 .md ファイル追加
  │
  ▼
末尾追記が支配的？
  │
  ├─ Yes → merge=union（LOGS.md / *-completed*.md / lessons-learned-* パターンへ合流）
  │
  ▼ No
自ブランチ側を正としたい？（自動生成・インデックス）
  │
  ├─ Yes → merge=ours（indexes 系パターンへ合流）
  │
  ▼ No
デフォルト（指定なし）→ 3-way マージ + 衝突時は人手解決
```

## 3. glob 精緻化方針

### 3.1 Before → After

**Before（過剰適用）**:

```gitattributes
.claude/skills/*/references/*.md  merge=union
.agents/skills/*/references/*.md  merge=union
```

**After（分類反映）**:

```gitattributes
# append-only ファイルのみ union 指定
.claude/skills/*/references/LOGS.md                         merge=union
.claude/skills/*/references/SKILL-changelog.md              merge=union
.claude/skills/*/references/task-workflow-completed*.md     merge=union
.claude/skills/*/references/lessons-learned-*.md            merge=union
.agents/skills/*/references/LOGS.md                         merge=union
.agents/skills/*/references/SKILL-changelog.md              merge=union
.agents/skills/*/references/task-workflow-completed*.md     merge=union
.agents/skills/*/references/lessons-learned-*.md            merge=union
# 構造化ファイル（task-workflow.md / api-*.md / arch-*.md / lessons-learned.md root 等）は
# 明示指定なしでデフォルト 3-way マージ
```

### 3.2 glob 優先順位ルール

Git は `.gitattributes` の **最後にマッチしたパターン** を採用する。そのため:

- 既存の広い `references/*.md merge=union` は **完全削除**（残すと構造化も拾う）
- 新しい狭い glob 群のみを残す
- 除外は明示的 reset 指定（`-merge`）ではなく、**マッチさせない**ことで実現

## 4. 既存コンポーネント再利用方針（[FB-SDK-07-1]）

- **再利用対象**: `setup-merge-drivers.sh`（ロジック変更なし、冒頭コメントのみ追記）
- **新規作成しない**: 新規スクリプト・新規 hook・新規 CI 定義
- **変更対象ファイル**: `.gitattributes` / `setup-merge-drivers.sh`（コメントのみ）

## 5. リスクと緩和策

| リスク                                                | 緩和策                                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| glob が `*` と `**` で挙動差異                        | `.gitattributes` は `*` のみでパス内では使用しないため `.claude/skills/*/references/` の直下のみ対象になることを Phase 11 で実測検証 |
| 新規 append-only ファイル命名が既存 glob に合致しない | Phase 12 Task 1 で再評価フローを文書化、Phase 12 Task 4 未タスク検出候補 B として起票候補化                                          |
| `setup-merge-drivers.sh` 未実行環境                   | スクリプト冒頭コメント追記 + Phase 12 `implementation-guide.md` に「初回 clone 後の必須実行」を明記                                  |
| mirror parity 維持                                    | Phase 9 タスク2 で対称率 100% チェック                                                                                               |

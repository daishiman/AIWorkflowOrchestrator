# Phase 12 統合設計

## メタ情報

| 項目     | 値                                                          |
| -------- | ----------------------------------------------------------- |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                  |
| Phase    | 2                                                           |
| 作成日   | 2026-02-26                                                  |
| 目的     | spec-update-workflow.md / phase-11-12-guide.md への反映設計 |

## 1. `spec-update-workflow.md` への反映設計

### 1.1 変更対象箇所

| #   | 変更箇所                         | セクション                           | 行番号（現状） | 変更種別 |
| --- | -------------------------------- | ------------------------------------ | -------------- | -------- |
| 1   | Step 1-G.3 検証コマンド          | 「3. SKILL 検証（2スキル）」         | L369-377       | 置換     |
| 2   | 必須更新ファイル欄の検証コマンド | 「必須更新ファイル（全タスク共通）」 | L434           | 置換     |
| 3   | Warning 運用ルール（新規追加）   | Step 1-G.3 直後に新規セクション追加  | L378付近       | 追加     |

### 1.2 変更 #1: Step 1-G.3 検証コマンドの置換

**Before（L369-377）:**

````markdown
#### 3. SKILL 検証（2スキル）

\```bash
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
 .claude/skills/aiworkflow-requirements --verbose
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
 .claude/skills/task-specification-creator --verbose
\```

- 正常時: 両方で `Skill is valid!`
- 異常時: SKILL構造を修正後に再実行
````

**After:**

````markdown
#### 3. SKILL 検証（3スキル）

\```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
\```

- 正常時: 3スキル全てで Error 0件（終了コード 0）
- 異常時: Error が1件以上の場合、SKILL構造を修正後に再実行
- Warning: 3段階分類（許容/要監視/要対応）に基づき対応する（下記参照）

> **fallback**: Node.js が利用不可の場合のみ、`python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path> --verbose` を使用する。fallback 使用時は成果物に「fallback 経路を使用した」旨を明記すること。
````

### 1.3 変更 #2: 必須更新ファイル欄の検証コマンド置換

**Before（L434）:**

```markdown
- [ ] `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` で更新したSKILL 2件が `Skill is valid!` であることを確認した
```

**After:**

```markdown
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した
```

### 1.4 変更 #3: Warning 運用ルールの新規追加

Step 1-G.3 の検証コマンド直後（L378付近）に、以下のサブセクションを挿入する:

**挿入内容:**

```markdown
#### 3.1 検証結果の判定基準

**合格基準**: Error 0件で合格。Warning は3段階分類に基づき対応する。

| 分類   | 定義                                                                          | 対応方針                                              |
| ------ | ----------------------------------------------------------------------------- | ----------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高くスキルの動作・構造に影響しない | 件数を記録し、前回比で増加傾向がないことを確認する    |
| 要監視 | 新規に発生した Warning で、放置するとスキル品質低下の兆候となる可能性がある   | 次回 Phase 12 までに対応方針を決定する                |
| 要対応 | スキルの動作・構造の正確性に直接影響する Warning                              | 本 Phase 内で修正する。修正不可の場合は未タスク化する |

**判定フロー:**

1. 当該 Warning は前回 Phase 12 から存在する既知の Warning か？
   - YES かつ件数横ばい → 「許容」
   - YES かつ件数増加 → 「要監視」
   - NO → 次へ
2. スキルの動作・構造の正確性に直接影響するか？（name不一致、必須セクション不足等）
   - YES → 「要対応」
   - NO → 「要監視」

**`aiworkflow-requirements` 固有の許容条件:**

`references/` 配下のファイル（150ファイル以上）が SKILL.md からリンクされていない Warning は、`indexes/resource-map.md` または `indexes/topic-map.md` からリンクされていれば「許容」とする。Progressive Disclosure 設計により、全ファイルの SKILL.md 直接リンクは意図的に省略されている。
```

## 2. `phase-11-12-guide.md` への反映設計

### 2.1 変更対象箇所

| #   | 変更箇所                           | セクション                            | 行番号（現状） | 変更種別 |
| --- | ---------------------------------- | ------------------------------------- | -------------- | -------- |
| 1   | Phase 12 完了条件のコマンドパス    | 「Phase 12 完了条件チェックリスト」   | L182           | 置換     |
| 2   | Phase 12 自動化コマンドの .js パス | 「Phase 12 自動化コマンド」           | L247-248       | 置換     |
| 3   | 検証結果の読み方ガイド（新規追加） | Phase 12 自動化コマンド直後に新規追加 | L249付近       | 追加     |

### 2.2 変更 #1: Phase 12 完了条件のコマンドパス置換

**Before（L182）:**

```markdown
- [ ] `skill-creator/scripts/quick_validate.js` で更新したSKILLを検証し、`Skill is valid!` を確認した
```

**After:**

```markdown
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した（Warning は `spec-update-workflow.md` Step 1-G.3.1 の判定基準に基づき対応）
```

### 2.3 変更 #2: Phase 12 自動化コマンドの .js パス置換

**Before（L247-248）:**

```bash
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
```

**After:**

```bash
# SKILL frontmatter検証（3スキル）— 詳細は spec-update-workflow.md Step 1-G.3 を参照
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### 2.4 変更 #3: 検証結果の読み方ガイド（新規追加）

Phase 12 自動化コマンドセクション内の SKILL 検証コマンド直後に、以下を追加する:

**挿入内容:**

```markdown
# SKILL 検証結果の読み方

# - `✓` = Pass（合格項目）

# - `⚠` = Warning（3段階分類で対応を判断）

# - `✗` = Error（修正必須）

# - 判定基準: Error 0件で合格。Warning の詳細ルールは

# spec-update-workflow.md Step 1-G.3.1 を参照
```

### 2.5 重複回避方針

| 記載対象                     | `spec-update-workflow.md` | `phase-11-12-guide.md`                                        |
| ---------------------------- | ------------------------- | ------------------------------------------------------------- |
| 検証コマンド全文             | 記載する（正本）          | 記載する（実行可能なコピー）                                  |
| Warning 3段階分類テーブル    | 記載する（正本）          | 記載しない（「spec-update-workflow.md Step 1-G.3.1 を参照」） |
| 判定フロー                   | 記載する（正本）          | 記載しない（同上）                                            |
| 許容条件の詳細               | 記載する（正本）          | 記載しない（同上）                                            |
| 検証結果の読み方（識別記号） | 記載しない                | 記載する（`✓`/`⚠`/`✗` の説明）                                |
| fallback 経路の使用条件      | 記載する（正本）          | 記載しない（同上）                                            |

## 3. 変更影響の確認

### 3.1 `.py` 参照の全置換箇所

`spec-update-workflow.md` 内の `quick_validate.py` 参照箇所:

| 行番号 | 現状の記載                                                                          | 置換対象 |
| ------ | ----------------------------------------------------------------------------------- | -------- |
| L370   | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \` | YES      |
| L372   | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \` | YES      |

2件の `.py` 参照を全て `.js` に置換する。

### 3.2 `ObsidianMemo` パスの全置換箇所

| ファイル                | 行番号 | 現状の記載                                                                                   | 置換対象 |
| ----------------------- | ------ | -------------------------------------------------------------------------------------------- | -------- |
| spec-update-workflow.md | L434   | `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` | YES      |
| phase-11-12-guide.md    | L247   | `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` | YES      |
| phase-11-12-guide.md    | L248   | `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` | YES      |

3件の `ObsidianMemo` パスを全て repo 内の相対パスに置換する。

## 4. FR/NFR 対応

| 要件   | 本設計での対応                                                                     |
| ------ | ---------------------------------------------------------------------------------- |
| FR-003 | `spec-update-workflow.md` の Step 1-G.3 を `.js` に統一し、Before/After 差分を定義 |
| FR-004 | `phase-11-12-guide.md` の3箇所を repo 内パスに統一し、重複回避方針を定義           |
| FR-005 | `spec-update-workflow.md` に Warning 3段階分類テーブルと判定フローを新規追加       |
| FR-006 | 判定基準「Error 0件で合格、Warning は分類に基づき対応」を明文化                    |

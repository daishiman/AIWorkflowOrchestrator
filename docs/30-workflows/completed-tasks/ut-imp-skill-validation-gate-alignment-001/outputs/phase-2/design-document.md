# Phase 2 設計書

## メタ情報

| 項目     | 値                                                                      |
| -------- | ----------------------------------------------------------------------- |
| タスクID | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                              |
| Phase    | 2                                                                       |
| 作成日   | 2026-02-26                                                              |
| 目的     | 検証経路統一方針と Warning 運用ルールのアーキテクチャ・反映先を設計する |

## 1. 検証経路優先順位テーブル（Task 1）

### 1.1 経路定義

| 経路     | スクリプト                                                                                               | 優先度  | 使用条件                                                             |
| -------- | -------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| primary  | `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-path>`                               | 第1優先 | Node.js ランタイム（v18 以上）が利用可能な環境で使用する             |
| fallback | `python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py <skill-path> --verbose` | 第2優先 | Node.js が利用不可で、Python 3.10 以上が利用可能な環境でのみ使用する |

### 1.2 正規コマンドフォーマット

```bash
# Phase 12 検証: 全3スキルを順次実行
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### 1.3 fallback 使用条件

fallback 経路を使用してよいのは、以下の**全条件**を満たす場合のみ:

1. Node.js ランタイム（`node` コマンド）が利用不可である
2. Python 3.10 以上（`python3` コマンド）がインストールされている
3. PyYAML ライブラリがインストールされている

fallback 使用時の追加ルール:

- Phase 12 成果物の `documentation-changelog.md` に「fallback 経路（quick_validate.py）を使用した」旨を明記する
- fallback は Warning を検出しないため、Warning 運用ルールは適用されない

### 1.4 経路選択フローチャート

```
Phase 12 検証開始
  │
  ├─ Node.js (node) v18以上が利用可能か？
  │   │
  │   ├─ YES → primary 経路を使用
  │   │         └─ 3スキルを順次実行
  │   │             └─ Error 0件 → 合格
  │   │             └─ Error 1件以上 → 不合格（修正後に再実行）
  │   │             └─ Warning → 3段階分類に基づき対応
  │   │
  │   └─ NO → fallback 条件チェック
  │       │
  │       ├─ python3 (v3.10以上) + PyYAML が利用可能か？
  │       │   │
  │       │   ├─ YES → fallback 経路を使用
  │       │   │         └─ 成果物に「fallback 使用」を明記
  │       │   │         └─ Fail 0件 → 合格
  │       │   │         └─ Fail 1件以上 → 不合格（修正後に再実行）
  │       │   │
  │       │   └─ NO → 検証スキップ
  │       │             └─ 成果物に「検証環境なし: Node.js/Python3 未検出」と記録
  │       │             └─ Phase 12 完了条件に「検証スキップ」を明記
```

詳細: `outputs/phase-2/validation-policy-design.md`

## 2. Warning 3段階分類ルール + 判定フロー（Task 2）

### 2.1 分類定義

| 分類   | 定義                                                                                    | 対応方針                                                                 | 具体例                                                                                                     |
| ------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高く、スキルの動作・構造に影響しない         | 件数を記録し、前回比で増加傾向がないことを確認する                       | `aiworkflow-requirements` の `references/` 配下 149件の参照リンク切れ（Progressive Disclosure 設計に起因） |
| 要監視 | 新規に発生した Warning で、放置した場合にスキル品質低下の兆候となる可能性がある         | 次回の Phase 12 実行までに対応方針（修正/許容昇格/未タスク化）を決定する | 新規追加した reference ファイルが SKILL.md からリンクされていない（1-3件程度）                             |
| 要対応 | スキルの動作・構造の正確性に直接影響する Warning で、放置するとオペレーションミスを招く | 本 Phase 内（Phase 12 完了前）で修正する。修正不可の場合は未タスク化する | agents/\*.md の必須セクション不足、name フィールドとディレクトリ名の不一致                                 |

### 2.2 判定フロー

```
Warning 発生
  │
  ├─ [Q1] 当該 Warning は Phase 5 以前から存在する既知の Warning か？
  │   │    判定方法: 前回の Phase 12 検証記録（documentation-changelog.md）
  │   │    に同一パターンの Warning が記録されているか確認する。
  │   │    初回実行時（前回記録なし）は全て NO として扱う。
  │   │
  │   ├─ YES → [Q2] 前回比で件数が増加しているか？
  │   │   │
  │   │   ├─ YES → 「要監視」に分類
  │   │   │         理由: 既知 Warning だが件数増加は品質低下の兆候
  │   │   │
  │   │   └─ NO → 「許容」に分類
  │   │             理由: 既知かつ件数横ばいのため運用上無害
  │   │
  │   └─ NO → [Q3] スキルの動作・構造の正確性に直接影響するか？
  │       │    判定基準:
  │       │    - name フィールドとディレクトリ名の不一致 → YES
  │       │    - agents/*.md の必須セクション不足 → YES
  │       │    - SKILL.md の 500行制限超過 → YES
  │       │    - 不要な補助ドキュメント（README.md等）の存在 → YES
  │       │    - references/ 内ファイルの SKILL.md リンク切れ → NO
  │       │    - description の Anchors/Trigger 未記載 → NO
  │       │
  │       ├─ YES → 「要対応」に分類
  │       │         アクション: 本 Phase 内で修正する
  │       │
  │       └─ NO → 「要監視」に分類
  │                 アクション: 次回 Phase 12 までに対応方針を決定する
```

### 2.3 `aiworkflow-requirements` 固有の許容条件

`references/` 内のファイルが SKILL.md からリンクされていない場合、以下の条件を**全て**満たせば「許容」と判定する:

1. 該当ファイルが `indexes/resource-map.md` からリンクされている **または** `indexes/topic-map.md` からリンクされている
2. 該当ファイルの内容が `aiworkflow-requirements` スキルの目的（システム仕様管理）に関連する

許容条件に該当しないファイル（いずれのインデックスからもリンクされていない）は「要監視」に分類する。

### 2.4 Warning 運用ルールの記録フォーマット

| 項目         | 記載内容                                                                |
| ------------ | ----------------------------------------------------------------------- |
| 検証日       | 検証実行日（YYYY-MM-DD 形式）                                           |
| 使用経路     | primary（quick_validate.js）/ fallback（quick_validate.py）             |
| 対象スキル   | 検証対象のスキルパス                                                    |
| Error 件数   | Error の件数。0件でなければ不合格                                       |
| Warning 合計 | 全 Warning の合計件数                                                   |
| 許容         | 件数と代表的なパターン（例: 「参照リンク切れ 149件」）                  |
| 要監視       | 件数と各 Warning の詳細（ファイル名・Warning 内容を列挙）               |
| 要対応       | 件数と各 Warning の詳細 + Phase 内の対応予定（修正/未タスク化）         |
| 前回比       | 前回検証結果との差分（許容: +N/-N件、要監視: +N/-N件、要対応: +N/-N件） |

詳細: `outputs/phase-2/warning-operation-rules.md`

## 3. `spec-update-workflow.md` 変更設計（Task 3 -- Before/After 差分）

### 3.1 変更対象箇所

| #   | 変更箇所                         | 行番号（現状） | 変更種別 |
| --- | -------------------------------- | -------------- | -------- |
| 1   | Step 1-G.3 検証コマンド          | L369-377       | 置換     |
| 2   | 必須更新ファイル欄の検証コマンド | L434           | 置換     |
| 3   | Warning 運用ルール（新規追加）   | L378付近       | 追加     |

### 3.2 変更 #1: Step 1-G.3（Before/After）

**Before:**

```bash
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements --verbose
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator --verbose
```

**After:**

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

### 3.3 変更 #2: 必須更新ファイル欄（Before/After）

**Before:**

```markdown
- [ ] `node /Users/dm/dev/dev/ObsidianMemo/.claude/skills/skill-creator/scripts/quick_validate.js` で更新したSKILL 2件が `Skill is valid!` であることを確認した
```

**After:**

```markdown
- [ ] `node .claude/skills/skill-creator/scripts/quick_validate.js` で3スキル全てが Error 0件であることを確認した
```

### 3.4 変更 #3: Warning 運用ルール新規追加

Step 1-G.3 直後に「3.1 検証結果の判定基準」サブセクションを挿入する。内容:

- 合格基準: Error 0件で合格
- Warning 3段階分類テーブル（許容/要監視/要対応）
- 判定フロー（2段階の二値分岐）
- `aiworkflow-requirements` 固有の許容条件（Progressive Disclosure 設計に起因する緩和ルール）
- fallback 経路の使用条件（Node.js 利用不可の場合のみ）

詳細: `outputs/phase-2/phase12-integration-design.md`

## 4. `phase-11-12-guide.md` 変更設計（Task 4 -- 重複回避方針）

### 4.1 変更対象箇所

| #   | 変更箇所                           | 行番号（現状） | 変更種別 |
| --- | ---------------------------------- | -------------- | -------- |
| 1   | Phase 12 完了条件のコマンドパス    | L182           | 置換     |
| 2   | Phase 12 自動化コマンドの .js パス | L247-248       | 置換     |
| 3   | 検証結果の読み方ガイド（新規追加） | L249付近       | 追加     |

### 4.2 重複回避方針

| 記載対象                     | `spec-update-workflow.md` | `phase-11-12-guide.md`                                        |
| ---------------------------- | ------------------------- | ------------------------------------------------------------- |
| 検証コマンド全文             | 記載する（正本）          | 記載する（実行可能なコピー）                                  |
| Warning 3段階分類テーブル    | 記載する（正本）          | 記載しない（「spec-update-workflow.md Step 1-G.3.1 を参照」） |
| 判定フロー                   | 記載する（正本）          | 記載しない（同上）                                            |
| 許容条件の詳細               | 記載する（正本）          | 記載しない（同上）                                            |
| 検証結果の読み方（識別記号） | 記載しない                | 記載する（`✓`/`⚠`/`✗` の説明）                                |
| fallback 経路の使用条件      | 記載する（正本）          | 記載しない（同上）                                            |

詳細: `outputs/phase-2/phase12-integration-design.md`

## 5. `quick_validate.js` 改善設計（Task 5 -- 推奨案の根拠）

### 5.1 3案比較

| 改善案               | 実装コスト | 適用範囲   | 既存互換           | 推奨 |
| -------------------- | ---------- | ---------- | ------------------ | ---- |
| A: 要約表示          | 低         | 全スキル   | 表示形式のみ変更   | YES  |
| B: `--strict` モード | 中         | 全スキル   | デフォルト動作変更 | NO   |
| C: 除外設定ファイル  | 高         | 個別設定要 | 維持               | NO   |

### 5.2 推奨: 案 A（要約表示）

**選定根拠:**

- 実装コストが最も低い（出力フォーマットの変更のみ）
- 全スキルに統一適用可能で、スキルごとの設定不要
- Warning の内容は保持するため後方互換性を維持
- サマリの件数増加で新規 Warning の検出が可能

**スコープ判定:** 本タスクのスコープ外（`quick_validate.js` のコード変更は行わない）。必要に応じて未タスク化する。

詳細: `outputs/phase-2/quick-validate-improvement.md`

## 6. FR / NFR トレーサビリティマトリクス（Task 6）

### 6.1 設計項目 vs FR/NFR

| 設計項目                       | FR-001 | FR-002 | FR-003 | FR-004 | FR-005 | FR-006 | FR-007 | NFR-001 | NFR-002 | NFR-003 | NFR-004 | NFR-005 |
| ------------------------------ | ------ | ------ | ------ | ------ | ------ | ------ | ------ | ------- | ------- | ------- | ------- | ------- |
| 検証経路 primary/fallback 定義 | x      | x      |        |        |        |        |        | x       |         |         |         | x       |
| 正規コマンドフォーマット       | x      |        | x      | x      |        |        |        | x       |         | x       |         |         |
| Warning 3段階分類ルール        |        |        |        |        | x      | x      | x      |         | x       |         |         | x       |
| spec-update-workflow 変更設計  |        |        | x      |        | x      | x      |        |         |         |         |         |         |
| phase-11-12-guide 変更設計     |        |        |        | x      |        |        |        |         |         |         |         |         |
| quick_validate.js 改善案       |        |        |        |        |        |        | x      |         | x       | x       | x       |         |

### 6.2 カバレッジ確認

| 要件    | カバーする設計項目                                       | カバー状態 |
| ------- | -------------------------------------------------------- | ---------- |
| FR-001  | 検証経路 primary/fallback 定義、正規コマンドフォーマット | カバー済み |
| FR-002  | 検証経路 primary/fallback 定義                           | カバー済み |
| FR-003  | 正規コマンドフォーマット、spec-update-workflow 変更設計  | カバー済み |
| FR-004  | 正規コマンドフォーマット、phase-11-12-guide 変更設計     | カバー済み |
| FR-005  | Warning 3段階分類ルール、spec-update-workflow 変更設計   | カバー済み |
| FR-006  | Warning 3段階分類ルール、spec-update-workflow 変更設計   | カバー済み |
| FR-007  | Warning 3段階分類ルール、quick_validate.js 改善案        | カバー済み |
| NFR-001 | 検証経路 primary/fallback 定義、正規コマンドフォーマット | カバー済み |
| NFR-002 | Warning 3段階分類ルール、quick_validate.js 改善案        | カバー済み |
| NFR-003 | 正規コマンドフォーマット、quick_validate.js 改善案       | カバー済み |
| NFR-004 | quick_validate.js 改善案                                 | カバー済み |
| NFR-005 | 検証経路 primary/fallback 定義、Warning 3段階分類ルール  | カバー済み |

**結果: 全 FR（FR-001〜007）および全 NFR（NFR-001〜005）が1つ以上の設計項目でカバーされている。カバレッジ 100%。**

## 7. 設計の整合性確認

### 7.1 Phase 1 要件との整合

| 要件    | Phase 1 定義                               | Phase 2 設計での反映                                       | 整合状態 |
| ------- | ------------------------------------------ | ---------------------------------------------------------- | -------- |
| FR-001  | `.js` を正規経路に指定                     | primary 経路として定義                                     | 整合     |
| FR-002  | `.py` を fallback に限定                   | 使用条件を3条件で限定                                      | 整合     |
| FR-003  | `spec-update-workflow.md` を `.js` に統一  | Before/After 差分を2件定義                                 | 整合     |
| FR-004  | `phase-11-12-guide.md` を `.js` に統一     | 3箇所の変更設計を定義                                      | 整合     |
| FR-005  | Warning 3段階分類ルールを定義              | 分類テーブル + 判定フロー + 排他性・網羅性保証             | 整合     |
| FR-006  | 判定基準を明文化                           | 「Error 0件で合格」を明文化、Warning は分類に基づき対応    | 整合     |
| FR-007  | `aiworkflow-requirements` の許容条件を定義 | Progressive Disclosure 設計に基づく許容条件を2条件で定義   | 整合     |
| NFR-001 | 同一入力で同一結果                         | コマンドフォーマットを固定し、判定ロジックは変更しない設計 | 整合     |
| NFR-002 | Error/Warning/Pass が識別可能              | 記録フォーマットと `✓`/`⚠`/`✗` の識別記号を設計            | 整合     |
| NFR-003 | ルール追加が1ファイルで完結                | `quick_validate.js` の1ファイル集約を維持                  | 整合     |
| NFR-004 | 30秒以内に完了                             | 出力フォーマット変更のみで実行速度に影響なし               | 整合     |
| NFR-005 | Error 判定を変更しない                     | Warning の運用ルール追加のみ、Error 判定ロジックは不変     | 整合     |

### 7.2 スコープ遵守

| スコープ外項目                       | 本設計での対応                                        | 逸脱 |
| ------------------------------------ | ----------------------------------------------------- | ---- |
| 全 Warning の即時ゼロ化              | 3段階分類で段階的に対応する設計。即時ゼロ化は求めない | なし |
| `references/*.md` の全面再編         | 既存構造を維持し、許容条件で運用対応                  | なし |
| `quick_validate.js` のコード変更     | 改善案の定義のみ。コード変更は未タスク化              | なし |
| `quick_validate.py` の機能追加・修正 | fallback として位置づけのみ。変更なし                 | なし |

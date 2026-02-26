# 実装ガイド

## メタ情報

| 項目      | 内容                                                                         |
| --------- | ---------------------------------------------------------------------------- |
| タスクID  | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001                                   |
| タスク名  | skill-creator検証ゲート整合化（quick_validate実行経路統一 + 警告ノイズ制御） |
| 作成日    | 2026-02-26                                                                   |
| 対象      | `quick_validate.js` 実行経路統一 + Warning 運用整備                          |
| 参照Phase | Phase 5（実装）、Phase 10（最終レビュー）、Phase 11（手動テスト）            |

---

## Part 1: 初学者・中学生向け説明

### テストの採点基準が先生によって違う問題を、共通ルールブックで解決する

学校のテストで、こんな経験はないでしょうか。

同じ答案用紙を出したのに、A先生が採点すると80点、B先生が採点すると75点になる。「あれ、同じ答えなのになぜ点数が違うの？」と思いますよね。

これと全く同じ問題が、このプロジェクトの「スキル検証」でも起きていました。

### 何が起きていたか

このプロジェクトには「スキル」と呼ばれる機能の部品があり、それぞれが正しい形式で作られているかを自動的にチェックする仕組みがあります。

ところが、チェックの方法が2種類ありました。

| 先生（検証ツール）           | 言語    | 問題点                                        |
| ---------------------------- | ------- | --------------------------------------------- |
| A先生（`quick_validate.py`） | Python  | 2つのスキルしかチェックしない、合格基準が曖昧 |
| B先生（`quick_validate.js`） | Node.js | 3つ全部チェックする、合格基準が明確           |

A先生は「合格！」と言っているのにB先生は「注意点がある」と言う。どちらを信じればいいか分かりません。

### どう解決したか

**共通の採点基準表（ルールブック）を作りました。**

1. **入口を1つにした**: B先生（`quick_validate.js`）を正規の採点者に統一しました。A先生（`.py`版）は、B先生がお休みの日（Node.jsが使えない環境）だけ代理で呼ばれます。

2. **減点と注意の違いを明確にした**:
   - **減点（Error）** = 必ず直さなければならない間違い。1つでもあれば不合格。
   - **注意（Warning）** = 気をつけるべき点。合否には影響しないが、内容によって対応が変わる。

3. **注意（Warning）を3段階に分けた**:

   | 分類       | 日常の例え                                           | 対応                                     |
   | ---------- | ---------------------------------------------------- | ---------------------------------------- |
   | **許容**   | 「靴の色が校則と少し違うけど、昔からOKになっている」 | 記録だけして、増えていないか確認する     |
   | **要監視** | 「新しい髪型が校則に引っかかるかもしれない」         | 次の検査までに対応方針を決める           |
   | **要対応** | 「名札をつけていない。すぐ直す必要がある」           | 今すぐ直す。直せない場合は後日対応に回す |

4. **判断の手順を決めた**: 注意が出たときに、3つの質問に順番に答えるだけで、どの段階に分類すればいいかが自動的に決まるようにしました。
   - Q1: 前回も同じ注意が出ていたか？
   - Q2: 前回より数が増えているか？
   - Q3: スキルの動作に直接影響するか？

### この改善でできるようになったこと

1. **誰がいつチェックしても同じ結果になる**: 検証コマンドと合格基準が統一されたため、実行者や環境によるブレがなくなりました。
2. **本当に重要な問題にすぐ気付ける**: Error（減点）を最優先で確認でき、Warning（注意）は分類ごとに優先順位が付くため、179件の注意があっても「全部許容」と即座に判断できます。
3. **毎回同じ手順で確認できる**: Phase 12（ドキュメント更新フェーズ）でのチェック手順が標準化されたため、手順書をそのままなぞるだけで完了します。

---

## Part 2: 技術者向け実装詳細

### 1. 検証コマンド一覧

本タスクで整備した検証コマンドは以下の3種類です。

| コマンド                                                                                                   | 入力                        | 出力                           | 判定ロジック                             |
| ---------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------ | ---------------------------------------- |
| `node .claude/skills/skill-creator/scripts/quick_validate.js <skill-dir>`                                  | スキルディレクトリパス      | `✓/⚠/✗` + 集計サマリ           | Error 件数が 0 なら成功（exit 0）        |
| `node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js`                        | `task-workflow.md` 内リンク | existing / missing 件数        | missing = 0 で成功                       |
| `node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js --json --diff-from HEAD` | git 差分                    | `current / baseline` 分離 JSON | `currentViolations.total` で今回合否判定 |

#### 正規経路コマンド（primary）

```bash
# 全3スキルを検証（Phase 12 Step 1-G.3 で必須実行）
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

前提条件: Node.js v18 以上、カレントディレクトリがプロジェクトルート

#### 補助経路コマンド（fallback）

以下の**全3条件**を満たす場合のみ使用可:

1. Node.js ランタイム（v18 以上）が利用不可
2. Python 3.10 以上がインストールされている
3. PyYAML ライブラリがインストールされている

```bash
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/aiworkflow-requirements
python3 /Users/dm/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .claude/skills/task-specification-creator
```

補助経路使用時は `documentation-changelog.md` に「補助経路を使用した」旨を明記する。

### 2. Error / Warning / Info の判定基準

#### 合格基準

**Error 0 件で合格**（終了コード 0）。Warning は合否に影響しない。

#### Error 項目（修正必須: 10項目）

| #   | 検証項目                     | 説明                                                                  |
| --- | ---------------------------- | --------------------------------------------------------------------- |
| 1   | SKILL.md の存在              | スキルディレクトリ直下に SKILL.md が存在すること                      |
| 2   | SKILL.md が 500 行以内       | 行数が 500 行を超えていないこと                                       |
| 3   | YAML frontmatter の有効性    | `---` で囲まれた有効な YAML frontmatter が存在すること                |
| 4   | name フィールドの存在        | frontmatter に `name` フィールドが定義されていること                  |
| 5   | name が 64 文字以内          | name フィールドの文字数が 64 以内であること                           |
| 6   | name がハイフンケース        | `/^[a-z0-9]+(-[a-z0-9]+)*$/` に一致すること                           |
| 7   | description フィールドの存在 | frontmatter に `description` フィールドが定義されていること           |
| 8   | description が 1024 文字以内 | description フィールドの文字数が 1024 以内であること                  |
| 9   | description に角括弧なし     | `<` または `>` が含まれていないこと                                   |
| 10  | 不要な補助ドキュメントの不在 | README.md, INSTALLATION_GUIDE.md, QUICK_REFERENCE.md が存在しないこと |

#### Warning 項目（合否に影響しない: 5項目）

| ID  | 検証項目                               | 説明                                                              |
| --- | -------------------------------------- | ----------------------------------------------------------------- |
| W1  | name とディレクトリ名の一致            | name フィールドの値がスキルディレクトリ名と一致すること           |
| W2  | description に Anchors が含まれる      | `Anchors:` または `•` が含まれること                              |
| W3  | description に Trigger が含まれる      | `Trigger:` または `use when` が含まれること                       |
| W4  | references/ ファイルの SKILL.md リンク | `references/` 配下の各 .md が SKILL.md 内からリンクされていること |
| W5  | agents/\*.md の必須セクション          | タスク仕様書テンプレートの必須5セクションが存在すること           |

#### 出力プレフィックス

| 記号 | 意味    | 説明                                         |
| ---- | ------- | -------------------------------------------- |
| `✓`  | Pass    | 検証項目をパス（`--verbose` 指定時のみ表示） |
| `⚠`  | Warning | 注意が必要だが合否に影響しない               |
| `✗`  | Error   | 修正必須。1件でもあれば検証失敗              |

#### 終了コード

| コード | 定数名              | 意味                                 |
| ------ | ------------------- | ------------------------------------ |
| 0      | `SUCCESS`           | 成功（Warning は許容）               |
| 1      | `ERROR`             | 一般的なエラー（予期しない例外）     |
| 2      | `ARGS_ERROR`        | 引数エラー（スキルパス未指定）       |
| 3      | `FILE_NOT_FOUND`    | ファイル不在（指定パスが存在しない） |
| 4      | `VALIDATION_FAILED` | 検証失敗（Error が 1件以上）         |

### 3. Warning 3段階分類ロジック

#### 分類定義

| 分類   | 定義                                                                   | 対応方針                                                       |
| ------ | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| 許容   | 運用上避けられない Warning で、修正コストが高く機能影響がない          | 件数を記録し、前回比で増加傾向がないことを確認する             |
| 要監視 | 新規に発生した Warning で、放置すると品質低下の兆候となる              | 次回 Phase 12 までに対応方針（修正/許容昇格/未タスク化）を決定 |
| 要対応 | 機能やスキル構造の正確性に直接影響する Warning で、本Phase内で修正必要 | 本 Phase 内で修正。修正不可の場合は未タスク化                  |

#### 判定フロー

```
Warning 発生
  |
  +-- [Q1] 前回の Phase 12 検証記録に同一パターンの Warning が存在するか？
  |   |    判定方法: documentation-changelog.md の検証記録を確認
  |   |    ※ 初回実行時（前回記録なし）は全て NO として扱う
  |   |
  |   +-- YES --> [Q2] 前回比で件数が増加しているか？
  |   |   |
  |   |   +-- YES --> 「要監視」
  |   |   +-- NO  --> 「許容」
  |   |
  |   +-- NO --> [Q3] スキルの動作・構造の正確性に直接影響するか？
  |       |
  |       |  判定基準（YES となるもの）:
  |       |  - name とディレクトリ名の不一致
  |       |  - agents/*.md の必須セクション不足
  |       |  - SKILL.md の 500行制限超過
  |       |  - README.md 等の不要補助ドキュメントの存在
  |       |
  |       |  判定基準（NO となるもの）:
  |       |  - references/ 内ファイルの SKILL.md リンク切れ
  |       |  - description の Anchors/Trigger 未記載
  |       |
  |       +-- YES --> 「要対応」
  |       +-- NO  --> 「要監視」
```

#### 大規模 references スキルの許容条件

`references/` 配下のファイル数が 20 件以上のスキルで、ファイルが SKILL.md からリンクされていない場合、以下の**全条件**を満たせば「許容」と判定する:

1. 該当ファイルが `indexes/resource-map.md` または `indexes/topic-map.md` からリンクされている
2. 該当ファイルの内容がスキルの目的に関連する

許容条件に該当しないファイル（いずれのインデックスからもリンクされていない）は「要監視」に分類する。

### 4. .py と .js の使い分けルール（実行経路統一）

| 項目        | 正規経路（primary）              | 補助経路（fallback）                          |
| ----------- | -------------------------------- | --------------------------------------------- |
| ツール      | `quick_validate.js`              | `quick_validate.py`                           |
| ランタイム  | Node.js v18 以上                 | Python 3.10 以上 + PyYAML                     |
| 検証対象    | 3スキル全て                      | 2スキル（skill-creator 自身は対象外）         |
| パス形式    | 相対パス（`.claude/skills/...`） | 絶対パス（外部パスの検証ツール）              |
| `--verbose` | サポートあり                     | サポートなし（Phase 3 M-2 対応）              |
| 使用条件    | 常に優先使用                     | Node.js 利用不可の場合のみ                    |
| 記録義務    | なし                             | `documentation-changelog.md` に使用理由を明記 |

**正本**: `spec-update-workflow.md` Step 1-G.3
**参照**: `phase-11-12-guide.md` Phase 12 完了条件

### 5. Phase 12 への統合方法

Phase 12 Task 2（システムドキュメント更新）の Step 1-G で以下の順序で実行する。

#### 実行順序

1. **Step 1-G.1**: 未タスク参照リンク検証（`verify-unassigned-links.js`）
2. **Step 1-G.2**: 索引再生成（`generate-index.js`）
3. **Step 1-G.3**: SKILL 検証（`quick_validate.js` x 3スキル）-- **本タスクの対象**
4. **Step 1-G.4**: Phase 仕様書参照と outputs 実体の整合確認

#### Step 1-G.3 の具体的手順

1. 3スキル全てで `quick_validate.js` を実行
2. Error 0 件であることを確認（1件でもあれば修正して再実行）
3. Warning を3段階分類フローで判定
4. 分類結果を `documentation-changelog.md` に記録
5. 「要対応」分類の Warning は本 Phase 内で修正、修正不可の場合は未タスク化

#### 結果の記録フォーマット

```markdown
### SKILL 検証結果

| 対象スキル                 | Error | Warning | 結果 |
| -------------------------- | ----: | ------: | ---- |
| skill-creator              |     0 |      27 | PASS |
| task-specification-creator |     0 |       1 | PASS |
| aiworkflow-requirements    |     0 |     151 | PASS |

Warning 分類: 許容 179件 / 要監視 0件 / 要対応 0件
```

### 6. 運用ルール変更時の更新手順

Warning 分類ルールや検証コマンドの変更が必要になった場合、以下のファイルを更新する。

| #   | ファイル                                                                       | 更新内容                                           | 正本/参照 |
| --- | ------------------------------------------------------------------------------ | -------------------------------------------------- | --------- |
| 1   | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1-G.3 の検証コマンド、Step 1-G.3.1 の判定基準 | 正本      |
| 2   | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`    | Phase 12 完了条件の検証コマンド参照                | 参照      |
| 3   | `.claude/skills/task-specification-creator/references/phase-templates.md`      | Phase 12 テンプレートの SKILL 検証参照             | 参照      |
| 4   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 残課題テーブル（未タスクの追加/完了更新）          | -         |
| 5   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`         | 新たな教訓の追記                                   | -         |

更新順序: 正本（1）を先に更新し、参照（2, 3）が正本を参照する形で整合を維持する。

### 7. 型定義（運用時に扱うデータ構造）

```ts
/** quick_validate.js の検証結果サマリ */
export type ValidateSummary = {
  passed: number;
  errors: number;
  warnings: number;
  exitCode: number; // 0: SUCCESS, 1: ERROR, 2: ARGS_ERROR, 3: FILE_NOT_FOUND, 4: VALIDATION_FAILED
};

/** Warning の3段階分類 */
export type WarningClass = "許容" | "要監視" | "要対応";

/** audit-unassigned-tasks.js の出力構造 */
export type UnassignedAudit = {
  currentViolations: { total: number };
  baselineViolations: { total: number };
  scope: {
    mode: "full" | "scoped";
    diffFrom: string | null;
  };
};
```

### 8. エラーハンドリングとエッジケース

| ケース                    | 期待挙動                            | Phase 11 実測結果                     |
| ------------------------- | ----------------------------------- | ------------------------------------- |
| 不正スキルパス指定        | 明示エラーメッセージ + 終了コード 3 | `Error: パスが存在しません:` + exit 3 |
| 全体監査で既存負債あり    | baseline 違反として記録             | exit 1（今回差分ではない）            |
| 差分監査で差分なし        | current = 0                         | exit 0                                |
| 同一入力2回実行           | 差分 0 で再現性維持                 | 3スキル全てで diff 0 行（完全一致）   |
| BOM付きUTF-8の SKILL.md   | frontmatter 検出失敗（既知の制限）  | Error として検出。未タスク化済み      |
| name/description が空文字 | ランタイムエラー発生（既知の制限）  | TypeError 発生。未タスク化済み        |

### 9. 既知の制限事項（未タスク管理中）

| 未タスクID                                  | 概要                                            | Phase 10 重要度 |
| ------------------------------------------- | ----------------------------------------------- | --------------- |
| UT-IMP-QUICK-VALIDATE-BOM-UTF8-001          | BOM付きUTF-8で frontmatter 検出が失敗する       | MINOR（低）     |
| UT-IMP-QUICK-VALIDATE-EMPTY-FIELD-GUARD-001 | 空フィールドで `toLowerCase()` ランタイムエラー | MINOR（中）     |

詳細: `spec-update-workflow.md` Step 1-G.3 末尾の「既知の制限事項（未タスク）」セクション

### 10. Phase 11 実データ（引用）

Phase 11 手動テスト結果（2026-02-26 実施）から引用。

#### quick_validate.js 実行結果

| 対象スキル                 | 項目数 | Error | Warning | 結果     | 終了コード |
| -------------------------- | -----: | ----: | ------: | -------- | :--------: |
| skill-creator              |     45 |     0 |      27 | 検証成功 |     0      |
| task-specification-creator |     18 |     0 |       1 | 検証成功 |     0      |
| aiworkflow-requirements    |     10 |     0 |     151 | 検証成功 |     0      |

#### Warning 分類結果

| 分類   | 件数 | 対応方針               |
| ------ | ---: | ---------------------- |
| 許容   |  179 | 件数記録のみ、対応不要 |
| 要監視 |    0 | -                      |
| 要対応 |    0 | -                      |

#### 補助スクリプト結果

| スクリプト                 | 結果 | 詳細                                      |
| -------------------------- | ---- | ----------------------------------------- |
| verify-unassigned-links.js | PASS | total: 93, existing: 93, missing: 0       |
| audit-unassigned-tasks.js  | 記録 | current: 71件, baseline: 0件, 誤配置: 0件 |

#### Warning 内訳

- **task-specification-creator（1件）**: `references/changelog-archive.md` が SKILL.md からリンクされていない → 許容（アーカイブファイル）
- **aiworkflow-requirements（151件）**: references/\*.md の SKILL.md リンク切れ 149件 + Anchors/Trigger 未記載 2件 → 全て許容（大規模 references スキルの既知パターン）
- **skill-creator（27件）**: references/\*.md の SKILL.md リンク切れ 27件 → 全て許容（大規模 references スキルの既知パターン）

#### その他の手動テスト

- 不正パス実行: exit 3（想定どおり）
- 判定再現性: 3スキル全てで diff 0（完全一致）
- 手順書ウォークスルー: 全コマンド正常終了、曖昧表現なし

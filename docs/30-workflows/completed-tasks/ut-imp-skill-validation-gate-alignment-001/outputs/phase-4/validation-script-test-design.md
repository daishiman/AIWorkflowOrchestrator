# 検証スクリプトテスト設計

## メタ情報

| 項目                 | 値                                               |
| -------------------- | ------------------------------------------------ |
| タスクID             | UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001       |
| Phase                | 4（テスト作成 -- TDD Red）                       |
| 作成日               | 2026-02-26                                       |
| テストフレームワーク | Vitest 2.x (Node.js ESM)                         |
| 対象                 | quick_validate.js 検証スクリプト固有のテスト設計 |
| テスト総数           | 45                                               |

## 1. テスト対象: validateSkill() 関数

`quick_validate.js` の `validateSkill()` 関数は以下の8検証項目を順次実行する:

| 項目# | 検証内容                                           | 判定          | 早期終了 |
| ----- | -------------------------------------------------- | ------------- | -------- |
| 1     | SKILL.md の存在確認                                | Error         | YES      |
| 2     | 行数制限（500行以内）                              | Error         | NO       |
| 3     | YAML frontmatter の有効性                          | Error         | YES      |
| 4     | name フィールド（ハイフンケース、最大64文字）      | Error/Warning | NO       |
| 5     | description フィールド（1024文字以内、角括弧禁止） | Error         | NO       |
| 6     | description 内の Anchors/Trigger 存在確認          | Warning       | NO       |
| 7     | 不要な補助ドキュメント除外確認                     | Error         | NO       |
| 8     | references/ ファイルの SKILL.md リンク確認         | Warning       | NO       |

### 1.1 早期終了パターン

以下の検証項目で Error が発生すると、後続の検証をスキップして即座に結果を返す:

- 項目1（SKILL.md 不在）: ファイルを読み込めないため後続不可
- 項目3（frontmatter なし）: name/description の検証に frontmatter が必要

### 1.2 Error と Warning の判定基準

| 判定    | 条件                                                                                      |
| ------- | ----------------------------------------------------------------------------------------- |
| Error   | SKILL.md 不在、500行超過、frontmatter なし、name 不正、description 不正、禁止ファイル存在 |
| Warning | name/ディレクトリ名不一致、Anchors/Trigger 未記載、references 未リンク                    |
| Pass    | 上記のいずれにも該当しない検証項目                                                        |

### 1.3 終了コード

| コード | 定数名            | 意味                         |
| ------ | ----------------- | ---------------------------- |
| 0      | SUCCESS           | 検証成功（Error 0件）        |
| 1      | ERROR             | 一般エラー                   |
| 2      | ARGS_ERROR        | 引数不正（スキルパス未指定） |
| 3      | FILE_NOT_FOUND    | 指定パスが存在しない         |
| 4      | VALIDATION_FAILED | 検証失敗（Error 1件以上）    |

## 2. テスト実行方式

### 2.1 execSync によるプロセス実行

テストは `quick_validate.js` を Node.js の子プロセスとして実行する。直接の関数インポートではなく、CLI インターフェース経由でテストする理由:

1. `quick_validate.js` は `process.exit()` を使用するため、直接インポートするとテストプロセスが終了する
2. CLI 経由のテストにより、実際の運用条件（コマンドライン実行）と同一の環境で検証できる
3. stdout/stderr/exitCode の3チャネル全てをテスト対象にできる

### 2.2 出力解析パターン

```
結果: ✓ 検証成功 (9項目パス, 0エラー, 0警告)
       ^^^^^^^^^   ^^^^^^^   ^^^^^^   ^^^^^^
       成功/失敗    Pass数    Error数  Warning数
```

以下の正規表現で各数値を抽出:

- Error 件数: `/(\d+)エラー/`
- Warning 件数: `/(\d+)警告/`
- Pass 件数: `/(\d+)項目パス/`

### 2.3 テストヘルパー関数

| 関数                             | 役割                                                                        |
| -------------------------------- | --------------------------------------------------------------------------- |
| `runValidate(fixtureName, opts)` | 指定フィクスチャに対して `quick_validate.js` を実行                         |
| `runValidateSkill(skillPath)`    | 絶対パス指定でスキルディレクトリを検証（統合テスト用）                      |
| `countErrors(output)`            | 出力から Error 件数を正規表現 `/(\\d+)エラー/` で抽出                       |
| `countWarnings(output)`          | 出力から Warning 件数を正規表現 `/(\\d+)警告/` で抽出                       |
| `countPassed(output)`            | 出力から Pass 件数を正規表現 `/(\\d+)項目パス/` で抽出                      |
| `findProjectRoot()`              | worktree 対応のプロジェクトルート検出（package.json + pnpm-workspace.yaml） |

### 2.4 Vitest テスト構造

```javascript
import { describe, it, expect } from "vitest";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
```

各テストは `describe` ブロックでカテゴリ別にグループ化し、`it` でテストケースを定義する。テスト間で状態を共有しない（P9 対策）。

## 3. フィクスチャ設計の詳細

### 3.1 valid-skill（全検証項目パス）

```
valid-skill/
  SKILL.md          -- name: valid-skill, description に Anchors/Trigger 含む
  references/
    test-ref.md     -- SKILL.md からリンク済み
```

**SKILL.md の内容:**

```yaml
---
name: valid-skill
description: |
  A valid test skill for validation testing.

  Anchors:
  * Test Framework / 適用: テスト / 目的: 検証

  Trigger:
  Use when testing quick_validate.js validation logic.
  test, validation, fixture
---
# valid-skill

This is a valid skill fixture for testing quick_validate.js.

See [test-ref.md](references/test-ref.md) for reference.
```

設計意図: 8検証項目の全てをパスする最小構成のスキルディレクトリ。「正常とは何か」のベースラインを定義する。

### 3.2 no-skill-md（項目1: SKILL.md 不在）

```
no-skill-md/
  .gitkeep          -- ディレクトリは存在するが SKILL.md がない
```

設計意図: SKILL.md 不在の早期終了を検証する。

### 3.3 over-limit（項目2: 501行）

```
over-limit/
  SKILL.md          -- 501行（frontmatter 4行 + コンテンツ 497行）
```

設計意図: 500行制限の上限超過を検証する。boundary-500-lines（ちょうど500行）と対になる。

### 3.4 no-frontmatter（項目3: frontmatter なし）

```
no-frontmatter/
  SKILL.md          -- `---` で囲まれた frontmatter ブロックなし
```

設計意図: frontmatter 不在の早期終了を検証する。

### 3.5 invalid-name（項目4: キャメルケース）

```
invalid-name/
  SKILL.md          -- name: MyInvalidSkill（ハイフンケース違反）
```

設計意図: name の形式バリデーション（ハイフンケース）を検証する。正規表現 `/^[a-z0-9]+(-[a-z0-9]+)*$/` にマッチしない name。

### 3.6 forbidden-files（項目7: README.md 存在）

```
forbidden-files/
  SKILL.md          -- 正常な frontmatter
  README.md         -- 存在してはいけないファイル
```

設計意図: 禁止ファイル（README.md, INSTALLATION_GUIDE.md, QUICK_REFERENCE.md）の検出を検証する。

### 3.7 unlinked-refs（項目8: references 未リンク）

```
unlinked-refs/
  SKILL.md          -- references/unlinked-file.md へのリンクなし
  references/
    unlinked-file.md
```

設計意図: references/ 配下のファイルが SKILL.md からリンクされていない場合の Warning を検証する。

### 3.8 boundary-500-lines（項目2: 境界値）

```
boundary-500-lines/
  SKILL.md          -- ちょうど500行
```

設計意図: 500行制限の境界値（ちょうど500行）がパスすることを検証する。

### 3.9 boundary-64-name（項目4: 境界値）

```
boundary-64-name/
  SKILL.md          -- name: a-valid-skill-name-that-is-exactly-sixty-four-characters-long-ok（64文字）
```

**SKILL.md の内容:**

```yaml
---
name: a-valid-skill-name-that-is-exactly-sixty-four-characters-long-ok
description: |
  A test skill with a name that is exactly 64 characters long.

  Anchors:
  * Test / 適用: 境界値 / 目的: 64文字name境界テスト

  Trigger:
  Use when testing 64 character name boundary.
---
```

設計意図: name 64文字制限の境界値がパスすることを検証する。name がディレクトリ名と異なるため Warning（不一致）は発生する。

### 3.10 boundary-1024-desc（項目5: 境界値）

```
boundary-1024-desc/
  SKILL.md          -- description がちょうど1024文字（単一行、パディングで調整）
```

設計意図: description 1024文字制限の境界値がパスすることを検証する。`parseFrontmatter()` が複数行 YAML の `|` 記法ではなく単一行で description をパースする場合を考慮し、単一行の description としている。

## 4. テストカテゴリと各テストの設計

### 4.1 正常系テスト（TC-N-001 ~ TC-N-014: 14件）

valid-skill フィクスチャに対して、8検証項目の個別パス確認と全体パス確認を行う。

| テストID | 検証項目 | テスト内容                                        | 期待結果                             |
| -------- | -------- | ------------------------------------------------- | ------------------------------------ |
| TC-N-001 | 全体     | 終了コードが 0                                    | exitCode == 0                        |
| TC-N-002 | 全体     | 「検証成功」メッセージの出力                      | stdout に「検証成功」含む            |
| TC-N-003 | 全体     | Error 件数が 0                                    | countErrors == 0                     |
| TC-N-004 | 全体     | Warning 件数が 0                                  | countWarnings == 0                   |
| TC-N-005 | 全体     | Pass 件数が 1 以上                                | countPassed >= 1                     |
| TC-N-006 | 項目1    | SKILL.md 存在確認がパス（verbose）                | 「SKILL.md が存在する」含む          |
| TC-N-007 | 項目2    | 行数制限がパス（verbose）                         | 「500 行以内」含む                   |
| TC-N-008 | 項目3    | YAML frontmatter がパス（verbose）                | 「frontmatter が存在する」含む       |
| TC-N-009 | 項目4    | name フィールドがパス（verbose）                  | 「ハイフンケース」含む               |
| TC-N-010 | 項目5    | description フィールドがパス（verbose）           | 「1024 文字以内」含む                |
| TC-N-011 | 項目6    | Anchors が含まれる（verbose）                     | 「Anchors が含まれている」含む       |
| TC-N-012 | 項目6    | Trigger が含まれる（verbose）                     | 「Trigger が含まれている」含む       |
| TC-N-013 | 項目7    | 不要な補助ドキュメントが存在しない（verbose）     | 「補助ドキュメントが存在しない」含む |
| TC-N-014 | 項目8    | references/ ファイルがリンクされている（verbose） | 「リンクされていません」を含まない   |

### 4.2 異常系テスト（TC-E-001 ~ TC-E-012: 12件）

各検証項目の異常入力に対する Error/Warning 検出を検証する。

| テストID | 検証項目 | フィクスチャ       | テスト内容                                                 | 期待結果                               |
| -------- | -------- | ------------------ | ---------------------------------------------------------- | -------------------------------------- |
| TC-E-001 | 項目1    | no-skill-md        | SKILL.md 不在で Error                                      | exitCode != 0, countErrors >= 1        |
| TC-E-002 | 項目2    | over-limit         | 501行で Error                                              | exitCode != 0, countErrors >= 1        |
| TC-E-003 | 項目3    | no-frontmatter     | frontmatter なしで Error                                   | exitCode != 0, countErrors >= 1        |
| TC-E-004 | 項目4    | boundary-64-name   | 64文字で長さ Error なし（65文字は条件から Error 保証）     | 「64 文字を超えています」を含まない    |
| TC-E-005 | 項目4    | invalid-name       | キャメルケースで Error                                     | exitCode != 0, countErrors >= 1        |
| TC-E-006 | 項目4    | boundary-64-name   | name/ディレクトリ名不一致で Warning                        | countWarnings >= 1, 「一致しません」   |
| TC-E-007 | 項目5    | boundary-1024-desc | 1024文字で長さ Error なし（1025文字は条件から Error 保証） | 「1024 文字を超えています」を含まない  |
| TC-E-008 | 項目5    | valid-skill        | 角括弧なしで Error なし（間接検証）                        | 「角括弧」を含まない                   |
| TC-E-009 | 項目6    | valid-skill        | Anchors ありで Warning なし（間接検証）                    | 「Anchors が含まれていない」を含まない |
| TC-E-010 | 項目6    | valid-skill        | Trigger ありで Warning なし（間接検証）                    | 「Trigger が含まれていない」を含まない |
| TC-E-011 | 項目7    | forbidden-files    | README.md 存在で Error                                     | exitCode != 0, countErrors >= 1        |
| TC-E-012 | 項目8    | unlinked-refs      | references 未リンクで Warning                              | countWarnings >= 1                     |

**TC-E-004, TC-E-007, TC-E-008, TC-E-009, TC-E-010 の設計方針:**

これらのテストは Phase 4 時点では専用のフィクスチャ（65文字name、1025文字description、角括弧description、Anchors なし、Trigger なし）を用意せず、既存フィクスチャでの**間接検証**を行う。具体的には:

- TC-E-004: boundary-64-name（64文字）で長さ Error が出ないことを確認。65文字で Error が出ることは `quick_validate.js` の条件 `name.length > 64` から保証される。
- TC-E-007: boundary-1024-desc（1024文字）で長さ Error が出ないことを確認。1025文字で Error が出ることは `quick_validate.js` の条件 `desc.length > 1024` から保証される。
- TC-E-008: valid-skill（角括弧なし）で角括弧 Error が出ないことを確認。角括弧 Error の直接検証は Phase 6 で専用フィクスチャを追加して実施。
- TC-E-009/010: valid-skill（Anchors/Trigger あり）で Warning が出ないことを確認。直接検証は Phase 6 で専用フィクスチャを追加して実施。

### 4.3 境界値テスト（TC-B-001 ~ TC-B-003: 3件）

制限値ちょうどの入力がパスすることを検証する。

| テストID | 検証項目 | フィクスチャ       | テスト内容                    | 期待結果                              |
| -------- | -------- | ------------------ | ----------------------------- | ------------------------------------- |
| TC-B-001 | 項目2    | boundary-500-lines | 500行で行数制限 Error なし    | 「500 行を超えています」を含まない    |
| TC-B-002 | 項目4    | boundary-64-name   | 64文字で長さ制限 Error なし   | 「64 文字を超えています」を含まない   |
| TC-B-003 | 項目5    | boundary-1024-desc | 1024文字で長さ制限 Error なし | 「1024 文字を超えています」を含まない |

### 4.4 運用フローテスト（TC-OP-001 ~ TC-OP-004: 4件）

Phase 12 テンプレートのコマンド列の実行可能性を検証する。

| テストID  | テスト名                     | 実行内容                                                 | 期待結果                  |
| --------- | ---------------------------- | -------------------------------------------------------- | ------------------------- |
| TC-OP-001 | 正規経路コマンド完走         | スクリプト存在確認 + valid-skill 実行                    | 正常終了（exitCode == 0） |
| TC-OP-002 | 検証結果の解釈一意性         | valid-skill の結果サマリに Error/Warning/Pass が含まれる | 判定が一意に決まる        |
| TC-OP-003 | fallback 経路の動作確認      | `.py` スクリプトの存在を確認し、正規経路の動作を確認     | 正規経路が正常終了        |
| TC-OP-004 | Error / Warning の識別可能性 | Error 出力と Warning 出力を比較                          | severity が一目で識別可能 |

### 4.5 Warning 分類テスト（TC-WC-001 ~ TC-WC-006: 6件）

Error と Warning の分類精度と集計精度を検証する。

| テストID  | 分類カテゴリ      | テスト内容                                  | 期待結果                                 |
| --------- | ----------------- | ------------------------------------------- | ---------------------------------------- |
| TC-WC-001 | Error（即時対応） | SKILL.md 不在 + name 形式不正が Error       | countErrors >= 1（各フィクスチャ）       |
| TC-WC-002 | Warning-要対応    | name/ディレクトリ名不一致が Warning         | countWarnings >= 1, 「一致しません」含む |
| TC-WC-003 | Warning-許容      | references 未リンクが Warning（Error なし） | countWarnings >= 1, countErrors == 0     |
| TC-WC-004 | Warning 不在確認  | Anchors/Trigger を含むスキルで Warning 0件  | countWarnings == 0                       |
| TC-WC-005 | 集計精度          | errors + warnings + passed の集計が正確     | errors + warnings == 0（valid-skill）    |
| TC-WC-006 | クリーン状態      | Warning 0件のスキル（正常状態確認）         | countWarnings == 0, countErrors == 0     |

### 4.6 Warning 新規3段階分類テスト（TC-WC-NEW-001 ~ TC-WC-NEW-002: 2件 -- FAIL期待）

Phase 5 で実装予定の Warning 3段階分類機能のテスト。Phase 4 時点では FAIL が期待される（TDD Red）。

| テストID      | テスト内容                               | 期待出力                                              | Phase 4 での状態 |
| ------------- | ---------------------------------------- | ----------------------------------------------------- | ---------------- |
| TC-WC-NEW-001 | Warning 出力に severity レベルが含まれる | `warning-known\|warning-action\|許容\|要監視\|要対応` | FAIL             |
| TC-WC-NEW-002 | Warning 分類の集計サマリが出力される     | `許容: N件\|要監視: N件\|要対応: N件`                 | FAIL             |

**テストコード:**

```javascript
describe("Warning 3段階分類テスト（Phase 5 実装予定 -- FAIL期待）", () => {
  it("TC-WC-NEW-001: Warning 出力に severity レベルが含まれる", () => {
    const result = runValidate("unlinked-refs");
    const output = result.stdout + result.stderr;
    expect(output).toMatch(/warning-known|warning-action|許容|要監視|要対応/);
  });

  it("TC-WC-NEW-002: Warning 分類の集計サマリが出力される", () => {
    const result = runValidate("unlinked-refs");
    const output = result.stdout + result.stderr;
    expect(output).toMatch(/許容:\s*\d+件|要監視:\s*\d+件|要対応:\s*\d+件/);
  });
});
```

### 4.7 NFR テスト（TS-008, TS-009, TS-010, TS-011: 4件）

非機能要件の検証。

| テストID | NFR     | テスト内容                          | 期待結果                                     |
| -------- | ------- | ----------------------------------- | -------------------------------------------- |
| TS-008   | NFR-001 | 同一入力で同一結果（再現性）        | 2回実行で Error/Warning/Pass/exitCode が一致 |
| TS-009   | NFR-002 | Error/Warning/Pass が一目で識別可能 | verbose 出力に「パス」「Pass」「✓」を含む    |
| TS-010   | NFR-004 | valid-skill の検証が10秒以内に完了  | elapsed < 10000ms                            |
| TS-011   | NFR-005 | 既存 Error パターンの判定結果が不変 | 4種の Error フィクスチャの exitCode != 0     |

## 5. Warning 3段階分類テスト設計

### 5.1 分類テストの方針

Phase 4 のテストでは、以下を検証する:

1. Error 項目が正しく Error として出力されること（Error 分類: TC-WC-001）
2. Warning 項目が正しく Warning として出力されること（Warning 分類の前提: TC-WC-002, TC-WC-003）
3. Error と Warning が混同されないこと（分類の排他性: TC-WC-005, TC-WC-006）
4. **Phase 5 実装予定**: 3段階分類ラベル（許容/要監視/要対応）の出力検証（TC-WC-NEW-001, TC-WC-NEW-002 -- Phase 4 では FAIL）

### 5.2 分類判定フローの検証

判定フローの検証は Phase 5 のドキュメント実装後に、手動でフローに従って分類を実行し、結果が一意に決まることを確認する。Phase 4 では判定フローへの入力（Warning の種別と件数）が正しく出力されることを検証する。

### 5.3 分類テストケース設計

| テストID  | 分類カテゴリ      | 判定条件（入力例）                                         | 期待分類         | テスト方法                           |
| --------- | ----------------- | ---------------------------------------------------------- | ---------------- | ------------------------------------ |
| TC-WC-001 | Error（即時対応） | SKILL.md 不在、name 形式不正                               | `error`          | exitCode != 0, countErrors >= 1      |
| TC-WC-002 | Warning-要対応    | name とディレクトリ名の不一致                              | `warning-action` | countWarnings >= 1, 「一致しません」 |
| TC-WC-003 | Warning-許容      | references/ の未リンクファイル（大規模スキルの既知ノイズ） | `warning-known`  | countWarnings >= 1, countErrors == 0 |
| TC-WC-004 | Warning-許容      | Anchors/Trigger 記載漏れの可能性（代替表現で記載あり）     | `warning-known`  | valid-skill で Warning == 0          |

## 6. 運用フローテスト設計

### 6.1 テスト対象

Phase 12 テンプレートのコマンド列を実行して完走するかを検証する。

### 6.2 Phase 12 検証コマンドの実行手順テスト

Phase 5 実装後に以下のコマンド列が正常に完走することを確認する:

```bash
# 正規経路: 3スキル連続検証
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

## 7. Phase 4 テスト結果の期待値

### 7.1 PASS 期待テスト（43件）

既存の `quick_validate.js` の機能に対するテスト。現行スクリプトで全て PASS する。

- 正常系: TC-N-001 ~ TC-N-014（14件）
- 異常系: TC-E-001 ~ TC-E-012（12件）
- 境界値: TC-B-001 ~ TC-B-003（3件）
- 運用フロー: TC-OP-001 ~ TC-OP-004（4件）
- Warning分類: TC-WC-001 ~ TC-WC-006（6件）
- NFR: TS-008, TS-009, TS-010, TS-011（4件）

### 7.2 FAIL 期待テスト（2件）

Phase 5 で実装予定の Warning 3段階分類機能に対するテスト:

| テストID      | テスト名                                 | FAIL 理由                                    |
| ------------- | ---------------------------------------- | -------------------------------------------- |
| TC-WC-NEW-001 | Warning 出力に severity レベルが含まれる | 現行スクリプトは severity ラベルを出力しない |
| TC-WC-NEW-002 | Warning 分類の集計サマリが出力される     | 現行スクリプトは分類ごとの集計を出力しない   |

## 8. Phase 6 への引き継ぎ事項

Phase 6（テスト拡充）で追加すべきテスト:

1. **統合テスト**: 3スキル全てに対する一括検証テスト（30秒以内完走）
2. **大規模 reference テスト**: `aiworkflow-requirements` レベル（150件以上）の references を持つフィクスチャ
3. **`.js` / `.py` 判定一致テスト**: AC-006 の検証（Error 判定の一致率 100%）
4. **ドキュメント変更検証テスト**: TS-001 ~ TS-007, TS-AC-001 ~ TS-AC-005 の自動検証
5. **専用異常系フィクスチャ追加**: 以下の直接検証フィクスチャを作成し、TC-E-004/007/008/009/010 を間接検証から直接検証に置き換え:
   - 65文字 name フィクスチャ（TC-E-004 の直接検証）
   - 1025文字 description フィクスチャ（TC-E-007 の直接検証）
   - 角括弧（`<script>`）を含む description フィクスチャ（TC-E-008 の直接検証）
   - Anchors 未記載の description フィクスチャ（TC-E-009 の直接検証）
   - Trigger 未記載の description フィクスチャ（TC-E-010 の直接検証）

## 9. テスト実行方法

```bash
# Vitest で実行（推奨）
pnpm vitest run .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js

# verbose モードで実行
pnpm vitest run .claude/skills/skill-creator/scripts/__tests__/quick_validate.test.js --reporter=verbose
```

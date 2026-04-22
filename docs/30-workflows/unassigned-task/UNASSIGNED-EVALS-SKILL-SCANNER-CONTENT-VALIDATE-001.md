# EVALS.json 内容品質の reader 側検証 - タスク仕様書

## メタ情報

```yaml
task_id: UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001
task_name: EVALS.json 内容品質の reader 側検証
status: unassigned
priority: medium
scale: medium
task_type: FEATURE
implementation_mode: "new"
created_date: 2026-04-21
source_phase: UNASSIGNED-EVALS-VALIDATOR-GUARD-001 Phase 12
depends_on:
  - UNASSIGNED-EVALS-VALIDATOR-GUARD-001（完了済み）
parallel: なし
related_tasks:
  - UNASSIGNED-EVALS-VALIDATOR-GUARD-001
  - UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001
spec_path: docs/30-workflows/unassigned-task/UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001.md
```

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001         |
| タスク名     | EVALS.json 内容品質の reader 側検証                         |
| 分類         | 機能追加（品質ガード強化）                                  |
| 対象機能     | skill-fixture-runner / SkillScanner EVALS.json 内容品質検証 |
| 優先度       | **中**                                                      |
| 見積もり規模 | 中規模                                                      |
| ステータス   | 未着手                                                      |
| 発見元       | UNASSIGNED-EVALS-VALIDATOR-GUARD-001 Phase 12 未タスク検出  |
| 発見日       | 2026-04-21                                                  |
| depends_on   | UNASSIGNED-EVALS-VALIDATOR-GUARD-001（完了済み）            |
| 並行可能     | なし（単独タスク）                                          |
| 関連タスク   | UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001             |

---

## P50 チェック（実装前提確認）

| 確認項目                              | 結果 | 対応                                      |
| ------------------------------------- | ---- | ----------------------------------------- |
| current branch に実装が存在するか     | No   | 通常の新規実装 Phase とする               |
| upstream（main等）にマージ済みか      | No   | 未マージとして扱う                        |
| 前提タスク（VALIDATOR-GUARD-001）完了 | Yes  | validate-evals.js L1/L2/L3 実装済みを確認 |

---

## Phase 1: 要件定義

### 1.1 背景と真の論点

`validate-evals.js` は以下の3層検証を実装済みである（UNASSIGNED-EVALS-VALIDATOR-GUARD-001 完了済み）。

| 層  | 検証内容                                                  |
| --- | --------------------------------------------------------- |
| L1  | JSON.parse による構文検証                                 |
| L2  | 必須キー存在確認（camelCase/snake_case 両方言許容モード） |
| L3  | dual root bit-for-bit 一致検証                            |

しかし `evals-schema-spec.md §7.4 残課題` が明記する通り、以下の内容品質は未検証のまま残っている。

- `currentLevel` / `current_level` の値が `1..4` の許容範囲内か
- `metrics.*` の数値フィールドが負数・NaN・Infinity でないか
- `metrics.successRate` / `metrics.success_rate` が `0..1` の範囲内か
- `metrics.lastEvaluated` / `metrics.last_evaluated` が ISO-8601 形式か
- `levelHistory[]` / `levels[]` の配列要素が必須フィールドを持つか
- `qualityInsights.*` の詳細妥当性
- `phaseMetrics.*` / `levelCriteria.*` の構造妥当性

**真の論点**: L1/L2 パスだけでは「読める JSON」にはなるが「意味が正しい JSON」ではない。
reader 側（SkillScanner / select_skill.js）が内容品質に依存する計算を行うとき、
L3 より先の品質問題は consumer 側ではじめて顕在化する。このコスト（エラー診断距離）を短縮することが本タスクの価値である。

### 1.2 タスク分類

- **分類**: NON_VISUAL（UI/UX変更なし）
- **変更対象**: `skill-fixture-runner/scripts/validate-evals.js` への L4 層追加
- **影響範囲**: スキル品質検証パイプライン（CI / close-out 時の replay）

### 1.3 スコープ

#### 含むもの

- `validate-evals.js` への L4 層（内容品質検証）追加
  - `currentLevel` / `current_level` の範囲チェック（1 ≤ x ≤ 4）
  - `metrics.*` 数値フィールドの非負・有限値チェック
  - `metrics.successRate` / `metrics.success_rate` の 0..1 範囲チェック
  - `metrics.lastEvaluated` / `metrics.last_evaluated` の ISO-8601 形式チェック
  - `levelHistory[]` / `levels[]` 要素の必須フィールドチェック
- L4 層の方言許容（camelCase/snake_case 両対応）
- L4 失敗時の警告モードとエラーモードの分岐（`--strict` フラグ）
- L4 用テストケースの追加

#### 含まないもの

- `qualityInsights.*` の詳細妥当性検証（将来タスクとして明示）
- `phaseMetrics.*` / `levelCriteria.*` の構造検証（将来タスク）
- CI 必須チェック化の実装（方針判断が必要、別タスク）
- schema dialect 統一（`UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` で扱う）
- SkillScanner.ts 本体への内容バリデーション統合（`task-skill-scanner-evals-content-validate-001` で扱う）

### 1.4 受入条件一覧

| AC番号 | 条件                                                         | 検証方法                              |
| ------ | ------------------------------------------------------------ | ------------------------------------- |
| AC-1   | L4 検証が `currentLevel` 値を 1..4 の範囲で検証する          | ユニットテスト                        |
| AC-2   | L4 検証が `metrics.successRate` を 0..1 の範囲で検証する     | ユニットテスト                        |
| AC-3   | L4 検証が `metrics.lastEvaluated` を ISO-8601 形式で検証する | ユニットテスト                        |
| AC-4   | L4 検証が数値フィールドの NaN / Infinity / 負数を検出する    | ユニットテスト                        |
| AC-5   | `--strict` フラグなしで L4 失敗は警告（終了コード 0）        | スクリプト実行テスト                  |
| AC-6   | `--strict` フラグ付きで L4 失敗はエラー（終了コード 1）      | スクリプト実行テスト                  |
| AC-7   | camelCase / snake_case 両方言で L4 が正しく動作する          | ユニットテスト                        |
| AC-8   | 既存の L1/L2/L3 テストへの回帰がない                         | `node validate-evals.js --all-skills` |
| AC-9   | 既存 6 スキルの EVALS.json に対して L4 が全件 PASS する      | 実スキルに対する実行テスト            |
| AC-10  | `--json` 出力に `layer: 'L4'` のエラー情報が含まれる         | JSON 出力確認                         |

### 1.5 命名規則

| 既存パターン（参照元）                     | 本タスクで使う名称 |
| ------------------------------------------ | ------------------ |
| `validateL1` / `validateL2` / `validateL3` | `validateL4`       |
| `layer: 'L1'` / `layer: 'L2'`              | `layer: 'L4'`      |
| `DIALECT_PAIRS`                            | 同一定数を再利用   |

---

## Phase 2: 設計

### 2.1 L4 検証の構造設計

```
validate-evals.js
  └─ validateL4(parsed, dialect)
       ├─ checkLevelRange(parsed, dialect)        ← currentLevel 1..4
       ├─ checkMetricsNumbers(parsed, dialect)    ← 非負・有限値
       ├─ checkSuccessRate(parsed, dialect)       ← 0..1
       ├─ checkLastEvaluatedFormat(parsed, dialect) ← ISO-8601
       └─ checkLevelHistoryItems(parsed, dialect) ← 配列要素の必須キー
```

### 2.2 方言ルーティング方針

L2 で確定した方言（camelCase or snake_case）を L4 に引き継ぐ。
方言が未確定（L2 エラー）の場合は L4 をスキップする。

```
validateL1 → validateL2(方言確定) → validateL3 → validateL4(方言を受け取り実行)
```

### 2.3 警告/エラーモード分岐

| モード | 条件            | 終了コード | JSON 出力             |
| ------ | --------------- | ---------- | --------------------- |
| 警告   | `--strict` なし | 0          | `warnings` 配列に追加 |
| エラー | `--strict` あり | 1          | `errors` 配列に追加   |

既存の L1/L2/L3 は常にエラーモード。L4 のみ `--strict` フラグで制御可能とする。

### 2.4 チェック対象フィールドマップ（camelCase / snake_case 対応表）

| 検証項目     | camelCase フィールド      | snake_case フィールド       | 許容範囲 / 形式          |
| ------------ | ------------------------- | --------------------------- | ------------------------ |
| レベル値     | `currentLevel`            | `current_level`             | integer 1 ≤ x ≤ 4        |
| 使用回数     | `metrics.totalUsageCount` | `metrics.total_usage_count` | integer ≥ 0              |
| 成功回数     | `metrics.successCount`    | `metrics.success_count`     | integer ≥ 0              |
| 失敗回数     | `metrics.failureCount`    | `metrics.failure_count`     | integer ≥ 0              |
| 成功率       | `metrics.successRate`     | `metrics.success_rate`      | float 0.0 ≤ x ≤ 1.0      |
| 平均実行時間 | `metrics.averageDuration` | `metrics.average_duration`  | number ≥ 0（ms）         |
| 最終評価日時 | `metrics.lastEvaluated`   | `metrics.last_evaluated`    | ISO-8601 文字列          |
| レベル履歴   | `levelHistory[]`          | `levels[]`（v1 固有）       | 配列・要素に必須キーあり |

### 2.5 既存コードへの変更点

変更は最小限とし、L4 を独立した関数として追加する。
`validateAll` / `validateSingle` の呼び出し箇所に L4 呼び出しを追加するのみ。
既存 L1/L2/L3 の実装は変更しない。

---

## Phase 3: 設計レビュー

### 3.1 レビューチェックリスト

| 項目                                                     | 判定   | 備考                              |
| -------------------------------------------------------- | ------ | --------------------------------- |
| L4 が L1/L2 の結果に依存する順序関係が明確か             | OK     | L2 の方言確定結果を L4 に引き渡す |
| `--strict` フラグの意味論が既存 CLI と矛盾しないか       | OK     | 既存フラグと独立して動作          |
| 実スキル EVALS.json（6件）で全件 PASS する見通しがあるか | 要確認 | Phase 5 前に手動検証必須          |
| `qualityInsights.*` スコープ外の記載が明確か             | OK     | 含まないものに明記済み            |
| fixture EVALS.json（snake_case）を壊さないか             | OK     | 両方言許容のため問題なし          |

### 3.2 Phase 4 進行判定

上記チェックリストで「要確認」項目は Phase 4 開始前に手動確認する。
その他の項目はすべて OK のため Phase 4 へ進める。

---

## Phase 4: テスト作成（TDD RED フェーズ）

### 4.1 テストファイル配置

```
.claude/skills/skill-fixture-runner/scripts/__tests__/
  validate-evals-l4.test.js    ← L4 専用テスト（新規作成）
```

### 4.2 テストケース一覧

| TC番号   | 区分     | 説明                                                           | 期待結果               |
| -------- | -------- | -------------------------------------------------------------- | ---------------------- |
| TC-L4-01 | 正常系   | 有効な camelCase EVALS.json → L4 PASS                          | ok: true               |
| TC-L4-02 | 正常系   | 有効な snake_case EVALS.json → L4 PASS                         | ok: true               |
| TC-L4-03 | 異常系   | `currentLevel: 5`（範囲外） → L4 FAIL / warnings/errors に追加 | ok: false, layer: 'L4' |
| TC-L4-04 | 異常系   | `currentLevel: 0`（範囲外） → L4 FAIL                          | ok: false              |
| TC-L4-05 | 異常系   | `currentLevel: -1`（負数） → L4 FAIL                           | ok: false              |
| TC-L4-06 | 異常系   | `metrics.successRate: 1.5`（範囲外） → L4 FAIL                 | ok: false              |
| TC-L4-07 | 異常系   | `metrics.successCount: NaN` → L4 FAIL                          | ok: false              |
| TC-L4-08 | 異常系   | `metrics.totalUsageCount: -1`（負数） → L4 FAIL                | ok: false              |
| TC-L4-09 | 異常系   | `metrics.lastEvaluated: "not-a-date"` → L4 FAIL                | ok: false              |
| TC-L4-10 | 正常系   | `metrics.lastEvaluated: "2026-04-21T12:00:00.000Z"` → L4 PASS  | ok: true               |
| TC-L4-11 | 正常系   | snake_case の `current_level: 3` → L4 PASS                     | ok: true               |
| TC-L4-12 | 異常系   | snake_case の `current_level: 6`（範囲外） → L4 FAIL           | ok: false              |
| TC-L4-13 | 境界値   | `currentLevel: 1`（下限） → PASS                               | ok: true               |
| TC-L4-14 | 境界値   | `currentLevel: 4`（上限） → PASS                               | ok: true               |
| TC-L4-15 | 境界値   | `metrics.successRate: 0.0`（下限） → PASS                      | ok: true               |
| TC-L4-16 | 境界値   | `metrics.successRate: 1.0`（上限） → PASS                      | ok: true               |
| TC-L4-17 | モード   | `--strict` なしで L4 失敗 → 終了コード 0 / warnings に記録     | exitCode: 0            |
| TC-L4-18 | モード   | `--strict` ありで L4 失敗 → 終了コード 1 / errors に記録       | exitCode: 1            |
| TC-L4-19 | 回帰確認 | 既存 L1/L2/L3 テストが全件 PASS する                           | 回帰なし               |

### 4.3 テストデータ（フィクスチャ）

```javascript
// 有効な camelCase EVALS（最小構成）
const VALID_CAMEL = {
  skillName: "test-skill",
  currentLevel: 2,
  metrics: {
    totalUsageCount: 10,
    successCount: 8,
    failureCount: 2,
    successRate: 0.8,
    averageDuration: 1500,
    lastEvaluated: "2026-04-21T12:00:00.000Z",
  },
  levelHistory: [],
};

// 有効な snake_case EVALS（最小構成）
const VALID_SNAKE = {
  skill_name: "test-skill",
  current_level: 2,
  metrics: {
    total_usage_count: 10,
    success_count: 8,
    failure_count: 2,
    success_rate: 0.8,
    average_duration: 1500,
    last_evaluated: "2026-04-21T12:00:00.000Z",
  },
  levels: [],
};
```

---

## Phase 5: 実装

### 5.1 実装対象ファイル

| 区分 | ファイルパス                                                                      |
| ---- | --------------------------------------------------------------------------------- |
| 修正 | `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`                   |
| 修正 | `.agents/skills/skill-fixture-runner/scripts/validate-evals.js`（mirror 同期）    |
| 新規 | `.claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals-l4.test.js` |

### 5.2 L4 実装スニペット（設計）

```javascript
/**
 * L4: 内容品質検証
 * L2 で確定した方言情報（dialect: 'camelCase' | 'snake_case'）を受け取る
 * @returns {{ ok: boolean, layer: string, warnings: string[], errors: string[] }}
 */
function validateL4(parsed, dialect) {
  const warnings = [];
  const errors = [];

  // フィールド名マッピング
  const fields =
    dialect === "camelCase"
      ? {
          currentLevel: parsed.currentLevel,
          successRate: parsed.metrics?.successRate,
          lastEvaluated: parsed.metrics?.lastEvaluated,
          totalUsageCount: parsed.metrics?.totalUsageCount,
          successCount: parsed.metrics?.successCount,
          failureCount: parsed.metrics?.failureCount,
          averageDuration: parsed.metrics?.averageDuration,
        }
      : {
          currentLevel: parsed.current_level,
          successRate: parsed.metrics?.success_rate,
          lastEvaluated: parsed.metrics?.last_evaluated,
          totalUsageCount: parsed.metrics?.total_usage_count,
          successCount: parsed.metrics?.success_count,
          failureCount: parsed.metrics?.failure_count,
          averageDuration: parsed.metrics?.average_duration,
        };

  // currentLevel の範囲チェック（1..4）
  if (fields.currentLevel !== undefined) {
    const level = fields.currentLevel;
    if (!Number.isInteger(level) || level < 1 || level > 4) {
      errors.push(`currentLevel の値が不正: ${level}（許容: 1..4）`);
    }
  }

  // successRate の範囲チェック（0..1）
  if (fields.successRate !== undefined) {
    const rate = fields.successRate;
    if (
      typeof rate !== "number" ||
      isNaN(rate) ||
      !isFinite(rate) ||
      rate < 0 ||
      rate > 1
    ) {
      errors.push(`successRate の値が不正: ${rate}（許容: 0..1）`);
    }
  }

  // 非負整数チェック
  for (const key of ["totalUsageCount", "successCount", "failureCount"]) {
    const val = fields[key];
    if (val !== undefined) {
      if (typeof val !== "number" || isNaN(val) || !isFinite(val) || val < 0) {
        errors.push(`${key} の値が不正: ${val}（非負整数が必要）`);
      }
    }
  }

  // lastEvaluated の ISO-8601 チェック
  if (fields.lastEvaluated !== undefined) {
    const ts = fields.lastEvaluated;
    if (typeof ts !== "string" || isNaN(Date.parse(ts))) {
      errors.push(`lastEvaluated の形式が不正: ${ts}（ISO-8601 文字列が必要）`);
    }
  }

  return {
    ok: errors.length === 0,
    layer: "L4",
    warnings,
    errors,
  };
}
```

### 5.3 `--strict` フラグの統合

```javascript
// 既存の validateAll / validateSingle に L4 呼び出しを追加
// L4 失敗は strict モードでのみエラーとして扱い、通常は warnings に降格する
function shouldFailForL4(result, strict) {
  if (!result.ok) {
    if (strict) {
      return true; // strict モードではエラーとして扱い終了コード 1
    }
    // 通常モードでは warnings に記録して継続
    return false;
  }
  return false;
}
```

### 5.4 mirror 同期

`.claude/skills/skill-fixture-runner/scripts/validate-evals.js` の変更完了後、
`.agents/skills/skill-fixture-runner/scripts/validate-evals.js` に同一変更を適用する。

確認コマンド:

```bash
diff -u \
  .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  .agents/skills/skill-fixture-runner/scripts/validate-evals.js
```

---

## Phase 6: テスト拡充

### 6.1 fail path テスト追加

| シナリオ                       | テスト内容                                        |
| ------------------------------ | ------------------------------------------------- |
| `averageDuration: Infinity`    | 無限大値の検出                                    |
| `successRate: NaN`             | NaN の検出                                        |
| `currentLevel: "2"` （文字列） | 型不一致の検出                                    |
| `metrics` キー自体が存在しない | undefined 参照の安全性確認（L4 は graceful skip） |

### 6.2 回帰ガード

既存の `validate-evals.js --all-skills` を実行し、全6スキルが L1/L2/L3/L4 で PASS することを確認する。

```bash
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js --all-skills --json
```

---

## Phase 7: カバレッジ確認

### 7.1 カバレッジ目標

| 対象                               | 目標                    |
| ---------------------------------- | ----------------------- |
| `validateL4` 関数全体              | line 100% / branch 100% |
| 境界値（1, 4, 0.0, 1.0）           | 全ケース実行済み        |
| 方言分岐（camelCase / snake_case） | 両方言でテスト実行済み  |

### 7.2 カバレッジ確認コマンド

```bash
node --experimental-vm-modules \
  .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals-l4.test.js
```

---

## Phase 8: リファクタリング

### 8.1 変更内容テーブル

| 対象                  | Before             | After                                | 理由                      |
| --------------------- | ------------------ | ------------------------------------ | ------------------------- |
| L4 関数名             | （なし）           | `validateL4`                         | L1/L2/L3 と命名規則を統一 |
| `--strict` フラグ説明 | CLI ヘルプに未記載 | CLI ヘルプに L4 オプションとして追記 | 使い方の明示              |
| `JSON 出力`           | `layer: 'L3'` まで | `layer: 'L4'` を追加                 | --json 出力の一貫性       |

---

## Phase 9: 品質保証

### 9.1 品質チェックリスト

| チェック項目                                       | 確認方法                                 |
| -------------------------------------------------- | ---------------------------------------- |
| L1/L2/L3 への回帰がない                            | `--all-skills` で全件 PASS               |
| mirror parity（.claude ⇄ .agents）一致             | `diff -qr .claude/skills .agents/skills` |
| `--json` 出力の schema が変わっていない            | 既存 consumer スクリプトで動作確認       |
| `--strict` フラグなしで L4 失敗時に終了コード 0    | スクリプト実行確認                       |
| fixture EVALS.json（snake_case）が L4 で PASS する | 実ファイルに対する手動実行               |

---

## Phase 10: 最終レビュー

### 10.1 受入条件チェック

| AC番号 | 受入条件                                     | 判定    |
| ------ | -------------------------------------------- | ------- |
| AC-1   | L4 が `currentLevel` を 1..4 で検証する      | pending |
| AC-2   | L4 が `successRate` を 0..1 で検証する       | pending |
| AC-3   | L4 が `lastEvaluated` を ISO-8601 で検証する | pending |
| AC-4   | NaN / Infinity / 負数を検出する              | pending |
| AC-5   | `--strict` なしで終了コード 0                | pending |
| AC-6   | `--strict` ありで終了コード 1                | pending |
| AC-7   | 両方言で L4 が正しく動作する                 | pending |
| AC-8   | 既存 L1/L2/L3 への回帰なし                   | pending |
| AC-9   | 実スキル 6 件で全件 PASS                     | pending |
| AC-10  | `--json` 出力に `layer: 'L4'` が含まれる     | pending |

### 10.2 ブロッカー確認

- 実スキルの EVALS.json に既に範囲外の値が存在する場合は、
  まず対象 EVALS.json を修正してから L4 実装を進める。

---

## Phase 11: 手動テスト（NON_VISUAL）

### 11.1 NON_VISUAL 宣言

本タスクは UI/UX 変更なしの NON_VISUAL タスクである。
スクリーンショット取得は不要。代替証跡として自動テスト結果を使用する。

### 11.2 手動実行テスト手順

```bash
# 全スキルに対して L4 込みで検証を実行
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --all-skills --json --verbose

# strict モードでの動作確認（全スキルが PASS するはず）
node .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
  --all-skills --strict --json

# mirror parity 確認
diff -qr .claude/skills/skill-fixture-runner .agents/skills/skill-fixture-runner
```

### 11.3 証跡の主ソース

- L4 テスト全件の PASS/FAIL 結果
- `--all-skills` 実行ログ（全6スキル PASS）
- mirror parity diff（差分 0 件）

---

## Phase 12: ドキュメント更新

### Phase 12 Task 1: 実装ガイド作成

#### Part 1: 中学生レベル概念説明

**「内容品質チェック」とは何か？**

EVALS.json というファイルは、スキル（AI の道具）がどれくらい上手に使えているかを記録した「成績表」のようなものです。

いままで、このファイルが「壊れていないか（JSONとして読める）」「必要な項目があるか」は確認していました。

でも、たとえば「成功率が 150%（1.5）」と書かれていたり、「レベルが 99」と書かれていても、これまでは見逃していました。成績表に「100点満点で 200点取った」と書かれていたら、それはおかしいですよね。

**このタスクで追加する L4 検証**は、「書いてある数値が現実的な範囲に収まっているか」を確認するチェックです。まるで先生が成績表を見て「この点数は有り得ない」と気づくような役割を担います。

- `currentLevel` が 1〜4 の範囲内か（5以上や0以下は異常）
- `successRate`（成功率）が 0〜1 の間か（1.5などは有り得ない）
- `lastEvaluated`（最終評価日時）が日付として読める形式か

**なぜ今まで見ていなかったのか？**

まず「そもそも壊れた JSON を読めないようにしよう」（L1）、「必要な項目が全部あるか確認しよう」（L2）という基本的なチェックを先に整備しました。L4 はその次の段階として、「値が正しいか」を確認する、より高度なチェックです。

#### Part 2: 技術的詳細

**L4 関数シグネチャ**

```javascript
/**
 * L4: 内容品質検証
 * @param {object} parsed - L1 で parse 済みの EVALS.json オブジェクト
 * @param {'camelCase' | 'snake_case'} dialect - L2 で確定した方言
 * @returns {{ ok: boolean, layer: 'L4', warnings: string[], errors: string[] }}
 */
function validateL4(parsed, dialect) { ... }
```

**CLI オプション追加**

```
--strict    L4 失敗を警告ではなくエラーとして扱い、終了コード 1 で終了する
```

**検証フィールドと許容範囲**

| フィールド（camelCase）   | フィールド（snake_case）    | 型      | 許容範囲      |
| ------------------------- | --------------------------- | ------- | ------------- |
| `currentLevel`            | `current_level`             | integer | 1 ≤ x ≤ 4     |
| `metrics.totalUsageCount` | `metrics.total_usage_count` | integer | x ≥ 0         |
| `metrics.successCount`    | `metrics.success_count`     | integer | x ≥ 0         |
| `metrics.failureCount`    | `metrics.failure_count`     | integer | x ≥ 0         |
| `metrics.successRate`     | `metrics.success_rate`      | float   | 0.0 ≤ x ≤ 1.0 |
| `metrics.averageDuration` | `metrics.average_duration`  | number  | x ≥ 0（ms）   |
| `metrics.lastEvaluated`   | `metrics.last_evaluated`    | string  | ISO-8601 形式 |

**エラーハンドリング方針**

- フィールドが `undefined` の場合は graceful skip（L4 エラーにしない）
- 型不一致（文字列に数値が期待される等）は L4 エラーとして記録
- NaN / Infinity は `Number.isFinite()` / `Number.isNaN()` で検出

### Phase 12 Task 2: システム仕様書更新

**Step 1-A: 完了タスク記録**

- `evals-schema-spec.md` §7.4 の残課題から「L4 内容品質検証」を削除し、完了欄へ移動
- `evals-schema-spec.md` §8 変更履歴に本タスク完了エントリを追加
- `LOGS.md` 2ファイル（`.claude/skills/aiworkflow-requirements/LOGS.md` と `.claude/skills/task-specification-creator/LOGS.md`）を同一wave で更新

**Step 1-B: 実装状況テーブル更新**

- `evals-schema-spec.md` §7.1 の「validator = 1 件」記述を「validator = 1 件（L1/L2/L3/L4）」に更新

**Step 1-C: 関連タスクテーブル更新**

- `task-workflow.md` の本タスクエントリを「完了」に更新
- `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` への参照を確認

**Step 2: システム仕様更新（新規インターフェース追加なし → N/A）**

本タスクは既存スクリプトへの関数追加のみ。新規インターフェース定義は不要。

### Phase 12 Task 3: ドキュメント更新履歴作成

出力先: `docs/30-workflows/evals-skill-scanner-content-validate-001/outputs/phase-12/documentation-changelog.md`

### Phase 12 Task 4: 未タスク検出レポート

**検出された未タスク候補**

| 候補ID | 概要                                          | 根拠                         |
| ------ | --------------------------------------------- | ---------------------------- |
| TBD-1  | `qualityInsights.*` の詳細妥当性検証          | Phase 1 スコープ外として明示 |
| TBD-2  | `phaseMetrics.*` / `levelCriteria.*` 構造検証 | Phase 1 スコープ外として明示 |
| TBD-3  | L4 を CI 必須チェックに昇格する判断           | 方針判断が別途必要           |

### Phase 12 Task 5: スキルフィードバックレポート

出力先: `docs/30-workflows/evals-skill-scanner-content-validate-001/outputs/phase-12/skill-feedback-report.md`

---

## Phase 13: PR 作成

**実施条件**: ユーザーの明示承認後のみ実施。

---

## 苦戦箇所記録（将来の実装者向け）

### 苦戦1: L1/L2 パスとの責務分離

**背景**: `validate-evals.js` を実装した際（UNASSIGNED-EVALS-VALIDATOR-GUARD-001）、L1（JSON パース）/ L2（必須キー）/ L3（dual root）の 3 層検証を作成した。**内容品質の検証**（レベル値が 1-5 の範囲か、メトリクスの説明が空でないか、evaluator の有効性など）は実装スコープ外とした。

**問題**: L2 で「必須キーがある」ことは確認できるが、「値が正しいか」は確認しない。
例えば `currentLevel: 999` があっても L2 は PASS する。この問題が L4 として積み残された。

**対処方針**:

- L4 は L2 の方言確定結果（camelCase/snake_case）を受け取り、その上で値の妥当性を検証する
- L4 は `--strict` フラグなしでは警告のみ（終了コード 0）とし、既存の CI パイプラインを壊さない
- 将来 L4 を必須化する場合は `--strict` フラグを CI に追加するだけで対応可能

### 苦戦2: 方言の二重スキーマ対応

**背景**: repo には camelCase v2 系と snake_case v1 系の両方の EVALS.json が存在する（`evals-schema-spec.md §2 / §3` 参照）。fixture の EVALS.json（`skill-creator/complete-skill/EVALS.json`）は snake_case。

**問題**: L4 を camelCase のみ対応にすると、snake_case の既存スキルが全件 FAIL になる。

**対処方針**:

- L4 は L2 で確定した方言をパラメータとして受け取り、対応するフィールド名を動的に切り替える
- fixture の EVALS.json を本タスクでは変更しない（方言統一は `UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` で扱う）

### 苦戦3: `metrics` フィールドが存在しない場合の安全性

**背景**: L2 では `metrics` キーの存在は確認するが、`metrics.*` のサブフィールドまでは確認しない。
L4 で `parsed.metrics?.successRate` のような optional chaining なしにアクセスすると runtime error になる。

**対処方針**:

- L4 内では全フィールドアクセスに optional chaining を使用する
- フィールドが `undefined` の場合は L4 エラーにせず graceful skip する（存在確認は L2 の責務）

### 苦戦4: `Infinity` / `NaN` の JSON 表現

**背景**: JSON 仕様では `NaN` と `Infinity` は表現できない。しかし TypeScript/JavaScript で計算された値が `JSON.stringify` 時に `null` に変換されることがある。また、一部の実装では文字列 `"NaN"` として格納されることもある。

**対処方針**:

- `typeof val === 'number' && !isNaN(val) && isFinite(val)` で数値の有効性を確認する
- 文字列型の `"NaN"` も異常値として検出するため、型チェック（`typeof val !== 'number'`）を最初に行う

---

## 関連リンク

- [evals-schema-spec.md](../../../.claude/skills/aiworkflow-requirements/references/evals-schema-spec.md)
- [validate-evals.js](../../../.claude/skills/skill-fixture-runner/scripts/validate-evals.js)
- [UNASSIGNED-EVALS-VALIDATOR-GUARD-001 仕様書](../unassigned-task/task-skill-scanner-evals-content-validate-001.md)
- [consumer-audit-report.md](../../evals-consumer-audit-001/outputs/phase-5/consumer-audit-report.md)
- [evals-field-map.md](../../evals-consumer-audit-001/outputs/phase-5/evals-field-map.md)

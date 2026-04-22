# Phase 5: 実装

## メタ情報

| 項目       | 内容                                             |
| ---------- | ------------------------------------------------ |
| Phase      | 5                                                |
| 機能名     | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名   | skill-fixture-runner EVALS.json スキーマ検証追加 |
| 前提Phase  | Phase 4 完了（TDD Red 確立）                     |
| 後続Phase  | Phase 6                                          |
| 作成日     | 2026-04-21                                       |
| ステータス | pending                                          |

## 目的

TDD Green フェーズとして、Phase 4 で定義した TC-001〜TC-022 を全て通過させる 3 層 validator を実装する。`implementation_mode: "new"` のため既存実装との差分確認は不要。Phase 2 設計（3 層検証アーキテクチャ / dual root 同期方針 / 方言許容モード設計）に従い、新規ファイルとして忠実に実装する。

## P50 チェック（差分確認不要 - 新規実装）

`implementation_mode: "new"` であるため、P50 の「既存実装差分確認」ステップはスキップする。Phase 2 の設計成果物を正本として実装を進める。

## 実装対象ファイル一覧

### 新規作成

| ファイルパス                                                    | 役割                                                       |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| `.claude/skills/skill-fixture-runner/scripts/validate-evals.js` | L1/L2/L3 の 3 層検証を実行するメイン validator（ESM 形式） |
| `.agents/skills/skill-fixture-runner/scripts/validate-evals.js` | `.claude` 正本からのミラー（dual root 同期要件 AC-007）    |

### 修正対象

| ファイルパス                                                              | 修正内容                                                                            |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | EVALS.json 存在チェックを強化（各スキルディレクトリに EVALS.json があることを確認） |
| `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`      | `validate-evals.js` の呼び出しを追加し、1 コマンドで 3 層検証を起動できるようにする |
| `.agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | `.claude` 正本のミラー                                                              |
| `.agents/skills/skill-fixture-runner/scripts/run-all-validations.js`      | `.claude` 正本のミラー                                                              |

## 実行タスク

1. `validate-evals.js` の CLI 契約を Phase 2 正本に合わせて実装する
2. L1 → L2 → L3 の順で実装し、各段階で Phase 4 の Red を Green に反転する
3. `run-all-validations.js` 統合と `.agents/` mirror 同期を同一 wave で行う
4. SKILL.md / 実装コメント / 実装方針を current contract にそろえる

## 実装手順

### Step 1: `validate-evals.js` 骨組み（L1 JSON パースのみ）+ テスト Green 確認

`validate-evals.js` の ESM 骨組みを作成し、L1 JSON パース検証のみを実装する。

```js
// .claude/skills/skill-fixture-runner/scripts/validate-evals.js（骨組み）
// ESM 形式
import { readFileSync } from "fs";

// L1: JSON パース検証
function validateL1(filePath) {
  const content = readFileSync(filePath, "utf-8");
  if (content.trim().length === 0) {
    return { ok: false, layer: "L1", reason: "empty file" };
  }
  try {
    JSON.parse(content);
    return { ok: true };
  } catch (err) {
    return { ok: false, layer: "L1", reason: err.message };
  }
}
```

確認コマンド:

```bash
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js
# 期待: TC-001〜TC-004（L1 テスト）が PASS
```

### Step 2: L2 必須キー検証 + 方言判定実装

camelCase / snake_case の両方言を許容する方言判定と、必須キー検証を実装する。

方言フィールド対応表:

| camelCase    | snake_case   | 共通必須キー |
| ------------ | ------------ | ------------ |
| `skillName`  | `skill_name` | -            |
| `logUsage`   | `log_usage`  | -            |
| （方言依存） | （方言依存） | `timestamp`  |

実装方針:

- JSON 内に `skillName`（camelCase）が存在する場合: camelCase 方言として検証
- JSON 内に `skill_name`（snake_case）が存在する場合: snake_case 方言として検証
- いずれも存在しない場合: L2 エラー（方言検出不能）

確認コマンド:

```bash
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js
# 期待: TC-001〜TC-010（L1 + L2 テスト）が PASS
```

### Step 3: L3 dual root 一致（6 スキル全件）

`.claude/skills/` と `.agents/skills/` の両 root にある EVALS.json を `Buffer.compare` でバイト単位比較する。

```js
// L3: dual root 一致検証
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const TARGET_SKILLS = [
  "aiworkflow-requirements",
  "github-issue-manager",
  "int-test-skill",
  "skill-creator",
  "skill-fixture-runner",
  "task-specification-creator",
];

function validateL3(skillName) {
  const claudePath = join(".claude", "skills", skillName, "EVALS.json");
  const agentsPath = join(".agents", "skills", skillName, "EVALS.json");

  if (!existsSync(agentsPath)) {
    return { ok: false, layer: "L3", reason: `mirror missing: ${agentsPath}` };
  }

  const claudeBuf = readFileSync(claudePath);
  const agentsBuf = readFileSync(agentsPath);

  if (Buffer.compare(claudeBuf, agentsBuf) !== 0) {
    return { ok: false, layer: "L3", reason: `drift detected: ${skillName}` };
  }
  return { ok: true };
}
```

確認コマンド:

```bash
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js
# 期待: TC-001〜TC-015（L1 + L2 + L3 テスト）が PASS
```

### Step 4: fixture EVALS 除外 or 特別扱い実装

`fixtures/` や `tests/__fixtures__/` 配下の EVALS.json はテスト用途であるため、検証対象から除外するか特別扱いする。除外方針は Phase 2 設計書（AC-005）に従う。

除外パターン例:

```js
const EXCLUDE_PATTERNS = [/\/fixtures?\//, /\/__fixtures__\//, /\/tests?\//];

function isFixturePath(filePath) {
  return EXCLUDE_PATTERNS.some((pattern) => pattern.test(filePath));
}
```

確認コマンド:

```bash
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js
# 期待: TC-001〜TC-019 が PASS
```

### Step 5: `run-all-validations.js` への統合

既存の `run-all-validations.js` に `validate-evals.js` の呼び出しを追加する。既存の呼び出し順序（validate-schemas → validate-skill-structure → validate-agents → validate-skill-md）の末尾または適切な位置に挿入する。

```js
// run-all-validations.js 追加部分（イメージ）
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const evalsResult = spawnSync("node", [join(__dirname, "validate-evals.js")], {
  stdio: "inherit",
});
if (evalsResult.status !== 0) {
  process.exit(evalsResult.status);
}
```

確認コマンド:

```bash
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js
# 期待: validate-evals.js が呼び出され、evals 検証の出力が含まれる
```

### Step 6: `.agents/` ミラーを同一 commit で更新

正本ファイル（`.claude/` 配下）と完全一致したミラーを `.agents/` 配下に配置する。バイト完全一致を確認する。

dual root ミラー同期手順:

```bash
# validate-evals.js のミラー同期
cp .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
   .agents/skills/skill-fixture-runner/scripts/validate-evals.js

# validate-skill-structure.js のミラー同期
cp .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
   .agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js

# run-all-validations.js のミラー同期
cp .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
   .agents/skills/skill-fixture-runner/scripts/run-all-validations.js

# 差分確認（差分ゼロを確認）
diff -u .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
        .agents/skills/skill-fixture-runner/scripts/validate-evals.js
diff -u .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
        .agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js
diff -u .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
        .agents/skills/skill-fixture-runner/scripts/run-all-validations.js
# 期待: すべての diff コマンドが何も出力しない（差分ゼロ）
```

### Step 7: `SKILL.md` 更新

`.claude/skills/skill-fixture-runner/SKILL.md` に以下を追記する。

- ローカル実行手順（`validate-evals.js` の直接実行方法）
- expected exit code 表（L1/L2/L3 別のエラーコードと意味）

expected exit code 表（設計案）:

| exit code | 意味                                   | 層    |
| --------- | -------------------------------------- | ----- |
| 0         | 全検証 PASS                            | -     |
| 1         | L1 JSON パースエラー / L2 必須キー欠落 | L1/L2 |
| 2         | L3 dual root ドリフト検出              | L3    |
| 3         | その他エラー（ファイル未発見等）       | -     |

確認コマンド:

```bash
# SKILL.md の更新確認
grep -n "validate-evals" .claude/skills/skill-fixture-runner/SKILL.md
grep -n "exit code" .claude/skills/skill-fixture-runner/SKILL.md
```

## 検証コマンド（各ステップ後の確認方法）

```bash
# 全テスト実行（Phase 4 の TC-001〜TC-022 が全 PASS）
node --test .claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js

# run-all-validations.js 統合確認
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js

# dual root ミラー一致確認
diff -u .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
        .agents/skills/skill-fixture-runner/scripts/validate-evals.js
diff -u .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js \
        .agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js
diff -u .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
        .agents/skills/skill-fixture-runner/scripts/run-all-validations.js

# 既存スクリプト回帰確認
node .claude/skills/skill-fixture-runner/scripts/validate-schemas.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js
node .claude/skills/skill-fixture-runner/scripts/validate-agents.js
node .claude/skills/skill-fixture-runner/scripts/validate-skill-md.js
```

## 実装方針

### `validate-evals.js` 実装方針

- **形式**: ESM（`import` / `export` 構文）
- **Node.js 標準モジュールのみ使用**: `fs`、`path`、`url` のみ使用し、外部パッケージを追加しない
- **read-only 契約**: `fs.writeFile` / `fs.appendFile` / `fs.unlink` を一切使用しない
- **CLI エントリ**: `#!/usr/bin/env node`、引数なしで全 6 スキルを検証（オプションで対象スキルを絞り込み可）
- **stderr/stdout 分離**: stderr には進行ログ、stdout には最終レポートのみ出力
- **ESM 対応**: `import.meta.url` と `fileURLToPath` を使用して `__dirname` 相当を取得
- **エラーメッセージ**: ユーザー向けは日本語、機械処理向け JSON のフィールド名は英語

### `validate-skill-structure.js` 修正方針

- 既存の構造検証ロジックを保持したまま、EVALS.json の存在チェックを追加する
- 各スキルディレクトリに `EVALS.json` が存在しない場合は警告またはエラーを出力する
- 既存の exit code / 出力形式と整合を保つ

### `run-all-validations.js` 修正方針

- 既存の呼び出し順序を維持する
- `validate-evals.js` を末尾に追加し、失敗した場合に全体を FAIL とする
- 既存の出力形式と整合を保つ

## 注意事項

- 実装コード中で TODO / FIXME コメントを残さない（Phase 2 設計が完結済みのため）
- `pnpm install` による依存追加は禁止（新規パッケージなし）
- `.agents/` ミラーは `.claude/` 正本と**バイト完全一致**で保つ（`cp` コマンドで同期）
- `validate-skill-structure.js` の既存テストが PASS し続けることを確認する
- Node.js バージョンは `.nvmrc` または `package.json` の `engines` 設定に合わせる

## 統合テスト連携

- Phase 4 の TC-001〜TC-022 を Green にした状態で Phase 6 へ渡す
- Phase 9 の品質保証では本 Phase の CLI 実装と SKILL.md 記述の一致を確認する

## 成果物

- `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`（コード成果物: outputs 外）
- `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js`（コード成果物: 修正）
- `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`（コード成果物: 修正）
- `.agents/skills/skill-fixture-runner/scripts/validate-evals.js`（ミラー）
- `.agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js`（ミラー）
- `.agents/skills/skill-fixture-runner/scripts/run-all-validations.js`（ミラー）
- `.claude/skills/skill-fixture-runner/SKILL.md`（ローカル実行手順 / exit code 表 追記）
- `outputs/phase-5/implementation-log.md`: 実装ログ（変更概要・差分要約・テスト結果）

## 完了条件

- [ ] `validate-evals.js` が新規作成され、Phase 4 の TC-001〜TC-022 が全 PASS
- [ ] L1 JSON パース検証（TC-001〜TC-004）が Green
- [ ] L2 必須キー検証・方言許容（TC-005〜TC-010）が Green
- [ ] L3 dual root 一致検証（TC-011〜TC-015）が Green
- [ ] fixture 除外処理（TC-016〜TC-019）が Green
- [ ] run-all-validations.js 統合（TC-020〜TC-022）が Green
- [ ] `validate-skill-structure.js` に EVALS.json 存在チェックが追加されている
- [ ] `run-all-validations.js` に `validate-evals.js` 呼び出しが追加されている
- [ ] `.agents/` ミラーが `.claude/` 正本と `diff -u` で差分ゼロ
- [ ] 既存スクリプト（validate-schemas.js / validate-agents.js / validate-skill-md.js）が PASS 継続
- [ ] `SKILL.md` にローカル実行手順と expected exit code 表が追記されている
- [ ] `outputs/phase-5/implementation-log.md` が出力されている

## タスク100%実行確認【必須】

- [ ] `validate-evals.js` 新規作成完了（ESM 形式）
- [ ] L1 JSON パース実装完了
- [ ] L2 必須キー検証・方言判定実装完了
- [ ] L3 dual root 一致検証（6 スキル全件）実装完了
- [ ] fixture 除外ロジック実装完了
- [ ] `validate-skill-structure.js` EVALS.json 存在チェック強化完了
- [ ] `run-all-validations.js` への validate-evals.js 統合完了
- [ ] `.agents/` ミラー同期完了（3 ファイル）
- [ ] `SKILL.md` 更新完了（ローカル実行手順 / exit code 表）
- [ ] Phase 4 の全テスト PASS 確認完了（TC-001〜TC-022）
- [ ] 既存スクリプト回帰確認完了
- [ ] `outputs/phase-5/implementation-log.md` 出力完了

## 参照資料

### 実装・コード

| 資料名                           | パス                                                                      | 用途                                |
| -------------------------------- | ------------------------------------------------------------------------- | ----------------------------------- |
| Phase 2 3層検証設計              | `outputs/phase-2/three-layer-validation-design.md`                        | L1/L2/L3 実装の根拠                 |
| Phase 2 dual root 同期設計       | `outputs/phase-2/dual-root-sync-design.md`                                | ミラー同期方針                      |
| Phase 2 方言許容モード設計       | `outputs/phase-2/dialect-tolerance-design.md`                             | camelCase/snake_case 判定実装の根拠 |
| Phase 4 test-design              | `outputs/phase-4/test-design.md`                                          | Green 化対象のテスト一覧            |
| Phase 3 gate-decision            | `outputs/phase-3/gate-decision.md`                                        | 実装着手前の合否判定                |
| 既存 validate-schemas.js         | `.claude/skills/skill-fixture-runner/scripts/validate-schemas.js`         | 回帰基準・実装パターン参照          |
| 既存 validate-skill-structure.js | `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | 拡張対象・責務境界                  |
| 既存 run-all-validations.js      | `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`      | 統合対象・呼び出し順序              |
| 既存 SKILL.md                    | `.claude/skills/skill-fixture-runner/SKILL.md`                            | 更新対象                            |

## 次Phase

Phase 6（テスト拡充）へ進む。

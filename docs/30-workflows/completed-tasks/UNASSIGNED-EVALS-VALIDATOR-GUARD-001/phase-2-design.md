# Phase 2: 設計 — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## メタ情報

| 項目                   | 値                                               |
| ---------------------- | ------------------------------------------------ |
| Phase                  | 2 / 設計                                         |
| タスクID               | UNASSIGNED-EVALS-VALIDATOR-GUARD-001             |
| タスク名               | skill-fixture-runner EVALS.json スキーマ検証追加 |
| GitHub Issue           | #2325（CLOSED）                                  |
| ステータス             | pending                                          |
| 作成日                 | 2026-04-21                                       |
| 入力（Phase 1 成果物） | `outputs/phase-1/script-inventory.md`            |
|                        | `outputs/phase-1/evals-target-list.md`           |
|                        | `outputs/phase-1/dialect-field-map.md`           |

---

## 目的

Phase 1 で確認した現状（validator=0 件状態・12 件の検証対象・2 方言並立・fixture 除外境界・動的パス consumer 13 件）を踏まえ、以下を設計する。

1. L1/L2/L3 の 3 層バリデーターアーキテクチャの責務分離
2. 新設する `validate-evals.js` のインターフェースと出力フォーマット
3. camelCase/snake_case 両方言を許容するハンドリング方針
4. fixture EVALS（TC-004）を安全に除外する allowlist 設計
5. `validate-skill-structure.js` への EVALS 検証組み込み拡張点
6. `run-all-validations.js` への統合方針
7. dual root ミラー同期の検証手順

---

## 実行タスク

### Step 1: validator アーキテクチャ設計（L1/L2/L3 の責務分離）

3 層バリデーターの責務境界を明確にし、`outputs/phase-2/validator-architecture.md` に記載する。

#### L1: JSON パース層

| 項目     | 内容                                                        |
| -------- | ----------------------------------------------------------- |
| 責務     | `JSON.parse` による構文検証                                 |
| 検出対象 | JSON 構文エラー（括弧不一致・末尾カンマ・エンコードエラー） |
| 入力     | EVALS.json ファイルパス（文字列）                           |
| 出力     | `{ ok: boolean, error?: string, parsed?: object }`          |
| 例外処理 | `try/catch` で `SyntaxError` を捕捉し、`ok: false` を返す   |
| 後続処理 | L1 が `ok: false` の場合、L2/L3 はスキップする              |

#### L2: 必須キー検証層

| 項目             | 内容                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| 責務             | 必須フィールドの存在確認（方言を考慮）                                 |
| 検出対象         | `skill_name`/`skillName`・`timestamp` 等の欠損                         |
| 入力             | L1 の `parsed` オブジェクト                                            |
| 出力             | `{ ok: boolean, missing: string[], warnings: string[] }`               |
| 方言ハンドリング | camelCase/snake_case のどちらか一方が存在すれば OK（両方言許容モード） |
| 後続処理         | L2 が `ok: false` の場合、L3 はスキップする                            |

#### L3: dual root 一致検証層

| 項目     | 内容                                                                             |
| -------- | -------------------------------------------------------------------------------- |
| 責務     | `.claude/skills/` と `.agents/skills/` の同名スキルの bit-for-bit 比較           |
| 検出対象 | 両 root 間のコンテンツ差分                                                       |
| 入力     | `.claude` 側パス・`.agents` 側パス（ペア）                                       |
| 出力     | `{ ok: boolean, diff?: string }`                                                 |
| 比較手法 | Node.js `fs.readFileSync` で両ファイルを読み込み、Buffer 比較またはテキスト diff |
| 備考     | ファイルが一方のみ存在する場合も `ok: false`（存在ミスマッチ）                   |

#### 層間データフロー

```
EVALS.json パス (12件)
  └─ L1: JSON.parse
        ├─ [fail] → エラー記録・L2/L3 スキップ
        └─ [ok] → parsed オブジェクト
              └─ L2: 必須キー検証
                    ├─ [fail] → エラー記録・L3 スキップ
                    └─ [ok]
                          └─ L3: dual root 比較
                                ├─ [fail] → エラー記録
                                └─ [ok] → PASS
```

### Step 2: `validate-evals.js` の設計（インターフェース・出力フォーマット）

`outputs/phase-2/interface-design.md` に詳細を記載する。

#### ファイルパス

```
.claude/skills/skill-fixture-runner/scripts/validate-evals.js  （新設）
.agents/skills/skill-fixture-runner/scripts/validate-evals.js  （ミラー）
```

#### CLI インターフェース

```
node validate-evals.js [options]

Options:
  --all-skills             allowlist 6 件を一括検証
  --skill <id>             特定スキルのみ検証
  --path <file-or-dir>     単一ファイルまたは fixture ディレクトリを検証対象として指定
  --check-dual-root        L3（dual root 比較）を強制実行
  --check-excluded         除外対象が除外されることを検査する監査モード
  --strict                 strict モード（両方言必須、デフォルト: 両方言許容）
  --json                   結果を JSON 形式で出力（デフォルト: テキスト）
  --verbose                詳細ログを出力
```

> このセクションを CLI 契約の正本とし、Phase 11 / Phase 12 / Phase 13 はここを参照する。

#### 終了コード

| コード | 意味                                 |
| ------ | ------------------------------------ |
| 0      | 全 EVALS.json が PASS                |
| 1      | 1 件以上が FAIL                      |
| 2      | スクリプト自体のエラー（I/O 失敗等） |

#### テキスト出力フォーマット

```
[EVALS Validator] 開始: 12 件を検証

✓ .claude/skills/aiworkflow-requirements/EVALS.json (L1+L2+L3)
✓ .agents/skills/aiworkflow-requirements/EVALS.json (L1+L2+L3)
✗ .claude/skills/github-issue-manager/EVALS.json
  L2: 必須フィールド不足: skill_name / skillName のいずれも存在しない

[EVALS Validator] 結果: 11/12 PASS, 1/12 FAIL
```

#### JSON 出力フォーマット（`--json` オプション）

```json
{
  "summary": { "total": 12, "pass": 11, "fail": 1 },
  "results": [
    {
      "path": ".claude/skills/aiworkflow-requirements/EVALS.json",
      "l1": { "ok": true },
      "l2": { "ok": true, "missing": [], "warnings": [] },
      "l3": { "ok": true, "diff": null }
    }
  ]
}
```

#### スキル allowlist（ハードコード）

```javascript
const SKILL_ALLOWLIST = [
  "aiworkflow-requirements",
  "github-issue-manager",
  "int-test-skill",
  "skill-creator",
  "skill-fixture-runner",
  "task-specification-creator",
];
```

### Step 3: 方言ハンドリング設計（両方言許容モード vs strict モード）

#### 両方言許容モード（デフォルト）

`UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` 未実施時を想定し、camelCase/snake_case のどちらか一方が存在すれば PASS とする。

```javascript
// 両方言許容モードの判定ロジック（疑似コード）
function checkRequiredField(obj, camelKey, snakeKey) {
  return obj[camelKey] !== undefined || obj[snakeKey] !== undefined;
}

// 適用フィールドペア
const DIALECT_PAIRS = [
  ["skillName", "skill_name"],
  ["timeStamp", "timestamp"], // Phase 1 Step 4 で確認後に修正
  ["fieldNameC", "field_name_s"], // 残り 1 組は Phase 1 Step 4 で確認
];
```

#### strict モード（`--strict` フラグ）

両方言が両方存在することを要求する。`UNASSIGNED-EVALS-SCHEMA-DIALECT-UNIFICATION-001` 完了後に移行する想定。

```javascript
function checkRequiredFieldStrict(obj, camelKey, snakeKey) {
  return obj[camelKey] !== undefined && obj[snakeKey] !== undefined;
}
```

#### 移行戦略

| 段階                           | モード                      | 備考                                 |
| ------------------------------ | --------------------------- | ------------------------------------ |
| 本タスク実装時                 | 両方言許容（デフォルト）    | DIALECT-UNIFICATION-001 未実施       |
| DIALECT-UNIFICATION-001 完了後 | strict モードをデフォルト化 | フラグ反転のみで対応可能な設計にする |

### Step 4: fixture EVALS 除外設計（allowlist パターン）

`outputs/phase-2/fixture-exclusion-policy.md` に詳細を記載する。

#### 除外対象

```
apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json
```

#### 除外方針

glob パターンではなく、**ファイルパスの allowlist ベース列挙**を採用する。

理由:

- 動的パス consumer 13 件が存在し、単純 glob では consumer を網羅できない
- fixture EVALS は `apps/` 配下に存在し、スキルディレクトリ（`.claude/skills/`・`.agents/skills/`）とパスが明確に分離されている
- TC-004 契約の固定内容を validator が書き換えないよう、除外を明示的に管理する

#### 実装

```javascript
const FIXTURE_EXCLUSION_LIST = [
  "apps/desktop/src/__tests__/__fixtures__/skill-creator/complete-skill/EVALS.json",
];

function isExcluded(filePath) {
  return FIXTURE_EXCLUSION_LIST.some(
    (excluded) => filePath.endsWith(excluded) || filePath.includes(excluded),
  );
}
```

#### TC-004 影響確認手順（設計時）

```bash
# TC-004 が fixture EVALS.json を参照しているテストを特定
grep -r "complete-skill/EVALS" apps/ --include="*.ts" --include="*.js"
# 上記ファイルに対して validate-evals.js が干渉しないことを確認
```

### Step 5: `validate-skill-structure.js` 拡張点の設計

既存の `validate-skill-structure.js` に EVALS.json の存在確認（L1 の前段）を追加する。

#### 拡張点

1. スキル構造検証の一環として EVALS.json の存在チェックを追加する
2. EVALS.json が存在する場合、`validate-evals.js` を呼び出す（またはインライン L1 を実行する）
3. EVALS.json が存在しない場合は WARN（エラーではない）とし、将来の追加に備える

#### 変更箇所のイメージ

```javascript
// validate-skill-structure.js への追加（既存関数の末尾に追記）
async function validateSkillStructure(skillPath) {
  // 既存検証 ...

  // EVALS.json 存在確認（新規追加）
  const evalsPath = path.join(skillPath, "EVALS.json");
  if (fs.existsSync(evalsPath)) {
    const evalsResult = await validateEvalsFile(evalsPath); // validate-evals.js を import
    if (!evalsResult.ok) {
      results.errors.push(`EVALS.json 検証失敗: ${evalsResult.error}`);
    }
  } else {
    results.warnings.push("EVALS.json が存在しません");
  }
}
```

### Step 6: `run-all-validations.js` 統合設計

`validate-evals.js` を `run-all-validations.js` の検証ステップとして統合する。

#### 統合方針

1. `run-all-validations.js` から `validate-evals.js` を `child_process.execSync` または `import` で呼び出す
2. EVALS 検証を既存ステップの**最後**に追加する（既存検証への影響を最小化）
3. EVALS 検証が FAIL でも、他のステップの結果と合算して最終終了コードを決定する

#### 追加ステップのイメージ

```javascript
// run-all-validations.js への追加
const steps = [
  // 既存ステップ群...
  {
    name: "EVALS.json スキーマ検証",
    script: "./validate-evals.js",
    args: [],
  },
];
```

### Step 7: dual root ミラー同期設計（`diff -u` 検証手順）

`.claude/skills/` と `.agents/skills/` のスクリプトを bit-for-bit 一致させるための再現可能な手順を設計する。

#### ミラー同期手順（実装後に実行）

```bash
# 差分確認
for skill in aiworkflow-requirements github-issue-manager int-test-skill skill-creator skill-fixture-runner task-specification-creator; do
  diff -u .claude/skills/$skill/EVALS.json .agents/skills/$skill/EVALS.json && echo "$skill: OK" || echo "$skill: DIFF"
done

# スクリプトミラー確認
diff -u .claude/skills/skill-fixture-runner/scripts/validate-evals.js \
        .agents/skills/skill-fixture-runner/scripts/validate-evals.js
```

#### ミラー同期の実施タイミング

| タイミング            | 作業                                                                                    |
| --------------------- | --------------------------------------------------------------------------------------- |
| Phase 4（実装）完了後 | `validate-evals.js` を `.agents/` へコピー                                              |
| Phase 4（実装）完了後 | 更新した `validate-skill-structure.js`・`run-all-validations.js` を `.agents/` へコピー |
| Phase 5（テスト）前   | 上記 diff コマンドで一致を確認                                                          |

#### CI 組み込み（将来）

ミラー同期が崩れた場合に CI で検出できるよう、L3 の dual root 比較をスクリプト内に組み込む（Phase 3 レビュー後に確定）。

---

## 設計成果物（outputs/phase-2/）

Phase 2 完了時に以下のファイルを `docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/outputs/phase-2/` に作成する。

### `validator-architecture.md`

L1/L2/L3 の責務境界・データフロー・終了コード規約を記載する。

| セクション | 内容                                           |
| ---------- | ---------------------------------------------- |
| L1 設計    | JSON パース層の責務・入出力・例外処理          |
| L2 設計    | 必須キー検証層の責務・方言ハンドリングロジック |
| L3 設計    | dual root 比較層の責務・比較手法               |
| 層間フロー | データフロー図（テキスト形式）                 |

### `interface-design.md`

`validate-evals.js` の CLI インターフェース・終了コード・出力フォーマット・スキル allowlist を記載する。

| セクション     | 内容                                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------- |
| CLI オプション | `--all-skills`, `--skill`, `--path`, `--check-dual-root`, `--check-excluded`, `--strict`, `--json`, `--verbose` |
| 終了コード     | 0/1/2 の定義                                                                                                    |
| テキスト出力   | 成功・失敗・サマリーの形式                                                                                      |
| JSON 出力      | `summary` + `results[]` の構造                                                                                  |
| allowlist      | 6 スキル ID のハードコードリスト                                                                                |

### `fixture-exclusion-policy.md`

fixture EVALS 除外ポリシー・除外実装方針・TC-004 影響確認手順を記載する。

| セクション  | 内容                                             |
| ----------- | ------------------------------------------------ |
| 除外対象    | ファイルパス（1 件）                             |
| 除外方針    | allowlist ベース・glob 不採用の理由              |
| 実装        | `FIXTURE_EXCLUSION_LIST` 定数・`isExcluded` 関数 |
| TC-004 確認 | grep コマンドと確認観点                          |

---

## 実行手順

1. Phase 1 の 3 成果物から対象集合と方言ペアを固定する
2. 本文の CLI 契約を単一正本として確定する
3. L1/L2/L3 の責務境界を `validator-architecture.md` へ切り出す
4. fixture 除外方針と監査モードを `fixture-exclusion-policy.md` にまとめる
5. `run-all-validations.js` 統合時の I/F を `interface-design.md` に集約する

---

## 統合テスト連携

- Phase 4 のテストケースは本 Phase の CLI 契約を唯一の入力契約として扱う
- Phase 5 の実装は `validator-architecture.md` と `interface-design.md` に定義された責務境界を逸脱しない
- Phase 11 / Phase 12 の再現コマンドは本 Phase のフラグ定義と一致させる

---

## 参照資料

- `.claude/skills/task-specification-creator/SKILL.md`
- `.claude/skills/task-specification-creator/references/phase-template-core.md`
- `.claude/skills/aiworkflow-requirements/SKILL.md`
- `docs/30-workflows/UNASSIGNED-EVALS-VALIDATOR-GUARD-001/phase-1-requirements.md`

---

## 完了条件チェックリスト

- [ ] Step 1: L1/L2/L3 の責務境界が明確に定義されている
- [ ] Step 2: `validate-evals.js` の CLI インターフェース・終了コード・出力フォーマットが定義されている
- [ ] Step 3: 両方言許容モードと strict モードの切り替え設計が完了している
- [ ] Step 4: fixture EVALS 除外の allowlist 設計が完了し、TC-004 への影響が考慮されている
- [ ] Step 5: `validate-skill-structure.js` への拡張点が特定されている
- [ ] Step 6: `run-all-validations.js` への統合方針が定義されている
- [ ] Step 7: dual root ミラー同期の再現可能な手順が定義されている
- [ ] `outputs/phase-2/` 配下に 3 成果物（`validator-architecture.md`, `interface-design.md`, `fixture-exclusion-policy.md`）が存在する

---

## 次 Phase

Phase 2 完了後、`outputs/phase-2/` の 3 成果物を入力として **Phase 3: 設計レビュー** に進む。

- 入力: `validator-architecture.md`, `interface-design.md`, `fixture-exclusion-policy.md`
- 次 Phase ファイル: `phase-3-design-review.md`

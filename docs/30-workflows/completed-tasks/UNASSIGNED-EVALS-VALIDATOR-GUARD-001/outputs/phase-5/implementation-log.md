# Phase 5 実装ログ — UNASSIGNED-EVALS-VALIDATOR-GUARD-001

## 作成ファイル

| ファイルパス                                                                   | 種別     | 内容                                    |
| ------------------------------------------------------------------------------ | -------- | --------------------------------------- |
| `.claude/skills/skill-fixture-runner/scripts/validate-evals.js`                | 新規作成 | L1/L2/L3 3層バリデーター本体（ESM形式） |
| `.agents/skills/skill-fixture-runner/scripts/validate-evals.js`                | ミラー   | `.claude` 正本の完全コピー              |
| `.claude/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js` | 新規作成 | TC-001〜TC-022 + Phase 6 拡充テスト     |
| `.agents/skills/skill-fixture-runner/scripts/__tests__/validate-evals.test.js` | ミラー   | `.claude` 正本の完全コピー              |

## 修正ファイル

| ファイルパス                                                              | 修正内容                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | EVALS.json 存在チェック追加（warnings フィールド追加）                            |
| `.claude/skills/skill-fixture-runner/scripts/run-all-validations.js`      | validate-evals.js 呼び出しを統合（ステップ5として追加）                           |
| `.agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js` | ミラー同期                                                                        |
| `.agents/skills/skill-fixture-runner/scripts/run-all-validations.js`      | ミラー同期                                                                        |
| `.claude/skills/skill-fixture-runner/SKILL.md`                            | validate-evals.js のローカル実行手順・exit code 表・fixture 除外 allowlist を追記 |

## 実装の概要

### validate-evals.js の設計

- **形式**: ESM（`import` / `export`）、Node.js 標準モジュールのみ
- **read-only 契約**: `fs.writeFile` 等のファイル書き込みは一切使用しない
- **CLI エントリ**: `#!/usr/bin/env node`

### L1 実装

```
JSON.parse で構文検証。
空ファイルは trim().length === 0 で事前検出。
SyntaxError を catch して { ok: false, layer: 'L1', reason } を返す。
```

### L2 実装

```
skillName (camelCase) の存在で方言自動検出。
skill_name (snake_case) の存在で snake_case 方言と判定。
両方存在する場合は混在として警告を発し、必須キー確認を継続。
どちらも存在しない場合は missing に追加して FAIL。
metrics は方言非依存の共通必須キー。
```

### L3 実装

```
Buffer.compare で .claude 側と .agents 側のバイト単位比較。
.agents 側が存在しない場合は ミラー欠損として FAIL。
```

### fixture 除外

```
FIXTURE_EXCLUSION_LIST（1件）+ FIXTURE_PATH_PATTERNS（/__fixtures__/, /\/fixtures\//, /[/\\]tests?[/\\]/）
で2段階除外。
```

## テスト結果

```
# tests 27
# suites 6
# pass 25
# fail 0
# skipped 2
# duration_ms 8783
```

## dual root 差分確認（AC-007）

```bash
diff .claude/.../validate-evals.js .agents/.../validate-evals.js  # 差分ゼロ
diff .claude/.../validate-skill-structure.js .agents/.../validate-skill-structure.js  # 差分ゼロ
diff .claude/.../run-all-validations.js .agents/.../run-all-validations.js  # 差分ゼロ
```

全ファイル差分ゼロ確認済み（AC-007 PASS）。

## 既存スクリプト回帰確認

```bash
node .claude/skills/skill-fixture-runner/scripts/run-all-validations.js \
  --target .claude/skills/skill-fixture-runner
# → {"overall":true,"results":[...]}  exit 0
```

validate-schemas.js / validate-agents.js / validate-skill-md.js は対象ディレクトリに
schemas/ や agents/ が存在しない場合はスキップされるため回帰なし。

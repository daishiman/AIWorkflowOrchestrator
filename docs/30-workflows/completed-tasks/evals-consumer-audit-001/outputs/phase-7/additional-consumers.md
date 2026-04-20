# Phase 7 追加 consumer 候補（コードリーディング補完）

## メタ情報

| 項目     | 内容                          |
| -------- | ----------------------------- |
| task_id  | TASK-EVALS-CONSUMER-AUDIT-001 |
| phase    | 7 (Step 3 コードリーディング) |
| 作成日時 | 2026-04-19                    |
| 対応 AC  | AC-1 / AC-2 / AC-8            |
| 対応 QG  | QG-6                          |

## 1. コードリーディング観点（spec §3 Step 3）

1. `const FILE_NAME = 'EVALS.json'; ... path.join(skillDir, FILE_NAME)` 形式の隠蔽
2. `readJson("EVALS")` / `loadSkillMetrics(skillName)` 等のラッパ関数
3. 複数行にわたるテンプレートリテラル `` `${skillDir}/EVALS.json` ``
4. 既知 consumer（SkillScanner / skill-fixture-runner / init_skill.js）の呼び出し元逆引き

## 2. 補完検索コマンドと結果

### 2.1 ラッパ関数検索

```bash
rg -n 'loadEvals|readEvals|getEvals|writeEvals|updateEvals|ensureEvalsFile|createEvalsTemplate' \
  .claude/skills/ .agents/skills/ apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' -g '*.{js,ts,tsx,mjs,cjs}'
```

ヒット（12 行）はすべて Phase 5-A §4 に既出のスクリプト内定義／呼び出し:

- `createEvalsTemplate()` - `init_skill.js` (.claude / .agents 対称, 2 箇所 × 2 root)
- `ensureEvalsFile()` - `skill-creator/scripts/log_usage.js` (.claude / .agents 対称)
- `updateEvals()` - `task-specification-creator/scripts/log-usage.js` (.claude / .agents 対称)

→ **新規 consumer ファイルは発見されなかった**。ラッパ関数は全て既知 consumer の内部関数。

### 2.2 定数経由の隠蔽検索

```bash
rg -n 'FILE_NAME\s*=\s*["\x27]EVALS|FILENAME\s*=\s*["\x27]EVALS|EVALS_FILENAME' \
  .claude/skills/ .agents/skills/ apps/ -g '*.{js,ts,tsx,mjs,cjs}'
```

→ **ヒット 0 件**。定数経由で `EVALS.json` を隠蔽しているコードは存在しない。

### 2.3 拡張子違い（`.json` 以外）

```bash
rg -n 'EVALS\.json|EVALS_PATH' .claude/skills/ .agents/skills/ apps/ \
  -g '!**/node_modules/**' -g '!**/.backups/**' \
  -g '!*.md' -g '!*.{js,ts,tsx,mjs,cjs}'
```

ヒット:

- `apps/desktop/coverage-authkey/src/main/services/skill/SkillScanner.ts.html`
- `apps/desktop/coverage-authkey/lcov-report/src/main/services/skill/SkillScanner.ts.html`

→ **vitest カバレッジの生成物**。`SkillScanner.ts:40` の文字列がレポート HTML に出現しただけで、consumer ではない（Phase 2 §1.2 「バックアップ／生成物除外」に準ずる）。

### 2.4 skill-fixture-runner 配下

```bash
rg -n 'EVALS' .claude/skills/skill-fixture-runner/ .agents/skills/skill-fixture-runner/ \
  -g '*.{js,mjs,cjs}'
```

ヒット 2 件（対称）:

- `.claude/skills/skill-fixture-runner/scripts/validate-skill-structure.js:70`
  `if (basename !== 'SKILL' && basename !== 'EVALS' && basename !== basename.toLowerCase())`
- `.agents/skills/skill-fixture-runner/scripts/validate-skill-structure.js:70` (同上)

→ `EVALS` はケバブケース例外リストのリテラルで、`EVALS.json` 構造・フィールドには触れない。Phase 5-A §8 発見 #5 に「スキーマ検証を行わない」として記録済。**再検索コマンドの正規表現（`EVALS\.json|EVALS_PATH|evalsPath|EVALS_FILE`）にマッチしないため Phase 4 / Phase 7 raw ではヒットせず**、consumer-audit-report.md の §3〜§6 consumer 一覧にもエントリが立っていない。

評価: ここで扱う `'EVALS'` リテラル（7 文字）はディレクトリ／ファイル名のトップレベルベース名照合でしか使われず、**`EVALS.json` のスキーマ consumer ではない**（ファイル存在やスキーマを read/write/validate しない）。したがって Phase 5-A §8 発見 #5 の「CI スキーマ検証ガード不在」課題として既に言及されており、consumer 一覧に追記する対象ではない。

## 3. 追加 consumer の結論

| 判定                                      |                 件数 |
| ----------------------------------------- | -------------------: |
| コードリーディングで発見した新規 consumer |                    0 |
| 既知 consumer の内部ラッパ関数追加        | 0（§4 記述で言及済） |
| consumer-audit-report.md 追記必要         |                 なし |

**Phase 5-A `consumer-audit-report.md` への追記は不要**。§8 発見 #5 で言及済の `validate-skill-structure.js` の EVALS 例外行は「スキーマを読み書きする consumer」ではないため、9 列の consumer 表には不適格（operation=validate であってもスキーマ対象ではない）。

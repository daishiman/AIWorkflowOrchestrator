# Phase 8: リファクタリング計画

> 作成日: 2026-04-20

---

## 重複コード検出結果

### 対象スクリプト

- `validate-closeout-parity.js`（新規）
- `complete-phase.js`（拡張済み）
- `verify-all-specs.js`（parity組込み済み）

### 検出コマンド

```bash
grep -n "parseFrontmatter|normalizeStatus|loadArtifactsJson|writeFile|writeFileSync" \
  .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js
# → 出力なし（書き込み系API一切なし）

grep -n "readFileSync" \
  validate-closeout-parity.js  # 4回
  complete-phase.js            # 7回
  verify-all-specs.js          # 2回
```

### 重複コード分析

| パターン           | validate-closeout-parity | complete-phase | verify-all-specs | 重複度 |
| ------------------ | ------------------------ | -------------- | ---------------- | ------ |
| readFileSync       | あり（4回）              | あり（7回）    | あり（2回）      | 低     |
| JSON.parse         | あり（1回）              | あり（4回）    | あり（1回）      | 低     |
| ステータス行パース | あり（1種）              | あり（1種）    | なし             | 低     |
| parseArgs          | あり（独自）             | あり（独自）   | あり（独自）     | 中     |

### 判断

**共通utility抽出は不要。**

理由:

1. 各スクリプトは独立した責務を持ち、関数の用途が異なる
2. `readFileSync` の使い方はそれぞれ異なるコンテキスト（index.md パース / artifacts.json 更新 / 仕様書検証）
3. `parseArgs` も引数セットが各スクリプトで異なるため共通化すると柔軟性が失われる
4. 重複コード量が少なく、共通utility抽出のコストがメリットを上回る

---

## 必須確認事項

### validate-closeout-parity.js に fs の書き込み系 API がないか

```bash
grep -n "write|Write|fs\." .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js
```

**結果**: `process.stderr.write` のみ（fsの書き込みAPI一切なし）

→ **read-only 確認済み（必須条件クリア）**

### complete-phase.js が唯一の writer か

`validate-closeout-parity.js` および `verify-all-specs.js` に `writeFileSync` / `writeFile` は含まれていない。

→ **complete-phase.js が唯一の writer（必須条件クリア）**

### .agents/ ミラーが .claude/ と同一か

```bash
diff -q .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
        .agents/skills/task-specification-creator/scripts/validate-closeout-parity.js
diff -q .claude/skills/task-specification-creator/scripts/complete-phase.js \
        .agents/skills/task-specification-creator/scripts/complete-phase.js
diff -q .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
        .agents/skills/task-specification-creator/scripts/verify-all-specs.js
```

**結果**: 全3ファイルで差分なし（同一）

→ **ミラー parity 確認済み（同期不要）**

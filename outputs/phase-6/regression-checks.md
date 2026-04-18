# Phase 6: リグレッションチェック

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 6 — エッジケース拡張
**作成日**: 2026-04-18

---

## 概要

Phase 5 の実装変更後、既存の動作が壊れていないことを確認するためのリグレッションチェック手順を定義する。

---

## RC-6-01: `.claude` 更新後の `.agents` パリティチェック

**目的**: `.claude/skills/` を変更した際に `.agents/skills/` への mirror sync が漏れていないことを確認する。

### チェック手順

```bash
# 1. ファイル構成の差分確認
diff -qr .claude/skills .agents/skills

# 期待: 出力なし (exit code 0)
# 失敗例: "Only in .claude/skills: new-skill.md"

# 2. ファイル数の一致確認
SRC=$(find .claude/skills  -type f | wc -l | tr -d ' ')
DST=$(find .agents/skills  -type f | wc -l | tr -d ' ')
echo "source: $SRC, mirror: $DST"
[ "$SRC" -eq "$DST" ] && echo "PASS: RC-6-01" || echo "FAIL: RC-6-01 (count mismatch)"
```

### 合否基準

| チェック             | 合格条件         |
| -------------------- | ---------------- |
| `diff -qr` exit code | 0                |
| `diff -qr` stdout    | 空               |
| ファイル数           | source == mirror |

### 失敗時の対処

```bash
# .claude/skills/ → .agents/skills/ への再同期
rsync -av --delete .claude/skills/ .agents/skills/
```

---

## RC-6-02: `topic-map.md` 以外の index ファイルが壊れていないことの確認

**目的**: `generate-index.js` の date ヘッダー除去が `topic-map.md` 以外の index ファイルに
予期しない影響を与えていないことを確認する。

### 対象ファイル

```bash
# indexes/ 配下の全 .md ファイルを列挙
ls indexes/*.md
```

### チェック手順

```bash
# 1. generate-index.js を実行
node scripts/generate-index.js

# 2. 各 index ファイルが非空であることを確認
for f in indexes/*.md; do
  LINES=$(wc -l < "$f")
  if [ "$LINES" -gt 0 ]; then
    echo "PASS: $f ($LINES lines)"
  else
    echo "FAIL: $f is empty"
  fi
done

# 3. topic-map.md に日付行がないことを再確認
rg "自動生成:" indexes/topic-map.md
STATUS=$?
[ "$STATUS" -eq 1 ] && echo "PASS: RC-6-02 (no date header)" || echo "FAIL: RC-6-02 (date header found)"

# 4. 行番号索引が存在することを確認
rg "\| L[0-9]+" indexes/topic-map.md
STATUS=$?
[ "$STATUS" -eq 0 ] && echo "PASS: RC-6-02 (line index exists)" || echo "FAIL: RC-6-02 (line index missing)"
```

### 合否基準

| チェック                | 合格条件                 |
| ----------------------- | ------------------------ |
| 各 index ファイルの行数 | > 0                      |
| `自動生成:` の有無      | 0件 (rg exit code 1)     |
| `\| L[0-9]+` の有無     | 1件以上 (rg exit code 0) |

---

## RC-6-03: `session-init.sh` の既存動作が壊れていないことの確認

**目的**: `merge.ours.driver` チェックの追加により、既存の session-init.sh の動作が
中断されていないことを確認する。

### チェック手順

```bash
# session-init.sh を実行して exit code を確認
bash .claude/scripts/session-init.sh
echo "exit code: $?"

# driver が設定済みの場合: 警告なし、exit code 0
# driver が未設定の場合: 警告あり (stderr)、exit code 0 (警告のみ、abort しない)
```

### 合否基準

| 状態            | 期待 exit code | 期待 stderr                               |
| --------------- | -------------- | ----------------------------------------- |
| driver 設定済み | 0              | (警告なし)                                |
| driver 未設定   | 0              | `[WARN] merge.ours.driver が未設定です。` |

**注意**: exit code が非0になる場合は「abort してしまっている」ため NG。
警告は stdout/stderr に出力するが、スクリプトを中断させてはいけない。

---

## RC-6-04: `.gitattributes` の変更が他のファイルパターンに影響していないことの確認

**目的**: `indexes/*.md` の merge ポリシー変更が他のファイルパターン (例: `LOGS.md`) に
影響していないことを確認する。

### チェック手順

```bash
# .gitattributes の全エントリを確認
cat .gitattributes

# LOGS.md が merge=union を保持していることを確認
grep "LOGS.md" .gitattributes
# 期待: "LOGS.md merge=union"

# indexes/*.md が merge=ours になっていることを確認
grep "indexes/\*.md" .gitattributes
# 期待: "indexes/*.md merge=ours"
```

### 合否基準

| チェック                  | 合格条件      |
| ------------------------- | ------------- |
| `LOGS.md merge=union`     | grep でヒット |
| `indexes/*.md merge=ours` | grep でヒット |

---

## リグレッションチェック実行スクリプト (まとめ)

```bash
#!/usr/bin/env bash
set -euo pipefail
PASS=0
FAIL=0

check() {
  local name="$1"
  if eval "$2" > /dev/null 2>&1; then
    echo "PASS: $name"; ((PASS++))
  else
    echo "FAIL: $name"; ((FAIL++))
  fi
}

check "RC-6-01 parity"           "diff -qr .claude/skills .agents/skills"
check "RC-6-02 no date header"   "! rg '自動生成:' indexes/topic-map.md"
check "RC-6-02 line index"       "rg '\| L[0-9]+' indexes/topic-map.md"
check "RC-6-04 LOGS union"       "grep -q 'LOGS.md merge=union' .gitattributes"
check "RC-6-04 indexes ours"     "grep -q 'indexes/\*.md merge=ours' .gitattributes"

echo ""
echo "Result: PASS=$PASS FAIL=$FAIL"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
```

---

## 関連ドキュメント

- `outputs/phase-6/expanded-test-matrix.md` — エッジケーステストマトリクス
- `outputs/phase-6/failure-mode-catalog.md` — 失敗モード一覧
- `outputs/phase-5/changed-files-summary.md` — 変更ファイル一覧

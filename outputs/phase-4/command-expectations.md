# Phase 4: コマンドと期待値

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 4 — テスト設計
**作成日**: 2026-04-18

---

## 概要

`test-scenarios.md` で定義した TC-4-01〜TC-4-05 それぞれについて、
実行コマンドと期待される出力・終了コードを記載する。

---

## TC-4-01: merge simulation (merge=ours)

```bash
#!/usr/bin/env bash
set -euo pipefail

# 一時 repo を作成
TMPDIR=$(mktemp -d)
cd "$TMPDIR"
git init
git config user.email "test@example.com"
git config user.name "Test"

# merge.ours.driver を登録
git config merge.ours.driver true

# .gitattributes を設定
mkdir indexes
echo "indexes/*.md merge=ours" > .gitattributes
git add .gitattributes
git commit -m "chore: add gitattributes"

# main ブランチに初期 topic-map.md を作成
echo "# topic-map (main initial)" > indexes/topic-map.md
git add indexes/topic-map.md
git commit -m "chore: initial topic-map"

# feature ブランチで変更
git checkout -b feature
echo "# topic-map (feature)" > indexes/topic-map.md
git add indexes/topic-map.md
git commit -m "feat: feature topic-map"

# main ブランチでも変更
git checkout main
echo "# topic-map (main updated)" > indexes/topic-map.md
git add indexes/topic-map.md
git commit -m "chore: main topic-map update"

# merge 実行 (conflict は発生せず ours 側が残るはず)
git merge feature --no-edit

# 期待: current branch (main) 側が残る
RESULT=$(cat indexes/topic-map.md)
EXPECTED="# topic-map (main updated)"

if [ "$RESULT" = "$EXPECTED" ]; then
  echo "PASS: TC-4-01"
else
  echo "FAIL: TC-4-01 — got: $RESULT"
  exit 1
fi

# 後片付け
cd /
rm -rf "$TMPDIR"
```

**期待される終了コード**: 0
**期待される stdout**: `PASS: TC-4-01`

---

## TC-4-02: merge=union で両ブランチの追記が残る

```bash
#!/usr/bin/env bash
set -euo pipefail

TMPDIR=$(mktemp -d)
cd "$TMPDIR"
git init
git config user.email "test@example.com"
git config user.name "Test"

# union アトリビュート設定
echo "LOGS.md merge=union" > .gitattributes
echo "# Logs" > LOGS.md
git add .gitattributes LOGS.md
git commit -m "chore: init"

# feature ブランチで LOGS.md に追記
git checkout -b feature
echo "feature entry 2026-04-18" >> LOGS.md
git add LOGS.md
git commit -m "feat: add log entry"

# main ブランチでも LOGS.md に追記
git checkout main
echo "main entry 2026-04-18" >> LOGS.md
git add LOGS.md
git commit -m "chore: main log entry"

# merge
git merge feature --no-edit

# 期待: 両方の追記行が存在する
grep -q "feature entry 2026-04-18" LOGS.md && echo "feature line OK" || { echo "FAIL: feature line missing"; exit 1; }
grep -q "main entry 2026-04-18"    LOGS.md && echo "main line OK"    || { echo "FAIL: main line missing";    exit 1; }

echo "PASS: TC-4-02"
cd /
rm -rf "$TMPDIR"
```

**期待される終了コード**: 0
**期待される stdout**: `feature line OK` / `main line OK` / `PASS: TC-4-02`

---

## TC-4-03: topic-map.md に日付行なし・行番号索引あり

```bash
# date ヘッダー行が存在しないことを確認
rg "自動生成:" indexes/topic-map.md
# 期待: マッチなし (終了コード 1、stdout 空)

rg "\| L[0-9]+" indexes/topic-map.md
# 期待: 1件以上マッチ (終了コード 0)
```

**期待される出力まとめ**:

| コマンド                               | 期待終了コード | 期待 stdout |
| -------------------------------------- | -------------- | ----------- |
| `rg "自動生成:" indexes/topic-map.md`  | 1              | (空)        |
| `rg "\| L[0-9]+" indexes/topic-map.md` | 0              | 1行以上     |

---

## TC-4-04: .claude/skills ↔ .agents/skills パリティ

```bash
diff -qr .claude/skills .agents/skills
# 期待: 出力なし (終了コード 0)
```

**期待される終了コード**: 0
**期待される stdout**: (空)

差分があった場合の例:

```
Files .claude/skills/foo.md and .agents/skills/foo.md differ
Only in .claude/skills: bar.md
```

これらが出力された場合は FAIL。

---

## TC-4-05: merge.ours.driver 設定確認

```bash
git config --get merge.ours.driver
# 期待: "true"
```

**期待される終了コード**: 0
**期待される stdout**: `true`

ドライバーが未設定の場合:

```
# 終了コード 1、stdout 空 → FAIL
```

---

## CI / ローカル実行まとめ

```bash
# TC-4-01, TC-4-02 は一時 repo を使うため任意のディレクトリで実行可能
bash outputs/phase-4/scripts/tc-4-01-merge-ours.sh
bash outputs/phase-4/scripts/tc-4-02-union.sh

# TC-4-03 はプロジェクトルートで実行
node scripts/generate-index.js
rg "自動生成:" indexes/topic-map.md; [ $? -eq 1 ] && echo PASS || echo FAIL
rg "\| L[0-9]+" indexes/topic-map.md; [ $? -eq 0 ] && echo PASS || echo FAIL

# TC-4-04
diff -qr .claude/skills .agents/skills && echo "PASS: TC-4-04" || echo "FAIL: TC-4-04"

# TC-4-05
[ "$(git config --get merge.ours.driver)" = "true" ] && echo "PASS: TC-4-05" || echo "FAIL: TC-4-05"
```

---

## 関連ドキュメント

- `outputs/phase-4/test-scenarios.md` — シナリオ定義
- `outputs/phase-4/mirror-and-consumer-guard.md` — parity guard と consumer audit の手順

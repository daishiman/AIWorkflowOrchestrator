# Phase 4: ミラーパリティガード & EVALS コンシューマー監査

**タスクID**: TASK-CONFLICT-PREVENT-001
**フェーズ**: Phase 4 — テスト設計
**作成日**: 2026-04-18

---

## 1. ミラーパリティガード

### 1.1 対象パス

| ソース            | ミラー            |
| ----------------- | ----------------- |
| `.claude/skills/` | `.agents/skills/` |

`indexes/` および `references/` はミラー対象外。スキル定義ファイル (`*.md`, `*.json`) のみを比較する。

### 1.2 比較手順

```bash
# ステップ 1: ファイル名・ディレクトリ構造の差分確認
diff -qr .claude/skills .agents/skills

# ステップ 2: 差分があった場合の詳細確認
diff -r .claude/skills .agents/skills

# ステップ 3: ファイル数の一致確認
SRC_COUNT=$(find .claude/skills  -type f | wc -l)
DST_COUNT=$(find .agents/skills  -type f | wc -l)
echo "source: $SRC_COUNT, mirror: $DST_COUNT"
[ "$SRC_COUNT" -eq "$DST_COUNT" ] && echo "PASS: file count" || echo "FAIL: file count mismatch"
```

### 1.3 合否基準

| チェック             | 合格条件         |
| -------------------- | ---------------- |
| `diff -qr` exit code | 0 (差分なし)     |
| `diff -qr` stdout    | 空文字列         |
| ファイル数           | source == mirror |

### 1.4 失敗時の対処

```
Only in .claude/skills: new-skill.md
```

→ `.agents/skills/` への mirror sync を再実行する。

```
Files .claude/skills/foo.md and .agents/skills/foo.md differ
```

→ `.claude/skills/foo.md` を正本とし、`.agents/skills/foo.md` を上書きコピーする。

---

## 2. EVALS コンシューマー監査

### 2.1 目的

`EVALS.json` を参照しているコード・設定ファイルを特定し、
本タスクの変更が schema 破壊を引き起こさないことを確認する。

### 2.2 コンシューマー検索コマンド

```bash
# EVALS.json を直接 import / require しているファイルを検索
rg "EVALS\.json" --type-add "code:*.{ts,tsx,js,mjs,cjs}" -t code

# EVALS キーを動的に参照しているパターンを検索
rg "evals\b" --type-add "code:*.{ts,tsx,js,mjs,cjs}" -t code -i

# 設定ファイルからの参照
rg "EVALS" --type yaml --type json
```

### 2.3 判定基準

| 状態                                     | 判定   | 対応                                                |
| ---------------------------------------- | ------ | --------------------------------------------------- |
| コンシューマーが0件                      | 安全   | 本タスク内で schema 変更を行っても影響なし          |
| コンシューマーが1件以上、schema 変更なし | 安全   | 本タスクの変更を続行可能                            |
| コンシューマーが1件以上、schema 変更あり | 要注意 | consumer-audit-decision.md に記録し、別 Wave で対応 |

### 2.4 schema スナップショット取得

```bash
# 本タスク着手前のスナップショット (Phase 4 実施時点)
jq 'keys' EVALS.json > outputs/phase-4/evals-schema-snapshot-before.json

# Phase 5 実装後のスナップショット
jq 'keys' EVALS.json > outputs/phase-5/evals-schema-snapshot-after.json

# 比較
diff outputs/phase-4/evals-schema-snapshot-before.json \
     outputs/phase-5/evals-schema-snapshot-after.json
# 期待: 差分なし (0行)
```

### 2.5 schema 変更を本 Wave 外とする判断フロー

```
schema 変更が必要か？
  ├─ NO  → 本タスクを続行 (TC-4-05 PASS)
  └─ YES → consumer-audit-decision.md に以下を記録:
             - 変更が必要な schema キー
             - 影響を受ける consumer ファイル
             - 対応 Wave / Issue 番号
             - 本タスクでは schema を凍結する旨
```

---

## 3. 定期実行 (CI 推奨設定)

```yaml
# .github/workflows/parity-check.yml (参考)
name: Parity Check
on:
  push:
    paths:
      - ".claude/skills/**"
      - ".agents/skills/**"
jobs:
  parity:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check mirror parity
        run: |
          diff -qr .claude/skills .agents/skills && echo "PASS" || (echo "FAIL: parity mismatch" && exit 1)
```

---

## 関連ドキュメント

- `outputs/phase-4/test-scenarios.md` — TC-4-04, TC-4-05 の定義
- `outputs/phase-4/command-expectations.md` — 実行コマンド詳細
- `outputs/phase-5/consumer-audit-decision.md` — 実際の監査結果

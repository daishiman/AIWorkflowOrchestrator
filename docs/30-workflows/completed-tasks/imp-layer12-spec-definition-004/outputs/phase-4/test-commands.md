# Phase 4: 検証コマンドスイート（TDD Red）

## ファイルパス定義

```bash
TARGET=".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
IMPL="apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts"
```

## 基本検証コマンド

### Layer 別 check ID 数

```bash
# Layer 1: 期待値 5
grep -coE "L1-[0-9]{3}" "$TARGET"

# Layer 2: 期待値 7
grep -coE "L2-[0-9]{3}" "$TARGET"

# Layer 3: 期待値 4
grep -coE "L3-[0-9]{3}" "$TARGET"

# Layer 4: 期待値 3
grep -coE "L4-[0-9]{3}" "$TARGET"
```

### check ID 総数

```bash
# 期待値: 19
grep -coE "L[1-4]-[0-9]{3}" "$TARGET"
```

## 実装突き合わせ検証

```bash
# 実装から check ID を抽出
grep -oE "L[1-4]-[0-9]{3}" "$IMPL" | sort -u > /tmp/impl-check-ids.txt

# 仕様書から check ID を抽出
grep -oE "L[1-4]-[0-9]{3}" "$TARGET" | sort -u > /tmp/spec-check-ids.txt

# 差分検出（差分がなければ PASS）
diff /tmp/impl-check-ids.txt /tmp/spec-check-ids.txt
```

## Markdown 構文検証

```bash
# テーブルヘッダー行の存在確認（各 Layer テーブル）
# 期待値: 4
grep -c "| Check ID" "$TARGET"

# Layer 見出しの存在確認
# 期待値: 4
grep -cE "^#{2,3} Layer [1-4]" "$TARGET"
```

## TDD Red 実行結果（Phase 4 時点）

| 検証カテゴリ        | 期待結果 | 実行結果        | 判定             |
| ------------------- | -------- | --------------- | ---------------- |
| ファイル存在        | 未存在   | NOT EXISTS      | FAIL（期待通り） |
| Layer 1 check ID 数 | 0        | 0               | FAIL（期待通り） |
| Layer 2 check ID 数 | 0        | 0               | FAIL（期待通り） |
| Layer 3 check ID 数 | 0        | 0               | FAIL（期待通り） |
| Layer 4 check ID 数 | 0        | 0               | FAIL（期待通り） |
| check ID 総数       | 0        | 0               | FAIL（期待通り） |
| 実装突き合わせ      | 差分あり | impl=19, spec=0 | FAIL（期待通り） |
| Markdown テーブル   | 0        | 0               | FAIL（期待通り） |
| Layer 見出し        | 0        | 0               | FAIL（期待通り） |

**TDD Red 確認: 全 9 検証が FAIL — Phase 5 へ進行可能**

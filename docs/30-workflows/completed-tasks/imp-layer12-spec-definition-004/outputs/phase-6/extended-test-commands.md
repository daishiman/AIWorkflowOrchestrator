# Phase 6: 拡張検証コマンドスイート

## ファイルパス定義

```bash
TARGET=".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
IMPL="apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts"
```

## 追加検証パターン

### check ID 重複検証

```bash
# 仕様書から全 check ID を抽出し、重複を検出
grep -oE "L[1-4]-[0-9]{3}" "$TARGET" | sort | uniq -d
# 期待値: 出力なし（重複なし = PASS）
```

### severity 記載の正確性検証

```bash
# 各 check ID のテーブル行に error/warning が含まれるか確認
for id in L1-001 L1-002 ... L4-003; do
  line=$(grep "| $id " "$TARGET" | head -1)
  echo "$line" | grep -qE '`error`|`warning`' || echo "FAIL: $id missing severity"
done
```

### check ID フォーマット検証

```bash
# テーブル行から check ID を抽出し、不正フォーマットを検出
grep -E "^\| L[0-9]" "$TARGET" | grep -oE "L[0-9]+-[0-9]+" | grep -vE "^L[1-4]-[0-9]{3}$"
# 期待値: 出力なし（不正フォーマットなし = PASS）
```

**注意**: 拡張ガイドラインの例文中に `L5-001` や `L2-008` が出現するが、テーブル行のみを対象とすることで除外される。

## 回帰ガード

### Layer 別総数比較

```bash
for layer in 1 2 3 4; do
  impl=$(grep -oE "L${layer}-[0-9]{3}" "$IMPL" | sort -u | wc -l | tr -d ' ')
  spec=$(grep -E "^\| L${layer}-[0-9]{3}" "$TARGET" | grep -oE "L${layer}-[0-9]{3}" | sort -u | wc -l | tr -d ' ')
  if [ "$impl" -eq "$spec" ]; then
    echo "PASS: Layer $layer ($impl)"
  else
    echo "FAIL: Layer $layer impl=$impl spec=$spec"
  fi
done
```

### 全体総数比較

```bash
impl_count=$(grep -oE "L[1-4]-[0-9]{3}" "$IMPL" | sort -u | wc -l | tr -d ' ')
spec_count=$(grep -E "^\| L[1-4]-[0-9]{3}" "$TARGET" | grep -oE "L[1-4]-[0-9]{3}" | sort -u | wc -l | tr -d ' ')
if [ "$impl_count" -eq "$spec_count" ]; then
  echo "PASS: check ID 総数一致 ($impl_count)"
else
  echo "FAIL: 実装=$impl_count, 仕様書=$spec_count"
fi
```

## 境界値テスト

### 各 Layer の連番欠番確認

```bash
# Layer 1: L1-001〜L1-005
for i in $(seq -w 1 5); do
  grep -q "L1-00${i}" "$TARGET" || echo "MISSING: L1-00${i}"
done
# Layer 2: L2-001〜L2-007
for i in $(seq -w 1 7); do
  grep -q "L2-00${i}" "$TARGET" || echo "MISSING: L2-00${i}"
done
# Layer 3: L3-001〜L3-004
for i in $(seq -w 1 4); do
  grep -q "L3-00${i}" "$TARGET" || echo "MISSING: L3-00${i}"
done
# Layer 4: L4-001〜L4-003
for i in $(seq -w 1 3); do
  grep -q "L4-00${i}" "$TARGET" || echo "MISSING: L4-00${i}"
done
# 期待値: 出力なし（欠番なし = PASS）
```

## 実行結果

| 検証カテゴリ                            | 結果                              |
| --------------------------------------- | --------------------------------- |
| check ID 重複検証                       | PASS（重複なし）                  |
| severity 記載確認                       | PASS（全 19 check ID に記載あり） |
| check ID フォーマット検証（テーブル行） | PASS（不正フォーマットなし）      |
| Layer 別総数比較                        | PASS（L1:5, L2:7, L3:4, L4:3）    |
| 連番欠番確認                            | PASS（欠番なし）                  |

**全拡張検証 PASS**

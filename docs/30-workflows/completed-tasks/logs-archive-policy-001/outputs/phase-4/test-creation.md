# Phase 4 成果物: 検証スクリプト・検証手順

- タスクID: TASK-LOGS-ARCHIVE-POLICY-001
- 作成日: 2026-04-19
- 前提: Phase 1-3 成果物
- 方式: docs-only タスクのため「テスト」は grep/ls/diff ベースの検証スクリプトとして定義

## 1. Red 状態事前確認（Phase 5 実装前）

実行結果（本Phase作成時点）:

```bash
test -f .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  && echo "EXISTS" || echo "NOT_EXISTS"
# 実測: NOT_EXISTS ✓（期待通り）

test -f .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  && echo "EXISTS" || echo "NOT_EXISTS"
# 実測: NOT_EXISTS ✓（期待通り）

grep -c "logs-archive-policy" .claude/skills/aiworkflow-requirements/indexes/topic-map.md 2>/dev/null || echo "0"
# 実測: 0 ✓（期待通り）
```

全 Red 確認済。Phase 5 実装後に同スクリプト群を再実行し Green へ遷移する。

## 2. 検証スクリプト集（TC-01〜TC-12）

### TC-01 必須 6 セクションの存在（AC-1）

```bash
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
FAIL=0
for section in "## 1. 適用範囲" "## 2. アーカイブ閾値" "## 3. archive 先パス規則" \
               "## 4. アーカイブ手順" "## 5. 運用ルール" "## 6. 参照"; do
  grep -qF "$section" "$POLICY" || { echo "FAIL: $section"; FAIL=1; }
done
[ $FAIL -eq 0 ] && echo "TC-01 PASS" || echo "TC-01 FAIL"
```

### TC-02 閾値 3 種の明記（AC-2）

```bash
FAIL=0
for t in "300 行" "30 KB" "月次"; do
  grep -qF "$t" "$POLICY" || { echo "FAIL: $t"; FAIL=1; }
done
[ $FAIL -eq 0 ] && echo "TC-02 PASS" || echo "TC-02 FAIL"
```

### TC-03 命名規則の明記（AC-2）

```bash
grep -qF "logs-archive-YYYY-MM.md" "$POLICY" && echo "TC-03 PASS" || echo "TC-03 FAIL"
```

### TC-04 手順 6 ステップの存在（AC-3）

```bash
COUNT=$(awk '/^## 4\./,/^## 5\./' "$POLICY" | grep -cE "^[1-6]\.")
[ "$COUNT" -ge 6 ] && echo "TC-04 PASS" || echo "TC-04 FAIL (count=$COUNT)"
```

### TC-05 命名正規表現の明記（AC-2）

```bash
grep -qE '\^logs-archive-\\d\{4\}-\(0\[1-9\]\|1\[0-2\]\)\\\.md\$' "$POLICY" \
  && echo "TC-05 PASS" || echo "TC-05 FAIL"
```

### TC-06 legacy 共存方針の記載（F-001 / AC-4）

```bash
grep -qE "(legacy|レガシー).*(feb|march|月名)" "$POLICY" \
  && echo "TC-06 PASS" || echo "TC-06 FAIL"
```

### TC-07 mirror 先ファイルの存在（F-002 / AC-5）

```bash
AGENTS=".agents/skills/aiworkflow-requirements/references/logs-archive-policy.md"
test -f "$AGENTS" && echo "TC-07 PASS" || echo "TC-07 FAIL"
```

### TC-08 mirror 内容の一致（F-002 / AC-5）

```bash
diff -q "$POLICY" "$AGENTS" >/dev/null 2>&1 \
  && echo "TC-08 PASS" || echo "TC-08 FAIL"
```

### TC-09 topic-map.md への参照追加（AC-6）

```bash
TOPIC_MAP=".claude/skills/aiworkflow-requirements/indexes/topic-map.md"
grep -qF "logs-archive-policy" "$TOPIC_MAP" \
  && echo "TC-09 PASS" || echo "TC-09 FAIL"
```

### TC-10 判定タイミングの明示（F-003 / AC-4）

```bash
grep -qE "(月初|月末)" "$POLICY" && echo "TC-10 PASS" || echo "TC-10 FAIL"
```

### TC-11 最終更新日・次回見直し日（F-004 / AC-4）

```bash
grep -qE "最終更新日.*2026-04-19" "$POLICY" && \
grep -qE "次回見直し日.*2026-10-19" "$POLICY" && \
  echo "TC-11 PASS" || echo "TC-11 FAIL"
```

### TC-12 エスカレーションフロー（F-005 / AC-4）

```bash
grep -qE "(エスカレーション|ポリシー違反)" "$POLICY" \
  && echo "TC-12 PASS" || echo "TC-12 FAIL"
```

## 3. F-002 mirror sync 実測検証（references/ 配下対応確認）

```bash
# 実測 A: .agents/skills/aiworkflow-requirements/references/ ディレクトリ存在確認
ls -d .agents/skills/aiworkflow-requirements/references/ 2>/dev/null \
  && echo "SYNC PATH OK" \
  || echo "SYNC PATH MISSING"

# 実測 B: 既存 references/ 配下のファイル数が正本と一致するか
CLAUDE_COUNT=$(ls .claude/skills/aiworkflow-requirements/references/ 2>/dev/null | wc -l)
AGENTS_COUNT=$(ls .agents/skills/aiworkflow-requirements/references/ 2>/dev/null | wc -l)
echo "claude=$CLAUDE_COUNT agents=$AGENTS_COUNT"
```

**判定方針**:

- SYNC PATH OK かつ既存ファイル数が一致 → sync 機構は references/ を対象としている → Phase 5 で `.claude/` 側のみ執筆すれば良い
- 逆の場合 → Phase 5 で手動コピー手順を文書化し両ポリシーファイルを明示的に作成する

## 4. 既存 logs-archive-\*.md 命名衝突事前チェック

```bash
ls .claude/skills/task-specification-creator/references/logs-archive-*.md 2>/dev/null \
  | while read f; do
      base=$(basename "$f")
      if [[ "$base" =~ ^logs-archive-[0-9]{4}-(0[1-9]|1[0-2])\.md$ ]]; then
        echo "NEW FORMAT: $base"
      else
        echo "LEGACY: $base"
      fi
    done
# 期待: feb/march は LEGACY 判定（衝突なし）
```

## 5. 統合実行スクリプト

Phase 5 実装後に下記を一括実行。

```bash
POLICY=".claude/skills/aiworkflow-requirements/references/logs-archive-policy.md"
AGENTS=".agents/skills/aiworkflow-requirements/references/logs-archive-policy.md"
TOPIC_MAP=".claude/skills/aiworkflow-requirements/indexes/topic-map.md"

# TC-01〜TC-12 を順次実行（上記ブロックを連結）
# 全 PASS で Phase 5 Green 条件を満たす
```

## 6. AC 対応表（完全一覧）

| AC   | 対応 TC               | 内容                                   |
| ---- | --------------------- | -------------------------------------- |
| AC-1 | TC-01                 | 必須 6 セクション                      |
| AC-2 | TC-02 / TC-03 / TC-05 | 閾値 / 命名規則 / 正規表現             |
| AC-3 | TC-04                 | 手順 6 ステップ                        |
| AC-4 | TC-06 / TC-10-12      | F-001, F-003, F-004, F-005 文書記述    |
| AC-5 | TC-07 / TC-08         | mirror 存在 + diff=0（F-002）          |
| AC-6 | TC-09                 | topic-map.md 参照追加                  |
| AC-7 | 本 Phase 冒頭         | Red 状態事前確認（Phase 5 実装前）完了 |

## 7. 完了条件（チェック）

- [x] TC-01〜TC-12 全検証スクリプトが記述されている
- [x] F-001（TC-06）/ F-002（TC-07/TC-08）/ F-003（TC-10）/ F-004（TC-11）/ F-005（TC-12）が対応付けされている
- [x] Phase 5 実装前の Red 状態確認済
- [x] 既存 legacy 表記との共存判定手順あり
- [x] F-002 用の mirror sync 実測手順あり

## 8. Phase 5 引き継ぎ

- Phase 5 執筆完了直後に本スクリプト群を一括実行、全 PASS を Green 条件とする
- TC-07/TC-08 FAIL 時は手動コピーを実施し、Phase 5 成果物にフォールバック履歴を記載
- F-001, F-003, F-004, F-005 は Phase 5 ポリシー文書本文で反映する

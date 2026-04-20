# Phase 11 手動テスト結果記録

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 |
| Phase      | 11                                        |
| 実行日     | 2026-04-20                                |
| 実行者     | Claude Code（claude-sonnet-4-6）          |
| ステータス | PASS（全シナリオ完了）                    |

---

## NON_VISUAL 判定の根拠

本タスク（UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001）は以下の理由により NON_VISUAL タスクと判定する。

- 成果物はすべて CLI スクリプト（`validate-closeout-parity.js` 等）および Markdown ドキュメント
- Electron / Next.js などの UI コンポーネントに一切変更なし
- ユーザー向けの画面レイアウト・スタイル・インタラクションの変更なし
- 検証対象はコマンドの stdout / stderr / exit code のみ

よって Phase 11 スクリーンショットは不要（視覚証跡セクション参照）。

---

## 実行結果サマリ

| 区分  | 件数 |
| ----- | ---- |
| 合計  | 7    |
| PASS  | 7    |
| FAIL  | 0    |
| BLOCK | 0    |

---

## シナリオ別結果

### シナリオ 1: 正常系（PARITY_OK / AC-1）

**コマンド:**

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow ".claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/normal"
echo "exit=$?"
```

**stdout:**

```
[validate-closeout-parity] 検証開始: .claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/normal
[validate-closeout-parity] 結果: PARITY_OK
PARITY_OK: 全ソース一致
exit=0
```

| 項目   | 期待値                     | 実測値                    | 判定 |
| ------ | -------------------------- | ------------------------- | ---- |
| stdout | PARITY_OK を含むメッセージ | `PARITY_OK: 全ソース一致` | PASS |
| exit   | 0                          | 0                         | PASS |

---

### シナリオ 2: drift 検出（PARITY_DRIFT / AC-1, AC-2）

**コマンド:**

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow ".claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/partial-drift-s1" --json
echo "exit=$?"
```

**stdout:**

```
[validate-closeout-parity] 検証開始: ...
[validate-closeout-parity] 結果: PARITY_DRIFT
{
  "result": "PARITY_DRIFT",
  "phases": {
    "1": {
      "canonical": "completed",
      "s1": "pending",
      "s2": "completed",
      "s3": "completed",
      "s4": "completed",
      "drifts": [
        {
          "source": "S1",
          "expected": "completed",
          "actual": "pending"
        }
      ]
    }
  },
  "drifts": [
    {
      "phase": 1,
      "source": "S1",
      "expected": "completed",
      "actual": "pending"
    }
  ],
  "sourcesChecked": ["S1","S2","S3","S4"],
  "generatedAt": "2026-04-20T02:34:23.471Z"
}
exit=1
```

| 項目              | 期待値       | 実測値                       | 判定 |
| ----------------- | ------------ | ---------------------------- | ---- |
| exit              | 1            | 1                            | PASS |
| code              | PARITY_DRIFT | `"result": "PARITY_DRIFT"`   | PASS |
| drifts[].phase    | 存在すること | `"phase": 1`                 | PASS |
| drifts[].source   | 存在すること | `"source": "S1"`             | PASS |
| drifts[].expected | 存在すること | `"expected": "completed"`    | PASS |
| generatedAt       | ISO8601 形式 | `"2026-04-20T02:34:23.471Z"` | PASS |

---

### シナリオ 3: 欠損検出（MISSING_SOURCE / AC-1）

**コマンド:**

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow ".claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/missing-s2" --json
echo "exit=$?"
```

**stdout:**

```
[validate-closeout-parity] 検証開始: ...
[validate-closeout-parity] 結果: MISSING_SOURCE
{
  "result": "MISSING_SOURCE",
  "phases": {},
  "drifts": [],
  "sourcesChecked": ["S2"],
  "generatedAt": "2026-04-20T02:34:29.988Z"
}
exit=2
```

| 項目 | 期待値         | 実測値                       | 判定 |
| ---- | -------------- | ---------------------------- | ---- |
| exit | 2              | 2                            | PASS |
| code | MISSING_SOURCE | `"result": "MISSING_SOURCE"` | PASS |

---

### シナリオ 4: 不正値検出（INVALID_STATUS_VALUE / AC-1）

**コマンド:**

```bash
node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js \
  --workflow ".claude/skills/task-specification-creator/scripts/__tests__/fixtures/closeout-parity/invalid-status" --json
echo "exit=$?"
```

**stdout:**

```
[validate-closeout-parity] 検証開始: ...
[validate-closeout-parity] 結果: INVALID_STATUS_VALUE
{
  "result": "INVALID_STATUS_VALUE",
  "phases": {},
  "drifts": [],
  "sourcesChecked": ["S1","S2","S3","S4"],
  "generatedAt": "2026-04-20T02:34:33.929Z"
}
exit=3
```

| 項目 | 期待値               | 実測値                             | 判定 |
| ---- | -------------------- | ---------------------------------- | ---- |
| exit | 3                    | 3                                  | PASS |
| code | INVALID_STATUS_VALUE | `"result": "INVALID_STATUS_VALUE"` | PASS |

---

### シナリオ 5: checklist 確認（AC-5）

**コマンド:**

```bash
grep -n "validate-closeout-parity\|PARITY_OK\|PARITY_DRIFT" \
  .claude/skills/task-specification-creator/references/phase-12-completion-checklist.md | head -10
```

**stdout:**

```
12:- [ ] 【初手チェック】`node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js --workflow <workflow-path>` が PASS（code=PARITY_OK / exit=0）であることを確認した
87:- [ ] `node .claude/skills/task-specification-creator/scripts/validate-closeout-parity.js --workflow <workflow-path> --json` で `code=PARITY_OK` を確認した
88:- [ ] PARITY_DRIFT が検出された状態で Phase 12 PASS にしない（parity validator を最低1回実行し最終実行でPARITY_OKを記録した）
```

| 項目                     | 期待値               | 実測値           | 判定 |
| ------------------------ | -------------------- | ---------------- | ---- |
| validate-closeout-parity | checklist に記載あり | 行 12, 87 に記載 | PASS |
| PARITY_OK                | checklist に記載あり | 行 12, 87 に記載 | PASS |
| PARITY_DRIFT             | checklist に記載あり | 行 88 に記載     | PASS |

---

### シナリオ 6: 既存完了 workflow 非変更確認（AC-7）

**コマンド:**

```bash
git status --porcelain docs/30-workflows/completed-tasks/ 2>/dev/null | head -5
echo "completed-tasks 変更件数: $(git status --porcelain docs/30-workflows/completed-tasks/ 2>/dev/null | wc -l | tr -d ' ')"
```

**stdout:**

```
completed-tasks 変更件数: 0
```

| 項目                 | 期待値           | 実測値 | 判定 |
| -------------------- | ---------------- | ------ | ---- |
| completed-tasks 変更 | 0 件（遡及なし） | 0 件   | PASS |

---

### シナリオ 7: verify-all-specs.js 統合確認（AC-3）

**コマンド:**

```bash
node .claude/skills/task-specification-creator/scripts/verify-all-specs.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 2>&1 | tail -10
echo "exit=$?"
```

**stdout:**

```
検証レポートを出力しました: docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001/outputs/verification-report.md

=== 検証結果サマリー ===
Phase数: 13/13
エラー: 0
警告: 14
結果: ✅ PASS
exit=0
```

| 項目    | 期待値 | 実測値 | 判定 |
| ------- | ------ | ------ | ---- |
| exit    | 0      | 0      | PASS |
| Phase数 | 13/13  | 13/13  | PASS |
| エラー  | 0      | 0      | PASS |
| 結果    | PASS   | PASS   | PASS |

---

## 3層評価

| 評価軸   | 判定 | 備考                                                |
| -------- | ---- | --------------------------------------------------- |
| Semantic | PASS | 全シナリオで期待 exit code・JSON スキーマを確認     |
| Visual   | N/A  | NON_VISUAL タスク。UI/UX 変更なし                   |
| AI UX    | PASS | エラーメッセージが人間可読、JSON 出力スキーマが一貫 |

---

## 視覚証跡セクション

**UI/UX 変更なしのため Phase 11 スクリーンショット不要**

本タスクは CLI スクリプト（`validate-closeout-parity.js`）の追加のみであり、
Electron / Next.js UI への変更はない。したがって視覚的スクリーンショットの取得対象がなく、
NON_VISUAL タスクとして Phase 11 のスクリーンショットは省略する。

---

## 所見

- 全 7 シナリオが期待どおりに動作し、PASS 判定
- `validate-closeout-parity.js` の exit code 体系（0/1/2/3）が一貫して実装されている
- JSON 出力に `result`、`drifts[]`、`sourcesChecked`、`generatedAt`（ISO8601）が揃っている
- `verify-all-specs.js` が Phase 13 フル構成で PASS（エラー 0、警告 14 は既知）
- `completed-tasks/` への遡及変更がないことを確認済み
- HIGH 問題なし

---

## 次ステップ

- [x] 全シナリオ PASS のため Phase 12 へ進行
- [x] 発見事項なし（`discovered-issues.md` への転記不要）

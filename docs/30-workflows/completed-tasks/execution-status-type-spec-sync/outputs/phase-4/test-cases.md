# Phase 4: テストケース設計書

## メタ情報

- タスク: SkillExecutionStatus 型仕様書同期
- Phase: 4（テスト作成）
- 作成日: 2026-03-20
- テスト種別: 検証コマンド（仕様書同期タスクのため）

## テストケース一覧

### T4-1: interfaces-agent-sdk-integration.md の SkillExecutionStatus テーブル 9値存在確認

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| ID       | T4-1                                                                                    |
| 目的     | SkillExecutionStatus テーブルが9値（6既存 + 3新規）を含むこと                           |
| 対象     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` |
| 前提条件 | Phase 5 実装完了後                                                                      |

**実行コマンド:**

```bash
grep -c "review\|improve_ready\|reuse_ready\|idle\|running\|permission_pending\|completed\|cancelled\|error" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md
```

**期待結果:** 9以上

**判定基準:**

- PASS: 出力値 >= 9（9値が全て SkillExecutionStatus テーブル内に存在）
- FAIL: 出力値 < 9（一部の値が欠落）

**補足:** grep -c は行数カウントのため、1行に複数値が含まれる場合は9未満になる可能性がある。その場合は以下の補助コマンドで個別確認:

```bash
for val in idle running permission_pending completed cancelled error review improve_ready reuse_ready; do
  echo -n "$val: "
  grep -c "$val" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md
done
```

各値の出力が 1以上であること。

---

### T4-2: arch-state-management-core.md に配置ルールセクション存在確認

| 項目     | 内容                                                                              |
| -------- | --------------------------------------------------------------------------------- |
| ID       | T4-2                                                                              |
| 目的     | arch-state-management-core.md に拡張状態の配置ルールが追記されること              |
| 対象     | `.claude/skills/aiworkflow-requirements/references/arch-state-management-core.md` |
| 前提条件 | Phase 5 実装完了後                                                                |

**実行コマンド:**

```bash
grep -c "SkillExecutionStatus 拡張状態" .claude/skills/aiworkflow-requirements/references/arch-state-management-core.md
```

**期待結果:** 1以上

**判定基準:**

- PASS: 出力値 >= 1（セクションが存在）
- FAIL: 出力値 == 0（セクションが未追加）

**補足:** 現時点では arch-state-management-core.md に SkillExecutionStatus の記載は存在しない（grep結果: 0件）。Phase 5 で新規追加が必要。

---

### T4-3: 遷移条件テーブル存在確認

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| ID       | T4-3                                                                                    |
| 目的     | SkillExecutionStatus の状態遷移条件テーブルが定義されていること                         |
| 対象     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` |
| 前提条件 | Phase 5 実装完了後                                                                      |

**実行コマンド:**

```bash
grep -c "遷移元\|遷移先" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md
```

**期待結果:** 2以上（テーブルヘッダー行 + データ行）

**判定基準:**

- PASS: 出力値 >= 2（遷移条件テーブルのヘッダーとデータが存在）
- FAIL: 出力値 < 2（遷移条件テーブルが未定義または不完全）

**補助コマンド（テーブル構造確認）:**

```bash
grep -n "遷移元\|遷移先\|遷移条件" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md
```

遷移元・遷移先・遷移条件の3列がテーブルに含まれていること。

---

### T4-4: 古い6値テーブルが残存していないことの確認

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| ID       | T4-4                                                                                    |
| 目的     | SkillExecutionStatus テーブルが9値に拡張され、古い6値のみのテーブルが残存していないこと |
| 対象     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` |
| 前提条件 | Phase 5 実装完了後                                                                      |

**実行コマンド:**

```bash
# SkillExecutionStatus セクションから次のセクションまでを抽出し、行数を確認
sed -n '/#### SkillExecutionStatus/,/^####\|^###/p' .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md | grep '|' | grep -v '---' | wc -l
```

**期待結果:** 10以上（ヘッダー行1 + 9値のデータ行）

**判定基準:**

- PASS: テーブル行数 >= 10（ヘッダー + 9値）
- FAIL: テーブル行数 == 7（ヘッダー + 旧6値のまま）

**補助コマンド（新規3値の存在確認）:**

```bash
grep -E "review|improve_ready|reuse_ready" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md
```

3行全てが出力されること。

---

### T4-5: topic-map.md 再生成確認

| 項目     | 内容                                                               |
| -------- | ------------------------------------------------------------------ |
| ID       | T4-5                                                               |
| 目的     | インデックス再生成スクリプトが正常終了すること                     |
| 対象     | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js` |
| 前提条件 | Phase 5 実装完了後                                                 |

**実行コマンド:**

```bash
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260320-140156-wt-4 && node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**期待結果:** 正常終了（exit code 0）、`indexes/topic-map.md` と `indexes/keywords.json` が更新される

**判定基準:**

- PASS: スクリプトが正常終了し、出力に「インデックス生成完了」が含まれる
- FAIL: スクリプトがエラーで終了、または出力ファイルが生成されない

**補助コマンド（生成ファイル確認）:**

```bash
ls -la .claude/skills/aiworkflow-requirements/indexes/topic-map.md .claude/skills/aiworkflow-requirements/indexes/keywords.json
```

両ファイルのタイムスタンプが実行後に更新されていること。

---

### T4-6: P65 照合テスト（blocked 時のみ適用）

| 項目     | 内容                                                                                    |
| -------- | --------------------------------------------------------------------------------------- |
| ID       | T4-6                                                                                    |
| 目的     | Task12 Phase 5 が未完了で blocked の場合、P65 注記が付記されていること                  |
| 対象     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md` |
| 前提条件 | Task12 Phase 5 が blocked 状態の場合のみ実行                                            |

**実行コマンド:**

```bash
grep -c "P65注記\|Task12 Phase 5 完了後" .claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-integration.md
```

**期待結果:** 1以上（blocked 時）

**判定基準:**

- PASS（blocked 時）: 出力値 >= 1（注記が存在）
- PASS（非 blocked 時）: このテストはスキップ。9値が直接反映されている場合、注記は不要
- FAIL: blocked 状態にも関わらず注記が存在しない

**適用条件:** Task12（SkillExecutionStatus 型定義の実コード変更タスク）の Phase 5 が未完了の場合にのみ適用。完了済みの場合は T4-1 で9値の直接確認を行う。

---

### T4-7: grep 全参照箇所の整合性

| 項目     | 内容                                                                       |
| -------- | -------------------------------------------------------------------------- |
| ID       | T4-7                                                                       |
| 目的     | references/ 配下の全 SkillExecutionStatus 参照箇所が最新定義と整合すること |
| 対象     | `.claude/skills/aiworkflow-requirements/references/` 全体                  |
| 前提条件 | Phase 5 実装完了後                                                         |

**実行コマンド:**

```bash
grep -rn "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/ | grep -v "task-workflow-completed\|lessons-learned" | wc -l
```

**期待結果:** Phase 5 更新後の参照箇所数を記録（ベースライン確立）

**判定基準:**

- PASS: 全参照箇所が9値定義と矛盾しない（古い6値のみを前提とした記述が残存しない）
- FAIL: 古い6値テーブルを参照している箇所が残存する

**補助コマンド（詳細確認）:**

```bash
# 参照箇所の一覧表示
grep -rn "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/ | grep -v "task-workflow-completed\|lessons-learned"
```

```bash
# 各参照ファイルで新規3値への言及があるか確認
for file in $(grep -rl "SkillExecutionStatus" .claude/skills/aiworkflow-requirements/references/ | grep -v "task-workflow-completed\|lessons-learned"); do
  echo "=== $file ==="
  grep -n "review\|improve_ready\|reuse_ready" "$file" || echo "(新規値の言及なし - 要確認)"
done
```

**判定の詳細:**

- 型定義の正本（interfaces-agent-sdk-integration.md）: 9値全てが必須
- 状態管理仕様（arch-state-management-core.md）: 配置ルールセクションが必須
- UI仕様（ui-ux-feature-\*.md）: 新規3値の表示仕様が記載されていること（Phase 5 スコープに含まれる場合）
- その他の参照箇所: 6値前提の記述が残存しないこと

---

## テスト実行順序

| 順序 | テストID | 依存関係                   |
| ---- | -------- | -------------------------- |
| 1    | T4-5     | なし（スクリプト動作確認） |
| 2    | T4-1     | Phase 5 完了後             |
| 3    | T4-4     | T4-1 PASS 後               |
| 4    | T4-2     | Phase 5 完了後             |
| 5    | T4-3     | Phase 5 完了後             |
| 6    | T4-6     | blocked 判定後（条件付き） |
| 7    | T4-7     | T4-1 〜 T4-4 全 PASS 後    |

## 合格基準

- T4-1 〜 T4-5, T4-7: 全て PASS
- T4-6: blocked 時のみ PASS 必須、非 blocked 時はスキップ
- 全テスト PASS をもって Phase 4 完了とする

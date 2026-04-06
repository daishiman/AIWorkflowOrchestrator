# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 10                                          |
| 名称       | 最終レビューゲート                          |
| タスクID   | TASK-P0-09                                  |
| ステータス | 未実施                                      |
| 依存       | Phase 9 完了                                |
| 完了条件   | レビュー判定が PASS または MINOR であること |

---

## 目的

Phase 1〜9 の全成果物を最終レビューし、Phase 11（手動テスト）へ進む可否を判定する。
受入条件（AC-1〜AC-5）との整合を全て確認する。

---

## レビュー観点

### RFV-01: 受入条件の達成確認

| 受入条件                           | 判定基準                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| AC-1: 全 phase policy の完備       | MAJOR: 未定義 phase がある / 全 phase で DESTRUCTIVE_TOOLS が拒否されない             |
| AC-2: lifecycle hooks の実装       | MAJOR: 4 hooks のいずれかが未実装                                                     |
| AC-3: audit sink の in-memory 実装 | MAJOR: ring buffer が機能しない / 必須メソッドが未実装                                |
| AC-4: Facade 手前での正規化        | MAJOR: plan/execute/verify/improve のいずれかで hooks が未呼び出し                    |
| AC-5: 品質要件                     | MAJOR: テスト FAIL / typecheck エラー / lint エラー / AuditSink branch coverage < 80% |

### RFV-02: Phase 3 の設計レビューとの整合

| 確認項目                                    | 判定基準                        |
| ------------------------------------------- | ------------------------------- |
| 設計書通りに実装されている                  | MAJOR: 設計と実装が乖離している |
| Phase 3 の MINOR 指摘が未タスク化されている | MINOR: 未タスク化が漏れている   |

### RFV-03: P0-09 と U1 の責務境界

| 確認項目                                                          | 判定基準                         |
| ----------------------------------------------------------------- | -------------------------------- |
| `_input` 未使用に U1 carry-forward コメントが付いている           | MINOR: コメントなし              |
| TASK-P0-09-U1 サブタスクの前提条件が整っている                    | MINOR: 前提条件の記録なし        |
| P0-09 本体がスコープを超えていない（U1 の実配線を実装していない） | MAJOR: U1 の責務を取り込んでいる |

### RFV-04: テスト・カバレッジの充足

| 確認項目                                              | 判定基準            |
| ----------------------------------------------------- | ------------------- |
| TC-PP / TC-HF / TC-AS / TC-FG の全テストが PASS       | MAJOR: FAIL がある  |
| fail path / edge case テストが含まれている            | MINOR: 不足している |
| `SkillCreatorAuditSink` の branch coverage が 80%以上 | MAJOR: 80% 未満     |

### RFV-05: ドキュメント・コメントの品質

| 確認項目                                                                           | 判定基準          |
| ---------------------------------------------------------------------------------- | ----------------- |
| 必須コメント（U1 carry-forward / セキュリティ判断 / 将来スコープ）が記載されている | MINOR: 一部未記載 |
| 変更ファイル一覧が Phase 2 成果物として存在する                                    | MINOR: 未作成     |

---

## 判定基準

| 判定     | 条件                              | 次のアクション                        |
| -------- | --------------------------------- | ------------------------------------- |
| PASS     | MAJOR 指摘が 0 件                 | Phase 11 へ進む                       |
| MINOR    | MAJOR 0 件・MINOR 指摘が 5 件以下 | Phase 11 へ進む（MINOR は未タスク化） |
| MAJOR    | MAJOR 指摘が 1 件以上             | 指摘内容により Phase 5/4/2/1 へ戻る   |
| CRITICAL | 根本的な設計問題                  | Phase 1 へ戻る                        |

---

## 実行タスク

### T-10-1: 最終レビューの実施

上記 RFV-01〜RFV-05 の全観点でレビューを実施する。

```bash
# 最終確認コマンド
pnpm --filter @repo/desktop test -- --run
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
```

**完了条件**:

- [ ] RFV-01〜RFV-05 の全観点でレビューが実施されている

### T-10-2: レビュー結果の記録と判定

```bash
# MINOR 指摘の未タスク化
node .claude/skills/task-specification-creator/scripts/detect-unassigned-tasks.js \
  --scan apps/desktop/src/main/services/runtime/governance \
  --output outputs/phase-10/unassigned-candidates.json
```

**完了条件**:

- [ ] 判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR 指摘が未タスク化されている（ある場合）
- [ ] Phase 11 進行の可否が明記されている

---

## 参照資料

- `phase-9-quality-assurance.md`
- `.claude/skills/task-specification-creator/references/spec-update-validation-matrix.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md`

---

## 成果物

| 成果物名         | パス                                      | 必須 |
| ---------------- | ----------------------------------------- | ---- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | ✅   |

---

## 完了条件チェックリスト

- [ ] RFV-01〜RFV-05 の全観点でレビューが実施されている
- [ ] 受入条件 AC-1〜AC-5 が全て達成されていることが確認されている
- [ ] 判定が PASS または MINOR である
- [ ] MINOR 指摘が未タスク化されている
- [ ] `outputs/phase-10/final-review-result.md` が作成されている

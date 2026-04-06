# Phase 11: 手動テスト - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 11                              |
| Phase名    | 手動テスト                      |
| 前提Phase  | Phase 10                        |
| 後続Phase  | Phase 12                        |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

Phase 4 で定義したテストケース（TC-001〜TC-008）を手動で実施し、全ての変更が期待どおりに反映されていることを確認する。

---

## 実行タスク

### タスク1: TC-001〜TC-005 の目視確認

**目的**: 各ファイルへのラベル付与・責務分離セクション追記を目視で確認する

**実行手順**:

1. **TC-001: `task-workflow.md` インデックステーブル確認**
   - `.claude/skills/aiworkflow-requirements/references/task-workflow.md` を読む
   - インデックステーブルに「区分」列が存在し、全エントリに「正本」「履歴」「契約仕様」いずれかの値が設定されていることを確認する
   - 判定: PASS / FAIL

2. **TC-002: `task-workflow-completed.md` 冒頭確認**
   - `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` の冒頭5行を読む
   - `> 区分: 履歴記録（history record）` が含まれていることを確認する
   - 判定: PASS / FAIL

3. **TC-003: `task-workflow-active.md` 冒頭確認**
   - `.claude/skills/aiworkflow-requirements/references/task-workflow-active.md` の冒頭5行を読む
   - `> 区分: 正本（current contract）` が含まれていることを確認する
   - 判定: PASS / FAIL

4. **TC-004: `interfaces-skill-verify-contract.md` 概要確認**
   - `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` の概要セクションを読む
   - `> 区分: 契約仕様（current contract / Check ID 体系）` が含まれていることを確認する
   - 判定: PASS / FAIL

5. **TC-005: 責務分離セクション比較表確認**
   - 責務分離セクションを追記したファイルを読む
   - `verifySkill()` / `verifyAndImproveLoop()` / `verify()` の3関数が表に記載されていることを確認する
   - 各行に「実装ファイル」「責務」「返却値」が正確に記載されていることを確認する
   - 判定: PASS / FAIL

**期待される成果物**:

- TC-001〜TC-005 確認レポート（`outputs/phase-11/manual-test-tc01-05.md`）

---

### タスク2: TC-006〜TC-008 の確認

**目的**: リンク有効性・Prettier・Check ID を最終確認する

**実行手順**:

1. **TC-006: リンク有効性確認**

```bash
ls .claude/skills/aiworkflow-requirements/references/task-workflow-active.md && echo "PASS" || echo "FAIL"
ls .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md && echo "PASS" || echo "FAIL"
ls .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md && echo "PASS" || echo "FAIL"
```

2. **TC-007: Prettier フォーマット確認**

```bash
pnpm prettier --check \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
```

3. **TC-008: Check ID 数確認**

```bash
grep -c "^| L[1-4]-[0-9]" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
# 期待値: 19
```

**期待される成果物**:

- TC-006〜TC-008 確認レポート（`outputs/phase-11/manual-test-tc06-08.md`）

---

### タスク3: 手動テスト結果サマリーの作成

**目的**: TC-001〜TC-008 の結果を総括し、Phase 12 への引き継ぎ事項をまとめる

**実行手順**:

1. TC-001〜TC-008 の PASS/FAIL 結果を一覧にまとめる
2. FAIL があれば原因と修正内容を記録する
3. Phase 12 への引き継ぎ事項（特記事項）をまとめる

**テスト結果サマリーテンプレート**:

| TC ID  | テスト内容                                 | 結果   | 備考 |
| ------ | ------------------------------------------ | ------ | ---- |
| TC-001 | task-workflow.md インデックス「区分」列    | 未実施 |      |
| TC-002 | task-workflow-completed.md ラベル          | 未実施 |      |
| TC-003 | task-workflow-active.md ラベル             | 未実施 |      |
| TC-004 | interfaces-skill-verify-contract.md ラベル | 未実施 |      |
| TC-005 | 責務分離比較表                             | 未実施 |      |
| TC-006 | リンク有効性                               | 未実施 |      |
| TC-007 | Prettier フォーマット                      | 未実施 |      |
| TC-008 | Check ID 数（19件）                        | 未実施 |      |

**期待される成果物**:

- 手動テスト結果サマリー（`outputs/phase-11/manual-test-report.md`）

---

## 参照資料

| 参照資料         | パス                                        | 内容                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| テストケース一覧 | `outputs/phase-4/test-cases.md`             | TC-001〜TC-008 の定義  |
| 検証手順書       | `outputs/phase-4/verification-procedure.md` | 手動確認の具体的な手順 |

---

## 成果物

| 成果物                      | パス                                      | 内容                   |
| --------------------------- | ----------------------------------------- | ---------------------- |
| TC-001〜TC-005 確認レポート | `outputs/phase-11/manual-test-tc01-05.md` | 目視確認結果           |
| TC-006〜TC-008 確認レポート | `outputs/phase-11/manual-test-tc06-08.md` | コマンド確認結果       |
| 手動テスト結果サマリー      | `outputs/phase-11/manual-test-report.md`  | 全TC の PASS/FAIL 総括 |

---

## 完了条件

- [ ] TC-001〜TC-008 が全て PASS である
- [ ] FAIL があった場合は修正が完了し、再確認が PASS である
- [ ] 手動テスト結果サマリーが作成されている
- [ ] `outputs/phase-11/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 10（最終レビューゲート）が PASS であること
- **後続**: Phase 12（ドキュメント更新）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-12-documentation.md`

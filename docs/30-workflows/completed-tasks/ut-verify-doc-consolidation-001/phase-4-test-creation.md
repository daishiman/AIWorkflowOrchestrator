# Phase 4: 検証計画作成 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 4                               |
| Phase名    | 検証計画作成                    |
| 前提Phase  | Phase 3                         |
| 後続Phase  | Phase 5                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

本タスクはドキュメント更新専用のため、コードテストではなく**目視確認ベースの検証計画**を作成する。Phase 11 の手動テストで使用するテストケース一覧を定義し、各 AC の検証手順を明確化する。

---

## 実行タスク

### タスク1: テストケース一覧の作成

**目的**: 受け入れ基準（AC-001〜AC-006）に対応する目視確認テストケースを定義する

**実行手順**:

1. Phase 1 で確定した AC 一覧を参照する
2. 各 AC に対して以下の形式でテストケースを定義する

**テストケース一覧（設計）**:

| TC ID  | 対応 AC | テスト内容                                               | 確認方法                                                 | 期待結果                                                                               |
| ------ | ------- | -------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-001 | AC-001  | `task-workflow.md` インデックステーブルの列構成確認      | ファイル冒頭〜インデックスを目視                         | 「区分」列が存在し全エントリに値が設定されている                                       |
| TC-002 | AC-002  | `task-workflow-completed.md` 冒頭5行確認                 | ファイル冒頭を目視                                       | `> 区分: 履歴記録（history record）` が含まれている                                    |
| TC-003 | AC-003  | `task-workflow-active.md` 冒頭5行確認                    | ファイル冒頭を目視                                       | `> 区分: 正本（current contract）` が含まれている                                      |
| TC-004 | AC-004  | `interfaces-skill-verify-contract.md` 概要セクション確認 | 概要セクションを目視                                     | `> 区分: 契約仕様（current contract）` が含まれている                                  |
| TC-005 | AC-005  | 責務分離比較表の内容確認                                 | 追記先ファイルを目視                                     | `verifySkill()`/`verifyAndImproveLoop()`/`verify()` の実装ファイル・責務・返却値が正確 |
| TC-006 | AC-006  | `task-workflow.md` 内のリンク有効性確認                  | リンク先ファイルのパス確認                               | 全リンクが有効なファイルを指している                                                   |
| TC-007 | NFR-003 | Prettier フォーマット確認                                | `pnpm prettier --check` 実行                             | 差分なし                                                                               |
| TC-008 | NFR-004 | Check ID 体系への影響確認                                | `interfaces-skill-verify-contract.md` の Check ID 数確認 | 19件のまま変化なし                                                                     |

3. 検証手順書をまとめる

**期待される成果物**:

- テストケース一覧（`outputs/phase-4/test-cases.md`）

---

### タスク2: 検証手順書の作成

**目的**: Phase 11 での手動確認を誰でも同じ手順で実施できるよう文書化する

**実行手順**:

1. TC-001〜TC-008 の具体的な実行手順を記述する
2. 確認コマンドを明記する（Prettier 確認など）
3. PASS/FAIL の判定基準を明確にする

**検証手順**:

```bash
# TC-007: Prettier フォーマット確認
pnpm prettier --check \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"

# TC-008: Check ID 数確認
grep -c "^| L[1-4]-[0-9]" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
# 期待値: 19
```

**期待される成果物**:

- 検証手順書（`outputs/phase-4/verification-procedure.md`）

---

## 参照資料

| 参照資料         | パス                                     | 内容                 |
| ---------------- | ---------------------------------------- | -------------------- |
| 要件確定レポート | `outputs/phase-1/requirements-report.md` | AC 一覧              |
| 変更計画書       | `outputs/phase-2/change-plan.md`         | 変更対象ファイル一覧 |

---

## 成果物

| 成果物           | パス                                        | 内容                   |
| ---------------- | ------------------------------------------- | ---------------------- |
| テストケース一覧 | `outputs/phase-4/test-cases.md`             | TC-001〜TC-008 の定義  |
| 検証手順書       | `outputs/phase-4/verification-procedure.md` | 手動確認の具体的な手順 |

---

## 完了条件

- [ ] TC-001〜TC-008 が全て定義されている
- [ ] 各 TC に期待結果が明記されている
- [ ] Prettier 確認コマンドが記載されている
- [ ] `outputs/phase-4/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が PASS であること
- **後続**: Phase 5（ドキュメント更新実施）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-5-implementation.md`

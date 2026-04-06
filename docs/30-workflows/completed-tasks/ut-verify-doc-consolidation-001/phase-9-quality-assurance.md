# Phase 9: 品質保証 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 9                               |
| Phase名    | 品質保証                        |
| 前提Phase  | Phase 8                         |
| 後続Phase  | Phase 10                        |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

変更済みドキュメントの品質チェックを実施し、Prettier フォーマット・リンク有効性・Check ID 体系への影響がないことを最終確認する。

---

## 実行タスク

### タスク1: Prettier フォーマット確認

**目的**: 変更した4ファイルが Prettier フォーマットに準拠しているか確認する

**実行手順**:

1. 以下のコマンドを実行し、差分がないことを確認する:

```bash
pnpm prettier --check \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
```

2. 差分が出た場合は以下で自動修正する:

```bash
pnpm prettier --write \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
```

3. 再度 `--check` を実行し、差分がなくなることを確認する

**期待される成果物**:

- Prettier 確認ログ（`outputs/phase-9/prettier-check-log.md`）

---

### タスク2: リンク有効性の最終確認

**目的**: `task-workflow.md` 内の全リンクが有効であることを最終確認する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/task-workflow.md` のインデックステーブルを読む
2. 各 `[ファイル名](ファイル名)` 形式のリンク先が実在するか確認する:

```bash
# リンク先ファイルの存在確認
ls .claude/skills/aiworkflow-requirements/references/task-workflow-active.md
ls .claude/skills/aiworkflow-requirements/references/task-workflow-completed.md
ls .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md
# その他 child companion も同様に確認
```

3. 存在しないファイルへのリンクがある場合は修正する

**期待される成果物**:

- リンク確認ログ（`outputs/phase-9/link-check-log.md`）

---

### タスク3: Check ID 体系への影響確認

**目的**: `interfaces-skill-verify-contract.md` の Check ID 数が 19 件のまま変化していないことを確認する

**実行手順**:

1. 以下のコマンドで Check ID の数を確認する:

```bash
grep -c "^| L[1-4]-[0-9]" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
# 期待値: 19
```

2. Layer 別の件数も確認する（Layer 1: 5, Layer 2: 7, Layer 3: 4, Layer 4: 3）:

```bash
grep "^| L1-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l
grep "^| L2-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l
grep "^| L3-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l
grep "^| L4-" ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md" | wc -l
```

**期待される成果物**:

- Check ID 確認ログ（`outputs/phase-9/check-id-verification-log.md`）

---

## 品質チェックリスト

### ドキュメント品質

- [ ] Prettier チェックが全ファイルで PASS している
- [ ] 全リンクが有効なファイルを指している
- [ ] Check ID が 19 件（Layer 1: 5 / Layer 2: 7 / Layer 3: 4 / Layer 4: 3）のまま変化していない

### 変更品質

- [ ] `> 区分:` ラベルが4ファイル全てに付与されている
- [ ] 責務分離セクションが正確に追記されている
- [ ] インデックステーブルに「区分」列が存在する

---

## 参照資料

| 参照資料                   | パス                                                                                    | 内容                  |
| -------------------------- | --------------------------------------------------------------------------------------- | --------------------- |
| verify 契約仕様            | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md` | Check ID 19件確認対象 |
| task-workflow インデックス | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`                    | リンク確認対象        |

---

## 成果物

| 成果物            | パス                                           | 内容                   |
| ----------------- | ---------------------------------------------- | ---------------------- |
| Prettier 確認ログ | `outputs/phase-9/prettier-check-log.md`        | フォーマット確認結果   |
| リンク確認ログ    | `outputs/phase-9/link-check-log.md`            | 全リンク有効性確認結果 |
| Check ID 確認ログ | `outputs/phase-9/check-id-verification-log.md` | Check ID 数の確認結果  |

---

## 完了条件

- [ ] Prettier チェックが全ファイルで PASS している
- [ ] 全リンクが有効であることが確認済み
- [ ] Check ID が 19 件のまま変化していない
- [ ] `outputs/phase-9/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 8（ドキュメント整合性改善）が完了していること
- **後続**: Phase 10（最終レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-10-final-review.md`

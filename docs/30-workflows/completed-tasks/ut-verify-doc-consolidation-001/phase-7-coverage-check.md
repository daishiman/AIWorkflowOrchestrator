# Phase 7: 変更網羅性確認 - UT-VERIFY-DOC-CONSOLIDATION-001

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 7                               |
| Phase名    | 変更網羅性確認                  |
| 前提Phase  | Phase 6                         |
| 後続Phase  | Phase 8                         |
| ステータス | 未実施                          |
| 作成日     | 2026-04-06                      |
| 機能名     | ut-verify-doc-consolidation-001 |

---

## 目的

Phase 5 で実施した変更が全ての要件（FR-001〜FR-005）を網羅しているかを確認し、変更漏れがないことを保証する。

---

## 実行タスク

### タスク1: FR 対応状況の確認

**目的**: 機能要件 FR-001〜FR-005 に対して変更が実施済みかをチェックする

**実行手順**:

1. Phase 1 で確定した FR 一覧と、Phase 5 での実施状況を照合する

**FR 対応状況チェックリスト**:

| FR ID  | 要件                                                                 | 対応状況 | 確認方法                                 |
| ------ | -------------------------------------------------------------------- | -------- | ---------------------------------------- |
| FR-001 | `task-workflow.md` インデックスに「区分」列追加                      | 未確認   | `task-workflow.md` のテーブルを目視確認  |
| FR-002 | `task-workflow-completed.md` 冒頭に `> 区分: 履歴記録` 追記          | 未確認   | ファイル冒頭5行を目視確認                |
| FR-003 | `task-workflow-active.md` 冒頭に `> 区分: 正本` 追記                 | 未確認   | ファイル冒頭5行を目視確認                |
| FR-004 | `interfaces-skill-verify-contract.md` 冒頭に `> 区分: 契約仕様` 追記 | 未確認   | ファイル概要セクションを目視確認         |
| FR-005 | verify エンジン責務分離セクション（3関数比較表）追記                 | 未確認   | 追記先ファイルの該当セクションを目視確認 |

2. 全ての FR が「対応済み」になるまで、未対応項目があれば Phase 5 に差し戻す

**期待される成果物**:

- FR 対応状況レポート（`outputs/phase-7/fr-coverage-report.md`）

---

### タスク2: NFR 対応状況の確認

**目的**: 非機能要件 NFR-001〜NFR-004 への対応状況を確認する

**実行手順**:

1. 以下の NFR 対応状況を確認する:

| NFR ID  | 要件                                      | 確認方法                                                   |
| ------- | ----------------------------------------- | ---------------------------------------------------------- |
| NFR-001 | 新規ファイルを作成していない              | `git status` で新規ファイルがないことを確認                |
| NFR-002 | 既存リンクを破損していない                | Phase 6 のリンク確認レポートを参照                         |
| NFR-003 | Prettier フォーマットに準拠している       | `pnpm prettier --check` で確認                             |
| NFR-004 | Check ID 体系（19件）に影響を与えていない | `interfaces-skill-verify-contract.md` の Check ID 数を確認 |

```bash
# NFR-001: 新規ファイル確認
git status --short | grep "^?" | grep -v "docs/30-workflows/ut-verify-doc-consolidation-001/"

# NFR-003: Prettier フォーマット確認
pnpm prettier --check \
  ".claude/skills/aiworkflow-requirements/references/task-workflow.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-completed.md" \
  ".claude/skills/aiworkflow-requirements/references/task-workflow-active.md" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"

# NFR-004: Check ID 数確認（期待値: 19）
grep -c "^| L[1-4]-[0-9]" \
  ".claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md"
```

**期待される成果物**:

- NFR 対応状況レポート（`outputs/phase-7/nfr-coverage-report.md`）

---

## 参照資料

| 参照資料         | パス                                     | 内容           |
| ---------------- | ---------------------------------------- | -------------- |
| FR 一覧          | `outputs/phase-1/requirements-report.md` | 機能要件の定義 |
| Phase 6 確認結果 | `outputs/phase-6/link-check-report.md`   | リンク確認結果 |

---

## 成果物

| 成果物               | パス                                     | 内容                            |
| -------------------- | ---------------------------------------- | ------------------------------- |
| FR 対応状況レポート  | `outputs/phase-7/fr-coverage-report.md`  | FR-001〜FR-005 の対応確認結果   |
| NFR 対応状況レポート | `outputs/phase-7/nfr-coverage-report.md` | NFR-001〜NFR-004 の対応確認結果 |

---

## 完了条件

- [ ] FR-001〜FR-005 が全て「対応済み」である
- [ ] NFR-001〜NFR-004 が全て「対応済み」である
- [ ] Prettier チェックが通っている
- [ ] Check ID が 19 件のまま変化していない
- [ ] `outputs/phase-7/` に成果物が生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 6（追加確認）が完了していること
- **後続**: Phase 8（ドキュメント整合性改善）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/ut-verify-doc-consolidation-001/phase-8-refactoring.md`

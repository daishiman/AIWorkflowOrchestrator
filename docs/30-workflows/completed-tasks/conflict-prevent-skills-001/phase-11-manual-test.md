# Phase 11: 手動テスト

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 11                          |
| 機能名 | conflict-prevent-skills-001 |
| 作成日 | 2026-04-18                  |

## 目的

本 task を docs-only / NON_VISUAL workflow としてウォークスルーし、仕様書の自己完結性、コマンド再現性、close-out 引継ぎ情報を確認する。

## 実行タスク

1. `manual-test-result.md` を docs-only evidence の正本として作成する
2. merge / regenerate / parity / driver registration の手順が再現可能か確認する
3. 発見事項を Blocker / Note / Info に分類する

## 参照資料

| 資料名            | パス                                                                             | 用途             |
| ----------------- | -------------------------------------------------------------------------------- | ---------------- |
| phase 11 template | `.agents/skills/task-specification-creator/references/phase-template-phase11.md` | docs-only ルール |
| final review      | `docs/30-workflows/conflict-prevent-skills-001/phase-10-final-review.md`         | 前提確認         |

## 実行手順

### ステップ1: docs-only 正本

- `outputs/phase-11/manual-test-result.md` を一次ソースにする
- `manual-test-checklist.md` と `discovered-issues.md` は補助成果物にする

### ステップ2: ウォークスルー項目

| 観点               | 確認内容                                                 |
| ------------------ | -------------------------------------------------------- |
| 自己完結性         | 13 phase だけで実装者が着手できるか                      |
| コマンド再現性     | validator、driver setup、regenerate の手順が矛盾しないか |
| canonical / mirror | `.claude` 正本と `.agents` mirror の説明が一貫するか     |
| close-out          | Phase 12 で更新すべき ledger / artifacts が明確か        |

## 統合テスト連携

- Phase 12 compliance-check へ `manual-test-result.md` を渡す

## 多角的チェック観点（AIが判断）

- 素人思考: 初見の実装者が手順を追えるか
- 因果関係分析: どの手順抜けが最も危険か
- KJ法: 発見事項を Blocker / Note / Info に束ねられるか

## サブタスク管理

| SubTask | 内容                  | 担当   |
| ------- | --------------------- | ------ |
| ST-21   | docs-only walkthrough | Lane C |

## 成果物

- `outputs/phase-11/manual-test-result.md`
- `outputs/phase-11/manual-test-checklist.md`
- `outputs/phase-11/discovered-issues.md`

## 完了条件

- [ ] `manual-test-result.md` を正本として扱っている
- [ ] docs-only / NON_VISUAL であることを明記した
- [ ] 発見事項を分類した

## タスク100%実行確認【必須】

- [ ] docs-only evidence ルールを反映した
- [ ] walkthrough 項目を記載した
- [ ] Phase 12 に正本成果物を渡すことを記載した

## 次Phase

Phase 12 では implementation guide、system-spec-update、documentation changelog、unassigned detection、skill feedback、compliance-check を作成する。

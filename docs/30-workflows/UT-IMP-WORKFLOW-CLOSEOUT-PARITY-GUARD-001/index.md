# UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                                                |
| ---------- | ------------------------------------------------------------------- |
| 機能名     | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001                           |
| タスクID   | UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001                           |
| 作成日     | 2026-04-19                                                          |
| ステータス | pending                                                             |
| 総Phase数  | 13                                                                  |
| タスク種別 | docs / NON_VISUAL                                                   |
| 関連Issue  | #2293 (CLOSED, 仕様書作成継続)                                      |
| 発見元     | UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 Phase 12 再監査 |
| 分類       | 改善（運用品質）                                                    |
| 優先度     | 高                                                                  |
| 規模       | 中                                                                  |

---

## タスク概要

Phase 12 close-out 時に `index.md` / root `artifacts.json` / `outputs/artifacts.json` の三者で status が drift する事故を、機械検証可能な parity guard として固定する。手動チェックから validator PASS/FAIL への昇格が本タスクの中核。

発見事象: 親タスク UT-LIFECYCLE-PANEL-AUTH-REGRESSION-SKIP-CLEANUP-001 の Phase 12 で、outputs 側が `completed` を主張していても root `index.md` / `artifacts.json` が `pending` のまま残り、完了判定の単一真実源（SSOT）が崩れた。

---

## 目的境界

| 含む                                                                                 | 含まない                           |
| ------------------------------------------------------------------------------------ | ---------------------------------- |
| 三者同期 parity validator の仕様定義                                                 | 本ガードの本実装（別タスクで執行） |
| close-out 手順の更新仕様（`complete-phase.js` / `generate-index.js`）                | 既存完了タスクの遡及修正           |
| `phase-12-completion-checklist.md` へのガード組込み仕様                              | workflow テンプレート刷新          |
| 両 skill（`task-specification-creator` / `aiworkflow-requirements`）への教訓反映仕様 | 新規 Phase 追加や Phase 定義の変更 |

> **本仕様書は「設計と実装指針」である**。実装コードは Phase 5 以降で別エージェント/別タスクが参照する。

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | completed  |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | completed  |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | completed  |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | completed  |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | completed  |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | completed  |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | completed  |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | completed  |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | completed  |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | completed  |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | completed  |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | completed  |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | pending    |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                       ↓
                    (MAJOR→戻り)                            (未達→戻り)
                         ↓                                       ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **三者同期 (本タスクの自己適用)**: `complete-phase.js` 実行後、`index.md` / `artifacts.json` / `outputs/artifacts.json` の status が一致することを確認（本タスク自身が parity guard の dogfooding）

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-IMP-WORKFLOW-CLOSEOUT-PARITY-GUARD-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 成果物サマリ

| Phase | 主要成果物                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------ |
| 1     | 要件定義書、受け入れ基準 AC-1〜AC-7、drift 観測の実測データ、三者 SSOT 構造の棚卸し                                      |
| 2     | parity 判定アルゴリズム設計、validator スクリプト配置設計、`complete-phase.js` 拡張設計、checklist ゲート設計            |
| 3     | 設計レビューゲート判定                                                                                                   |
| 4     | テスト仕様（正常系 / drift 系 / 境界系）、TDD Red 結果                                                                   |
| 5     | 実装サマリー、`validate-closeout-parity.js` 実装、`complete-phase.js` 拡張、`verify-all-specs.js` 組込み                 |
| 6     | 拡張テストケース（phase本文 frontmatter / 部分 drift / 同時更新競合）                                                    |
| 7     | カバレッジレポート、トレーサビリティマトリクス（AC → Test）                                                              |
| 8     | リファクタリング計画と結果                                                                                               |
| 9     | 品質保証レポート                                                                                                         |
| 10    | 最終レビュー結果、出荷準備チェック                                                                                       |
| 11    | 手動テスト結果（NON_VISUAL / CLI 動作確認）                                                                              |
| 12    | 実装ガイド（Part 1 中学生向け / Part 2 技術者向け）、両 skill feedback、phase-12-completion-checklist 反映、未タスク検出 |
| 13    | PR情報、ローカル確認結果、変更サマリー、PR作成結果                                                                       |

---

## 実装対象（設計上の想定 — 実装は Phase 5 で確定）

- `.claude/skills/task-specification-creator/scripts/validate-closeout-parity.js` — 新規 parity validator
- `.claude/skills/task-specification-creator/scripts/complete-phase.js` — 三者同値更新への拡張
- `.claude/skills/task-specification-creator/scripts/verify-all-specs.js` — parity guard の組込み
- `.claude/skills/task-specification-creator/references/phase-12-completion-checklist.md` — 機械検証ゲート追加
- `.claude/skills/task-specification-creator/references/patterns-phase12-sync.md` — パターン10 の自動化更新
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md` — current facts に parity guard を追加
- `.agents/` 配下のミラー

---

_このファイルは task-specification-creator skill フォーマットに従い生成されました。_
_最終更新: 2026-04-19_

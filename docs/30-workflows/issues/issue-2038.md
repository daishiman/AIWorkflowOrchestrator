# [#2038] [task-imp-layer12-check-id-script-006] check ID 突き合わせスクリプト化

## メタ情報

```yaml
task_id: task-imp-layer12-check-id-script-006
task_name: check ID 突き合わせスクリプト化
category: tooling（開発ツール・スクリプト）
target_feature: SkillCreatorVerificationEngine / FR-04 verify 契約
priority: 低
scale: 小
status: 未実施
source_phase: Phase 12（task-imp-layer12-spec-definition-004）
created_date: 2026-04-04
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-layer12-check-id-script-006/index.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小     |
| ステータス | 未実施 |

---

## 目的

`SkillCreatorVerificationEngine` の check ID（現在 19 件）と `interfaces-skill-verify-contract.md` の定義内容を自動突き合わせするスクリプトを作成する。将来 check ID が 30 件超に増加した際にも、例示値（`L2-008` 等）による誤検知なしに正確な整合性確認ができる状態を実現する。

## 実行方針

- Phase 1〜3 は調査・設計・レビューを直列で実施する。
- Phase 4〜5 はスクリプト作成（TDD Red→Green）を直列で実施する。
- Phase 6〜10 はテスト拡充・カバレッジ・品質確認を直列で実施する。
- Phase 11〜13 はドキュメント・PR 完了を直列で実施する。

## スコープ

### 含むもの

- check ID 突き合わせスクリプトの作成（`scripts/verify-check-id-parity.js` 等）
- テーブル行スコープの grep パターン設計（例示値を除外する設計）
- スクリプトのユニットテスト作成
- 実行手順のドキュメント整備

### 含まないもの

- check ID の追加・変更自体
- `SkillCreatorVerificationEngine.ts` 本体のコード変更
- Layer 5 以降の設計・実装

## 受け入れ基準

| ID   | 基準                                                                            | 検証方法             |
| ---- | ------------------------------------------------------------------------------- | -------------------- |
| AC-1 | スクリプト実行で実装の全 check ID と仕様書の全 check ID が突き合わされる        | script-run           |
| AC-2 | 仕様書の「拡張ガイドライン」セクション内の例示値（`L2-008` 等）が誤検知されない | script-run           |
| AC-3 | 差分が 0 件のとき PASS 出力、差分があるとき FAIL 出力と差分一覧が表示される     | script-run           |
| AC-4 | check ID が 30 件超に増加しても手動修正なしで動作する（ハードコードなし）       | code-review          |
| AC-5 | スクリプトの実行方法が README または実行コメントで明示されている                | documentation-review |

## 前提条件

| 条件                                                                | ステータス |
| ------------------------------------------------------------------- | ---------- |
| task-imp-layer12-spec-definition-004（check ID 体系仕様書）完了済み | met        |
| `interfaces-skill-verify-contract.md` が存在する                    | met        |
| `SkillCreatorVerificationEngine.ts` が存在する                      | met        |

## Phase 構成

| Phase | 名称             | カテゴリ     | 概要                                                       |
| ----- | ---------------- | ------------ | ---------------------------------------------------------- |
| 1     | 要件定義         | 要件         | grep 誤検知問題の根本原因分析・スクリプト要件の定義        |
| 2     | 設計             | 設計         | スクリプトアーキテクチャ・テーブル行スコープのパターン設計 |
| 3     | 設計レビュー     | ゲート       | 設計の妥当性を検証                                         |
| 4     | テスト作成       | TDD-Red      | スクリプトのユニットテスト作成（FAIL 確認）                |
| 5     | 実装             | TDD-Green    | スクリプト本体の実装（テスト全 PASS 確認）                 |
| 6     | テスト拡充       | 品質         | エッジケース・将来拡張パターンのテスト追加                 |
| 7     | カバレッジ確認   | 品質         | スクリプトのカバレッジ確認                                 |
| 8     | リファクタリング | TDD-Refactor | スクリプトの可読性・保守性改善                             |
| 9     | 品質保証         | 品質         | lint / type-check / 実行確認                               |
| 10    | 最終レビュー     | ゲート       | AC 全件の整合性確認                                        |
| 11    | 手動テスト       | 検証         | NON_VISUAL: スクリプト実行結果の確認                       |
| 12    | ドキュメント更新 | 文書化       | 実装ガイド・仕様同期・未タスク検出                         |
| 13    | PR作成           | 完了         | ユーザー許可後に PR 作成                                   |

## 依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13
```

## 参照資料

| 資料名                              | パス                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| interfaces-skill-verify-contract.md | `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`                       |
| SkillCreatorVerificationEngine      | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                                    |
| 元タスク仕様書                      | `docs/30-workflows/imp-layer12-spec-definition-004/`                                                          |
| skill-feedback-report（元タスク）   | `docs/30-workflows/imp-layer12-spec-definition-004/outputs/phase-12/skill-feedback-report.md`（存在する場合） |
| lessons-learned                     | `docs/30-workflows/unassigned-task/task-imp-layer12-check-id-script-006/lessons-learned.md`                   |

## Phase 仕様書リンク

| Phase | 名称             | ファイル                                                     |
| ----- | ---------------- | ------------------------------------------------------------ |
| 1     | 要件定義         | [phase-1-requirements.md](phase-1-requirements.md)           |
| 2     | 設計             | [phase-2-design.md](phase-2-design.md)                       |
| 3     | 設計レビュー     | [phase-3-design-review.md](phase-3-design-review.md)         |
| 4     | テスト作成       | [phase-4-test-creation.md](phase-4-test-creation.md)         |
| 5     | 実装             | [phase-5-implementation.md](phase-5-implementation.md)       |
| 6     | テスト拡充       | [phase-6-test-expansion.md](phase-6-test-expansion.md)       |
| 7     | カバレッジ確認   | [phase-7-coverage.md](phase-7-coverage.md)                   |
| 8     | リファクタリング | [phase-8-refactoring.md](phase-8-refactoring.md)             |
| 9     | 品質保証         | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) |
| 10    | 最終レビュー     | [phase-10-final-review.md](phase-10-final-review.md)         |
| 11    | 手動テスト       | [phase-11-manual-test.md](phase-11-manual-test.md)           |
| 12    | ドキュメント更新 | [phase-12-documentation.md](phase-12-documentation.md)       |
| 13    | PR作成           | [phase-13-pr-creation.md](phase-13-pr-creation.md)           |

## 補足資料

| 資料名         | ファイル                                 |
| -------------- | ---------------------------------------- |
| 苦戦箇所と教訓 | [lessons-learned.md](lessons-learned.md) |

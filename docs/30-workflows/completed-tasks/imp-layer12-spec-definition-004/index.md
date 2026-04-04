# task-imp-layer12-spec-definition-004: aiworkflow-requirements への Layer 1-4 check ID 体系追記

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | task-imp-layer12-spec-definition-004                     |
| タスク名     | aiworkflow-requirements への Layer 1-4 check ID 体系追記 |
| 分類         | docs（ドキュメント改善）                                 |
| 対象機能     | aiworkflow-requirements / FR-04 verify 契約              |
| 優先度       | 中（P1）                                                 |
| 見積もり規模 | 小                                                       |
| ステータス   | 未実施                                                   |
| 発見元       | Phase 12（TASK-P0-01）                                   |
| Issue        | #1738                                                    |
| ブランチ     | `docs/task-imp-layer12-spec-definition-004`              |
| タスク分類   | docs-only task（コード変更なし）                         |
| 作成日       | 2026-04-03                                               |

## 目的

`SkillCreatorVerificationEngine` で実装済みの Layer 1-4 check ID 体系（L1-001〜L1-005, L2-001〜L2-007, L3-001〜L3-004, L4-001〜L4-003）を `aiworkflow-requirements` の `references/` 配下に正式追記する。将来の Layer 拡張時に命名規則の統一基準を仕様書から参照できるようにする。

## 実行方針

- 依存のない調査・記録タスクは別 SubAgent に分けて並列実行する。
- Phase 1 は Task 1〜3 を並列で進め、Task 4 で AC 検証手順を統合する。
- Phase 12 は Task 12-1 と Task 12-2 を先行し、Task 12-3〜12-5 を同時実行できる形にする。
- 依存のある作業は直列、独立した作業は並列という原則を全 Phase で維持する。

## スコープ

### 含むもの

- `aiworkflow-requirements/references/` 配下への check ID 体系の追記（新規ファイルまたは既存ファイルへの追記）
- 各 check ID の検証内容・合否判定基準・severity（error/warning）の記載
- Layer 命名規則（L{N}-{NNN} 形式）の明文化
- Layer 1-4 全ての check ID を網羅（Issue #1738 は L1/L2 のみだが、実装は L3/L4 も含むため）

### 含まないもの

- `SkillCreatorVerificationEngine` 本体のコード変更
- resource-map への参照追加（必要であれば別タスク）
- Layer 5 以降の設計・実装

## 受け入れ基準

| ID   | 基準                                                                   | 検証方法             |
| ---- | ---------------------------------------------------------------------- | -------------------- |
| AC-1 | FR-04 verify 契約に Layer 1 check ID（L1-001〜L1-005）が定義されている | documentation-review |
| AC-2 | FR-04 verify 契約に Layer 2 check ID（L2-001〜L2-007）が定義されている | documentation-review |
| AC-3 | FR-04 verify 契約に Layer 3 check ID（L3-001〜L3-004）が定義されている | documentation-review |
| AC-4 | FR-04 verify 契約に Layer 4 check ID（L4-001〜L4-003）が定義されている | documentation-review |
| AC-5 | 各 check ID に検証内容・判定基準・severity が明記されている            | documentation-review |
| AC-6 | Layer 命名規則（L{N}-{NNN}）が仕様書に明文化されている                 | documentation-review |
| AC-7 | 追記内容が `SkillCreatorVerificationEngine.ts` の実装と一致している    | grep 突き合わせ      |

## 前提条件

| 条件                                           | ステータス |
| ---------------------------------------------- | ---------- |
| TASK-P0-01（Layer 1/2 実装）完了済み           | met        |
| UT-IMP-SDK-06（Layer 3/4 実装）完了済み        | met        |
| `SkillCreatorVerificationEngine.ts` が存在する | met        |

## Phase 構成

| Phase | 名称             | カテゴリ     | 概要                                       |
| ----- | ---------------- | ------------ | ------------------------------------------ |
| 1     | 要件定義         | 要件         | 現状調査・check ID の正確な抽出            |
| 2     | 設計             | 設計         | 追記先ファイルの決定・ドキュメント構成設計 |
| 3     | 設計レビュー     | ゲート       | 設計の妥当性を検証                         |
| 4     | テスト作成       | TDD-Red      | 検証コマンド・grep パターンの作成          |
| 5     | 実装             | TDD-Green    | 仕様書への check ID 体系の追記             |
| 6     | テスト拡充       | 品質         | 追加検証パターンの作成                     |
| 7     | カバレッジ確認   | 品質         | 全 check ID の記載漏れ確認                 |
| 8     | リファクタリング | TDD-Refactor | ドキュメント構成の改善                     |
| 9     | 品質保証         | 品質         | Markdown 構文・リンク検証                  |
| 10    | 最終レビュー     | ゲート       | 全体の整合性確認                           |
| 11    | 手動テスト       | 検証         | NON_VISUAL: 実装との突き合わせ確認         |
| 12    | ドキュメント更新 | 文書化       | 実装ガイド・仕様同期・未タスク検出         |
| 13    | PR作成           | 完了         | ユーザー許可後に PR 作成                   |

## 依存関係

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7 → Phase 8 → Phase 9 → Phase 10 → Phase 11 → Phase 12 → Phase 13
```

## 参照資料

| 資料名                                | パス                                                                                        |
| ------------------------------------- | ------------------------------------------------------------------------------------------- |
| SkillCreatorVerificationEngine        | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                  |
| SkillCreatorVerificationEngine テスト | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts`   |
| skill-feedback-report（TASK-P0-01）   | `docs/30-workflows/completed-tasks/step-09-par-task-p0-01-verify-execution-engine-layer12/` |
| aiworkflow-requirements skill         | `.claude/skills/aiworkflow-requirements/`                                                   |
| 未タスク指示書（元）                  | `docs/30-workflows/unassigned-task/task-imp-layer12-spec-definition-004.md`                 |

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

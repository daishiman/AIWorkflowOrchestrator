# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                                  |
| ---------- | ------------------------------------- |
| Phase      | 10                                    |
| タスクID   | TASK-SW-STRUCT-LLM-002                |
| 機能名     | skill-creator-features-llm-generation |
| 前提Phase  | Phase 9                               |
| 後続Phase  | Phase 11                              |
| 作成日     | 2026-04-18                            |
| ステータス | not_started                           |

## 目的

LLM による features フィールド自動生成機能の全体品質・整合性を検証する。
AC-1〜AC-4 の充足・依存タスクとの整合・品質保証結果を確認し、Phase 11 への移行を判断する。

## 実行タスク

- Phase 1〜9 の全成果物が揃っていることを確認する
- AC-1〜AC-4 の最終充足確認を行う
- 依存タスク（TASK-SW-LLM-PURPOSE-AUTO-EXTRACT）との整合を確認する
- 型チェック・Lint・テストがパスしていることを確認する
- コードレビューチェックリストを実施する
- ゲート判定（PASS / MAJOR）を行う

## 参照資料

| 資料名               | パス                                                                    | 用途             |
| -------------------- | ----------------------------------------------------------------------- | ---------------- |
| Phase 1 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`                                | AC 参照          |
| Phase 3 設計成果物   | `outputs/phase-3/design.md`                                             | 設計レビュー確認 |
| Phase 9 品質レポート | `outputs/phase-9/quality-report.md`                                     | 品質確認         |
| 依存タスク仕様       | `docs/30-workflows/unassigned-task/TASK-SW-LLM-PURPOSE-AUTO-EXTRACT.md` | 依存整合確認     |

## 実行手順

### 1. Phase 1〜9 成果物確認

| Phase | 成果物                                      | 確認状態 |
| ----- | ------------------------------------------- | -------- |
| 1     | `outputs/phase-1/acceptance-criteria.md`    | [ ]      |
| 2     | `outputs/phase-2/requirements-analysis.md`  | [ ]      |
| 3     | `outputs/phase-3/design.md`                 | [ ]      |
| 4     | `outputs/phase-4/test-plan.md`              | [ ]      |
| 5     | `outputs/phase-5/implementation-summary.md` | [ ]      |
| 6     | `outputs/phase-6/test-expansion-record.md`  | [ ]      |
| 7     | `outputs/phase-7/coverage-report.md`        | [ ]      |
| 8     | `outputs/phase-8/refactoring-log.md`        | [ ]      |
| 9     | `outputs/phase-9/quality-report.md`         | [ ]      |

### 2. AC 最終充足確認

| AC   | 確認内容                                                                                        | 状態     |
| ---- | ----------------------------------------------------------------------------------------------- | -------- |
| AC-1 | `runCreateWorkflow()` 内の `features` フィールドが LLM で生成された文字列配列になっている       | 確認要   |
| AC-2 | 生成された features が `generateSkillMd()` 経由で SKILL.md の features セクションに反映される   | 確認要   |
| AC-3 | features 生成に失敗した場合、空配列（`[]`）でフォールバックされている                           | 確認要   |
| AC-4 | 既存の create/update ワークフローが回帰なしに動作することを手動テスト（Phase 11）で確認する予定 | Phase 11 |

### 3. コードレビューチェックリスト

| チェック項目                                         | 確認結果 |
| ---------------------------------------------------- | -------- |
| 命名規則の一貫性（TypeScript 規約準拠）              | [ ]      |
| 関数・クラスの単一責務                               | [ ]      |
| 重複コードの排除                                     | [ ]      |
| エラーハンドリングの網羅性（フォールバック実装含む） | [ ]      |
| any 型の使用回避                                     | [ ]      |
| 未使用コード・import の除去                          | [ ]      |
| コメント・ドキュメントの適切性                       | [ ]      |
| LLM 呼び出しの非同期処理が適切                       | [ ]      |

### 4. 依存タスク整合確認

| 確認項目                                  | 確認内容                                         | 状態   |
| ----------------------------------------- | ------------------------------------------------ | ------ |
| TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との整合 | LLM 呼び出し方式・プロンプト設計が一貫しているか | 確認要 |
| `SkillCreatorService.ts` の変更影響範囲   | 他の create/update ワークフローに影響がないか    | 確認要 |
| `generateSkillMd()` インターフェース変化  | features フィールドが正しく扱われるか            | 確認要 |

### 5. 品質チェック結果確認

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test -- SkillCreatorService
```

| チェック種別         | 期待結果                                | 確認状態 |
| -------------------- | --------------------------------------- | -------- |
| TypeScript型チェック | PASS                                    | [ ]      |
| ESLint               | PASS                                    | [ ]      |
| ユニットテスト       | PASS                                    | [ ]      |
| カバレッジ基準       | Line 80%+ / Branch 60%+ / Function 80%+ | [ ]      |

### 6. ゲート判定

| 判定      | 基準                                         | 条件              |
| --------- | -------------------------------------------- | ----------------- |
| **PASS**  | AC-1〜AC-3 充足・品質 PASS・依存整合確認済み | Phase 11 へ進む   |
| **MAJOR** | AC 未充足・品質 FAIL・依存整合に問題あり     | 該当 Phase へ戻る |

**戻り先の判定**:

- 実装の問題 → Phase 5
- テストの問題 → Phase 4
- 設計の問題 → Phase 2
- 要件の問題 → Phase 1

## 統合テスト連携

最終レビューで統合テスト結果を確認する。

| 判定項目                                  | 基準               | 結果    |
| ----------------------------------------- | ------------------ | ------- |
| AC-1〜AC-3 充足                           | 全 AC 充足         | pending |
| TASK-SW-LLM-PURPOSE-AUTO-EXTRACT 依存整合 | 整合確認済み       | pending |
| Phase 9 品質 PASS                         | 全 PASS            | pending |
| features フォールバック動作               | 空配列で安全に動作 | pending |

## 多角的チェック観点（AIが判断）

| 観点              | チェック内容                                                                      |
| ----------------- | --------------------------------------------------------------------------------- |
| LLM 統合の安全性  | features 生成失敗時のフォールバックが既存ワークフローを破壊しないか               |
| SKILL.md 反映確認 | `generateSkillMd()` の features パラメータ渡しが正しく実装されているか            |
| 依存タスク整合    | TASK-SW-LLM-PURPOSE-AUTO-EXTRACT の成果物が本実装の前提として正しく機能しているか |
| 回帰リスク        | 既存 create/update ワークフローへの影響範囲が適切に評価されているか               |
| Phase 11 準備     | 手動テストで確認すべき観点（SKILL.md への features 自動生成反映）が明確か         |

## サブタスク管理

1. Phase 1〜9 成果物の存在確認
2. AC-1〜AC-4 最終充足確認
3. コードレビューチェックリスト実施
4. TASK-SW-LLM-PURPOSE-AUTO-EXTRACT 依存整合確認
5. 品質チェック（TypeScript / Lint / Test）結果確認
6. ゲート判定（PASS / MAJOR）
7. 最終レビュー結果の記録

## 成果物

| 成果物           | パス                                      | 説明                                 |
| ---------------- | ----------------------------------------- | ------------------------------------ |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | ゲート判定・AC確認・依存整合確認記録 |

## 完了条件

- [ ] Phase 1〜9 の全成果物が存在することを確認した
- [ ] AC-1〜AC-3 の最終充足確認が完了した
- [ ] コードレビューチェックリストを全項目確認した
- [ ] TASK-SW-LLM-PURPOSE-AUTO-EXTRACT との依存整合を確認した
- [ ] 型チェック・Lint・テストが全て PASS した
- [ ] ゲート判定が PASS となった
- [ ] 最終レビュー結果が `outputs/phase-10/final-review-result.md` に記録されている
- [ ] 本 Phase 内の全タスクを100%実行完了した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

Phase 11: 手動テスト検証

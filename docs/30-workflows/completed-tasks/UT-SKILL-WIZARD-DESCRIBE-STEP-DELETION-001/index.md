# UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 - タスク実行仕様書

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001        |
| タイトル   | DescribeStep.tsx / DescribeStep.test.tsx 物理削除 |
| issue番号  | 2054                                              |
| 作成日     | 2026-04-11                                        |
| ステータス | 完了（Phase 13 blocked）                          |
| 優先度     | LOW                                               |
| スケール   | small                                             |
| タイプ     | refactoring                                       |
| 総Phase数  | 13                                                |

---

## 概要

W2-seq-03b の export contract 整理を前提に、`DescribeStep` の barrel 露出を閉じたうえで
`DescribeStep.tsx` と `DescribeStep.test.tsx` を物理削除し、`wizard-exports.test.ts` と
`wizard-exports.typecheck.ts` で runtime / compile-time の barrel contract を固定した。
残留参照を全量確認した上で `pnpm typecheck` と `pnpm test` の通過を確認し、
クリーンアップを完了済みにした。

## 検出元

Issue #2054（CLOSED）。依存タスク UT-SKILL-WIZARD-W2-seq-03b の完了を受けて実施。

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス                  |
| ----- | -------------------- | ------------------------------------------------------------ | --------------------------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 完了                        |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 完了                        |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 完了                        |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 完了                        |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 完了                        |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 完了                        |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 完了                        |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 完了                        |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 完了                        |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 完了                        |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 完了                        |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 完了                        |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | blocked（ユーザー承認待ち） |

---

## 実行フロー

```
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13（blocked）→ 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. **タスク100%実行**: Phase内で指定された全タスクを完全に実行
2. **成果物確認**: 全ての必須成果物が生成されていることを検証
3. **artifacts.json更新**: `complete-phase.js` でPhase完了ステータスを更新
4. **完了条件チェック**: 各タスクを完遂した旨を必ず明記

```bash
# Phase完了処理
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001 \
  --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## タスク分解サマリー

| Phase | 概要                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------ |
| 1     | 受入基準・依存タスク完了確認・`DescribeStep` 残留参照の全量洗い出し要件を定義する                            |
| 2     | `import.*DescribeStep` パターン検索の実行計画・削除手順・ロールバック方針を設計する                          |
| 3     | 設計レビューゲート: 削除対象・影響範囲に MAJOR 課題がないか判定する                                          |
| 4     | `wizard-exports.test.ts` を新規作成し、DescribeStep 非存在の barrel contract を固定する                      |
| 5     | `DescribeStep.tsx` と `DescribeStep.test.tsx` の残留参照を全量確認し、両方を物理削除する                     |
| 6     | `pnpm typecheck` 実行結果を確認し、エラーがあれば修正する                                                    |
| 7     | `pnpm test` を実行し、`wizard-exports.test.ts` を含む全テストがパスすることを確認する                        |
| 8     | 削除後のコードベースを走査し、余分なコメント・dead code が残っていないか確認する                             |
| 9     | typecheck・lint・test の最終品質確認レポートを作成する                                                       |
| 10    | 最終レビューゲート: 受入基準全項目の充足を確認しリリース判定を行う                                           |
| 11    | 手動確認: ファイルシステム上に `DescribeStep.tsx` / `DescribeStep.test.tsx` が存在しないことを実際に検証する |
| 12    | 実装ガイド・仕様更新サマリー・未タスク検出・スキルフィードバックレポートを作成する                           |
| 13    | PR を作成し、Issue #2054 との連携・CI 通過を確認して完了とする                                               |

---

## 受入基準

- `DescribeStep.tsx` と `DescribeStep.test.tsx` がコードベースに存在しない
- `import.*DescribeStep` パターンにマッチする箇所がどこにも存在しない
- `pnpm typecheck` がエラーなく通過する
- `pnpm test` がエラーなく通過する
- `wizard-exports.test.ts` の「DescribeStep がエクスポートされていないこと」テストが新規作成され、維持・パスする

## 注意事項

`wizard-exports.test.ts` は Phase 4 で新規作成する barrel contract テストであり、
`DescribeStep.tsx` 削除後も有効な runtime ガードとして維持する。`DescribeStepProps`
の type-only 再導入は `wizard-exports.typecheck.ts` が検出するため、値 export と型 export
を分けて監視する。

---

_作成日: 2026-04-11_

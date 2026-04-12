# Phase 11: 手動テスト

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 11                               |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03b       |
| 機能名     | wizard/index.ts エクスポート更新 |
| 前提Phase  | Phase 10                         |
| 後続Phase  | Phase 12                         |
| 作成日     | 2026-04-07                       |
| ステータス | pending                          |

## 目的

`wizard/index.ts` の export contract 更新が UI の見え方を壊していないことを、static verification と代表スクリーンショット監査で確認する。
本タスクは UI マークアップ変更を含まないが、ユーザー要求に従い screenshot audit を current workflow に取り込む。

## 手動テストシナリオ

### シナリオ 1: contract / typecheck 確認

| ステップ | 操作                                                     | 期待結果                                 |
| -------- | -------------------------------------------------------- | ---------------------------------------- |
| 1        | `pnpm --filter @repo/desktop typecheck` を実行する       | 型エラーが 0 件であること                |
| 2        | `vitest run` で `wizard-exports.test.ts` を実行する      | barrel export 契約テストが pass すること |
| 3        | `DescribeStep.tsx` と `SkillCreateWizard.tsx` を確認する | `GenerationMode` 参照が壊れていないこと  |

### シナリオ 2: 代表スクリーンショット監査

| ステップ | 操作                                                         | 期待結果                                                     |
| -------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 1        | `TC-11-01-step0-description-category.png` を確認する         | Step 0 のレイアウト、カテゴリ UI、ボタン配置に破綻がないこと |
| 2        | `TC-11-02-step1-page1-defaults.png` を確認する               | Step 1 の進捗表示とカード配置に破綻がないこと                |
| 3        | current task の差分が export / type のみであることを確認する | 代表キャプチャの流用が妥当であること                         |

### シナリオ 3: regression smoke

| ステップ | 操作                                                  | 期待結果                                                |
| -------- | ----------------------------------------------------- | ------------------------------------------------------- |
| 1        | `wizard/index.ts` の公開 API を確認する               | `DescribeStep` / `DescribeStepProps` が非公開であること |
| 2        | `GenerateStep.tsx` 由来の `GenerationMode` を確認する | barrel 経由 import が維持されること                     |

## スクリーンショット計画

| 画面            | キャプチャタイミング       | ファイル名                                |
| --------------- | -------------------------- | ----------------------------------------- |
| Step 0 代表画面 | 既存 Phase 11 証跡の再利用 | `TC-11-01-step0-description-category.png` |
| Step 1 代表画面 | 既存 Phase 11 証跡の再利用 | `TC-11-02-step1-page1-defaults.png`       |

## 参照資料

| 資料名           | パス                                              | 用途            |
| ---------------- | ------------------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | Phase 10 成果物 |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | Phase 10 成果物 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物  |

## 実行手順

1. Phase 10 成果物を確認する。
2. `pnpm --filter @repo/desktop typecheck` を実行し、型エラー 0 件を確認する。
3. `vitest run` で `wizard-exports.test.ts` を確認する。
4. 代表スクリーンショット 2 枚を current workflow の証跡として監査する。
5. `evidence-index.md` と `manual-test-report.md` に監査結果を記録する。

## 成果物

| 成果物                 | パス                                     | 説明                   |
| ---------------------- | ---------------------------------------- | ---------------------- |
| 手動テスト結果         | `outputs/phase-11/manual-test-result.md` | シナリオ実施結果       |
| 手動テストレポート     | `outputs/phase-11/manual-test-report.md` | 実施概要と所見         |
| 証跡インデックス       | `outputs/phase-11/evidence-index.md`     | スクリーンショット一覧 |
| スクリーンショット計画 | `outputs/phase-11/screenshot-plan.md`    | 再利用方針             |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] TypeScript 型エラーが 0 件であること
- [ ] 代表スクリーンショット監査の根拠が current task に紐付いていること
- [ ] export 変更が UI レイアウトに影響しないことを説明できること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. 型チェック・テスト実行
3. 代表スクリーンショット監査
4. 証跡インデックス更新
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 12: ドキュメント更新

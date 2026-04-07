# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 10                                        |
| Phase名    | 最終レビュー                              |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 9: QA                               |
| 次Phase    | Phase 11: 手動テスト                      |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

Phase 1〜9 の全成果物を総合的にレビューし、手動テストおよび PR 作成への通過判定を行う。

## 実行タスク

### Task 1: 要件充足の最終確認

Phase 1 の要件定義に対する充足状況を確認する。

| 要件ID | 要件内容                                                      | 実装状況 | 確認方法                                      |
| ------ | ------------------------------------------------------------- | -------- | --------------------------------------------- |
| FR-01  | 完了ヘッダー「✓ スキルの骨格を生成しました」を表示する        | -        | data-testid="complete-step-header" の存在確認 |
| FR-02  | 👍/👎フィードバックを実装する                                 | -        | フィードバックボタンのクリックテスト確認      |
| FR-03  | ネクストアクション3カードを表示する                           | -        | 3カードの data-testid 確認                    |
| FR-04  | 👎クリックでリカバリーフローを実装する                        | -        | onRetry の呼び出し確認                        |
| FR-05  | Step 0への前回入力プリフィル（W2-seq-03aスコープ）            | -        | 境界確認済み（W2-seq-03aで実装）              |
| FR-06  | hasExternalIntegration=trueの場合に動作確認チェックを表示する | -        | 条件付きレンダリングのテスト確認              |
| FR-07  | 「今すぐ実行する」でonExecuteNowを呼び出す                    | -        | クリックテスト確認                            |
| FR-08  | 「エディタで開く」でonOpenInEditorを呼び出す                  | -        | クリックテスト確認                            |
| FR-09  | 「別のスキルを作る」でonCreateAnotherを呼び出す               | -        | クリックテスト確認                            |

### Task 2: コード品質の最終確認

```bash
# 最終テスト実行
pnpm --filter @repo/desktop vitest run -- CompleteStep --coverage

# 型チェック
pnpm --filter @repo/desktop tsc --noEmit

# Lint
pnpm --filter @repo/desktop eslint apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx
```

### Task 3: 設計との整合性確認

Phase 2 の設計書と最終実装を比較し、乖離がないかチェックする。

| 設計項目              | 設計値                                | 実装値 | 一致 |
| --------------------- | ------------------------------------- | ------ | ---- |
| data-testid: ルート   | `complete-step`                       | -      | -    |
| data-testid: ヘッダー | `complete-step-header`                | -      | -    |
| data-testid: 👍ボタン | `complete-step-feedback-satisfied`    | -      | -    |
| data-testid: 👎ボタン | `complete-step-feedback-unsatisfied`  | -      | -    |
| data-testid: 実行     | `complete-step-action-execute`        | -      | -    |
| data-testid: エディタ | `complete-step-action-open-editor`    | -      | -    |
| data-testid: 別スキル | `complete-step-action-create-another` | -      | -    |
| data-testid: 外部連携 | `complete-step-external-checklist`    | -      | -    |

### Task 4: Phase 3 指摘事項の対応確認

Phase 3（設計レビュー）で指摘された事項が全て対応されているかを確認する。

### Task 5: 最終レビュー判定

| 判定基準                       | 結果 |
| ------------------------------ | ---- |
| 全要件が充足されている         | -    |
| 全テストがpassしている         | -    |
| カバレッジ目標値を達成している | -    |
| 型エラー・Lintエラーなし       | -    |
| 設計との整合性あり             | -    |
| Phase 3 指摘事項対応済み       | -    |

**最終判定**: 承認 / 要修正

## 参照資料

| 資料名     | パス                              | 説明         |
| ---------- | --------------------------------- | ------------ |
| 要件定義書 | `outputs/phase-1/requirements.md` | 要件充足確認 |
| 設計書     | `outputs/phase-2/design.md`       | 整合性確認   |
| QAレポート | `outputs/phase-9/qa-report.md`    | 品質確認     |

## 成果物

| 成果物           | パス                                      | 説明                       |
| ---------------- | ----------------------------------------- | -------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | 要件充足・判定・残課題一覧 |

## 完了条件

- [ ] 全要件の充足状況が確認されている
- [ ] 最終テスト・型チェック・Lintが全て通過している
- [ ] 設計との整合性が確認されている
- [ ] Phase 3 指摘事項が全て対応済みである
- [ ] 最終判定（承認 / 要修正）が明記されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 11: 手動テスト](./phase-11-manual-test.md)

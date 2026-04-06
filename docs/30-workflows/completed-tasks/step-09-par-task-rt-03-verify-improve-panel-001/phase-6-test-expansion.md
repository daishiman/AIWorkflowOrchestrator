# Phase 6: テスト拡充

## メタ情報

| 項目      | 内容                      |
| --------- | ------------------------- |
| Phase     | 6                         |
| 名称      | テスト拡充                |
| 前提Phase | Phase 5（実装）           |
| 次Phase   | Phase 7（カバレッジ確認） |
| 作成日    | 2026-04-03                |

## 目的

Phase 4-5 で作成した基本テストに加え、fail path、エッジケース、回帰ガードを追加する。

## 実行タスク

### Task 6-1: VerifyResultDetailPanel 追加テスト

| TC ID   | テストケース                                                | 検証内容                |
| ------- | ----------------------------------------------------------- | ----------------------- |
| TC-V-20 | checks が空配列で「チェック項目なし」を表示                 | 空状態メッセージ        |
| TC-V-21 | 特定の Layer のみにチェックがある場合、その Layer だけ表示  | 部分的グループ表示      |
| TC-V-22 | onReverify コールバックが reverify ボタンクリックで呼ばれる | onReverify mock 検証    |
| TC-V-23 | disabledReason がある場合に reverify ボタンツールチップ表示 | disabled 理由の表示     |
| TC-V-24 | evidenceSummary がない check 項目で summary のみ表示        | optional フィールド処理 |
| TC-V-25 | route.type が terminal_handoff の場合の表示                 | handoff 表示パターン    |

### Task 6-2: ImproveResultDetailPanel 追加テスト

| TC ID   | テストケース                                                | 検証内容                       |
| ------- | ----------------------------------------------------------- | ------------------------------ |
| TC-I-13 | suggestion の before/after が長文の場合のオーバーフロー処理 | テキスト折り返し/スクロール    |
| TC-I-14 | revisedSpec が長文の場合の max-height スクロール            | 折りたたみコンテナのスクロール |
| TC-I-15 | suggestion.section が空文字の場合のフォールバック表示       | デフォルトテキスト             |

### Task 6-3: 回帰ガードテスト

| TC ID   | テストケース                                  | 検証内容               |
| ------- | --------------------------------------------- | ---------------------- |
| TC-R-01 | PlanResultDetailPanel が影響を受けていない    | 既存テストの再実行確認 |
| TC-R-02 | ExecuteResultDetailPanel が影響を受けていない | 既存テストの再実行確認 |

## 参照資料

| 参照資料           | パス                        |
| ------------------ | --------------------------- |
| Phase 4 テスト計画 | `phase-4-test-creation.md`  |
| Phase 5 実装       | `phase-5-implementation.md` |

## 成果物

| 成果物                              | 配置先                                                                                   |
| ----------------------------------- | ---------------------------------------------------------------------------------------- |
| VerifyResultDetailPanel 追加テスト  | `apps/desktop/src/renderer/components/skill/__tests__/VerifyResultDetailPanel.test.tsx`  |
| ImproveResultDetailPanel 追加テスト | `apps/desktop/src/renderer/components/skill/__tests__/ImproveResultDetailPanel.test.tsx` |

## 完了条件

- [ ] VerifyResultDetailPanel のテストが計 25件（TC-V-01〜TC-V-25）PASS する
- [ ] ImproveResultDetailPanel のテストが計 15件（TC-I-01〜TC-I-15）PASS する
- [ ] 既存の PlanResultDetailPanel / ExecuteResultDetailPanel テストが全て PASS する（回帰ガード）
- [ ] TypeScript 型チェック・ESLint がエラー 0件である

## タスク100%実行確認【必須】

- [ ] Task 6-1: VerifyResultDetailPanel 追加テスト
- [ ] Task 6-2: ImproveResultDetailPanel 追加テスト
- [ ] Task 6-3: 回帰ガードテスト

## 次Phase

Phase 7（カバレッジ確認）へ進む。

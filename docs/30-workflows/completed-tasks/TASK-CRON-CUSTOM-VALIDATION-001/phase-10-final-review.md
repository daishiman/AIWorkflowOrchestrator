# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                            |
| ---------- | ------------------------------- |
| Phase      | 10                              |
| Phase名    | 最終レビューゲート              |
| 対象機能   | TASK-CRON-CUSTOM-VALIDATION-001 |
| 前提Phase  | Phase 9: 品質保証               |
| 次Phase    | Phase 11: 手動テスト（VISUAL）  |
| ステータス | pending                         |
| 作成日     | 2026-04-14                      |

## 目的

Phase 1〜9 の全成果物を統合的にレビューし、受け入れ基準（AC-1〜AC-8）の充足を最終確認する。IPC契約ドリフトがないこと、後方互換性が維持されていることを検証し、マージ可否を判定する。

## 実行タスク

| Task      | 内容                                                  |
| --------- | ----------------------------------------------------- |
| Task 10-1 | AC-1〜AC-8 の全件充足確認                             |
| Task 10-2 | テストケースCV-01〜CV-12の全件GREEN確認               |
| Task 10-3 | IPC契約ドリフト確認（Renderer側のみの変更であること） |
| Task 10-4 | 後方互換性確認（visual モードのバリデーション未変更） |
| Task 10-5 | Phase横断成果物一貫性チェック                         |
| Task 10-6 | マージ可否判定（PASS / MINOR / MAJOR）                |

## 参照資料

| 資料名           | パス                                                                                        | 用途               |
| ---------------- | ------------------------------------------------------------------------------------------- | ------------------ |
| Phase 1 要件定義 | `outputs/phase-1/requirements-definition.md`                                                | AC確認             |
| Phase 3 レビュー | `outputs/phase-3/gate-decision.md`                                                          | MINOR追跡確認      |
| Phase 9 品質保証 | `outputs/phase-9/quality-report.md`                                                         | 品質ゲート結果確認 |
| 実装ファイル     | `apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx`                        | 最終コード確認     |
| テストファイル   | `apps/desktop/src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx` | テスト結果確認     |

## 実行手順

### 1. 受け入れ基準最終チェック

| AC ID | 受け入れ基準                                                                          | 確認方法                     | 判定    |
| ----- | ------------------------------------------------------------------------------------- | ---------------------------- | ------- |
| AC-1  | direct inputで空文字入力時にエラー（role="alert"）表示、onValidationChange(false)呼出 | テストケースCV-01確認        | pending |
| AC-2  | direct inputでフィールド数≠5のcron式でエラー表示、onValidationChange(false)呼出       | テストケースCV-02〜CV-03確認 | pending |
| AC-3  | direct inputでday-of-month=0でエラー表示、onValidationChange(false)呼出               | テストケースCV-04確認        | pending |
| AC-4  | direct inputでday-of-month≧32でエラー表示、onValidationChange(false)呼出              | テストケースCV-05確認        | pending |
| AC-5  | direct inputで有効cron式入力時にエラーなし、onValidationChange(true)呼出              | テストケースCV-06〜CV-07確認 | pending |
| AC-6  | day-of-monthが非数値の場合はエラー非表示                                              | テストケースCV-08〜CV-09確認 | pending |
| AC-7  | visual→direct切替時にバリデーション状態が正しく再計算                                 | テストケースCV-10〜CV-11確認 | pending |
| AC-8  | onValidationChangeがundefinedでもエラーなく動作                                       | テストケースCV-12確認        | pending |

### 2. テストケース全件GREEN確認

```bash
# カスタムバリデーションテスト全件実行
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/components/schedule/VisualCronPicker.customValidation.test.tsx

# 既存バリデーションテスト確認
pnpm --filter @repo/desktop exec vitest run \
  src/__tests__/components/schedule/VisualCronPicker.validation.test.tsx
```

| テストケース | 内容                           | 判定    |
| ------------ | ------------------------------ | ------- |
| CV-01        | 空文字エラー                   | pending |
| CV-02        | フィールド数不足エラー         | pending |
| CV-03        | フィールド数超過エラー         | pending |
| CV-04        | day-of-month=0エラー           | pending |
| CV-05        | day-of-month≧32エラー          | pending |
| CV-06        | 有効cron式（正常系）           | pending |
| CV-07        | 有効cron式（別パターン正常系） | pending |
| CV-08        | day-of-month非数値（\*）       | pending |
| CV-09        | day-of-month非数値（範囲）     | pending |
| CV-10        | visual→direct切替（有効値）    | pending |
| CV-11        | visual→direct切替（無効値）    | pending |
| CV-12        | onValidationChange未定義       | pending |

### 3. IPC契約ドリフト確認

```bash
# VisualCronPickerがIPC通信を直接行っていないことを確認
grep -n "ipcRenderer\|invoke\|send\|safeInvoke\|safeOn" \
  apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx

# 変更がRenderer側コンポーネントに閉じていることを確認
git diff --name-only HEAD~1 | grep -v "renderer\|__tests__" || echo "変更はRenderer側のみ"
```

期待: VisualCronPickerはRenderer側のUIコンポーネントのみの変更であり、IPC契約に影響なし。

### 4. 後方互換性確認

```bash
# visual モードのバリデーションロジックが変更されていないことを確認
git diff HEAD~1 -- apps/desktop/src/renderer/components/schedule/VisualCronPicker.tsx | \
  grep -A 3 -B 3 "weeklyError\|monthlyError"
```

| 確認項目                            | 期待値   | 判定    |
| ----------------------------------- | -------- | ------- |
| visual モードのバリデーション未変更 | 変更なし | pending |
| `weeklyError` ロジック未変更        | 変更なし | pending |
| `monthlyError` ロジック未変更       | 変更なし | pending |
| 既存props interfaceの互換性維持     | 互換     | pending |

### 5. Phase横断成果物一貫性チェック

| Phase | 主な成果物                 | 一貫性確認項目                               | 判定    |
| ----- | -------------------------- | -------------------------------------------- | ------- |
| 1     | requirements-definition.md | AC-1〜AC-8が仕様に反映されているか           | pending |
| 2     | design.md                  | 実装コードが設計と一致しているか             | pending |
| 3     | gate-decision.md           | MINOR指摘が追跡・解消されているか            | pending |
| 4-5   | テスト + 実装コード        | テストケースと実装が対応しているか           | pending |
| 6     | エッジケーステスト         | AC-6〜AC-8のエッジケースがカバーされているか | pending |
| 7     | coverage-report.md         | カバレッジ目標達成                           | pending |
| 8     | refactoring-record.md      | 変更なし or Before/After記録済み             | pending |
| 9     | quality-report.md          | 品質ゲート全項目PASS                         | pending |

### 6. 最終判定

| 判定  | 条件                                                             | 遷移先                                |
| ----- | ---------------------------------------------------------------- | ------------------------------------- |
| PASS  | AC-1〜AC-8全充足 + Phase横断チェック全PASS + IPC契約ドリフトなし | Phase 11                              |
| MINOR | 軽微な改善点あり（機能に影響なし・Phase 12で解消可能）           | Phase 11（MINOR未タスク化を同時実施） |
| MAJOR | AC充足不足 or IPC契約ドリフト or 後方互換性破壊                  | 問題のPhaseに戻る                     |

### 7. MINOR指摘の未タスク化ルール

MINOR判定の指摘事項は以下の3ステップで未タスク化する:

1. `docs/30-workflows/unassigned-task/` に未タスク指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に未タスク参照リンクを追加

## 統合テスト連携

| 判定項目             | 基準   | 結果    |
| -------------------- | ------ | ------- |
| AC-1〜AC-8 全充足    | PASS   | pending |
| CV-01〜CV-12 全GREEN | PASS   | pending |
| IPC契約ドリフト      | なし   | pending |
| 後方互換性           | 維持   | pending |
| Phase横断一貫性      | 全PASS | pending |

## 多角的チェック観点

| 観点             | 確認内容                                                     |
| ---------------- | ------------------------------------------------------------ |
| セキュリティ     | ユーザー入力のcron式にXSS等のリスクがないか                  |
| アクセシビリティ | エラーメッセージが `role="alert"` で適切にアナウンスされるか |
| 国際化対応       | エラーメッセージが将来的にi18n対応可能な構造か               |
| パフォーマンス   | バリデーションが入力のたびに過度な処理を行わないか           |

## 成果物

| 成果物           | パス                                      | 説明                                                    |
| ---------------- | ----------------------------------------- | ------------------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | PASS/MINOR/MAJOR判定・AC充足確認・IPC契約確認・指摘事項 |

## 完了条件

- [ ] AC-1〜AC-8が全て充足されていること
- [ ] テストケースCV-01〜CV-12が全件GREEN
- [ ] IPC契約ドリフトがないことを確認済み
- [ ] 後方互換性（visual モードのバリデーション未変更）を確認済み
- [ ] Phase横断成果物の一貫性チェック完了
- [ ] 総合判定（PASS/MINOR/MAJOR）が記録されている
- [ ] MINOR指摘があれば未タスク化3ステップを実施済み
- [ ] 最終レビュー結果（`outputs/phase-10/final-review-result.md`）が作成済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次Phase

→ [Phase 11: 手動テスト（VISUAL）](./phase-11-manual-test.md)

対象Phaseへ戻る（MAJOR の場合）

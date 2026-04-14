# Phase 5: 実装

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 5                            |
| Phase名    | 実装                         |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 4: テスト作成          |
| 次Phase    | Phase 6: テスト拡充          |
| ステータス | pending                      |
| 作成日     | 2026-04-12                   |

## 目的

4件のバグを最小変更で修正し、Phase 4で定義したfail-firstテストをpassへ反転させる。

## 実行タスク

### Task 1: ConversationRoundStep修正（問題12）

- `ConversationRoundStep.tsx`のuseEffect依存配列に`answers` propを追加する
- `answers`が変化した際に`internalAnswers`を初期値にリセットするロジックを実装する
- 既存の初期化ロジックとの重複・競合がないことを確認する

### Task 2: GenerateStep修正（問題13）

- `GenerateStep.tsx` の template モードエラー表示ブロックに `mode === "template"` のキャンセルボタンを追加する
- `onCancel` を Step 0（`SkillInfoStep`）への復帰コールバックとして接続する
- 非templateモードのUI（既存の通常モード）に影響がないことを確認する

### Task 3: SkillCreateWizard修正（問題18）

- `SkillCreateWizard.tsx` で q5 の回答変更を検出し、`resolveExternalIntegration` を再呼び出しするロジックを追加する
- `hasExternalIntegration` と `externalToolName` が変更後の最新値で更新されることを確認する
- q5 以外の変更では再計算を抑止する current facts を維持する

### Task 4: SkillCreateWizard修正（問題19）

- `generationLockRef` の finally 節を修正し、正常完了・エラー・キャンセルの全3経路で `generationLockRef.current = false` が実行されるようにする
- キャンセル時の非同期処理の中断とロック解放が対称的に行われることを確認する
- ロックが`true`のまま残留するケースが発生しないことをコードレビュー観点で確認する

## 参照資料

| 資料名               | パス                                                                          | 説明           |
| -------------------- | ----------------------------------------------------------------------------- | -------------- |
| 設計書               | `outputs/phase-2/design-document.md`                                          | 修正方針       |
| テスト仕様書         | `outputs/phase-4/test-specifications.md`                                      | fail-first対象 |
| Step 1コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 修正対象       |
| 生成ステップ         | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | 修正対象       |
| ウィザード実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 修正対象       |

## 統合テスト連携

- Phase 4で定義したfail-firstケースをpassに反転させる
- 既存テストが破壊されていないことをテスト実行で確認する

## 成果物

| 成果物   | パス                                       | 説明                       |
| -------- | ------------------------------------------ | -------------------------- |
| 実装記録 | `outputs/phase-5/implementation-record.md` | 変更ファイル・変更内容一覧 |

## 完了条件

- [ ] 3ファイルの修正が完了している
- [ ] Phase 4のテストがpassになっている
- [ ] 既存の正常フローテストが引き続きpassである
- [ ] 変更対象ファイルと変更内容が明示されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 6: テスト拡充](./phase-6-test-expansion.md)

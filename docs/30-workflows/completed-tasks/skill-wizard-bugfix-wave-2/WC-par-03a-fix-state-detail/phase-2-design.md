# Phase 2: 設計

## メタ情報

| 項目       | 内容                         |
| ---------- | ---------------------------- |
| Phase      | 2                            |
| Phase名    | 設計                         |
| 対象機能   | TASK-SW-FIX-STATE-DETAIL-001 |
| 前提Phase  | Phase 1: 要件定義            |
| 次Phase    | Phase 3: 設計レビュー        |
| ステータス | pending                      |
| 作成日     | 2026-04-12                   |

## 目的

4件のバグに対する最小修正設計を確定する。
useEffect依存配列の修正、キャンセルボタンの追加位置、
resolveExternalIntegration再計算のトリガー、
generationLockRefのfinally節リセット条件を設計する。

## 実行タスク

### Task 1: 問題12設計 — internalAnswersリセット

- `ConversationRoundStep`の`useEffect`に`answers` propを依存配列へ追加する
- `answers`が変化した場合（リトライ時に親から新しい空値が渡された場合）に`setInternalAnswers({})`または`setInternalAnswers(initialValue)`を実行する設計を確定する
- 既存の初期化ロジックとの競合がないことを確認する

### Task 2: 問題13設計 — templateモードキャンセルボタン

- `GenerateStep`のtemplateモード向けエラー表示ブロックに`handleCancelTemplateGeneration`ハンドラーを持つキャンセルボタンを追加する位置を特定する
- ボタン押下時にStep 0（`SkillInfoStep`）に戻るための`onCancel`または`onReset`コールバックの呼び出し設計を確定する
- 既存の通常モードUI（非templateモード）との分岐条件を設計する

### Task 3: 問題18設計 — resolveExternalIntegration再計算

- `SkillCreateWizard`内でq5（外部連携質問）の回答が変化したタイミングを検出するロジックを設計する
- 検出後に`resolveExternalIntegration`を再呼び出しし、`hasExternalIntegration`と`externalToolName`を更新するフローを確定する
- useEffect依存配列またはイベントハンドラー内での再計算の実装方針を選択する

### Task 4: 問題19設計 — generationLockRefキャンセル競合修正

- `generationLockRef`のfinally節でのリセット条件を調査し、キャンセル時にも確実に`false`へリセットされるよう修正する設計を確定する
- 正常完了・エラー・キャンセルの3経路すべてでロックが解放されることを保証する設計とする
- 競合状態が発生しない非同期処理パターンを選択する

## 参照資料

| 資料名               | パス                                                                          | 説明                 |
| -------------------- | ----------------------------------------------------------------------------- | -------------------- |
| 要件定義             | `phase-1-requirements.md`                                                     | AC-1〜AC-5           |
| ウィザード実装       | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 問題18・19の実装確認 |
| Step 1コンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 問題12の実装確認     |
| 生成ステップ         | `apps/desktop/src/renderer/components/skill/wizard/GenerateStep.tsx`          | 問題13の実装確認     |

## 統合テスト連携

- 各修正箇所の状態遷移をテスト観測可能な形で設計に盛り込む
- キャンセルフローと正常フローの分岐をテストケースとして明示できるよう設計する

## 成果物

| 成果物 | パス                                 | 説明                                                                 |
| ------ | ------------------------------------ | -------------------------------------------------------------------- |
| 設計書 | `outputs/phase-2/design-document.md` | 4件の修正設計・useEffect依存配列・ボタン追加位置・ロックリセット条件 |

## 完了条件

- [ ] 4件の修正設計がそれぞれ独立して記述されている
- [ ] useEffect依存配列の修正方針が確定している
- [ ] キャンセルボタンの追加位置とハンドラー設計が確定している
- [ ] generationLockRefのリセット条件が3経路すべてで確認されている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 3: 設計レビュー](./phase-3-design-review.md)

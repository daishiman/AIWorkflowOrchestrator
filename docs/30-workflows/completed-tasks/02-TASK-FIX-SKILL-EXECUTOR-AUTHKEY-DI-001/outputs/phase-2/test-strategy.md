# Phase 2 テスト戦略

## 目的

- DI配線の欠落を再発させない最小テストセットを定義する。

## テストレイヤー

### L1: 単体（Main IPC配線）

- 対象: `ipc-double-registration.test.ts`
- 観点:
  - `registerSkillHandlers` に第3引数が渡る
  - `registerAuthKeyHandlers` と同一インスタンスである

### L2: 契約回帰

- 対象: `skillHandlers.execute.test.ts`
- 観点:
  - `skill:execute` 成功/失敗レスポンス形状が不変
  - `AUTHENTICATION_ERROR` 伝搬の破壊なし

### L3: 既存統合配線

- 対象: `skillHandlers.delegate.test.ts`
- 観点:
  - SkillExecutor注入委譲ロジックが維持される

## Red->Green 方針

1. 先に `ipc-double-registration.test.ts` に配線検証ケースを追加（Red）
2. `skillHandlers.ts` と `ipc/index.ts` を修正（Green）
3. 既存関連テストを再実行して回帰確認

## 完了基準

- 新規テストが Red->Green を確認
- 関連テスト群が全件PASS

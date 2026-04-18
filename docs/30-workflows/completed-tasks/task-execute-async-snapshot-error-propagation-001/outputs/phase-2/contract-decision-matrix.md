# Phase 2: 契約判断表

> 作成日: 2026-04-18
> タスクID: TASK-EXECUTE-ASYNC-SNAPSHOT-ERROR-PROPAGATION-001

## 設計判断マトリクス

| 選択肢 | 内容                                                    | 採用条件                                                | 判定        |
| ------ | ------------------------------------------------------- | ------------------------------------------------------- | ----------- |
| A      | callback 第3引数 `errorMessage` を正本とする            | runtime / IPC relay / consumer が既に成立               | **採用** ✅ |
| B      | snapshot 本体へ `errorCode` / `errorMessage` を追加する | shared/public contract 変更が必須と確認できた場合のみ   | 却下 ❌     |
| C      | runtime / IPC / tests を追加修正する                    | Phase 1 で current branch mismatch が確認された場合のみ | 却下 ❌     |

## 採用理由（選択肢 A）

1. `onWorkflowStateSnapshot(planId, snapshot | null, error?: string)` の契約は成立している
2. `creatorHandlers.ts` の `emitWorkflowStateChanged()` は snapshot 不在でも errorMessage を relay できる
3. テスト T-01〜T-06 が全シナリオを網羅している
4. `SkillCreatorWorkflowStateSnapshot` に errorCode/errorMessage を追加する根拠がない

## 却下理由（選択肢 B）

- `errorCode` を snapshot 本体に追加したい根拠は docs 上の仮説のみ
- callback 第3引数（optional string）で consumer が要件を満たせる
- shared/public contract 変更はコスト高で利得がない

## 却下理由（選択肢 C）

- current branch の実装は仕様を充足している（mismatch なし）
- 追加修正は over-engineering に相当する

## Phase 5 への引き継ぎ

| 項目               | 内容                      |
| ------------------ | ------------------------- |
| Phase 5 実行モード | no-op（差分確認のみ）     |
| 型変更             | なし                      |
| テスト追加         | なし（T-01〜T-06 で充足） |
| IPC relay 修正     | なし                      |

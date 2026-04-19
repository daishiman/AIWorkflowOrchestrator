# Phase 9: リスク台帳

## 残存リスク一覧

| リスクID  | リスク内容                             | 影響度 | 発生頻度 | 現状     | 対策                                                     |
| --------- | -------------------------------------- | ------ | -------- | -------- | -------------------------------------------------------- |
| RISK-9-01 | CIフレーキー（非同期タイミング問題）   | 高     | 低       | 許容     | `act()` を適切に使用済み。非同期テストは安定動作確認済み |
| RISK-9-02 | auth:login IPCモックの不整合           | 高     | 低       | 許容     | `{ provider: string }` の型整合を TypeScript で保証済み  |
| RISK-9-03 | describe.skip 除去による既存テスト破壊 | 中     | 低       | **解消** | 5/5 PASS 確認済み。破壊なし                              |
| RISK-9-04 | waitFor タイムアウト設定のリスク       | 中     | 低       | N/A      | `waitFor` import を削除済み（TC-03/05削除により不要）    |

## リスク評価詳細

### RISK-9-01: CIフレーキー

TC-01 は `fireEvent.click` と `act(async () => {...})` を組み合わせており、
非同期処理の完了を適切に待機している。ローカル環境で複数回実行しても安定 PASS。

### RISK-9-02: IPCモック不整合

`mockAuthLogin` は `vi.fn()` として宣言され、
`expect(mockAuthLogin).not.toHaveBeenCalled()` で非発火を検証している。
実際の IPC チャンネル仕様（`{ provider: string }`）との整合は TC-02/TC-04 でカバー。

### RISK-9-03: 既存テスト破壊（解消済み）

`SkillLifecyclePanel.auth-regression.test.tsx` の 5テスト全件 PASS。
`SkillLifecyclePanel.test.tsx` への影響なし（変更対象外）。

## 新規リスク（未発見）

本 Phase において新規リスクは検出されなかった。

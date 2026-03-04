# Phase 6 拡張テストケース

## 追加・強化したケース

| ID    | ファイル                                    | 拡張内容                                                              |
| ----- | ------------------------------------------- | --------------------------------------------------------------------- |
| P6-01 | `skillHandlers.execute.test.ts`             | `AUTHENTICATION_ERROR` の `errorCode` 伝搬を検証                      |
| P6-02 | `authKeyHandlers.test.ts`                   | `auth-key:exists` の env fallback を検証                              |
| P6-03 | `skill-api.contract.test.ts`                | Preload unwrap の `Error.code` 付与を検証                             |
| P6-04 | `useSkillExecution.test.ts`                 | preflight NG 時の execute スキップを検証                              |
| P6-05 | `AgentView.test.tsx`                        | preflight NG 時の設定誘導表示を検証                                   |
| P6-06 | `agentSlice.executeSkill.preflight.test.ts` | Store 経由 execute の preflight NG / authKey確認失敗 / 通常実行を検証 |

## エッジケース

- `window.electronAPI.authKey` 未定義時に互換挙動を維持
- 一般エラーと `AUTHENTICATION_ERROR` を識別
- 設定誘導文言の重複を共通ユーティリティで抑制

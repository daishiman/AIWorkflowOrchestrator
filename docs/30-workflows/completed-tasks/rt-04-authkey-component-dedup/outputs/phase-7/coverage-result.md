# Phase 7: カバレッジ計測結果

計測日時: 2026-04-06
対象ファイル: 3件（変更ファイルのみ）

| ファイル                   | Lines  | Branch | Functions | 判定 |
| -------------------------- | ------ | ------ | --------- | ---- |
| `useAuthKeyManagement.ts`  | 89.47% | 84.44% | 100%      | PASS |
| `AuthKeySection/index.tsx` | 100%   | 100%   | 100%      | PASS |
| `ApiKeySettingsPanel.tsx`  | 100%   | 100%   | 100%      | PASS |

総合判定: PASS

## 未カバー行詳細 (useAuthKeyManagement.ts)

| 行番号  | 内容                                | 補足                               |
| ------- | ----------------------------------- | ---------------------------------- |
| 163-165 | `if (!authKeyApi?.delete)` ガード節 | authKey.delete が undefined の場合 |
| 178-180 | `handleDelete` catch ブロック       | delete() が例外を投げる場合        |

これらは防御的コードであり、目標値 (Lines 80%+, Branch 60%+) を十分に超過しているため対処不要。

## 閾値確認

| 指標              | 目標値 | useAuthKeyManagement | AuthKeySection | ApiKeySettingsPanel | 判定 |
| ----------------- | ------ | -------------------- | -------------- | ------------------- | ---- |
| Lines Coverage    | 80%+   | 89.47%               | 100%           | 100%                | PASS |
| Branch Coverage   | 60%+   | 84.44%               | 100%           | 100%                | PASS |
| Function Coverage | 80%+   | 100%                 | 100%           | 100%                | PASS |

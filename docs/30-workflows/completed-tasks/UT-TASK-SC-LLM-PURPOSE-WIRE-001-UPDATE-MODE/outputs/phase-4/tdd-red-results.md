# Phase 4: TDD Red 結果

## Red で確認した失敗条件

- `update` モードで専用ワークフローが呼ばれず、`init_skill.js` に落ちる。
- `improve-prompt` モードでも同様に専用ワークフロー不在のまま新規初期化へ進む。

## Red 観点

| ID         | 観点                       | Red 時点の期待                            |
| ---------- | -------------------------- | ----------------------------------------- |
| SC-UPD-001 | `update` dispatch          | `runUpdateWorkflow` が未接続で失敗        |
| SC-UPD-002 | `init_skill.js` 非呼び出し | 誤って呼ばれる                            |
| SC-IMP-001 | `improve-prompt` dispatch  | `runImprovePromptWorkflow` が未接続で失敗 |
| SC-IMP-002 | `init_skill.js` 非呼び出し | 誤って呼ばれる                            |

## 備考

- Red の生ログは保存されていないため、本ファイルは Phase 1〜4 の仕様書・差分レビューに基づく再構成記録。

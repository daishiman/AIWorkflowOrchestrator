# Phase 6 成果物: 拡充テスト仕様書

## タスクID: TASK-SW-FIX-MODE-MGMT-001

## エッジケーステスト

Phase 6 で追加を検討したエッジケース:

| ケース                            | 既存テスト                                            | 追加要否 |
| --------------------------------- | ----------------------------------------------------- | -------- |
| Step 0 必須項目未入力での「次へ」 | 既存「次へ」ボタン disabled 確認あり                  | 不要     |
| LLM 生成失敗時のエラー表示        | 「IPC 失敗時にエラーカードが表示される」              | 不要     |
| Step 2 でのキャンセル遷移         | handleCancelGeneration は実装済み（手動テストで確認） | 不要     |
| Step 1 から Step 0 への戻り       | 「Step 1 から Step 0 に戻ると formData が保持される」 | 不要     |

## 結論

TC-01〜TC-06 + 既存30件で十分なカバレッジを確保している。
Phase 6 での追加テストは不要と判断。

## 回帰テスト結果

- 実行: `pnpm --filter @repo/desktop exec vitest run SkillCreateWizard.test.tsx`
- 結果: 36/36 PASS
- 回帰なし

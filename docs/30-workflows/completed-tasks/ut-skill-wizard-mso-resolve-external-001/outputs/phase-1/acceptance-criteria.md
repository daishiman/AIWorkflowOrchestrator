# 受け入れ基準: UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001

| ID   | 受け入れ基準                                                                                         | 検証方法                                                                                          |
| ---- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| AC-1 | `resolveExternalIntegration` が `string[]` を受け取り、複数ツールを `Promise.all` で並列処理できる   | Vitest: 複数要素の入力で `fetchToolIntegrationInfo` が並列呼び出しされることを確認                |
| AC-2 | 各ツールの統合情報（APIエンドポイント・認証方式・主要操作）がそれぞれ取得・マージされる              | Vitest: 返り値の `apiEndpoints`/`authMethods`/`mainOperations` に複数ツール分が含まれることを確認 |
| AC-3 | 単一ツール選択時は従来と同一の動作を維持する（後方互換性）                                           | Vitest: `["toolA"]` 入力で単一ツールのみの `MergedExternalIntegration` が返ることを確認           |
| AC-4 | 空配列 `[]` や未対応ツールに対して安全にフォールバックする                                           | Vitest: 例外が発生せず空の `MergedExternalIntegration` が返ることを確認                           |
| AC-5 | `SkillCreateWizard.tsx` の `resolveExternalIntegration` 呼び出し箇所が複数ツールを渡すよう更新される | コードレビュー: `selectedOptions` 全体が渡されていることを確認                                    |
| AC-6 | `resolveExternalIntegration` のテストカバレッジが 90% 以上                                           | `pnpm --filter @repo/desktop test --coverage` でカバレッジレポートを確認                          |
| AC-7 | `// TODO(UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001)` コメントが全て削除される                         | `grep -rn "UT-SKILL-WIZARD-MSO-RESOLVE-EXTERNAL-001"` で 0 件であることを確認                     |

## タスク分類

| 項目          | 内容                                                 |
| ------------- | ---------------------------------------------------- |
| タスク種別    | 実装タスク                                           |
| UI 変更       | なし（バッジ削除は内部ロジック整理に伴う副次的変更） |
| VISUAL 分類   | NON_VISUAL（スクリーンショット証跡不要）             |
| Phase 11 必須 | 不要                                                 |

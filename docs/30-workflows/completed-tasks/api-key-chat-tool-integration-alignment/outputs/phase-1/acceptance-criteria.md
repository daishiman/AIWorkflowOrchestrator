# Phase 1 受け入れ基準

| AC   | 条件                                           | 検証方法                                          |
| ---- | ---------------------------------------------- | ------------------------------------------------- |
| AC-1 | 4プロバイダーAPIキーがチャット実行で参照される | `apiKeyHandlers` / `secureStorage` / `llm` テスト |
| AC-2 | `ai.chat` と `llm.*` の選択値が一致            | `aiHandlers.llm.test.ts`                          |
| AC-3 | APIキー保存先契約が単一化                      | `secureStorage.ts` 実装確認 +テスト               |
| AC-4 | AuthKey保存導線とUI導線が一致                  | `AuthKeySection.test.tsx` + 手動確認              |
| AC-5 | Preload/IPC型契約が整合                        | `preload/types.ts`, `channels.ts` テスト          |
| AC-6 | 秘密情報露出なし                               | セキュリティレビュー（Phase 9）                   |
| AC-7 | 変更範囲テストPASS                             | Vitest 実行結果                                   |
| AC-8 | system spec 更新済み                           | Phase 12 成果物・仕様差分                         |

# 回帰ガード一覧 - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 6

## UI 回帰ガード

| ガード               | テスト describe                   | 保護内容                                                    |
| -------------------- | --------------------------------- | ----------------------------------------------------------- |
| 状態遷移の整合       | `AC-3: 保存状態の表示`            | not_set/validating/configured/error の 4 状態遷移が崩れない |
| 削除後の状態         | `AC-4: 削除機能`                  | 削除後に not_set へ遷移する                                 |
| env-fallback 保護    | `AC-4: 削除機能`                  | env-fallback は削除しても configured を維持                 |
| エラーハンドリング   | `Edge case: エラーハンドリング`   | 例外発生時に適切なメッセージを表示                          |
| バリデーションクリア | `Edge case: 入力フィールドの連動` | 入力変更でエラーがクリアされる                              |

## SkillLifecyclePanel 統合回帰ガード

| ガード                   | テストファイル                                 | 保護内容                                                |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------------- |
| auth:login が呼ばれない  | `SkillLifecyclePanel.auth-regression.test.tsx` | スキル生成フローで auth:login が呼ばれない              |
| ApiKeySettingsPanel 統合 | `SkillLifecyclePanel.auth-regression.test.tsx` | 補助導線として ApiKeySettingsPanel が正常に埋め込まれる |

## IPC 契約回帰ガード

| ガード                           | 保護内容                                                                            |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `auth-key:exists` レスポンス形式 | `{ exists: boolean, source?: "saved" \| "env-fallback" \| "not-set" }` が変わらない |
| `auth-key:set` レスポンス形式    | `{ success: boolean, error?: string }` が変わらない                                 |
| sender 検証                      | `withValidation()` が全ハンドラーに適用されている                                   |

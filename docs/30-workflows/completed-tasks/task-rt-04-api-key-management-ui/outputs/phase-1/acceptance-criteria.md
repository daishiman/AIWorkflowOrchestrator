# 受入条件一覧 - Skill Runtime API Key Panel

## タスクID: TASK-RT-04 / Phase 1

| AC   | 内容                                                                                            | テスト接続先             |
| ---- | ----------------------------------------------------------------------------------------------- | ------------------------ |
| AC-1 | `auth-key:exists` が `exists` と `source` を返し、`not-set / saved / env-fallback` を判別できる | Phase 4: IPC 契約ケース  |
| AC-2 | `auth-key:set` が API キーを保存し、成功/失敗を一貫したレスポンスで返す                         | Phase 4: IPC 契約ケース  |
| AC-3 | `auth-key:validate` が入力キーの検証結果を返す                                                  | Phase 4: IPC 契約ケース  |
| AC-4 | `auth-key:delete` が保存済みキーを削除できる                                                    | Phase 4: IPC 契約ケース  |
| AC-5 | `SettingsView` 主導線と `SkillLifecyclePanel` 補助導線が同一契約を共有する                      | Phase 4: UI テストケース |
| AC-6 | `ApiKeyStatus` が `not_set / validating / configured / error` に収束する                        | Phase 4: UI テストケース |
| AC-7 | エラー出力に API キーの生値が含まれない                                                         | Phase 9: 品質チェック    |
| AC-8 | Phase 4 / 9 / 11 / 12 の成果物がすべて整合する                                                  | Phase 10: 最終レビュー   |

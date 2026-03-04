# Phase 1 受け入れ基準

## AC一覧

| ID    | 受け入れ基準                                                   | 検証方法                                            |
| ----- | -------------------------------------------------------------- | --------------------------------------------------- |
| AC-01 | 認証キー未設定時、実行前Preflightで失敗し、実行APIを呼ばない   | Renderer単体テスト（AgentView / useSkillExecution） |
| AC-02 | 認証キー未設定時、ユーザー向けに設定誘導メッセージが表示される | Renderer単体テスト + 手動確認                       |
| AC-03 | `skill:execute` 失敗レスポンスで `errorCode` が返る            | Main IPCテスト                                      |
| AC-04 | Preload層で `errorCode` が `Error.code` に転写される           | Preloadテスト                                       |
| AC-05 | 既存の成功系 `skill:execute` は従来どおり実行できる            | 回帰テスト                                          |
| AC-06 | `validateIpcSender` を含む既存セキュリティ境界は維持される     | 既存IPC契約テスト                                   |
| AC-07 | 変更対象モジュールのテストが全PASS                             | `pnpm --filter @repo/desktop test:run -- <target>`  |

## 完了判定

- 全 AC が `PASS`
- `outputs/phase-1` 必須成果物が存在
- Phase 2 へ設計入力（変更方針・契約差分）が引き継がれている

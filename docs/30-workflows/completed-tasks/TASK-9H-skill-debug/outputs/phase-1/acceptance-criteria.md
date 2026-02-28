# 受け入れ基準 - TASK-9H-SKILL-DEBUG

## AC-1: デバッグセッション管理

- [ ] セッション開始でUUID v4のセッションIDが返却される
- [ ] セッション状態が idle → running → paused → completed と正しく遷移する
- [ ] エラー発生時に error 状態に遷移しエラー情報が保持される
- [ ] stop コマンドで任意の状態から即座に終了できる
- [ ] 2つ目のセッション開始時にエラーが返却される（排他制御）

## AC-2: ブレークポイント管理

- [ ] tool/hook/step の3タイプでブレークポイント設定可能
- [ ] tool タイプで toolName 指定時、該当ツールのみで停止
- [ ] hook タイプで hookType 指定時、該当フックのみで停止
- [ ] condition 式が true の場合のみ停止
- [ ] enabled=false のブレークポイントでは停止しない
- [ ] 実行中にブレークポイントの追加・削除が反映される
- [ ] 各ブレークポイントに一意のUUID v4 IDが付与される

## AC-3: ステップ実行

- [ ] continue で次のブレークポイントまで実行継続
- [ ] stepOver で次のステップで停止
- [ ] stepInto でネストツール内部に入る
- [ ] stepOut でスコープ外に戻る
- [ ] pause で running → paused 遷移
- [ ] 各ステップで stepNumber, type, timestamp が記録される

## AC-4: 変数インスペクション

- [ ] ドット区切りパスでネスト変数アクセス可能
- [ ] 存在しないパスでエラー返却
- [ ] 変数設定時に variable-changed イベントが発火

## AC-5: 式評価

- [ ] 一時停止中に式が評価され結果が返却される
- [ ] variables スコープ内の変数にアクセス可能
- [ ] process, require, fs 等へのアクセスがブロックされる
- [ ] 5秒超過でタイムアウトエラー
- [ ] running 状態での式評価がエラー返却

## AC-6: コールスタック

- [ ] ツール呼び出し開始でエントリがプッシュされる
- [ ] ツール完了でエントリがポップされる
- [ ] 一時停止中にコールスタック全体が取得可能

## AC-7: デバッグイベント

- [ ] step イベントが各ステップで発火
- [ ] breakpoint-hit イベントがブレークポイント到達時に発火
- [ ] variable-changed イベントが変数変更時に発火
- [ ] session-ended イベントがセッション終了時に発火
- [ ] イベントが IPC skill:debug:event チャネルで Renderer に送信される

## AC-8: セキュリティ・品質

- [ ] 全IPCハンドラで validateIpcSender 検証通過
- [ ] 全文字列引数にP42準拠3段バリデーション適用
- [ ] Line Coverage >= 80%
- [ ] Branch Coverage >= 60%
- [ ] Function Coverage >= 80%
- [ ] ESLint エラー 0件
- [ ] TypeScript 型チェックエラー 0件

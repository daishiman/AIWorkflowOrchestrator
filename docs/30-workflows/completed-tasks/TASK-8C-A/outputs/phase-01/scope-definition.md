# スコープ定義 - TASK-8C-A: IPC統合テスト

## 作成日: 2026-02-02

---

## 実装範囲（In Scope）

### コード成果物

- `apps/desktop/src/main/ipc/__tests__/skillIpc.integration.test.ts` - 22テストケースの統合テスト

### テスト対象チャネル（18チャネル）

#### 基本チャネル（8件 - 既存ハンドラー）

1. `skill:list-available` - スキル一覧取得
2. `skill:list-imported` - インポート済みスキル取得
3. `skill:import` - スキルインポート
4. `skill:remove` - スキル削除
5. `skill:get-detail` - スキル詳細取得
6. `skill:execute` - スキル実行
7. `skill:abort` - 実行中止
8. `skill:get-status` - 実行ステータス取得

#### IMP-002 追加チャネル（10件 - 新規実装が必要な場合あり）

9. `skill:settings:get` - 設定取得
10. `skill:settings:update` - 設定更新
11. `skill:permissions:get` - 権限取得
12. `skill:permissions:grant` - 権限付与
13. `skill:permissions:revoke` - 権限取消
14. `skill:cache:get` - キャッシュ取得
15. `skill:cache:set` - キャッシュ設定
16. `skill:cache:invalidate` - キャッシュ無効化

### テスト観点

- IPC登録パス（registerSkillHandlers → ipcMain.handle）
- ハンドラー実行パス（ハンドラー → SkillService）
- エラー変換パス（例外 → OperationResult）
- セキュリティパス（validateIpcSender）

---

## 対象外範囲（Out of Scope）

| 項目                                 | 理由                                                          |
| ------------------------------------ | ------------------------------------------------------------- |
| Renderer Process テスト              | Main Processのみが対象                                        |
| electron-store永続化テスト           | 既存統合テスト(skillHandlers.integration.test.ts)でカバー済み |
| E2Eテスト                            | 本タスクはMain Process内の統合テスト                          |
| skill:stream イベント                | M→R方向の通知は別テスト対象                                   |
| skill:permission:request イベント    | M→R方向の通知は別テスト対象                                   |
| SkillScanner/SkillParser内部ロジック | サービス層テストでカバー                                      |
| UI統合テスト                         | フロントエンドテスト対象                                      |

---

## アーキテクチャ層別要件

| 層                         | 対象/対象外 | 確認観点                                                   |
| -------------------------- | ----------- | ---------------------------------------------------------- |
| フロントエンド（Renderer） | 対象外      | -                                                          |
| バックエンド（Main）       | 対象        | SkillServiceファサードメソッド要件、ハンドラー登録パターン |
| IPC通信                    | 対象        | 全チャネル登録・呼び出し・レスポンス（OperationResult）    |
| セキュリティ               | 対象        | validateIpcSender検証、チャネルホワイトリスト準拠          |
| データ                     | 対象外      | 永続化は既存統合テストでカバー                             |

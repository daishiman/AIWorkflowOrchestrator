# 受け入れ基準 - index.html→structure.md 逆同期機能

## メタ情報

| 項目     | 内容                             |
| -------- | -------------------------------- |
| 機能名   | slide-reverse-sync               |
| タスクID | task-feat-slide-reverse-sync-001 |
| 作成日   | 2026-01-10                       |
| スキル   | acceptance-criteria-writing      |

---

## ユーザーストーリー

**As a** スライド作成者
**I want to** index.htmlを直接編集した変更がstructure.mdに自動反映される
**So that** 設計図（structure.md）と実装（index.html）の整合性を維持できる

---

## 受け入れ基準（Given-When-Then形式）

### AC-1: index.html変更検知

**Given** スライドプロジェクトが監視状態にあり、file-watcherが起動している
**When** ユーザーがindex.htmlを編集して保存する
**Then** file-watcherがindex.htmlの変更を検知し、変更イベントが発火される

**検証方法**:

- ファイル変更後1秒以内にイベントが発火されること
- chokidarのchangeイベントが正しく呼び出されること
- ログに変更検知メッセージが出力されること

---

### AC-2: 逆同期トリガー

**Given** index.htmlの変更イベントが発火された
**When** sync-managerが変更イベントを受信する
**Then** 逆同期処理（modifier skill）が開始される

**検証方法**:

- skill-executorの`execute("modifier", projectPath)`が呼び出されること
- 同期状態が"syncing"に変更されること
- UIのSyncStatusIndicatorに同期中状態が表示されること

---

### AC-3: Claude Code差分解析

**Given** modifier skillが実行開始された
**When** Claude Agent SDKが呼び出される
**Then** index.htmlの変更前後を比較し、意味的な差分が抽出される

**検証方法**:

- Agent SDKに正しいプロンプト（変更前後のHTML + structure.md）が送信されること
- 抽出された差分が構造化データとして返却されること
- エラー時に適切なエラーメッセージが返却されること

---

### AC-4: structure.md更新

**Given** Claude Codeが差分を正しく抽出した
**When** 差分が適用可能な形式である
**Then** structure.mdが更新され、変更が保存される

**検証方法**:

- structure.mdのファイル内容が更新されていること
- 更新内容がindex.htmlの変更を正しく反映していること
- ファイル保存後に完了イベントが発火されること

---

### AC-5: 無限ループ防止（逆方向）

**Given** modifier skillによるstructure.md更新が完了した
**When** その更新がfile-watcherで検知される
**Then** html生成スキルは実行されず、無限ループが防止される

**検証方法**:

- changeContextMapにstructure.mdの変更がスキル起因としてマークされること
- TTL期間内（1秒）は連鎖的な同期が発生しないこと
- ログに無限ループ防止メッセージが出力されること

---

### AC-6: 双方向無限ループ防止

**Given** html生成スキルによるindex.html更新が完了した
**When** その更新がfile-watcherで検知される
**Then** modifier skillは実行されず、無限ループが防止される

**検証方法**:

- changeContextMapにindex.htmlの変更がスキル起因としてマークされること
- TTL期間内（1秒）は連鎖的な逆同期が発生しないこと
- 双方向の無限ループが完全に防止されること

---

### AC-7: 同期成功状態通知

**Given** 逆同期処理が正常に完了した
**When** structure.mdの更新が保存された
**Then** 同期状態が"synced"に変更され、UIに成功状態が表示される

**検証方法**:

- IPCを通じてRendererに成功通知が送信されること
- SyncStatusIndicatorが"synced"状態を表示すること
- 処理時間がログに記録されること

---

### AC-8: エラーハンドリング（Agent SDK障害）

**Given** modifier skill実行中にAgent SDK呼び出しが失敗する
**When** ネットワークエラーまたはAPIエラーが発生する
**Then** エラー状態が適切に処理され、UIにエラーが表示される

**検証方法**:

- 同期状態が"error"に変更されること
- エラーメッセージがIPCを通じてRendererに送信されること
- SyncStatusIndicatorにエラー状態と詳細が表示されること
- リトライ機構が適切に動作すること（最大3回）

---

### AC-9: エラーハンドリング（タイムアウト）

**Given** modifier skill実行中
**When** 処理がタイムアウト時間（30秒）を超過する
**Then** 処理が中断され、タイムアウトエラーが通知される

**検証方法**:

- 30秒経過後に処理がキャンセルされること
- タイムアウトエラーがUIに表示されること
- 部分的な変更が残らないこと（ロールバック）

---

### AC-10: 不正なHTML入力処理

**Given** index.htmlが不正なHTML形式（パースエラー）である
**When** 逆同期が試行される
**Then** エラーが適切に処理され、structure.mdは変更されない

**検証方法**:

- バリデーションエラーが検出されること
- structure.mdが変更されないこと
- ユーザーに修正を促すメッセージが表示されること

---

### AC-11: キャンセル機能

**Given** 逆同期処理が実行中である
**When** ユーザーがキャンセル操作を行う
**Then** 処理が中断され、元の状態が維持される

**検証方法**:

- AbortControllerを通じて処理がキャンセルされること
- structure.mdが変更されないこと
- UIにキャンセル完了が表示されること

---

### AC-12: 進捗表示

**Given** 逆同期処理が実行中である
**When** 処理が進行する
**Then** 進捗状況がUIに表示される

**検証方法**:

- 0%, 25%, 50%, 75%, 100%の進捗が通知されること
- SyncStatusIndicatorに進捗バーが表示されること
- 各段階の処理内容が表示されること

---

## 統合テスト連携要件

### 接続要件

| 接続要件カテゴリ | 仕様                                                         |
| ---------------- | ------------------------------------------------------------ |
| ファイル監視     | index.htmlの変更検知（chokidar、debounce 500ms）             |
| Agent SDK接続    | Claude Codeへの差分解析リクエスト/レスポンス（timeout 30秒） |
| IPC通信          | Main→Rendererの同期状態通知（SyncStatusIndicator連携）       |
| 無限ループ防止   | changeContextMapの双方向対応（TTL 1秒）                      |

---

## 非機能要件への対応

| 非機能要件 | 受け入れ基準                     |
| ---------- | -------------------------------- |
| レスポンス | 変更検知から同期完了まで5秒以内  |
| 信頼性     | Agent SDK障害時のリトライ（3回） |
| 拡張性     | 新しい差分パターンへの対応が容易 |
| 保守性     | エラーログで問題特定が可能       |

---

## チェックリスト

- [ ] AC-1: index.html変更検知
- [ ] AC-2: 逆同期トリガー
- [ ] AC-3: Claude Code差分解析
- [ ] AC-4: structure.md更新
- [ ] AC-5: 無限ループ防止（逆方向）
- [ ] AC-6: 双方向無限ループ防止
- [ ] AC-7: 同期成功状態通知
- [ ] AC-8: エラーハンドリング（Agent SDK障害）
- [ ] AC-9: エラーハンドリング（タイムアウト）
- [ ] AC-10: 不正なHTML入力処理
- [ ] AC-11: キャンセル機能
- [ ] AC-12: 進捗表示

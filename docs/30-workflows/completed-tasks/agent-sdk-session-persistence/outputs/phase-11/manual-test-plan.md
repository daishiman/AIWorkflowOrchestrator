# Phase 11: 手動テスト計画

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| 文書種別   | 手動テスト計画                |
| Phase      | 11                            |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |
| ステータス | 計画完了（実行待ち）          |

---

## 1. 概要

セッション永続化機能の手動テスト計画を定義する。実際のElectronアプリでの動作確認が必要。

**注意**: このPhaseは実際のアプリケーション実行環境が必要なため、ユーザーによる手動テストが必要です。

---

## 2. テスト環境

### 前提条件

- Electronアプリがビルド可能であること
- 開発環境でアプリを起動できること
- IPCハンドラーがmain.tsに登録されていること

### 起動コマンド

```bash
pnpm --filter @repo/desktop dev
```

---

## 3. テストケース

### TC-01: セッション作成と保存

**手順**:

1. アプリを起動する
2. Agent SDKで新しいセッションを開始する
3. メッセージを数件送信する
4. アプリを終了する
5. アプリを再起動する

**期待結果**:

- [ ] セッションが永続化されている
- [ ] メッセージ履歴が復元される

### TC-02: セッション一覧表示

**手順**:

1. 複数のセッションを作成する
2. セッション一覧を表示する

**期待結果**:

- [ ] 全セッションが表示される
- [ ] lastAccessedAtの降順でソートされている

### TC-03: セッション削除

**手順**:

1. セッションを選択する
2. セッションを削除する
3. アプリを再起動する

**期待結果**:

- [ ] セッションが削除されている
- [ ] 関連メッセージも削除されている

### TC-04: LRU削除

**手順**:

1. 設定でmaxSessionsを小さい値（例: 3）に設定
2. 4つ以上のセッションを作成する
3. cleanup APIを呼び出す

**期待結果**:

- [ ] 最も古いセッションが削除される
- [ ] 新しいセッションは保持される

### TC-05: ストレージ統計

**手順**:

1. いくつかのセッションとメッセージを作成
2. getStats APIを呼び出す

**期待結果**:

- [ ] totalSessions, totalMessages が正しい
- [ ] usedSize が妥当な値
- [ ] usageRatio が計算されている

### TC-06: バリデーションエラー

**手順**:

1. 不正なデータ形式でsaveSession APIを呼び出す

**期待結果**:

- [ ] VALIDATION_ERROR が返される
- [ ] アプリがクラッシュしない

### TC-07: 全データクリア

**手順**:

1. セッションとメッセージを作成
2. clearAll API（confirm: true）を呼び出す
3. セッション一覧を確認

**期待結果**:

- [ ] 全データがクリアされている
- [ ] アプリを再起動しても空のまま

---

## 4. ストレージファイル確認

### ファイル場所

**macOS**:

```
~/Library/Application Support/AIWorkflowOrchestrator/agent-sessions.json
```

**Windows**:

```
%APPDATA%/AIWorkflowOrchestrator/agent-sessions.json
```

**Linux**:

```
~/.config/AIWorkflowOrchestrator/agent-sessions.json
```

### 確認項目

- [ ] ファイルが作成されている
- [ ] JSON形式で正しく保存されている
- [ ] sessions, messages, metadata の構造が正しい

---

## 5. 統合確認

### IPCハンドラー登録

main.tsに以下の登録コードが必要:

```typescript
import {
  registerSessionPersistenceHandlers,
  unregisterSessionPersistenceHandlers,
} from "./ipc/session-persistence-handler";
import { SessionPersistenceService } from "./services/session/SessionPersistenceService";

// アプリ起動時
const sessionService = new SessionPersistenceService();
registerSessionPersistenceHandlers(sessionService);

// アプリ終了時
app.on("before-quit", () => {
  unregisterSessionPersistenceHandlers();
});
```

---

## 6. 完了条件

- [ ] TC-01〜TC-07 が全てパス
- [ ] ストレージファイルが正しく生成される
- [ ] エラー時にアプリがクラッシュしない
- [ ] パフォーマンスに問題がない

---

## 7. 備考

### 現時点での状況

- Main Process側の実装（サービス、IPCハンドラー）は完了
- Renderer側（UI）の実装は本ワークフロー範囲外
- 実際のE2Eテストには追加の統合作業が必要

### 推奨事項

1. IPCハンドラーをmain.tsに登録してアプリを起動
2. DevToolsでIPC呼び出しを確認
3. ストレージファイルの内容を直接確認

# Phase 5: 実装 成果物

## 変更ファイル一覧

### 1. chatSlice.ts

- ChatSlice interface: `chatError: string | null` と `clearChatError: () => void` 追加
- 初期state: `chatError: null` 追加
- callLLMAPI: 戻り値型に `error?: string` 追加、各エラーパスでエラーコード返却
  - window未定義: `AI_UNAVAILABLE`
  - response.success=false + error(string): そのまま伝搬
  - response.success=false + errorなし/非string: `UNKNOWN_ERROR`
  - catch: `API_CALL_FAILED`
- sendMessage: 冒頭で `chatError: null` クリア、失敗時に `chatError` 設定
- clearChatError: `set({ chatError: null })` 実装
- resetChat: `chatError: null` 追加

### 2. store/index.ts

- `useChatError` 個別セレクタ追加（P31対策）
- `useClearChatError` 個別セレクタ追加（P31対策）

### 3. ChatView/index.tsx

- ERROR_MESSAGES: 8種のエラーコード→日本語メッセージマッピング
- getErrorMessage: フォールバック付きメッセージ取得関数
- エラーバナーJSX: role="alert", ×ボタン aria-label="エラーを閉じる"
- 5秒タイマー: useEffect + setTimeout + clearTimeout クリーンアップ
- 旧ローカルstate [error] / if(error) ブロック削除

## テスト実行結果

- chatSlice.test.ts: 57テスト全 PASS
- ChatView.test.tsx: 31テスト全 PASS

## 設計準拠確認

- Store → View 一方向依存: 維持
- P31対策: 個別セレクタ使用
- P19対策: typeof response.error === "string" 型ガード
- P5対策: useEffect クリーンアップで clearTimeout
- Apple HIG: systemRed 準拠カラー、role="alert"

# NFR 検証項目一覧

## 概要

非機能要件（NFR-1〜NFR-4）の検証方法を定義する。

---

## NFR-1: セキュリティ（IPC経由の機密情報漏洩防止）

### 検証対象

IPC レスポンス（特にエラーレスポンス）に以下の機密情報が含まれないこと:

- API Key / トークン
- スタックトレース（`at Function.run (...)` 形式）
- ファイルシステムの絶対パス（`/Users/...`, `C:\Users\...`）
- IP アドレス・ポート番号

### 検証方法

セキュリティテストで以下を確認:

1. `skill-creator:plan` のエラーレスポンスを取得
2. `error` 文字列に対して以下の正規表現マッチを実行:
   - `/\n\s+at\s+.*/` (スタックトレース) → マッチしないこと
   - `/\/[\w./\\-]+/` (Unixパス) → マッチしないこと
   - `/[A-Z]:\\[\w.\\-]+/i` (Windowsパス) → マッチしないこと
   - `/(token|key|password|secret)=\S+/i` (機密データ) → マッチしないこと
3. `sanitizeErrorMessage()` 関数がエラーハンドラで使用されていることをコードレベルで確認

### 対応テスト

- `skill-creator-integration.test.ts` 内のセキュリティテストセクション

---

## NFR-2: パフォーマンス（plan 30秒以内 / execute 120秒以内）

### 検証対象

- `skill-creator:plan`: 30秒以内にレスポンスが返ること
- `skill-creator:execute-plan`: 120秒以内にレスポンスが返ること

### 検証方法

`vi.useFakeTimers()` を使用したタイムアウトテスト:

1. RuntimeSkillCreatorFacade のモックに遅延を設定
2. Fake timer を使って時間を進める
3. 30秒/120秒経過後にタイムアウトが発生することを確認
4. 制限時間内にレスポンスが返る場合は正常完了を確認

注意: 実際の LLM API 呼び出しは行わない（モック使用）。パフォーマンス基準はテストインフラレベルで検証し、実環境でのパフォーマンスは Phase 11（手動テスト）で確認する。

### 対応テスト

- `skill-creator-integration.test.ts` 内のパフォーマンステストセクション

---

## NFR-3: 後方互換（既存 skill:create API の非破壊）

### 検証対象

既存の `skill:create` チャンネル（`IPC_CHANNELS.SKILL_CREATE`）が新しい `skill-creator:plan` / `skill-creator:execute-plan` と共存し、破壊されないこと。

### 検証方法

シナリオE で以下を確認:

1. `skill:create` ハンドラーが `skillHandlers.ts` で登録されていること
2. 新規 `skill-creator:plan` ハンドラーが `creatorHandlers.ts` で登録されていること
3. 両方のハンドラーが同時に登録・動作可能であること
4. `skill:create` の引数・レスポンス形式が既存仕様と一致すること

### 対応テスト

- `skill-creator-integration.test.ts` シナリオE

---

## NFR-4: エラー耐性（LLM エラー後のクラッシュ防止）

### 検証対象

LLM エラー（ネットワーク障害、タイムアウト、不正レスポンス等）発生後にアプリケーションがクラッシュせず、正常にリトライ可能であること。

### 検証方法

シナリオC で以下を確認:

1. RuntimeSkillCreatorFacade がエラーをスローした場合、IPC ハンドラーが `{ success: false, error: string }` を返すこと
2. エラーレスポンス後に同じチャネルへの再リクエストが正常に処理されること（リトライ可能性）
3. エラーが catch 句で適切に捕捉され、プロセスが終了しないこと
4. `sanitizeErrorMessage()` によりエラーメッセージがサニタイズされること

### 対応テスト

- `skill-creator-integration.test.ts` シナリオC
- `terminal-handoff.test.ts` のエラーケース

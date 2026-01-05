# マルチパートアップロード - 基礎概念

## 概要

マルチパートアップロードは、大容量ファイルを小さなチャンク（パート）に分割して
順次または並列にアップロードする技術。ネットワーク障害への耐性と中断再開機能を提供する。

## 核心概念

### チャンク（Chunk/Part）

```typescript
interface Chunk {
  index: number; // チャンク番号（0始まり）
  start: number; // 開始バイト位置
  end: number; // 終了バイト位置
  size: number; // チャンクサイズ（バイト）
  data: ArrayBuffer; // チャンクデータ
  checksum?: string; // SHA-256またはMD5ハッシュ
}
```

- ファイルを分割した単位
- 各チャンクは独立して転送可能
- 失敗時は該当チャンクのみ再送

### アップロードセッション

```typescript
interface UploadSession {
  uploadId: string; // セッション識別子
  fileName: string; // ファイル名
  fileSize: number; // ファイル総サイズ
  chunkSize: number; // チャンクサイズ
  totalChunks: number; // 総チャンク数
  completedChunks: number[]; // 完了チャンク番号
  status: UploadStatus; // 状態
}

type UploadStatus =
  | "initiated" // 開始済み
  | "uploading" // アップロード中
  | "paused" // 一時停止
  | "completing" // 完了処理中
  | "completed" // 完了
  | "failed"; // 失敗
```

## チャンクサイズ決定

### ファイルサイズ別推奨値

| ファイルサイズ | チャンクサイズ | 理由                   |
| -------------- | -------------- | ---------------------- |
| < 10MB         | 分割なし       | オーバーヘッド回避     |
| 10MB-100MB     | 5MB            | バランス重視           |
| 100MB-500MB    | 10MB           | 効率と安定性のバランス |
| 500MB-1GB      | 20MB           | 効率優先               |
| > 1GB          | 50MB           | メモリ効率考慮         |

### ネットワーク品質による調整

```
高速・安定: 標準サイズ × 1.5
中速・普通: 標準サイズ
低速・不安定: 標準サイズ × 0.5
```

## アップロードフロー

### 基本フロー

```
1. セッション開始
   └→ サーバーからuploadIdを取得

2. チャンク分割
   └→ ファイルをチャンクに分割

3. チャンクアップロード
   ├→ チャンク1 → 成功
   ├→ チャンク2 → 成功
   ├→ チャンク3 → 失敗 → リトライ → 成功
   └→ ...

4. 完了処理
   └→ サーバーでファイルを結合
```

### シーケンス図

```
Client                    Server
  |                          |
  |--- InitiateUpload ------>|
  |<-- UploadId -------------|
  |                          |
  |--- UploadPart(1) ------->|
  |<-- PartETag -------------|
  |                          |
  |--- UploadPart(2) ------->|
  |<-- PartETag -------------|
  |                          |
  |--- CompleteUpload ------>|
  |<-- FileLocation ---------|
```

## リトライ戦略

### 指数バックオフ

```typescript
function calculateBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000,
): number {
  const delay = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;
  return Math.min(delay + jitter, maxDelayMs);
}
```

### リトライ条件

| エラータイプ           | リトライ | 理由                 |
| ---------------------- | -------- | -------------------- |
| ネットワークエラー     | ○        | 一時的な障害         |
| タイムアウト           | ○        | 一時的な遅延         |
| 5xx サーバーエラー     | ○        | サーバー側の一時障害 |
| 4xx クライアントエラー | ×        | リクエストに問題     |
| チェックサム不一致     | ○        | 転送エラー           |

## 進捗追跡

### 進捗情報

```typescript
interface UploadProgress {
  uploadedBytes: number; // アップロード済みバイト数
  totalBytes: number; // 総バイト数
  completedChunks: number; // 完了チャンク数
  totalChunks: number; // 総チャンク数
  percentage: number; // 進捗率（0-100）
  speedBps: number; // 転送速度（バイト/秒）
  estimatedSeconds: number; // 推定残り時間（秒）
}
```

### 計算方法

```typescript
function calculateProgress(
  uploadedBytes: number,
  totalBytes: number,
  elapsedMs: number
): UploadProgress {
  const percentage = (uploadedBytes / totalBytes) * 100;
  const speedBps = (uploadedBytes / elapsedMs) * 1000;
  const remainingBytes = totalBytes - uploadedBytes;
  const estimatedSeconds = remainingBytes / speedBps;

  return { percentage, speedBps, estimatedSeconds, ... };
}
```

## チェックサム検証

### 目的

- データ整合性の保証
- 転送エラーの検出
- 改ざん検知

### 実装パターン

```typescript
async function calculateChecksum(
  data: ArrayBuffer,
  algorithm: "SHA-256" | "MD5" = "SHA-256",
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
```

## 判断基準

### スキル適用タイミング

- 大容量ファイル（10MB超）のアップロード実装時
- 中断再開可能なアップロード機能が必要な時
- 転送進捗のリアルタイム表示が必要な時
- チェックサム検証によるデータ整合性が必要な時

### 前提条件

- サーバー側がマルチパートアップロードに対応している
- ファイルサイズがわかっている
- クライアントがファイルを分割処理できる

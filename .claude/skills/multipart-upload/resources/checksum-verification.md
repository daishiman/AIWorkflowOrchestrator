# チェックサム検証

## 概要

ファイル転送中のデータ整合性を保証するためのチェックサム検証手法。

## アルゴリズム選択

| アルゴリズム | 出力長 | 速度 | セキュリティ | 推奨用途 |
|-------------|-------|------|------------|---------|
| MD5 | 128bit | 最速 | 低 | 内部システム、非機密 |
| SHA-1 | 160bit | 高速 | 中 | レガシー互換 |
| SHA-256 | 256bit | 中速 | 高 | **推奨**、一般用途 |
| SHA-512 | 512bit | 中速 | 最高 | 高セキュリティ要件 |
| CRC32 | 32bit | 最速 | 最低 | 簡易破損検出のみ |

**推奨**: SHA-256（セキュリティと速度のバランス）

## ストリーム計算

### メモリ効率の良い計算

```typescript
import { createHash } from 'crypto';
import { createReadStream } from 'fs';

async function calculateFileHash(
  filePath: string,
  algorithm: string = 'sha256'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = createReadStream(filePath);

    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}
```

### チャンク単位計算

```typescript
function calculateChunkHash(
  chunk: Buffer,
  algorithm: string = 'sha256'
): string {
  return createHash(algorithm).update(chunk).digest('hex');
}
```

## 検証プロセス

### 1. 送信前検証

```
1. ローカルファイルのハッシュ値を計算
2. ハッシュ値をメタデータに含める
3. アップロードリクエストに添付
```

### 2. サーバー側検証

```
1. 受信データのハッシュ値を計算
2. クライアントから送信されたハッシュと比較
3. 不一致の場合はエラーレスポンス
```

### 3. 確認レスポンス

```typescript
interface UploadResponse {
  success: boolean;
  serverHash: string;      // サーバーで計算したハッシュ
  clientHash: string;      // クライアントから送信されたハッシュ
  hashMatch: boolean;      // 一致判定
  fileId?: string;         // 成功時のファイルID
  error?: string;          // エラー時のメッセージ
}
```

## 不一致時の対応

### リトライ戦略

1. **即時リトライ**: 一時的なネットワーク問題の可能性
2. **チャンクサイズ縮小**: 転送中の破損を減らす
3. **エラーログ記録**: 問題の追跡と分析

### エラーメッセージ

```typescript
interface ChecksumError {
  code: 'CHECKSUM_MISMATCH';
  expected: string;      // 期待されたハッシュ
  received: string;      // 受信したハッシュ
  filePath: string;      // ファイルパス
  chunkIndex?: number;   // チャンク番号（分割時）
}
```

## ベストプラクティス

### すべきこと

1. **ストリーム処理**: 大容量ファイルでもメモリを節約
2. **同一アルゴリズム**: クライアント・サーバーで統一
3. **チャンク単位検証**: 早期に破損を検出
4. **ログ記録**: 不一致の追跡と分析

### 避けるべきこと

1. **検証省略**: データ整合性の保証がない
2. **弱いアルゴリズム**: MD5のみの使用（セキュリティ重視の場合）
3. **全体読み込み**: メモリ不足のリスク

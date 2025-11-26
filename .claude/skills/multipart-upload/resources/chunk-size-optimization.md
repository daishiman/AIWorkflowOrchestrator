# チャンクサイズ最適化ガイド

## 最適チャンクサイズ決定要因

### 1. ネットワーク帯域幅
- **高速（100Mbps+）**: 10-20MB チャンク
- **中速（10-100Mbps）**: 5-10MB チャンク
- **低速（< 10Mbps）**: 1-5MB チャンク

### 2. ネットワーク安定性
- **安定**: 大きめのチャンク（効率優先）
- **普通**: 標準チャンク（バランス）
- **不安定**: 小さめのチャンク（リトライコスト削減）

### 3. ファイルサイズ
- **< 10MB**: チャンク分割不要
- **10-100MB**: 5MB チャンク
- **100MB-1GB**: 10MB チャンク
- **> 1GB**: 20MB チャンク

## チャンクサイズの影響

### 大きすぎる場合の問題
- リトライ時の転送コストが高い
- メモリ使用量が増加
- タイムアウトリスクが上昇

### 小さすぎる場合の問題
- HTTPリクエスト数が増加
- オーバーヘッドが大きい
- 総転送時間が長くなる

## 推奨設定

```typescript
function calculateOptimalChunkSize(fileSize: number, networkSpeed: number): number {
  // ファイルサイズベース
  let chunkSize: number;

  if (fileSize < 10 * 1024 * 1024) {
    return fileSize; // 分割不要
  } else if (fileSize < 100 * 1024 * 1024) {
    chunkSize = 5 * 1024 * 1024; // 5MB
  } else if (fileSize < 1024 * 1024 * 1024) {
    chunkSize = 10 * 1024 * 1024; // 10MB
  } else {
    chunkSize = 20 * 1024 * 1024; // 20MB
  }

  // ネットワーク速度による調整
  if (networkSpeed < 1 * 1024 * 1024) { // < 1MB/s
    chunkSize = Math.min(chunkSize, 2 * 1024 * 1024); // 最大2MB
  } else if (networkSpeed > 10 * 1024 * 1024) { // > 10MB/s
    chunkSize = Math.max(chunkSize, 20 * 1024 * 1024); // 最小20MB
  }

  return chunkSize;
}
```

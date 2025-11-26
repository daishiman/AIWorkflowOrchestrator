# 進捗追跡パターン

## 概要

アップロード進捗のリアルタイム追跡とユーザーフィードバックのための実装パターン。

## 進捗データ構造

```typescript
interface UploadProgress {
  // 基本情報
  loaded: number;           // アップロード済みバイト数
  total: number;            // 総ファイルサイズ
  percentage: number;       // 進捗率 (0-100)

  // 速度情報
  speed: number;            // 現在の転送速度 (bytes/sec)
  averageSpeed: number;     // 平均転送速度

  // 時間情報
  elapsedTime: number;      // 経過時間 (秒)
  estimatedTime: number;    // 推定残り時間 (秒)

  // チャンク情報（分割時）
  currentChunk: number;     // 現在のチャンク番号
  totalChunks: number;      // 総チャンク数

  // ステータス
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'error';
}
```

## イベント設計

### イベント種類

| イベント | タイミング | データ |
|---------|-----------|--------|
| `start` | アップロード開始 | 初期状態 |
| `progress` | 進捗更新（定期的） | UploadProgress |
| `chunk-complete` | チャンク完了 | チャンク番号 |
| `pause` | 一時停止 | 現在状態 |
| `resume` | 再開 | 現在状態 |
| `complete` | 完了 | 最終結果 |
| `error` | エラー発生 | エラー詳細 |

### イベント発火間隔

- **推奨**: 100ms-500ms
- **最小**: 50ms（UIの反応性）
- **最大**: 1000ms（ユーザー体験）

## 速度計算

### 瞬間速度

```typescript
function calculateInstantSpeed(
  bytesTransferred: number,
  timeElapsed: number
): number {
  if (timeElapsed <= 0) return 0;
  return bytesTransferred / timeElapsed;
}
```

### 移動平均速度

```typescript
class SpeedCalculator {
  private samples: number[] = [];
  private readonly windowSize = 10;

  addSample(speed: number): void {
    this.samples.push(speed);
    if (this.samples.length > this.windowSize) {
      this.samples.shift();
    }
  }

  getAverageSpeed(): number {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((a, b) => a + b, 0);
    return sum / this.samples.length;
  }
}
```

## 推定残り時間

### 計算方法

```typescript
function estimateRemainingTime(
  remainingBytes: number,
  averageSpeed: number
): number {
  if (averageSpeed <= 0) return Infinity;
  return remainingBytes / averageSpeed;
}
```

### 表示形式

| 残り時間 | 表示形式 |
|---------|---------|
| < 1分 | 「まもなく完了」 |
| 1-60分 | 「約X分」 |
| 1-24時間 | 「約X時間Y分」 |
| > 24時間 | 「1日以上」 |

## キャンセル機能

### AbortController使用

```typescript
const controller = new AbortController();

// アップロード開始
fetch(url, {
  method: 'POST',
  body: formData,
  signal: controller.signal
});

// キャンセル
function cancelUpload() {
  controller.abort();
}
```

### クリーンアップ

- 一時ファイルの削除
- サーバーへのキャンセル通知
- UIのリセット

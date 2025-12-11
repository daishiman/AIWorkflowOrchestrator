# ログローテーションパターンガイド

## ローテーション方式の比較

### サイズベースローテーション

ファイルサイズが閾値に達したときにローテーション。

```
app.log (10MB) → ローテーション発生
↓
app.log (新規)
app.log.1 (10MB)
app.log.2 (10MB)
...
app.log.N (削除)
```

**メリット**:

- ディスク使用量の予測が容易
- ログ量が多い時も安定動作

**デメリット**:

- 時系列での検索が困難
- ファイル間で日付が跨る

**設定例（Winston）**:

```javascript
new winston.transports.File({
  filename: "logs/app.log",
  maxsize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  tailable: true,
});
```

### 時間ベースローテーション

一定時間ごとにローテーション。

```
毎日0時にローテーション:
app-2025-01-15.log
app-2025-01-16.log
app-2025-01-17.log
```

**メリット**:

- 日付でのログ検索が容易
- 時系列分析に最適

**デメリット**:

- ログ量によりファイルサイズが不均一
- 大量ログ時にディスク圧迫

**設定例（winston-daily-rotate-file）**:

```javascript
new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});
```

### ハイブリッドローテーション

サイズと時間の両方でローテーション。

```
1日ごと または 100MB到達時にローテーション:
app-2025-01-15.log      (50MB - 通常日)
app-2025-01-16.log      (100MB)
app-2025-01-16.1.log    (100MB - 同日2つ目)
app-2025-01-16.2.log    (30MB - 同日3つ目)
```

**メリット**:

- 両方のメリットを享受
- 柔軟なディスク管理

**設定例**:

```javascript
new DailyRotateFile({
  filename: "logs/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "100m", // サイズ制限
  maxFiles: "14d", // 時間制限
});
```

## 推奨パターン

### 開発環境

```javascript
// シンプルなサイズベース
{
  maxsize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3
}
```

### ステージング環境

```javascript
// 時間ベース（短期保持）
{
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d',
  compress: true
}
```

### 本番環境

```javascript
// ハイブリッド（長期保持）
{
  datePattern: 'YYYY-MM-DD',
  maxSize: '100m',
  maxFiles: '30d',
  compress: true,
  auditFile: 'logs/audit.json'
}
```

## ファイル命名パターン

### 日付パターン

| パターン        | 例                    | 用途           |
| --------------- | --------------------- | -------------- |
| `YYYY-MM-DD`    | app-2025-01-15.log    | 日次分析       |
| `YYYY-MM-DD-HH` | app-2025-01-15-14.log | 時間帯分析     |
| `YYYY-MM`       | app-2025-01.log       | 月次アーカイブ |
| `YYYYMMDD`      | app-20250115.log      | ソート容易     |

### 番号パターン

| パターン     | 例          | 説明           |
| ------------ | ----------- | -------------- |
| `.1, .2, .3` | app.log.1   | 古い順         |
| `.log.1`     | app.log.1   | 標準的         |
| `-001`       | app-001.log | ゼロパディング |

## 圧縮戦略

### gzip圧縮

```javascript
{
  compress: true,           // winston-daily-rotate-file
  compressOnRotate: true    // rotating-file-stream
}
```

**圧縮率目安**:

- テキストログ: 約90%削減
- JSONログ: 約85%削減

### 遅延圧縮

```javascript
// logrotate
{
  compress: true,
  delaycompress: true  // 1世代後に圧縮
}
```

**メリット**:

- 直近ログの即座アクセス
- 圧縮処理の負荷分散

## ディスク容量計算

### 計算式

```
必要容量 = 1日のログ量 × 保持日数 × (1 - 圧縮率)

例:
- 1日100MBのログ
- 30日保持
- 90%圧縮

必要容量 = 100MB × 30 × 0.1 = 300MB
(圧縮なしなら3GB)
```

### 容量監視

```bash
# ログディレクトリの使用量
du -sh /var/log/myapp/

# 日付別使用量
du -h /var/log/myapp/*.log | sort -h
```

## トラブルシューティング

### ログファイルが増え続ける

**原因**: ローテーション設定が適用されていない

**対処**:

```bash
# 設定確認
pm2 conf pm2-logrotate

# 手動ローテーション
pm2 flush
```

### ローテーション後にログが書き込まれない

**原因**: ファイルハンドルが古いファイルを参照

**対処**:

```javascript
// copytruncate使用（logrotate）
{
  copytruncate: true
}

// または、シグナルでリロード
postrotate
  kill -USR1 $(cat /var/run/myapp.pid)
endscript
```

### 圧縮ファイルが壊れる

**原因**: 書き込み中に圧縮が実行

**対処**:

```javascript
// delaycompressを有効化
{
  compress: true,
  delaycompress: true
}
```

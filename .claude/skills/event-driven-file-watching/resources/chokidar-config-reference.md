# Chokidar設定リファレンス

## 設定オプション詳細

### 1. ignored（除外パターン）

```typescript
// 文字列パターン
ignored: '**/node_modules/**'

// 正規表現
ignored: /node_modules|\.git/

// 関数
ignored: (path: string) => path.includes('temp')

// 配列（複数パターン）
ignored: [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/*.tmp',
  '**/*.swp',
  '**/~$*',           // Office一時ファイル
  '**/.DS_Store',     // macOS
  '**/Thumbs.db'      // Windows
]
```

### 2. awaitWriteFinish（書き込み完了待機）

```typescript
// 無効（即時イベント発火）
awaitWriteFinish: false

// 有効（安定性チェック）
awaitWriteFinish: {
  stabilityThreshold: 100,  // ファイルサイズが安定するまでの待機時間(ms)
  pollInterval: 50          // ファイルサイズチェック間隔(ms)
}
```

**推奨値**:
- 小さいファイル（<1MB）: stabilityThreshold: 100, pollInterval: 50
- 中程度のファイル（1-10MB）: stabilityThreshold: 300, pollInterval: 100
- 大きいファイル（>10MB）: stabilityThreshold: 1000, pollInterval: 200

### 3. usePolling（監視方式）

```typescript
// ネイティブfsevents使用（推奨）
usePolling: false

// Polling使用（NFS/Docker向け）
usePolling: true,
interval: 1000,        // 通常ファイルのチェック間隔(ms)
binaryInterval: 3000   // バイナリファイルのチェック間隔(ms)
```

**usePolling: true が必要な環境**:
- NFS（Network File System）
- Docker volumes（bind mount）
- VirtualBox共有フォルダ
- CIFS/SMBマウント
- その他ネットワークファイルシステム

### 4. depth（監視深度）

```typescript
// 無制限（全サブディレクトリ）
depth: undefined

// 直下のみ
depth: 0

// 2階層まで
depth: 1
```

### 5. その他のオプション

```typescript
{
  // 初期スキャンでイベント発火しない
  ignoreInitial: true,

  // 監視を継続（デーモン化）
  persistent: true,

  // パーミッションエラーを無視
  ignorePermissionErrors: true,

  // シンボリックリンクを追跡
  followSymlinks: false,

  // 隠しファイルを監視
  // (ignoredで明示的に除外推奨)

  // 生イベントを発火
  alwaysStat: false,      // statsを常に取得
  atomic: 100,            // アトミック書き込み検出遅延(ms)
  disableGlobbing: false  // globパターン無効化
}
```

---

## 環境別設定プリセット

### 開発環境（ローカルSSD）

```typescript
const devConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 100,
    pollInterval: 50
  },
  usePolling: false,
  ignored: [
    '**/node_modules/**',
    '**/.git/**',
    '**/dist/**',
    '**/*.log',
    '**/.DS_Store'
  ],
  followSymlinks: false,
  ignorePermissionErrors: true
};
```

### CI/CD環境

```typescript
const ciConfig = {
  persistent: false,  // 一度だけスキャン
  ignoreInitial: false, // 初期ファイルも検出
  awaitWriteFinish: false,
  usePolling: true,
  interval: 500,
  ignored: ['**/node_modules/**'],
  depth: 3
};
```

### Docker環境

```typescript
const dockerConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  },
  usePolling: true,  // 必須
  interval: 1000,
  ignored: [
    '**/node_modules/**',
    '**/.git/**'
  ]
};
```

### 本番環境（PM2管理）

```typescript
const prodConfig = {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100
  },
  usePolling: process.env.USE_POLLING === 'true',
  interval: parseInt(process.env.POLL_INTERVAL || '1000'),
  ignored: process.env.IGNORED_PATTERNS?.split(',') || [
    '**/node_modules/**',
    '**/.git/**'
  ]
};
```

---

## トラブルシューティング

### イベントが発火しない

1. **除外パターンを確認**: 対象ファイルがignoredに含まれていないか
2. **usePollingを試す**: ネットワークFSの場合はpolling必須
3. **パーミッションを確認**: ファイル/ディレクトリの読み取り権限

### イベントが重複発火する

1. **awaitWriteFinishを有効化**: 書き込み完了を待機
2. **stabilityThresholdを増加**: より長い安定待機時間
3. **atomicを設定**: アトミック書き込み検出

### メモリ使用量が増加する

1. **深度制限**: `depth` オプションで監視階層を制限
2. **除外パターン追加**: node_modules等の大規模ディレクトリを除外
3. **リスナー数確認**: `setMaxListeners()` で上限設定

### CPU使用率が高い

1. **usePolling: false**: ネイティブfseventsに切り替え
2. **intervalを増加**: polling間隔を長くする
3. **除外パターン追加**: 監視対象を削減

# PM2 実行モード選択ガイド

## Fork vs Cluster

### Fork Mode

```javascript
{
  exec_mode: 'fork',
  instances: 1
}
```

**特性**:

- 単一プロセス実行
- ステートフル処理可能
- プロセス間通信不要

**適用場面**:

- ファイルI/O中心の処理
- 外部API連携処理
- バックグラウンドジョブ
- ステートフルな処理

**利点**:

- シンプルな設定
- メモリ効率が良い
- デバッグが容易

### Cluster Mode

```javascript
{
  exec_mode: 'cluster',
  instances: 'max'
}
```

**特性**:

- 複数プロセス実行
- ロードバランシング自動
- ステートレス必須

**適用場面**:

- HTTP/APIサーバー
- 高トラフィック処理
- CPU集約的処理

**利点**:

- マルチコア活用
- 高スループット
- 耐障害性向上

## インスタンス数の決定

### 設定オプション

| 設定値  | 動作              | 用途           |
| ------- | ----------------- | -------------- |
| `1`     | 固定1インスタンス | 単一プロセス   |
| `4`     | 固定4インスタンス | 明示的制御     |
| `'max'` | CPUコア数と同じ   | 最大活用       |
| `0`     | CPUコア数と同じ   | maxと同等      |
| `-1`    | CPUコア数-1       | システム用予約 |

### 選択基準

```
CPUコア数: 8

instances設定 → 実際のプロセス数:
  'max' → 8
  0     → 8
  -1    → 7
  4     → 4
```

### 推奨設定パターン

**開発環境**:

```javascript
{
  exec_mode: 'fork',
  instances: 1
}
```

**本番環境（API）**:

```javascript
{
  exec_mode: 'cluster',
  instances: 'max'  // または具体的な数値
}
```

**本番環境（ワーカー）**:

```javascript
{
  exec_mode: 'fork',
  instances: 1
}
```

## 選択フローチャート

```
アプリケーション特性を確認
    │
    ├─ HTTP/APIサーバー？
    │   └─ はい → cluster mode + instances: 'max'
    │
    ├─ ファイルI/O中心？
    │   └─ はい → fork mode + instances: 1
    │
    ├─ ステートフル処理？
    │   └─ はい → fork mode
    │
    └─ CPU集約的処理？
        └─ はい → cluster mode
```

## 注意事項

### Cluster Mode の制約

1. **ステートレス必須**: セッションやキャッシュは外部化
2. **共有リソース**: Redis/Memcachedでセッション共有
3. **スティッキーセッション**: WebSocket使用時は追加設定必要

### リソース計算

```
メモリ使用量 = 1インスタンスのメモリ × instances数

例:
  1インスタンス = 200MB
  instances: 4
  → 合計 800MB必要
```

### 適切なinstances数

```
推奨: CPUコア数の50-75%

8コアサーバーの場合:
  - API: 4-6 instances
  - 残り: システム + モニタリング
```

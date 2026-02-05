# アーキテクチャ設計書

## メタ情報

| 項目   | 値              |
| ------ | --------------- |
| Phase  | 2               |
| 作成日 | 2026-02-04      |
| 作成者 | Claude Opus 4.5 |

---

## 1. 設計概要

### 1.1 設計方針

| 方針                 | 詳細                                   |
| -------------------- | -------------------------------------- |
| 正となる定義ファイル | `apps/desktop/src/preload/channels.ts` |
| 統一基準             | 仕様書定義のチャンネル名を正とする     |
| 後方互換性           | 既存の機能を維持しつつ段階的に移行     |

### 1.2 チャンネル統一後の構成

```
┌─────────────────────────────────────────────────────────────┐
│                    IPC_CHANNELS 構成                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           スキル管理（仕様準拠）                     │   │
│  │  SKILL_LIST, SKILL_SCAN, SKILL_GET_IMPORTED         │   │
│  │  SKILL_UPDATE, SKILL_IMPORT, SKILL_REMOVE           │   │
│  │  SKILL_GET_DETAIL, SKILL_EXECUTE, SKILL_ABORT       │   │
│  │  SKILL_GET_STATUS                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │            イベント（Main→Renderer）                 │   │
│  │  SKILL_COMPLETE, SKILL_ERROR, SKILL_STREAM          │   │
│  │  SKILL_PERMISSION_REQUEST                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           権限管理（双方向）                         │   │
│  │  SKILL_PERMISSION_REQUEST (M→R)                      │   │
│  │  SKILL_PERMISSION_RESPONSE (R→M)                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           スキル改善（TASK-9C）                      │   │
│  │  SKILL_ANALYZE, SKILL_IMPROVE, SKILL_OPTIMIZE       │   │
│  │  SKILL_OPTIMIZE_VARIANTS, SKILL_OPTIMIZE_EVALUATE   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           削除対象（旧チャンネル）                   │   │
│  │  ✗ SKILL_LIST_AVAILABLE → SKILL_LIST に統一         │   │
│  │  ✗ SKILL_LIST_IMPORTED  → SKILL_GET_IMPORTED に統一 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. コンポーネント設計

### 2.1 Preload層

| ファイル     | 役割                                     |
| ------------ | ---------------------------------------- |
| channels.ts  | IPC_CHANNELS定義（単一の正）             |
| skill-api.ts | SkillAPI実装（IPC_CHANNELS経由呼び出し） |

### 2.2 Main Process層

| ファイル         | 役割                                |
| ---------------- | ----------------------------------- |
| skillHandlers.ts | IPCハンドラー（新チャンネル名対応） |
| SkillService.ts  | スキル管理ロジック（変更なし）      |

---

## 3. IPC_CHANNELS定数構造（統合後）

### 3.1 スキル管理チャンネル

| 定数名             | 値                  | 方向 | 用途                 |
| ------------------ | ------------------- | ---- | -------------------- |
| SKILL_LIST         | `skill:list`        | R→M  | スキル一覧取得       |
| SKILL_SCAN         | `skill:scan`        | R→M  | ディレクトリスキャン |
| SKILL_GET_IMPORTED | `skill:getImported` | R→M  | インポート済み取得   |
| SKILL_UPDATE       | `skill:update`      | R→M  | 設定更新             |
| SKILL_IMPORT       | `skill:import`      | R→M  | スキルインポート     |
| SKILL_REMOVE       | `skill:remove`      | R→M  | スキル削除           |
| SKILL_GET_DETAIL   | `skill:get-detail`  | R→M  | スキル詳細取得       |
| SKILL_EXECUTE      | `skill:execute`     | R→M  | スキル実行           |
| SKILL_ABORT        | `skill:abort`       | R→M  | 実行中断             |
| SKILL_GET_STATUS   | `skill:get-status`  | R→M  | 状態取得             |

### 3.2 イベントチャンネル

| 定数名                   | 値                         | 方向 | 用途           |
| ------------------------ | -------------------------- | ---- | -------------- |
| SKILL_COMPLETE           | `skill:complete`           | M→R  | 完了イベント   |
| SKILL_ERROR              | `skill:error`              | M→R  | エラーイベント |
| SKILL_STREAM             | `skill:stream`             | M→R  | ストリーム     |
| SKILL_PERMISSION_REQUEST | `skill:permission:request` | M→R  | 権限リクエスト |

### 3.3 権限チャンネル

| 定数名                    | 値                          | 方向 | 用途           |
| ------------------------- | --------------------------- | ---- | -------------- |
| SKILL_PERMISSION_RESPONSE | `skill:permission:response` | R→M  | 権限レスポンス |

### 3.4 スキル改善チャンネル（TASK-9C）

| 定数名                  | 値                        | 方向 | 用途             |
| ----------------------- | ------------------------- | ---- | ---------------- |
| SKILL_ANALYZE           | `skill:analyze`           | R→M  | スキル分析       |
| SKILL_IMPROVE           | `skill:improve`           | R→M  | スキル改善       |
| SKILL_OPTIMIZE          | `skill:optimize`          | R→M  | プロンプト最適化 |
| SKILL_OPTIMIZE_VARIANTS | `skill:optimize:variants` | R→M  | バリアント生成   |
| SKILL_OPTIMIZE_EVALUATE | `skill:optimize:evaluate` | R→M  | プロンプト評価   |

---

## 4. ホワイトリスト構成（統合後）

### 4.1 ALLOWED_INVOKE_CHANNELS（Renderer→Main）

削除対象:

- `IPC_CHANNELS.SKILL_LIST_AVAILABLE`
- `IPC_CHANNELS.SKILL_LIST_IMPORTED`

維持・追加:

- `IPC_CHANNELS.SKILL_LIST`
- `IPC_CHANNELS.SKILL_SCAN`
- `IPC_CHANNELS.SKILL_GET_IMPORTED`
- `IPC_CHANNELS.SKILL_UPDATE`
- `IPC_CHANNELS.SKILL_IMPORT`
- `IPC_CHANNELS.SKILL_REMOVE`
- `IPC_CHANNELS.SKILL_GET_DETAIL`
- `IPC_CHANNELS.SKILL_EXECUTE`
- `IPC_CHANNELS.SKILL_ABORT`
- `IPC_CHANNELS.SKILL_GET_STATUS`
- `IPC_CHANNELS.SKILL_PERMISSION_RESPONSE`
- `IPC_CHANNELS.SKILL_ANALYZE`
- `IPC_CHANNELS.SKILL_IMPROVE`
- `IPC_CHANNELS.SKILL_OPTIMIZE`
- `IPC_CHANNELS.SKILL_OPTIMIZE_VARIANTS`
- `IPC_CHANNELS.SKILL_OPTIMIZE_EVALUATE`

### 4.2 ALLOWED_ON_CHANNELS（Main→Renderer）

- `IPC_CHANNELS.SKILL_STREAM`
- `IPC_CHANNELS.SKILL_COMPLETE`
- `IPC_CHANNELS.SKILL_ERROR`
- `IPC_CHANNELS.SKILL_PERMISSION_REQUEST`

---

## 5. セキュリティ設計

### 5.1 safeInvoke/safeOnパターン維持

| パターン   | 実装                                       | 効果                 |
| ---------- | ------------------------------------------ | -------------------- |
| safeInvoke | ALLOWED_INVOKE_CHANNELS.includes()チェック | 未許可チャンネル拒否 |
| safeOn     | ALLOWED_ON_CHANNELS.includes()チェック     | 未許可イベント拒否   |

### 5.2 sender検証維持

| ハンドラー             | 検証関数            |
| ---------------------- | ------------------- |
| 全スキル関連ハンドラー | validateIpcSender() |

---

## 6. 統合ポイント/契約

| 統合ポイント | 契約定義                                          |
| ------------ | ------------------------------------------------- |
| Preload→Main | IPC_CHANNELSの定数を介した通信                    |
| Main→Preload | ALLOWED_ON_CHANNELSに登録されたイベントチャンネル |
| セキュリティ | safeInvoke/safeOnパターンによるホワイトリスト検証 |

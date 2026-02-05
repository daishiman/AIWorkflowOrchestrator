# Phase 1: 要件定義

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 1                              |
| 機能名 | TASK-FIX-4-1-IPC-CONSOLIDATION |
| 作成日 | 2026-02-04                     |

## 目的

IPCチャンネル統一の目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

### Task 1: 現状チャンネル棚卸し

**目的**: 現在のIPCチャンネル全容を把握する

**手順**:

1. `apps/desktop/src/preload/channels.ts`の定義を確認
2. `packages/shared/src/ipc/channels.ts`の定義を確認（存在する場合）
3. `grep -rn "skill:" apps/desktop/src/`で使用箇所を特定
4. Main Processで実装されているハンドラーを確認

**成果物**: チャンネル棚卸しリスト

### Task 2: 仕様書チャンネル定義確認

**目的**: 仕様書で定義された正式なチャンネル名を確認する

**手順**:

1. `security-skill-ipc.md`のチャンネル定義を確認
2. `interfaces-agent-sdk-skill.md`のIPC仕様を確認
3. 正式チャンネルリストを作成

**正式チャンネル（仕様書定義）**:

| チャンネル                  | 方向 | 用途                       |
| --------------------------- | ---- | -------------------------- |
| `skill:list`                | R→M  | 利用可能スキル一覧取得     |
| `skill:scan`                | R→M  | スキルディレクトリスキャン |
| `skill:getImported`         | R→M  | インポート済みスキル取得   |
| `skill:update`              | R→M  | スキル設定更新             |
| `skill:complete`            | M→R  | 実行完了イベント           |
| `skill:error`               | M→R  | エラーイベント             |
| `skill:permission:request`  | M→R  | 権限リクエスト             |
| `skill:permission:response` | R→M  | 権限レスポンス             |
| `skill:execute`             | R→M  | スキル実行開始             |
| `skill:abort`               | R→M  | 実行中断                   |
| `skill:get-status`          | R→M  | 実行状態取得               |
| `skill:stream`              | M→R  | ストリームメッセージ       |

### Task 3: 重複・不整合の特定

**目的**: 重複チャンネルと不整合を特定する

**確認項目**:

| 現状チャンネル         | 正式チャンネル      | 状態   |
| ---------------------- | ------------------- | ------ |
| `skill:list-available` | `skill:list`        | 要統一 |
| `skill:list-imported`  | `skill:getImported` | 要確認 |
| ハードコード文字列     | IPC_CHANNELS定数    | 要置換 |

### Task 4: 受け入れ基準作成

**目的**: 各要件に検証可能な受け入れ基準を定義する

## 参照資料

| 資料名                   | パス                                                                              | 説明             |
| ------------------------ | --------------------------------------------------------------------------------- | ---------------- |
| スキルIPCセキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | チャンネル定義   |
| Agent SDKスキル仕様      | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | IPC仕様          |
| Electron IPCセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | セキュリティ要件 |

## 統合テスト連携【必須】

接続要件を明記する:

| 接続要件カテゴリ | 記載内容                                 |
| ---------------- | ---------------------------------------- |
| IPC通信          | Renderer→Main、Main→Rendererの双方向通信 |
| セキュリティ     | チャンネルホワイトリスト検証、sender検証 |
| 型安全性         | IPC_CHANNELS定数による型チェック         |

## アーキテクチャ層別要件

| 層           | 確認観点                                       |
| ------------ | ---------------------------------------------- |
| Preload      | contextBridge経由のAPI公開、ホワイトリスト管理 |
| IPC通信      | チャンネル名統一、セキュリティ検証             |
| Main Process | ハンドラー登録、チャンネル名定数使用           |

## 成果物

| 成果物           | パス                                         | 説明               |
| ---------------- | -------------------------------------------- | ------------------ |
| 要件定義書       | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件   |
| チャンネル棚卸し | `outputs/phase-1/channel-inventory.md`       | 現状チャンネル一覧 |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義     | `outputs/phase-1/scope-definition.md`        | 実装範囲           |

## 完了条件

- [ ] 現状のIPCチャンネルが全て棚卸しされている
- [ ] 仕様書定義のチャンネルが特定されている
- [ ] 重複・不整合が一覧化されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計

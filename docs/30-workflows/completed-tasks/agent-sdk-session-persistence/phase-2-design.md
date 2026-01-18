# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                          |
| ---------- | ----------------------------- |
| Phase      | 2                             |
| Phase名    | 設計                          |
| 前提Phase  | Phase 1（要件定義）           |
| 後続Phase  | Phase 3（設計レビューゲート） |
| ステータス | 未実施                        |
| 作成日     | 2026-01-17                    |
| 機能名     | agent-sdk-session-persistence |

---

## 目的

Phase 1で定義した要件に基づき、セッション永続化機能のアーキテクチャ設計・詳細設計を行う。electron-storeを使用した永続化層の設計、IPC通信設計、型定義を完成させる。

## 背景

electron-storeはElectronアプリで広く使用される永続化ライブラリであり、JSONファイルベースでデータを保存する。Main Processで動作するため、Renderer Processからの操作はIPC経由で行う必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: アーキテクチャ設計

**目的**: 永続化機能の全体アーキテクチャを設計する

**実行手順**:

1. 以下のコンポーネント構成を設計:
   - SessionPersistenceService（Main Process）
   - SessionStorage（electron-store wrapper）
   - IPC Handler拡張
   - useSessionPersistence Hook（Renderer Process）
2. データフロー図を作成
3. コンポーネント間の依存関係を整理
4. アーキテクチャ設計書を作成

**期待される成果物**:

- `outputs/phase-2/architecture-design.md`

---

### タスク2: 型定義設計

**目的**: 永続化に必要な型定義を設計する

**実行手順**:

1. 以下の型を設計:

```typescript
// PersistedSession: 永続化対象のセッションデータ
interface PersistedSession {
  id: string;
  name: string;
  createdAt: number;
  lastAccessedAt: number;
  messageCount: number;
}

// SessionPersistenceConfig: 永続化設定
interface SessionPersistenceConfig {
  maxSessions: number; // 最大セッション数（デフォルト: 100）
  maxStorageSize: number; // 最大ストレージサイズ（bytes）
  autoSaveInterval: number; // 自動保存間隔（ms）
}

// SessionStorageState: ストレージ状態
interface SessionStorageState {
  sessions: PersistedSession[];
  config: SessionPersistenceConfig;
  lastUpdated: number;
}
```

2. Zodスキーマを設計
3. 型定義ドキュメントを作成

**期待される成果物**:

- `outputs/phase-2/type-definitions.md`

---

### タスク3: IPC設計

**目的**: Renderer ↔ Main間のIPC通信を設計する

**実行手順**:

1. 以下のIPCチャンネルを設計:

| チャンネル                 | 方向            | 説明                     |
| -------------------------- | --------------- | ------------------------ |
| `session:list-persisted`   | Renderer → Main | 永続化セッション一覧取得 |
| `session:save`             | Renderer → Main | セッション保存           |
| `session:delete`           | Renderer → Main | セッション削除           |
| `session:clear-all`        | Renderer → Main | 全セッション削除         |
| `session:get-storage-info` | Renderer → Main | ストレージ情報取得       |

2. リクエスト/レスポンス型を定義
3. エラーハンドリング方針を設計
4. IPC設計書を作成

**期待される成果物**:

- `outputs/phase-2/ipc-design.md`

---

### タスク4: データ永続化設計

**目的**: electron-storeを使用したデータ永続化の詳細設計

**実行手順**:

1. electron-storeの設定を設計:
   - ストアスキーマ
   - デフォルト値
   - バリデーション
2. LRU削除ポリシーの実装方針を設計
3. 起動時復元フローを設計
4. 永続化設計書を作成

**期待される成果物**:

- `outputs/phase-2/persistence-design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                 |
| ------------------------- | ---------------------------------------------------------------------------- | -------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存セッション型定義 |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン         |

### Phase 1成果物

| 参照資料     | パス                                             | 内容       |
| ------------ | ------------------------------------------------ | ---------- |
| 機能要件     | `outputs/phase-1/functional-requirements.md`     | 機能要件   |
| 非機能要件   | `outputs/phase-1/non-functional-requirements.md` | 非機能要件 |
| スコープ定義 | `outputs/phase-1/scope-definition.md`            | スコープ   |

---

## 成果物

| 成果物             | パス                                     | 内容                   |
| ------------------ | ---------------------------------------- | ---------------------- |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md` | 全体アーキテクチャ     |
| 型定義設計         | `outputs/phase-2/type-definitions.md`    | TypeScript型定義       |
| IPC設計            | `outputs/phase-2/ipc-design.md`          | IPC通信設計            |
| 永続化設計         | `outputs/phase-2/persistence-design.md`  | electron-store詳細設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

- セッション永続化のデータフロー（Renderer → IPC → Main → Store → File）を設計に含めること
- 起動時の復元フロー（File → Store → Main → IPC → Renderer）を設計に含めること
- エラーケース（ストレージ破損、容量超過）のハンドリングを設計に含めること

---

## 完了条件

- [ ] アーキテクチャ設計書が作成されている
- [ ] 型定義設計書が作成されている
- [ ] IPC設計書が作成されている
- [ ] 永続化設計書が作成されている
- [ ] Phase 1の要件が全て設計に反映されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-session-persistence/phase-3-design-review.md`

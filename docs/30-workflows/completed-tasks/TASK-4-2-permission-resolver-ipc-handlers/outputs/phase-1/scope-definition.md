# Phase 1: スコープ定義書

## メタ情報

| 項目       | 値                              |
| ---------- | ------------------------------- |
| タスクID   | TASK-4-2                        |
| フェーズ   | Phase 1                         |
| 作成日     | 2026-01-25                      |
| 機能名     | PermissionResolver IPC Handlers |
| ステータス | 完了                            |

---

## 1. スコープ内（In Scope）

### 1.1 Main Process側

| 項目                   | 詳細                                                    |
| ---------------------- | ------------------------------------------------------- |
| permission-handlers.ts | IPCハンドラーの実装                                     |
| IPCチャネル登録        | `skill:permission-request`, `skill:permission-response` |
| PermissionResolver連携 | resolveRequest()の呼び出し                              |
| セキュリティ検証       | validateIpcSenderによるsender検証                       |

### 1.2 Preload API側

| 項目               | 詳細                                             |
| ------------------ | ------------------------------------------------ |
| channels.ts更新    | 新規IPCチャネルの定義追加                        |
| skill-api.ts更新   | `onPermissionRequest`, `respondPermission`の追加 |
| ホワイトリスト更新 | ALLOWED_ON_CHANNELS, ALLOWED_INVOKE_CHANNELS     |

### 1.3 Renderer Process側

| 項目                   | 詳細                                 |
| ---------------------- | ------------------------------------ |
| PermissionDialog.tsx   | モーダルダイアログコンポーネント     |
| usePermissionDialog.ts | ダイアログ状態管理・キュー処理フック |
| 型定義                 | @repo/shared の既存型を再利用        |

### 1.4 テスト

| 項目       | 詳細                                                   |
| ---------- | ------------------------------------------------------ |
| 単体テスト | permission-handlers.test.ts, PermissionDialog.test.tsx |
| 統合テスト | IPC通信の統合テスト                                    |
| UIテスト   | React Testing Libraryによるコンポーネントテスト        |

---

## 2. スコープ外（Out of Scope）

### 2.1 永続化機能

| 項目               | 理由               |
| ------------------ | ------------------ |
| always_allow永続化 | 別タスクで実装予定 |
| always_deny永続化  | 別タスクで実装予定 |
| 権限履歴の保存     | 別タスクで検討     |

### 2.2 設定UI

| 項目         | 理由                     |
| ------------ | ------------------------ |
| 権限管理画面 | 別タスクで実装予定       |
| 事前許可設定 | 本タスクでは都度確認のみ |

### 2.3 その他

| 項目               | 理由                             |
| ------------------ | -------------------------------- |
| 複数ウィンドウ対応 | 現時点では単一ウィンドウのみ対応 |
| 権限の自動学習     | 将来の機能拡張                   |

---

## 3. 成果物一覧

### 3.1 ソースコード

| ファイル               | パス                                                                   | 種別     |
| ---------------------- | ---------------------------------------------------------------------- | -------- |
| permission-handlers.ts | `apps/desktop/src/main/ipc/permission-handlers.ts`                     | 新規作成 |
| channels.ts            | `apps/desktop/src/preload/channels.ts`                                 | 更新     |
| skill-api.ts           | `apps/desktop/src/preload/skill-api.ts`                                | 更新     |
| PermissionDialog.tsx   | `apps/desktop/src/renderer/components/Permission/PermissionDialog.tsx` | 新規作成 |
| usePermissionDialog.ts | `apps/desktop/src/renderer/hooks/usePermissionDialog.ts`               | 新規作成 |
| index.ts               | `apps/desktop/src/renderer/components/Permission/index.ts`             | 新規作成 |

### 3.2 テストコード

| ファイル                    | パス                                                                                  | 種別     |
| --------------------------- | ------------------------------------------------------------------------------------- | -------- |
| permission-handlers.test.ts | `apps/desktop/src/main/ipc/__tests__/permission-handlers.test.ts`                     | 新規作成 |
| PermissionDialog.test.tsx   | `apps/desktop/src/renderer/components/Permission/__tests__/PermissionDialog.test.tsx` | 新規作成 |
| usePermissionDialog.test.ts | `apps/desktop/src/renderer/hooks/__tests__/usePermissionDialog.test.ts`               | 新規作成 |
| skill-api.test.ts（更新）   | `apps/desktop/src/preload/__tests__/skill-api.test.ts`                                | 更新     |

### 3.3 ドキュメント

| ファイル                   | パス                                         | 種別          |
| -------------------------- | -------------------------------------------- | ------------- |
| requirements-definition.md | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| acceptance-criteria.md     | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |
| scope-definition.md        | `outputs/phase-1/scope-definition.md`        | Phase 1成果物 |

---

## 4. アーキテクチャ図

### 4.1 シーケンス図

```
┌──────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│ SkillExecutor │     │PermissionResolver│     │  Preload API    │     │PermissionDialog│
└──────┬───────┘     └────────┬────────┘     └────────┬────────┘     └──────┬───────┘
       │                      │                       │                      │
       │ waitForResponse()    │                       │                      │
       │─────────────────────>│                       │                      │
       │                      │                       │                      │
       │                      │ skill:permission-request                     │
       │                      │──────────────────────>│                      │
       │                      │                       │                      │
       │                      │                       │ onPermissionRequest  │
       │                      │                       │─────────────────────>│
       │                      │                       │                      │
       │                      │                       │    [ユーザー判断]     │
       │                      │                       │                      │
       │                      │                       │ respondPermission    │
       │                      │                       │<─────────────────────│
       │                      │                       │                      │
       │                      │ skill:permission-response                    │
       │                      │<──────────────────────│                      │
       │                      │                       │                      │
       │                      │ resolveRequest()      │                      │
       │                      │────────┐              │                      │
       │                      │        │              │                      │
       │                      │<───────┘              │                      │
       │                      │                       │                      │
       │  Promise resolved    │                       │                      │
       │<─────────────────────│                       │                      │
       │                      │                       │                      │
```

### 4.2 コンポーネント図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Main Process                             │
│  ┌─────────────────┐    ┌───────────────────────┐               │
│  │ SkillExecutor   │    │ permission-handlers.ts │               │
│  │                 │    │                       │               │
│  │  ┌──────────────┴──┐ │  - sendPermissionRequest()           │
│  │  │PermissionResolver│ │  - handlePermissionResponse()        │
│  │  └─────────────────┘ │                       │               │
│  └─────────────────────┘ └───────────────────────┘               │
│           │                         ↑                            │
│           │ waitForResponse()       │ resolveRequest()           │
│           ↓                         │                            │
└───────────┬─────────────────────────┴────────────────────────────┘
            │ skill:permission-request
            ↓ skill:permission-response
┌───────────┴─────────────────────────────────────────────────────┐
│                        Preload API                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ skill-api.ts                                              │  │
│  │  - onPermissionRequest(callback)                          │  │
│  │  - respondPermission(response)                            │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ↓
┌───────────┴─────────────────────────────────────────────────────┐
│                       Renderer Process                           │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐   │
│  │ usePermissionDialog │  │ PermissionDialog.tsx            │   │
│  │                     │  │                                 │   │
│  │ - requestQueue      │  │  ┌───────────────────────────┐  │   │
│  │ - currentRequest    │  │  │ ツール名: Bash            │  │   │
│  │ - handleResponse()  │  │  │ 引数: { "cmd": "ls" }     │  │   │
│  │                     │  │  │ 理由: ファイル一覧取得    │  │   │
│  └─────────────────────┘  │  │                           │  │   │
│                           │  │  [許可]  [拒否]           │  │   │
│                           │  └───────────────────────────┘  │   │
│                           └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 依存関係マトリックス

### 5.1 既存モジュールへの依存

| 依存元                 | 依存先                          | 依存種別     |
| ---------------------- | ------------------------------- | ------------ |
| permission-handlers.ts | PermissionResolver              | import       |
| permission-handlers.ts | validateIpcSender               | import       |
| skill-api.ts           | IPC_CHANNELS                    | import       |
| skill-api.ts           | SkillPermissionRequest/Response | type import  |
| PermissionDialog.tsx   | @repo/shared (types)            | type import  |
| usePermissionDialog.ts | skillAPI (Preload)              | runtime call |

### 5.2 新規モジュール間の依存

| 依存元                 | 依存先              | 依存種別    |
| ---------------------- | ------------------- | ----------- |
| App.tsx（等）          | usePermissionDialog | hook import |
| usePermissionDialog.ts | PermissionDialog    | component   |

---

## 6. リスク評価

### 6.1 技術的リスク

| リスク                     | 影響度 | 発生確率 | 対策                                 |
| -------------------------- | ------ | -------- | ------------------------------------ |
| ダイアログ表示のタイミング | 中     | 中       | 適切なz-index、モーダル管理          |
| 複数ダイアログの競合       | 高     | 中       | キューイング実装、1つずつ表示        |
| IPC通信エラー              | 中     | 低       | エラーハンドリング、タイムアウト処理 |
| メモリリーク               | 中     | 低       | 購読解除パターンの徹底               |

### 6.2 スケジュールリスク

| リスク               | 影響度 | 発生確率 | 対策                      |
| -------------------- | ------ | -------- | ------------------------- |
| UI設計の手戻り       | 中     | 中       | Phase 2でモックアップ確認 |
| テストカバレッジ不足 | 中     | 低       | Phase 6/7で段階的に拡充   |

---

## 7. 完了条件チェックリスト

Phase 1完了時に以下が全て満たされていること:

- [x] 機能要件（FR-01〜FR-07）が抽出されている
- [x] 非機能要件（NFR-01〜NFR-05）が抽出されている
- [x] 各要件に受け入れ基準がある
- [x] IPCチャンネル仕様が定義されている
- [x] UI要件が定義されている
- [x] 接続要件（IPC通信）が明記されている
- [x] スコープ内/外が明確に定義されている
- [x] 成果物一覧が作成されている
- [x] アーキテクチャ図が作成されている
- [x] リスク評価が完了している
- [x] **本Phase内の全タスクを100%実行完了**

---

## 8. 次のPhaseへの引き継ぎ事項

Phase 2（設計）で以下を実施:

1. IPC Handler・Preload API・UIの詳細設計
2. データフロー設計
3. エラーハンドリング設計
4. UIモックアップ作成

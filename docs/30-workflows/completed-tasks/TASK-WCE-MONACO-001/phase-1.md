# Phase 1: 要件定義

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 1                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |

## 目的

Monaco Editor選択範囲取得機能の目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: Monaco Editor連携に必要な機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名           | パス                                                                            | 説明                   |
| ---------------- | ------------------------------------------------------------------------------- | ---------------------- |
| 元タスク指示書   | `docs/30-workflows/unassigned-task/task-chat-edit-monaco-editor-integration.md` | 元のタスク指示書       |
| GitHub Issue     | `#659`                                                                          | Issue詳細              |
| TextSelection型  | `apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts`         | 既存型定義             |
| chatEditHandlers | `apps/desktop/src/main/handlers/chatEditHandlers.ts`                            | TODOがある実装ファイル |
| chatEditHandlers | `apps/desktop/src/main/ipc/chatEditHandlers.ts`                                 | 完全版ハンドラー       |

## 実行手順

### 1. 要件抽出

ユーザー要求から機能要件・非機能要件を抽出する。

**機能要件（FR）**:

| FR-ID | 要件                                    | 優先度 |
| ----- | --------------------------------------- | ------ |
| FR-1  | エディタの選択範囲を取得できる          | 必須   |
| FR-2  | 選択範囲がない場合はnullを返す          | 必須   |
| FR-3  | TextSelection型で構造化データを返す     | 必須   |
| FR-4  | IPC経由でMain Processに情報を送信できる | 必須   |
| FR-5  | chatEditHandlersがIPCに登録されている   | 必須   |

**非機能要件（NFR）**:

| NFR-ID | 要件                          | 優先度 |
| ------ | ----------------------------- | ------ |
| NFR-1  | IPC通信レイテンシ 100ms以下   | 推奨   |
| NFR-2  | TypeScript strict mode準拠    | 必須   |
| NFR-3  | テストカバレッジ Line 80%以上 | 必須   |
| NFR-4  | Electron contextIsolation準拠 | 必須   |

### 2. 受け入れ基準作成

各要件に対して検証可能な受け入れ基準を定義する。

| AC-ID | 要件ID | 受け入れ基準                                                           |
| ----- | ------ | ---------------------------------------------------------------------- |
| AC-1  | FR-1   | `chat-edit:get-selection` IPC呼び出しでTextSelectionオブジェクトが返る |
| AC-2  | FR-2   | 選択なし時に`null`が返却される                                         |
| AC-3  | FR-3   | startLine, endLine, startColumn, endColumn, selectedTextが全て正しい値 |
| AC-4  | FR-4   | Renderer→Main間でデータが正しく送受信される                            |
| AC-5  | FR-5   | `registerAllIpcHandlers()`内でchatEditHandlersが登録される             |
| AC-6  | NFR-3  | 新規コードのテストカバレッジが80%以上                                  |
| AC-7  | NFR-4  | contextBridge経由のみでAPIが公開される                                 |

### 3. FR/NFR分類

機能要件と非機能要件を分類し、優先度を設定する。

**優先度基準**:

- 必須: 機能が動作するために不可欠
- 推奨: あると望ましいが、なくても基本機能は動作する

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                   |
| ---------------- | ------------------------------------------ |
| IPC接続          | `chat-edit:get-selection` チャンネル       |
| データフロー     | Renderer(Monaco) → Preload → Main → 戻り値 |
| 型契約           | TextSelection型（既存定義を再利用）        |

## アーキテクチャ層別要件

| 層                         | 確認観点                                  |
| -------------------------- | ----------------------------------------- |
| フロントエンド（Renderer） | Monaco Editorインスタンスへのアクセス方法 |
| バックエンド（Main）       | handleGetSelectionの実装、IPC登録         |
| IPC通信                    | chat-edit:get-selectionチャンネル定義     |
| Preload                    | contextBridge経由でのAPI公開              |
| セキュリティ               | validateIpcSender()によるリクエスト元検証 |

## 多角的チェック観点

| 観点               | 適用判断  | 仕様参照先                 |
| ------------------ | --------- | -------------------------- |
| セキュリティ       | ✅ 適用   | `security-electron-ipc.md` |
| UI/UX              | ❌ 対象外 | -                          |
| アーキテクチャ     | ✅ 適用   | `architecture-patterns.md` |
| API設計            | ✅ 適用   | `api-ipc-agent.md`         |
| データ整合性       | ❌ 対象外 | -                          |
| エラーハンドリング | ✅ 適用   | `error-handling.md`        |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全要件が抽出されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（IPC/データフロー）が明記されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（要件抽出、受け入れ基準作成、FR/NFR分類）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-WCE-MONACO-001 --phase 1
```

## 次のPhase

Phase 2: 設計

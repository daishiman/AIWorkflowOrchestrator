# Phase 2: 設計

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 2                   |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |

## 目的

Monaco Editor選択範囲取得機能の要件を実現可能な構造に落とし込む。

## 実行タスク

- アーキテクチャ設計: Renderer-Main間のIPC通信パターン設計
- API設計: IPCチャンネル、型定義の設計
- シーケンス設計: 選択範囲取得のフロー設計

## 参照資料

| 資料名       | パス                                         | 説明          |
| ------------ | -------------------------------------------- | ------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | Phase 1成果物 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | Phase 1成果物 |

## 実行手順

### 1. アーキテクチャ設計

**推奨パターン: Renderer側で選択範囲を保持し、IPC経由で送信**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monaco Editor │    │    Preload      │    │  Main Process   │
│   (Renderer)    │    │  (contextBridge)│    │                 │
└────────┬────────┘    └────────┬────────┘    └────────┬────────┘
         │                      │                      │
         │ getSelection()       │                      │
         ├─────────────────────►│                      │
         │                      │ ipcRenderer.invoke() │
         │                      ├─────────────────────►│
         │                      │                      │ handleGetSelection()
         │                      │                      ├─────┐
         │                      │                      │     │
         │                      │◄─────────────────────┤◄────┘
         │◄─────────────────────┤                      │
         │   TextSelection      │                      │
         │                      │                      │
```

**設計ポイント**:

| ポイント                 | 設計決定                                        |
| ------------------------ | ----------------------------------------------- |
| 選択範囲の取得タイミング | IPC呼び出し時にRenderer側でMonaco APIを呼び出す |
| データ形式               | TextSelection型（既存定義を再利用）             |
| エラーハンドリング       | エディタ未存在・選択なしの場合はnullを返す      |
| セキュリティ             | contextBridge経由、validateIpcSender()で検証    |

### 2. API設計

**IPCチャンネル定義**:

| チャンネル名              | 方向          | リクエスト | レスポンス            |
| ------------------------- | ------------- | ---------- | --------------------- |
| `chat-edit:get-selection` | Renderer→Main | void       | TextSelection \| null |

**型定義（既存を再利用）**:

```typescript
// apps/desktop/src/renderer/features/workspace-chat-edit/types/index.ts
export interface TextSelection {
  /** 開始行（1始まり） */
  startLine: number;
  /** 開始列（1始まり） */
  startColumn: number;
  /** 終了行（1始まり） */
  endLine: number;
  /** 終了列（1始まり） */
  endColumn: number;
  /** 選択されたテキスト */
  selectedText: string;
}
```

**Preload API設計**:

```typescript
// apps/desktop/src/preload/chatEditApi.ts
export interface ChatEditAPI {
  // ... 既存メソッド
  getEditorSelection(): Promise<TextSelection | null>;
}
```

### 3. シーケンス設計

**正常系フロー**:

1. ユーザーがMonaco Editorでテキストを選択
2. LLM送信時に`chatEditAPI.getEditorSelection()`を呼び出し
3. Preload層がipcRenderer.invoke('chat-edit:get-selection')を実行
4. Main Processがwebview/rendererに選択範囲を問い合わせ
5. Renderer側がMonaco Editor APIで選択範囲を取得
6. TextSelection形式で返却

**異常系フロー**:

| ケース                    | 対応       |
| ------------------------- | ---------- |
| エディタが未初期化        | nullを返す |
| 選択範囲がない            | nullを返す |
| Monaco Editorが存在しない | nullを返す |

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント     | 契約定義                                      |
| ---------------- | --------------------------------------------- |
| Renderer→Preload | chatEditAPI.getEditorSelection()              |
| Preload→Main     | ipcRenderer.invoke('chat-edit:get-selection') |
| Main→Renderer    | webContents経由での問い合わせ（必要時）       |

## アーキテクチャ層別設計

| 層                         | 設計観点                                | 仕様参照先                 |
| -------------------------- | --------------------------------------- | -------------------------- |
| フロントエンド（Renderer） | Monaco Editor選択範囲取得ユーティリティ | `ui-ux-components.md`      |
| バックエンド（Main）       | handleGetSelection実装                  | `architecture-patterns.md` |
| IPC通信                    | chat-edit:get-selectionチャンネル       | `api-ipc-agent.md`         |
| Preload                    | chatEditAPI.getEditorSelection()公開    | `security-electron-ipc.md` |

## 実装ファイル一覧（設計時点）

| ファイル                                             | 変更内容                               |
| ---------------------------------------------------- | -------------------------------------- |
| `apps/desktop/src/main/handlers/chatEditHandlers.ts` | handleGetSelection実装（TODOを解消）   |
| `apps/desktop/src/main/ipc/chatEditHandlers.ts`      | 完全版ハンドラー実装                   |
| `apps/desktop/src/main/ipc/index.ts`                 | registerChatEditHandlers()呼び出し追加 |
| `apps/desktop/src/preload/chatEditApi.ts`            | getEditorSelection実装                 |
| `apps/desktop/src/renderer/utils/editorSelection.ts` | Monaco連携ユーティリティ（新規）       |

## 成果物

| 成果物         | パス                                     | 説明         |
| -------------- | ---------------------------------------- | ------------ |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造 |
| API設計        | `outputs/phase-2/api-design.md`          | IPC API定義  |
| シーケンス図   | `outputs/phase-2/sequence-diagram.md`    | フロー設計   |

## 完了条件

- [ ] アーキテクチャが定義されている
- [ ] IPCチャンネル設計が完了している
- [ ] シーケンス設計が完了している
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] アーキテクチャ層別の設計が完了している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（アーキテクチャ設計、API設計、シーケンス設計）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-WCE-MONACO-001 --phase 2
```

## 次のPhase

Phase 3: 設計レビューゲート

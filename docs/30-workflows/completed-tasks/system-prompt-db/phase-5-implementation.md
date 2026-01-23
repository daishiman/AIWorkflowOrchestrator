# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 5                                      |
| Phase名    | 実装                                   |
| 前提Phase  | Phase 4                                |
| 後続Phase  | Phase 6                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストがすべてパスするように実装を行う。

## 背景

TDDにより、テストが定義する仕様に沿った実装を行う。テストがすべてGreenになるまで実装を続ける。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: データベーススキーマ実装

**目的**: Drizzle ORMでsystem_prompt_templatesテーブルを定義する

**実行手順**:

1. スキーマファイルを作成する
   - `packages/shared/src/db/schema/systemPrompt.ts`
2. テーブル定義を実装する
   ```typescript
   export const systemPromptTemplates = sqliteTable(
     "system_prompt_templates",
     {
       id: text("id")
         .primaryKey()
         .$defaultFn(() => crypto.randomUUID()),
       userId: text("user_id")
         .notNull()
         .references(() => users.id, { onDelete: "cascade" }),
       name: text("name").notNull(),
       content: text("content").notNull(),
       isPreset: integer("is_preset", { mode: "boolean" })
         .notNull()
         .default(false),
       createdAt: integer("created_at", { mode: "timestamp" })
         .notNull()
         .$defaultFn(() => new Date()),
       updatedAt: integer("updated_at", { mode: "timestamp" })
         .notNull()
         .$defaultFn(() => new Date()),
     },
     (table) => ({
       userIdIdx: index("system_prompt_templates_user_id_idx").on(table.userId),
       nameIdx: index("system_prompt_templates_name_idx").on(table.name),
       uniqueUserName: unique("unique_user_name").on(table.userId, table.name),
     }),
   );
   ```
3. schemaのindex.tsにエクスポートを追加する
4. マイグレーションを生成する
   ```bash
   pnpm --filter @repo/shared drizzle:generate
   ```
5. マイグレーションを実行する
   ```bash
   pnpm --filter @repo/shared drizzle:migrate
   ```

**期待される成果物**:

- `packages/shared/src/db/schema/systemPrompt.ts`
- `packages/shared/drizzle/migrations/*.sql`

---

### タスク2: Repository実装

**目的**: SystemPromptRepositoryのCRUD操作を実装する

**実行手順**:

1. 型定義ファイルを作成する
   - `packages/shared/src/repositories/types/system-prompt.ts`
   - PromptTemplate, CreatePromptTemplateInput, UpdatePromptTemplateInput
2. Repositoryファイルを作成する
   - `packages/shared/src/repositories/system-prompt-repository.ts`
3. インターフェースを実装する
   - ISystemPromptRepository
4. CRUD操作を実装する
   - findAllByUserId: ユーザーIDでフィルタ
   - findById: IDで検索
   - create: 新規作成（重複チェック付き）
   - update: 更新（プリセット保護付き）
   - delete: 削除（プリセット保護付き）
5. 認可チェックを実装する
   - verifyTemplateOwnership: 所有者検証
6. テストを実行し、Repositoryテストがパスすることを確認する
   ```bash
   pnpm --filter @repo/shared test src/repositories/__tests__/system-prompt-repository.test.ts
   ```

**期待される成果物**:

- `packages/shared/src/repositories/types/system-prompt.ts`
- `packages/shared/src/repositories/system-prompt-repository.ts`

---

### タスク3: IPCハンドラー実装

**目的**: Main Process側のIPCハンドラーを実装する

**実行手順**:

1. IPCハンドラーファイルを作成する
   - `apps/desktop/src/main/ipc/systemPromptHandlers.ts`
2. チャネルを定義する
   - `system-prompt:list`
   - `system-prompt:create`
   - `system-prompt:update`
   - `system-prompt:delete`
3. ハンドラーを実装する
   - validateIpcSenderでsender検証
   - Repositoryを呼び出し
   - 結果を返却
4. registerAllIpcHandlersに登録する
   - `apps/desktop/src/main/ipc/index.ts` に追加
5. テストを実行し、IPCハンドラーテストがパスすることを確認する
   ```bash
   pnpm --filter @repo/desktop test src/main/ipc/__tests__/systemPromptHandlers.test.ts
   ```

**期待される成果物**:

- `apps/desktop/src/main/ipc/systemPromptHandlers.ts`
- `apps/desktop/src/main/ipc/index.ts`（更新）

---

### タスク4: Preload API実装

**目的**: Renderer ProcessからMain Processを呼び出すAPIを実装する

**実行手順**:

1. チャネル定義を追加する
   - `apps/desktop/src/preload/channels.ts`
   - SYSTEM_PROMPT_LIST, SYSTEM_PROMPT_CREATE, SYSTEM_PROMPT_UPDATE, SYSTEM_PROMPT_DELETE
2. ホワイトリストに追加する
   - ALLOWED_INVOKE_CHANNELS に追加
3. systemPromptAPI オブジェクトを作成する
   - listTemplates, createTemplate, updateTemplate, deleteTemplate
4. contextBridgeで公開する
   - window.systemPromptAPI として公開
5. 型定義を追加する
   - `apps/desktop/src/preload/types.ts`

**期待される成果物**:

- `apps/desktop/src/preload/channels.ts`（更新）
- `apps/desktop/src/preload/index.ts`（更新）
- `apps/desktop/src/preload/types.ts`（更新）

---

### タスク5: Slice更新実装

**目的**: systemPromptTemplateSliceをDB連携に更新する

**実行手順**:

1. 既存のSliceを確認する
   - `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`
2. electron-store呼び出しをIPC呼び出しに置き換える
   - loadTemplates: window.systemPromptAPI.listTemplates()
   - saveTemplate: window.systemPromptAPI.createTemplate()
   - deleteTemplate: window.systemPromptAPI.deleteTemplate()
3. エラーハンドリングを追加する
   - isLoading, error 状態の管理
   - try-catch でエラーを捕捉
4. テストを実行し、Sliceテストがパスすることを確認する
   ```bash
   pnpm --filter @repo/desktop test src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`（更新）

---

### タスク6: マイグレーション処理実装

**目的**: electron-storeからTursoへの移行処理を実装する

**実行手順**:

1. マイグレーションファイルを作成する
   - `apps/desktop/src/main/migration/electronStoreMigration.ts`
2. 機能を実装する
   - readFromElectronStore: electron-storeからデータ読み込み
   - migrateToTurso: Tursoへのデータ移行
   - createBackup: バックアップファイル作成
   - rollback: ロールバック処理
3. アプリ起動時にマイグレーションを実行する
   - `apps/desktop/src/main/index.ts` から呼び出し
4. テストを実行し、マイグレーションテストがパスすることを確認する
   ```bash
   pnpm --filter @repo/desktop test src/main/migration/__tests__/electronStoreMigration.test.ts
   ```

**期待される成果物**:

- `apps/desktop/src/main/migration/electronStoreMigration.ts`
- `apps/desktop/src/main/index.ts`（更新）

---

### タスク7: 全テスト実行・Green確認

**目的**: すべてのテストがパスすることを確認する

**実行手順**:

1. 全テストを実行する
   ```bash
   pnpm --filter @repo/shared test
   pnpm --filter @repo/desktop test
   ```
2. 失敗しているテストがあれば修正する
3. TypeScriptエラーがないことを確認する
   ```bash
   pnpm --filter @repo/shared typecheck
   pnpm --filter @repo/desktop typecheck
   ```
4. 全テストがGreenであることを記録する

**期待される成果物**:

- テスト実行結果（全Green）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容           |
| ---------------------- | ---------------------------------------------------------------------------- | -------------- |
| データベーススキーマ   | `.claude/skills/aiworkflow-requirements/references/database-schema.md`       | DB設計参考     |
| アーキテクチャパターン | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 実装パターン   |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー実装参考 |

### 前Phaseの成果物

| 参照資料             | パス                                             | 内容         |
| -------------------- | ------------------------------------------------ | ------------ |
| DBスキーマ設計書     | `outputs/phase-2/database-schema-design.md`      | DB設計       |
| Repository設計書     | `outputs/phase-2/repository-interface-design.md` | API設計      |
| Slice更新設計書      | `outputs/phase-2/slice-update-design.md`         | 状態管理設計 |
| IPC設計書            | `outputs/phase-2/ipc-handler-design.md`          | IPC設計      |
| マイグレーション設計 | `outputs/phase-2/migration-design.md`            | 移行設計     |

---

## 成果物

| 成果物               | パス                                                                  | 内容         |
| -------------------- | --------------------------------------------------------------------- | ------------ |
| スキーマ定義         | `packages/shared/src/db/schema/systemPrompt.ts`                       | テーブル定義 |
| マイグレーションSQL  | `packages/shared/drizzle/migrations/*.sql`                            | DBマイグレ   |
| Repository型定義     | `packages/shared/src/repositories/types/system-prompt.ts`             | 型定義       |
| Repository実装       | `packages/shared/src/repositories/system-prompt-repository.ts`        | CRUD実装     |
| IPCハンドラー        | `apps/desktop/src/main/ipc/systemPromptHandlers.ts`                   | IPC実装      |
| Preload API          | `apps/desktop/src/preload/index.ts`                                   | API公開      |
| Slice更新            | `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts` | 状態管理     |
| マイグレーション処理 | `apps/desktop/src/main/migration/electronStoreMigration.ts`           | 移行処理     |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- Repository・Slice・マイグレーションの実装とテスト支援コードを整備する
- IPC通信の統合を確認する
- 各レイヤー間のデータフローを確認する

---

## 完了条件

- [ ] データベーススキーマが実装されている
- [ ] マイグレーションが実行されている
- [ ] Repositoryが実装されている
- [ ] IPCハンドラーが実装されている
- [ ] Preload APIが実装されている
- [ ] Sliceが更新されている
- [ ] マイグレーション処理が実装されている
- [ ] すべてのテストがパスする（Green状態）
- [ ] TypeScriptエラーがない

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-6-test-expansion.md`

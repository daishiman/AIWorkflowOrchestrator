# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 2                                      |
| Phase名    | 設計                                   |
| 前提Phase  | Phase 1                                |
| 後続Phase  | Phase 3                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

Phase 1で定義した要件に基づき、データベーススキーマ、Repository層、マイグレーション処理、Slice更新の詳細設計を行う。

## 背景

既存のチャット履歴永続化（`chat_sessions`, `chat_messages`）の実装パターンを参考に、システムプロンプトテンプレートの永続化設計を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: データベーススキーマ設計

**目的**: Tursoデータベース用のテーブル設計を行う

**実行手順**:

1. 既存のDBスキーマ設計を確認する
   - `.claude/skills/aiworkflow-requirements/references/database-schema.md` を参照
   - `packages/shared/src/db/schema/` の既存スキーマを確認
2. `system_prompt_templates` テーブルを設計する
   - カラム定義（id, user_id, name, content, is_preset, created_at, updated_at）
   - 外部キー制約（user_id → users.id, CASCADE DELETE）
   - ユニーク制約（user_id + name の組み合わせ）
3. インデックス設計を行う
   - `system_prompt_templates_user_id_idx`（ユーザー別取得）
   - `system_prompt_templates_name_idx`（名前検索）
4. 成果物を `outputs/phase-2/database-schema-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/database-schema-design.md`

---

### タスク2: Repository層インターフェース設計

**目的**: CRUD操作とビジネスロジックのインターフェースを設計する

**実行手順**:

1. 既存のRepository実装を参照する
   - `packages/shared/src/repositories/chat-session-repository.ts`
   - `packages/shared/src/repositories/chat-message-repository.ts`
2. `ISystemPromptRepository` インターフェースを設計する
   - findAllByUserId(userId: string): Promise<PromptTemplate[]>
   - findById(id: string): Promise<PromptTemplate | null>
   - create(userId: string, data: CreatePromptTemplateInput): Promise<PromptTemplate>
   - update(id: string, data: UpdatePromptTemplateInput): Promise<PromptTemplate>
   - delete(id: string): Promise<void>
   - isPreset(id: string): Promise<boolean>
3. 入出力型を設計する
   - `PromptTemplate`（ドメインエンティティ）
   - `CreatePromptTemplateInput`
   - `UpdatePromptTemplateInput`
4. 認可ロジックを設計する
   - 所有者チェック（verifyTemplateOwnership）
   - プリセット保護チェック（isPreset）
5. 成果物を `outputs/phase-2/repository-interface-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/repository-interface-design.md`

---

### タスク3: マイグレーション処理設計

**目的**: electron-storeからTursoへのデータ移行処理を設計する

**実行手順**:

1. 現在のelectron-store構造を確認する
   - `systemPromptTemplates` キーの構造
   - 保存されているデータ形式
2. マイグレーションフローを設計する
   - Step 1: electron-storeからデータ読み込み
   - Step 2: 現在のユーザーID取得
   - Step 3: 重複チェック後、Tursoに挿入
   - Step 4: 成功時、electron-storeからキー削除
   - Step 5: バックアップファイル作成
3. エラーハンドリングを設計する
   - 失敗時のフォールバック
   - ユーザーへの通知
   - リトライ戦略
4. 成果物を `outputs/phase-2/migration-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/migration-design.md`

---

### タスク4: Zustand Slice更新設計

**目的**: 既存のSlice実装をDB連携に更新する設計を行う

**実行手順**:

1. 現在のSlice実装を確認する
   - `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`
   - 状態構造とアクションを把握
2. DB連携後のSlice構造を設計する
   - 状態: templates, selectedTemplateId, isLoading, error
   - アクション: loadTemplates, saveTemplate, deleteTemplate, selectTemplate
3. IPC通信設計を行う
   - `system-prompt:list` - テンプレート一覧取得
   - `system-prompt:create` - テンプレート作成
   - `system-prompt:update` - テンプレート更新
   - `system-prompt:delete` - テンプレート削除
4. エラーハンドリングを設計する
   - ネットワークエラー
   - 認可エラー
   - バリデーションエラー
5. 成果物を `outputs/phase-2/slice-update-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/slice-update-design.md`

---

### タスク5: IPC Handler設計

**目的**: Main Process側のIPCハンドラーを設計する

**実行手順**:

1. 既存のIPCハンドラー実装を参照する
   - `apps/desktop/src/main/ipc/` 配下の既存実装
   - `architecture-patterns.md` のIPC Handler Registration Pattern
2. 新規IPCチャネルを設計する
   - `system-prompt:list` - RepositoryのfindAllByUserId呼び出し
   - `system-prompt:create` - Repositoryのcreate呼び出し
   - `system-prompt:update` - Repositoryのupdate呼び出し
   - `system-prompt:delete` - Repositoryのdelete呼び出し
3. セキュリティ設計を行う
   - validateIpcSender による sender 検証
   - ユーザーID取得とセッション検証
4. 成果物を `outputs/phase-2/ipc-handler-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/ipc-handler-design.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容                     |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------------ |
| データベーススキーマ         | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         | 既存テーブル設計         |
| アーキテクチャパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   | Slice/Repository/IPC設計 |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | Repository実装参考       |
| エラーハンドリング           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラー設計パターン       |

### 前Phaseの成果物

| 参照資料         | パス                                             | 内容         |
| ---------------- | ------------------------------------------------ | ------------ |
| 機能要件定義書   | `outputs/phase-1/requirements-functional.md`     | 機能要件     |
| 非機能要件定義書 | `outputs/phase-1/requirements-non-functional.md` | 非機能要件   |
| データフロー要件 | `outputs/phase-1/requirements-dataflow.md`       | データフロー |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`         | AC           |

---

## 成果物

| 成果物                 | パス                                             | 内容                   |
| ---------------------- | ------------------------------------------------ | ---------------------- |
| DBスキーマ設計書       | `outputs/phase-2/database-schema-design.md`      | テーブル・インデックス |
| Repository設計書       | `outputs/phase-2/repository-interface-design.md` | インターフェース定義   |
| マイグレーション設計書 | `outputs/phase-2/migration-design.md`            | 移行処理設計           |
| Slice更新設計書        | `outputs/phase-2/slice-update-design.md`         | 状態管理更新           |
| IPCハンドラー設計書    | `outputs/phase-2/ipc-handler-design.md`          | IPC通信設計            |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- 統合ポイント（IPC・DB・State）を設計に反映する
- 各レイヤー間のインターフェースを明確に定義する
- エラー伝播パスを設計に含める

---

## 完了条件

- [ ] データベーススキーマが設計されている
- [ ] Repositoryインターフェースが定義されている
- [ ] マイグレーション処理が設計されている
- [ ] Slice更新設計が完了している
- [ ] IPCハンドラー設計が完了している
- [ ] 全ての成果物が `outputs/phase-2/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-3-design-review.md`

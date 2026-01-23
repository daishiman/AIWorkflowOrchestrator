# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                   |
| ---------- | -------------------------------------- |
| Phase      | 4                                      |
| Phase名    | テスト作成                             |
| 前提Phase  | Phase 3                                |
| 後続Phase  | Phase 5                                |
| ステータス | 未実施                                 |
| 作成日     | 2026-01-22                             |
| 機能名     | システムプロンプトのデータベース永続化 |

---

## 目的

TDDのRedフェーズとして、Phase 2の設計に基づいた失敗するテストを作成する。テストは実装前に作成し、実装後に成功（Green）することを確認する。

## 背景

TDD（テスト駆動開発）により、仕様に基づいた堅牢な実装を行う。まず失敗するテストを作成し、テストが成功するまで実装を行う。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: Repositoryユニットテスト作成

**目的**: SystemPromptRepositoryのCRUD操作テストを作成する

**実行手順**:

1. テストファイルを作成する
   - `packages/shared/src/repositories/__tests__/system-prompt-repository.test.ts`
2. CRUD操作のテストケースを作成する
   - describe: "findAllByUserId"
     - ユーザーIDに紐づくテンプレート一覧を取得できる
     - 他ユーザーのテンプレートは取得されない
     - テンプレートがない場合は空配列を返す
   - describe: "findById"
     - IDでテンプレートを取得できる
     - 存在しないIDはnullを返す
   - describe: "create"
     - 新規テンプレートを作成できる
     - 同じユーザー・名前の組み合わせでエラー
   - describe: "update"
     - テンプレートを更新できる
     - プリセットは更新できない（エラー）
   - describe: "delete"
     - テンプレートを削除できる
     - プリセットは削除できない（エラー）
3. 認可テストを作成する
   - describe: "authorization"
     - 所有者以外はアクセスできない
4. テストを実行し、全て失敗することを確認する
   ```bash
   pnpm --filter @repo/shared test src/repositories/__tests__/system-prompt-repository.test.ts
   ```

**期待される成果物**:

- `packages/shared/src/repositories/__tests__/system-prompt-repository.test.ts`

---

### タスク2: Sliceユニットテスト作成

**目的**: systemPromptTemplateSliceの状態管理テストを作成する

**実行手順**:

1. テストファイルを作成する
   - `apps/desktop/src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts`
2. 状態管理のテストケースを作成する
   - describe: "initial state"
     - 初期状態が正しい
   - describe: "loadTemplates"
     - IPC呼び出しでテンプレートを読み込める
     - エラー時にエラー状態が設定される
   - describe: "saveTemplate"
     - IPC呼び出しでテンプレートを保存できる
     - 保存後にtemplates配列が更新される
   - describe: "deleteTemplate"
     - IPC呼び出しでテンプレートを削除できる
     - 削除後にtemplates配列から削除される
   - describe: "selectTemplate"
     - テンプレートを選択できる
     - 選択時にsystemPromptが更新される
3. テストを実行し、全て失敗することを確認する
   ```bash
   pnpm --filter @repo/desktop test src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts
   ```

**期待される成果物**:

- `apps/desktop/src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts`

---

### タスク3: マイグレーションユニットテスト作成

**目的**: electron-storeからの移行処理テストを作成する

**実行手順**:

1. テストファイルを作成する
   - `apps/desktop/src/main/migration/__tests__/electronStoreMigration.test.ts`
2. マイグレーション処理のテストケースを作成する
   - describe: "readFromElectronStore"
     - electron-storeからデータを読み込める
     - データがない場合は空配列を返す
   - describe: "migrateToTurso"
     - データをTursoに移行できる
     - 重複データはスキップされる
   - describe: "createBackup"
     - バックアップファイルが作成される
   - describe: "rollback"
     - マイグレーション失敗時にロールバックできる
3. テストを実行し、全て失敗することを確認する
   ```bash
   pnpm --filter @repo/desktop test src/main/migration/__tests__/electronStoreMigration.test.ts
   ```

**期待される成果物**:

- `apps/desktop/src/main/migration/__tests__/electronStoreMigration.test.ts`

---

### タスク4: IPCハンドラーユニットテスト作成

**目的**: IPCハンドラーのテストを作成する

**実行手順**:

1. テストファイルを作成する
   - `apps/desktop/src/main/ipc/__tests__/systemPromptHandlers.test.ts`
2. IPCハンドラーのテストケースを作成する
   - describe: "system-prompt:list"
     - テンプレート一覧を取得できる
     - sender検証が行われる
   - describe: "system-prompt:create"
     - テンプレートを作成できる
     - バリデーションエラー時にエラーを返す
   - describe: "system-prompt:update"
     - テンプレートを更新できる
     - プリセット更新時にエラーを返す
   - describe: "system-prompt:delete"
     - テンプレートを削除できる
     - プリセット削除時にエラーを返す
3. テストを実行し、全て失敗することを確認する
   ```bash
   pnpm --filter @repo/desktop test src/main/ipc/__tests__/systemPromptHandlers.test.ts
   ```

**期待される成果物**:

- `apps/desktop/src/main/ipc/__tests__/systemPromptHandlers.test.ts`

---

### タスク5: 統合テストシナリオ作成

**目的**: E2Eに近い統合テストシナリオを作成する

**実行手順**:

1. テストファイルを作成する
   - `packages/shared/src/repositories/__tests__/system-prompt-repository.integration.test.ts`
2. 統合テストシナリオを作成する
   - describe: "Full CRUD workflow"
     - テンプレート作成 → 更新 → 一覧取得 → 削除の流れ
   - describe: "Multi-user isolation"
     - ユーザーAのテンプレートがユーザーBに見えない
   - describe: "Preset protection"
     - プリセットテンプレートの保護動作
3. テストを実行し、全て失敗することを確認する

**期待される成果物**:

- `packages/shared/src/repositories/__tests__/system-prompt-repository.integration.test.ts`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容             |
| ---------------------------- | ------------------------------------------------------------------------------ | ---------------- |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | テスト実装参考   |
| エラーハンドリング           | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーテスト参考 |

### 前Phaseの成果物

| 参照資料             | パス                                             | 内容           |
| -------------------- | ------------------------------------------------ | -------------- |
| Repository設計書     | `outputs/phase-2/repository-interface-design.md` | テスト対象API  |
| Slice更新設計書      | `outputs/phase-2/slice-update-design.md`         | テスト対象状態 |
| マイグレーション設計 | `outputs/phase-2/migration-design.md`            | テスト対象処理 |
| IPC設計書            | `outputs/phase-2/ipc-handler-design.md`          | テスト対象IPC  |
| レビュー判定         | `outputs/phase-3/review-judgment.md`             | 設計承認確認   |

---

## 成果物

| 成果物                 | パス                                                                                      | 内容           |
| ---------------------- | ----------------------------------------------------------------------------------------- | -------------- |
| Repositoryテスト       | `packages/shared/src/repositories/__tests__/system-prompt-repository.test.ts`             | CRUDテスト     |
| Sliceテスト            | `apps/desktop/src/renderer/store/slices/__tests__/systemPromptTemplateSlice.test.ts`      | 状態管理テスト |
| マイグレーションテスト | `apps/desktop/src/main/migration/__tests__/electronStoreMigration.test.ts`                | 移行テスト     |
| IPCハンドラーテスト    | `apps/desktop/src/main/ipc/__tests__/systemPromptHandlers.test.ts`                        | IPCテスト      |
| 統合テスト             | `packages/shared/src/repositories/__tests__/system-prompt-repository.integration.test.ts` | 統合シナリオ   |

---

## 統合テスト連携（Phase 1〜11は必須）

本Phaseでは以下の統合テスト連携アクションを実施すること：

- Repository統合テストシナリオを作成する
- マルチユーザー分離テストを含める
- エラーハンドリングテストを含める

---

## 完了条件

- [ ] Repositoryユニットテストが作成されている
- [ ] Sliceユニットテストが作成されている
- [ ] マイグレーションユニットテストが作成されている
- [ ] IPCハンドラーユニットテストが作成されている
- [ ] 統合テストシナリオが作成されている
- [ ] すべてのテストが失敗する（Red状態）

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

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/system-prompt-db/phase-5-implementation.md`

# 機能要件定義書

## メタ情報

| 項目     | 内容                                   |
| -------- | -------------------------------------- |
| 機能名   | システムプロンプトのデータベース永続化 |
| 作成日   | 2026-01-22                             |
| Phase    | 1                                      |
| タスクID | TASK-CHAT-SYSPROMPT-DB-001             |

---

## 1. 現状分析

### 1.1 既存実装の構造

**ファイル**: `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts`

| 要素             | 内容                                         |
| ---------------- | -------------------------------------------- |
| 状態管理         | Zustand Slice                                |
| 永続化           | electron-store (`systemPromptTemplates`キー) |
| プリセット       | 3種類（翻訳・プログラミング・ライティング）  |
| カスタムテンプレ | electron-storeに保存                         |
| ID生成           | `custom-${Date.now()}-${random}`             |

### 1.2 既存のCRUD操作

| 操作   | メソッド            | 説明                           |
| ------ | ------------------- | ------------------------------ |
| 初期化 | initializeTemplates | プリセット＋electron-store読込 |
| 作成   | saveTemplate        | 名前重複チェック後に保存       |
| 更新   | updateTemplate      | プリセット保護チェック後に更新 |
| 削除   | deleteTemplate      | プリセット保護チェック後に削除 |
| 取得   | getTemplateById     | IDで単一取得                   |

---

## 2. ユーザーストーリー

### US-001: テンプレートのクラウド保存

> ユーザーとして、作成したシステムプロンプトテンプレートをクラウドに保存したい。
> これにより、データが安全に保管され、バックアップ不要になる。

### US-002: 複数デバイスでの共有

> ユーザーとして、デスクトップアプリとWebアプリで同じテンプレートを使用したい。
> これにより、デバイスを問わず一貫したワークフローを維持できる。

### US-003: オフライン利用

> ユーザーとして、オフライン環境でもテンプレートを利用・編集したい。
> これにより、ネットワーク接続がない環境でも作業が継続できる。

### US-004: ユーザー別管理

> ユーザーとして、自分専用のテンプレートを他のユーザーから隔離して管理したい。
> これにより、プライバシーとセキュリティが確保される。

### US-005: 既存データの移行

> 既存ユーザーとして、electron-storeに保存済みのテンプレートを自動的に新システムに移行したい。
> これにより、データ損失なくアップグレードできる。

---

## 3. 機能要件（FR）

### FR-001: テンプレートのCRUD操作

**概要**: システムプロンプトテンプレートの作成・読取・更新・削除機能

| 要件ID     | 要件名           | 詳細                                   | 優先度 |
| ---------- | ---------------- | -------------------------------------- | ------ |
| FR-001-001 | テンプレート作成 | 名前・内容を指定してテンプレートを作成 | 必須   |
| FR-001-002 | テンプレート一覧 | ユーザーに紐づく全テンプレートを取得   | 必須   |
| FR-001-003 | テンプレート取得 | IDを指定して単一テンプレートを取得     | 必須   |
| FR-001-004 | テンプレート更新 | 名前・内容を変更（プリセット除く）     | 必須   |
| FR-001-005 | テンプレート削除 | テンプレートを削除（プリセット除く）   | 必須   |
| FR-001-006 | 名前重複チェック | ユーザー内での名前重複を防止           | 必須   |

**入力データ型**:

```typescript
interface CreatePromptTemplateInput {
  name: string; // 1-50文字
  content: string; // 1-4000文字
}

interface UpdatePromptTemplateInput {
  name?: string;
  content?: string;
}
```

**出力データ型**:

```typescript
interface PromptTemplate {
  id: string;
  userId: string;
  name: string;
  content: string;
  isPreset: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### FR-002: ユーザー認証との連動

**概要**: ユーザーIDに基づくテンプレート所有権管理

| 要件ID     | 要件名         | 詳細                                           | 優先度 |
| ---------- | -------------- | ---------------------------------------------- | ------ |
| FR-002-001 | ユーザー紐付け | テンプレート作成時に現在のユーザーIDを関連付け | 必須   |
| FR-002-002 | 認可チェック   | 操作時に所有者のみアクセス可能であることを検証 | 必須   |
| FR-002-003 | ユーザー別一覧 | ログインユーザーのテンプレートのみ表示         | 必須   |

**認可ルール**:

| 操作     | 所有者 | 他ユーザー |
| -------- | ------ | ---------- |
| 一覧取得 | 許可   | 自分のみ   |
| 詳細取得 | 許可   | 拒否       |
| 作成     | 許可   | -          |
| 更新     | 許可   | 拒否       |
| 削除     | 許可   | 拒否       |

---

### FR-003: プリセットテンプレートの保護

**概要**: システム提供のプリセットテンプレートの保護機能

| 要件ID     | 要件名         | 詳細                                   | 優先度 |
| ---------- | -------------- | -------------------------------------- | ------ |
| FR-003-001 | 編集不可       | プリセットテンプレートは更新操作を拒否 | 必須   |
| FR-003-002 | 削除不可       | プリセットテンプレートは削除操作を拒否 | 必須   |
| FR-003-003 | 全ユーザー共有 | プリセットは全ユーザーで共有される     | 必須   |
| FR-003-004 | プリセット判定 | isPresetフラグで判定可能               | 必須   |

**プリセットテンプレート一覧**:

| ID                 | 名前               | 用途           |
| ------------------ | ------------------ | -------------- |
| preset-translation | 翻訳アシスタント   | 多言語翻訳支援 |
| preset-programming | プログラミング支援 | コード支援     |
| preset-writing     | ライティング支援   | 文章作成支援   |

---

### FR-004: electron-storeからのマイグレーション

**概要**: 既存のelectron-storeデータをTursoデータベースに移行

| 要件ID     | 要件名             | 詳細                                       | 優先度 |
| ---------- | ------------------ | ------------------------------------------ | ------ |
| FR-004-001 | 自動検出           | アプリ起動時にマイグレーション対象を検出   | 必須   |
| FR-004-002 | 自動移行           | 検出データをTursoに自動挿入                | 必須   |
| FR-004-003 | 重複スキップ       | 既に移行済みのデータはスキップ             | 必須   |
| FR-004-004 | バックアップ作成   | 移行前にelectron-storeデータをバックアップ | 必須   |
| FR-004-005 | フォールバック     | 移行失敗時はelectron-storeにロールバック   | 必須   |
| FR-004-006 | 移行完了フラグ     | 移行完了後にフラグを設定し再実行を防止     | 必須   |
| FR-004-007 | ユーザーID関連付け | 現在ログインユーザーのIDで移行データを保存 | 必須   |

**マイグレーションフロー**:

```
1. アプリ起動
2. マイグレーション完了フラグ確認
3. 未完了の場合:
   a. electron-storeからテンプレート読み込み
   b. バックアップファイル作成
   c. 現在ユーザーIDを取得
   d. Tursoにテンプレート挿入（重複チェック付き）
   e. 成功時: 移行完了フラグ設定
   f. 失敗時: バックアップから復元、エラーログ記録
4. 通常起動処理へ
```

---

### FR-005: Embedded Replicasによるオフライン対応

**概要**: デスクトップアプリでのオフライン動作サポート

| 要件ID     | 要件名             | 詳細                                            | 優先度 |
| ---------- | ------------------ | ----------------------------------------------- | ------ |
| FR-005-001 | ローカルキャッシュ | Embedded Replicasでローカルにデータをキャッシュ | 必須   |
| FR-005-002 | オフラインCRUD     | オフラインでも全CRUD操作が可能                  | 必須   |
| FR-005-003 | 自動同期           | オンライン復帰時に自動でリモートと同期          | 必須   |
| FR-005-004 | 競合解決           | 同期時の競合は最終更新日時で解決                | 推奨   |

---

## 4. IPC通信チャネル定義

### 4.1 チャネル一覧

| チャネル                | 引数                        | 戻り値                   | 説明             |
| ----------------------- | --------------------------- | ------------------------ | ---------------- |
| `system-prompt:list`    | `{ userId: string }`        | `PromptTemplate[]`       | 一覧取得         |
| `system-prompt:get`     | `{ id: string }`            | `PromptTemplate \| null` | 単一取得         |
| `system-prompt:create`  | `{ userId, name, content }` | `PromptTemplate`         | 作成             |
| `system-prompt:update`  | `{ id, name?, content? }`   | `PromptTemplate`         | 更新             |
| `system-prompt:delete`  | `{ id: string }`            | `void`                   | 削除             |
| `system-prompt:migrate` | `{ userId: string }`        | `MigrationResult`        | マイグレーション |

### 4.2 エラーレスポンス

| エラーコード           | 説明                     |
| ---------------------- | ------------------------ |
| `TEMPLATE_NOT_FOUND`   | テンプレートが存在しない |
| `UNAUTHORIZED`         | 所有者以外のアクセス     |
| `PRESET_NOT_EDITABLE`  | プリセットの編集試行     |
| `PRESET_NOT_DELETABLE` | プリセットの削除試行     |
| `DUPLICATE_NAME`       | 名前の重複               |
| `VALIDATION_ERROR`     | 入力値バリデーション失敗 |
| `MIGRATION_FAILED`     | マイグレーション失敗     |

---

## 5. Repository層API定義

### 5.1 ISystemPromptRepository

```typescript
export interface ISystemPromptRepository {
  // CRUD操作
  findAllByUserId(userId: string): Promise<PromptTemplate[]>;
  findById(id: string): Promise<PromptTemplate | null>;
  create(
    userId: string,
    data: CreatePromptTemplateInput,
  ): Promise<PromptTemplate>;
  update(id: string, data: UpdatePromptTemplateInput): Promise<PromptTemplate>;
  delete(id: string): Promise<void>;

  // プリセット関連
  isPreset(id: string): Promise<boolean>;
  findAllPresets(): Promise<PromptTemplate[]>;

  // ユーティリティ
  existsByUserIdAndName(userId: string, name: string): Promise<boolean>;
}
```

### 5.2 認可チェック

Repository層では認可チェックを行わない（Service層の責務）。
ただし、以下の検証は実施:

- findById: 存在チェックのみ
- update/delete: IDの存在チェックのみ

---

## 6. Zustand Slice更新パターン

### 6.1 既存Sliceの変更点

| 変更前                     | 変更後                              |
| -------------------------- | ----------------------------------- |
| electron-store直接アクセス | IPC経由でRepository呼び出し         |
| プリセット定数             | DBから取得（キャッシュ付き）        |
| 同期処理                   | 非同期処理（loading/error状態管理） |

### 6.2 新規State定義

```typescript
interface SystemPromptTemplateState {
  templates: PromptTemplate[];
  isLoading: boolean;
  error: string | null;
  isMigrated: boolean;
}
```

### 6.3 新規Actions定義

```typescript
interface SystemPromptTemplateActions {
  fetchTemplates: (userId: string) => Promise<void>;
  createTemplate: (
    userId: string,
    name: string,
    content: string,
  ) => Promise<void>;
  updateTemplate: (id: string, name: string, content: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  migrateFromElectronStore: (userId: string) => Promise<void>;
  getTemplateById: (id: string) => PromptTemplate | undefined;
}
```

---

## 7. 完了条件

- [ ] FR-001: CRUD操作が全て実装されている
- [ ] FR-002: ユーザー認証と連動している
- [ ] FR-003: プリセットテンプレートが保護されている
- [ ] FR-004: electron-storeからのマイグレーションが実装されている
- [ ] FR-005: Embedded Replicasでオフライン動作する

---

## 8. 関連ドキュメント

| ドキュメント                 | パス                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| データベーススキーマ         | `.claude/skills/aiworkflow-requirements/references/database-schema.md`         |
| アーキテクチャパターン       | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md`   |
| システムプロンプトUI         | `.claude/skills/aiworkflow-requirements/references/ui-ux-system-prompt.md`     |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` |

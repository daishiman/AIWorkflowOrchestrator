# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 4                                      |
| タスクID | TASK-9B-H-SKILL-CREATOR-IPC            |
| タスク名 | SkillCreatorServiceのIPCハンドラー登録 |
| 機能名   | skill-creator-ipc                      |
| 作成日   | 2026-02-12                             |
| 次Phase  | Phase 5: 実装（TDD: Green）            |

## 目的

SkillCreatorService IPCハンドラーの期待動作を検証するテストを、実装より先に作成する（TDD: Red）。Handler Map方式（TASK-8C-Aパターン準拠）でElectronプロセス起動不要のテスト環境を構築し、受け入れ基準AC-01〜AC-10から導出したテストシナリオを網羅する。

---

## 実行タスク

### Task 1: テストシナリオ設計

**目的**: AC-01〜AC-10から導出したテストシナリオを5カテゴリに分類して設計する

#### 1-1. カテゴリ別テスト設計

| カテゴリ            | AC参照       | テスト数 | 対象                                                    |
| ------------------- | ------------ | -------- | ------------------------------------------------------- |
| ハンドラー登録/解除 | AC-10        | 3        | register/unregisterの呼び出し確認                       |
| チャンネル別正常系  | AC-01〜AC-06 | 6        | 5 invokeチャンネル + 1 onチャンネルの正常系レスポンス   |
| エラーハンドリング  | AC-08, AC-09 | 12       | 引数バリデーション失敗、サービスエラー                  |
| セキュリティ検証    | AC-07        | 4        | validateIpcSender失敗パターン                           |
| 境界値テスト        | AC-08        | 8        | 空文字列、null、undefined、最大長超過、パストラバーサル |

テスト方式: **Handler Map方式**（`ipcMain.handle` のコールバック関数を直接取得してテスト、Electronプロセス起動不要）

#### 1-2. テストID体系

| テストID範囲    | カテゴリ            |
| --------------- | ------------------- |
| SCIT-REG-01〜03 | ハンドラー登録/解除 |
| SCIT-NRM-01〜06 | チャンネル別正常系  |
| SCIT-ERR-01〜12 | エラーハンドリング  |
| SCIT-SEC-01〜04 | セキュリティ検証    |
| SCIT-BND-01〜08 | 境界値テスト        |
| SCIT-PRE-01〜07 | Preload API検証     |

**成果物パス**: `outputs/phase-4/test-specification.md`

### Task 2: Handler Mapテスト作成

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts`

#### 2-1. テストセットアップ

```typescript
// モック対象
const mockIpcMain = {
  handle: vi.fn(),
  removeHandler: vi.fn(),
};
const mockValidateIpcSender = vi.fn();
const mockSkillCreatorService = {
  detectMode: vi.fn(),
  createSkill: vi.fn(),
  executeTasks: vi.fn(),
  validateSkill: vi.fn(),
  validateWithSchema: vi.fn(),
};
const mockMainWindow = {
  webContents: { send: vi.fn(), mainFrame: { processId: 1 } },
  isDestroyed: vi.fn().mockReturnValue(false),
};
const mockEvent = {
  senderFrame: { processId: 1 },
};

// Handler Map構築
// registerSkillCreatorHandlers呼び出し後、
// ipcMain.handleに渡されたコールバック関数をチャンネル名をキーとしてMapに格納
```

#### 2-2. ハンドラー登録/解除テスト

| テストID    | テスト内容                                                                     |
| ----------- | ------------------------------------------------------------------------------ |
| SCIT-REG-01 | `registerSkillCreatorHandlers`呼び出しで`ipcMain.handle`が5回呼ばれる          |
| SCIT-REG-02 | `unregisterSkillCreatorHandlers`呼び出しで`ipcMain.removeHandler`が5回呼ばれる |
| SCIT-REG-03 | 登録チャンネル名が`IPC_CHANNELS.SKILL_CREATOR_*`定数と完全一致する             |

#### 2-3. チャンネル別正常系テスト

| テストID    | チャンネル                      | 入力                                     | 期待レスポンス                              |
| ----------- | ------------------------------- | ---------------------------------------- | ------------------------------------------- |
| SCIT-NRM-01 | `skill-creator:detect-mode`     | `{ request: "新しいスキル作成" }`        | `{ success: true, data: SkillCreatorMode }` |
| SCIT-NRM-02 | `skill-creator:create`          | `{ name: "test", template: "default" }`  | `{ success: true, data: "/path/to/skill" }` |
| SCIT-NRM-03 | `skill-creator:execute-tasks`   | `{ skillDir: "/path", taskIds: ["t1"] }` | `{ success: true, data: ExecutionReport }`  |
| SCIT-NRM-04 | `skill-creator:validate`        | `{ skillDir: "/valid/path" }`            | `{ success: true, data: true }`             |
| SCIT-NRM-05 | `skill-creator:validate-schema` | `{ skillDir: "/valid/path" }`            | `{ success: true, data: ValidationResult }` |
| SCIT-NRM-06 | `skill-creator:progress`        | 進捗コールバック登録                     | `SkillCreatorProgress`データが通知される    |

各テストで`{ success: true, data: T }`形式のレスポンスを検証する。

#### 2-4. エラーハンドリングテスト

| テストID    | テスト内容                                                        |
| ----------- | ----------------------------------------------------------------- |
| SCIT-ERR-01 | `detect-mode`に不正引数 → `{ success: false, error: string }`     |
| SCIT-ERR-02 | `create`に不正引数 → `{ success: false, error: string }`          |
| SCIT-ERR-03 | `execute-tasks`に不正引数 → `{ success: false, error: string }`   |
| SCIT-ERR-04 | `validate`に不正引数 → `{ success: false, error: string }`        |
| SCIT-ERR-05 | `validate-schema`に不正引数 → `{ success: false, error: string }` |
| SCIT-ERR-06 | `detectMode`がErrorをthrow → エラーサニタイズ後レスポンス         |
| SCIT-ERR-07 | `createSkill`がErrorをthrow → エラーサニタイズ後レスポンス        |
| SCIT-ERR-08 | `executeTasks`がErrorをthrow → エラーサニタイズ後レスポンス       |
| SCIT-ERR-09 | `validateSkill`がErrorをthrow → エラーサニタイズ後レスポンス      |
| SCIT-ERR-10 | `validateWithSchema`がErrorをthrow → エラーサニタイズ後レスポンス |
| SCIT-ERR-11 | スタックトレースがRendererに漏洩しないことを確認                  |
| SCIT-ERR-12 | ファイルパス・モジュール名がエラーメッセージに含まれない          |

#### 2-5. セキュリティテスト

| テストID    | テスト内容                                                       |
| ----------- | ---------------------------------------------------------------- |
| SCIT-SEC-01 | `validateIpcSender`がfalseを返す場合、ハンドラーが処理を拒否する |
| SCIT-SEC-02 | 不正なprocessIdからのリクエストがブロックされる                  |
| SCIT-SEC-03 | sender検証失敗時のエラーメッセージに内部情報が含まれない         |
| SCIT-SEC-04 | `validateIpcSender`が各ハンドラーの処理冒頭で呼び出される        |

#### 2-6. 境界値テスト

| テストID    | テスト内容                                                              |
| ----------- | ----------------------------------------------------------------------- |
| SCIT-BND-01 | `detect-mode`: `{ request: "" }` → バリデーションエラー                 |
| SCIT-BND-02 | `detect-mode`: `{ request: null }` → バリデーションエラー               |
| SCIT-BND-03 | `detect-mode`: `{ request: undefined }` → バリデーションエラー          |
| SCIT-BND-04 | `validate`: `{ skillDir: "" }` → バリデーションエラー                   |
| SCIT-BND-05 | `validate`: `{ skillDir: "../../etc/passwd" }` → パストラバーサル検出   |
| SCIT-BND-06 | `validate`: `{ skillDir: "/path/../../../etc" }` → パストラバーサル検出 |
| SCIT-BND-07 | `create`: `null`引数 → バリデーションエラー                             |
| SCIT-BND-08 | `execute-tasks`: 必須フィールド欠落 → バリデーションエラー              |

### Task 3: Preload APIテスト作成

**テストファイル**: `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`

#### 3-1. safeInvoke呼び出し確認

| テストID    | テスト内容                                                                                    |
| ----------- | --------------------------------------------------------------------------------------------- |
| SCIT-PRE-01 | `detectMode`が`safeInvoke(IPC_CHANNELS.SKILL_CREATOR_DETECT_MODE, ...)`を呼び出す             |
| SCIT-PRE-02 | `createSkill`が`safeInvoke(IPC_CHANNELS.SKILL_CREATOR_CREATE, ...)`を呼び出す                 |
| SCIT-PRE-03 | `executeTasks`が`safeInvoke(IPC_CHANNELS.SKILL_CREATOR_EXECUTE_TASKS, ...)`を呼び出す         |
| SCIT-PRE-04 | `validateSkill`が`safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE, ...)`を呼び出す             |
| SCIT-PRE-05 | `validateWithSchema`が`safeInvoke(IPC_CHANNELS.SKILL_CREATOR_VALIDATE_SCHEMA, ...)`を呼び出す |

#### 3-2. safeOn呼び出し確認（progress通知）

| テストID    | テスト内容                                                                      |
| ----------- | ------------------------------------------------------------------------------- |
| SCIT-PRE-06 | `onProgress`が`safeOn(IPC_CHANNELS.SKILL_CREATOR_PROGRESS, callback)`を呼び出す |
| SCIT-PRE-07 | コールバックに`SkillCreatorProgress`データが正しく渡される                      |

### Task 4: 統合テストシナリオ設計

**目的**: 全5カテゴリの統合テストシナリオを設計する（実装はPhase 6で実施）

#### 4-1. IPC接続テストシナリオ

- Renderer → Preload API → IPC → Main Handler → SkillCreatorService のフルフロー
- 5 invokeチャンネルの正常系フロー検証

#### 4-2. データフローテストシナリオ

- 入力データがRenderer → Main Processに正しく伝播される
- 戻りデータがMain Process → Rendererに正しく返却される
- 型変換が発生しないことの検証

#### 4-3. エラーハンドリングテストシナリオ

- サービスエラー → ハンドラーキャッチ → サニタイズ → Rendererレスポンス
- バリデーションエラーの伝播フロー検証

#### 4-4. セキュリティテストシナリオ

- 未登録チャンネルへのアクセス拒否
- パストラバーサル攻撃パターンのブロック確認
- ホワイトリスト外チャンネルのブロック確認

#### 4-5. 進捗通知テストシナリオ

- SkillCreatorService → Main → IPC → Renderer リスナーのフルフロー
- 複数リスナー登録時の通知到達確認
- リスナー解除後の通知停止確認

**成果物パス**: `outputs/phase-4/integration-test-design.md`

---

## 参照資料

| 資料名                        | パス                                                                                        | 説明                              |
| ----------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------- |
| Phase 2設計成果物             | `docs/30-workflows/skill-creator-ipc/phase-2-design.md`                                     | IPCチャンネル設計・型定義設計     |
| Handler Map方式テストパターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | TASK-8C-Aパターン準拠テスト方式   |
| スキルIPCチャンネル仕様       | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | IPCチャンネルインターフェース定義 |
| IPC通信セキュリティ原則       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | sender検証・エラーサニタイズ基準  |
| スキルIPCセキュリティ仕様     | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | SkillCreator固有セキュリティ要件  |
| IPC永続化アーキテクチャ       | `.claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md`                 | IPCチャンネル登録/解除パターン    |
| Agent IPC仕様                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | 既存IPCハンドラー実装パターン参照 |
| 既存ハンドラーテスト          | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                                 | 既存テストファイルの参考パターン  |
| コード品質ルール              | `.claude/rules/02-code-quality.md`                                                          | TDD原則・カバレッジ基準           |
| 既知の落とし穴                | `.claude/rules/06-known-pitfalls.md`                                                        | P23, P27, P32, P34, P35           |

---

## 統合テスト連携【必須】

| カテゴリ           | 確認項目                                         | AC参照        |
| ------------------ | ------------------------------------------------ | ------------- |
| IPC接続            | 5 invokeチャンネルの登録・呼び出し・レスポンス   | AC-01〜05     |
| データフロー       | Renderer→Main→Renderer間のデータ型一貫性         | AC-01〜05     |
| エラーハンドリング | サービスエラーのサニタイズとRendererへの返却     | AC-09         |
| セキュリティ       | sender検証・ホワイトリスト・パストラバーサル対策 | AC-07, 08, 10 |
| 進捗通知           | Main→Renderer進捗通知の到達と型整合性            | AC-06         |

---

## 多角的チェック観点

| 観点            | 確認項目                                                           |
| --------------- | ------------------------------------------------------------------ |
| テスト独立性    | 各テストケースが他テストの状態に依存しない（beforeEachでリセット） |
| モック完全性    | SkillCreatorServiceの全5メソッドがモック化されている               |
| Handler Map方式 | ipcMain.handleのコールバック関数が直接テスト可能                   |
| Red状態確認     | 全テストが未実装のため失敗することを確認                           |
| テストID一意性  | SCIT-\*のIDが重複しない                                            |
| 境界値網羅      | 空文字列・null・undefined・パストラバーサルが全て含まれている      |

---

## アーキテクチャ層別テスト

| 層           | テスト観点                                                       | テストID範囲                 |
| ------------ | ---------------------------------------------------------------- | ---------------------------- |
| Main Process | ハンドラーロジック、sender検証、引数バリデーション               | SCIT-REG, NRM, ERR, SEC, BND |
| IPC通信      | チャンネル登録/解除、Handler Map方式                             | SCIT-REG-01〜03              |
| Preload      | safeInvoke/safeOn検証、チャンネル定数参照                        | SCIT-PRE-01〜07              |
| Shared       | 型定義コンパイルチェック（SkillCreatorMode, CreateSkillOptions） | 型レベルテスト               |

---

## テストヘルパー参照（TASK-8C-Aパターン）

| ヘルパー名               | 用途                                               |
| ------------------------ | -------------------------------------------------- |
| `createMockIpcEvent`     | IpcMainInvokeEventモックの生成                     |
| `expectOperationSuccess` | `{ success: true, data: T }` レスポンス検証        |
| `expectOperationError`   | `{ success: false, error: string }` レスポンス検証 |

---

## 成果物

| 成果物                  | パス                                                                      | 説明                         |
| ----------------------- | ------------------------------------------------------------------------- | ---------------------------- |
| テスト設計書            | `outputs/phase-4/test-specification.md`                                   | テストカテゴリ・テストID一覧 |
| 統合テスト設計書        | `outputs/phase-4/integration-test-design.md`                              | 5カテゴリ統合テストシナリオ  |
| ハンドラーテストコード  | `apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts` | Handler Map方式統合テスト    |
| Preload APIテストコード | `apps/desktop/src/preload/__tests__/skill-creator-api.test.ts`            | safeInvoke/safeOn検証テスト  |

---

## 完了条件

- [ ] SCIT-REG-01〜03: ハンドラー登録/解除テストが作成されている
- [ ] SCIT-NRM-01〜06: 5チャンネル正常系 + 進捗通知テストが作成されている
- [ ] SCIT-ERR-01〜12: エラーハンドリングテスト（引数不正、サービスエラー、サニタイズ）が作成されている
- [ ] SCIT-SEC-01〜04: セキュリティテスト（validateIpcSender失敗）が作成されている
- [ ] SCIT-BND-01〜08: 境界値テスト（空文字列、null、undefined、パストラバーサル）が作成されている
- [ ] SCIT-PRE-01〜07: Preload APIテスト（safeInvoke/safeOn検証）が作成されている
- [ ] 統合テストシナリオ設計書が5カテゴリ分作成されている
- [ ] 全テストがRed状態（未実装のため失敗）であることを確認済み
- [ ] **本Phase内の全タスクを100%実行完了**

---

## サブタスク管理

| サブタスクID | タスク名               | ステータス | 完了条件                  |
| ------------ | ---------------------- | ---------- | ------------------------- |
| T4-1         | テストシナリオ設計     | 未着手     | 5カテゴリのテスト設計完了 |
| T4-2         | Handler Mapテスト作成  | 未着手     | 33テストケース作成完了    |
| T4-3         | Preload APIテスト作成  | 未着手     | 7テストケース作成完了     |
| T4-4         | 統合テストシナリオ設計 | 未着手     | 5カテゴリシナリオ設計完了 |

---

## タスク100%実行確認【必須】

- [ ] Task 1（テストシナリオ設計）: 完了
- [ ] Task 2（Handler Mapテスト作成）: 完了
- [ ] Task 3（Preload APIテスト作成）: 完了
- [ ] Task 4（統合テストシナリオ設計）: 完了
- [ ] 全成果物が生成されている
- [ ] 全テストがRed状態であることを確認

---

## TDD検証

```bash
# テスト実行（Red状態確認）
pnpm --filter @repo/desktop vitest run apps/desktop/src/main/ipc/__tests__/skillCreatorIpc.integration.test.ts
pnpm --filter @repo/desktop vitest run apps/desktop/src/preload/__tests__/skill-creator-api.test.ts

# 確認項目
# - [ ] 全テストが失敗（Red状態）
# - [ ] import先が存在しないためコンパイルエラーが発生
# - [ ] テストケース数が合計40以上
```

---

## 次のPhase

[Phase 5: 実装（TDD: Green）](./phase-5-implementation.md)

# Phase 5: 実装（TDD: Green）

## メタ情報

| 項目               | 内容                                             |
| ------------------ | ------------------------------------------------ |
| Phase              | 5                                                |
| Phase名            | 実装（TDD: Green）                               |
| タスクID           | TASK-9B                                          |
| 機能名             | task-9b-skill-creator                            |
| 作成日             | 2026-02-26                                       |
| ステータス         | pending                                          |
| 前Phase            | [Phase 4: テスト作成](phase-4-test-creation.md)  |
| 後続Phase          | [Phase 6: テスト拡充](phase-6-test-expansion.md) |
| 成果物ディレクトリ | outputs/phase-5/                                 |

## 目的

Phase 4で作成したテスト（Red状態）を全てGreen（成功）にする最小限の実装を行う。
SkillCreatorService（Facade）を中心に、HearingFacilitator / TaskGenerator / CodeGenerator / ApiIntegrator / Validator のサブコンポーネントを実装する。

## 参照資料テーブル

| 参照資料                 | パス                                                                                        | 用途                           |
| ------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1-4成果物          | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-1/` 〜 `phase-4/`    | 要件・設計・テスト仕様         |
| Electronサービス設計     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Facadeパターン・DIパターン     |
| IPC セキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | 3段バリデーション・sender検証  |
| Agent IPC仕様            | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill関連IPC契約               |
| API一覧                  | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | IPCチャンネル一覧              |
| 実装パターン             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | IPC/DI/テストパターン          |
| 教訓集                   | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                      | 過去の苦戦箇所と解決策         |
| Skillインターフェース    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill型定義・IPC契約           |
| IPC契約チェックリスト    | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`               | P23/P32/P42/P44統合チェック    |
| Electron APIセキュリティ | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md`                | Preload公開制約                |
| 品質基準                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                 | 品質ゲート・カバレッジ基準     |
| Claude Codeスキル構造    | `.claude/skills/aiworkflow-requirements/references/claude-code-skills-structure.md`         | SKILL.md構造・ディレクトリ構成 |
| 既存SkillCreatorService  | `apps/desktop/src/main/services/skill/SkillCreatorService.ts`                               | 既存実装の参考                 |
| 既存IPCハンドラ          | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                                         | 既存IPC実装の参考              |

## 実行タスク

### Task 5-1: SkillCreatorService Facade 拡充

**対象ファイル**: `apps/desktop/src/main/services/skill/SkillCreatorService.ts`

既存の `createSkill()`, `executeTasks()`, `validateSkill()`, `validateWithSchema()` に加えて、以下のpublicメソッドを追加する:

| メソッド名      | 引数                                          | 戻り値                   | 責務                                   |
| --------------- | --------------------------------------------- | ------------------------ | -------------------------------------- |
| `improveSkill`  | `skillName: string, options?: ImproveOptions` | `Promise<ImproveResult>` | 既存スキルの分析・改善提案・自動修正   |
| `forkSkill`     | `sourceName: string, newName: string`         | `Promise<string>`        | スキルを複製して新名前で作成           |
| `shareSkill`    | `skillName: string, format: ExportFormat`     | `Promise<string>`        | スキルをエクスポート形式でパッケージ化 |
| `scheduleSkill` | `skillName: string, schedule: ScheduleConfig` | `Promise<void>`          | cron形式スケジュールを保存             |
| `debugSkill`    | `skillName: string, options: DebugOptions`    | `Promise<DebugResult>`   | デバッグモードで実行・詳細ログ出力     |
| `generateDocs`  | `skillName: string`                           | `Promise<string[]>`      | SKILL.md, README.md を生成             |
| `getStats`      | `skillName?: string`                          | `Promise<UsageStats>`    | 使用統計を集計                         |

#### 実装上の注意

- 各メソッドはサブコンポーネントに委譲する（Facadeパターン）
- エラーは `Result<T, E>` パターンまたは明示的な Error throw で伝播する
- サブコンポーネントへのアクセスはコンストラクタDIで注入する

### Task 5-2: サブコンポーネント実装

#### A. HearingFacilitator

**新規ファイル**: `apps/desktop/src/main/services/skill/HearingFacilitator.ts`

| メソッド名            | 責務                                        |
| --------------------- | ------------------------------------------- |
| `startInterview()`    | 初期質問を生成して対話フローを開始する      |
| `processAnswer()`     | ユーザー回答を解析して次の質問を導出する    |
| `completeInterview()` | 全回答を集約して InterviewResult を生成する |
| `validateAnswer()`    | 回答の空文字列・不正入力を検証する          |

実装要件:

- 最大質問数は10問（定数で定義）
- 空文字列・スペースのみ（P42準拠）の回答はバリデーションエラーで拒否する
- purpose, features, constraints を InterviewResult 型に集約する

#### B. TaskGenerator

**新規ファイル**: `apps/desktop/src/main/services/skill/TaskGenerator.ts`

| メソッド名              | 責務                                       |
| ----------------------- | ------------------------------------------ |
| `generateTasks()`       | InterviewResult からタスクリストを生成する |
| `resolveDependencies()` | タスク間の依存関係を解決する               |
| `detectCycles()`        | 循環依存を検出する（DFSアルゴリズム）      |
| `topologicalSort()`     | トポロジカルソートで実行順序を決定する     |
| `groupParallelTasks()`  | 独立タスクを並列実行グループに分類する     |

実装要件:

- 循環依存検出は SkillCreatorService の既存 `detectCycles()` ロジックを移植する
- トポロジカルソートは既存の Kahn's algorithm 実装を移植する
- 存在しない依存先タスクIDへの参照はエラーとする

#### C. CodeGenerator

**新規ファイル**: `apps/desktop/src/main/services/skill/CodeGenerator.ts`

| メソッド名               | 責務                                                 |
| ------------------------ | ---------------------------------------------------- |
| `generateFromTemplate()` | テンプレートファイルから変数を置換してコード生成する |
| `generateWithSDK()`      | Claude Agent SDK query()を呼び出してコードを生成する |
| `checkTypes()`           | 生成コードの型安全性を検証する                       |
| `generateMultiFile()`    | SKILL.md, agents/, references/ を一括生成する        |

実装要件:

- テンプレート変数は `{{variableName}}` 形式で定義する
- SDK呼び出しは ScriptExecutor 経由で実行する
- 空テンプレートの場合は Error をスローする

#### D. ApiIntegrator

**新規ファイル**: `apps/desktop/src/main/services/skill/ApiIntegrator.ts`

| メソッド名                 | 責務                                 |
| -------------------------- | ------------------------------------ |
| `generateRestClient()`     | REST APIクライアントコードを生成する |
| `generateWebhookHandler()` | Webhookハンドラコードを生成する      |
| `configureAuth()`          | 認証情報を安全に管理・設定する       |

実装要件:

- 認証情報はMain Processに保持し、Rendererに直接送信しない
- APIキーはログに出力しない

#### E. Validator

**新規ファイル**: `apps/desktop/src/main/services/skill/SkillValidator.ts`

| メソッド名            | 責務                                                      |
| --------------------- | --------------------------------------------------------- |
| `validateStructure()` | スキルディレクトリ構造の妥当性を検証する                  |
| `validateSecurity()`  | パストラバーサル、コマンドインジェクションを検出する      |
| `validateSchema()`    | データのスキーマ準拠を検証する                            |
| `validatePath()`      | パス文字列の安全性を検証する（NULLバイト、UNC、相対パス） |

実装要件:

- パストラバーサル検出: `../`, `..\\`, NULLバイト(`\0`), UNCパス(`\\server\share`)
- コマンドインジェクション検出: `$(...)`, `` `...` ``, `; command`, `| command`
- SKILL.md の存在チェックを含む構造検証

### Task 5-3: IPCハンドラ拡充

**対象ファイル**: `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`

既存の5つのIPCハンドラ（detect-mode, create, execute-tasks, validate, validate-schema）に加えて、新規メソッドに対応するIPCハンドラを追加する:

| チャンネル名                  | 方向 | 対応メソッド      | バリデーション要件                     |
| ----------------------------- | ---- | ----------------- | -------------------------------------- |
| `skill-creator:improve`       | R→M  | `improveSkill()`  | skillName: 3段バリデーション           |
| `skill-creator:fork`          | R→M  | `forkSkill()`     | sourceName, newName: 3段バリデーション |
| `skill-creator:share`         | R→M  | `shareSkill()`    | skillName, format: 型チェック + 空検証 |
| `skill-creator:schedule`      | R→M  | `scheduleSkill()` | skillName, schedule: 型チェック        |
| `skill-creator:debug`         | R→M  | `debugSkill()`    | skillName: 3段バリデーション           |
| `skill-creator:generate-docs` | R→M  | `generateDocs()`  | skillName: 3段バリデーション           |
| `skill-creator:stats`         | R→M  | `getStats()`      | skillName: optional, 型チェック        |

#### 全ハンドラ共通要件

1. **sender検証**: `validateIpcSender()` で送信元ウィンドウを検証する
2. **3段バリデーション（P42準拠）**: `typeof === "string"` → `=== ""` → `.trim() === ""`
3. **パストラバーサル防止**: パスを含む引数は `validatePath()` で検証する
4. **エラーサニタイズ**: `sanitizeErrorMessage()` で内部情報を除去してから返却する
5. **IPC_CHANNELS定数使用**: ハードコード文字列を使用しない

### Task 5-4: Preload API公開

**対象ファイル**: `apps/desktop/src/preload/skill-creator-api.ts`

新規IPCチャンネルに対応する Preload API メソッドを追加する。

#### 追加メソッド一覧

| メソッド名      | IPC チャンネル                | 引数型                                  |
| --------------- | ----------------------------- | --------------------------------------- |
| `improveSkill`  | `skill-creator:improve`       | `(skillName: string, options?: object)` |
| `forkSkill`     | `skill-creator:fork`          | `(sourceName: string, newName: string)` |
| `shareSkill`    | `skill-creator:share`         | `(skillName: string, format: string)`   |
| `scheduleSkill` | `skill-creator:schedule`      | `(skillName: string, schedule: object)` |
| `debugSkill`    | `skill-creator:debug`         | `(skillName: string, options?: object)` |
| `generateDocs`  | `skill-creator:generate-docs` | `(skillName: string)`                   |
| `getStats`      | `skill-creator:stats`         | `(skillName?: string)`                  |

全メソッドで `safeInvoke(IPC_CHANNELS.xxx, ...)` パターンを使用する。

### Task 5-5: チャンネル定義更新

**対象ファイル**: `apps/desktop/src/preload/channels.ts`

`IPC_CHANNELS` オブジェクトに新規チャンネルを追加する:

```
SKILL_CREATOR_IMPROVE: "skill-creator:improve"
SKILL_CREATOR_FORK: "skill-creator:fork"
SKILL_CREATOR_SHARE: "skill-creator:share"
SKILL_CREATOR_SCHEDULE: "skill-creator:schedule"
SKILL_CREATOR_DEBUG: "skill-creator:debug"
SKILL_CREATOR_GENERATE_DOCS: "skill-creator:generate-docs"
SKILL_CREATOR_STATS: "skill-creator:stats"
```

ホワイトリスト配列にも追加する。

### Task 5-6: 共有型定義の追加

**対象ファイル**: `packages/shared/src/types/skillCreator.ts`（または適切な型定義ファイル）

以下の型定義を追加する:

| 型名             | フィールド                                                              |
| ---------------- | ----------------------------------------------------------------------- |
| `ImproveOptions` | `autoApply?: boolean`, `targetAreas?: string[]`                         |
| `ImproveResult`  | `issues: Issue[]`, `suggestions: Suggestion[]`, `applied: boolean`      |
| `ExportFormat`   | `"zip" \| "tar" \| "directory"`                                         |
| `ScheduleConfig` | `cron: string`, `enabled: boolean`, `timezone?: string`                 |
| `DebugOptions`   | `verbose?: boolean`, `breakpoints?: string[]`                           |
| `DebugResult`    | `logs: LogEntry[]`, `exitCode: number`, `duration: number`              |
| `UsageStats`     | `totalExecutions: number`, `successRate: number`, `avgDuration: number` |

### Task 5-7: Claude Agent SDK統合

**目的**: CodeGenerator および HearingFacilitator で Claude Agent SDK の `query()` API を使用する実装を行う

**実装内容**:

| 項目                     | 実装ファイル                                   | 詳細                                                      |
| ------------------------ | ---------------------------------------------- | --------------------------------------------------------- |
| query() ラッパーメソッド | `SkillCreatorService.ts` or 共通ユーティリティ | SDK query() 呼び出しの共通ラッパー                        |
| Hooks実装                | 各サブコンポーネント                           | `onMessage`, `onToolCall`, `onError` コールバック         |
| リトライロジック         | 共通ユーティリティ                             | External Service Error（3000-3999）カテゴリのリトライ処理 |
| タイムアウト処理         | 共通ユーティリティ                             | スキル生成60秒以内の非機能要件に対応                      |

**注意事項**:

- SDK型はインストール済みの実型を使用する（P36準拠: カスタム `.d.ts` は削除済み）
- `as any` 型キャストは使用しない（P19準拠）

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ --reporter=verbose
```

### Task 5-8: 境界値テスト対応の実装

**目的**: Phase 4の境界値テスト（BV-001〜BV-008）をGreenにする実装を追加する

| テストID | 実装内容                                                       |
| -------- | -------------------------------------------------------------- |
| BV-001   | `createSkill` で空文字列 `name` 時に Error をスロー            |
| BV-002   | `createSkill` でスペースのみ `name` 時に Error をスロー（P42） |
| BV-003   | `createSkill` で256文字超 `name` 時に Error をスロー           |
| BV-004   | パストラバーサルパスの検出と拒否（Validator連携）              |
| BV-005   | NULLバイト含有文字列の検出と拒否                               |
| BV-006   | 空の依存関係リストでの正常動作確認                             |
| BV-007   | 1000タスクでのトポロジカルソート完了確認                       |
| BV-008   | 自己参照循環依存（A→A）の検出確認                              |

**確認コマンド**:

```bash
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/ --reporter=verbose
```

---

## 設計変更記録セクション

Phase 2設計から乖離が発生した場合、以下の形式で記録する:

| 変更ID           | 変更内容 | 理由 | 影響範囲 | 対応 |
| ---------------- | -------- | ---- | -------- | ---- |
| （実装時に記録） |          |      |          |      |

## 実装時の注意事項テーブル（既知のPitfall対策）

| Pitfall ID | 注意事項                            | 対策                                                                  |
| ---------- | ----------------------------------- | --------------------------------------------------------------------- |
| P42        | .trim()バリデーション漏れ           | 全文字列引数に3段バリデーション（型チェック→空文字列→トリム空文字列） |
| P44        | IPCハンドラ引数形式不整合           | Preload側と一致する型を使用する                                       |
| P45        | 引数命名の契約ドリフト              | セマンティクスに一致する命名（skillName等）                           |
| P34        | 遅延初期化DI                        | BrowserWindow必要時はSetter Injectionパターン使用                     |
| P5         | リスナー二重登録                    | `unregisterSkillCreatorHandlers()` で一括解除後に再登録               |
| P23        | API二重定義の型管理                 | 型定義は1箇所（`@repo/shared/types`）で管理                           |
| P32        | 型定義の二箇所同時更新              | `packages/shared` と `apps/desktop/src/preload/types.ts` を同時更新   |
| P27        | Preloadハードコード文字列の見落とし | 全チャンネル名は `IPC_CHANNELS` 定数を使用する                        |

## TDD検証（Green状態確認）

各Task完了後に以下のコマンドで Green 状態を確認する:

```bash
# SkillCreatorService テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.test.ts --reporter=verbose

# サブコンポーネントテスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/HearingFacilitator.test.ts --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/TaskGenerator.test.ts --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/CodeGenerator.test.ts --reporter=verbose
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/Validator.test.ts --reporter=verbose

# IPCハンドラーテスト
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillCreatorHandlers --reporter=verbose

# 統合テスト
cd apps/desktop && pnpm vitest run src/main/services/skill/__tests__/SkillCreatorService.integration.test.ts --reporter=verbose

# Preload APIテスト
cd apps/desktop && pnpm vitest run src/preload/__tests__/skill-creator-api.test.ts --reporter=verbose

# 全テスト一括実行
cd apps/desktop && pnpm vitest run src/main/services/skill/ src/main/ipc/__tests__/skillCreator src/preload/__tests__/skill-creator-api --reporter=verbose

# 型チェック
pnpm typecheck
```

---

## 多角的チェック観点（AIが判断）

### アーキテクチャ観点

- [ ] SkillCreatorService が Facade パターンに従っている（サブコンポーネントへの委譲）
- [ ] 依存方向が Renderer → Preload → Main → External の一方向である
- [ ] 共有型は `@repo/shared/types` に配置されている

### セキュリティ観点

- [ ] 全IPCハンドラにsender検証が含まれている
- [ ] パス引数にパストラバーサル防止が適用されている
- [ ] エラーメッセージが `sanitizeErrorMessage()` でサニタイズされている
- [ ] 認証情報がMain Processに留まり、Rendererに送信されていない

### 型安全観点

- [ ] `any` 型が使用されていない
- [ ] 全publicメソッドに明示的な戻り値型が定義されている
- [ ] `packages/shared` と `apps/desktop/src/preload/types.ts` の型が一致している

### テスト整合性観点

- [ ] Phase 4の全テストがGreen（成功）になっている
- [ ] 新規IPCチャンネルに対応するテストが追加されている

### Electronデスクトップアプリ観点

| 層                         | 適用判断                                                    | 仕様参照先                                         |
| -------------------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| フロントエンド（Renderer） | 非該当（バックエンドサービス実装のみ）                      | -                                                  |
| バックエンド（Main）       | 必須（SkillCreatorService + 5サブコンポーネント実装）       | aiworkflow-requirements: arch-electron-services.md |
| IPC通信                    | 必須（7ハンドラー追加、3段バリデーション、sender検証）      | aiworkflow-requirements: api-ipc-agent.md          |
| Preload/セキュリティ       | 必須（7メソッド追加、safeInvoke使用、IPC_CHANNELS定数参照） | aiworkflow-requirements: security-api-electron.md  |
| ローカルストレージ         | 非該当（DB変更なし）                                        | -                                                  |

## 統合テスト連携【必須】

| シナリオカテゴリ | 検証内容                                       | 実装ファイル                  | 判定基準              |
| ---------------- | ---------------------------------------------- | ----------------------------- | --------------------- |
| Facade委譲       | SkillCreatorService → サブコンポーネント呼出し | `SkillCreatorService.ts`      | 全メソッドが委譲動作  |
| IPC→Service連携  | IPCハンドラ → Service メソッド呼び出し         | `skillCreatorHandlers.ts`     | 引数が正しく受け渡し  |
| Preload→IPC連携  | safeInvoke → ipcMain.handle の呼び出し         | `skill-creator-api.ts`        | チャンネル名が一致    |
| 型定義同期       | shared ↔ preload 間の型一致                    | `types.ts` (shared + preload) | `pnpm typecheck` PASS |

## サブタスク管理

| サブタスクID | 内容                            | 状態    | 依存関係 |
| ------------ | ------------------------------- | ------- | -------- |
| 5-1          | SkillCreatorService Facade 拡充 | pending | なし     |
| 5-2          | サブコンポーネント実装          | pending | 5-1      |
| 5-3          | IPCハンドラ拡充                 | pending | 5-1      |
| 5-4          | Preload API公開                 | pending | 5-3, 5-5 |
| 5-5          | チャンネル定義更新              | pending | なし     |
| 5-6          | 共有型定義の追加                | pending | なし     |
| 5-7          | Claude Agent SDK統合            | pending | 5-2      |
| 5-8          | 境界値テスト対応の実装          | pending | 5-1, 5-2 |

## タスク100%実行確認【必須】

- [ ] SkillCreatorService に7つの新規publicメソッドが追加されている
- [ ] 5つのサブコンポーネントが新規作成されている（HearingFacilitator, TaskGenerator, CodeGenerator, ApiIntegrator, SkillValidator）
- [ ] 7つの新規IPCハンドラが登録されている
- [ ] 7つの新規Preload APIメソッドが公開されている
- [ ] `IPC_CHANNELS` に7つの新規チャンネルが追加されている
- [ ] ホワイトリストに新規チャンネルが追加されている
- [ ] 共有型定義に7つの新規型が追加されている
- [ ] Phase 4の全テストがGreen状態である
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreator` が全PASS
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] P42準拠の3段バリデーションが全IPCハンドラに適用されている
- [ ] Claude Agent SDK `query()` 統合が実装されている（Task 5-7）
- [ ] 境界値テスト（BV-001〜BV-008）が全てGreen状態である（Task 5-8）

## Phase完了時の検証コマンド

```bash
# Phase出力検証
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 5

# テスト実行
pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreator

# IPC テスト実行
pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreator

# 型チェック
pnpm typecheck

# shared ビルド
pnpm --filter @repo/shared build
```

## 成果物テーブル

| 成果物名                    | パス                                                          |
| --------------------------- | ------------------------------------------------------------- |
| SkillCreatorService（拡充） | `apps/desktop/src/main/services/skill/SkillCreatorService.ts` |
| HearingFacilitator          | `apps/desktop/src/main/services/skill/HearingFacilitator.ts`  |
| TaskGenerator               | `apps/desktop/src/main/services/skill/TaskGenerator.ts`       |
| CodeGenerator               | `apps/desktop/src/main/services/skill/CodeGenerator.ts`       |
| ApiIntegrator               | `apps/desktop/src/main/services/skill/ApiIntegrator.ts`       |
| SkillValidator              | `apps/desktop/src/main/services/skill/SkillValidator.ts`      |
| IPCハンドラ（拡充）         | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`           |
| Preload API（拡充）         | `apps/desktop/src/preload/skill-creator-api.ts`               |
| チャンネル定義（拡充）      | `apps/desktop/src/preload/channels.ts`                        |
| 共有型定義（拡充）          | `packages/shared/src/types/skillCreator.ts`                   |
| 設計変更記録                | `outputs/phase-5/design-changes.md`                           |

## 完了条件

- [ ] Phase 4の全テストがGreen（成功）状態である
- [ ] `pnpm typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared build` が成功する
- [ ] P42/P44/P45対策が全IPCハンドラに完了している
- [ ] アーキテクチャ層別に正しいディレクトリにファイルが配置されている
- [ ] 統合テスト（INT-001〜INT-005）が全てGreen状態である
- [ ] 境界値テスト（BV-001〜BV-008）が全てGreen状態である
- [ ] 設計変更が発生した場合、`outputs/phase-5/design-changes.md` に記録されている

## 次Phase

Phase 5完了後、[Phase 6: テスト拡充](phase-6-test-expansion.md)へ進む。
実装済みコードに対してカバレッジを測定し、不足箇所のテストを追加する。

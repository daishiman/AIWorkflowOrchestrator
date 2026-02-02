# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 1                        |
| Phase名    | 要件定義                 |
| 前提Phase  | なし                     |
| 後続Phase  | Phase 2（設計）          |
| ステータス | 未実施                   |
| 作成日     | 2026-02-01               |
| 機能名     | TASK-8C-A: IPC統合テスト |

---

## 目的

スキルIPC統合テスト（22テストケース）の要件を定義する。現行コードベースの `registerSkillHandlers` が提供する全チャネルと `SkillService` ファサードパターンを分析し、テストケースの網羅性・実現可能性を確認する。

## 背景

TASK-4-1（IPCチャネル定義）と TASK-4-2（IPCハンドラー）で実装された `skillHandlers.ts` に対する統合テストが必要。既存の `skillHandlers.test.ts`（ユニットテスト690行）と `skillHandlers.integration.test.ts`（統合テスト272行）が存在するが、TASK-8C-A ではIPCチャネル登録→ハンドラー呼び出し→SkillService連携の統合パスに焦点を当てた22テストケースを新規作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 現行IPCハンドラーの分析

**目的**: `skillHandlers.ts` の実装を分析し、テスト対象のチャネル・パラメータ・戻り値を網羅的に把握する

**実行手順**:

1. `apps/desktop/src/main/ipc/skillHandlers.ts`（264行）を読み、登録されている全チャネルを列挙する
2. 各チャネルの以下を記録する：
   - チャネル名（`channels.ts` の定数名と文字列値）
   - パラメータ型（IPC イベント引数）
   - 戻り値型（`OperationResult<T>` のジェネリクス型）
   - 呼び出される `SkillService` メソッド
   - `validateIpcSender()` のバリデーション有無
3. `apps/desktop/src/preload/channels.ts` を読み、スキル関連チャネルのホワイトリスト定義を確認する
4. `apps/desktop/src/main/ipc/index.ts`（105-126行）を読み、ハンドラー登録フローを確認する
5. 分析結果を `outputs/phase-01/requirements-definition.md` に記録する

**期待される成果物**:

- `outputs/phase-01/requirements-definition.md`（IPCハンドラー分析結果）

---

### タスク2: SkillService ファサードの分析

**目的**: テストで Mock する `SkillService` のインターフェースを把握する

**実行手順**:

1. `apps/desktop/src/main/services/skill/SkillService.ts` を読み、公開メソッドを列挙する
2. 各メソッドの入出力型を記録する：

| メソッド        | 引数                  | 戻り値                     | 対応チャネル         |
| --------------- | --------------------- | -------------------------- | -------------------- |
| scanAvailable() | なし                  | `Promise<Skill[]>`         | skill:list-available |
| listImported()  | なし                  | `ImportedSkill[]`          | skill:list-imported  |
| importSkill()   | skillName: string     | `Promise<ImportedSkill>`   | skill:import         |
| removeSkill()   | skillName: string     | `void`                     | skill:remove         |
| getDetail()     | skillName: string     | `Promise<SkillMetadata>`   | skill:get-detail     |
| execute()       | request: ExecutionReq | `Promise<ExecutionResult>` | skill:execute        |
| abort()         | executionId: string   | `boolean`                  | skill:abort          |
| getStatus()     | executionId: string   | `ExecutionInfo`            | skill:get-status     |

3. 上記を `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- SkillService メソッドマッピング（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク3: テストケース要件の定義

**目的**: 22テストケースの詳細要件（前提条件・操作・期待結果）を定義する

**実行手順**:

1. 基本12テストケース（index.md テストケース一覧 #1〜#12）の各ケースについて以下を定義する：
   - **前提条件**: Mock の設定内容（SkillService メソッドの戻り値設定）
   - **操作**: `handlers.get("チャネル名")` の呼び出しと引数
   - **期待結果**: 戻り値の検証内容（`OperationResult` の `success`/`data`/`error` フィールド）
   - **セキュリティ検証**: `validateIpcSender()` 呼び出しの検証

2. IMP-002 追加10テストケース（#13〜#22）について同様に定義する
   - `interfaces-agent-sdk.md` の SkillImportStore 仕様を参照し、設定管理・権限管理・キャッシュ機能のIPCチャネル仕様を確認する
   - 各チャネルが未実装の場合、テスト作成時に同時にハンドラーを追加する方針を記録する

3. `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- テストケース詳細要件（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク4: 既存テストとの差別化分析

**目的**: 既存テストファイルとの重複を避け、TASK-8C-A テストの独自価値を明確にする

**実行手順**:

1. 以下の既存テストファイルを読み、テスト範囲を確認する：
   - `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`（690行）
   - `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts`（272行）
   - `apps/desktop/src/main/ipc/__tests__/skillHandlers.execute.test.ts`

2. TASK-8C-A テストと既存テストの差異をテーブルで整理する：

| 観点             | 既存ユニットテスト    | 既存統合テスト     | TASK-8C-A テスト（本タスク）               |
| ---------------- | --------------------- | ------------------ | ------------------------------------------ |
| テスト範囲       | 個別ハンドラー関数    | electron-store連携 | IPC登録→ハンドラー→Service連携             |
| Mock対象         | ipcMain, SkillService | electron-store     | ipcMain（ハンドラーMap方式）               |
| セキュリティ検証 | validateIpcSender     | なし               | validateIpcSender + チャネルホワイトリスト |
| エラーパス       | 個別エラー            | 永続化エラー       | OperationResult エラーパターン網羅         |

3. `outputs/phase-01/requirements-definition.md` に追記する

**期待される成果物**:

- 既存テスト差別化分析（`outputs/phase-01/requirements-definition.md` に含む）

---

### タスク5: 受け入れ基準の定義

**目的**: テスト完成時に検証可能な基準を定義する

**実行手順**:

1. 以下の受け入れ基準を定義する：

| 基準ID | カテゴリ        | 基準                                                           | 検証方法                   |
| ------ | --------------- | -------------------------------------------------------------- | -------------------------- |
| AC-001 | テストケース数  | 基本12テストケースが全て実装されている                         | テストファイル内 `it()` 数 |
| AC-002 | テストケース数  | IMP-002 追加10テストケースが全て実装されている                 | テストファイル内 `it()` 数 |
| AC-003 | テスト実行      | 全22テストが `vitest run` でパスする                           | `pnpm vitest run` 実行     |
| AC-004 | カバレッジ      | `skillHandlers.ts` の行カバレッジが90%以上                     | `vitest --coverage` 実行   |
| AC-005 | セキュリティ    | 全チャネルで `validateIpcSender` の呼び出しが検証されている    | テストコード確認           |
| AC-006 | 型安全          | テストファイルが TypeScript strict モードでコンパイル可能      | `tsc --noEmit` 実行        |
| AC-007 | 命名規則        | テストファイル名が `skillIpc.integration.test.ts` である       | ファイル名確認             |
| AC-008 | 配置            | テストファイルが `apps/desktop/src/main/ipc/__tests__/` に配置 | パス確認                   |
| AC-009 | エラーパス      | 各チャネルの正常系・異常系が両方テストされている               | テストケース確認           |
| AC-010 | OperationResult | 戻り値が `OperationResult<T>` パターンに準拠して検証されている | テストコード確認           |

2. `outputs/phase-01/acceptance-criteria.md` に記録する

**期待される成果物**:

- `outputs/phase-01/acceptance-criteria.md`

---

## 参照資料

| 参照資料                | パス                                                                             | 内容                       |
| ----------------------- | -------------------------------------------------------------------------------- | -------------------------- |
| IPCハンドラー実装       | `apps/desktop/src/main/ipc/skillHandlers.ts`                                     | テスト対象コード           |
| チャネル定義            | `apps/desktop/src/preload/channels.ts`                                           | チャネルホワイトリスト     |
| IPC登録エントリポイント | `apps/desktop/src/main/ipc/index.ts`                                             | ハンドラー登録フロー       |
| SkillServiceファサード  | `apps/desktop/src/main/services/skill/SkillService.ts`                           | テストMock対象             |
| 既存ユニットテスト      | `apps/desktop/src/main/ipc/__tests__/skillHandlers.test.ts`                      | 差別化対象                 |
| 既存統合テスト          | `apps/desktop/src/main/ipc/__tests__/skillHandlers.integration.test.ts`          | 差別化対象                 |
| スキル型定義            | `packages/shared/src/types/skill.ts`                                             | テスト型定義               |
| TASK-8C-A元仕様         | `docs/30-workflows/skill-import-agent-system/tasks/task-8c-a-ipc-integration.md` | 元タスク仕様               |
| IPC永続化パターン       | `aiworkflow-requirements: arch-ipc-persistence.md`                               | IPC設計パターン            |
| IPC セキュリティ仕様    | `aiworkflow-requirements: security-electron-ipc.md`                              | セキュリティ要件           |
| スキルIPC セキュリティ  | `aiworkflow-requirements: security-skill-ipc.md`                                 | スキル固有セキュリティ     |
| Agent SDK スキル仕様    | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`                         | SkillSlice・IPC仕様        |
| テスト品質要件          | `aiworkflow-requirements: quality-requirements.md`                               | テスト戦略・カバレッジ基準 |

---

## アーキテクチャ層別要件（AIが判断）

タスクの性質に応じて、以下の層別に要件を整理する：

| 層                         | 確認観点                                                               |
| -------------------------- | ---------------------------------------------------------------------- |
| フロントエンド（Renderer） | テスト対象外（本タスクはMain Processのみ）                             |
| バックエンド（Main）       | SkillService ファサードのメソッド要件、ハンドラー登録パターン要件      |
| IPC通信                    | 全チャネルの登録・呼び出し・レスポンス要件（OperationResult パターン） |
| セキュリティ               | validateIpcSender 検証要件、チャネルホワイトリスト準拠要件             |
| データ                     | テスト対象外（永続化は既存統合テストでカバー）                         |

---

## 成果物

| 成果物       | パス                                          | 内容                                |
| ------------ | --------------------------------------------- | ----------------------------------- |
| 要件定義書   | `outputs/phase-01/requirements-definition.md` | IPCハンドラー分析・テストケース要件 |
| 受け入れ基準 | `outputs/phase-01/acceptance-criteria.md`     | AC-001〜AC-010                      |
| スコープ定義 | `outputs/phase-01/scope-definition.md`        | 実装範囲の明確化                    |

---

## 統合テスト連携

**Phase 1 では統合テストの対象外**

要件定義フェーズのため、統合テストは後続の Phase 4 以降で実施する。ただし、以下の統合テスト設計の前提情報を収集する：

- IPC チャネル登録パターン（`ipcMain.handle` Map方式）
- `validateIpcSender()` のMock方法
- `SkillService` のMock方法（Partial Mock vs Full Mock）
- テストフィクスチャの再利用可能性（`apps/desktop/src/__tests__/__fixtures__/skills/`）

---

## 多角的チェック観点

| 観点               | 確認内容                                                                    |
| ------------------ | --------------------------------------------------------------------------- |
| IPC通信            | 全チャネル（8+権限チャネル）がテスト対象に含まれているか                    |
| セキュリティ       | `validateIpcSender` 検証がテスト要件に含まれているか                        |
| エラーハンドリング | 正常系・異常系の両方がテストケースに含まれているか                          |
| テスタビリティ     | SkillService のMock設計が実装可能か                                         |
| Electron固有       | Main Process / Preload / Renderer の境界が考慮されているか                  |
| 型安全             | テストコードが TypeScript strict モードで動作するか                         |
| 仕様整合性         | `interfaces-agent-sdk-skill.md` の OperationResult パターンと一致しているか |

---

## 完了条件

- [ ] `skillHandlers.ts` の全チャネル（8+権限）が分析・記録されている
- [ ] SkillService の全公開メソッドがマッピングされている
- [ ] 22テストケースの詳細要件（前提条件・操作・期待結果）が定義されている
- [ ] 既存テストとの差別化が明確に文書化されている
- [ ] 受け入れ基準（AC-001〜AC-010）が定義されている
- [ ] スコープ定義（実装範囲・対象外範囲）が明文化されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] 全成果物が outputs/phase-01/ に配置されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. タスク1: 現行IPCハンドラーの分析
3. タスク2: SkillService ファサードの分析
4. タスク3: テストケース要件の定義
5. タスク4: 既存テストとの差別化分析
6. タスク5: 受け入れ基準の定義
7. 成果物の作成・配置
8. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-02-design.md`

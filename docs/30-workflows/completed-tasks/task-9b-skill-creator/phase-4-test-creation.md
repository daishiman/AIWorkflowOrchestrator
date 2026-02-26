# Phase 4: テスト作成（TDD: Red）

## メタ情報

| 項目     | 値                                                |
| -------- | ------------------------------------------------- |
| Phase    | 4                                                 |
| 機能名   | task-9b-skill-creator                             |
| 作成日   | 2026-02-26                                        |
| タスクID | TASK-9B                                           |
| 状態     | pending                                           |
| 前Phase  | [Phase 3: 設計レビュー](phase-3-design-review.md) |
| 次Phase  | [Phase 5: 実装](phase-5-implementation.md)        |

## 目的

skill-creatorの期待される動作を検証するテストを**実装より先に作成**する（Red状態）。
TDD原則に従い、テストファーストで SkillCreatorService（Facade）およびサブコンポーネント群のユニットテスト・統合テストを網羅する。

## 参照資料テーブル

| 参照資料               | パス                                                                                             | 用途                           |
| ---------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------ |
| テストパターン         | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                | テスト設計パターン参照         |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                        | IPC検証要件                    |
| IPC契約チェックリスト  | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                    | チャンネル検証手順             |
| 実装パターン           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`      | DIパターン・モック設計         |
| 教訓集                 | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`                           | 過去のテスト失敗事例           |
| Skillインターフェース  | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                | 型定義・IPC契約                |
| Electronサービス設計   | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`                    | Facadeパターン設計             |
| Phase 2設計成果物      | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-2/architecture-design.md` | 設計方針・インターフェース定義 |
| Phase 1-3成果物        | `docs/30-workflows/completed-tasks/task-9b-skill-creator/outputs/phase-1/` 〜 `phase-3/`         | 要件・設計・レビュー結果       |
| 既存テスト             | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`                     | 既存テスト構造の参考           |
| 既存セキュリティテスト | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`                      | 既存セキュリティテストの参考   |

## 実行タスク

- Task 4-1: テスト対象の洗い出しと分類を行う
- Task 4-2: ユニットテストを作成する
- Task 4-3: 統合テストを作成する
- Task 4-4: 境界値テストを作成する

### Task 4-1: テスト対象の洗い出しと分類

以下の全テスト対象をリストアップし、テストカテゴリに分類する。

#### テストカテゴリ一覧

| カテゴリ | テスト対象                 | テスト観点                                                                                                        |
| -------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A        | SkillCreatorService Facade | createSkill, improveSkill, executeTasks, forkSkill, shareSkill, scheduleSkill, debugSkill, generateDocs, getStats |
| B        | HearingFacilitator         | 対話フロー制御、要件抽出、AskUserQuestion連携                                                                     |
| C        | TaskGenerator              | タスク分解、依存関係グラフ構築、トポロジカルソート、循環依存検出                                                  |
| D        | CodeGenerator              | コード生成、Claude Agent SDK query()連携、テンプレート適用、型安全チェック                                        |
| E        | ApiIntegrator              | REST API連携コード生成、Webhook連携コード生成、認証情報管理                                                       |
| F        | Validator                  | 静的検証（構文チェック）、動的検証（テスト実行）、セキュリティ検証（パストラバーサル、コマンドインジェクション）  |
| G        | IPCハンドラ                | 3段バリデーション（P42準拠）、sender検証、sanitizeErrorMessage、パストラバーサル防止、スキーマホワイトリスト      |
| H        | 統合テスト                 | SkillCreatorService → ScriptExecutor → ファイルシステムの一連のフロー                                             |

### Task 4-2: ユニットテスト作成

#### A. SkillCreatorService ユニットテスト

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`（既存ファイルの拡充）

既存テスト（SC-001〜SC-019, BC-001〜BC-005）に加えて以下のテストケースを追加する:

| テストID | テスト名                                                | 検証内容                                               |
| -------- | ------------------------------------------------------- | ------------------------------------------------------ |
| SC-020   | createSkill: update モードで正常にスキルを更新する      | mode="update" でスキル更新ワークフローが起動すること   |
| SC-021   | createSkill: improve-prompt モードで正常に最適化する    | mode="improve-prompt" でプロンプト最適化が起動すること |
| SC-022   | improveSkill: 既存スキルを分析して改善提案を返す        | SkillAnalyzer → SkillImprover の連携が動作すること     |
| SC-023   | improveSkill: 存在しないスキルでエラーを返す            | スキルが見つからない場合にエラーがスローされること     |
| SC-024   | forkSkill: スキルを複製して新しいディレクトリに生成する | 元スキルのコピーが新名前で作成されること               |
| SC-025   | forkSkill: 同名スキルが存在する場合にエラーを返す       | 名前衝突時にエラーがスローされること                   |
| SC-026   | shareSkill: スキルを共有可能な形式でエクスポートする    | エクスポートファイルが生成されること                   |
| SC-027   | scheduleSkill: スケジュール設定を保存する               | cron形式のスケジュールが保存されること                 |
| SC-028   | debugSkill: デバッグモードで詳細ログを出力する          | verbose=true でデバッグ情報が含まれること              |
| SC-029   | generateDocs: SKILL.md と README.md を生成する          | ドキュメントファイルが正しいパスに生成されること       |
| SC-030   | getStats: 使用統計を正確に集計する                      | 実行回数、成功率、平均実行時間が含まれること           |
| SC-031   | executeTasks: 並列実行モードで独立タスクを同時実行する  | parallel=true で独立タスクが同時に実行されること       |

#### B. HearingFacilitator テスト

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/HearingFacilitator.test.ts`（新規作成）

| テストID | テスト名                                            | 検証内容                                                    |
| -------- | --------------------------------------------------- | ----------------------------------------------------------- |
| HF-001   | 初期質問を生成する                                  | 最初のヒアリング質問が返されること                          |
| HF-002   | ユーザー回答から次の質問を導出する                  | 前回の回答に基づいて適切な次の質問が生成されること          |
| HF-003   | 全質問完了後にインタビュー結果を集約する            | InterviewResult型に合致するオブジェクトが返されること       |
| HF-004   | 空文字列の回答でバリデーションエラーを返す          | 回答が空の場合にエラーメッセージが返されること              |
| HF-005   | purpose/featuresが抽出された InterviewResult を返す | purpose, features, constraints の各フィールドが含まれること |
| HF-006   | 最大質問数（10問）に達した場合に強制終了する        | 10問超過時に自動的にインタビューを終了すること              |

#### C. TaskGenerator テスト

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/TaskGenerator.test.ts`（新規作成）

| テストID | テスト名                               | 検証内容                                           |
| -------- | -------------------------------------- | -------------------------------------------------- |
| TG-001   | 要件からタスクリストを生成する         | InterviewResult → TaskSpec[] の変換が正しいこと    |
| TG-002   | タスク間の依存関係を解決する           | depends_on フィールドが正しく設定されること        |
| TG-003   | 循環依存を検出してエラーを返す         | A→B→C→A の循環で Error がスローされること          |
| TG-004   | トポロジカルソートで実行順序を決定する | Kahn's algorithm で正しい順序が返されること        |
| TG-005   | 独立タスクを並列実行グループに分類する | 依存関係のないタスクが同一グループに含まれること   |
| TG-006   | 空の要件リストで空のタスクリストを返す | 入力が空の場合に [] が返されること                 |
| TG-007   | 依存先が存在しないタスクでエラーを返す | 未定義のタスクIDへの依存でエラーがスローされること |

#### D. CodeGenerator テスト

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/CodeGenerator.test.ts`（新規作成）

| テストID | テスト名                                             | 検証内容                                                           |
| -------- | ---------------------------------------------------- | ------------------------------------------------------------------ |
| CG-001   | テンプレートからスキルコードを生成する               | テンプレート変数が正しく置換されること                             |
| CG-002   | Claude Agent SDK query()を呼び出してコードを生成する | query()が正しいプロンプトで呼び出されること                        |
| CG-003   | 生成コードの型チェックを実行する                     | TypeScriptコンパイラで型エラーが検出された場合に結果に含まれること |
| CG-004   | 空のテンプレートでエラーを返す                       | テンプレートが空の場合にエラーがスローされること                   |
| CG-005   | 複数ファイル構成のスキルを生成する                   | SKILL.md, agents/, references/ の各ファイルが生成されること        |

#### E. Validator テスト

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/Validator.test.ts`（新規作成）

| テストID | テスト名                                    | 検証内容                                                  |
| -------- | ------------------------------------------- | --------------------------------------------------------- |
| VL-001   | 有効なスキルディレクトリで検証成功を返す    | SKILL.md が存在する有効なスキルで true が返されること     |
| VL-002   | SKILL.md が欠落している場合に検証失敗を返す | 必須ファイル欠落で false が返されること                   |
| VL-003   | パストラバーサルパスを拒否する              | `../` を含むパスで false が返されること                   |
| VL-004   | NULLバイトを含むパスを拒否する              | `\0` を含むパスで false が返されること                    |
| VL-005   | コマンドインジェクションパターンを検出する  | `$(...)` や `` `...` `` を含む入力で false が返されること |
| VL-006   | スキーマ検証で有効なデータを受け付ける      | 正しいスキーマに準拠したデータで true が返されること      |
| VL-007   | スキーマ検証で無効なデータを拒否する        | スキーマ不適合のデータで false が返されること             |

#### F. IPCハンドラテスト

**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.security.test.ts`（既存ファイルの拡充）
**テストファイル**: `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`（新規作成）

| テストID | テスト名                                              | 検証内容                                                         |
| -------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| IPC-001  | skill-creator:detect-mode: 空文字列でエラーを返す     | request="" で success=false が返されること                       |
| IPC-002  | skill-creator:detect-mode: スペースのみでエラーを返す | request=" " で success=false が返されること（P42対策）           |
| IPC-003  | skill-creator:create: name/description/mode 全必須    | いずれかが欠落で success=false が返されること                    |
| IPC-004  | skill-creator:create: パストラバーサルパスを拒否      | tasksDir="../etc/passwd" で success=false が返されること         |
| IPC-005  | skill-creator:execute-tasks: 空 tasksDir を拒否       | tasksDir="" で success=false が返されること                      |
| IPC-006  | skill-creator:execute-tasks: UNCパスを拒否            | `\\server\share` で success=false が返されること                 |
| IPC-007  | skill-creator:validate: skillDir が必須               | skillDir 未指定で success=false が返されること                   |
| IPC-008  | skill-creator:validate-schema: ホワイトリスト外を拒否 | schemaName="evil-schema" で success=false が返されること         |
| IPC-009  | skill-creator:validate-schema: 許可スキーマ通過       | schemaName="task-spec" で正常に検証が実行されること              |
| IPC-010  | 全チャンネル: sender検証で不正ウィンドウを拒否        | 不正な webContents.id で toIPCValidationError がスローされること |
| IPC-011  | 全チャンネル: sanitizeErrorMessage でパスを除去       | ファイルパスが [path] に置換されること                           |
| IPC-012  | 全チャンネル: sanitizeErrorMessage でトークンを除去   | token=xxx が token=\*\*\* に置換されること                       |

### Task 4-3: 統合テスト作成

**テストファイル**: `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.integration.test.ts`（既存ファイルの拡充）

| テストID | テスト名                                                    | 検証内容                                                           |
| -------- | ----------------------------------------------------------- | ------------------------------------------------------------------ |
| INT-001  | スキル生成フロー: 要件入力からスキル構造が生成される        | createSkill() → validateSkill() の一連のフローが成功すること       |
| INT-002  | タスク実行フロー: 仕様書解析から実行完了まで                | executeTasks() で全タスクが順序通り実行されること                  |
| INT-003  | エラーリカバリ: タスク実行失敗時に中断して報告する          | 途中失敗時に summary.failed > 0 かつ残タスクが skipped となること  |
| INT-004  | ドライラン: 実行せずに実行計画を返す                        | dryRun=true で mode="dry-run" かつ estimatedTime が含まれること    |
| INT-005  | IPC→Service連携: Rendererからのリクエストが正しく処理される | IPCハンドラ → SkillCreatorService の呼び出しチェーンが動作すること |

### Task 4-4: 境界値テスト作成

| テストID | テスト名                                     | 検証内容                                             |
| -------- | -------------------------------------------- | ---------------------------------------------------- |
| BV-001   | 空文字列のスキル名でバリデーションエラー     | name="" で Error がスローされること                  |
| BV-002   | スペースのみのスキル名でバリデーションエラー | name=" " で Error がスローされること（P42準拠）      |
| BV-003   | 256文字超のスキル名でバリデーションエラー    | 256文字を超える name で Error がスローされること     |
| BV-004   | パストラバーサルを含むディレクトリパスで拒否 | `../../../etc` を含むパスで Error がスローされること |
| BV-005   | NULLバイト（\0）を含む文字列で拒否           | `\0` を含む入力で Error がスローされること           |
| BV-006   | 空の依存関係リストで正常動作                 | depends_on=[] で正常にソートされること               |
| BV-007   | 1000個のタスクでトポロジカルソートが完了する | 大量タスクでタイムアウトせずにソートが完了すること   |
| BV-008   | 自己参照の循環依存を検出する                 | A→A の自己参照で循環検出がされること                 |

## アーキテクチャ層別テスト配置

| 層           | テスト観点                              | テストファイル配置                                |
| ------------ | --------------------------------------- | ------------------------------------------------- |
| Main Process | SkillCreatorService, サブコンポーネント | `apps/desktop/src/main/services/skill/__tests__/` |
| IPC通信      | ハンドラ3段バリデーション、sender検証   | `apps/desktop/src/main/ipc/__tests__/`            |
| Shared       | 型定義、ユーティリティ                  | `packages/shared/src/**/__tests__/`               |

## 統合テスト連携【必須】

| シナリオカテゴリ   | 検証内容                               | テストファイル                            | 判定基準                  |
| ------------------ | -------------------------------------- | ----------------------------------------- | ------------------------- |
| スキル生成フロー   | 要件入力→スキル構造生成→ファイル出力   | `SkillCreatorService.integration.test.ts` | 全ステップ成功            |
| タスク実行フロー   | 仕様書解析→依存解決→実行→検証          | `SkillCreatorService.integration.test.ts` | 全タスク completed        |
| エラーハンドリング | バリデーションエラー、SDK障害、FS障害  | `SkillCreatorService.integration.test.ts` | 適切なエラーコード返却    |
| IPCセキュリティ    | sender検証、パストラバーサル、sanitize | `skillCreatorHandlers.security.test.ts`   | 全攻撃パターン拒否        |
| IPC バリデーション | 3段バリデーション、必須パラメータ検証  | `skillCreatorHandlers.validation.test.ts` | 全不正入力でsuccess=false |

## 既知のPitfall対策テーブル

| Pitfall ID | 注意事項                               | Phase 4での対策                                                         |
| ---------- | -------------------------------------- | ----------------------------------------------------------------------- |
| P39        | happy-dom環境でuserEvent非互換         | Main Processテストのため影響なし。Renderer側テスト追加時はfireEvent使用 |
| P40        | テスト実行ディレクトリ依存             | `pnpm --filter @repo/desktop exec vitest run` で実行                    |
| P9         | モジュールスコープ変数のテスト間リーク | beforeEach で vi.clearAllMocks() を必ず呼び出す                         |
| P13        | タイマーテストの無限ループ             | advanceTimersByTime で1ステップずつ進める                               |
| P21        | DI追加時のテストモック大規模修正       | 影響範囲を `grep -rn "SkillCreatorService" **/*.test.ts` で事前調査     |
| P41        | v8カバレッジのインライン関数カウント   | getAllowedWindows コールバックの戻り値を明示的に検証                    |
| P42        | .trim()バリデーション漏れ              | スペースのみの入力テストケースを必ず含める                              |

## カバレッジ目標設定

| 指標              | 目標値 | 対象ファイル群                               |
| ----------------- | ------ | -------------------------------------------- |
| Line Coverage     | 80%+   | SkillCreatorService.ts, サブコンポーネント群 |
| Branch Coverage   | 60%+   | 条件分岐・switch文のカバレッジ               |
| Function Coverage | 80%+   | 全public/privateメソッド                     |

## 多角的チェック観点（AIが判断）

### セキュリティ観点

- [ ] パストラバーサル攻撃パターン（`../`, `..\\`, NULLバイト, UNCパス）がテストに含まれている
- [ ] sanitizeErrorMessage が内部パスとトークンを確実に除去する
- [ ] sender検証で不正ウィンドウからのリクエストが拒否される
- [ ] スキーマ名ホワイトリストが許可リスト外を拒否する

### 型安全観点

- [ ] TypeScript strict モードで型エラーなくコンパイルされる
- [ ] `any` 型がテストコード内に使用されていない（`as unknown as` パターンのみ許容）
- [ ] 共有型（`@repo/shared/types`）の import が正しい

### 境界値観点

- [ ] 空文字列、スペースのみ、256文字超の入力がテストされている
- [ ] 空配列、大量要素（1000件）の入力がテストされている
- [ ] 自己参照を含む循環依存がテストされている

### テスト独立性観点

- [ ] 各テストが beforeEach で状態をリセットしている
- [ ] テスト間で共有される変数が存在しない
- [ ] モックが各テストで独立して設定されている

## サブタスク管理

| サブタスクID | 内容                 | 状態    |
| ------------ | -------------------- | ------- |
| 4-1          | テスト対象の洗い出し | pending |
| 4-2          | ユニットテスト作成   | pending |
| 4-3          | 統合テスト作成       | pending |
| 4-4          | 境界値テスト作成     | pending |

## タスク100%実行確認【必須】

- [ ] 全テストカテゴリ（A〜H）のテストケースが作成されている
- [ ] 全テストが失敗状態（Red）である（実装前のため）
- [ ] テスト実行コマンドが正常に動作する: `pnpm --filter @repo/desktop exec vitest run src/main/services/skill/__tests__/SkillCreator`
- [ ] IPC テスト実行: `pnpm --filter @repo/desktop exec vitest run src/main/ipc/__tests__/skillCreator`
- [ ] カバレッジ目標値が設定されている
- [ ] 境界値テスト（BV-001〜BV-008）が全て作成されている
- [ ] P42準拠のスペースのみテストケースが含まれている

## Phase完了時の検証コマンド

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/task-9b-skill-creator --phase 4
```

## 成果物テーブル

| 成果物名                    | パス                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| テスト仕様書                | `outputs/phase-4/test-specification.md`                                                  |
| テストケース                | `outputs/phase-4/test-cases.md`                                                          |
| 統合テストシナリオ          | `outputs/phase-4/integration-test-design.md`                                             |
| ユニットテスト（Service）   | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`             |
| ユニットテスト（Hearing）   | `apps/desktop/src/main/services/skill/__tests__/HearingFacilitator.test.ts`              |
| ユニットテスト（TaskGen）   | `apps/desktop/src/main/services/skill/__tests__/TaskGenerator.test.ts`                   |
| ユニットテスト（CodeGen）   | `apps/desktop/src/main/services/skill/__tests__/CodeGenerator.test.ts`                   |
| ユニットテスト（Validator） | `apps/desktop/src/main/services/skill/__tests__/Validator.test.ts`                       |
| IPCバリデーションテスト     | `apps/desktop/src/main/ipc/__tests__/skillCreatorHandlers.validation.test.ts`            |
| 統合テスト                  | `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.integration.test.ts` |

## 完了条件

- [ ] テストケース合計50件以上が作成されている
- [ ] 全テストが失敗状態（Red）である
- [ ] テスト実行が正常に完了する（失敗するが実行自体は成功する）
- [ ] 統合テストシナリオが5件以上定義されている
- [ ] 境界値テストが8件以上含まれている
- [ ] P42準拠の3段バリデーションテストが各IPCチャンネルに含まれている
- [ ] テスト仕様書が `outputs/phase-4/` に出力されている

## 次Phase

Phase 4完了後、[Phase 5: 実装](phase-5-implementation.md)へ進む。
Phase 4で作成した全テストをGreen（成功）にする最小限の実装を行う。

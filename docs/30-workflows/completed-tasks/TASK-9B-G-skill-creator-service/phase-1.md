# Phase 1: 要件定義

## メタ情報

| 項目   | 値                        |
| ------ | ------------------------- |
| Phase  | 1                         |
| タスク | TASK-9B-G                 |
| 機能名 | skill-creator-service     |
| 作成日 | 2026-02-03                |
| 依存   | TASK-9B-A（SKILL.md定義） |

## 目的

SkillCreatorServiceの要件を明確化し、機能要件・非機能要件・受け入れ基準を定義する。

## 実行タスク

- Task 1-1: 機能要件（FR）の抽出
- Task 1-2: 非機能要件（NFR）の抽出
- Task 1-3: 受け入れ基準の定義
- Task 1-4: 接続要件の整理

## 参照資料

| 資料名         | パス                                                                     | 説明             |
| -------------- | ------------------------------------------------------------------------ | ---------------- |
| 元タスク仕様   | `docs/30-workflows/skill-import-agent-system/tasks/task-9b-g-service.md` | 入力タスク仕様   |
| SKILL.md定義   | `~/.aiworkflow/skills/skill-creator/SKILL.md`                            | 依存成果物       |
| リソースマップ | `~/.aiworkflow/skills/skill-creator/references/resource-map.md`          | 利用可能リソース |
| Agent SDK仕様  | `aiworkflow-requirements: interfaces-agent-sdk-skill.md`                 | SDK統合仕様      |
| IPC設計        | `aiworkflow-requirements: api-ipc-agent.md`                              | IPC通信仕様      |

## 実行手順

### Task 1-1: 機能要件（FR）の抽出

以下の機能要件を抽出する：

| FR-ID | 要件名           | 説明                                                                                               |
| ----- | ---------------- | -------------------------------------------------------------------------------------------------- |
| FR-01 | モード判定       | リクエスト内容から適切なモード（collaborative/orchestrate/create/update/improve-prompt）を判定する |
| FR-02 | スキル作成       | collaborative/orchestrate/createモードに応じたワークフローでスキルを作成する                       |
| FR-03 | タスク実行       | 依存関係を解決し、並列/逐次でタスクを実行する                                                      |
| FR-04 | スキル検証       | スキルディレクトリの構造・SKILL.md・スキーマを検証する                                             |
| FR-05 | スクリプト実行   | scripts/配下のJavaScriptを決定論的に実行する（Script First）                                       |
| FR-06 | リソース読み込み | agents/references/assets/schemas/を遅延読み込みする（Progressive Disclosure）                      |
| FR-07 | 循環依存検出     | タスク間の循環依存を検出してエラーとする                                                           |
| FR-08 | ドライラン       | 実行前に実行順序と見積もり時間を表示する                                                           |

### Task 1-2: 非機能要件（NFR）の抽出

| NFR-ID | 要件名           | 説明                                       | 目標値         |
| ------ | ---------------- | ------------------------------------------ | -------------- |
| NFR-01 | テストカバレッジ | Line/Function Coverage                     | 80%+           |
| NFR-02 | 型安全性         | TypeScript strictモード                    | 100%           |
| NFR-03 | スクリプト精度   | Script First原則による決定論的処理         | 100%           |
| NFR-04 | エラー復旧       | スクリプト失敗時の適切なエラーハンドリング | 全ケース対応   |
| NFR-05 | 拡張性           | 新規モード/スクリプト追加への対応          | プラガブル設計 |

### Task 1-3: 受け入れ基準の定義

| AC-ID | 対応FR | 受け入れ基準                                                     |
| ----- | ------ | ---------------------------------------------------------------- |
| AC-01 | FR-01  | detectMode()が5つのモードを正しく判定できる                      |
| AC-02 | FR-02  | createSkill()が各モードで適切なワークフローを実行する            |
| AC-03 | FR-03  | executeTasks()がトポロジカルソートで依存関係を解決する           |
| AC-04 | FR-04  | validateSkill()がvalidate_all.jsを呼び出し結果を返す             |
| AC-05 | FR-05  | ScriptExecutorがスクリプトを実行し、stdout/stderr/exitCodeを返す |
| AC-06 | FR-06  | ResourceLoaderがキャッシュ付きでリソースを読み込む               |
| AC-07 | FR-07  | detectCycles()が循環依存を検出してエラーを返す                   |
| AC-08 | FR-08  | executeTasks({ dryRun: true })が実行計画のみ返す                 |

### Task 1-4: 接続要件の整理

| 接続先                    | 接続方法            | 用途                   |
| ------------------------- | ------------------- | ---------------------- |
| skill-creatorスクリプト群 | child_process.spawn | Script First実行       |
| skill-creatorリソース群   | fs.readFile         | Progressive Disclosure |
| Claude Agent SDK          | query() API         | タスク実行（将来）     |
| Anthropic SDK             | Message API         | フォールバック実行     |

## 統合テスト連携【必須】

| 接続要件カテゴリ | 記載内容                                                 |
| ---------------- | -------------------------------------------------------- |
| スクリプト実行   | ScriptExecutor → scripts/\*.js                           |
| リソース読み込み | ResourceLoader → agents/, references/, assets/, schemas/ |
| SDK連携          | SkillCreatorService → Claude Agent SDK / Anthropic SDK   |

## アーキテクチャ層別要件

| 層                   | 確認観点                                               |
| -------------------- | ------------------------------------------------------ |
| バックエンド（Main） | サービス実装、スクリプト実行、ファイルシステムアクセス |
| IPC通信              | 将来のRenderer連携用インターフェース設計               |
| データ               | スキルディレクトリ構造、artifacts.json管理             |

## 多角的チェック観点

| 観点               | 適用判断                   | 仕様参照先                                   |
| ------------------ | -------------------------- | -------------------------------------------- |
| セキュリティ       | スクリプト実行時のパス検証 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | サービス層設計             | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | スクリプト失敗時の処理     | `aiworkflow-requirements: error-handling.md` |

## 成果物

| 成果物       | パス                                         | 説明       |
| ------------ | -------------------------------------------- | ---------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | FR/NFR一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義     |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲   |

## 完了条件

- [ ] 機能要件（FR-01〜FR-08）が抽出されている
- [ ] 非機能要件（NFR-01〜NFR-05）が抽出されている
- [ ] 受け入れ基準（AC-01〜AC-08）が定義されている
- [ ] 接続要件が整理されている
- [ ] アーキテクチャ層別の要件が整理されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1-1: 機能要件（FR）の抽出
3. Task 1-2: 非機能要件（NFR）の抽出
4. Task 1-3: 受け入れ基準の定義
5. Task 1-4: 接続要件の整理
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-9B-G-skill-creator-service --phase 1
```

## 次のPhase

Phase 2: 設計

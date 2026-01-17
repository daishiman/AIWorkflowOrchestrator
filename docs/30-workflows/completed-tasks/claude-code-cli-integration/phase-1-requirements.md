# Phase 1: 要件定義

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 1                           |
| 機能名 | claude-code-cli-integration |
| 作成日 | 2026-01-16                  |

## 目的

Claude Code CLI統合の目的、スコープ、受け入れ基準を明文化する。
また、Claude Code CLIのスキル実行仕様を調査し、技術的実現可能性を確認する。

## 実行タスク

### タスク1: 要件抽出

**目的**: ユーザー要求から機能要件・非機能要件を抽出する

**手順**:

1. 元タスク指示書（`requirements-claude-code-cli-integration.md`）を精読
2. 機能要件（FR）を抽出・整理
3. 非機能要件（NFR）を抽出・整理
4. 優先度を設定

**期待される成果物**:

- 機能要件一覧（FR-001〜）
- 非機能要件一覧（NFR-001〜）

### タスク2: 受け入れ基準作成

**目的**: 各要件に対して検証可能な受け入れ基準を定義する

**手順**:

1. 各機能要件に対してGiven-When-Then形式でACを作成
2. 検証方法（手動/自動）を明記
3. 境界値・異常系の条件を含める

**期待される成果物**:

- 受け入れ基準一覧

### タスク3: Claude Code CLI仕様調査

**目的**: Claude Code CLIでスキルを実行するためのコマンド仕様を調査する

**手順**:

1. `claude-code-guide`スキルを参照してCLI仕様を確認
2. スキル実行コマンド形式を調査（`claude skill`, `/skill`等）
3. 出力フォーマット（JSON/plain text）を確認
4. エラーコード体系を調査
5. 技術的制約・リスクを洗い出す

**参照スキル**: `.claude/skills/claude-code-guide/SKILL.md`

**期待される成果物**:

- CLI調査レポート（コマンド仕様、引数、出力フォーマット）
- 技術的実現可能性の評価

## 参照資料

| 資料名            | パス                                                                            | 説明                |
| ----------------- | ------------------------------------------------------------------------------- | ------------------- |
| 元タスク指示書    | `docs/30-workflows/unassigned-task/requirements-claude-code-cli-integration.md` | 元の要件定義        |
| Agent SDK仕様     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | 既存API設計（参考） |
| claude-code-guide | `.claude/skills/claude-code-guide/SKILL.md`                                     | CLI仕様ガイド       |
| Claude Code仕様   | `.claude/skills/aiworkflow-requirements/references/claude-code-overview.md`     | 3層アーキテクチャ   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                    |
| ------------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | 既存Agent API設計       |
| APIエンドポイント         | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | IPC API設計パターン     |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件 |

## 統合テスト連携【必須】

接続要件（CLI/IPC/プロセス管理）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                    |
| ---------------- | ----------------------------------------------------------- |
| CLI接続          | Claude Code CLIのインストール確認、バージョン要件、実行パス |
| IPC通信          | Main-Renderer間IPC通信チャンネル設計                        |
| プロセス管理     | child_processによるCLIプロセスのスポーン・監視・終了処理    |
| ストリーミング   | 標準出力/標準エラー出力のリアルタイムキャプチャ             |
| セッション管理   | 複数CLIセッションの並列管理、クリーンアップ                 |

## 成果物

| 成果物          | パス                                          | 説明             |
| --------------- | --------------------------------------------- | ---------------- |
| 要件定義書      | `outputs/phase-1/requirements-definition.md`  | 機能・非機能要件 |
| 受け入れ基準    | `outputs/phase-1/acceptance-criteria.md`      | AC定義           |
| スコープ定義    | `outputs/phase-1/scope-definition.md`         | 実装範囲         |
| CLI調査レポート | `outputs/phase-1/cli-investigation-report.md` | CLI仕様調査結果  |

## 完了条件

- [ ] 機能要件が抽出されている（FR-001〜）
- [ ] 非機能要件が抽出されている（NFR-001〜）
- [ ] 各要件にGiven-When-Then形式の受け入れ基準がある
- [ ] スコープ（含むもの/含まないもの）が明確化されている
- [ ] Claude Code CLIのスキル実行コマンド仕様が調査されている
- [ ] 技術的制約・リスクが洗い出されている
- [ ] 接続要件（CLI/IPC/プロセス管理）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 元タスク指示書の精読・要件抽出
2. 機能要件（FR）の整理
3. 非機能要件（NFR）の整理
4. 受け入れ基準（AC）の作成
5. Claude Code CLI仕様調査
6. CLI調査レポートの作成
7. 統合テスト連携（接続要件）の明記
8. 成果物の作成・配置
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-cli-integration --phase 1
```

## 次のPhase

Phase 2: 設計

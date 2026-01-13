# Phase 1: 要件定義

## メタ情報

| 項目   | 値                      |
| ------ | ----------------------- |
| Phase  | 1                       |
| 機能名 | claude-code-integration |
| 作成日 | 2026-01-12              |

## 目的

Claude Agent SDK統合の目的、スコープ、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: SDK統合要件・IPC通信要件・セキュリティ要件を抽出
- 受け入れ基準作成: Given-When-Then形式で検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                         | 内容                     |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Agent SDK型定義・IPC仕様 |
| Electronセキュリティ      | `.claude/skills/aiworkflow-requirements/references/security-api-electron.md` | IPC通信セキュリティ要件  |
| アーキテクチャパターン    | `.claude/skills/aiworkflow-requirements/references/architecture-patterns.md` | 設計パターン・原則       |

### その他参照

| 資料名           | パス                                                                         | 説明                           |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------ |
| Claude Agent SDK | `.claude/skills/claude-agent-sdk/`                                           | SDK使用方法・Hooks・Permission |
| タスク指示書     | `docs/30-workflows/unassigned-task/task-agent-05-claude-code-integration.md` | 元タスク指示書                 |

## 実行手順

### 1. 要件抽出

Claude Agent SDK統合に必要な要件を抽出する:

**機能要件**:

1. SDK `query()` APIでエージェントを実行できる
2. Hooksシステム（PreToolUse/PostToolUse/PermissionRequest）を実装する
3. Permission Controlで宣言的に権限ルールを定義できる
4. Permission Dialogでユーザー承認を求められる
5. ストリーミング出力をIPC経由でRendererに転送できる
6. AbortSignalで実行をキャンセルできる
7. 複数の実行を独立して管理できる

**非機能要件**:

1. セキュリティ: 危険なBashコマンドをブロックする
2. セキュリティ: システムディレクトリへの書き込みを禁止する
3. パフォーマンス: ストリーミング遅延を最小化する
4. 信頼性: AbortSignalを適切に伝播する

### 2. 受け入れ基準作成

Given-When-Then形式で受け入れ基準を定義する:

```gherkin
Feature: Claude Agent SDK統合

Scenario: SDK query() APIでエージェントを実行できる
  Given スキルが選択されている
  And ユーザーがメッセージを入力している
  When agent:startを呼び出す
  Then SDK query() APIが呼び出される
  And スキルコンテキストがsettingSourcesで渡される

Scenario: ストリーミングメッセージを受信できる
  Given エージェントが実行中である
  When SDKがメッセージを生成する
  Then agent:streamイベントがRendererに送信される
  And AgentStreamMessage型のデータが含まれる

Scenario: 危険なツール使用をブロックできる
  Given エージェントが実行中である
  And PreToolUse Hookが設定されている
  When 危険なBashコマンド（rm -rf, sudo等）が実行されようとする
  Then PreToolUse Hookがproceed: falseを返す
  And ツール使用がブロックされる
  And ブロック理由がユーザーに通知される

Scenario: Permission Dialogでユーザー承認を求められる
  Given エージェントが実行中である
  And PermissionRequest Hookが設定されている
  When 権限確認が必要なツール（Write, Edit等）が呼び出される
  Then agent:permissionイベントがRendererに送信される
  And Rendererからagent:permission:resで応答を受信する
  And 応答に基づいてツール実行が継続または中断される

Scenario: 実行をキャンセルできる
  Given エージェントが実行中である
  When agent:stopを呼び出す
  Then AbortControllerがabort()される
  And 実行がキャンセルされる
  And agent:statusでcancelledステータスが送信される

Scenario: エラーを処理できる
  Given エージェントを実行している
  When SDK実行でエラーが発生する
  Then agent:streamイベントでerrorタイプが送信される
  And エラーメッセージが含まれる
  And agent:statusでerrorステータスが送信される

Scenario: 複数の実行を管理できる
  Given 実行Aが進行中である
  When 新しい実行Bを開始する
  Then 実行Aと実行Bが独立して管理される
  And 各実行のストリームがexecutionIdで区別される
  And 各実行を個別にキャンセルできる

Scenario: 宣言的権限ルールで制御できる
  Given Permission Rulesが設定されている
  When deny/allow/askルールに該当するツールが呼ばれる
  Then ルールに従って権限判定が行われる
```

### 3. FR/NFR分類

**機能要件（FR）優先度**:

| ID    | 要件                  | 優先度 |
| ----- | --------------------- | ------ |
| FR-01 | SDK query() API実行   | 高     |
| FR-02 | Hooksシステム実装     | 高     |
| FR-03 | Permission Control    | 高     |
| FR-04 | ストリーミングIPC転送 | 高     |
| FR-05 | AbortSignalキャンセル | 高     |
| FR-06 | 複数実行管理          | 中     |
| FR-07 | Permission Dialog連携 | 高     |

**非機能要件（NFR）優先度**:

| ID     | 要件                     | 優先度 |
| ------ | ------------------------ | ------ |
| NFR-01 | 危険コマンドブロック     | 高     |
| NFR-02 | システムディレクトリ保護 | 高     |
| NFR-03 | ストリーミング遅延最小化 | 中     |
| NFR-04 | AbortSignal伝播保証      | 高     |

## 統合テスト連携【必須】

IPC接続要件（agent:stream/agent:permission）を要件に明記する:

| 接続要件カテゴリ   | 記載内容                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------- |
| IPC接続            | agent:start, agent:stop, agent:stream, agent:status, agent:permission, agent:permission:res |
| データフロー       | Renderer→Main(start)→SDK→Main(stream)→Renderer                                              |
| エラーハンドリング | SDK例外→agent:stream(error)→agent:status(error)→Renderer表示                                |

## 成果物

| 成果物       | パス                                         | 説明             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

## 完了条件

- [ ] 全機能要件（FR-01〜FR-07）が抽出されている
- [ ] 全非機能要件（NFR-01〜NFR-04）が抽出されている
- [ ] 各要件にGiven-When-Then形式の受け入れ基準がある
- [ ] FR/NFRが優先度付きで分類されている
- [ ] IPC接続要件が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（interfaces-agent-sdk.md, security-api-electron.md）
2. 機能要件の抽出（FR-01〜FR-07）
3. 非機能要件の抽出（NFR-01〜NFR-04）
4. 受け入れ基準の作成（Given-When-Then形式）
5. IPC接続要件の明記
6. 成果物の作成・配置
7. 完了条件の検証

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/claude-code-integration --phase 1
```

## 次のPhase

Phase 2: 設計

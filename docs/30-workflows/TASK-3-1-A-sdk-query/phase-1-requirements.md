# Phase 1: 要件定義 - TASK-3-1-A SDK query() 基本実装

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 1                    |
| Phase名    | 要件定義             |
| 前提Phase  | なし                 |
| 後続Phase  | Phase 2 (設計)       |
| ステータス | 未実施               |
| 作成日     | 2026-01-24           |
| 機能名     | TASK-3-1-A-sdk-query |

---

## 目的

SkillExecutor クラスの機能要件・非機能要件を明確化し、受け入れ基準を定義する。

## 背景

Claude Agent SDK の `query()` API を使用してスキルを実行する基本構造を実装するにあたり、
事前に必要な機能、性能要件、セキュリティ要件を明確にする必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の抽出

**目的**: SkillExecutor に必要な機能を洗い出す

**実行手順**:

1. 元のタスク定義（task-3-1-a-sdk-query.md）を確認
2. 依存タスク（TASK-2A, TASK-2C）の成果物を確認
3. interfaces-agent-sdk.md から SDK API 仕様を確認
4. 機能要件リストを作成

**期待される成果物**:

- 機能要件リスト（FR-001 〜）

### タスク2: 非機能要件の抽出

**目的**: 性能・セキュリティ・保守性の要件を定義

**実行手順**:

1. セキュリティパターン（TASK-2C）の要件を確認
2. ストリーミング性能要件を定義
3. エラーハンドリング要件を定義
4. 保守性・拡張性要件を定義

**期待される成果物**:

- 非機能要件リスト（NFR-001 〜）

### タスク3: 受け入れ基準の作成

**目的**: 各要件に対する検証可能な基準を定義

**実行手順**:

1. 各機能要件に対してテスト可能な基準を作成
2. 各非機能要件に対して計測可能な基準を作成
3. 優先度を設定

**期待される成果物**:

- 受け入れ基準リスト

---

## 参照資料

| 参照資料                  | パス                                                                                            | 内容                    |
| ------------------------- | ----------------------------------------------------------------------------------------------- | ----------------------- |
| 元タスク定義              | `docs/30-workflows/skill-import-agent-system/tasks/task-3-1-a-sdk-query.md`                     | SDK query()基本実装仕様 |
| SkillScanner仕様          | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-2a-skill-scanner.md`     | スキルスキャン仕様      |
| セキュリティパターン      | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-2c-security-patterns.md` | セキュリティ定義        |
| 型定義                    | `docs/30-workflows/skill-import-agent-system/tasks/completed-task/task-1-1-type-definitions.md` | 共通型定義              |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                     | SDK API仕様             |
| スキル実行セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`                 | セキュリティ仕様        |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                            | 内容                   |
| ------------------------- | ------------------------------------------------------------------------------- | ---------------------- |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`     | query() API、型定義    |
| スキル実行セキュリティ    | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | 実行時セキュリティ要件 |

---

## 成果物

| 成果物       | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 統合テスト連携【必須】

SDK連携要件（query API/ストリーミング/中断）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                          |
| ---------------- | ------------------------------------------------- |
| SDK連携          | Claude Agent SDK query() API 呼び出し             |
| ストリーミング   | stream() メソッドによるリアルタイムメッセージ受信 |
| 中断処理         | AbortController によるキャンセル                  |
| IPC通信          | Main → Renderer へのメッセージ配信                |

---

## 完了条件

- [ ] 機能要件が全て抽出されている（execute, abort, stream）
- [ ] 非機能要件が定義されている（性能、セキュリティ、保守性）
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類・優先度設定されている
- [ ] SDK連携要件（query/stream/abort）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 機能要件テンプレート

```markdown
## FR-001: スキル実行

**説明**: スキルのプロンプトを Claude Agent SDK に送信し、実行する

**受け入れ基準**:

- [ ] execute() メソッドが SkillExecutionRequest を受け取る
- [ ] query() API を呼び出してスキルを実行する
- [ ] executionId を生成して返却する
- [ ] 実行完了/エラー時に適切なレスポンスを返す

**優先度**: 高
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/skill-import-agent-system/tasks/TASK-3-1-A-sdk-query/phase-2-design.md`

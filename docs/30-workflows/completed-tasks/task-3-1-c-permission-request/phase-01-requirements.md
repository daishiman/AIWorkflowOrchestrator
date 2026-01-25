# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                        |
| ---------- | --------------------------- |
| Phase      | 1                           |
| Phase名    | 要件定義                    |
| 前提Phase  | なし                        |
| 後続Phase  | Phase 2                     |
| ステータス | 未実施                      |
| 作成日     | 2026-01-25                  |
| 機能名     | PermissionRequest Hook 統合 |

---

## 目的

PermissionRequest Hook 統合の要件を明確化し、受け入れ基準を定義する。

## 背景

Claude Agent SDK の PermissionRequest Hook は、ツール実行時にユーザーからの承認が必要な場合に呼び出される。
これをElectron アプリケーションに統合し、Renderer Process でのユーザー確認フローを実現する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 機能要件の定義

**目的**: PermissionRequest Hook が満たすべき機能要件を明確化する

**実行手順**:

1. システム仕様 `interfaces-agent-sdk.md` から PermissionRequest 型定義を確認する
2. 必要な機能を一覧化する
3. 各機能の詳細要件を記述する

**期待される成果物**:

- 機能要件定義書

**機能要件一覧**:

| ID     | 要件名                 | 説明                                                     | 優先度 |
| ------ | ---------------------- | -------------------------------------------------------- | ------ |
| FR-001 | 権限リクエスト送信     | Renderer に権限確認リクエストを IPC 経由で送信する       | 必須   |
| FR-002 | ユーザー応答待機       | PermissionResolver を使用してユーザー応答を待機する      | 必須   |
| FR-003 | 承認時の実行継続       | ユーザーが承認した場合、ツール実行を続行する             | 必須   |
| FR-004 | 拒否時の実行停止       | ユーザーが拒否した場合、ツール実行を中止しメッセージ返却 | 必須   |
| FR-005 | タイムアウト処理       | 一定時間応答がない場合、タイムアウトとして処理する       | 必須   |
| FR-006 | 引数サニタイズ         | 機密情報を除去してから Renderer に送信する               | 必須   |
| FR-007 | 権限リクエスト理由生成 | ツール名と引数から人間可読な理由を生成する               | 必須   |
| FR-008 | ステータス通知         | 権限待機中であることをストリームで通知する               | 推奨   |

---

### タスク2: 非機能要件の定義

**目的**: パフォーマンス、セキュリティ、ユーザビリティの要件を定義する

**実行手順**:

1. パフォーマンス要件を定義する
2. セキュリティ要件を定義する
3. ユーザビリティ要件を定義する

**期待される成果物**:

- 非機能要件定義書

**非機能要件一覧**:

| ID      | カテゴリ       | 要件                                               |
| ------- | -------------- | -------------------------------------------------- |
| NFR-001 | パフォーマンス | 権限リクエスト送信は 100ms 以内に完了すること      |
| NFR-002 | パフォーマンス | タイムアウト時間は設定可能とする（デフォルト30秒） |
| NFR-003 | セキュリティ   | 機密情報（APIキー、パスワード等）は表示しない      |
| NFR-004 | セキュリティ   | 500文字を超える引数は省略して表示する              |
| NFR-005 | ユーザビリティ | 権限リクエスト理由は日本語で分かりやすく表示する   |
| NFR-006 | 信頼性         | AbortSignal によるキャンセルに対応する             |

---

### タスク3: インターフェース要件の定義

**目的**: 外部システム・コンポーネントとのインターフェースを定義する

**実行手順**:

1. IPC チャネル定義を確認・定義する
2. 入出力データ形式を定義する
3. エラーハンドリング方針を定義する

**期待される成果物**:

- インターフェース仕様書

**IPC チャネル定義**:

| チャネル名                  | 方向            | ペイロード                                                |
| --------------------------- | --------------- | --------------------------------------------------------- |
| `skill:permission:request`  | Main → Renderer | `{ executionId, requestId, toolName, args, reason }`      |
| `skill:permission:response` | Renderer → Main | `{ requestId, approved, rememberChoice?, rejectReason? }` |

**PermissionRequest ペイロード**:

```typescript
interface SkillPermissionRequest {
  executionId: string; // スキル実行ID
  requestId: string; // 権限リクエストID（ユニーク）
  toolName: string; // ツール名（Bash, Write, Edit 等）
  args: Record<string, unknown>; // サニタイズ済み引数
  reason: string; // 人間可読な理由
}
```

**PermissionResponse ペイロード**:

```typescript
interface SkillPermissionResponse {
  requestId: string; // 権限リクエストID
  approved: boolean; // 承認/拒否
  rememberChoice?: boolean; // 選択を記憶するか
  rejectReason?: string; // 拒否理由
}
```

---

### タスク4: 受け入れ基準の定義

**目的**: 本タスクの完了を判定する基準を明確化する

**実行手順**:

1. 機能テストの受け入れ基準を定義する
2. 非機能テストの受け入れ基準を定義する

**期待される成果物**:

- 受け入れ基準一覧

**受け入れ基準**:

| ID     | 基準                                                                    |
| ------ | ----------------------------------------------------------------------- |
| AC-001 | PermissionRequest Hook が SDK の hooks オブジェクトに追加される         |
| AC-002 | 権限リクエストが正しい IPC チャネルで送信される                         |
| AC-003 | ユーザーが承認すると `{ proceed: true }` が返却される                   |
| AC-004 | ユーザーが拒否すると `{ proceed: false, message: string }` が返却される |
| AC-005 | 30秒のタイムアウト後、自動的に拒否される                                |
| AC-006 | 500文字を超える引数が省略されて送信される                               |
| AC-007 | Bash ツールは実行コマンドを理由に含む                                   |
| AC-008 | Write/Edit ツールはファイルパスを理由に含む                             |

---

## 参照資料

| 参照資料                   | パス                                                                                 | 内容                         |
| -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------- |
| Agent SDK インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`          | PermissionRequest型、IPC定義 |
| セキュリティパターン定義   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md`      | 引数サニタイズ・セキュリティ |
| TASK-3-1-C 元仕様          | `docs/30-workflows/skill-import-agent-system/tasks/task-3-1-c-permission-request.md` | 元タスク定義                 |
| TASK-3-2 仕様              | `docs/30-workflows/skill-import-agent-system/tasks/task-3-2-permission-resolver.md`  | PermissionResolver 仕様      |

---

## 成果物

| 成果物               | パス                                              | 内容                |
| -------------------- | ------------------------------------------------- | ------------------- |
| 機能要件定義書       | `outputs/phase-01/functional-requirements.md`     | 機能要件一覧        |
| 非機能要件定義書     | `outputs/phase-01/non-functional-requirements.md` | 非機能要件一覧      |
| インターフェース仕様 | `outputs/phase-01/interface-specification.md`     | IPC・データ形式定義 |
| 受け入れ基準         | `outputs/phase-01/acceptance-criteria.md`         | 受け入れ基準一覧    |

---

## 統合テスト連携（Phase 1〜11は必須）

本 Phase では要件定義のみのため、統合テスト追加は不要。
後続 Phase で統合テストを設計・実装する。

---

## 完了条件

- [ ] 機能要件 8 項目が定義されている
- [ ] 非機能要件 6 項目が定義されている
- [ ] IPC チャネル定義が完了している
- [ ] 受け入れ基準 8 項目が定義されている
- [ ] 成果物が全て生成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初の Phase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/task-3-1-c-permission-request/phase-02-design.md`

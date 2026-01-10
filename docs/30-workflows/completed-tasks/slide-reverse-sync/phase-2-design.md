# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容               |
| ---------- | ------------------ |
| Phase      | 2                  |
| Phase名    | 設計               |
| 前提Phase  | Phase 1            |
| 後続Phase  | Phase 3            |
| ステータス | 未実施             |
| 作成日     | 2026-01-10         |
| 機能名     | slide-reverse-sync |

---

## 目的

逆同期機能のアーキテクチャを設計し、Claude CodeとのAPI連携パターンを定義する。

## 背景

Phase 1で定義した要件を実現するための技術的な設計を行う。特に`structure.md`と`index.html`は1:1対応ではないため、Claude Code（Agent SDK）による意味的な解析を行うための設計が必要。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: domain-modeling

**パス**: `.claude/skills/domain-modeling/SKILL.md`

**選定理由**: タスク指示書で指定されているスキル。逆同期のドメインモデル（Entity, Value Object, Aggregate）を設計するため。

**Trigger条件**:

- ドメインモデル設計、エンティティとValue Objectの識別、Aggregate境界の定義を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 逆同期に関連するドメインモデルを定義

**期待される成果物**:

- `outputs/phase-2/domain-model.md` - ドメインモデル設計書

---

### スキル2: api-client-patterns

**パス**: `.claude/skills/api-client-patterns/SKILL.md`

**選定理由**: タスク指示書で指定されているスキル。Agent SDK呼び出しパターンと腐敗防止層（Anti-Corruption Layer）を設計するため。

**Trigger条件**:

- APIクライアントを設計する必要がある時、外部データを内部ドメインモデルに変換する必要がある時に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. Agent SDK呼び出しパターンを設計

**期待される成果物**:

- `outputs/phase-2/api-specification.md` - Agent SDK呼び出し仕様

---

### スキル3: electron-ipc-patterns

**パス**: `.claude/skills/electron-ipc-patterns/SKILL.md`

**選定理由**: Main/Renderer間のIPC通信パターンを設計するため。同期状態の通知やエラーハンドリングの設計に必要。

**Trigger条件**:

- Electron Main/Renderer間の通信設計を行う場合に使用

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. IPC通信パターンを設計

**期待される成果物**:

- `outputs/phase-2/ipc-design.md` - IPC通信設計書

---

## 参照資料

| 参照資料      | パス                                         | 内容         |
| ------------- | -------------------------------------------- | ------------ |
| Phase 1成果物 | `outputs/phase-1/requirements-definition.md` | 要件定義     |
| Phase 1成果物 | `outputs/phase-1/acceptance-criteria.md`     | 受け入れ基準 |
| 現在の実装    | `apps/desktop/src/main/slide/`               | 既存コード   |
| 型定義        | `packages/shared/src/slide/types.ts`         | 既存型定義   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                         | 内容                      |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------- |
| Electronアーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | モノレポ構成              |
| Agent SDK仕様          | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`  | Agent連携インターフェース |
| IPC設計                | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`         | Electron IPC設計          |
| エラーハンドリング     | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー処理パターン        |

---

## 成果物

| 成果物         | パス                                     | 内容                       |
| -------------- | ---------------------------------------- | -------------------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md` | システム構造・フロー設計   |
| ドメインモデル | `outputs/phase-2/domain-model.md`        | エンティティ・VO・集約設計 |
| API仕様        | `outputs/phase-2/api-specification.md`   | Agent SDK呼び出し仕様      |
| IPC設計        | `outputs/phase-2/ipc-design.md`          | Main/Renderer間通信設計    |

---

## 統合テスト連携【必須】

統合ポイント/契約（IPC・Agent SDK）を設計に反映する:

| 統合ポイント         | 契約定義                                               |
| -------------------- | ------------------------------------------------------ |
| file-watcher→sync    | ファイル変更イベントの形式（path, content, timestamp） |
| sync→skill-executor  | modifier skill実行リクエスト/レスポンス形式            |
| skill-executor→Agent | Claude SDK APIリクエスト/レスポンス形式                |
| sync→IPC             | SyncStatusIndicatorへの状態通知形式                    |

---

## 完了条件

- [ ] アーキテクチャが定義されている（フロー図含む）
- [ ] ドメインモデルが作成されている
- [ ] Agent SDK呼び出し仕様が定義されている
- [ ] IPC通信パターンが設計されている
- [ ] 要件との整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 1成果物の確認
2. domain-modelingスキルの実行
3. api-client-patternsスキルの実行
4. electron-ipc-patternsスキルの実行
5. 統合テスト連携の実施（統合ポイント定義）
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各スキルの成果物が生成されている
- [ ] スキルフィードバックがLOGS.mdに記録されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/slide-reverse-sync --phase 2
```

---

## スキルフィードバック記録（Phase完了後に記載）

```markdown
## Phase 2 実行記録

### 使用スキル

- domain-modeling: {{result}}
- api-client-patterns: {{result}}
- electron-ipc-patterns: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phaseへの引き継ぎ事項

-
```

---

## 次のPhase

Phase 3: 設計レビューゲート

`docs/30-workflows/slide-reverse-sync/phase-3-design-review.md`

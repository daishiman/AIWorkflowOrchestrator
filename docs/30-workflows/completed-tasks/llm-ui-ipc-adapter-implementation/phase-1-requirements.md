# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 1                                 |
| Phase名    | 要件定義                          |
| 前提Phase  | なし                              |
| 後続Phase  | Phase 2                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-08                        |
| 機能名     | llm-ui-ipc-adapter-implementation |
| タスクID   | TASK-LLM-UI-IPC-ADAPTER-001       |

---

## 目的

Phase 1〜10で整備済みの基盤（Zodスキーマ、llmSlice、IPCチャンネル定義、テストスイート）を活用し、UI/IPC/Adapterの要件を明文化する。

## 背景

`chat-multi-llm-switching` タスクでPhase 1〜10まで完了し、以下の基盤が整備済み:

- **Zodスキーマ定義**: `packages/shared/src/types/llm/schemas/`
- **状態管理（llmSlice）**: `apps/desktop/src/renderer/store/slices/llmSlice.ts`
- **IPCチャンネル定義**: `apps/desktop/src/preload/channels.ts`
- **Preload API定義**: `apps/desktop/src/preload/index.ts`
- **テストスイート**: 390件（100%成功）

Phase 11で以下が未実装であることが判明しブロックされた:

1. UIコンポーネント
2. IPCハンドラー
3. LLMアダプター

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: requirements-engineering

**パス**: `.claude/skills/requirements-engineering/SKILL.md`

**選定理由**: ユーザー要求から機能要件・非機能要件を体系的に抽出するため

**Trigger条件**:

- 新機能の要件を定義する場合
- ユーザー要求を仕様化する場合

**期待される成果物**:

- 要件定義書（機能要件・非機能要件の分類）

---

### スキル2: acceptance-criteria-writing

**パス**: `.claude/skills/acceptance-criteria-writing/SKILL.md`

**選定理由**: Given-When-Then形式でテスト可能な受け入れ基準を定義するため

**Trigger条件**:

- 受け入れ基準の作成が必要な場合
- テスト可能な要件定義を行う場合

**期待される成果物**:

- 受け入れ基準（Given-When-Then形式）

---

### スキル3: functional-non-functional-requirements

**パス**: `.claude/skills/functional-non-functional-requirements/SKILL.md`

**選定理由**: 機能要件と非機能要件を明確に分類・整理するため

**Trigger条件**:

- FR/NFRの分類が必要な場合

**期待される成果物**:

- FR/NFR分類表

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                  | 内容                    |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLM型定義・スキーマ仕様 |

### 関連ドキュメント

| 参照資料       | パス                                                                                    | 内容               |
| -------------- | --------------------------------------------------------------------------------------- | ------------------ |
| 実装ガイド     | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-12/implementation-guide.md`   | 既存設計・実装詳細 |
| スキーマ設計   | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-2/schema-design.md`           | Zodスキーマ設計    |
| 状態管理設計   | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-2/state-management-design.md` | llmSlice設計       |
| 未タスク指示書 | `docs/30-workflows/unassigned-task/task-llm-ui-ipc-adapter-implementation.md`           | 元のタスク指示書   |

---

## 成果物

| 成果物       | パス                                         | 内容                            |
| ------------ | -------------------------------------------- | ------------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件            |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | GWT形式の受け入れ基準           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・含む/含まないの明確化 |

---

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                            |
| ---------------- | ------------------------------------------------------------------- |
| API接続          | llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat |
| 認証フロー       | 各プロバイダーAPIキーの設定・検証                                   |
| データフロー     | UI→llmSlice→IPC→Main→Adapter→外部API→Main→IPC→llmSlice→UI           |

---

## 完了条件

- [ ] UIコンポーネント（ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel）の要件が定義されている
- [ ] IPCハンドラー（llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat）の要件が定義されている
- [ ] LLMアダプター（OpenAI, Anthropic, Google, xAI）の要件が定義されている
- [ ] 各要件に受け入れ基準がある
- [ ] FR/NFRが分類されている
- [ ] 接続要件（API/認証/データフロー）が明記されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（既存実装ガイド、スキーマ設計、未タスク指示書）
2. requirements-engineeringスキルの実行
3. acceptance-criteria-writingスキルの実行
4. functional-non-functional-requirementsスキルの実行
5. 統合テスト連携の接続要件記載
6. 成果物の作成・配置
7. 完了条件の検証

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 使用スキル

- requirements-engineering: {{result}}
- acceptance-criteria-writing: {{result}}
- functional-non-functional-requirements: {{result}}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/llm-ui-ipc-adapter-implementation/phase-2-design.md`

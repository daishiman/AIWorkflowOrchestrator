# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| Phase名    | 設計                              |
| 前提Phase  | Phase 1                           |
| 後続Phase  | Phase 3                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-08                        |
| 機能名     | llm-ui-ipc-adapter-implementation |

---

## 目的

要件を実現可能な構造に落とし込む。UIコンポーネント、IPCハンドラー、LLMアダプターの詳細設計を行う。

## 背景

Phase 1で定義された要件に基づき、既存の基盤（Zodスキーマ、llmSlice、IPCチャンネル定義）との整合性を保ちながら設計を行う。

---

## 使用スキル

### スキル1: clean-architecture-principles

**パス**: `.claude/skills/clean-architecture-principles/SKILL.md`

**選定理由**: レイヤー分離とDI原則に従った設計を行うため

**Trigger条件**:

- アーキテクチャ設計が必要な場合
- クリーンアーキテクチャの原則適用

**期待される成果物**:

- アーキテクチャ設計書

---

### スキル2: electron-ipc-patterns

**パス**: `.claude/skills/electron-ipc-patterns/SKILL.md`

**選定理由**: Main/Renderer間の安全なIPC通信パターンを設計するため

**Trigger条件**:

- Electron IPC設計が必要な場合
- Main/Renderer間通信の設計

**期待される成果物**:

- IPCハンドラー設計書

---

### スキル3: api-client-patterns

**パス**: `.claude/skills/api-client-patterns/SKILL.md`

**選定理由**: 外部LLM APIとの統合パターン（ACL、リトライ、エラーハンドリング）を設計するため

**Trigger条件**:

- 外部API統合設計が必要な場合
- Anti-Corruption Layerの設計

**期待される成果物**:

- LLMアダプター設計書

---

### スキル4: factory-patterns

**パス**: `.claude/skills/factory-patterns/SKILL.md`

**選定理由**: LLMAdapterFactoryの設計パターンを適用するため

**Trigger条件**:

- ファクトリーパターンの適用が必要な場合
- インスタンス生成ロジックの設計

**期待される成果物**:

- ファクトリー設計書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                  | 内容                    |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLM型定義・スキーマ仕様 |

### Phase 1成果物

| 参照資料     | パス                                         | 内容             |
| ------------ | -------------------------------------------- | ---------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲         |

---

## 成果物

| 成果物               | パス                                     | 内容                       |
| -------------------- | ---------------------------------------- | -------------------------- |
| UIコンポーネント設計 | `outputs/phase-2/ui-component-design.md` | Props/State/イベント設計   |
| IPCハンドラー設計    | `outputs/phase-2/ipc-handler-design.md`  | チャンネル・シグネチャ設計 |
| LLMアダプター設計    | `outputs/phase-2/llm-adapter-design.md`  | インターフェース・実装設計 |
| アーキテクチャ設計   | `outputs/phase-2/architecture-design.md` | 全体構造・レイヤー設計     |

---

## 統合テスト連携【必須】

統合ポイント/契約（API・スキーマ）を設計に反映する:

| 統合ポイント    | 契約定義                                             |
| --------------- | ---------------------------------------------------- |
| UI→llmSlice     | Redux Action/Selector契約                            |
| llmSlice→IPC    | Preload API型定義（window.electronAPI.llm.\*）       |
| IPC→Handler     | IPCチャンネル名・ペイロード型                        |
| Handler→Adapter | ILLMAdapterインターフェース                          |
| Adapter→外部API | 各プロバイダーAPI仕様（OpenAI/Anthropic/Google/xAI） |

---

## 設計内容

### UIコンポーネント設計

```
┌─────────────────────────────────────────────────┐
│ LLMSelectorPanel                                │
│ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │ProviderSelector │ │ ModelSelector           │ │
│ │ - providers[]   │ │ - models[]              │ │
│ │ - selected      │ │ - selected              │ │
│ │ - onSelect()    │ │ - onSelect()            │ │
│ └─────────────────┘ └─────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ HealthIndicator                             │ │
│ │ - status: healthy | degraded | unhealthy    │ │
│ │ - latencyMs                                 │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### IPCハンドラー設計

```
Renderer Process          Preload              Main Process
┌───────────────┐         ┌────────┐          ┌─────────────────┐
│ llmSlice      │──invoke─▶│ IPC    │──handle─▶│ llmHandlers.ts  │
│ (Redux)       │◀─result──│ Bridge │◀─result──│ - getProviders  │
└───────────────┘         └────────┘          │ - checkHealth   │
                                              │ - sendChat      │
                                              │ - streamChat    │
                                              └─────────────────┘
```

### LLMアダプター設計

```
                    ┌─────────────────────┐
                    │ ILLMAdapter         │
                    │ - sendMessage()     │
                    │ - streamMessage()   │
                    │ - checkHealth()     │
                    └─────────┬───────────┘
                              │ implements
    ┌──────────────┬──────────┼──────────┬──────────────┐
    │              │          │          │              │
┌───▼────┐  ┌──────▼────┐ ┌───▼────┐ ┌───▼────┐        │
│OpenAI  │  │Anthropic  │ │Google  │ │xAI     │        │
│Adapter │  │Adapter    │ │Adapter │ │Adapter │        │
└────────┘  └───────────┘ └────────┘ └────────┘        │
                                                        │
                              ┌──────────────────────────▼──┐
                              │ LLMAdapterFactory           │
                              │ - create(providerId): ILLMAdapter │
                              └─────────────────────────────┘
```

---

## 完了条件

- [ ] UIコンポーネント（ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel）のProps/State設計がある
- [ ] IPCハンドラー（llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat）のシグネチャ設計がある
- [ ] LLMアダプター（ILLMAdapter）のインターフェース設計がある
- [ ] LLMAdapterFactoryの設計がある
- [ ] 既存スキーマ/llmSliceとの整合性が確認されている
- [ ] 統合ポイント/契約が設計に反映されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

```markdown
## Phase 2 実行記録

### 使用スキル

- clean-architecture-principles: {{result}}
- electron-ipc-patterns: {{result}}
- api-client-patterns: {{result}}
- factory-patterns: {{result}}

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

`docs/30-workflows/llm-ui-ipc-adapter-implementation/phase-3-design-review.md`

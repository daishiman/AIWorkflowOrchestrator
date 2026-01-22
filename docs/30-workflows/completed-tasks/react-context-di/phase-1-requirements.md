# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                 |
| ---------- | -------------------- |
| Phase      | 1                    |
| Phase名    | 要件定義             |
| 前提Phase  | -                    |
| 後続Phase  | Phase 2（設計）      |
| ステータス | 未実施               |
| 作成日     | 2026-01-22           |
| 機能名     | React Context DI実装 |

---

## 目的

React Context DIの要件を明確化し、スコープ・受け入れ基準・前提条件を定義する。

## 背景

ARCH-001 Clean Architectureリファクタリングで`packages/shared`に実装されたUse Casesを、`apps/desktop`のReactコンポーネントから利用可能にするため、依存性注入（DI）基盤が必要である。本Phaseでは、その要件を明確化する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 依存タスク・前提条件の確認

**目的**: UT-005（Drizzle Repository実装）の状況と、packages/sharedのUse Cases exportを確認する。

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-drizzle-repository-implementation.md` の存在を確認
2. `packages/shared/src/index.ts` で以下のUse Casesがexportされているか確認:
   - `CreateChatSessionUseCase`
   - `AddUserMessageUseCase`
   - `AddAssistantMessageUseCase`
   - `TogglePinnedUseCase`
   - `SearchSessionsUseCase`
3. `packages/shared/src/features/chat-history/` の構造を確認
4. 依存関係の状況を `outputs/phase-1/prerequisites-check.md` に記録

**期待される成果物**:

- `outputs/phase-1/prerequisites-check.md`

---

### タスク2: スコープ定義

**目的**: 本タスクのスコープ（含むもの/含まないもの）を明確化する。

**実行手順**:

1. 以下のスコープ「含むもの」を確認:
   - `ChatHistoryContext`の定義
   - `ChatHistoryProvider`コンポーネントの実装
   - `useChatHistory` Custom Hookの実装
   - Use Cases Factory関数の実装
   - テスト用`MockChatHistoryProvider`の実装
   - 基本的なユニットテスト

2. 以下のスコープ「含まないもの」を確認:
   - 実際のUI統合（別タスク）
   - フィーチャーフラグ実装
   - 既存レガシーコードのマイグレーション
   - パフォーマンス最適化（useMemo/useCallback の過度な適用）

3. スコープ定義を `outputs/phase-1/scope-definition.md` に記録

**期待される成果物**:

- `outputs/phase-1/scope-definition.md`

---

### タスク3: 機能要件定義

**目的**: 機能要件を明確化し、受け入れ基準を定義する。

**実行手順**:

1. 機能要件を定義:

   | 要件ID | 要件                                    | 優先度 |
   | ------ | --------------------------------------- | ------ |
   | FR-001 | ChatHistoryContextが型安全に定義される  | 必須   |
   | FR-002 | ChatHistoryProviderが5種Use Casesを提供 | 必須   |
   | FR-003 | useChatHistoryが型安全にContextを取得   | 必須   |
   | FR-004 | Provider外使用時にエラーをスロー        | 必須   |
   | FR-005 | MockChatHistoryProviderでテスト可能     | 必須   |
   | FR-006 | カスタムRepository注入が可能            | 任意   |

2. 受け入れ基準を定義:

   | 基準ID | 基準                                    |
   | ------ | --------------------------------------- |
   | AC-001 | 全Use CasesにProvider経由でアクセス可能 |
   | AC-002 | TypeScript型エラーなし                  |
   | AC-003 | Provider外使用時にエラーメッセージ表示  |
   | AC-004 | Line Coverage 80%以上                   |

3. `outputs/phase-1/functional-requirements.md` に記録

**期待される成果物**:

- `outputs/phase-1/functional-requirements.md`

---

### タスク4: 成果物・ディレクトリ構成定義

**目的**: 本タスクで作成する成果物とディレクトリ構成を定義する。

**実行手順**:

1. 成果物一覧を定義:

   | 成果物                      | 配置先                                                      |
   | --------------------------- | ----------------------------------------------------------- |
   | ChatHistoryContext.tsx      | `apps/desktop/src/features/chat-history/context/`           |
   | ChatHistoryProvider.tsx     | `apps/desktop/src/features/chat-history/context/`           |
   | useChatHistory.ts           | `apps/desktop/src/features/chat-history/hooks/`             |
   | useChatHistoryFactory.ts    | `apps/desktop/src/features/chat-history/hooks/`             |
   | MockChatHistoryProvider.tsx | `apps/desktop/src/features/chat-history/context/__mocks__/` |
   | ChatHistoryContext.test.tsx | `apps/desktop/src/features/chat-history/context/__tests__/` |
   | useChatHistory.test.ts      | `apps/desktop/src/features/chat-history/hooks/__tests__/`   |
   | index.ts                    | `apps/desktop/src/features/chat-history/context/`           |
   | index.ts                    | `apps/desktop/src/features/chat-history/hooks/`             |

2. ディレクトリ構成を定義:

   ```
   apps/desktop/src/features/chat-history/
   ├── context/
   │   ├── __mocks__/
   │   │   └── MockChatHistoryProvider.tsx
   │   ├── __tests__/
   │   │   └── ChatHistoryContext.test.tsx
   │   ├── ChatHistoryContext.tsx
   │   ├── ChatHistoryProvider.tsx
   │   └── index.ts
   └── hooks/
       ├── __tests__/
       │   └── useChatHistory.test.ts
       ├── useChatHistory.ts
       ├── useChatHistoryFactory.ts
       └── index.ts
   ```

3. `outputs/phase-1/artifacts-definition.md` に記録

**期待される成果物**:

- `outputs/phase-1/artifacts-definition.md`

---

### タスク5: 要件定義レポート作成

**目的**: Phase 1の要件定義を集約し、レポートを作成する。

**実行手順**:

1. タスク1〜4の成果物を集約
2. 要件定義レポートを `outputs/phase-1/requirements-report.md` に作成
3. 以下のセクションを含める:
   - 前提条件チェック結果
   - スコープ定義
   - 機能要件・受け入れ基準
   - 成果物・ディレクトリ構成
   - リスク評価

**期待される成果物**:

- `outputs/phase-1/requirements-report.md`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料             | パス                                                                             | 内容                   |
| -------------------- | -------------------------------------------------------------------------------- | ---------------------- |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architecture構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | 型定義・Repository IF  |
| API仕様              | `.claude/skills/aiworkflow-requirements/references/api-chat-history.md`          | Use Case API詳細       |

### 関連タスク

| 参照資料           | パス                                                                          | 内容                 |
| ------------------ | ----------------------------------------------------------------------------- | -------------------- |
| Drizzle Repository | `docs/30-workflows/unassigned-task/task-drizzle-repository-implementation.md` | Repository実装タスク |

---

## 成果物

| 成果物           | パス                                         | 内容               |
| ---------------- | -------------------------------------------- | ------------------ |
| 前提条件チェック | `outputs/phase-1/prerequisites-check.md`     | 依存関係確認結果   |
| スコープ定義     | `outputs/phase-1/scope-definition.md`        | スコープ境界明確化 |
| 機能要件定義     | `outputs/phase-1/functional-requirements.md` | 要件・受け入れ基準 |
| 成果物定義       | `outputs/phase-1/artifacts-definition.md`    | 成果物・構成定義   |
| 要件定義レポート | `outputs/phase-1/requirements-report.md`     | 集約レポート       |

---

## 統合テスト連携（Phase 1は必須）

packages/shared Use Casesとの連携要件を明記する:

- `CreateChatSessionUseCase` の入出力型を確認
- `AddUserMessageUseCase` の入出力型を確認
- `AddAssistantMessageUseCase` の入出力型を確認
- `TogglePinnedUseCase` の入出力型を確認
- `SearchSessionsUseCase` の入出力型を確認
- Repository Interface（`IChatSessionRepository`, `IChatMessageRepository`）を確認

---

## 完了条件

- [ ] タスク1: 依存タスク・前提条件の確認完了
- [ ] タスク2: スコープ定義完了
- [ ] タスク3: 機能要件・受け入れ基準定義完了
- [ ] タスク4: 成果物・ディレクトリ構成定義完了
- [ ] タスク5: 要件定義レポート作成完了
- [ ] 全成果物が `outputs/phase-1/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/react-context-di/phase-2-design.md`

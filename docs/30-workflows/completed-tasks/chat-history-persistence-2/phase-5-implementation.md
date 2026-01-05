# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                   |
| ---------- | ---------------------- |
| Phase      | 5                      |
| Phase名    | 実装                   |
| 前提Phase  | Phase 4                |
| 後続Phase  | Phase 6                |
| ステータス | 未実施                 |
| 作成日     | 2026-01-04             |
| 機能名     | チャット履歴永続化機能 |

---

## 目的

TDDのGreen状態を達成する。Phase 4で作成した失敗するテストを通すための最小限の実装を行う。

## 背景

テスト駆動開発（TDD）のRed-Green-Refactorサイクルの2番目のステップ。テストを通すことに集中し、完璧なコードを目指さない。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。
> 各スキルは `.claude/skills/{{スキル名}}/SKILL.md` を参照してください。

### スキル1: drizzle-orm

**パス**: `.claude/skills/drizzle-orm/SKILL.md`

**Trigger条件**:
Drizzle ORMスキーマ実装、マイグレーション実行が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- chatSessions.ts（スキーマ定義）
- messages.ts（スキーマ定義）
- attachments.ts（スキーマ定義）
- マイグレーションファイル

---

### スキル2: repository-pattern

**パス**: `.claude/skills/repository-pattern/SKILL.md`

**Trigger条件**:
Repositoryパターン実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- ChatSessionRepository.ts
- MessageRepository.ts

---

### スキル3: transaction-script

**パス**: `.claude/skills/transaction-script/SKILL.md`

**Trigger条件**:
ビジネスロジック（保存・検索・エクスポート）実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- ChatHistoryService.ts
- ExportService.ts

---

### スキル4: custom-hooks-patterns

**パス**: `.claude/skills/custom-hooks-patterns/SKILL.md`

**Trigger条件**:
React Custom Hooks実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物を下記のパスに出力

**期待される成果物**:

- useChatHistory.ts
- useChatSearch.ts

---

## 参照資料

| 参照資料      | パス                                                          | 内容       |
| ------------- | ------------------------------------------------------------- | ---------- |
| Phase 2成果物 | `docs/30-workflows/chat-history-persistence/outputs/phase-2/` | 設計成果物 |
| Phase 4成果物 | `packages/shared/src/__tests__/`                              | テスト     |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料         | パス                                                                  | 内容     |
| ---------------- | --------------------------------------------------------------------- | -------- |
| 実装ガイドライン | `.claude/skills/aiworkflow-requirements/references/implementation.md` | 実装方針 |

---

## 成果物

| 成果物       | パス                                                        | 内容               |
| ------------ | ----------------------------------------------------------- | ------------------ |
| DBスキーマ   | `packages/shared/src/db/schema/chatSessions.ts`             | セッションスキーマ |
| DBスキーマ   | `packages/shared/src/db/schema/messages.ts`                 | メッセージスキーマ |
| Repository   | `packages/shared/src/repositories/ChatSessionRepository.ts` | データアクセス層   |
| Service      | `packages/shared/src/services/ChatHistoryService.ts`        | ビジネスロジック   |
| Service      | `packages/shared/src/services/ExportService.ts`             | エクスポート機能   |
| UI Component | `apps/desktop/src/components/ChatHistoryList.tsx`           | 履歴一覧UI         |
| UI Component | `apps/desktop/src/components/ChatHistorySearch.tsx`         | 検索UI             |
| Hooks        | `apps/desktop/src/hooks/useChatHistory.ts`                  | 状態管理フック     |

---

## 完了条件

- [ ] 全てのDBスキーマが実装されている
- [ ] 全てのRepositoryが実装されている
- [ ] 全てのServiceが実装されている
- [ ] 全てのUIコンポーネントが実装されている
- [ ] Phase 4で作成した全テストが成功する（Green状態）

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## スキルフィードバック記録

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- drizzle-orm: {{result}}
- repository-pattern: {{result}}
- transaction-script: {{result}}
- custom-hooks-patterns: {{result}}

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

`docs/30-workflows/chat-history-persistence/phase-6-refactoring.md`

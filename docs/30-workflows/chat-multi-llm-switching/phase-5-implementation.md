# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 5                        |
| Phase名    | 実装                     |
| 前提Phase  | Phase 4                  |
| 後続Phase  | Phase 6                  |
| ステータス | 未実施                   |
| 作成日     | 2026-01-07               |
| 機能名     | chat-multi-llm-switching |

---

## 目的

TDDのGreen状態を達成する。Phase 4で作成したテストを通す最小限の実装を行う。

## 背景

テストを通すことを目的とした実装により、要件を満たすコードを確実に作成する。

---

## 使用スキル

> 以下のスキルを順番に呼び出して実行してください。

### スキル1: api-client-patterns

**パス**: `.claude/skills/api-client-patterns/SKILL.md`

**Trigger条件**:
LLMアダプターの実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物をプロジェクトディレクトリに配置

**期待される成果物**:

- `packages/shared/src/llm/adapters/`（LLMアダプター実装）

---

### スキル2: component-composition-patterns

**パス**: `.claude/skills/component-composition-patterns/SKILL.md`

**Trigger条件**:
LLM選択UIコンポーネントの実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物をプロジェクトディレクトリに配置

**期待される成果物**:

- `packages/ui/src/components/llm-selector/`（UI実装）

---

### スキル3: state-lifting

**パス**: `.claude/skills/state-lifting/SKILL.md`

**Trigger条件**:
会話状態管理の実装が必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物をプロジェクトディレクトリに配置

**期待される成果物**:

- `packages/shared/src/store/chat/`（状態管理実装）

---

### スキル4: error-handling-patterns

**パス**: `.claude/skills/error-handling-patterns/SKILL.md`

**Trigger条件**:
LLM API呼び出しのエラーハンドリングが必要

**実行方法**:

1. 上記パスのSKILL.mdを開く
2. 「ワークフロー」セクションに従って実行
3. 成果物をプロジェクトディレクトリに配置

**期待される成果物**:

- `packages/shared/src/llm/errors/`（エラー処理実装）

---

## 参照資料

| 参照資料      | パス                                     | 内容               |
| ------------- | ---------------------------------------- | ------------------ |
| Phase 2成果物 | `outputs/phase-2/architecture-design.md` | アーキテクチャ設計 |
| Phase 2成果物 | `outputs/phase-2/api-specification.md`   | API仕様            |
| Phase 4成果物 | `outputs/phase-4/test-specification.md`  | テスト仕様         |

---

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                    | 内容         |
| -------------- | ----------------------------------------------------------------------- | ------------ |
| API設計        | `.claude/skills/aiworkflow-requirements/references/api-design.md`       | API設計      |
| コンポーネント | `.claude/skills/aiworkflow-requirements/references/component-design.md` | UI設計       |
| 状態管理       | `.claude/skills/aiworkflow-requirements/references/state-management.md` | 状態管理仕様 |

**仕様検索**: `node .claude/skills/aiworkflow-requirements/scripts/search-spec.mjs "implementation"`

---

## 成果物

| 成果物        | パス                                        | 内容                    |
| ------------- | ------------------------------------------- | ----------------------- |
| 実装サマリー  | `outputs/phase-5/implementation-summary.md` | 実装内容のサマリー      |
| LLMアダプター | `packages/shared/src/llm/adapters/`         | LLMアダプター実装       |
| UI実装        | `packages/ui/src/components/llm-selector/`  | LLM選択UIコンポーネント |
| 状態管理      | `packages/shared/src/store/chat/`           | 会話状態管理            |
| エラー処理    | `packages/shared/src/llm/errors/`           | エラーハンドリング      |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5の統合テスト連携アクション**: フロント/バック接続の実装とテスト支援コード整備

具体的な確認項目:

- [ ] LLMアダプターがAPI契約に準拠している
- [ ] フロントエンド⇔バックエンドの接続が動作する
- [ ] テスト支援用のモック・スタブが整備されている

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/ui test:run
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 完了条件

- [ ] Phase 4で作成したテストがすべて成功している
- [ ] LLMアダプターが実装されている
- [ ] LLM選択UIが実装されている
- [ ] 会話状態管理が実装されている
- [ ] エラーハンドリングが実装されている
- [ ] フロント/バック接続が動作している
- [ ] **本Phase内の全スキルを100%実行完了**

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. api-client-patternsスキルの実行
3. component-composition-patternsスキルの実行
4. state-liftingスキルの実行
5. error-handling-patternsスキルの実行
6. 統合テスト連携の実施（フロント/バック接続実装）
7. 成果物の作成・配置
8. TDD検証（Green状態確認）
9. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/chat-multi-llm-switching --phase 5
```

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## スキルフィードバック記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 使用スキル

- api-client-patterns: {{result}}
- component-composition-patterns: {{result}}
- state-lifting: {{result}}
- error-handling-patterns: {{result}}

### TDD状態

- テスト成功数: {{number}}（Green状態確認）

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

`docs/30-workflows/chat-multi-llm-switching/phase-6-test-expansion.md`

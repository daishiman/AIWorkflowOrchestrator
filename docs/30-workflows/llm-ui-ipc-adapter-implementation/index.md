# LLM UI/IPC/Adapter 実装 - タスク仕様書

## タスク概要

| 項目       | 内容                        |
| ---------- | --------------------------- |
| タスクID   | TASK-LLM-UI-IPC-ADAPTER-001 |
| タスク名   | LLM UI/IPC/Adapter 実装     |
| 分類       | 改善（既存設計の実装完了）  |
| 優先度     | 高                          |
| ステータス | 未実施                      |
| 作成日     | 2026-01-08                  |
| 親タスク   | TASK-CHAT-LLM-SWITCH-001    |

---

## 目的

`chat-multi-llm-switching` タスクで整備された基盤（Zodスキーマ、llmSlice、IPCチャンネル定義、テストスイート）を活用し、実際に動作するUI/IPC/Adapterを実装する。

---

## スコープ

### 含むもの

| カテゴリ         | 成果物                                                              |
| ---------------- | ------------------------------------------------------------------- |
| UIコンポーネント | ProviderSelector, ModelSelector, HealthIndicator, LLMSelectorPanel  |
| IPCハンドラー    | llm:get-providers, llm:check-health, llm:send-chat, llm:stream-chat |
| LLMアダプター    | OpenAIAdapter, AnthropicAdapter, GoogleAdapter, xAIAdapter          |
| ファクトリー     | LLMAdapterFactory                                                   |

### 含まないもの

- ローカルLLM（Ollama等）対応
- 同時に複数LLMへの送信
- LLMの自動選択/コスト最適化

---

## Phase一覧

| Phase | 名称                 | ステータス | 仕様書                                                                 |
| ----- | -------------------- | ---------- | ---------------------------------------------------------------------- |
| 1     | 要件定義             | 未実施     | [phase-1-requirements.md](./phase-1-requirements.md)                   |
| 2     | 設計                 | 未実施     | [phase-2-design.md](./phase-2-design.md)                               |
| 3     | 設計レビューゲート   | 未実施     | [phase-3-design-review.md](./phase-3-design-review.md)                 |
| 4     | テスト作成           | 未実施     | [phase-4-test-creation.md](./phase-4-test-creation.md)                 |
| 5     | 実装                 | 未実施     | [phase-5-implementation.md](./phase-5-implementation.md)               |
| 6     | テスト拡充           | 未実施     | [phase-6-test-expansion.md](./phase-6-test-expansion.md)               |
| 7     | テストカバレッジ確認 | 未実施     | [phase-7-coverage-verification.md](./phase-7-coverage-verification.md) |
| 8     | リファクタリング     | 未実施     | [phase-8-refactoring.md](./phase-8-refactoring.md)                     |
| 9     | 品質保証             | 未実施     | [phase-9-quality-assurance.md](./phase-9-quality-assurance.md)         |
| 10    | 最終レビューゲート   | 未実施     | [phase-10-final-review.md](./phase-10-final-review.md)                 |
| 11    | 手動テスト検証       | 未実施     | [phase-11-manual-testing.md](./phase-11-manual-testing.md)             |
| 12    | ドキュメント更新     | 未実施     | [phase-12-documentation.md](./phase-12-documentation.md)               |
| 13    | PR作成               | 未実施     | [phase-13-pr-creation.md](./phase-13-pr-creation.md)                   |

---

## 使用スキル一覧

| Phase | 使用スキル                                                                                    |
| ----- | --------------------------------------------------------------------------------------------- |
| 1     | requirements-engineering, acceptance-criteria-writing, functional-non-functional-requirements |
| 2     | clean-architecture-principles, electron-ipc-patterns, api-client-patterns, factory-patterns   |
| 3     | approval-gates, code-smell-detection                                                          |
| 4     | tdd-principles, frontend-testing, integration-testing, test-doubles, boundary-value-analysis  |
| 5     | clean-code-practices, error-handling-patterns, type-safety-patterns, electron-ipc-patterns    |
| 6     | test-coverage, integration-testing, frontend-testing                                          |
| 7     | test-coverage, integration-testing                                                            |
| 8     | refactoring-patterns, code-smell-detection, solid-principles                                  |
| 9     | code-static-analysis-security, performance-testing                                            |
| 10    | approval-gates                                                                                |
| 11    | accessibility-wcag, responsive-design, playwright-testing                                     |
| 12    | documentation-architecture, knowledge-management, skill-creator                               |
| 13    | /ai:diff-to-pr                                                                                |

---

## 品質目標

### ユニットテストカバレッジ

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 結合テストカバレッジ

| 指標                     | 目標 |
| ------------------------ | ---- |
| APIエンドポイント（IPC） | 100% |
| 正常系シナリオ           | 100% |
| 異常系シナリオ           | 80%+ |

---

## 依存関係

### 既存基盤

| 資産              | パス                                                 |
| ----------------- | ---------------------------------------------------- |
| Zodスキーマ       | `packages/shared/src/types/llm/schemas/`             |
| llmSlice          | `apps/desktop/src/renderer/store/slices/llmSlice.ts` |
| IPCチャンネル定義 | `apps/desktop/src/preload/channels.ts`               |
| Preload API       | `apps/desktop/src/preload/index.ts`                  |

### 参照ドキュメント

| ドキュメント | パス                                                                                  |
| ------------ | ------------------------------------------------------------------------------------- |
| 実装ガイド   | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-12/implementation-guide.md` |
| スキーマ設計 | `docs/30-workflows/chat-multi-llm-switching/outputs/phase-2/schema-design.md`         |
| システム仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                 |

---

## 実行方法

1. **Phase 1から順番に実行**: 各Phaseの仕様書に従ってタスクを実行
2. **各Phase完了時**: artifacts.jsonを更新し、スキルフィードバックを記録
3. **Phase 13完了後**: タスクディレクトリを `completed-tasks/` に移動

---

## 成果物ディレクトリ構成

```
docs/30-workflows/llm-ui-ipc-adapter-implementation/
├── index.md                     # このファイル
├── artifacts.json               # Phase管理・成果物追跡
├── phase-1-requirements.md      # Phase 1 仕様書
├── phase-2-design.md            # Phase 2 仕様書
├── phase-3-design-review.md     # Phase 3 仕様書
├── phase-4-test-creation.md     # Phase 4 仕様書
├── phase-5-implementation.md    # Phase 5 仕様書
├── phase-6-test-expansion.md    # Phase 6 仕様書
├── phase-7-coverage-verification.md # Phase 7 仕様書
├── phase-8-refactoring.md       # Phase 8 仕様書
├── phase-9-quality-assurance.md # Phase 9 仕様書
├── phase-10-final-review.md     # Phase 10 仕様書
├── phase-11-manual-testing.md   # Phase 11 仕様書
├── phase-12-documentation.md    # Phase 12 仕様書
├── phase-13-pr-creation.md      # Phase 13 仕様書
└── outputs/                     # 各Phaseの成果物
    ├── phase-1/
    ├── phase-2/
    ├── ...
    └── phase-13/
```

---

## 関連情報

- **元の未タスク指示書**: `docs/30-workflows/unassigned-task/task-llm-ui-ipc-adapter-implementation.md`
- **親タスク**: `docs/30-workflows/chat-multi-llm-switching/`

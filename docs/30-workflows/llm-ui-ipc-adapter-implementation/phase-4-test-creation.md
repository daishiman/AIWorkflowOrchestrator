# Phase 4: テスト作成（TDD: Red） - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 4                                 |
| Phase名    | テスト作成（TDD: Red）            |
| 前提Phase  | Phase 3                           |
| 後続Phase  | Phase 5                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-08                        |
| 機能名     | llm-ui-ipc-adapter-implementation |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 背景

TDDのRedフェーズとして、Phase 2で設計されたコンポーネント/ハンドラー/アダプターに対するテストを先に作成する。

---

## 使用スキル

### スキル1: tdd-principles

**パス**: `.claude/skills/tdd-principles/SKILL.md`

**選定理由**: TDD原則に従ったテスト先行開発を行うため

**Trigger条件**:

- TDDでの開発を行う場合
- テスト先行で実装を進める場合

**期待される成果物**:

- テスト仕様書

---

### スキル2: frontend-testing

**パス**: `.claude/skills/frontend-testing/SKILL.md`

**選定理由**: Reactコンポーネントのテスト手法を適用するため

**Trigger条件**:

- Reactコンポーネントのテスト作成
- フロントエンドテスト設計

**期待される成果物**:

- UIコンポーネントテストファイル

---

### スキル3: integration-testing

**パス**: `.claude/skills/integration-testing/SKILL.md`

**選定理由**: IPC/アダプター間の統合テストを設計するため

**Trigger条件**:

- モジュール間の統合テスト作成
- API統合テスト設計

**期待される成果物**:

- 統合テストファイル

---

### スキル4: test-doubles

**パス**: `.claude/skills/test-doubles/SKILL.md`

**選定理由**: 外部APIのモック/スタブを設計するため

**Trigger条件**:

- テストダブル（モック、スタブ）の設計
- 外部依存のモック化

**期待される成果物**:

- モック/スタブ実装

---

### スキル5: boundary-value-analysis

**パス**: `.claude/skills/boundary-value-analysis/SKILL.md`

**選定理由**: エッジケースのテストケースを導出するため

**Trigger条件**:

- 境界値テストの設計
- エッジケース分析

**期待される成果物**:

- 境界値テストケース

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> テスト設計時に必ず以下のシステム仕様を確認し、テストケースが仕様を網羅していることを確認してください。

| 参照資料            | パス                                                                  | 内容                    |
| ------------------- | --------------------------------------------------------------------- | ----------------------- |
| LLMインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLM型定義・スキーマ仕様 |

### Phase 1-3成果物

| 参照資料             | パス                                         | 内容             |
| -------------------- | -------------------------------------------- | ---------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`     | AC定義           |
| UIコンポーネント設計 | `outputs/phase-2/ui-component-design.md`     | Props/State設計  |
| IPCハンドラー設計    | `outputs/phase-2/ipc-handler-design.md`      | チャンネル設計   |
| LLMアダプター設計    | `outputs/phase-2/llm-adapter-design.md`      | インターフェース |
| 設計レビュー結果     | `outputs/phase-3/design-review-result.md`    | レビュー判定     |

---

## 成果物

| 成果物              | パス                                                            | 内容                 |
| ------------------- | --------------------------------------------------------------- | -------------------- |
| テスト仕様書        | `outputs/phase-4/test-specification.md`                         | テスト設計           |
| テストケース        | `outputs/phase-4/test-cases.md`                                 | ケース一覧           |
| 統合テストシナリオ  | `outputs/phase-4/integration-test-design.md`                    | 統合テスト設計       |
| UIテストファイル    | `apps/desktop/src/renderer/components/llm/__tests__/*.test.tsx` | コンポーネントテスト |
| IPCハンドラーテスト | `apps/desktop/src/main/handlers/__tests__/llm.test.ts`          | IPCテスト            |
| アダプターテスト    | `apps/desktop/src/main/adapters/llm/__tests__/*.test.ts`        | アダプターテスト     |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ   | 検証内容                                 | テストファイル          |
| ------------------ | ---------------------------------------- | ----------------------- |
| API接続テスト      | IPCエンドポイント疎通・レスポンス形式    | `*.integration.test.ts` |
| データフローテスト | UI→IPC→Handler→Adapter→外部APIの往復     | `*.flow.test.ts`        |
| エラーハンドリング | LLMError発生時のUI表示・リトライ         | `*.error.test.ts`       |
| 認証連携テスト     | APIキー設定・検証・エラー処理            | `*.auth.test.ts`        |
| 状態同期テスト     | llmSlice更新・楽観的UI更新・ロールバック | `*.sync.test.ts`        |

---

## テストケース概要

### UIコンポーネントテスト

| テストID | コンポーネント   | テスト内容                       |
| -------- | ---------------- | -------------------------------- |
| UI-001   | ProviderSelector | プロバイダー一覧表示             |
| UI-002   | ProviderSelector | プロバイダー選択時のonSelect発火 |
| UI-003   | ModelSelector    | 選択プロバイダーのモデル一覧表示 |
| UI-004   | ModelSelector    | モデル選択時のonSelect発火       |
| UI-005   | HealthIndicator  | healthy状態の表示                |
| UI-006   | HealthIndicator  | degraded状態の表示               |
| UI-007   | HealthIndicator  | unhealthy状態の表示              |
| UI-008   | LLMSelectorPanel | 統合パネルのレンダリング         |

### IPCハンドラーテスト

| テストID | チャンネル        | テスト内容                       |
| -------- | ----------------- | -------------------------------- |
| IPC-001  | llm:get-providers | プロバイダー一覧取得             |
| IPC-002  | llm:check-health  | ヘルスチェック実行               |
| IPC-003  | llm:send-chat     | チャットリクエスト送信           |
| IPC-004  | llm:stream-chat   | ストリーミングチャット           |
| IPC-005  | 全チャンネル      | 無効なペイロードのバリデーション |

### LLMアダプターテスト

| テストID | アダプター        | テスト内容                |
| -------- | ----------------- | ------------------------- |
| ADP-001  | OpenAIAdapter     | 正常リクエスト/レスポンス |
| ADP-002  | OpenAIAdapter     | エラー時のLLMError返却    |
| ADP-003  | AnthropicAdapter  | 正常リクエスト/レスポンス |
| ADP-004  | AnthropicAdapter  | エラー時のLLMError返却    |
| ADP-005  | GoogleAdapter     | 正常リクエスト/レスポンス |
| ADP-006  | xAIAdapter        | 正常リクエスト/レスポンス |
| ADP-007  | LLMAdapterFactory | 正しいアダプター生成      |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] UIコンポーネントテストが作成されている（失敗状態）
- [ ] IPCハンドラーテストが作成されている（失敗状態）
- [ ] LLMアダプターテストが作成されている（失敗状態）
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] 境界値テストが含まれている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全スキルを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] スキルフィードバックが記録されている

---

## スキルフィードバック記録

```markdown
## Phase 4 実行記録

### 使用スキル

- tdd-principles: {{result}}
- frontend-testing: {{result}}
- integration-testing: {{result}}
- test-doubles: {{result}}
- boundary-value-analysis: {{result}}

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

`docs/30-workflows/llm-ui-ipc-adapter-implementation/phase-5-implementation.md`

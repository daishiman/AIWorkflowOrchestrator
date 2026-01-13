# Phase 4: テスト作成（TDD: Red）- Agent SDK 依存関係修正

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 4                        |
| Phase名    | テスト作成（TDD: Red）   |
| 前提Phase  | Phase 3（設計レビュー）  |
| 後続Phase  | Phase 5（実装）          |
| ステータス | 未実施                   |
| 作成日     | 2026-01-13               |
| 機能名     | agent-sdk-dependency-fix |

---

## 目的

期待される動作を検証するテストを実装より先に作成する（Red状態）。

## 背景

TDD原則に従い、SDK パッケージ解決修正のテストを先に書く。

---

## 実行タスク

### タスク1: ユニットテスト設計・作成

**目的**: SDK 初期化・モジュール解決のユニットテストを作成する

**実行手順**:

1. SDK モジュール解決のテストケースを設計
2. electron-vite ビルド設定のテストケースを設計
3. テストファイルを作成（失敗状態で完了）

**テストケース例**:

```typescript
describe("Claude Agent SDK Resolution", () => {
  it("should resolve @anthropic-ai/claude-agent-sdk in main process", () => {
    // SDK が正常に require/import できることを検証
  });

  it("should initialize SDK without errors", () => {
    // SDK 初期化が正常に完了することを検証
  });

  it("should handle SDK initialization failure gracefully", () => {
    // SDK 初期化失敗時のエラーハンドリングを検証
  });
});
```

**期待される成果物**:

- `apps/desktop/src/main/services/agent/__tests__/sdk-resolution.test.ts`

---

### タスク2: 統合テストシナリオ設計・作成

**目的**: SDK → IPC → Renderer の統合テストを作成する

**テストシナリオ**:

| シナリオカテゴリ     | 検証内容                | テストファイル                           |
| -------------------- | ----------------------- | ---------------------------------------- |
| SDK初期化テスト      | SDK ロード成功/失敗     | `sdk-initialization.integration.test.ts` |
| IPC通信テスト        | agent:\* チャンネル疎通 | `agent-ipc.integration.test.ts`          |
| エラーハンドリング   | モジュール解決失敗時    | `sdk-error-handling.test.ts`             |
| フォールバックテスト | SDK 未初期化時の動作    | `sdk-fallback.test.ts`                   |

**期待される成果物**:

- 統合テストファイル群

---

### タスク3: E2Eテスト設計・作成

**目的**: Electron アプリ起動時の SDK 解決を E2E で検証する

**実行手順**:

1. Electron アプリ正常起動のテストを作成
2. SDK 依存機能の E2E テストを作成
3. エラー発生時のユーザー通知テストを作成

**期待される成果物**:

- `apps/desktop/e2e/sdk-resolution.spec.ts`

---

### タスク4: テストカバレッジ目標設定

**目的**: カバレッジ目標を設定する

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

**期待される成果物**:

- カバレッジ目標設定書

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                  | パス                                                                        | 内容            |
| ------------------------- | --------------------------------------------------------------------------- | --------------- |
| 品質要件                  | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略・TDD |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md` | テスト対象仕様  |

### Phase 2-3 成果物

| 参照資料       | パス                                      | 説明          |
| -------------- | ----------------------------------------- | ------------- |
| アーキテクチャ | `outputs/phase-2/architecture-design.md`  | Phase 2成果物 |
| レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3成果物 |

---

## 成果物

| 成果物             | パス                                         | 説明               |
| ------------------ | -------------------------------------------- | ------------------ |
| テスト仕様書       | `outputs/phase-4/test-specification.md`      | テスト設計         |
| テストケース       | `outputs/phase-4/test-cases.md`              | ケース一覧         |
| 統合テストシナリオ | `outputs/phase-4/integration-test-design.md` | 統合テスト設計     |
| テストファイル     | `apps/desktop/src/**/*.test.ts`              | 実際のテストコード |

---

## 統合テスト連携【必須】

統合テストシナリオを全カテゴリで設計する:

| シナリオカテゴリ     | 検証内容                                     | テストファイル       |
| -------------------- | -------------------------------------------- | -------------------- |
| SDK初期化テスト      | モジュール解決・初期化シーケンス             | `*.sdk.test.ts`      |
| IPC通信テスト        | agent:query, agent:message チャンネル        | `*.ipc.test.ts`      |
| エラーハンドリング   | AgentInitializationError 伝播                | `*.error.test.ts`    |
| フォールバックテスト | SDK 未ロード時のグレースフルデグラデーション | `*.fallback.test.ts` |

---

## 完了条件

- [ ] ユニットテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] E2E テストが作成されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Phase 3 成果物の確認
2. ユニットテスト設計・作成
3. 統合テストシナリオ設計・作成
4. E2E テスト設計・作成
5. テストカバレッジ目標設定
6. 成果物の作成・配置
7. TDD Red 状態の検証

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/agent-sdk-dependency-fix/phase-5-implementation.md`

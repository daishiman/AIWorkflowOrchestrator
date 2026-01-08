# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase番号  | 4                              |
| Phase名    | テスト作成                     |
| 目的       | TDD: Red（失敗するテスト作成） |
| 前提Phase  | Phase 3（設計レビューゲート）  |
| 後続Phase  | Phase 5（実装）                |
| ステータス | 未実施                         |

---

## 目的

実装より先にテストを作成し、期待される動作を明確化する（TDD Red状態）。

---

## 使用スキル

| スキル名                | パス                                              | 選定理由                                            |
| ----------------------- | ------------------------------------------------- | --------------------------------------------------- |
| tdd-principles          | `.claude/skills/tdd-principles/SKILL.md`          | TDD原則に基づくテスト設計（Trigger: TDD、テスト）   |
| test-doubles            | `.claude/skills/test-doubles/SKILL.md`            | モック・スタブ設計（Trigger: モック、テストダブル） |
| boundary-value-analysis | `.claude/skills/boundary-value-analysis/SKILL.md` | 境界値テスト設計（Trigger: 境界値）                 |

**実行方法**:

```
各スキルのSKILL.mdを読み込み、スキルを参照して実行
```

---

## 成果物

| 成果物         | 説明                       | 配置先                                   |
| -------------- | -------------------------- | ---------------------------------------- |
| ユニットテスト | 各モジュールのテスト       | `packages/shared/src/agent/**/*.test.ts` |
| 統合テスト     | IPC通信テスト              | `apps/desktop/src/**/*.test.ts`          |
| テスト計画書   | テスト戦略・カバレッジ目標 | `outputs/phase-4/test-plan.md`           |

---

## 実行手順

### Step 1: テスト戦略の策定

tdd-principlesスキルを使用して、テスト戦略を策定する。

**テスト種別**:

| テスト種別     | 責務                     | カバレッジ対象       |
| -------------- | ------------------------ | -------------------- |
| ユニットテスト | コードの「行」をカバー   | Line/Branch/Function |
| 統合テスト     | モジュール間の「接続点」 | API/インターフェース |

### Step 2: ユニットテスト作成

**テスト対象モジュール**:

```typescript
// packages/shared/src/agent/agent-client.test.ts
describe("AgentClient", () => {
  describe("query", () => {
    it("should send query to Claude Agent SDK", async () => {
      // Arrange
      // Act
      // Assert
      expect(true).toBe(false); // Red状態
    });

    it("should handle SDK errors gracefully", async () => {
      expect(true).toBe(false); // Red状態
    });
  });
});

// packages/shared/src/agent/session-manager.test.ts
describe("SessionManager", () => {
  describe("createSession", () => {
    it("should create a new session", async () => {
      expect(true).toBe(false); // Red状態
    });
  });

  describe("resumeSession", () => {
    it("should resume an existing session", async () => {
      expect(true).toBe(false); // Red状態
    });
  });
});
```

### Step 3: 統合テスト作成

test-doublesスキルを使用して、IPC通信のモックを設計する。

**統合テストシナリオ**:

| シナリオカテゴリ    | 検証内容                                |
| ------------------- | --------------------------------------- |
| IPC通信テスト       | Renderer ↔ Main プロセス間通信          |
| Agent SDK接続テスト | SDK初期化・API呼び出し                  |
| エラーハンドリング  | SDK障害時のフロントエンド表示・リトライ |
| セッション管理      | セッション作成・再開・タイムアウト処理  |

```typescript
// apps/desktop/src/main/agent/agent-handler.test.ts
describe("AgentHandler IPC", () => {
  describe("agent:query", () => {
    it("should handle query request from renderer", async () => {
      expect(true).toBe(false); // Red状態
    });
  });
});
```

### Step 4: 境界値テスト作成

boundary-value-analysisスキルを使用して、境界値テストを設計する。

**境界値テスト項目**:

| 項目         | 境界値                     | テストケース                 |
| ------------ | -------------------------- | ---------------------------- |
| プロンプト長 | 空文字、最大長             | 空文字でエラー、最大長で成功 |
| タイムアウト | 0ms、30000ms、30001ms      | タイムアウト発生・正常完了   |
| セッションID | 空、存在しないID、有効なID | エラー・エラー・成功         |

---

## 完了条件

- [ ] 受け入れ基準ごとにユニットテストがある
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）
- [ ] テストカバレッジ目標が設定されている
- [ ] **本Phase内の全スキルを100%実行完了**

---

## 統合テスト連携

統合テストシナリオを作成（API/データフロー/エラー/認証/状態同期）:

- [ ] IPC通信テストシナリオ作成
- [ ] Agent SDK接続テストシナリオ作成
- [ ] エラーハンドリングテストシナリオ作成
- [ ] セッション管理テストシナリオ作成

---

## システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                  | 内容                    |
| -------------- | --------------------------------------------------------------------- | ----------------------- |
| interfaces-llm | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md` | LLMインターフェース仕様 |

---

## スキルフィードバック記録

| スキル                  | 結果    | 備考              |
| ----------------------- | ------- | ----------------- |
| tdd-principles          | pending | Phase完了後に記録 |
| test-doubles            | pending | Phase完了後に記録 |
| boundary-value-analysis | pending | Phase完了後に記録 |

---

## TDD検証

```bash
# テスト実行コマンド
pnpm --filter @repo/shared test:run
pnpm --filter @repo/desktop test:run

# 確認項目
# - [ ] テストが失敗することを確認（Red状態）
# - [ ] すべてのテストケースが実装されている
# - [ ] 境界値テストが含まれている
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認（aiworkflow-requirements）
2. tdd-principlesスキルの実行
3. test-doublesスキルの実行
4. boundary-value-analysisスキルの実行
5. 統合テスト連携の実施
6. 成果物の作成・配置
7. TDD検証の実施（Red状態確認）
8. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.mjs docs/30-workflows/agent-sdk-integration --phase 4
```

---

## 次のPhase

Phase 5: 実装（TDD: Green）

---

## 備考

- テストは実装前に作成し、Red状態であることを確認する
- モックはAgent SDKのAPI仕様に基づいて設計する

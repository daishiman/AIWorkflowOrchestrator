# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 4                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 2の設計に基づき、Store層ガード（AC-01〜AC-03）とUI層disabled制御（AC-04〜AC-05）のテストケースを設計し、テストコードを先行作成する（Red Phase）。

## 実行タスク

- テストケース設計: AC-01〜AC-06に対応するテストケースを設計
- Store層テスト作成: `executeSkill` の並行実行ガードを検証するユニットテストを作成
- UI層テスト作成: ボタンのdisabled制御を検証するコンポーネントテストを作成

## 参照資料

| 資料名         | パス                                                                                        | 説明                       |
| -------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 設計   | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-2-design.md` | ガード設計詳細             |
| agentSlice実装 | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      | テスト対象                 |
| 既存テスト     | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice*.test.ts`                      | 既存のagentSliceテスト     |
| 既知の落とし穴 | `.claude/rules/06-known-pitfalls.md`                                                        | P39（happy-dom/userEvent） |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Store テストのパターン
- `architecture-implementation-patterns.md`: テストでのモックパターン

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: 既存テスト構造の確認

1. `apps/desktop/src/renderer/store/slices/__tests__/` 配下の既存agentSliceテストファイルを確認
2. テストのセットアップパターン（モック、beforeEach等）を把握
3. `executeSkill` に関する既存テストケースを特定

### ステップ2: Store層ガードテストの設計と作成

**テストケース一覧:**

| テストID | テスト内容                                                          | 対応AC |
| -------- | ------------------------------------------------------------------- | ------ |
| T-01     | `isExecuting === false` の場合、`executeSkill` が正常に実行開始する | AC-01  |
| T-02     | `isExecuting === true` の場合、`executeSkill` が即座にreturnする    | AC-01  |
| T-03     | ガード拒否時、`streamingMessages` が変更されない                    | AC-02  |
| T-04     | ガード拒否時、`executionId` が上書きされない                        | AC-03  |
| T-05     | `executeSkill` を連続2回呼び出した場合、2回目がガードされる         | AC-01  |

**テストコード配置先:**

```
apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

**テストの骨格:**

```typescript
describe("executeSkill concurrency guard", () => {
  it("should allow execution when isExecuting is false", async () => {
    // 初期状態: isExecuting = false
    // executeSkill呼び出し
    // 期待: isExecuting が true に変更される
  });

  it("should reject execution when isExecuting is true", async () => {
    // 事前条件: isExecuting = true に設定
    // executeSkill呼び出し
    // 期待: 関数が即座にreturn（set()が呼ばれない）
  });

  it("should not modify streamingMessages when guard rejects", async () => {
    // 事前条件: isExecuting = true, streamingMessages = [既存メッセージ]
    // executeSkill呼び出し
    // 期待: streamingMessages が元のまま
  });

  it("should not overwrite executionId when guard rejects", async () => {
    // 事前条件: isExecuting = true, executionId = "existing-id"
    // executeSkill呼び出し
    // 期待: executionId が "existing-id" のまま
  });

  it("should guard second call when called in rapid succession", async () => {
    // 1回目の executeSkill 呼び出し（非同期、完了を待たない）
    // 即座に2回目の executeSkill 呼び出し
    // 期待: 2回目がガードされ、streamingMessages が混在しない
  });
});
```

### ステップ3: UI層テストの設計と作成

**テストケース一覧:**

| テストID | テスト内容                                         | 対応AC |
| -------- | -------------------------------------------------- | ------ |
| T-06     | `isExecuting === true` 時にボタンがdisabledになる  | AC-04  |
| T-07     | `isExecuting === false` 時にボタンがdisabledでない | AC-04  |
| T-08     | 実行完了後にボタンのdisabledが解除される           | AC-05  |

**テストコード配置先:**

```
apps/desktop/src/renderer/components/agent/__tests__/execute-button-disabled.test.tsx
```

**注意事項:**

- P39準拠: happy-dom環境では `userEvent` ではなく `fireEvent` を使用
- P40準拠: テスト実行は `apps/desktop/` ディレクトリから行う

### ステップ4: テストの実行確認（Red Phase）

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

- 全テストが FAIL することを確認（ガード未実装のため）
- テスト自体のシンタックスエラーや環境エラーがないことを確認

## 統合テスト連携（Phase 1〜11は必須）

- T-05（連続呼び出しテスト）は統合テスト的な性質を持つ
- Phase 6でガード+IPC呼び出しの結合テストに拡充する

## 多角的チェック観点（AIが判断）

| 観点       | 適用 | チェック内容                                  |
| ---------- | ---- | --------------------------------------------- |
| テスト設計 | 該当 | AC全件に対応するテストケースが存在すること    |
| テスト環境 | 該当 | P39/P40準拠（happy-dom + fireEvent）          |
| 状態管理   | 該当 | Zustand Storeのモックパターンが適切であること |

## 成果物

| 成果物                 | パス                                                                                               | 説明                           |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| テスト設計書           | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md` | 本ドキュメント                 |
| Store層ガードテスト    | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`            | 並行実行ガードのユニットテスト |
| UI層disabled制御テスト | `apps/desktop/src/renderer/components/agent/__tests__/execute-button-disabled.test.tsx`            | ボタンdisabled制御テスト       |

## 完了条件

- [ ] T-01〜T-05のStore層テストコードが作成されている
- [ ] T-06〜T-08のUI層テストコードが作成されている
- [ ] 全テストがFAIL（Red Phase）であることを確認済み
- [ ] テスト自体にシンタックスエラーがないことを確認済み
- [ ] AC-01〜AC-06の全受け入れ基準に対応するテストが存在する
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装

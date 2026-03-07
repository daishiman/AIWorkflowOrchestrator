# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 6                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

Phase 5の実装に対して、カバレッジ不足箇所のテストを追加する。境界値テスト、エラーパス、結合テストを追加してテスト網羅性を向上させる。

## 実行タスク

- 境界値テスト追加: ガードのタイミング境界（isExecuting がtrueになる直前/直後）のテストを追加
- エラーパステスト追加: executeSkillがエラーで終了した後にisExecutingがfalseに戻ることを検証
- 結合テスト追加: Store層ガード + UI層disabledの連携動作を検証

## 参照資料

| 資料名             | パス                                                                                                | 説明                 |
| ------------------ | --------------------------------------------------------------------------------------------------- | -------------------- |
| Phase 4 テスト設計 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-4-test-creation.md`  | 既存テストケース定義 |
| Phase 5 実装       | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-5-implementation.md` | 実装詳細             |
| agentSlice実装     | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                              | テスト対象           |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Store テストの境界値パターン

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

### ステップ1: カバレッジ現状確認

```bash
cd apps/desktop && pnpm vitest run --coverage src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

カバレッジ不足箇所を特定し、以下の追加テストで補完する。

### ステップ2: 追加テストケース

| テストID | テスト内容                                                       | テスト種別 |
| -------- | ---------------------------------------------------------------- | ---------- |
| T-09     | executeSkillがエラーで終了した後、isExecutingがfalseに戻る       | エラーパス |
| T-10     | executeSkill完了後に再度executeSkillを呼ぶと正常に実行される     | 状態遷移   |
| T-11     | selectedSkillNameが未設定の場合、isExecutingガード前にreturnする | 境界値     |
| T-12     | 3回連続呼び出しで2回目と3回目がガードされる                      | 連続操作   |

### ステップ3: テストコードの追加

**配置先:** `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts` に追記

```typescript
describe("executeSkill concurrency guard - extended", () => {
  it("should reset isExecuting to false after execution error", async () => {
    // IPC呼び出しがエラーを返すようモック設定
    // executeSkill呼び出し
    // 期待: isExecuting が false に戻る
  });

  it("should allow re-execution after previous execution completes", async () => {
    // 1回目の executeSkill を実行・完了
    // 2回目の executeSkill を実行
    // 期待: 2回目が正常に開始される（isExecuting = true）
  });

  it("should return early for missing selectedSkillName before isExecuting guard", async () => {
    // selectedSkillName = null, isExecuting = true
    // executeSkill呼び出し
    // 期待: selectedSkillNameチェックでreturn（isExecutingガードに到達しない）
  });

  it("should guard 2nd and 3rd calls in triple rapid succession", async () => {
    // 3回連続でexecuteSkillを呼び出し
    // 期待: 1回目のみ実行、2回目と3回目はガード
  });
});
```

### ステップ4: 追加テスト実行確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts
```

- T-09〜T-12が全てPASSすることを確認

## 統合テスト連携（Phase 1〜11は必須）

- T-10（実行完了後の再実行）は実際のライフサイクルを検証する結合テスト的性質を持つ
- T-12（3回連続呼び出し）は負荷テスト的な観点を含む

## 成果物

| 成果物           | パス                                                                                                | 説明             |
| ---------------- | --------------------------------------------------------------------------------------------------- | ---------------- |
| テスト拡充仕様書 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-6-test-expansion.md` | 本ドキュメント   |
| 拡充テスト       | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice-concurrency-guard.test.ts`             | 追加テストケース |

## 完了条件

- [ ] T-09〜T-12の追加テストコードが作成されている
- [ ] 追加テストが全てPASSしている
- [ ] 既存テスト（T-01〜T-08含む）に回帰がないことを確認済み
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: カバレッジ確認

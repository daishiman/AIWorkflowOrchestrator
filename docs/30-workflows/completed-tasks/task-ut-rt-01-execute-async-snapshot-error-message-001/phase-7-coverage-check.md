# Phase 7: カバレッジ確認

## メタ情報

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| Phase      | 7                                                      |
| Phase 名   | カバレッジ確認                                         |
| 前提 Phase | Phase 6（テスト拡充）完了                              |
| 後続 Phase | Phase 8（リファクタリング）                            |
| ステータス | 未実施                                                 |
| 作成日     | 2026-04-06                                             |
| 機能名     | task-ut-rt-01-execute-async-snapshot-error-message-001 |

---

## 目的

本タスクで変更した `RuntimeSkillCreatorFacade.ts` の `executeAsync()` メソッド内の2箇所（structured error パス・catch パス）に対して、line/branch カバレッジが 100% に到達していることを確認する。**変更していないメソッドはカバレッジ対象外とする。**

---

## 重要ルール [Feedback BEFORE-QUIT-002]

Phase 7 では **カバレッジの対象範囲を明示** し、変更したファイル/ブロック以外を対象外として扱う。変更していないメソッド（`execute()` / `plan()` / `improve()` 等）のカバレッジ数値は本 Phase の判定基準に含めない。

---

## カバレッジ対象範囲

### 対象（変更した関数・ブロックのみ）

| 対象                                     | ファイル                       | 変更内容                                          |
| ---------------------------------------- | ------------------------------ | ------------------------------------------------- |
| `executeAsync()` — structured error パス | `RuntimeSkillCreatorFacade.ts` | `if (!snapshot)` 削除 + `snapshot ?? null` へ変更 |
| `executeAsync()` — catch パス            | `RuntimeSkillCreatorFacade.ts` | `if (!snapshot)` 削除 + `snapshot ?? null` へ変更 |

### 対象外（変更していないメソッド・ブロック）

| 対象外                                                    | 理由               |
| --------------------------------------------------------- | ------------------ |
| `execute()` メソッド                                      | 本タスクで変更なし |
| `plan()` メソッド                                         | 本タスクで変更なし |
| `improve()` メソッド                                      | 本タスクで変更なし |
| `executeAsync()` の正常パス（terminal_handoff / success） | 本タスクで変更なし |
| コンストラクタ                                            | 本タスクで変更なし |
| その他全メソッド                                          | 本タスクで変更なし |

---

## カバレッジ目標

| 計測対象                                           | 指標            | 目標値 |
| -------------------------------------------------- | --------------- | ------ |
| `executeAsync()` structured error パス（変更箇所） | line coverage   | 100%   |
| `executeAsync()` structured error パス（変更箇所） | branch coverage | 100%   |
| `executeAsync()` catch パス（変更箇所）            | line coverage   | 100%   |
| `executeAsync()` catch パス（変更箇所）            | branch coverage | 100%   |

---

## 実行タスク

- タスク1: カバレッジ計測コマンドを実行する
- タスク2: structured error パスの line/branch coverage を確認する
- タスク3: catch パスの line/branch coverage を確認する
- タスク4: カバレッジ未達の場合、Phase 6 へ戻る

---

## 実行手順

### ステップ1: カバレッジ計測コマンドの実行

以下のコマンドを実行してカバレッジレポートを生成する。

```bash
pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade" --coverage
```

---

### ステップ2: structured error パスのカバレッジ確認

カバレッジレポートの `RuntimeSkillCreatorFacade.ts` セクションで、以下の行が 100% カバーされていることを確認する。

**確認対象コード（Phase 5 実装後）**:

```typescript
// structured error パス（修正後）
if (isStructuredError) {
  const errorResponse =
    executeResult as RuntimeSkillCreatorExecuteErrorResponse;
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(
    // ← この行が必ずカバーされること
    planId,
    snapshot ?? null,
    errorResponse.error.message,
  );
}
```

**確認チェックリスト**:

- [ ] `this.onWorkflowStateSnapshot?.(...)` の行が line coverage にカウントされている
- [ ] `snapshot` が `null` / `undefined` のケース（T-05）がカバーされている
- [ ] `onWorkflowStateSnapshot` が設定されているケース（T-01）がカバーされている

---

### ステップ3: catch パスのカバレッジ確認

**確認対象コード（Phase 5 実装後）**:

```typescript
// catch パス（修正後）
} catch (error) {
  this.workflowEngine.triggerPhaseTransition(planId, "error", 0);
  const errorMessage = error instanceof Error ? error.message : String(error);
  const snapshot = this.workflowEngine.getWorkflowState(planId);
  this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage);  // ← この行が必ずカバーされること
  console.error(
    "[RuntimeSkillCreatorFacade] executeAsync failed",
    planId,
    errorMessage,
  );
}
```

**確認チェックリスト**:

- [ ] `this.onWorkflowStateSnapshot?.(planId, snapshot ?? null, errorMessage)` の行が line coverage にカウントされている
- [ ] `snapshot` が存在する場合（`snapshot ?? null` の `snapshot` ブランチ）がカバーされている
- [ ] `snapshot` が `null` / `undefined` の場合（`snapshot ?? null` の `null` ブランチ）がカバーされている
- [ ] `error instanceof Error` が `true` のケースがカバーされている（T-02）
- [ ] `error instanceof Error` が `false` のケースがカバーされている（T-06）

---

### ステップ4: カバレッジ未達時のアクション

カバレッジが 100% に到達していない場合:

1. **Phase 6 へ戻る** — 不足しているブランチを特定し、対応するテストを T-05〜T-06 に調整する
2. 不足ブランチの例:
   - `snapshot ?? null` の `null` ブランチが未カバー → `getWorkflowState` が `null` を返すケースのテストを調整
   - `error instanceof Error` が `false` のブランチが未カバー → `String(error)` ルートのテストを調整
3. テスト追加後、本 Phase（Phase 7）を再実行する

**戻り先フロー**:

```
Phase 7 未達 → Phase 6（テスト拡充）→ Phase 7 再実行
```

---

## 統合テスト連携

- 本 Phase で計測するのはユニットテストのカバレッジのみ
- IPC レイヤー経由の統合カバレッジは対象外
- Renderer 側コンポーネントのカバレッジは対象外

---

## 成果物

| 成果物                       | パス                                                                                                 | 内容                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Phase 7 カバレッジ確認仕様書 | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-7-coverage-check.md` | 本ドキュメント                         |
| Phase 7 outputs ディレクトリ | `docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/outputs/phase-7/`          | Phase 7 出力格納ディレクトリ（空でOK） |

---

## 完了条件

- [ ] `pnpm --filter @repo/desktop test -- --testPathPattern "RuntimeSkillCreatorFacade" --coverage` が正常終了した
- [ ] `executeAsync()` structured error パスの line coverage が 100% である
- [ ] `executeAsync()` structured error パスの branch coverage が 100% である
- [ ] `executeAsync()` catch パスの line coverage が 100% である
- [ ] `executeAsync()` catch パスの branch coverage が 100% である
- [ ] 変更していないメソッド（`execute()` / `plan()` / `improve()` 等）はカバレッジ判定対象外であることを明記した

---

## Phase 末端アクション【必須】

- [ ] Phase 7 内の全タスクを 100% 実行完了
- [ ] カバレッジ計測結果（line/branch の数値）を本ドキュメントに記録する
- [ ] 未達の場合は Phase 6 へ戻ったことを明記する
- [ ] 成果物（本ドキュメント）が生成されていることを確認

---

## 次 Phase

Phase 7 完了（カバレッジ 100% 達成）後、次は **Phase 8（リファクタリング）** へ進む。

`docs/30-workflows/task-ut-rt-01-execute-async-snapshot-error-message-001/phase-8-refactoring.md`

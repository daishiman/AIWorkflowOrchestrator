# TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001

## メタ情報

```yaml
issue_number: 1906
```

## メタ情報

| 項目       | 値                                                                     |
| ---------- | ---------------------------------------------------------------------- |
| タスクID   | TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001         |
| 機能名     | ut-rt-01-verify-and-improve-loop-adapter-notification-001              |
| ステータス | open（未着手）                                                         |
| 作成日     | 2026-04-04                                                             |
| 親タスク   | TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001（Phase 10 MINOR 指摘） |
| 優先度     | Medium                                                                 |
| タスク種別 | follow-up / feature（コード変更タスク）                                |

## 概要

`verifyAndImproveLoop()` 内の `improve()` アダプターエラー通知をランタイムガードと統一する。

TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 では `execute()` / `improve()` にそれぞれ `_llmAdapterStatus` ガードと `INotificationService.notify()` 呼び出しを実装した。しかし `verifyAndImproveLoop()` は内部で `improve()` を呼び出すループ構造を持ち、`improve()` が adapter エラーを返した場合のエラーコード伝播・通知文言が runtime guard（`execute()` / `improve()` 単体）と統一されているか検証・整理が必要である。

## スコープ

### 含む

- `verifyAndImproveLoop()` 内で `improve()` が `{ success: false, error: { code, message } }` を返した場合の通知呼び出し確認・追加
- `recordImproveFailureSnapshot()` の phase 保持ロジックと通知文言の整合確認
- 通知文言が `execute()` / `improve()` 単体ガードと同等の品質になっているかの検証
- `errorCode` フィールドを `RuntimeSkillCreatorVerifyAndImproveResult` に確実に伝播させることの確認
- テスト: `verifyAndImproveLoop` で `improve()` が adapter エラーを返したシナリオのテスト追加

### 含まない

- ループ実行中に adapter 状態が動的に変化した場合の対応
- ループ開始前の `_llmAdapterStatus` チェック追加（実装済みの確認のみ）
- `verifyAndImproveLoop()` 自体のリファクタリング
- 新規エラーコードの追加

## 受入基準

| ID   | 基準                                                                                                  |
| ---- | ----------------------------------------------------------------------------------------------------- |
| AC-1 | `improve()` が `llm_adapter_unavailable` を返した場合、`INotificationService.notify()` が呼び出される |
| AC-2 | 通知メッセージが `execute()` 単体ガードの通知文言（`"スキル作成失敗"` タイトル）と同等である          |
| AC-3 | `verifyAndImproveLoop()` の戻り値に `errorCode: "llm_adapter_unavailable"` が含まれる                 |
| AC-4 | `recordImproveFailureSnapshot()` が phase を `"improve"` のまま保持し、`verifyResult` だけを更新する  |
| AC-5 | `improve()` adapter エラー時にループが即終了し、無意味なリトライが発生しない                          |
| AC-6 | 既存の `verifyAndImproveLoop()` テストがリグレッションなし                                            |

## Phase 構成

| Phase | 名称             | ステータス |
| ----- | ---------------- | ---------- |
| 1     | 要件定義         | open       |
| 2     | 設計             | open       |
| 3     | 設計レビュー     | open       |
| 4     | テスト作成       | open       |
| 5     | 実装             | open       |
| 6     | テスト拡充       | open       |
| 7     | カバレッジ確認   | open       |
| 8     | リファクタリング | open       |
| 9     | 品質検証         | open       |
| 10    | 最終レビュー     | open       |
| 11    | 手動テスト       | open       |
| 12    | ドキュメント     | open       |
| 13    | PR作成           | open       |

---

## Phase 1: 要件定義

### 目的

`verifyAndImproveLoop()` 内で `improve()` が adapter エラーを返した場合の現状動作を調査し、通知統一に必要な変更を特定する。

### Task 1-1: 現行コード調査

**調査対象**:

- `RuntimeSkillCreatorFacade.verifyAndImproveLoop()`（L340〜L526）
- `recordImproveFailureSnapshot()`（L1013〜）
- `_executeInternal()` の通知呼び出しパターン（L1109〜L1140 — 実装済み参照）

**現状確認ポイント**:

| 確認項目                                                                      | 現状                                                          |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `improve()` が `success: false` を返した場合の通知呼び出し有無                | `recordImproveFailureSnapshot()` を呼ぶが通知なし             |
| `errorCode` が戻り値 `RuntimeSkillCreatorVerifyAndImproveResult` に含まれるか | `errorCode?` フィールドあり（L443付近）                       |
| `recordImproveFailureSnapshot()` の phase 保持方針                            | `currentPhase: "improve"` のまま保持（L1042付近）             |
| `execute()` 単体の通知呼び出しパターン                                        | `notificationService?.notify("スキル作成失敗", ...)` 実装済み |

### Task 1-2: 機能要件定義

| ID   | 要件                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| FR-1 | `improve()` が `{ success: false }` を返した場合、`notificationService?.notify()` を呼び出す                    |
| FR-2 | 通知タイトルは `"スキル作成失敗"`、メッセージは `improveResult.error.message` とする                            |
| FR-3 | `verifyAndImproveLoop()` 戻り値の `errorCode` フィールドに `improveResult.error.code` を設定する                |
| FR-4 | `recordImproveFailureSnapshot()` は phase を `"improve"` のまま保持し、`verifyResult.status` を `"fail"` にする |
| FR-5 | adapter エラー時はループを即終了し、次の `while` イテレーションへ進まない                                       |

### Task 1-3: エッジケース洗い出し

| ケース | 説明                                              | 対応                                                     |
| ------ | ------------------------------------------------- | -------------------------------------------------------- |
| E-1    | `notificationService` が `undefined` の場合       | optional chaining で安全にスキップ                       |
| E-2    | `notificationService.notify()` が例外を投げた場合 | `try/catch` でスキップ（ループ結果に影響させない）       |
| E-3    | `improve()` が `terminal_handoff` を返した場合    | 既存の `terminal_handoff` 分岐で処理（通知不要）         |
| E-4    | `improve()` が `suggestions: []` を返した場合     | 既存の「改善提案なし」分岐で処理（adapter エラーでない） |
| E-5    | `errorCode` が `undefined` の adapter エラー      | `code` フィールドがある場合のみ伝播させる                |

---

## Phase 2: 設計

### 目的

最小変更で通知統一を実現する実装方針を確定する。

### Task 2-1: 通知追加箇所の設計

`verifyAndImproveLoop()` 内の `improve()` エラーハンドリング（L434〜L450）を以下に更新する:

```typescript
// エラーレスポンスチェック
if ("success" in improveResult && !improveResult.success) {
  const errorCode = improveResult.error.code;
  const errorMessage = improveResult.error.message;

  // 追加: runtime guard と統一した通知呼び出し
  try {
    this.notificationService?.notify("スキル作成失敗", errorMessage);
  } catch {
    // 通知の失敗はループ結果に影響しない
  }

  const snapshot = this.recordImproveFailureSnapshot(
    planId,
    `improve が ${errorCode} で失敗しました: ${errorMessage}`,
  );
  return {
    finalStatus: "error",
    totalAttempts: attemptCount,
    finalChecks: checks,
    loopExhausted: false,
    errorCode,
    errorMessage,
    workflowSnapshot: snapshot,
  };
}
```

### Task 2-2: `recordImproveFailureSnapshot()` の設計確認

現行の `recordImproveFailureSnapshot()` は:

1. `workflowEngine.recordImproveFailure()` が存在する場合は委譲
2. なければフォールバックとして `currentPhase: "improve"` を維持し `verifyResult` を更新

**設計判断**: phase を `"improve"` のまま保持する（`"review"` に戻さない）のが正しい設計。

理由:

- `improve()` がエラーで終了した場合、ユーザーは「改善を試みたが失敗した」状態にいる
- `"review"` に戻すと「まだレビュー前」という誤解を招く
- `verifyResult.nextAction: "improve"` で「改善が必要」を示すのが適切

### Task 2-3: 変更ファイル一覧

| 種別       | ファイルパス                                                                                                      | 変更内容                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 通知追加   | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                             | `improve()` エラーブロックに `notify()` 呼び出し追加 |
| テスト追加 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`（既存 or 新規） | `verifyAndImproveLoop` + adapter エラー シナリオ追加 |

---

## Phase 3: 設計レビュー

### 設計の評価

| 観点         | 評価                                                                                | 判定 |
| ------------ | ----------------------------------------------------------------------------------- | ---- |
| SRP          | `notify()` 呼び出しは既存の `_executeInternal()` と同一パターン。責務分離に問題なし | PASS |
| 最小変更     | 追加行数は約5行。`recordImproveFailureSnapshot()` の変更は不要                      | PASS |
| 通知統一     | タイトル・メッセージ形式が `execute()` 単体ガードと同等                             | PASS |
| phase 保持   | `"improve"` 保持は Phase 2 設計判断通り。`"review"` への後退は不要                  | PASS |
| エッジケース | E-1〜E-5 全て設計で対処済み                                                         | PASS |

**Phase 4 へ進む: APPROVED**

---

## Phase 4: テスト作成

### テスト対象ファイル

`apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.notification.test.ts`（既存ファイルに追加、または新規作成）

### テストマトリクス

| テストID | シナリオ                                           | 検証項目                                          | 優先度 |
| -------- | -------------------------------------------------- | ------------------------------------------------- | ------ |
| T-VL-01  | `improve()` が `llm_adapter_unavailable` を返す    | `notify("スキル作成失敗", errorMessage)` 呼び出し | HIGH   |
| T-VL-02  | `improve()` が adapter エラー → 戻り値 `errorCode` | `errorCode: "llm_adapter_unavailable"` が含まれる | HIGH   |
| T-VL-03  | `notificationService` が未設定の場合               | エラーなく正常終了する                            | MEDIUM |
| T-VL-04  | `notify()` が例外を投げた場合                      | ループ戻り値に影響しない                          | MEDIUM |
| T-VL-05  | `improve()` が `success: true` の場合              | 通知が呼ばれない（リグレッション確認）            | HIGH   |

### テストコードスニペット（T-VL-01）

```typescript
describe("verifyAndImproveLoop() adapter エラー時の通知", () => {
  it("T-VL-01: improve() が llm_adapter_unavailable を返した場合 notify() を呼び出す", async () => {
    const mockNotify = vi.fn();
    const notificationService = { notify: mockNotify };

    const facade = new RuntimeSkillCreatorFacade({
      skillExecutor: createMockSkillExecutor(),
      verificationEngine: createMockVerificationEngine({ hasFailures: true }),
      notificationService,
    });
    facade.setLLMAdapter(createMockAdapter());

    // improve() が adapter エラーを返すようにモック
    vi.spyOn(facade as any, "improve").mockResolvedValueOnce({
      success: false,
      error: {
        code: "llm_adapter_unavailable",
        message: "APIキーを設定してください",
      },
    });

    await facade.verifyAndImproveLoop(
      "plan-1",
      "/skills/test",
      "test",
      "api-key",
    );

    expect(mockNotify).toHaveBeenCalledWith(
      "スキル作成失敗",
      "APIキーを設定してください",
    );
  });
});
```

### 実行コマンド

```bash
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

---

## Phase 5: 実装

### 実装計画

#### 新規作成ファイル

なし（既存ファイルの修正のみ）

#### 修正ファイル一覧

| ファイルパス                                                          | 変更種別   | 変更内容                                                      |
| --------------------------------------------------------------------- | ---------- | ------------------------------------------------------------- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 通知追加   | `improve()` エラーブロックに `notify()` 呼び出し追加（約5行） |
| テストファイル（既存 or 新規）                                        | テスト追加 | T-VL-01〜05 追加                                              |

#### 実装手順

**Step 1**: `verifyAndImproveLoop()` 内の `improve()` エラーハンドリングブロック（L434〜L450付近）に通知呼び出しを追加

```typescript
if ("success" in improveResult && !improveResult.success) {
  const errorCode = improveResult.error.code;
  const errorMessage = improveResult.error.message;

  // TASK-UT-RT-01-VERIFY-AND-IMPROVE-LOOP-ADAPTER-NOTIFICATION-001
  // runtime guard と統一した通知呼び出し
  try {
    this.notificationService?.notify("スキル作成失敗", errorMessage);
  } catch {
    // 通知の失敗はループ結果に影響しない
  }

  const snapshot = this.recordImproveFailureSnapshot(
    planId,
    `improve が ${errorCode} で失敗しました: ${errorMessage}`,
  );
  return {
    finalStatus: "error",
    totalAttempts: attemptCount,
    finalChecks: checks,
    loopExhausted: false,
    errorCode,
    errorMessage,
    workflowSnapshot: snapshot,
  };
}
```

**Step 2**: テスト T-VL-01〜05 を追加

#### 品質チェック

```bash
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop test -- --testPathPattern="notification"
pnpm --filter @repo/desktop test -- --testPathPattern="RuntimeSkillCreatorFacade"
```

---

## Phase 6: テスト拡充

### 追加テスト

| テストID | シナリオ                                                 | 優先度 |
| -------- | -------------------------------------------------------- | ------ |
| T-VL-06  | `improve()` が `catch` ブロックで例外を出した場合        | LOW    |
| T-VL-07  | `improve()` が `terminal_handoff` を返した場合は通知なし | LOW    |
| T-REG-01 | `verifyAndImproveLoop()` の既存 PASS シナリオ            | HIGH   |

---

## Phase 7: カバレッジ確認

### カバレッジ目標

対象: `verifyAndImproveLoop()` の `improve()` エラーブロック（追加箇所のみ）

| 項目                                       | 目標 |
| ------------------------------------------ | ---- |
| `improve()` エラーブロックの line coverage | 100% |
| `notify()` 呼び出しの branch coverage      | 100% |
| `notificationService` undefined 分岐       | 100% |

```bash
pnpm --filter @repo/desktop test -- --coverage --testPathPattern="notification"
```

---

## Phase 8: リファクタリング

### 変更内容

| 対象                                       | Before                           | After                                          | 理由                        |
| ------------------------------------------ | -------------------------------- | ---------------------------------------------- | --------------------------- |
| `improve()` エラー時の通知呼び出しパターン | 通知なし（エラーコードのみ返却） | `try { notify() } catch {}` パターンで通知追加 | `_executeInternal()` と統一 |

重複排除の観点: `_executeInternal()`、`improve()` 単体、`verifyAndImproveLoop()` 内の3か所で `notify("スキル作成失敗", ...)` パターンを使用するが、現時点では共通ヘルパー化よりインライン維持を選択（変更範囲を最小化するため）。共通ヘルパー化は別タスクで検討すること。

---

## Phase 9: 品質検証

### 検証チェックリスト

- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] T-VL-01〜07 が全て PASS する
- [ ] T-REG-01（既存テスト）がリグレッションなし
- [ ] `pnpm lint` がエラーなしで通過する

---

## Phase 10: 最終レビュー

### 受入基準チェック

| ID   | 受入基準                                                      | 判定 | 証跡          |
| ---- | ------------------------------------------------------------- | ---- | ------------- |
| AC-1 | `improve()` adapter エラー時に `notify()` が呼ばれる          | [ ]  | T-VL-01 PASS  |
| AC-2 | 通知文言が `execute()` 単体ガードと同等                       | [ ]  | T-VL-01 PASS  |
| AC-3 | 戻り値に `errorCode` が含まれる                               | [ ]  | T-VL-02 PASS  |
| AC-4 | `recordImproveFailureSnapshot()` が phase を `improve` で保持 | [ ]  | T-VL-02 PASS  |
| AC-5 | adapter エラー時にループが即終了する                          | [ ]  | T-VL-01 PASS  |
| AC-6 | 既存テストがリグレッションなし                                | [ ]  | T-REG-01 PASS |

### MINOR 指摘候補

- `_executeInternal()`、`improve()` 単体、`verifyAndImproveLoop()` 内の3か所で通知呼び出しパターンが重複する → 共通ヘルパー化の検討（別タスク）

---

## Phase 11: 手動テスト

### テスト分類

`NON_VISUAL` — Main プロセスのみの変更。UI 変更なし。

### 自動テスト代替記録

| 証跡               | 内容                                           |
| ------------------ | ---------------------------------------------- |
| 自動テスト名       | T-VL-01〜07、T-REG-01                          |
| テスト件数         | 8件                                            |
| スクリーンショット | 不要（NON_VISUAL 判定による）                  |
| 理由               | Main プロセス内の関数呼び出しのみ。UI 変更なし |

---

## Phase 12: ドキュメント更新

### Task 12-1: 実装ガイド（2パート）

#### Part 1（中学生レベル）

**なぜこれが必要か？**

AI スキルを作るアプリを想像してください。このアプリは AI と話し合いながらスキルを自動的に改善していくループ（繰り返し処理）を持っています。

問題は、AI と話す準備（アダプターの初期化）ができていないときに、このループが改善を試みてしまうことです。今まではこの失敗が「ひっそりと」終わっていて、ユーザーに「何が失敗したのか」が伝わりませんでした。

今回の変更で、ループ内で AI 接続エラーが起きた場合も、スキルを単体で実行するときと同じように「スキル作成に失敗しました」という通知が届くようになります。

**改善前と改善後の比較**:

- 改善前: ループ内で AI エラー → 静かに終了 → ユーザーは原因がわからない
- 改善後: ループ内で AI エラー → 通知が届く → ユーザーはすぐに原因を把握できる

#### Part 2（技術者レベル）

**変更ファイル**:

| ファイル                                                              | 変更内容                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | `verifyAndImproveLoop()` 内の `improve()` エラーブロックに通知追加 |

**変更パターン**:

```typescript
// verifyAndImproveLoop() 内 — improve() エラーブロック
if ("success" in improveResult && !improveResult.success) {
  const errorCode = improveResult.error.code;
  const errorMessage = improveResult.error.message;

  // 追加: _executeInternal() の通知パターンと統一
  try {
    this.notificationService?.notify("スキル作成失敗", errorMessage);
  } catch {
    // 通知の失敗はループ結果に影響しない
  }

  const snapshot = this.recordImproveFailureSnapshot(planId, ...);
  return { finalStatus: "error", errorCode, errorMessage, ... };
}
```

**`recordImproveFailureSnapshot()` の動作**:

```typescript
// phase を "improve" のまま保持し、verifyResult だけを更新する
return {
  ...existingSnapshot,
  currentPhase: "improve", // "review" に戻さない
  verifyResult: {
    status: "fail",
    message,
    nextAction: "improve",
    updatedAt,
  },
};
```

### Task 12-2: システム仕様書更新

#### Step 1-A: タスク完了記録

- `task-workflow-completed.md` に本タスクの完了記録を追加
- `aiworkflow-requirements/LOGS.md` を更新
- `task-specification-creator/LOGS.md` を更新

#### Step 1-B: 実装状況テーブル更新

`task-workflow-backlog.md` の本タスクのステータスを `open` → `completed` に更新。

#### Step 1-C: 関連タスクテーブル更新

`task-ut-rt-01-execute-improve-adapter-guard-001.md` の「関連タスク」テーブルで本タスクのステータスを更新。

#### Step 2: 新規インターフェース追加判定

変更は `RuntimeSkillCreatorFacade.ts` 内部実装のみ。インターフェース・型定義の変更なし。**Step 2 は N/A**。

### Task 12-3: ドキュメント更新履歴

成果物: `outputs/phase-12/documentation-changelog.md`

### Task 12-4: 未タスク検出レポート

成果物: `outputs/phase-12/unassigned-task-detection.md`

未タスク候補:

| 指摘                                                                               | 判定  | 対応                     |
| ---------------------------------------------------------------------------------- | ----- | ------------------------ |
| `notify()` 呼び出しが3か所（execute/improve単体/ループ内）に分散 → 共通ヘルパー化  | MINOR | 別タスクとして検討       |
| `executeAsync()` adapter エラーを `onWorkflowStateSnapshot` に伝搬する際の通知統一 | MINOR | 別タスクとして formalize |

### Task 12-5: スキルフィードバックレポート

成果物: `outputs/phase-12/skill-feedback-report.md`

| 観点         | フィードバック                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------ |
| テンプレート | 通知パターン（`try { notify() } catch {}`）を Phase 5 実装テンプレートに標準パターンとして記載することを提案 |
| ワークフロー | adapter ガードを追加した際、同じメソッドを呼び出す上位ループも同波で通知統一チェックを行うルールを追加推奨   |
| ドキュメント | 改善なし                                                                                                     |

---

## Phase 12 苦戦箇所（formalize 記録）

### 背景

本タスクは TASK-UT-RT-01-EXECUTE-IMPROVE-ADAPTER-GUARD-001 の Phase 10 MINOR 指摘（`verifyAndImproveLoop()` 内の improve エラー時のユーザー通知改善）を formalize したもの。

### 苦戦箇所 1: `recordImproveFailure()` 連携の複雑性

**問題**: `verifyAndImproveLoop()` 内には `recordImproveFailureSnapshot()` というプライベートメソッドが存在するが、このメソッドが `workflowEngine.recordImproveFailure()` の存在チェックを行うダックタイピングパターンになっており、テスト時にモックが難しかった。

```typescript
// recordImproveFailureSnapshot() のダックタイピングパターン
const workflowEngineWithImproveFailure = this.workflowEngine as
  | SkillCreatorWorkflowEngine
  | (SkillCreatorWorkflowEngine & {
      recordImproveFailure?: (
        planId: string,
        message: string,
      ) => SkillCreatorWorkflowUiSnapshot;
    });

if (
  typeof workflowEngineWithImproveFailure.recordImproveFailure === "function"
) {
  return workflowEngineWithImproveFailure.recordImproveFailure(planId, message);
}
// フォールバック処理...
```

**解決方法**: テストでは `workflowEngine` に `recordImproveFailure` メソッドを持つモックを渡すことで、ダックタイピングを正常に機能させた。また、フォールバックロジックに対するテストも別途追加した。

### 苦戦箇所 2: `improve()` 失敗時の `currentPhase` 保持判断

**問題**: `improve()` が失敗したときに `currentPhase` を `"review"` へ戻すべきか、`"improve"` のまま保持するかで設計の判断が必要だった。

**判断の難しさ**:

- `"review"` に戻すと「verify 結果を再確認してください」という意味になるが、ユーザーはすでに verify 済み
- `"improve"` のままにすると「改善を試みた」状態を保持できるが、次のアクションが不明確になるリスクがある

**解決方法**: `currentPhase` を `"improve"` のまま保持し、`verifyResult.nextAction: "improve"` で「再度 improve が必要」を示すロジックに分離した。Phase（状態遷移）の責務と Artifact（改善試行記録）の責務を明確に分離することで解決した。

### 将来のアドバイス

**phase 遷移の責務と artifact 記録の責務を明確に分離する設計が重要**:

- `currentPhase` は「ユーザーが今どのステップにいるか」の表現（phase 遷移の責務）
- `verifyResult` / `phaseArtifacts` は「何が行われたか」の記録（artifact 記録の責務）
- この2つを混在させると、「失敗したから前のフェーズに戻す」という誤った設計に陥りやすい
- 失敗時は `currentPhase` を変えず、`verifyResult` の `status` / `nextAction` で次のアクションを示すのが正しいパターン

---

## Phase 13: PR作成

PR作成はユーザーの明示承認後のみ実施する。

---

## 参照資料

| 資料名                           | パス                                                                                                  |
| -------------------------------- | ----------------------------------------------------------------------------------------------------- |
| RuntimeSkillCreatorFacade        | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                 |
| 旧未タスク仕様書（簡略版）       | `docs/30-workflows/unassigned-task/task-ut-rt-01-verify-and-improve-loop-adapter-notification-001.md` |
| 親タスクワークフロー（Phase 10） | `docs/30-workflows/ut-rt-01-execute-improve-adapter-guard-001/phase-10-final-review.md`               |
| adapter-status テスト            | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.adapter-status.test.ts`   |
| SkillCreatorWorkflowEngine       | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                |

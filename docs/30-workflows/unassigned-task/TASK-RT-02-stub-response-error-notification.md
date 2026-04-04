# スタブ応答を明示的エラーに変換・UI フィードバック - タスク指示書

## メタ情報

```yaml
issue_number: 1880
```

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | TASK-RT-02                                                 |
| タスク名     | スタブ応答を明示的エラーに変換・UI フィードバック          |
| 分類         | バグ修正（Runtime系）                                      |
| 対象機能     | Skill Creator Agent SDK Lane - plan()/execute() スタブ応答 |
| 優先度       | 高                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | P0是正パック（実動作調査）                                 |
| 発見日       | 2026-04-04                                                 |
| Step         | 08（並列実行可能）                                         |
| 依存タスク   | なし                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Skill Creator Agent SDK Lane は `plan()` / `execute()` / `improve()` の 3 ロールを持つ `RuntimeSkillCreatorFacade` を中心に構築されている。このファサードは LLMAdapter や ResourceLoader などの依存コンポーネントを Setter Injection で受け取り、コンストラクタ時点では注入が間に合わない場合に「graceful degradation」として処理を続ける設計が元々想定されていた。

実動作調査（P0是正パック）により、依存コンポーネントが未注入のまま `plan()` / `execute()` が呼ばれた場合に、明示的なエラーを返さず「成功に見える空応答」または「スタブデータ」を返す経路が残存していることが確認された。

現状では `buildDegradedError()` というヘルパーが `RuntimeSkillCreatorFacade.ts` 内に実装されており、`llmAdapter` / `resourceLoader` が未注入の場合に `{ success: false, error: { code, message } }` 形式のエラーを返す実装が `plan()` および `improve()` に追加されている（コード上のコメント: `// TASK-RT-02: llmAdapter/resourceLoader 未注入時は explicit error を返す`）。しかし、この実装が UI 側のフィードバック経路と正しくつながっているか、スタブ応答を返す他の経路が残っていないかの確認と、UI へのエラー通知機構の整備が本タスクのスコープである。

### 1.2 問題点・課題

1. **スタブ応答による誤った成功表示**: `plan()` / `execute()` がスタブ応答を返した場合、UI はスキル作成が完了したと誤解する。ユーザーは無効なスキルを「作成済み」として扱い、後続操作で不整合に直面する。

2. **P0-01（verify engine）の検証を阻害**: スタブ応答が混入すると、verify engine が「成功した実行結果」を検証対象として扱い、検証の正確性が失われる。スタブ排除はP0全体の品質基盤として必須である。

3. **UIへのフィードバック経路が不明確**: `SkillLifecyclePanel.tsx` が `generationError` / `workflowError` のどちらを表示するかが設計上あいまいであり、スタブ由来のエラーがユーザーに見える保証がない。

4. **エラー種別の不統一**: スタブ応答を排除した後に返るエラーが、既存のエラートースト・インライン表示・リトライボタンのどれにルーティングされるかが未定義である。

### 1.3 放置した場合の影響

- ユーザーが「スキル作成完了」と誤認したまま後続のスキル実行を試みて、実行時エラーが多発する
- P0是正パック全体の信頼性評価が低下し、TASK-RT-01/03/04 の実装効果が相殺される
- スタブ応答は自動テストでも「成功」として扱われるため、回帰テストの品質が維持できない
- verify engine（P0-01）の計測値が汚染され、品質メトリクスが信頼できなくなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`plan()` / `execute()` のスタブ応答経路を特定・排除し、未設定状態を明示的な `SkillCreatorError` 型エラーとして返す。さらに、そのエラーを UI で確実にユーザーへ伝達する。

### 2.2 最終ゴール

- `plan()` / `execute()` がスタブ応答（空データ・モックデータ・無効な成功レスポンス）を返さない
- 未設定依存コンポーネント（llmAdapter / resourceLoader）は `{ success: false, error: { code, message } }` 形式で明示的に失敗する
- `SkillLifecyclePanel` がそのエラーを受け取り、ユーザーに通知を表示する
- スタブ排除後のユニットテストが追加され、回帰が防止される

### 2.3 スコープ（含む/含まない）

**含むもの:**

| 対象                   | 内容                                               |
| ---------------------- | -------------------------------------------------- |
| plan() / execute()     | スタブ応答パスの特定と削除                         |
| buildDegradedError()   | 既存実装の確認と、カバーできていないケースへの拡張 |
| SkillCreatorError 変換 | スタブ応答を明示的なエラー型に変換する処理         |
| UIフィードバック       | トーストまたはインライン表示によるエラー通知       |
| ユニットテスト         | スタブ排除後の新規テスト追加                       |

**含まないもの:**

| 除外対象                         | 理由・担当タスク                                         |
| -------------------------------- | -------------------------------------------------------- |
| LLMAdapter 初期化エラーの通知    | TASK-RT-01 の責務                                        |
| APIキー設定 UI                   | TASK-RT-04 の責務                                        |
| result/success 表示パネル        | TASK-RT-03 の責務                                        |
| reason code の i18n 対応         | UT-RT-02-01 / UT-RT-02-I18N-ERROR-MESSAGE-001 の責務     |
| AdapterStatus のリアルタイム更新 | UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001 の責務 |

### 2.4 成果物

| 種別       | ファイル                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| 修正       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                 |
| 修正       | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                  |
| 確認・修正 | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                                |
| 確認・修正 | `packages/shared/src/types/skillCreator.ts`                                                           |
| 追加       | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js / pnpm が利用可能であること
- `pnpm install` が完了していること
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` の現状を把握していること（本仕様書のセクション8「苦戦箇所の記録」を先に読むこと）

### 3.2 依存タスク

| タスクID | 状態 | 内容                       |
| -------- | ---- | -------------------------- |
| なし     | -    | 本タスクは独立して実施可能 |

**並列実施可能なタスク:**

- TASK-RT-01（LLMAdapter初期化エラー通知）
- TASK-RT-03（result/success 表示パネル）
- TASK-RT-04（APIキー設定UI）

### 3.3 必要な知識

**RuntimeSkillCreatorFacade のアーキテクチャ:**

- `plan()`: スキル仕様文字列を受け取り、LLM で実行計画を生成する。IPC チャネル: `skill-creator:plan`
- `execute()`: plan 結果を受け取り、SkillExecutor に委譲してスキルを生成する。IPC チャネル: `skill-creator:execute-plan`
- `buildDegradedError(reason)`: `llmAdapter` / `resourceLoader` が未注入の場合に `{ success: false, error: { code, message } }` を返すヘルパー関数（モジュールスコープ）

**エラー応答型（`packages/shared/src/types/skillCreator.ts`）:**

```typescript
// 成功形式
type RuntimeSkillCreatorPlanResult = { planId: string; skillSpec: string; ... }

// 失敗形式（buildDegradedError が返す型）
type RuntimeSkillCreatorPlanErrorResponse = {
  success: false;
  error: { code: RuntimeSkillCreatorDegradedReason; message: string }
}

// コード種別
type RuntimeSkillCreatorDegradedReason =
  | "llm_adapter_unavailable"
  | "resource_loader_unavailable"
```

**UI 側のエラー状態管理（`SkillLifecyclePanel.tsx`）:**

- `useGenerationError()` / `useSetGenerationError()`: plan/execute の失敗状態
- `useWorkflowError()` / `useSetWorkflowError()`: ワークフロー全体の失敗状態
- エラーは `agentSlice` の Jotai atom で管理されている

### 3.4 推奨アプローチ

1. **調査優先**: `RuntimeSkillCreatorFacade.ts` の全メソッドを読み、`buildDegradedError` が呼ばれない経路（スタブを返す経路）を列挙する
2. **テスト先行（TDD）**: スタブ応答を期待するテストを「失敗させるテスト」として先に書き、それを Red → Green に変える形で実装する
3. **UI 接続の最後**: バックエンド（Facade）のスタブ排除が確認できてからUI側の通知を接続する

---

## 4. 実行手順

### Phase 1: 現状調査・スタブ経路の列挙

**目標**: スタブ応答を返す可能性がある全ての経路を特定する

1. `RuntimeSkillCreatorFacade.ts` を通読し、以下の観点でチェックする:
   - `plan()` メソッド: `_llmAdapterStatus === "initializing"` のブランチが返す内容を確認する（現状: `{ success: false, error: { code: "llm_adapter_unavailable", message: "..." } }` — 正しいエラー形式か確認）
   - `execute()` メソッド: `_executeInternal()` 内に `buildDegradedError` の呼び出しがないことを確認し、`llmAdapter` 未注入のまま `SkillExecutor.execute()` を呼ぶ経路がないか確認する
   - `improve()` メソッド: `buildDegradedError` が呼ばれる経路を確認する

2. `SkillCreatorWorkflowEngine.ts` を確認し、`recordPlanResult()` / `recordExecuteStart()` がスタブデータを注入していないか確認する

3. 調査結果を表形式でメモする（例: メソッド名 / スタブ条件 / 返す値 / 修正要否）

**コマンド:**

```bash
# スタブやモックに関連するキーワードで検索
grep -n "stub\|mock\|dummy\|TODO\|FIXME\|hardcode" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# buildDegradedError の呼び出し箇所を全て確認
grep -n "buildDegradedError\|degraded" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

### Phase 2: テスト作成（TDD Red フェーズ）

**目標**: スタブ排除後の期待動作を先にテストとして記述する

新規テストファイル: `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts`

**テストケース一覧（最低限）:**

```typescript
// ケース1: llmAdapter が未注入の場合、plan() は明示的エラーを返す
test('plan() returns explicit error when llmAdapter is not injected', async () => {
  const facade = new RuntimeSkillCreatorFacade({ skillExecutor: mockSkillExecutor });
  const result = await facade.plan('スキル仕様', 'api-key', 'test-api-key');
  expect(result).toMatchObject({
    success: false,
    error: { code: 'llm_adapter_unavailable' }
  });
  // 成功結果の形式（planId, skillName 等）は含まないこと
  expect(result).not.toHaveProperty('planId');
});

// ケース2: llmAdapter が未注入の場合、execute() は明示的エラーを返す
test('execute() returns explicit error when llmAdapter is not injected', async () => {
  const facade = new RuntimeSkillCreatorFacade({ skillExecutor: mockSkillExecutor });
  const planResult = { planId: 'test-plan', skillSpec: 'test', ... };
  const result = await facade.execute(planResult, 'api-key', 'test-api-key');
  expect(result).toMatchObject({
    success: false,
    error: { code: 'llm_adapter_unavailable' }
  });
});

// ケース3: resourceLoader が未注入の場合、plan() は明示的エラーを返す
test('plan() returns explicit error when resourceLoader is not injected', async () => {
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: mockSkillExecutor,
    llmAdapter: mockLlmAdapter
    // resourceLoader を注入しない
  });
  const result = await facade.plan('スキル仕様', 'api-key', 'test-api-key');
  expect(result).toMatchObject({
    success: false,
    error: { code: 'resource_loader_unavailable' }
  });
});

// ケース4: 正常注入の場合は通常の処理が実行される（回帰テスト）
test('plan() proceeds normally when all dependencies are injected', async () => {
  const facade = new RuntimeSkillCreatorFacade({
    skillExecutor: mockSkillExecutor,
    llmAdapter: mockLlmAdapter,
    resourceLoader: mockResourceLoader
  });
  // ... LLM のモックレスポンスを設定
  const result = await facade.plan('スキル仕様', 'api-key', 'test-api-key');
  expect(result).toHaveProperty('planId');
});
```

**実行コマンド（Red 確認）:**

```bash
pnpm --filter @repo/desktop test:run -- \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts
```

### Phase 3: バックエンド実装（スタブ排除）

**目標**: Phase 2 のテストを Green にする

**3-1: `execute()` への `buildDegradedError` 追加**

現状の `_executeInternal()` は `llmAdapter` の注入チェックを行っていない。`execute()` も `plan()` と同様のガードを追加する:

```typescript
// _executeInternal() の先頭に追加する
private async _executeInternal(
  planResult: SkillPlanResult,
  authMode: AuthMode,
  apiKey: string | null,
): Promise<SkillExecuteResponse> {
  // TASK-RT-02: スタブ応答排除 — 依存未注入チェック
  if (!this.llmAdapter && decision.type !== "terminal_handoff") {
    return buildDegradedError("llm_adapter_unavailable");
  }
  // ... 既存処理
}
```

注意: `terminal_handoff` の場合は LLMAdapter を使わないため、チェック対象外とする。

**3-2: `plan()` の既存チェックを確認・補完**

現状の `plan()` には以下のチェックが実装されている（確認のみ）:

```typescript
// TASK-RT-02: llmAdapter/resourceLoader 未注入時は explicit error を返す
if (!this.llmAdapter) {
  return buildDegradedError("llm_adapter_unavailable");
}
if (!this.resourceLoader && !this.hasDynamicResourcePipeline()) {
  return buildDegradedError("resource_loader_unavailable");
}
```

このチェックが `terminal_handoff` 分岐の後に正しく配置されているか確認する。

**3-3: `buildDegradedError` の型をレスポンス型と統一**

`buildDegradedError` が返す型が `RuntimeSkillCreatorPlanResponse` / `RuntimeSkillCreatorExecuteResponse` の union に正しく含まれているか `packages/shared/src/types/skillCreator.ts` で確認する。含まれていない場合は型定義を追加する。

### Phase 4: UI フィードバック実装

**目標**: `SkillLifecyclePanel` が Facade のエラーをユーザーに表示する

**4-1: エラーのルーティング確認**

`SkillLifecyclePanel.tsx` の plan/execute 呼び出し箇所を確認し、エラーレスポンス（`success: false`）をどのように処理しているかを確認する:

```bash
grep -n "success.*false\|generationError\|workflowError\|setGenerationError\|setWorkflowError" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

**4-2: エラー表示の追加または確認**

- `plan()` が `{ success: false, error: { code, message } }` を返した場合、`useSetGenerationError(error.message)` を呼ぶように修正する
- `execute()` が `{ success: false }` を返した場合（`executeResult.success === false`）、`useSetWorkflowError(error.message)` を呼ぶように修正する

**4-3: エラー表示 UI の確認**

`SkillLifecyclePanel.tsx` 内で `generationError` / `workflowError` が JSX として表示されているか確認する。表示されていない場合は、以下のいずれかを追加する:

- インライン表示: エラーメッセージをパネル内に赤文字で表示
- トースト通知: 既存の Toast コンポーネントを使用（トーストの仕組みがプロジェクトに存在する場合）
- リトライボタン: エラー表示とともに「再試行」ボタンを表示（UIの設計に合わせて判断）

**設計判断の原則**: 既存の UI パターンに合わせること。新規コンポーネントの追加は最小限にする。

### Phase 5: テスト拡充

**目標**: UI フィードバックの経路もテストで担保する

1. `SkillLifecyclePanel` のレンダリングテストを追加し、`plan()` がエラーを返した場合にエラー文言が画面に表示されることを確認する

```bash
# 既存テストの場所を確認
ls apps/desktop/src/renderer/components/skill/__tests__/
```

2. スタブ応答テスト（Phase 2）が全て Green であることを確認する

**実行コマンド:**

```bash
pnpm --filter @repo/desktop test:run -- \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts

pnpm --filter @repo/desktop test:run -- \
  src/renderer/components/skill/__tests__/
```

### Phase 6: 品質確認

**目標**: 型チェック・リント・全テストの通過

```bash
# 型チェック
pnpm --filter @repo/desktop typecheck

# リント
pnpm --filter @repo/desktop lint

# 関連テスト全体
pnpm --filter @repo/desktop test:run -- \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade
pnpm --filter @repo/desktop test:run -- \
  src/renderer/components/skill/__tests__/
pnpm --filter @repo/shared test:run -- \
  src/types/__tests__/skillCreator
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `plan()` が `llmAdapter` 未注入の場合、`{ success: false, error: { code: "llm_adapter_unavailable" } }` を返す
- [ ] `plan()` が `resourceLoader` 未注入（かつ dynamic pipeline も未設定）の場合、`{ success: false, error: { code: "resource_loader_unavailable" } }` を返す
- [ ] `execute()` が `llmAdapter` 未注入の場合、明示的エラーを返す（スタブ応答・空応答を返さない）
- [ ] `plan()` / `execute()` のスタブ応答経路が全て削除されている
- [ ] `SkillLifecyclePanel` が `plan()` / `execute()` のエラーレスポンスを受け取り、ユーザーに表示する
- [ ] エラー表示がユーザーに「何が問題か」を伝える内容になっている（`error.message` が表示される）

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop lint` が PASS
- [ ] `RuntimeSkillCreatorFacade.stub-elimination.test.ts` が PASS
- [ ] `SkillLifecyclePanel` の既存テストが回帰していない
- [ ] `packages/shared` の型テストが PASS

### スコープ外確認

- [ ] TASK-RT-01（LLMAdapter初期化エラー）の実装に影響していない
- [ ] TASK-RT-03（result/success 表示パネル）の実装に影響していない
- [ ] `DEGRADED_REASON_MESSAGES` の日本語文言は変更していない（i18n 対応は UT-RT-02-01 の責務）

---

## 6. 検証方法

### 6.1 ユニットテスト検証

```bash
# スタブ排除テスト
pnpm --filter @repo/desktop test:run -- \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.stub-elimination.test.ts

# plan() の既存テスト（回帰確認）
pnpm --filter @repo/desktop test:run -- \
  src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.plan.test.ts

# SkillLifecyclePanel の UI テスト
pnpm --filter @repo/desktop test:run -- \
  src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx

# shared の型テスト
pnpm --filter @repo/shared test:run -- \
  src/types/__tests__/skillCreator.contract-parity.test.ts
```

### 6.2 手動検証（Electron 起動後）

1. APIキーを設定せずにスキル作成を試みる → エラーメッセージが UI に表示されること
2. LLMAdapter が `initializing` 状態のままスキル作成を試みる → エラーメッセージが表示されること
3. 正常な APIキーを設定してスキル作成を試みる → スタブ排除後も正常に動作すること

---

## 7. リスクと対策

| リスク                                                              | 発生条件                                                                  | 対策                                                                                                                                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `execute()` への guard 追加で `terminal_handoff` が壊れる           | `terminal_handoff` では LLMAdapter を使わないが、guard の条件が誤っている | guard を追加する前に `terminal_handoff` の経路を確認し、`decision.type === "terminal_handoff"` の場合はガードをスキップする条件を先に書く                             |
| スタブ排除で既存テストが大量 Red になる                             | テストがスタブ応答を「正常系」として期待している                          | Phase 2 でテストを先に修正し、Phase 3 の実装と同時にテストを Green にする。既存テストで `buildDegradedError` の応答を「成功」として見ているものを先にリストアップする |
| UI エラー表示が既存の成功表示と競合する                             | `SkillLifecyclePanel` の状態機械が複雑で、エラーと成功が同時に表示される  | 修正前に `SkillLifecyclePanel` のエラー表示ロジックをコードリーディングし、既存の `generationError` 表示箇所に乗っかる形で追加する                                    |
| `SkillCreatorError` 型の新規定義が `packages/shared` の型に影響する | 型を追加することで既存のユニオン型が壊れる                                | 型変更は最小限にとどめ、既存の `RuntimeSkillCreatorDegradedReason` union を拡張する場合は `packages/shared` の型テストが全て Green であることを確認してから追加する   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                             | 用途                                                     |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `docs/30-workflows/unassigned-task/UT-RT-02-01-reason-code-i18n-standardization.md`      | reason code の i18n 対応（本タスクの後続タスク）         |
| `docs/30-workflows/unassigned-task/UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001.md` | AdapterStatus のリアルタイム更新（本タスクの後続タスク） |
| `docs/30-workflows/unassigned-task/UT-RT-02-I18N-ERROR-MESSAGE-001.md`                   | i18n エラーメッセージ（本タスクの後続タスク）            |

### 関連ファイル

| ファイル                                                               | 内容                                                   |
| ---------------------------------------------------------------------- | ------------------------------------------------------ |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`  | メイン実装（plan/execute/improve の Facade）           |
| `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` | ワークフロー状態管理                                   |
| `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`   | UI 側のエラー表示・状態管理                            |
| `packages/shared/src/types/skillCreator.ts`                            | エラー型定義（`RuntimeSkillCreatorDegradedReason` 等） |

### 苦戦箇所の記録

実装者が同じ問題に直面した際の参照として、以下に詳細を記録する。

#### 苦戦箇所 1: スタブ応答の定義と残存経路の特定困難

**問題の詳細:**

`RuntimeSkillCreatorFacade.ts` は 1,700 行を超える大型ファイルであり、`plan()` / `execute()` / `improve()` が 3 ロールに分かれた上に、`integrated_api` と `terminal_handoff` の 2 経路が交差している。さらに、コンストラクタで `_llmAdapterStatus` を `"initializing"` に設定し、`setLLMAdapter()` が呼ばれると `"ready"` に遷移する Setter Injection パターンが採用されている。

「スタブ応答」の定義が次の 3 つに分かれており、それぞれ異なる対処が必要:

1. **initializing 状態の即時エラー**: `_llmAdapterStatus === "initializing"` の場合に `plan()` が返す `{ success: false, error: { code: "llm_adapter_unavailable" } }` — これは正しいエラー形式であり、スタブではない。TASK-RT-01 の実装で対応済み。

2. **依存未注入エラー**: `!this.llmAdapter` / `!this.resourceLoader` の場合に `buildDegradedError()` が返す明示的エラー — `plan()` と `improve()` にはすでに実装済み。`execute()` の `_executeInternal()` には実装されていない可能性がある。

3. **処理ショートカットによる空応答**: LLM 呼び出しをスキップして空の `planResult` や `executeResult` を返す経路が残っていないか — コード上の `// graceful degradation` コメント周辺を注意して確認する。

**推奨する調査手順:**

```bash
# "graceful degradation" や "stub" を含むコメントを検索
grep -n "graceful\|stub\|degradat\|fallback" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts

# 各メソッドの return 文を列挙して、早期 return がどこにあるか確認
grep -n "^  \s*return\b" \
  apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts
```

#### 苦戦箇所 2: 「成功に見える失敗」パターンのテスト困難

**問題の詳細:**

スタブ応答は `{ success: true, planId: "", skillName: "" }` のように「成功形式だが空データ」という形をとる可能性がある。この場合、テストで `result.success === true` をチェックするだけでは検出できない。

また、`SkillExecutor.execute()` が空の `sdkMessages` を返した場合、`normalizeSkillCreatorSdkEvents()` は `eventType: "error"` のフォールバックイベントを返す仕様になっている（`RuntimeSkillCreatorFacade.ts` 1,735〜1,745 行付近）。これがスタブ排除のセーフティネットになっているが、UI 側でそのエラーイベントを正しく処理しているかは別途確認が必要。

**対処策:**

テストでは以下の assertion を組み合わせる:

```typescript
// 単純な success フラグだけでなく、データの存在も確認する
expect(result).toMatchObject({ success: false });
expect(result).not.toHaveProperty("planId"); // planId が存在する = 成功データ

// または discriminated union を活用
if ("planId" in result) {
  throw new Error("Expected error response but got plan result");
}
expect(result.error.code).toBe("llm_adapter_unavailable");
```

#### 苦戦箇所 3: UIへのフィードバック経路の設計判断

**問題の詳細:**

`SkillLifecyclePanel.tsx` には複数のエラー状態が存在する:

- `generationError`: plan/execute の失敗（Jotai atom 経由）
- `workflowError`: ワークフロー全体の失敗（Jotai atom 経由）
- `skillError`: スキル実行の失敗（Jotai atom 経由）

スタブ排除後に `plan()` / `execute()` が返すエラーをどの状態変数にセットするかの設計判断が必要。

**推奨方針:**

- `plan()` のエラー → `setGenerationError(error.message)` を呼ぶ
- `execute()` のエラー（`executeResult.success === false`）→ `setWorkflowError(error.message)` または `setGenerationError(error.message)` を呼ぶ（`SkillLifecyclePanel` の既存ロジックに合わせる）

どの atom を使うかは `SkillLifecyclePanel.tsx` の既存コードを読んで判断すること。既存の `setGenerationError` / `setWorkflowError` の呼び出しがどのケースで使われているかを確認し、それに倣う。

#### 苦戦箇所 4: UT-RT-02-01 / UT-RT-02-ADAPTER / UT-RT-02-I18N との重複リスク

**問題の詳細:**

以下の 3 つの関連タスクが既に未タスク登録済みであり、本タスクと実装対象が重なる箇所がある:

- `UT-RT-02-01-reason-code-i18n-standardization.md`: `DEGRADED_REASON_MESSAGES` の日本語文言を i18n 化する
- `UT-RT-02-ADAPTER-STATUS-REALTIME-SUBSCRIPTION-001.md`: ポーリングをサブスクリプションに変更する
- `UT-RT-02-I18N-ERROR-MESSAGE-001.md`: reason code と表示文言の責務分離

これらは全て「改善系（Low 優先度）」として backlog 管理されており、本タスク（バグ修正・高優先度）とは責務が異なる。

**対処策:**

- 本タスクでは `DEGRADED_REASON_MESSAGES` の内容を変更しない（i18n 対応は後続タスクの責務）
- reason code の文字列値（`"llm_adapter_unavailable"` 等）は変更しない
- スタブ排除のロジック追加のみを行い、メッセージ文言の変更は行わない

---

## 9. 備考

- 本タスクは P0是正パックの Step 08 として位置づけられており、他の P0 タスク（TASK-RT-01/03/04）と並列実行が可能
- `buildDegradedError()` ヘルパーは `RuntimeSkillCreatorFacade.ts` のモジュールスコープに定義されており、エクスポートされていないため、テストから直接呼ぶことはできない。Facade インスタンスを通じて間接的にテストする
- 将来の担当者へ: reason code の表示文言（日本語ハードコード）は意図的に残してある。i18n 対応は `UT-RT-02-01-reason-code-i18n-standardization.md` を参照すること
- `SkillCreatorWorkflowEngine.ts` 内のスタブ確認を怠らないこと。ファサードだけでなく、エンジン側でもスタブデータが注入される経路がないかをフルコードリーディングで確認する

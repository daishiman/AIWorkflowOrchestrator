---
task_id: TASK-RALLY-008
task_name: processWorkflowOutcomeのfire-and-forget不整合修正
task_type: NON_VISUAL
category: improvement
status: not_started
current_phase: 1
created_date: 2026-04-21
---

# TASK-RALLY-008: processWorkflowOutcomeのfire-and-forget不整合修正

## メタ情報

| 項目                | 値                                                               |
| ------------------- | ---------------------------------------------------------------- |
| タスクID            | TASK-RALLY-008                                                   |
| 機能名              | スキルクリエイター ラリー機能 processWorkflowOutcome呼び出し統一 |
| 作成日              | 2026-04-21                                                       |
| 実行形態            | seq                                                              |
| 依存タスク          | TASK-RALLY-006完了後                                             |
| 衝突ドメイン        | SkillLifecyclePanelドメイン                                      |
| implementation_mode | new                                                              |

## 目的

`SkillLifecyclePanel.tsx` 内で `processWorkflowOutcome` が呼ばれる箇所が複数あり、`handleExecutePlan` では `await` 付きで呼ばれているのに対し、useEffect 内では `void`（fire-and-forget）として呼ばれている。

この不整合により以下の問題が発生する：

- fire-and-forget 箇所ではエラーが発生しても UI にエラー状態が反映されない
- エラー処理タイミングと状態更新順序が呼び出し箇所によって異なる
- RALLY-005 で確立した isSubmitting フラグ管理と連携したエラーハンドリングが fire-and-forget 箇所では機能しない

本タスクでは useEffect 内の fire-and-forget 呼び出しをすべて `await` ベースに統一するか、明示的なエラーハンドリングを追加することで呼び出し契約の一貫性を確立する。

## スコープ

### 含む

- `SkillLifecyclePanel.tsx` 内の `processWorkflowOutcome` の全呼び出し箇所の確認
- useEffect 内の fire-and-forget 呼び出しを await ベースまたは明示的エラーハンドリングに変更
- 変更箇所に `try/catch` を追加し `setError`（または `setWorkflowError`）でエラーを UI に反映する
- 変更後の呼び出し一覧にコメントで「正規の呼び出しパターン」を明示する

### 含まない

- `processWorkflowOutcome` 関数自体の実装変更
- `handleExecutePlan` の変更（既に await 付きのため対象外）
- `SkillLifecyclePanel.tsx` 以外のファイルの変更
- commit / push / PR 実行

## Phase 1: 要件定義

### 受け入れ基準

- AC-1: `processWorkflowOutcome` の全呼び出し箇所が await ベースまたは明示的 catch 付きに統一されていること
- AC-2: useEffect 内の呼び出しで `processWorkflowOutcome` がエラーを throw した場合、`setError`（または `setWorkflowError`）が呼ばれて UI にエラー状態が反映されること
- AC-3: fire-and-forget（`void processWorkflowOutcome(...)`）の形式が残存していないこと
- AC-4: `pnpm typecheck` がエラーなしで通過すること
- AC-5: `pnpm lint` がエラーなしで通過すること

### P50チェック

対象ファイルの現状実装を確認する：

```bash
# processWorkflowOutcome の全呼び出し箇所を確認
grep -n "processWorkflowOutcome" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# void キーワードで呼ばれている箇所を確認（fire-and-forget の候補）
grep -n "void processWorkflowOutcome\|void.*processWorkflow" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx

# setError / setWorkflowError の現状確認
grep -n "setError\|setWorkflowError\|toErrorMessage" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx | head -20

# processWorkflowOutcome の関数定義を確認
grep -n "const processWorkflowOutcome\|function processWorkflowOutcome\|processWorkflowOutcome =" \
  apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx
```

## Phase 2: 設計

### 変更箇所

#### 変更パターン（useEffect 内の fire-and-forget を await に統一）

```typescript
// 変更前（fire-and-forget）
useEffect(() => {
  if (someCondition) {
    processWorkflowOutcome(outcome); // エラーが握りつぶされる
  }
}, [someCondition]);

// 変更後（await + 明示的エラーハンドリング）
useEffect(() => {
  if (!someCondition) return;

  const run = async () => {
    try {
      await processWorkflowOutcome(outcome);
    } catch (error) {
      setWorkflowError(
        error instanceof Error
          ? error.message
          : "ワークフロー処理中にエラーが発生しました。",
      );
    }
  };
  void run();
}, [someCondition]);
```

**設計方針の根拠**：

- useEffect 内では `async` 関数を直接渡せないため、内部に `async` 関数を定義して呼ぶパターン（`const run = async () => {...}; void run();`）を採用する
- `void run()` の `void` は ESLint の `@typescript-eslint/no-floating-promises` を抑制するための意図的な記述であり、fire-and-forget ではない
- `processWorkflowOutcome` のエラーは `setWorkflowError` または既存のエラー state セッター経由で UI に反映する
- RALLY-005 で確立した `isSubmitting` フラグ管理との整合を保つため、`processWorkflowOutcome` の await 中も適切な isSubmitting 状態管理を行う

### 注意事項

実装前に `processWorkflowOutcome` の関数シグネチャ（戻り値が `Promise<void>` か `void` かどうか）を確認する。戻り値が `void` の場合は `await` の追加に意味がないため、明示的な `.catch()` ハンドラを追加する形に変更する。

### 検証方法

1. `grep -n "void processWorkflowOutcome"` で fire-and-forget が残っていないことを確認
2. 単体テストで `processWorkflowOutcome` が reject した場合に `setWorkflowError` が呼ばれることを確認
3. `pnpm typecheck` でエラーなしを確認
4. `pnpm lint` でエラーなしを確認

## Phase 3: 実装計画

1. `processWorkflowOutcome` の全呼び出し箇所を grep で特定する
2. 各呼び出し箇所を分類する（既に await 付き / fire-and-forget / その他）
3. fire-and-forget 箇所を `async run()` パターンに書き換える
4. `try/catch` を追加し `setWorkflowError` でエラーを反映する
5. 変更箇所に「正規の呼び出しパターン」コメントを追加する
6. 単体テストを作成または更新する
7. `pnpm typecheck` と `pnpm lint` を実行して品質を確認する

## Phase 4: テスト設計

### 単体テスト（Vitest）

テスト対象: `SkillLifecyclePanel.tsx` の `processWorkflowOutcome` 呼び出し箇所

| テストケース | 内容                                                                | 期待結果                             |
| ------------ | ------------------------------------------------------------------- | ------------------------------------ |
| TC-1         | handleExecutePlan 経由で processWorkflowOutcome が正常完了する      | エラー state が更新されない          |
| TC-2         | handleExecutePlan 経由で processWorkflowOutcome が reject する      | setError/setWorkflowError が呼ばれる |
| TC-3         | useEffect 内で processWorkflowOutcome が正常完了する                | エラー state が更新されない          |
| TC-4         | useEffect 内で processWorkflowOutcome が reject する                | setWorkflowError が呼ばれる          |
| TC-5         | 全呼び出し箇所で void processWorkflowOutcome の形式が使われていない | コードレビューまたは grep で確認     |

## Phase 5: 実装

Phase 3 の手順に従い実装する。

実装時の注意点：

- `processWorkflowOutcome` が同期関数（`void` 型）である場合は `await` を追加せず `.catch()` を使う
- useEffect 内の `async run()` パターンのクリーンアップ（アンマウント後の state 更新防止）が必要かどうかを既存コードのパターンに合わせて判断する
- RALLY-006 で修正された依存配列との整合を確認する

## Phase 12: ドキュメント

### 変更内容のドキュメント化

- 変更した useEffect のインラインコメントに「async run() パターンを使う理由（useEffect では async 関数を直接渡せないため）」を追記する
- `processWorkflowOutcome` の呼び出し箇所に「正規パターン：await + try/catch」コメントを追加する

中学生レベルの概念説明：

「fire-and-forget（撃ちっぱなし）」とは、処理を開始したあとその結果を気にしないプログラムの書き方です。手紙を送ったけど返事を待たない、という状態です。問題は、もし手紙の配達中に問題が起きても誰も知らせてくれないことです。`await` を使うと処理が終わるまで待ってから次に進めます。`try/catch` を使うと「もし失敗したらこれをする」と書けます。本タスクでは「撃ちっぱなし」のコードを「ちゃんと待って、失敗したらエラーを表示する」コードに統一します。

## Phase 13: 完了確認

### 完了条件

- [ ] `processWorkflowOutcome` の全呼び出し箇所が特定・分類されている
- [ ] useEffect 内の fire-and-forget 呼び出しが `async run()` + `try/catch` パターンに変更されている
- [ ] `setWorkflowError` によるエラー反映が実装されている
- [ ] `void processWorkflowOutcome(...)` の形式が残存していない
- [ ] 単体テスト TC-1〜TC-5 がすべて PASS している
- [ ] `pnpm typecheck` がエラーなしで通過している
- [ ] `pnpm lint` がエラーなしで通過している

### タスク100%実行確認【必須】

- [ ] Phase 1〜12 完了
- [ ] 受け入れ基準 AC-1〜AC-5 全PASS
- [ ] RALLY-005 および RALLY-006 が完了していることを確認してから本タスクに着手していること

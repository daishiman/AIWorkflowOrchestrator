# Phase 2: 設計

## メタ情報

| 項目       | 値                                                |
| ---------- | ------------------------------------------------- |
| Phase      | 2                                                 |
| 機能名     | TASK-RALLY-008                                    |
| タスク名   | processWorkflowOutcomeのfire-and-forget不整合修正 |
| 前提Phase  | Phase 1                                           |
| 後続Phase  | Phase 3                                           |
| 作成日     | 2026-04-21                                        |
| ステータス | pending                                           |

## 目的

useEffect内のfire-and-forget呼び出しを`async IIFE + try/catch`パターンに統一する設計を確定する。

## 実行タスク（直列）

- Phase 1のコード調査結果をもとに変更箇所を確定する
- `async run()`パターンの設計を定義する
- `setWorkflowError`によるエラー反映パターンを設計する
- RALLY-005で確立した`isSubmitting`フラグ管理との整合を確認する
- 設計判断の根拠を文書化する

## 設計内容

### 問題

`SkillLifecyclePanel.tsx`内でuseEffect内の`void processWorkflowOutcome(...)`が
fire-and-forgetになっており、エラーが握り潰される。
`handleExecutePlan`では`await`付きで呼ばれており一貫性がない。

### 変更パターン（useEffect内のfire-and-forgetをawaitに統一）

```typescript
// 変更前（fire-and-forget）
useEffect(() => {
  if (someCondition) {
    void processWorkflowOutcome(outcome); // エラーが握り潰される
  }
}, [someCondition]);

// 変更後（async run() + 明示的エラーハンドリング）
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

### 設計判断の根拠

- useEffect内では`async`関数を直接渡せないため、内部に`async`関数を定義して呼ぶパターン（`const run = async () => {...}; void run();`）を採用する
- `void run()`の`void`はESLintの`@typescript-eslint/no-floating-promises`を抑制するための意図的な記述であり、fire-and-forgetではない
- `processWorkflowOutcome`のエラーは`setWorkflowError`または既存のエラーstateセッター経由でUIに反映する
- RALLY-005で確立した`isSubmitting`フラグ管理との整合を保つため、`processWorkflowOutcome`のawait中も適切な状態管理を行う

### 注意事項

実装前に`processWorkflowOutcome`の関数シグネチャ（戻り値が`Promise<void>`か`void`かどうか）を確認する。
戻り値が`void`の場合は`await`の追加に意味がないため、明示的な`.catch()`ハンドラを追加する形に変更する。

## 参照資料

| 資料名           | パス                                                                   | 用途              |
| ---------------- | ---------------------------------------------------------------------- | ----------------- |
| 要件定義書       | `outputs/phase-1/requirements-definition.md`                           | Phase 1成果物     |
| 受け入れ基準     | `outputs/phase-1/acceptance-criteria.md`                               | Phase 1成果物     |
| コード調査結果   | `outputs/phase-1/code-investigation.md`                                | Phase 1成果物     |
| 設計ドキュメント | `docs/30-workflows/00-task-spec-design-docs/rally-phase-2-solution.md` | RALLY-008設計方針 |

## 成果物

| 成果物                 | パス                                       | 説明                         |
| ---------------------- | ------------------------------------------ | ---------------------------- |
| アーキテクチャ設計     | `outputs/phase-2/design-spec.md`           | 変更前後の詳細設計           |
| エラーハンドリング設計 | `outputs/phase-2/error-handling-design.md` | setWorkflowError反映パターン |

## 完了条件

- [ ] 変更前後のコード設計が文書化されていること
- [ ] `async run()`パターンの設計が確定していること
- [ ] `setWorkflowError`によるエラー反映パターンが確定していること
- [ ] RALLY-005の`isSubmitting`フラグ管理との整合が確認されていること
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 3: 設計レビューゲート

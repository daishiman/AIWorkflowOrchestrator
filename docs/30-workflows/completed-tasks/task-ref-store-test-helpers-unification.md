# Store Hooksテストヘルパー関数共通化 - タスク指示書

## メタ情報

| 項目         | 内容                                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| タスクID     | task-ref-store-test-helpers-001                                                 |
| タスク名     | Store Hooksテストヘルパー関数共通化（3 Slice横断）                              |
| 分類         | リファクタリング                                                                |
| 対象機能     | Store Hooksセレクタテスト（agentSlice / authModeSlice / llmSlice）              |
| 優先度       | 低                                                                              |
| 見積もり規模 | 中規模                                                                          |
| ステータス   | 未実施                                                                          |
| 発見元       | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 12（実装苦戦箇所・パターン統一の気付き） |
| 発見日       | 2026-02-12                                                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-STORE-HOOKS-TEST-REFACTOR-001でagentSliceのテストをrenderHookパターンに移行する際、3つのテストヘルパー関数（`assertStableReference`, `assertNoInfiniteLoop`, `assertNoUnrelatedRerender`）を新規設計した。これらのヘルパーは、テストの冗長性を排除し、約226行の重複コードを約21行に削減した。

Phase 10最終レビューでは、3つのSliceテスト間のパターン統一状態を確認し、以下の差異が確認された:

| パターン             | agentSlice                          | authModeSlice                    | llmSlice                         |
| -------------------- | ----------------------------------- | -------------------------------- | -------------------------------- |
| 参照安定性テスト     | `assertStableReference`ヘルパー     | インライン `rerender` + `toBe`   | インライン `rerender` + `toBe`   |
| 無限ループテスト     | `assertNoInfiniteLoop`ヘルパー      | インライン `renderCount` + `MAX` | インライン `renderCount` + `MAX` |
| 再レンダー隔離テスト | `assertNoUnrelatedRerender`ヘルパー | なし（未実装）                   | なし（未実装）                   |

### 1.2 問題点・課題

| 問題                       | 詳細                                                                                                                                         |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| テストコードの重複         | authModeSlice/llmSliceの参照安定性・無限ループテストがインラインで記述されており、agentSliceのヘルパー関数と同等の処理を冗長に繰り返している |
| パターン統一の不完全       | agentSliceでは3ヘルパーによる抽象化が完了しているが、他2ファイルは旧来のインラインパターンのまま                                             |
| 再レンダー隔離テストの欠如 | authModeSlice/llmSliceには `assertNoUnrelatedRerender` 相当のテストが存在せず、無関係な状態変更による再レンダーの検証が不足                  |
| メンテナンスコスト         | テストパターン変更時に3ファイル個別に修正が必要                                                                                              |

### 1.3 放置した場合の影響

- テストパターンの変更が必要な際（Vitest/React Testing Libraryバージョンアップ等）、3ファイル個別に修正が必要でリグレッションリスクが増大
- 新規Slice追加時に「どのパターンを参考にすべきか」が不明確になる
- authModeSlice/llmSliceの再レンダー最適化の品質保証が不十分なまま

---

## 2. 何を達成するか（What）

### 2.1 目的

agentSliceで実証された3つのテストヘルパー関数を共通ユーティリティとして抽出し、3つのSliceセレクタテスト全てで統一使用することで、テストコードの重複排除とパターン統一を完了する。

### 2.2 最終ゴール

- 3つのヘルパー関数（`assertStableReference`, `assertNoInfiniteLoop`, `assertNoUnrelatedRerender`）が共通テストユーティリティファイルに定義されている
- authModeSlice.selectors.test.ts, llmSlice.selectors.test.tsのインラインテストパターンが共通ヘルパーに置換されている
- authModeSlice/llmSliceに `assertNoUnrelatedRerender` テストが追加されている
- 全208テスト（+追加テスト分）がPASS

### 2.3 スコープ

#### 含むもの

- テストヘルパー関数の共通ユーティリティファイル作成
- authModeSlice.selectors.test.tsのインラインパターン → ヘルパー呼び出しへの置換
- llmSlice.selectors.test.tsのインラインパターン → ヘルパー呼び出しへの置換
- authModeSlice/llmSliceへの `assertNoUnrelatedRerender` テスト追加
- 全テストのPASS確認

#### 含まないもの

- プロダクションコードの変更
- agentSlice.selectors.test.tsの変更（ヘルパーimport元の変更のみ）
- テストロジックの変更（リファクタリングのみ）
- 新規テストカテゴリの追加（既存CAT-05/06/07相当のテスト移行のみ）
- TASK-IMP-VITEST-UTILS-001（広範なVitestユーティリティ整備）のスコープ

### 2.4 成果物

| 成果物                      | パス                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| 共通テストヘルパー          | `apps/desktop/src/renderer/store/slices/__tests__/helpers/store-test-helpers.ts`                  |
| 修正済みagentSliceテスト    | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`（import変更のみ） |
| 修正済みauthModeSliceテスト | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts`                |
| 修正済みllmSliceテスト      | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`                     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-STORE-HOOKS-TEST-REFACTOR-001が完了していること
- task-ref-vitest-env-directive-001が完了していること（推奨だが必須ではない）
- pnpm installが完了していること

### 3.2 依存タスク

| タスクID                          | タスク名                                | ステータス               |
| --------------------------------- | --------------------------------------- | ------------------------ |
| UT-STORE-HOOKS-TEST-REFACTOR-001  | Store HooksテストrenderHookパターン移行 | 完了                     |
| task-ref-vitest-env-directive-001 | Vitest環境ディレクティブ標準化          | 未実施（推奨先行タスク） |

### 3.3 必要な知識

- renderHookパターン（`@testing-library/react`）
- Zustandの参照安定性メカニズム（`Object.is()` 比較）
- useEffect依存配列とP31無限ループ問題
- 参照: [testing-component-patterns.md#9](../../.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md) - Zustand Store Hooksテストパターン
- 参照: [arch-state-management.md](../../.claude/skills/aiworkflow-requirements/references/arch-state-management.md) - Store Hooksテスト実装ガイド

### 3.4 推奨アプローチ

#### Step 1: 共通ヘルパーファイル作成

agentSlice.selectors.test.ts内の3ヘルパー関数を、ジェネリック型対応の共通ファイルに抽出する:

```typescript
// store-test-helpers.ts
import { renderHook, act } from "@testing-library/react";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../../index";
import type { AppStore } from "../../../index";

export async function assertNoInfiniteLoop(
  selector: (state: AppStore) => unknown,
  maxRenders = 10,
): Promise<void> {
  const renderCount = { current: 0 };
  renderHook(() => {
    renderCount.current++;
    const action = useAppStore(selector);
    const initRef = useRef(false);
    useEffect(() => {
      if (!initRef.current) {
        initRef.current = true;
      }
    }, [action]);
    return { renderCount: renderCount.current };
  });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 100));
  });
  expect(renderCount.current).toBeLessThan(maxRenders);
}

export function assertStableReference(
  selector: (state: AppStore) => unknown,
): void {
  const { result, rerender } = renderHook(() => useAppStore(selector));
  const firstRef = result.current;
  rerender();
  expect(result.current).toBe(firstRef);
}

export function assertNoUnrelatedRerender(
  selector: (state: AppStore) => unknown,
  stateUpdate: Partial<AppStore>,
): void {
  let renderCount = 0;
  renderHook(() => {
    renderCount++;
    return useAppStore(selector);
  });
  const initialCount = renderCount;
  act(() => {
    useAppStore.setState(stateUpdate);
  });
  expect(renderCount).toBe(initialCount);
}
```

#### Step 2: 各テストファイルのインラインコード置換

authModeSlice/llmSliceのインラインパターンをヘルパー呼び出しに置換する。

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                     | 発見経緯                                                                                | 解決策                                                                 | 教訓                                                                     |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| ヘルパー関数のジェネリック型設計         | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 5でagentSlice固有の型が混入                      | `AppStore` 型をベースにジェネリックにし、Slice固有型を排除             | 共通ヘルパーは最大公約数の型で設計する                                   |
| createMockElectronAPI()の3セクション必須 | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 5でuseAppStore初期化エラー                       | 共通ヘルパーが依存するuseAppStoreの初期化には全3セクションモックが必要 | テストヘルパーの前提条件（モック設定）をドキュメント化する               |
| renderHookの実行コンテキスト             | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 5で `act()` ワーニング                           | 非同期処理は必ず `await act(async () => {...})` で囲む                 | Testing Library のact()ルールを厳守する                                  |
| assertNoInfiniteLoopのsetTimeout(100ms)  | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 11で実行時間分析                                 | CAT-07/16の10テストで各100ms使用、合計約1,000msのオーバーヘッド        | テスト実行時間への影響を考慮し、maxRendersのデフォルト値を適切に設定する |
| Phase 12 Step 2の「該当なし」誤判定      | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 12でテスト方法論変更が「テスト追加のみ」と誤分類 | spec-update-workflow.mdに「テスト戦略変更」カテゴリを追加（解決済み）  | テストリファクタリングでも方法論が変わる場合はシステム仕様書更新が必要   |
| テストカテゴリテーブルの不整合           | UT-STORE-HOOKS-TEST-REFACTOR-001 Phase 12で実装ガイドのテスト数が実測値と不一致         | Phase 6後のテスト数を再集計してテーブル更新                            | 実装ガイドのテストカテゴリテーブルは必ずPhase 6後の実測値を使用する      |

---

## 4. 実行手順

### Phase構成

中規模タスクのため、Phase 4-5-6-9の構成で実行。

### Phase 4: テスト作成（Red）

#### 目的

共通ヘルパー関数のテストと、移行後のテスト構成を設計する。

#### 手順

1. `store-test-helpers.ts` のユニットテスト（ヘルパー関数自体のテスト）を設計
2. authModeSlice/llmSliceに追加する `assertNoUnrelatedRerender` テストケースを設計
3. 移行対象のインラインパターンを特定（grep）

#### 成果物

テスト設計書

#### 完了条件

- 移行対象のインラインパターンが全て特定されている
- 追加テストケースが設計されている

### Phase 5: 実装（Green）

#### 目的

共通ヘルパーファイルを作成し、3ファイルのテストを移行する。

#### 手順

1. `helpers/store-test-helpers.ts` を作成（3ヘルパー + 型定義）
2. agentSlice.selectors.test.tsのヘルパー定義を共通ファイルからのimportに置換
3. authModeSlice.selectors.test.tsのインラインパターンをヘルパー呼び出しに置換
4. llmSlice.selectors.test.tsのインラインパターンをヘルパー呼び出しに置換
5. authModeSlice/llmSliceに `assertNoUnrelatedRerender` テストを追加
6. 全テストの実行・PASS確認

#### 成果物

共通ヘルパーファイル + 修正済み3テストファイル

#### 完了条件

- 全テスト（208 + 追加分）がPASS
- インラインパターンが0件

### Phase 6: テスト拡充

#### 目的

カバレッジ不足箇所を特定し、追加テストを作成する。

#### 手順

1. ヘルパー関数のエッジケーステスト追加（maxRendersの境界値等）
2. authModeSlice/llmSliceの `assertNoUnrelatedRerender` テストを全状態フィールドに拡張
3. カバレッジ確認

#### 成果物

拡充済みテストファイル

#### 完了条件

- Branch Coverage 60%以上

### Phase 9: 品質検証

#### 目的

Lint・型チェック・全テスト実行で品質を確認する。

#### 手順

1. `pnpm --filter @repo/desktop lint` でLintエラーなしを確認
2. `pnpm --filter @repo/desktop typecheck` で型エラーなしを確認
3. 全テスト実行でリグレッションなしを確認
4. テスト実行時間が+20%以内であることを確認

#### 成果物

品質検証結果

#### 完了条件

- Lint: 0 errors
- TypeCheck: 0 errors（タスクスコープ内）
- 全テスト: PASS
- テスト実行時間: +20%以内

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `helpers/store-test-helpers.ts` に3ヘルパー関数が定義されている
- [ ] agentSlice.selectors.test.tsが共通ヘルパーをimportしている
- [ ] authModeSlice.selectors.test.tsのインラインパターンが共通ヘルパーに置換されている
- [ ] llmSlice.selectors.test.tsのインラインパターンが共通ヘルパーに置換されている
- [ ] authModeSliceに `assertNoUnrelatedRerender` テストが追加されている
- [ ] llmSliceに `assertNoUnrelatedRerender` テストが追加されている
- [ ] 全テストがPASS

### 品質要件

- [ ] ESLintエラー: 0件
- [ ] TypeScriptエラー: 0件（タスクスコープ内）
- [ ] Branch Coverage: 60%以上
- [ ] テスト実行時間: 既存比+20%以内

### ドキュメント要件

- [ ] Phase 12実装ガイド作成（ヘルパー関数の使い方・拡張方法）
- [ ] testing-component-patterns.mdに共通ヘルパー参照を追加
- [ ] documentation-changelog.md作成

---

## 6. 検証方法

### テストケース

| #   | テストケース                                                                                            | 期待結果          |
| --- | ------------------------------------------------------------------------------------------------------- | ----------------- |
| 1   | `cd apps/desktop && npx vitest run src/renderer/store/slices/__tests__/`                                | 全テストPASS      |
| 2   | agentSlice内にインラインのassertStableReference/assertNoInfiniteLoop/assertNoUnrelatedRerender定義が0件 | grep結果: 0件     |
| 3   | authModeSliceにassertStableReferenceヘルパー使用箇所が存在                                              | grep結果: 1件以上 |
| 4   | llmSliceにassertStableReferenceヘルパー使用箇所が存在                                                   | grep結果: 1件以上 |
| 5   | authModeSliceにassertNoUnrelatedRerenderテストが存在                                                    | grep結果: 1件以上 |
| 6   | llmSliceにassertNoUnrelatedRerenderテストが存在                                                         | grep結果: 1件以上 |

### 検証手順

1. 上記6つのテストケースを順次実行
2. 全てが期待結果と一致することを確認
3. テスト実行時間を計測し、既存比+20%以内であることを確認

---

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                                            |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| ヘルパー関数のimport循環                           | 中     | 低       | helpers/ディレクトリに配置し、テストファイルからの一方向依存を維持              |
| AppStore型の変更による全テスト影響                 | 中     | 低       | 共通ヘルパーのジェネリック型でSlice固有型を排除、型テストを含める               |
| テスト実行時間の増加                               | 低     | 中       | assertNoInfiniteLoopのsetTimeout(100ms)の使用回数を監視、maxRendersを適切に設定 |
| authModeSlice/llmSliceのインラインパターン特定漏れ | 中     | 低       | grep -n で全パターンを事前特定し、置換チェックリストを作成                      |
| P9（テスト間状態リーク）の再発                     | 中     | 低       | beforeEachでのresetStore()実行を共通ヘルパーの前提条件として明記                |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                                          | 関連セクション                               |
| ---------------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| テストパターン         | `aiworkflow-requirements/references/testing-component-patterns.md`                            | 9. Zustand Store Hooksテストパターン         |
| 開発ガイドライン       | `aiworkflow-requirements/references/development-guidelines.md`                                | Zustand Hookテスト戦略（renderHookパターン） |
| 状態管理アーキテクチャ | `aiworkflow-requirements/references/arch-state-management.md`                                 | Store Hooksテスト実装ガイド                  |
| 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md`                                                          | P9, P31                                      |
| 実装ガイド             | `docs/30-workflows/UT-STORE-HOOKS-TEST-REFACTOR-001/outputs/phase-12/implementation-guide.md` | ヘルパー関数の設計                           |
| lessons-learned        | `aiworkflow-requirements/references/lessons-learned.md`                                       | 苦戦箇所1-6                                  |

### 参考資料

| 資料                                                  | 参照先                                                                             |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| agentSliceヘルパー実装                                | `apps/desktop/src/renderer/store/slices/__tests__/agentSlice.selectors.test.ts`    |
| authModeSliceインラインパターン                       | `apps/desktop/src/renderer/store/slices/__tests__/authModeSlice.selectors.test.ts` |
| llmSliceインラインパターン                            | `apps/desktop/src/renderer/store/slices/__tests__/llmSlice.selectors.test.ts`      |
| TASK-IMP-VITEST-UTILS-001（広範なユーティリティ整備） | `docs/30-workflows/unassigned-task/task-imp-vitest-utils-001.md`                   |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 10最終レビュー結果（UT-STORE-HOOKS-TEST-REFACTOR-001）より:

タスク1 - 1.5 3つのSliceテスト間のパターン統一:

| パターン項目 | agentSlice | authModeSlice | llmSlice | 統一状態 |
|------------|-----------|-----------|---------|---------|
| 参照安定性テスト | assertStableReference | rerender比較(インライン) | rerender比較(インライン) | 統一済※ |
| 無限ループテスト | assertNoInfiniteLoop | renderCount+MAX(インライン) | renderCount+MAX(インライン) | 統一済※ |

※agentSliceはヘルパー関数による抽象化だが、内部ロジックは同一パターン

→ 「統一済」と判定されたが、コードレベルでは抽象化度合いに差異がある。
  完全な統一には共通ヘルパーへの移行が必要。
```

### 補足事項

- このタスクはTASK-IMP-VITEST-UTILS-001（広範なVitestユーティリティ整備）の部分的な先行実装として位置づけられる
- プロダクションコードに変更を加えない（テストファイルのみ）
- 共通ヘルパーの設計はagentSlice.selectors.test.tsの実装をベースとするため、設計リスクは低い
- assertNoUnrelatedRerenderテストの追加により、authModeSlice/llmSliceの再レンダー最適化の品質保証が強化される

### 関連未タスクとの関係

| タスクID                          | 関係                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| TASK-IMP-VITEST-UTILS-001         | 本タスクはStore Hooks固有のヘルパーに限定。VITEST-UTILS-001はプロジェクト全体のテストユーティリティ |
| task-ref-vitest-env-directive-001 | 推奨先行タスク（環境設定の統一を先に行うとスムーズ）                                                |
| UT-STORE-HOOKS-REFACTOR-002       | JSDoc追加は本タスク完了後に実施可能（依存なし）                                                     |

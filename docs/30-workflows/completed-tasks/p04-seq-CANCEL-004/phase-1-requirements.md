# Phase 1: 要件定義

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| タスクID   | TASK-SW-CANCEL-004                       |
| 機能名     | skill-creator-cancel-renderer-hook       |
| 前提Phase  | -（TASK-SW-CANCEL-003 完了が前提）       |
| 後続Phase  | Phase 2                                  |
| 作成日     | 2026-04-15                               |
| ステータス | completed（current worktree で実装済み） |

## 目的

`apps/desktop/src/renderer/hooks/useCancelGeneration.ts` の現状を確認し、`cancelGeneration()` への IPC 呼び出し追加の要件と受け入れ基準を固定する。

> **追記（2026-04-16）**: current worktree では `cancelGeneration()` の async 化と IPC 呼び出し、ならびに cancel-like error の抑制まで実装済み。以下は当時の要件定義として保持している。

## 背景

`useCancelGeneration.ts` の `cancelGeneration()` は現在 Renderer 内の `AbortController.abort()` と `setStage("cancelled")` を呼び出すのみ。IPC 経由でメインプロセスに通知する仕組みがなく、バックグラウンド処理が継続する問題がある。TASK-SW-CANCEL-001〜003 により IPC 4層の基盤が整備されたため、本タスクで Renderer 側の呼び出しを追加することで問題が解消される。

> **実装状態メモ（2026-04-16時点）**: current worktree では `cancelGeneration` の async 化、`await window.skillCreatorAPI?.cancelGeneration?.()`、IPC 失敗の swallow まで実装済み。`SkillCreateWizard` と store 側の cancel-like error 分岐も含めて、Renderer からの cancel 動作は current facts に追従している。

## 実行タスク

- P50チェック: `cancelGeneration()` の現状コード確認
- `window.skillCreatorAPI?.cancelGeneration` の利用可否確認
- `cancelGeneration()` の非同期化の要否確認
- 受け入れ基準（AC-1〜AC-4）の固定

## 参照資料

| 資料名                 | パス                                                             | 用途                     |
| ---------------------- | ---------------------------------------------------------------- | ------------------------ |
| useCancelGeneration.ts | `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`         | 現行コードの確認         |
| 解決策設計書           | `docs/30-workflows/00-task-spec-design-docs/phase-2-solution.md` | 問題2解決アプローチD参照 |
| 問題分析書             | `docs/30-workflows/00-task-spec-design-docs/phase-1-analysis.md` | 問題2の詳細分析          |

## 実行手順

### 0. P50チェック: 既実装状態の調査（必須）

```bash
# cancelGeneration が既に IPC を呼び出していないか確認
grep -n "skillCreatorAPI\|cancelGeneration\|ipc" \
  apps/desktop/src/renderer/hooks/useCancelGeneration.ts

# 現行の cancelGeneration 実装全体を確認
cat apps/desktop/src/renderer/hooks/useCancelGeneration.ts
```

### 1. window.skillCreatorAPI 型確認

```bash
# window.skillCreatorAPI の型定義確認
grep -n "skillCreatorAPI" apps/desktop/src/preload/types.ts | head -5

# cancelGeneration の型（CANCEL-002 追加済みか確認）
grep -n "cancelGeneration" apps/desktop/src/preload/skill-creator-api.ts
```

### 2. cancelGeneration の呼び出し元確認

```bash
# cancelGeneration フック が呼び出されている箇所
grep -rn "cancelGeneration\|useCancelGeneration" \
  apps/desktop/src/renderer/ | grep -v ".test.ts"
```

### 3. 受け入れ基準の固定

| ID   | 受け入れ基準                                                                            | 検証方法                                                             |
| ---- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| AC-1 | `cancelGeneration()` が `window.skillCreatorAPI?.cancelGeneration?.()` を呼び出している | `grep -n "skillCreatorAPI.*cancelGeneration" useCancelGeneration.ts` |
| AC-2 | IPC 呼び出しは既存の `abort()` と `setStage("cancelled")` の後または並行で実行される    | コードレビュー                                                       |
| AC-3 | `cancelGeneration()` がエラーなく動作する（IPC 呼び出し失敗が UI に影響しない）         | テストで検証                                                         |
| AC-4 | `pnpm typecheck` が PASS する                                                           | `pnpm --filter @repo/desktop typecheck`                              |

## 統合テスト連携【必須】

| 判定項目                            | 基準 | 結果    |
| ----------------------------------- | ---- | ------- |
| useCancelGeneration.ts 現状確認完了 | 完了 | pending |
| window.skillCreatorAPI 型確認完了   | 完了 | pending |
| AC-1〜AC-4 の定義完了               | 完了 | pending |

## 多角的チェック観点（AIが判断）

- [ ] `cancelGeneration()` を `async` に変更する必要があるか（`await` が必要か）
- [ ] `window.skillCreatorAPI?.cancelGeneration?.()` のオプショナルチェーンで型エラーが発生しないか
- [ ] `cancelGeneration()` の呼び出し元が `await` を期待しているか（破壊的変更の有無）

## サブタスク管理

1. P50チェック（重複実装なし確認）
2. 現行 `cancelGeneration()` コードの確認
3. `window.skillCreatorAPI` 型確認
4. 非同期化の要否確認
5. 受け入れ基準（AC-1〜AC-4）の固定
6. 成果物の出力

## 成果物

| 成果物       | パス                                         | 説明                         |
| ------------ | -------------------------------------------- | ---------------------------- |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能要件・非機能要件・AC一覧 |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | 検証可能なAC一覧             |

## 完了条件

- [ ] P50チェック実施済み
- [ ] 現行 `cancelGeneration()` の全コードを確認済み
- [ ] `window.skillCreatorAPI?.cancelGeneration` の型が確認済み
- [ ] 非同期化の要否が判断済み
- [ ] AC-1〜AC-4 が検証可能な形で定義されている
- [ ] 本 Phase 内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 2: 設計

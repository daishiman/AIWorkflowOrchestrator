# Phase 11: 手動テスト

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 11 - 手動テスト                         |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

型定義変更の実用性を手動で確認する。IDE 補完、exhaustive check、既存コンシューマーでのコンパイル確認を通じて、開発者体験（DX）の観点から品質を検証する。

## 前提成果物

| Phase | 成果物       | パス                |
| ----- | ------------ | ------------------- |
| 10    | 最終レビュー | `outputs/phase-10/` |

## 参照資料

| 資料名             | パス / 説明                                   |
| ------------------ | --------------------------------------------- |
| P53 CLI 環境の制約 | `.claude/rules/06-known-pitfalls.md#P53`      |
| 手動テストルール   | `.claude/rules/05-task-execution.md#Phase 11` |

## 実行タスク

### Task 1: 型定義の IDE 補完確認

UiState 型を使用する箇所で、IDE（TypeScript Language Server）が新 8 値を正しく補完候補に表示することを確認する。

確認方法:

1. `packages/shared/src/types/execution-capability.ts` を開く
2. UiState 型を使用する変数宣言で補完を試行
3. 8 値全て（`ready`, `blocked`, `unavailable`, `streaming`, `handoff`, `terminal-only`, `guidance-only`, `degraded`）が補完候補に表示されることを確認

CLI 環境での代替確認方法:

```bash
# TypeScript Language Server の型情報を確認
cd packages/shared
pnpm tsc --noEmit --listFiles 2>&1 | head -20
```

### Task 2: switch 文での exhaustive check 動作確認

UiState 型に対する switch 文で、新値を追加した場合に TypeScript が exhaustive check を正しく適用することを確認する。

確認方法:

1. 一時的にテスト用の switch 文を作成し、1 値を意図的に省略
2. `pnpm typecheck` で型エラーが発生することを確認
3. 省略した値を追加し、型エラーが解消されることを確認
4. テスト用コードを削除

```typescript
// 確認用コード（一時的に作成して検証後に削除）
function testExhaustive(state: UiState): string {
  switch (state) {
    case "ready":
      return "ready";
    case "blocked":
      return "blocked";
    case "unavailable":
      return "unavailable";
    case "streaming":
      return "streaming";
    case "handoff":
      return "handoff";
    case "terminal-only":
      return "terminal-only";
    case "guidance-only":
      return "guidance-only";
    // "degraded" を省略 -> 型エラーが出ることを確認
  }
}
```

### Task 3: 既存コンシューマーでのコンパイル確認

UiState 型を import している既存ファイルが、変更後もコンパイルエラーなしで動作することを確認する。

確認手順:

1. UiState の import 箇所を検索

```bash
grep -rn "UiState" packages/ apps/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | grep -v ".test."
```

2. 各コンシューマーファイルでの使用パターンを確認
3. `pnpm typecheck` で全パッケージの型チェックが PASS することを確認

### Task 4: テスト結果サマリ

| #   | テスト項目                           | 確認方法               | 結果 | 備考 |
| --- | ------------------------------------ | ---------------------- | ---- | ---- |
| 1   | IDE 補完（8 値表示）                 | TSC / IDE 確認         | -    | -    |
| 2   | exhaustive check（省略時エラー）     | 一時コード + typecheck | -    | -    |
| 3   | exhaustive check（全値時エラーなし） | 一時コード + typecheck | -    | -    |
| 4   | 既存コンシューマーコンパイル         | pnpm typecheck         | -    | -    |

## 成果物

| 成果物                | パス                                     |
| --------------------- | ---------------------------------------- |
| 手動テストレポート    | `outputs/phase-11/manual-test-report.md` |
| Phase 11 完了レポート | `outputs/phase-11/`                      |

## 統合テスト連携

本 Phase の成果物が他 Phase や他タスクのテストに影響する場合の確認事項:

| 確認項目                         | 確認方法                                                                    | 判定基準      |
| -------------------------------- | --------------------------------------------------------------------------- | ------------- |
| 既存テスト（CC-1〜CC-5）への影響 | `pnpm --filter @repo/shared vitest run`                                     | 全テスト PASS |
| Task B（HealthPolicy）との型整合 | TASK-IMP-HEALTH-POLICY-UNIFICATION-001 の CapabilityContext.isDegraded 参照 | 型定義が一致  |

## サブタスク管理

Phase 実行時に TaskCreate / TaskUpdate で進捗を管理する。

- [ ] Phase 開始時: TaskUpdate で status を `in_progress` に更新
- [ ] 各 Task 完了時: TaskUpdate で該当サブタスクを `completed` に更新
- [ ] Phase 完了時: 全サブタスクが `completed` であることを確認

## タスク100%実行確認【必須】

Phase 完了前に以下を確認する:

- [ ] 実行タスクの全項目が実施されている
- [ ] 成果物テーブルの全成果物が作成されている
- [ ] 完了条件の全チェックボックスがチェックされている
- [ ] 次 Phase への引き継ぎ事項が明確である

## 完了条件

- [ ] IDE 補完で 8 値全てが表示されることを確認済み
- [ ] switch 文の exhaustive check が正しく動作することを確認済み
- [ ] 既存コンシューマーでコンパイルエラーが発生しないことを確認済み
- [ ] 手動テストレポートが `outputs/phase-11/` に保存されている

## 次Phase

[Phase 12: ドキュメント](./phase-12-documentation.md)

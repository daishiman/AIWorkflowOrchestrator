# Phase 9: 品質検証

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 9 - 品質検証                            |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

Lint、型チェック、全テスト実行、および Record<UiState, ...> 網羅チェックを通じて、実装の品質を総合的に検証する。

## 前提成果物

| Phase | 成果物           | パス               |
| ----- | ---------------- | ------------------ |
| 8     | リファクタリング | `outputs/phase-8/` |

## 参照資料

| 資料名                       | パス / 説明                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| Lint / TypeCheck ルール      | `.claude/rules/07-git-and-tooling.md#コミット前チェックリスト` |
| コード品質ルール             | `.claude/rules/02-code-quality.md`                             |
| P40 モノレポ実行ディレクトリ | `.claude/rules/06-known-pitfalls.md#P40`                       |

## 実行タスク

### Task 1: ESLint 実行

```bash
pnpm lint
```

全 lint ルールが PASS であることを確認する。warning レベルの指摘も記録する。

確認ポイント:

- 未使用の import が存在しないこと
- `any` 型が使用されていないこと
- naming convention に違反していないこと

### Task 2: TypeScript 型チェック実行

```bash
pnpm typecheck
```

全パッケージで型エラーが 0 であることを確認する。

確認ポイント:

- `packages/shared` の型定義変更が他パッケージに波及していないこと
- `Record<UiState, ...>` の網羅性が型レベルで保証されていること
- 新 5 値が `Record` の key として漏れなく定義されていること

### Task 3: Record<UiState, ...> 網羅チェック

以下のコマンドで、`Record<UiState, ...>` パターンを使用している全箇所を検出し、新 5 値が漏れなく定義されていることを確認する:

```bash
grep -rn "Record<UiState" packages/shared/src/
```

各箇所で 8 値全てが key として存在することを目視確認する。TypeScript コンパイラが網羅性を保証するため、Task 2 の型チェックが PASS していれば基本的に問題ないが、`as` キャストや `Partial` でバイパスしていないかを追加確認する。

### Task 4: 全テスト実行

```bash
cd packages/shared
pnpm vitest run
```

packages/shared 内の全テストが PASS であることを確認する。

確認ポイント:

- 新規テスト（uistate-resolve, contract-matrix）が全て PASS
- 既存テスト（cta-contract CC-1〜CC-5）が全て PASS
- テスト実行時間が妥当であること（極端に遅い場合は調査）

### Task 5: 結果サマリ作成

| チェック項目                | 結果 | 備考 |
| --------------------------- | ---- | ---- |
| ESLint                      | -    | -    |
| TypeScript 型チェック       | -    | -    |
| Record<UiState, ...> 網羅性 | -    | -    |
| 全テスト実行                | -    | -    |

## 成果物

| 成果物               | パス                                |
| -------------------- | ----------------------------------- |
| 品質検証レポート     | `outputs/phase-9/quality-report.md` |
| Phase 9 完了レポート | `outputs/phase-9/`                  |

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

- [ ] `pnpm lint` が PASS している（error 0 件）
- [ ] `pnpm typecheck` が PASS している（error 0 件）
- [ ] `Record<UiState, ...>` の全箇所で 8 値が網羅されている
- [ ] `as` キャストや `Partial` によるバイパスが存在しない
- [ ] packages/shared の全テストが PASS している
- [ ] 既存テスト CC-1〜CC-5 が引き続き PASS している
- [ ] 品質検証レポートが `outputs/phase-9/` に保存されている

## 次Phase

[Phase 10: 最終レビュー](./phase-10-final-review.md)

# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| Phase    | 8 - リファクタリング                    |
| 機能名   | uistate-contract-extension              |
| タスクID | TASK-IMP-UISTATE-CONTRACT-EXTENSION-001 |
| 作成日   | 2026-03-24                              |

## 目的

Phase 5 で TDD GREEN を達成した実装コードの品質を改善する。resolveUiState() の分岐ロジック整理、到達不能セルの型ガード最適化、共通パターンの抽出を行う。全テストが引き続き PASS することを保証する。

## 前提成果物

| Phase | 成果物         | パス               |
| ----- | -------------- | ------------------ |
| 5     | 実装           | `outputs/phase-5/` |
| 7     | カバレッジ確認 | `outputs/phase-7/` |

## 参照資料

| 資料名                  | パス / 説明                                         |
| ----------------------- | --------------------------------------------------- |
| 主要変更対象            | `packages/shared/src/types/execution-capability.ts` |
| コード品質ルール        | `.claude/rules/02-code-quality.md`                  |
| P49 type predicate 注意 | `.claude/rules/06-known-pitfalls.md#P49`            |
| 設計原則                | `.claude/rules/01-architecture.md#設計原則`         |

## 実行タスク

### Task 1: resolveUiState() の分岐ロジック整理

現状の if-else チェーンまたは switch 文を見直し、以下の観点で改善する:

- 評価優先順位 D-3 の順序が明確にコードから読み取れるか
- 各分岐の条件が簡潔で意図が明確か
- ネストが深くなっていないか

改善パターン候補:

1. **早期リターンパターン**: 優先度の高い状態から順に早期リターン
2. **状態評価テーブルパターン**: `Record<string, (ctx: CapabilityContext) => boolean>` で判定ロジックを宣言的に記述
3. **パイプラインパターン**: 評価関数の配列を順に適用

### Task 2: 到達不能セルの型ガード最適化

Contract Matrix 内の到達不能セル（論理的に発生しない組み合わせ）の型ガードを最適化する:

- `never` 型を活用した到達不能の型レベル保証
- Guard 関数のエラーメッセージを具体的にする
- P49 準拠: `as` キャストではなく `in` 演算子で実行時検証

### Task 3: 共通パターンの抽出

resolveUiState() と resolveCtaContract() に共通するパターンを抽出する:

- 状態判定のヘルパー関数（例: `isActiveState()`, `isTerminalState()`）
- CTA マッピングの共通構造（例: 無効 CTA の定義を共有）
- 型ガードの共通パターン

### Task 4: テスト PASS 確認

リファクタリング後、全テストが引き続き PASS することを確認する:

```bash
cd packages/shared
pnpm vitest run src/types/__tests__/
```

## 成果物

| 成果物                   | パス                                                |
| ------------------------ | --------------------------------------------------- |
| リファクタリング済み実装 | `packages/shared/src/types/execution-capability.ts` |
| Phase 8 完了レポート     | `outputs/phase-8/`                                  |

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

- [ ] resolveUiState() の分岐ロジックが整理されている
- [ ] 到達不能セルの型ガードが最適化されている
- [ ] 共通パターンが抽出され、重複コードが削減されている
- [ ] `as` キャストを使用していない（P49 準拠）
- [ ] `any` 型を使用していない
- [ ] 全テストが引き続き PASS している
- [ ] リファクタリングにより外部インターフェースが変更されていない

## 次Phase

[Phase 9: 品質検証](./phase-9-quality-assurance.md)

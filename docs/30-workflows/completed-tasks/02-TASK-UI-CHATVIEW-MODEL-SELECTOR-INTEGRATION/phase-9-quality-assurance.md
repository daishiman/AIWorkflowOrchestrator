# Phase 9: 品質検証 — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                          |
| ------------- | ------------------------------------------- |
| 機能名        | chatview-inline-model-selector-integration  |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| Phase         | 9                                           |
| 作成日        | 2026-03-21                                  |
| 依存          | Phase 8（リファクタリング）完了後           |
| 前Phase成果物 | ./phase-8-refactoring.md                    |

## 目的

Lint・型チェック・全テストを実行し、すべてPASSであることを確認してPhase 10へ進む条件を満たす。

## 実行タスク

- `pnpm lint` を実行してESLintエラーがないことを確認する
- `pnpm typecheck` を実行して型エラーがないことを確認する
- ChatView関連の全テストがPASSであることを確認する
- いずれかが失敗した場合は該当PhaseへBACKして修正する

## 参照資料

| 資料                                       | パス                                |
| ------------------------------------------ | ----------------------------------- |
| Phase 8 リファクタリング成果物             | ./phase-8-refactoring.md            |
| コード品質ルール                           | .claude/rules/02-code-quality.md    |
| Git & ツーリングルール                     | .claude/rules/07-git-and-tooling.md |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | ./phase-2-design.md                 |

## 実行手順

### Step 1: Lint実行

```bash
pnpm --filter @repo/desktop lint
```

エラーが発生した場合: Phase 8（リファクタリング）へ戻りコードを修正する。

### Step 2: 型チェック実行

```bash
pnpm --filter @repo/desktop typecheck
```

エラーが発生した場合: エラーメッセージを確認し、対応するPhase（Phase 5または8）へ戻り修正する。

### Step 3: ChatView関連テスト全実行

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
```

期待: TC-I-1〜TC-I-5（Phase 4）+ TC-E-1〜TC-E-3（Phase 6）= 8件すべてGreen

### Step 4: 広域テスト実行（非デグレード確認）

変更の影響範囲を確認するため、関連する広域テストを実行する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/
```

失敗が発生した場合: 失敗テストがChatView修正によるデグレードか、既存の無関係な失敗かを切り分ける。ChatView修正によるデグレードであれば対応するPhaseへ戻る。

### Step 5: 結果記録

すべてPASSした場合は以下の形式で結果を記録する（このファイルの成果物テーブルに追記する）。

| チェック項目               | 結果        |
| -------------------------- | ----------- |
| Lint                       | PASS        |
| TypeCheck                  | PASS        |
| Unit Tests (ChatView)      | PASS（8件） |
| 広域テスト（非デグレード） | PASS        |

## 統合テスト連携

品質検証として以下の4項目すべてがPASSであることを確認する:

| チェック項目          | コマンド                                                          |
| --------------------- | ----------------------------------------------------------------- |
| Lint                  | `pnpm --filter @repo/desktop lint`                                |
| TypeCheck             | `pnpm --filter @repo/desktop typecheck`                           |
| ChatViewテスト（8件） | `cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/` |
| 広域テスト            | `cd apps/desktop && pnpm vitest run src/renderer/`                |

## 成果物

| 成果物                               | 説明                              |
| ------------------------------------ | --------------------------------- |
| 品質検証レポート（本ファイルへ追記） | Lint・TypeCheck・テスト結果の記録 |

**実測結果（実行時に記入）:**

| チェック項目          | 結果     |
| --------------------- | -------- |
| Lint                  | （記入） |
| TypeCheck             | （記入） |
| Unit Tests (ChatView) | （記入） |
| 広域テスト            | （記入） |

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 9
```

## 完了条件

- [ ] `pnpm lint` がPASS（エラー0件）
- [ ] `pnpm typecheck` がPASS（エラー0件）
- [ ] ChatView統合テスト8件がすべてGreen
- [ ] 広域テストでChatView修正によるデグレードが発生していない
- [ ] 上記結果が成果物テーブルに記録されている

## 次のPhase

[Phase 10: 最終レビュー](./phase-10-final-review.md)

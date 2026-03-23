# Phase 7: カバレッジ確認 — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                          |
| ------------- | ------------------------------------------- |
| 機能名        | chatview-inline-model-selector-integration  |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION |
| Phase         | 7                                           |
| 作成日        | 2026-03-21                                  |
| 依存          | Phase 6（テスト拡充）完了後                 |
| 前Phase成果物 | ./phase-6-test-expansion.md                 |

## 目的

ChatView/index.tsxの修正箇所に対してLine Coverage 80%以上が達成されていることを確認し、未達の場合はPhase 6へ戻りテストを追加する。

## 実行タスク

- `pnpm vitest run --coverage` でカバレッジレポートを生成する
- ChatView/index.tsxのLine Coverageを確認する
- 80%未満の場合はPhase 6へ戻り、テストケースを追加する
- 80%以上であればPhase 8へ進む

## 参照資料

| 資料                                       | パス                             |
| ------------------------------------------ | -------------------------------- |
| Phase 6 テスト拡充成果物                   | ./phase-6-test-expansion.md      |
| コード品質ルール（カバレッジ基準）         | .claude/rules/02-code-quality.md |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | ./phase-2-design.md              |

## 実行手順

### Step 1: カバレッジ計測

```bash
cd apps/desktop && pnpm vitest run --coverage \
  src/renderer/views/ChatView/
```

### Step 2: カバレッジレポートの確認

出力されたカバレッジレポートで `ChatView/index.tsx` の数値を確認する。

確認する指標:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### Step 3: 判定

**基準を満たしている場合:**

- Phase 8へ進む

**基準を満たしていない場合:**

- 未カバーの行・分岐を特定する
- Phase 6へ戻り、不足しているテストケースを追加する
- 再度Phase 7を実施する

### Step 4: カバレッジ結果の記録

実際のカバレッジ数値をこのファイルの「成果物」セクションに記録する（実行時に追記すること）。

## 統合テスト連携

カバレッジ基準の達成状況を確認し、未達の場合はPhase 6に戻りテストを追加する:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

## 成果物

| 成果物                           | パス                             | 説明                                       |
| -------------------------------- | -------------------------------- | ------------------------------------------ |
| カバレッジレポート（実行時生成） | apps/desktop/coverage/index.html | vitest --coverage で生成されるHTMLレポート |

**実測カバレッジ（実行時に記入）:**

| ファイル           | Line      | Branch    | Function  |
| ------------------ | --------- | --------- | --------- |
| ChatView/index.tsx | （記入）% | （記入）% | （記入）% |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 7
```

## 完了条件

- [ ] `pnpm vitest run --coverage` が実行済みである
- [ ] ChatView/index.tsx の Line Coverage が 80%以上である
- [ ] ChatView/index.tsx の Branch Coverage が 60%以上である
- [ ] ChatView/index.tsx の Function Coverage が 80%以上である
- [ ] 未達の場合はPhase 6へ戻りテストを追加した（ループを記録する）

## 次のPhase

[Phase 8: リファクタリング](./phase-8-refactoring.md)

---

_基準未達でPhase 6に戻る場合は、Phase 6の完了条件に「Phase 7で未達だった箇所に対するテスト追加」を追記してから戻ること。_

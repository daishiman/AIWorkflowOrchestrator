# Phase 8: リファクタリング — ChatViewへのインラインモデルセレクタ配置

## メタ情報

| 項目          | 値                                                                                                                    |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| 機能名        | chat-inline-model-selector                                                                                            |
| タスクID      | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION                                                                           |
| Phase         | 8                                                                                                                     |
| 作成日        | 2026-03-21                                                                                                            |
| 依存          | Phase 7（カバレッジ確認）完了後                                                                                       |
| 前Phase成果物 | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-7-coverage.md |

## 目的

ChatViewのヘッダーレイアウトを整理し、InlineModelSelectorの追加によって生じた可読性・保守性の課題を解消する。機能の外部動作は変更しない。

## 実行タスク

- ChatView/index.tsxのヘッダー部分のレイアウトコードを整理する
- 命名規則・コメント・不要なimportを整理する
- リファクタリング後もすべてのテストがGreenであることを確認する

## 参照資料

| 資料                                       | パス                                                                                                                        |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計書（ChatView配置設計 3.1/3.3） | docs/30-workflows/chat-inline-model-selector/phase-2-design.md                                                              |
| Phase 5 実装成果物                         | docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION/phase-5-implementation.md |
| コード品質ルール                           | .claude/rules/02-code-quality.md                                                                                            |
| アーキテクチャルール                       | .claude/rules/01-architecture.md                                                                                            |

## 実行手順

### Step 1: リファクタリング対象の特定

Phase 5実装後のChatView/index.tsxを確認し、以下の観点で整理すべき箇所を洗い出す。

```bash
grep -n "TODO\|FIXME\|HACK\|any\|@ts-ignore" \
  apps/desktop/src/renderer/views/ChatView/index.tsx
```

確認観点:

- ヘッダー部分のFlexレイアウトが明確なクラス命名になっているか
- InlineModelSelectorとSystemPromptToggleButtonのグルーピングが意図的に表現されているか
- `isStreaming` の取得が個別セレクタ経由になっているか（P31対策）
- 未使用importが残っていないか

### Step 2: ヘッダーレイアウトの整理

ヘッダーの左右グループを明確に分離し、コードの意図が一読で分かるように整理する。

整理の観点:

- JSXコメントで「左側コントロール群」「右側コントロール群」を明示する
- 8pxグリッドに基づくスペーシングクラス（`gap-2`）が統一されているか確認する
- Apple HIG準拠のスタイルが維持されているかを確認する

### Step 3: 命名・コメント整理

- boolean変数名が `is` / `has` / `can` / `should` プレフィックスに従っているか確認する
- コンポーネント内の変数名が意味を正確に表しているか確認する
- 曖昧なコメント（「適切に」「必要に応じて」）があれば条件・基準を明示したコメントに書き換える

### Step 4: テスト再実行（非デグレード確認）

リファクタリング後にすべてのテストがGreenであることを確認する。

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/ChatView/
```

期待: Phase 4〜6で作成した全テストがGreen

### Step 5: 型チェック（部分確認）

```bash
cd apps/desktop && pnpm tsc --noEmit --skipLibCheck 2>&1 | grep "ChatView"
```

ChatView/index.tsxに型エラーがないことを確認する。

## 成果物

| 成果物                           | パス                                               | 説明                       |
| -------------------------------- | -------------------------------------------------- | -------------------------- |
| ChatView（リファクタリング済み） | apps/desktop/src/renderer/views/ChatView/index.tsx | ヘッダーレイアウト整理済み |

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/02-TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION --phase 8
```

## 完了条件

- [ ] ヘッダーのFlexレイアウトが左右グループで明確に分離されている
- [ ] InlineModelSelectorとSystemPromptToggleButtonがグルーピングされている
- [ ] 未使用importが存在しない
- [ ] boolean変数名がプレフィックス規約（is/has/can/should）に従っている
- [ ] any型・@ts-ignoreが増加していない
- [ ] 全テスト（TC-I-1〜TC-I-5 + TC-E-1〜TC-E-3）がGreen
- [ ] 外部動作（機能）が変更されていない

## 次のPhase

[Phase 9: 品質検証](./phase-9-quality.md)

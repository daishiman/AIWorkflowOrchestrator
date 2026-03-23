# Phase 8: リファクタリング

## メタ情報

| 項目          | 内容                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase番号     | 8                                                                                                                        |
| 機能名        | WorkspaceChatPanelへのインラインモデルセレクタ配置 (TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION)                        |
| 作成日        | 2026-03-21                                                                                                               |
| 更新日        | 2026-03-23                                                                                                               |
| 担当          | -                                                                                                                        |
| ステータス    | 完了                                                                                                                     |
| 前Phase成果物 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-7-coverage.md` |

## 目的

Phase 5 の実装をより安全・明確・保守しやすいコードに改善する。テストはすべてGREENのままで、WorkspaceChatPanelのレイアウト整理とコードの可読性向上を行う。

## 実行タスク

### タスク1: コードレビュー観点

以下の観点でPhase 5 で実装したコードを見直す。

#### 1-1: WorkspaceChatPanelのレイアウト整理

- InlineModelSelectorとチャット入力・GuidanceBlockのレイアウト配置が適切か
- 不要なネスト・冗長なdiv要素がないか
- CSSクラス名がプロジェクトの命名規則に沿っているか（Tailwind CSS使用の場合）

#### 1-2: 条件分岐の明確化

- GuidanceBlock表示条件が読みやすく記述されているか（変数名・条件式）
- `blocked` / `isModelSelected` / `isStreaming` の命名が意図を正確に表しているか
- 複合条件式が1行で読めるか、または変数に抽出して分離すべきか

```typescript
// 改善例: 条件を変数に抽出して可読性向上
const isModelSelected = selectedProviderId !== null && selectedModelId !== null;
const showBlockedGuidance = !isModelSelected;
const isSelectorDisabled = isStreaming;
```

#### 1-3: 型安全性の確認

- Props型定義が明示的か（`WorkspaceChatPanelProps` 型）
- `isStreaming` / `blocked` / `compact` propの型が適切か

#### 1-4: Atomic Design原則の確認

- WorkspaceChatPanelがorganismとして適切に構成されているか（InlineModelSelector, GuidanceBlockを組み合わせている）
- atom/molecule相当のコンポーネントに過度なロジックが含まれていないか

#### 1-5: アクセシビリティの確認

- InlineModelSelector（compact）にARIAラベルが付与されているか
- ストリーミング中のdisabled状態がHTML `disabled` 属性で正しく伝達されているか

### タスク2: リファクタリングの実施

タスク1で発見した問題点を修正する。

**前提**: テストがGREENであることを確認しながら小さく変更する。1回の変更ごとにテストを実行する。

```bash
# リファクタリング後のテスト実行（apps/desktopから、P40対策）
cd apps/desktop
pnpm vitest run src/renderer/views/WorkspaceView/
```

### タスク3: TypeScript型チェック

```bash
cd apps/desktop
pnpm typecheck
```

### タスク4: Lint確認

```bash
cd apps/desktop
pnpm lint
```

## 参照資料

### アーキテクチャルール

| 資料名           | パス                               |
| ---------------- | ---------------------------------- |
| UI設計原則       | `.claude/rules/01-architecture.md` |
| コーディング規約 | `.claude/rules/02-code-quality.md` |

### 前Phase成果物

| 資料名                 | パス                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 7 カバレッジ確認 | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-7-coverage.md` |

### 既知の落とし穴

| 落とし穴ID | 説明                                          | 対策                                        |
| ---------- | --------------------------------------------- | ------------------------------------------- |
| P31        | Zustand合成Hookによる無限ループ               | 個別セレクタを使用、refactoring後も維持する |
| P47        | CSS変数ベースのスタイルテストアサーション戦略 | variantStylesをRecord定数でexportして再利用 |
| P49        | type predicate 内での `as` キャスト           | `in` 演算子でナロイング                     |

## 実行手順

1. **タスク1の実施**: コードレビューを行い、改善点をリストアップする
2. **タスク2の実施**: 発見した問題点を1つずつ修正し、その都度テストを実行する
3. **タスク3の実施**: TypeScript型チェックを実行する
4. **タスク4の実施**: Lintを実行する
5. **最終確認**: 全テストがGREENであることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                       | パス                                                                                                                        | 説明                   |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 8 仕様書（本ファイル） | `docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION/phase-8-refactoring.md` | リファクタリング計画書 |
| リファクタリング済みコード   | `apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx`                                                      | 改善されたコード       |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/chat-inline-model-selector/tasks/03-TASK-UI-WORKSPACE-MODEL-SELECTOR-INTEGRATION --phase 8
```

## 完了条件

- [ ] タスク1のコードレビューを実施し、改善点をリストアップした
- [ ] WorkspaceChatPanelのレイアウトが整理され、不要なネストが排除された
- [ ] GuidanceBlock表示条件の変数名が意図を明確に表している
- [ ] Props型定義が明示的に記述されている
- [ ] ARIAラベルが適切に付与されている
- [ ] リファクタリング後のすべてのテストがGREENである
- [ ] TypeScript型チェックが通った
- [ ] Lintが通った

## 次のPhase

Phase 9: 品質検証（`phase-9-quality.md`）

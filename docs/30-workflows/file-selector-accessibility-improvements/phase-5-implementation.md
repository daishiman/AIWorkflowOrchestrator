# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 5                                        |
| Phase名    | 実装                                     |
| 前提Phase  | Phase 4                                  |
| 後続Phase  | Phase 6                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

テストで要求されるアクセシビリティ改善を実装し、テストを成功させる。

## 背景

Phase 4 で a11y テストが作成されたため、実装を行いテストを通過させる必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-05-1 フォーカス管理実装

**目的**: モーダル開閉時のフォーカス移動とトラップを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/hooks/useFocusTrap.ts` を作成し、初期フォーカス/循環/復帰を統合して制御できる API を設計する。
2. FileSelectorModal の既存フォーカス処理を `useFocusTrap` に置き換え、初期フォーカスは閉じるボタンに移動する。
3. フォーカストラップの対象はモーダル内のフォーカス可能要素に限定し、Tab/Shift+Tab の循環を実現する。

**期待される成果物**:

- apps/desktop/src/renderer/hooks/useFocusTrap.ts
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/index.tsx

---

### タスク1: T-05-2 ARIA 属性と role 実装

**目的**: スクリーンリーダー対応に必要な ARIA 属性を付与する。

**実行手順**:

1. FileSelectorTrigger に `aria-haspopup="dialog"` と `aria-expanded={open}`、`aria-controls={modalId}` を追加する。
2. FileSelectorModal のルートに `id={modalId}` を付与し、`role="dialog"`、`aria-modal`、`aria-labelledby`、`aria-describedby` を設定する。
3. FileSelector（external）の選択済み一覧に `aria-label` を付与し、list/listitem のセマンティクスを維持する。
4. WorkspaceFileSelector の tree/treeitem と SelectedFilesPanel の list/listitem に `aria-selected` が付与される箇所を明確化する。
5. aria-live は FileSelector または WorkspaceFileSelector のいずれか 1 箇所に集約し、モーダル側の重複通知を除去する。

**期待される成果物**:

- apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/index.tsx
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/index.tsx
- apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx
- apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.tsx
- apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectedFilesPanel.tsx

---

### タスク2: T-05-3 キーボード操作実装

**目的**: キーボード操作が要件に一致するように実装する。

**実行手順**:

1. Escape キーによるモーダル閉鎖を確認し、閉鎖しない場合は修正する。
2. Tab と Shift+Tab の移動範囲がモーダル内に限定されることを確認する。
3. Enter と Space の操作がトリガーとボタンで期待動作になることを確認する。
4. WorkspaceFileSelector の treeitem で Enter/Space/Arrow の操作が意図通り動作することを確認する。

**期待される成果物**:

- outputs/phase-5/implementation-notes.md
- outputs/phase-5/a11y-change-summary.md

---

## 参照資料

依存Phase成果物:

| 参照資料         | パス                          | 内容                   |
| ---------------- | ----------------------------- | ---------------------- |
| テストケース一覧 | outputs/phase-4/test-cases.md | Phase 4 のテストケース |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                       | 内容                                                    |
| ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md` | FileSelector 構成、キーボード操作、アクセシビリティ要件 |
| UI/UXコンポーネント      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`    | フォーカス管理とキーボード操作                          |

---

## 成果物

| 成果物                     | パス                                                                                           | 内容                                 |
| -------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------ |
| フォーカストラップ Hook    | apps/desktop/src/renderer/hooks/useFocusTrap.ts                                                | モーダル内フォーカス制御             |
| FileSelectorTrigger 改修   | apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/index.tsx                   | ARIA 属性追加                        |
| FileSelectorModal 改修     | apps/desktop/src/renderer/components/organisms/FileSelectorModal/index.tsx                     | フォーカス管理と ARIA 属性追加       |
| FileSelector 改修          | apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.tsx                   | 一覧のラベル付けと aria-live 整理    |
| WorkspaceFileSelector 改修 | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.tsx | aria-live と tree セマンティクス整理 |
| SelectedFilesPanel 改修    | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/SelectedFilesPanel.tsx    | list セマンティクス整理              |
| 実装メモ                   | outputs/phase-5/implementation-notes.md                                                        | 実装内容の記録                       |
| a11y 変更サマリー          | outputs/phase-5/a11y-change-summary.md                                                         | 変更点の一覧                         |

---

## 統合テスト連携（Phase 1〜11は必須）

- FileSelectorTrigger から Modal を開閉するフローを統合テストで確認する
- external/workspace 両モードで選択結果が UI に反映されることを統合観点で確認する

---

## 完了条件

- [ ] フォーカストラップが実装されている
- [ ] ARIA 属性と role が実装されている
- [ ] キーボード操作が要件通りに動作する
- [ ] テストが成功する

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施（Phase 1〜11）
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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 5
```

---

## 依存関係

- **前提**: Phase 4 が完了していること
- **後続**: Phase 6 へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.a11y.test.tsx FileSelectorModal.a11y.test.tsx FileSelector.a11y.test.tsx WorkspaceFileSelector.a11y.test.tsx
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 5 実行記録

### 実行タスク

- T-05-1 フォーカス管理実装: {result}
- T-05-2 ARIA 属性と role 実装: {result}
- T-05-3 キーボード操作実装: {result}

### 発見事項

- 良かった点:
- 問題点:
- 改善提案:

### 次Phase への引き継ぎ事項

-
```

---

## 次のPhase

完了後、以下のファイルを実行してください:

`phase-6-test-expansion.md`

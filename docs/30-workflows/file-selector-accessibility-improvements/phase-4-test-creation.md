# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 4                                        |
| Phase名    | テスト作成                               |
| 前提Phase  | Phase 3                                  |
| 後続Phase  | Phase 5                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

アクセシビリティ改善のための自動テストを作成し、現状で失敗することを確認する。

## 背景

設計レビューでテスト計画が承認されたため、実装に先行してテストを準備する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-04-1 テストケース確定

**目的**: 主要なアクセシビリティ要件をテストケースに落とし込む。

**実行手順**:

1. `outputs/phase-2/test-design.md` を参照し、テストケース一覧を作成する。
2. フォーカス管理、ARIA 属性、キーボード操作、スクリーンリーダー通知の観点を記載する。
3. テスト対象コンポーネントとテスト項目の対応表を作成する。

**期待される成果物**:

- outputs/phase-4/test-cases.md

---

### タスク1: T-04-2 アクセシビリティテスト実装

**目的**: jest-axe と React Testing Library を用いたテストを実装する。

**実行手順**:

1. `apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx` を作成する。
2. `apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx` を作成し、ダイアログのラベル関連とフォーカストラップを検証する。
3. `apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.a11y.test.tsx` を作成し、external モードの一覧と aria-live を検証する。
4. `apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.a11y.test.tsx` を作成し、tree/treeitem と SelectedFilesPanel の list/listitem を検証する。
5. aria-expanded、aria-controls、role、aria-selected、aria-live のテストを追加する。

**期待される成果物**:

- apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.a11y.test.tsx
- apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.a11y.test.tsx

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                    | 内容          |
| -------------------- | --------------------------------------- | ------------- |
| 設計レビュー報告書   | outputs/phase-3/design-review-report.md | レビュー判定  |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md | ARIA 属性設計 |
| テスト設計           | outputs/phase-2/test-design.md          | テスト計画    |
| 受け入れ基準         | outputs/phase-1/acceptance-criteria.md  | 受け入れ基準  |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                        | 内容                       |
| ------------------- | --------------------------------------------------------------------------- | -------------------------- |
| 品質要件            | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` | テスト戦略と jest-axe 指針 |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`     | WCAG 2.1 AA 対応方針       |

---

## 成果物

| 成果物                 | パス                                                                                                     | 内容                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| テストケース一覧       | outputs/phase-4/test-cases.md                                                                            | テスト観点とケース                     |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/FileSelectorTrigger/FileSelectorTrigger.a11y.test.tsx     | FileSelectorTrigger の a11y テスト     |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/FileSelectorModal/FileSelectorModal.a11y.test.tsx         | FileSelectorModal の a11y テスト       |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/FileSelector/FileSelector.a11y.test.tsx                   | FileSelector（external）の a11y テスト |
| アクセシビリティテスト | apps/desktop/src/renderer/components/organisms/WorkspaceFileSelector/WorkspaceFileSelector.a11y.test.tsx | WorkspaceFileSelector の a11y テスト   |

---

## 統合テスト連携（Phase 1〜11は必須）

- external/workspace 両モードの選択フローを統合シナリオとしてテストケースに含める

---

## 完了条件

- [ ] テストケース一覧が作成されている
- [ ] a11y テストファイルが作成されている
- [ ] テスト実行で失敗することが確認されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 4
```

---

## 依存関係

- **前提**: Phase 3 が完了していること
- **後続**: Phase 5 へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.a11y.test.tsx FileSelectorModal.a11y.test.tsx FileSelector.a11y.test.tsx WorkspaceFileSelector.a11y.test.tsx
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 4 実行記録

### 実行タスク

- T-04-1 テストケース確定: {result}
- T-04-2 アクセシビリティテスト実装: {result}

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

`phase-5-implementation.md`

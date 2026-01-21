# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 8                                        |
| Phase名    | リファクタリング                         |
| 前提Phase  | Phase 7                                  |
| 後続Phase  | Phase 9                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

アクセシビリティ実装を整理し、可読性と保守性を高める。

## 背景

実装とテストが揃ったため、品質改善のための整理を行う必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-08-1 リファクタリング

**目的**: 実装とテストの重複を削減し、構造を整理する。

**実行手順**:

1. `useFocusTrap` の責務とファイル構成を見直し、重複ロジックを整理する。
2. ARIA 属性設定の共通処理を抽出する。
3. リファクタ後にテストを再実行し、結果を記録する。

**期待される成果物**:

- outputs/phase-8/refactor-notes.md
- outputs/phase-8/refactor-risk-check.md

---

## 参照資料

依存Phase成果物:

| 参照資料             | パス                                       | 内容                 |
| -------------------- | ------------------------------------------ | -------------------- |
| 要件定義書           | outputs/phase-1/requirements-definition.md | Phase 1 の要件定義   |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md    | Phase 2 の設計       |
| 実装メモ             | outputs/phase-5/implementation-notes.md    | Phase 5 の実装内容   |
| テスト拡充サマリー   | outputs/phase-6/test-expansion-summary.md  | Phase 6 の追加テスト |
| カバレッジ報告       | outputs/phase-7/coverage-report.md         | Phase 7 のカバレッジ |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料            | パス                                                                    | 内容                           |
| ------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| UI/UXコンポーネント | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md` | フォーカス管理とキーボード操作 |

---

## 成果物

| 成果物         | パス                                   | 内容         |
| -------------- | -------------------------------------- | ------------ |
| リファクタ記録 | outputs/phase-8/refactor-notes.md      | 変更点と理由 |
| リスク確認     | outputs/phase-8/refactor-risk-check.md | 再確認項目   |

---

## 統合テスト連携（Phase 1〜11は必須）

- リファクタ後に統合テストを再実行し、結果を記録する

---

## 完了条件

- [ ] リファクタ内容が記録されている
- [ ] リファクタ後にテストが成功する
- [ ] 統合テスト結果が記録されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 8
```

---

## 依存関係

- **前提**: Phase 7 が完了していること
- **後続**: Phase 9 へ進む

---

## TDD検証（Phase 4, 5, 8 の場合）

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test:run -- FileSelectorTrigger.a11y.test.tsx FileSelectorModal.a11y.test.tsx FileSelector.a11y.test.tsx WorkspaceFileSelector.a11y.test.tsx
```

**確認項目**:

- [ ] リファクタリング後もテストが成功することを確認

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 8 実行記録

### 実行タスク

- T-08-1 リファクタリング: {result}

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

`phase-9-quality.md`

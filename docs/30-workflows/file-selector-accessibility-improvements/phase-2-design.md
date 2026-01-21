# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 2                                        |
| Phase名    | 設計                                     |
| 前提Phase  | Phase 1                                  |
| 後続Phase  | Phase 3                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

Phase 1 の要件を実装可能な設計に落とし込み、フォーカス管理と ARIA 属性の実装方針を確定する。

## 背景

要件定義で WCAG 違反の要因が整理されたため、設計で具体的な実装方針とテスト計画を作成する必要がある。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-02-1 アクセシビリティ設計

**目的**: フォーカス管理と ARIA 属性の設計方針を確定する。

**実行手順**:

1. `outputs/phase-1/requirements-definition.md` と `outputs/phase-1/issue-mapping.md` を読み、改善対象の UI 要素を整理する。
2. FileSelectorModal のフォーカス移動、フォーカストラップ、フォーカス復帰の動作と初期フォーカス対象を設計する。
3. FileSelectorTrigger に open 状態を伝播する方法を設計し、`aria-expanded` と `aria-controls` の参照関係を定義する。
4. external モードの選択済み一覧（FileSelector）は list/listitem のセマンティクスで設計し、一覧のラベル付け方針を定義する。
5. workspace モードは tree/treeitem と SelectedFilesPanel の list/listitem の役割を整理し、`aria-selected` の対象を明確化する。
6. aria-live は external/workspace で 1 箇所に集約する方針を設計し、重複通知の回避方針を明記する。

**期待される成果物**:

- outputs/phase-2/accessibility-design.md
- outputs/phase-2/focus-management-design.md

---

### タスク1: T-02-2 テスト設計

**目的**: アクセシビリティテストのケースと使用するテストツールを確定する。

**実行手順**:

1. フォーカス管理、ARIA 属性、キーボード操作、スクリーンリーダー通知のテストケースを定義する。
2. `aria-expanded` と `aria-controls` の連携、ダイアログのラベル関連、一覧の role/label を検証するテストケースを追加する。
3. jest-axe と React Testing Library の使用方針を整理する。
4. external/workspace 両モードのテストファイル配置と命名ルールを確定する。

**期待される成果物**:

- outputs/phase-2/test-design.md

---

### タスク2: T-02-3 変更影響分析

**目的**: 影響範囲と変更対象ファイルを明確化する。

**実行手順**:

1. FileSelectorTrigger / FileSelectorModal / FileSelector / WorkspaceFileSelector / SelectedFilesPanel の変更点を整理する。
2. 新規フック `useFocusTrap` の配置場所と API を確定する。
3. FileSelection IPC インターフェースへの影響がないことを確認し、記録する。

**期待される成果物**:

- outputs/phase-2/change-impact.md

---

## 参照資料

依存Phase成果物:

| 参照資料       | パス                                       | 内容                |
| -------------- | ------------------------------------------ | ------------------- |
| 要件定義書     | outputs/phase-1/requirements-definition.md | Phase 1 の要件定義  |
| 指摘マッピング | outputs/phase-1/issue-mapping.md           | WCAG 指摘の整理結果 |
| 受け入れ基準   | outputs/phase-1/acceptance-criteria.md     | 受け入れ基準        |
| スコープ定義   | outputs/phase-1/scope-definition.md        | 対象範囲            |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                 | パス                                                                                 | 内容                                                    |
| ------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| ファイルセレクターUI設計 | `.claude/skills/aiworkflow-requirements/references/ui-ux-file-selector.md`           | FileSelector 構成、キーボード操作、アクセシビリティ要件 |
| UI/UXコンポーネント      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`              | WCAG 2.1 AA 対応方針とフォーカス管理                    |
| 品質要件                 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`          | テスト戦略と jest-axe 指針                              |
| デザインシステム         | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`           | コントラスト比の基準                                    |
| FileSelection API        | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-file-selection.md` | FileSelector の UI 要素定義                             |

### 追加参照

| 参照資料     | パス                                                                                 | 内容                    |
| ------------ | ------------------------------------------------------------------------------------ | ----------------------- |
| タスク指示書 | `docs/30-workflows/unassigned-task/task-file-selector-accessibility-improvements.md` | WCAG 違反内容と改善要件 |

---

## 成果物

| 成果物               | パス                                       | 内容                       |
| -------------------- | ------------------------------------------ | -------------------------- |
| アクセシビリティ設計 | outputs/phase-2/accessibility-design.md    | ARIA 属性と role の設計    |
| フォーカス管理設計   | outputs/phase-2/focus-management-design.md | フォーカス移動と復帰の設計 |
| テスト設計           | outputs/phase-2/test-design.md             | テストケースとツール選定   |
| 変更影響分析         | outputs/phase-2/change-impact.md           | 変更対象の整理             |

---

## 統合テスト連携（Phase 1〜11は必須）

- FileSelection IPC の接続要件が変わらないことを設計に明記する
- FileSelectorTrigger と Modal の連携フローを統合観点として記載する

---

## 完了条件

- [ ] フォーカス管理設計が文書化されている
- [ ] ARIA 属性と role の割り当てが文書化されている
- [ ] テスト設計が文書化されている
- [ ] 変更影響分析が文書化されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 2
```

---

## 依存関係

- **前提**: Phase 1 が完了していること
- **後続**: Phase 3 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 2 実行記録

### 実行タスク

- T-02-1 アクセシビリティ設計: {result}
- T-02-2 テスト設計: {result}
- T-02-3 変更影響分析: {result}

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

`phase-3-design-review.md`

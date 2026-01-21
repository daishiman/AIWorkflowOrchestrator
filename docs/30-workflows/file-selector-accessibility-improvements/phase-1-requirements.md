# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 1                                        |
| Phase名    | 要件定義                                 |
| 前提Phase  | なし                                     |
| 後続Phase  | Phase 2                                  |
| ステータス | 未実施                                   |
| 作成日     | 2026-01-18                               |
| 機能名     | file-selector-accessibility-improvements |

---

## 目的

WCAG 2.1 AA 違反の指摘を要件として整理し、external/workspace 両モードの対象範囲と受け入れ基準を確定する。

## 背景

Phase 7-2 のアクセシビリティレビューで FileSelector のフォーカス管理と ARIA 属性が不足していることが判明した。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク0: T-01-1 要件抽出と問題整理

**目的**: 指摘事項を要求事項に変換し、対象コンポーネントと関連ファイルを明確化する。

**実行手順**:

1. `docs/30-workflows/unassigned-task/task-file-selector-accessibility-improvements.md` を読み、WCAG 2.4.3 / 4.1.2 / 1.3.1 / 1.4.11 の指摘内容を整理する。
2. FileSelectorTrigger / FileSelectorModal / FileSelector（external の選択済み一覧）/ WorkspaceFileSelector（ツリー）/ SelectedFilesPanel の実装ファイルを特定する。
3. 指摘内容と実装コンポーネントの対応表を作成し、どの要素に role/ARIA を付与すべきかを明確化する。
4. 仕様書に記載されたアクセシビリティ要件と照合し、欠落している要件を一覧化する。

**期待される成果物**:

- outputs/phase-1/requirements-definition.md
- outputs/phase-1/issue-mapping.md

---

### タスク1: T-01-2 受け入れ基準とスコープ定義

**目的**: 受け入れ基準、スコープ、制約、リスクを明文化する。

**実行手順**:

1. フォーカス移動、フォーカストラップ、ARIA 属性、キーボード操作、スクリーンリーダー通知の受け入れ基準を定義する。
2. 対象外とする範囲を明記し、影響を受ける既存機能を整理する。
3. 既存 UI の挙動変更によるリスクを列挙し、対策方針を記載する。

**期待される成果物**:

- outputs/phase-1/acceptance-criteria.md
- outputs/phase-1/scope-definition.md
- outputs/phase-1/risk-assessment.md

---

## 参照資料

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

| 参照資料          | パス                                                                                 | 内容                    |
| ----------------- | ------------------------------------------------------------------------------------ | ----------------------- |
| タスク指示書      | `docs/30-workflows/unassigned-task/task-file-selector-accessibility-improvements.md` | WCAG 違反内容と改善要件 |
| UI/UXガイドライン | `docs/00-requirements/16-ui-ux-guidelines.md`                                        | UI/UX 基準              |

---

## 成果物

| 成果物         | パス                                       | 内容                                |
| -------------- | ------------------------------------------ | ----------------------------------- |
| 要件定義書     | outputs/phase-1/requirements-definition.md | 機能要件と非機能要件                |
| 指摘マッピング | outputs/phase-1/issue-mapping.md           | WCAG 指摘と対象コンポーネント対応表 |
| 受け入れ基準   | outputs/phase-1/acceptance-criteria.md     | 検証可能な受け入れ基準              |
| スコープ定義   | outputs/phase-1/scope-definition.md        | 実装範囲と対象外範囲                |
| リスク評価     | outputs/phase-1/risk-assessment.md         | リスクと対策方針                    |

---

## 統合テスト連携（Phase 1〜11は必須）

| 接続要件カテゴリ | 記載内容                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| API接続          | FileSelection IPC 仕様は変更しないことを要件に記載する                                                                         |
| 認証フロー       | Renderer から Main への呼び出し前提を要件に記載する                                                                            |
| データフロー     | FileSelectorTrigger → FileSelectorModal → FileSelector/WorkspaceFileSelector → SelectedFilesPanel の UI フローを要件に記載する |

---

## 完了条件

- [ ] WCAG 指摘事項が要件として整理されている
- [ ] external/workspace 両モードの対象コンポーネントとファイルが明記されている
- [ ] 受け入れ基準が検証可能な形で定義されている
- [ ] スコープと対象外範囲が記載されている
- [ ] リスクと対策方針が記載されている

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/file-selector-accessibility-improvements --phase 1
```

---

## 依存関係

- **前提**: なし
- **後続**: Phase 2 へ進む

---

## Phase実行記録（全Phase共通）

Phase完了後、以下を記録してください:

```markdown
## Phase 1 実行記録

### 実行タスク

- T-01-1 要件抽出と問題整理: {result}
- T-01-2 受け入れ基準とスコープ定義: {result}

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

`phase-2-design.md`

# Phase 1 スコープ定義書 - SkillDetailPanel アクションボタン追加

## メタ情報

| 項目     | 内容                    |
| -------- | ----------------------- |
| タスクID | TASK-SKILL-LIFECYCLE-03 |
| フェーズ | Phase 1: 要件定義       |
| 作成日   | 2026-03-19              |

---

## 対象範囲（変更ファイル）

本タスクで変更するファイルは以下の 3 ファイルに限定する。

| ファイルパス                                                                      | 変更内容                                                                                 | 変更規模            |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------- |
| `apps/desktop/src/renderer/features/skill-center/components/SkillDetailPanel.tsx` | Props インターフェース拡張（`onEdit` / `onAnalyze` 追加）+ アクションボタンゾーン実装    | 中（+30〜50行相当） |
| `apps/desktop/src/renderer/features/skill-center/hooks/useSkillCenter.ts`         | `handleEditSkill` / `handleAnalyzeSkill` ハンドラ追加 + 戻り値への追加                   | 小（+15〜25行相当） |
| `apps/desktop/src/renderer/features/skill-center/SkillCenterView/index.tsx`       | `onEdit={handleEditSkill}` / `onAnalyze={handleAnalyzeSkill}` の prop バインディング追加 | 小（+2〜4行相当）   |

---

## 除外範囲（変更しないファイル）

以下のファイルは本タスクのスコープ外とし、変更しない。

| ファイルパス                                                | 除外理由                                                                               |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `apps/desktop/src/renderer/store/slices/navigationSlice.ts` | `setCurrentSkillName` / `setCurrentView` は既存 API をそのまま利用する                 |
| `apps/desktop/src/renderer/store/types.ts`                  | `ViewType` の `"skill-editor"` / `"skillAnalysis"` は既に定義済み                      |
| `apps/desktop/src/renderer/App.tsx`                         | `renderView` 分岐（skill-editor / skillAnalysis）は TASK-SKILL-LIFECYCLE-02 で実装済み |
| `packages/shared/` 配下の全ファイル                         | Props 追加は desktop アプリ内部の変更であり、共有型の変更は不要                        |
| `apps/desktop/src/main/` 配下の全ファイル                   | Renderer 層の UI 変更のみで IPC 追加は発生しない                                       |
| `apps/desktop/src/preload/` 配下の全ファイル                | IPC 変更なし                                                                           |

---

## 既存 routing foundation との境界

### top-level CTA（変更なし）

TASK-SKILL-LIFECYCLE-02 で実装された以下のハンドラはそのまま維持する。

| ハンドラ名                | 遷移先            | 備考                     |
| ------------------------- | ----------------- | ------------------------ |
| `navigateToSkillCreate`   | `"skill-editor"`  | 新規作成（スキル名なし） |
| `navigateToWorkspace`     | `"workspace"`     | ワークスペース遷移       |
| `navigateToSkillAnalysis` | `"skillAnalysis"` | 汎用分析遷移             |

これらは SkillCenterView の **generic な** CTA として機能し、特定スキルの文脈を持たない。

### DetailPanel 文脈ハンドラ（新規追加）

本タスクで追加するハンドラは「選択中スキルの文脈を伴う遷移」専用とし、top-level CTA と明確に責務を分離する。

| ハンドラ名                      | 遷移先            | スキル名 handoff                         | 用途                                   |
| ------------------------------- | ----------------- | ---------------------------------------- | -------------------------------------- |
| `handleEditSkill(skillName)`    | `"skill-editor"`  | あり（`setCurrentSkillName` を呼び出す） | DetailPanel から特定スキルを編集       |
| `handleAnalyzeSkill(skillName)` | `"skillAnalysis"` | なし                                     | DetailPanel から特定スキルの分析画面へ |

> **設計意図**: `handleAnalyzeSkill` で `setCurrentSkillName` を呼び出さない理由は、分析画面（skillAnalysis）が選択スキルを別の機構（例: 分析画面固有の Store スライス）で管理する想定であるため。分析画面側の実装が確定した段階で必要に応じてアップデートする。

---

## 責務分離マトリクス

| 責務                     | 担当コンポーネント                                           |
| ------------------------ | ------------------------------------------------------------ |
| ボタンの表示・非表示制御 | `SkillDetailPanel` （`isImported` + prop の有無で判定）      |
| Store アクション呼び出し | `useSkillCenter`（`handleEditSkill` / `handleAnalyzeSkill`） |
| prop の橋渡し            | `SkillCenterView/index.tsx`                                  |
| ViewType の管理          | `navigationSlice`（既存）                                    |
| 画面描画の切り替え       | `App.tsx` の `renderView`（既存、変更なし）                  |

---

## リスク・考慮事項

| リスク                                                   | 対策                                                                                                  |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `SkillDetailPanel` の Props 変更が既存テストを壊す可能性 | `onEdit` / `onAnalyze` を省略可能（`?`）にすることで後方互換を維持                                    |
| モバイルのボトムシート表示でボタンが見えない             | アクションボタンゾーンの配置をスクロール範囲内に確保し、Phase 4 テストで検証                          |
| `handleAnalyzeSkill` でスキル名 handoff が不要か不明     | 現時点では handoff なしとし、分析画面実装時に再評価する。要件変更が生じた場合は未タスクとして起票する |

---

## 次フェーズ

Phase 2（設計）: 上記スコープに基づき、コンポーネント構造・Props インターフェース・ハンドラの詳細設計を行う。

# 未タスク仕様書: 中間コンポーネント Props 経路設計ガイドライン追加

## メタ情報

```yaml
issue_number: 1419
```

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-IMP-INTERMEDIATE-COMPONENT-PROPS-DESIGN-GUIDE-001 |
| タスク名     | intermediate-component-props-design-guide            |
| 分類         | プロセス改善                                         |
| 優先度       | 中                                                   |
| 見積もり規模 | 小                                                   |
| ステータス   | unassigned                                           |
| 作成日       | 2026-03-19                                           |
| 発生元タスク | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001              |

## 背景

TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 の Phase 5 実装時に、`SkillDetailPanelProps` の拡張は設計書に記載されていたが、内部コンポーネント `PanelContentProps` への `skillName` 追加が設計に含まれていなかった。`onEdit(skillName)` を呼ぶために PanelContent が `skillName` を受け取る必要があり、実装時に追加で Props 経路を設計する必要が生じた。

この問題は、React コンポーネントの Props 設計において「callback に親の state を渡す必要がある場合、中間コンポーネントの Props 経路を明示する」パターンが設計テンプレートに含まれていないことに起因する。

## 苦戦箇所と教訓

### 苦戦箇所: 内部コンポーネント Props への引数追加漏れ

| 項目           | 内容                                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| 課題           | 親コンポーネント（SkillDetailPanel）の Props は設計したが、内部コンポーネント（PanelContent）への Props 追加が漏れた |
| 発見タイミング | Phase 5 実装時に PanelContent 内で `skillName` が参照できないことに気付いた                                          |
| 根本原因       | Props 拡張設計時に、callback が使用する引数の「データフロー経路」を追跡しなかった                                    |
| 解決策         | PanelContentProps に `skillName: string` を追加。親の early return で null ガード済みのため non-null 型で安全        |

### Props 経路設計のパターン

```
親コンポーネント (SkillDetailPanel)
  │ skillName: string | null  ← 外部から受け取る
  │ onEdit?: (skillName: string) => void  ← 外部から受け取る
  │
  ├── early return: !skillName → null  ← null ガード
  │
  └── 中間コンポーネント (PanelContent)
        │ skillName: string  ← null ガード済みなので non-null
        │ onEdit?: (skillName: string) => void  ← パススルー
        │
        └── onClick: () => skillName && onEdit(skillName)
```

### 同種課題の簡潔解決手順（3ステップ）

1. 新規 callback prop を追加する際、その callback が参照する引数を「データフロー図」で追跡する
2. 中間コンポーネントが callback の引数を自前で保持していない場合、Props に追加する
3. 親コンポーネントの early return（null ガード）で型が狭まる箇所を特定し、中間コンポーネントには狭まった型（non-null）で渡す

## 目的

以下のドキュメントに「中間コンポーネント Props 経路設計」のガイドラインを追加する:

1. task-specification-creator の Phase 2 テンプレートの「Props 設計」セクションに、callback 引数のデータフロー追跡チェック項目を追加
2. aiworkflow-requirements の architecture-implementation-patterns に、中間コンポーネント Props 経路パターンを記録

## 対象ファイル

| ファイル                                                                                         | 変更内容                                                              |
| ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `.claude/skills/task-specification-creator/references/phase-templates.md`                        | Phase 2 テンプレートに callback 引数データフロー追跡を追加            |
| `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` 関連 | 中間コンポーネント Props 経路パターンを追加（存在するファイルに追記） |

## 受入基準

| AC   | 内容                                                                                                       |
| ---- | ---------------------------------------------------------------------------------------------------------- |
| AC-1 | Phase 2 テンプレートの Props 設計セクションに「callback 引数のデータフロー追跡」チェック項目が含まれている |
| AC-2 | 中間コンポーネント Props 経路パターン（上記のデータフロー図）がドキュメントに記載されている                |
| AC-3 | null ガード後の型ナロイングを活用した Props 設計の推奨パターンが記載されている                             |

## 参照資料

| 参照資料                             | パス                                                                                               | 内容                                                 |
| ------------------------------------ | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 苦戦箇所の教訓                       | `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md`        | 苦戦箇所4: PanelContentProps への skillName 追加漏れ |
| SkillDetailPanel 実装                | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | Props 経路の実装例                                   |
| Phase 2 テンプレート                 | `.claude/skills/task-specification-creator/references/phase-templates.md`                          | 現行テンプレートを確認                               |
| architecture-implementation-patterns | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns*.md`       | 既存パターン集を確認                                 |

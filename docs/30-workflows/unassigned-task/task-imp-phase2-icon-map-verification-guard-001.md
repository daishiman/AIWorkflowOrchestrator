# 未タスク仕様書: Phase 2 設計テンプレートへの Icon map 確認ステップ追加

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| タスクID     | UT-IMP-PHASE2-ICON-MAP-VERIFICATION-GUARD-001 |
| タスク名     | phase2-icon-map-verification-guard            |
| 分類         | プロセス改善                                  |
| 優先度       | 中                                            |
| 見積もり規模 | 極小                                          |
| ステータス   | unassigned                                    |
| 作成日       | 2026-03-19                                    |
| 発生元タスク | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001       |

## 背景

TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 の Phase 2 設計で `leftIcon="edit-2"` / `leftIcon="bar-chart-2"` を指定したが、Icon コンポーネントの icon map に未登録だったため Phase 5 実装時に置き換えが必要になった。この問題は Phase 2 設計テンプレートに Icon map 確認ステップがないことに起因する。

## 苦戦箇所と教訓

### 苦戦箇所: 設計時のアイコン名検証不足

| 項目     | 内容                                                                                                                                      |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 課題     | Phase 2 コンポーネント設計テンプレートにアイコン名の存在確認ステップがなく、設計と実装の間でアイコン名の手戻りが発生                      |
| 影響     | Phase 5 実装時にアイコン名の変更が必要になり、Phase 2 設計書との乖離が発生                                                                |
| 根本原因 | task-specification-creator の Phase 2 テンプレートに「使用する Icon name が icon map に登録されているか確認する」チェック項目が存在しない |
| 解決策   | Phase 2 テンプレートの「コンポーネント設計」セクションに Icon map 確認チェックを追加                                                      |

### 同種課題の簡潔解決手順

1. Phase 2 設計書で `leftIcon` / `rightIcon` を指定する際は、`grep -n "^  " apps/desktop/src/renderer/components/atoms/Icon/index.tsx` で icon map を確認
2. 存在しないアイコンを使う場合は、Icon map への追加を先行タスクまたは同タスク内で実施

## 目的

task-specification-creator の Phase 2 テンプレートに以下のチェック項目を追加する:

- コンポーネント設計セクション: 「使用する Icon name が `apps/desktop/src/renderer/components/atoms/Icon/index.tsx` の icon map に存在することを確認する」
- 存在しない場合: 「Icon map への追加を先行タスクまたは同タスク Phase 5 で実施する旨を設計書に明記する」

## 対象ファイル

| ファイル                                                                           | 変更内容                                         |
| ---------------------------------------------------------------------------------- | ------------------------------------------------ |
| `.claude/skills/task-specification-creator/references/phase-templates.md`          | Phase 2 テンプレートに Icon map 確認チェック追加 |
| `.claude/skills/task-specification-creator/references/phase-2-design-checklist.md` | 存在する場合、Icon 確認項目を追加                |

## 受入基準

| AC   | 内容                                                             |
| ---- | ---------------------------------------------------------------- |
| AC-1 | Phase 2 テンプレートに Icon map 確認のチェック項目が含まれている |
| AC-2 | 確認コマンド例（grep）がテンプレートに記載されている             |
| AC-3 | 未登録アイコンを使う場合の対応方針がテンプレートに記載されている |

## 参照資料

| 参照資料             | パス                                                                                        | 内容                       |
| -------------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| Phase 2 テンプレート | `.claude/skills/task-specification-creator/references/phase-templates.md`                   | 現行テンプレートを確認     |
| 苦戦箇所の教訓       | `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md` | 苦戦箇所3: Icon map 未登録 |
| Icon コンポーネント  | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`                                 | icon map の構造            |

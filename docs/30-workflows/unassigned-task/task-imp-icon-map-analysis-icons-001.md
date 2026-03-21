# 未タスク仕様書: Icon map への分析系アイコン追加

## メタ情報

```yaml
issue_number: 1418
```

## メタ情報

| 項目         | 内容                                    |
| ------------ | --------------------------------------- |
| タスクID     | UT-IMP-ICON-MAP-ANALYSIS-ICONS-001      |
| タスク名     | icon-map-analysis-icons                 |
| 分類         | UI改善                                  |
| 優先度       | 低                                      |
| 見積もり規模 | 極小                                    |
| ステータス   | unassigned                              |
| 作成日       | 2026-03-19                              |
| 発生元タスク | TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 |

## 背景

TASK-IMP-SKILLDETAIL-ACTION-BUTTONS-001 の Phase 5 実装時に、設計書で指定した `leftIcon="edit-2"` / `leftIcon="bar-chart-2"` が Icon コンポーネントの icon map に未登録であることが判明した。テスト実行時の stderr 警告 `Icon "edit-2" not found in icon map` で発覚。

現在は `pencil`（編集）/ `eye`（分析）で代替しており機能影響はないが、`bar-chart-2`（棒グラフアイコン）は「分析する」ボタンの意味をより正確に伝えるアイコンであり、将来的に追加が望ましい。

## 苦戦箇所と教訓

### 苦戦箇所: Icon map に存在しないアイコン名の使用

| 項目           | 内容                                                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題           | Phase 2 設計で lucide-react の一般的なアイコン名を指定したが、プロジェクト固有の Icon コンポーネントが全アイコンを re-export していなかった |
| 発見タイミング | Phase 5 実装後のテスト実行時（stderr 警告）                                                                                                 |
| 解決策         | `grep` で Icon/index.tsx の icon map を確認し、登録済みアイコンに置き換え                                                                   |
| 再発防止       | Phase 2 設計時に `leftIcon` 指定前に icon map の存在確認を必須化する                                                                        |

### 同種課題の簡潔解決手順（3ステップ）

1. `grep -n "export\|const.*:" apps/desktop/src/renderer/components/atoms/Icon/index.tsx` で利用可能なアイコン一覧を確認
2. 利用可能なアイコンから意味的に最も近いものを選択
3. テスト実行時の stderr に `Icon "..." not found` が出ないことを確認

## 目的

Icon コンポーネント（`apps/desktop/src/renderer/components/atoms/Icon/index.tsx`）の icon map に以下のアイコンを追加する:

- `edit-2`（EditIcon の別名 - lucide-react の Edit2）
- `bar-chart-2`（BarChart2 - lucide-react の BarChart2）

## 対象ファイル

| ファイル                                                        | 変更内容                                                          |
| --------------------------------------------------------------- | ----------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`     | lucide-react から Edit2 / BarChart2 を import し、icon map に追加 |
| `apps/desktop/src/renderer/components/atoms/Icon/Icon.test.tsx` | 新アイコンのレンダリングテスト追加                                |

## 受入基準

| AC   | 内容                                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| AC-1 | `<Icon name="edit-2" />` がレンダリングされる                                                                 |
| AC-2 | `<Icon name="bar-chart-2" />` がレンダリングされる                                                            |
| AC-3 | 既存の Icon テストが全て PASS する                                                                            |
| AC-4 | SkillDetailPanel のアイコンを `pencil` → `edit-2`、`eye` → `bar-chart-2` に戻せる状態になる（変更は別タスク） |

## 参照資料

| 参照資料            | パス                                                                                               | 内容                       |
| ------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- |
| Icon コンポーネント | `apps/desktop/src/renderer/components/atoms/Icon/index.tsx`                                        | 現行 icon map を確認       |
| lucide-react        | `node_modules/lucide-react`                                                                        | 利用可能なアイコン一覧     |
| 苦戦箇所の教訓      | `.claude/skills/aiworkflow-requirements/references/lessons-learned-viewtype-electron-ui.md`        | 苦戦箇所3: Icon map 未登録 |
| SkillDetailPanel    | `apps/desktop/src/renderer/views/SkillCenterView/components/SkillDetailPanel/SkillDetailPanel.tsx` | アイコン使用箇所           |

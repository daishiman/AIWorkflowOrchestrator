# 検索パネル UI/UX 改善タスク

## 概要

検索・置換機能のUI/UXを`.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`の仕様に合わせて改善する。

## 背景

現在の実装は機能的には動作するが、UI/UX仕様との差分がある。

## 現状 vs 仕様

| 項目                     | 仕様                                      | 現在の実装   | 状態     |
| ------------------------ | ----------------------------------------- | ------------ | -------- |
| パネル形式               | UnifiedSearchPanel（タブ切り替え）        | 個別パネル   | 差分あり |
| タブバー                 | 上部に3タブ（ファイル内/全体/ファイル名） | タブバーなし | 差分あり |
| キーボードショートカット | 仕様通り                                  | 実装済み     | OK       |
| アクセシビリティ         | WCAG 2.1 AA                               | 実装済み     | OK       |
| 検索オプションボタン     | Aa, Ab, .\*                               | 実装済み     | OK       |

## 改善項目

### 1. UnifiedSearchPanel への統合

現在の3つのパネルを1つのUnifiedSearchPanelに統合：

- `SearchPanel.tsx` (ファイル内検索)
- `WorkspaceSearchPanel.tsx` (ワークスペース検索)
- `UnifiedSearchPanel.tsx` (ファイル名検索) → 統合元

### 2. タブバー実装

```
┌─────────────────────────────────────────────────┐
│ [ファイル内] [全体検索] [ファイル名]        [×] │
├─────────────────────────────────────────────────┤
│ [🔍 検索...]  [Aa] [Ab] [.*]  [1/5]  [↑][↓]   │
├─────────────────────────────────────────────────┤
│ [置換...]                    [置換] [全置換]   │
└─────────────────────────────────────────────────┘
```

### 3. アイコンライブラリの統一

Lucide Icons を標準採用（仕様に準拠）

## 関連ファイル

- `.claude/skills/aiworkflow-requirements/references/ui-ux-panels.md`
- `apps/desktop/src/features/search/components/`
- `apps/desktop/src/renderer/views/EditorView/index.tsx`

## 優先度

MEDIUM - 機能は動作するため、UIリファクタリングは次フェーズで実施

## 検出日

2026-01-06

## 関連タスク

- `task-imp-search-ui-001` (検索・置換機能 UI実装)

| issue_number | 572 |

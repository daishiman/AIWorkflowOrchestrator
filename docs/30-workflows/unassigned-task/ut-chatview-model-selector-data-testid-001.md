# UT-CHATVIEW-MODEL-SELECTOR-DATA-TESTID-001

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| 未タスクID | UT-CHATVIEW-MODEL-SELECTOR-DATA-TESTID-001           |
| 優先度     | Low                                                  |
| 検出元     | TASK-UI-CHATVIEW-MODEL-SELECTOR-INTEGRATION Phase 12 |
| 検出日     | 2026-03-23                                           |
| 関連タスク | TASK-UI-INLINE-MODEL-SELECTOR-COMPONENT (Task 01)    |

## 概要

InlineModelSelector コンポーネントのルート要素に `data-testid="inline-model-selector"` を追加する。

## 背景

Phase 4 仕様書では `data-testid="inline-model-selector"` を使ったテストを想定していたが、InlineModelSelector コンポーネントには `data-testid` が付与されていない。テストでは `role="combobox"` で代替しているため機能的な問題はないが、E2E テスト（Playwright）での要素特定や、複数の combobox が同一画面に存在する場合の識別性向上のために `data-testid` の追加が望ましい。

## 対応内容

1. `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` のルート `<div>` に `data-testid="inline-model-selector"` を追加
2. 既存テスト（InlineModelSelector.test.tsx）で `data-testid` を使ったアサーションを追加（任意）

## 影響ファイル

| ファイル                                                           | 変更種別        |
| ------------------------------------------------------------------ | --------------- |
| `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx` | 修正（1行追加） |

## 優先度判断

機能影響なし。テスト品質の向上のみ。低優先度。

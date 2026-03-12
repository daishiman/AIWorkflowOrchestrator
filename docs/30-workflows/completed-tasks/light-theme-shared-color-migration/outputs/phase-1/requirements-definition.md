# Phase 1 Output: Requirements Definition

## 概要

本タスクは light theme token baseline の再設計ではなく、component 層に残った hardcoded color の移行計画を作る。

## inventory ルール

- 検出数は `rg -n 'text-white|bg-white|border-white|text-slate|bg-slate|border-slate|text-zinc|bg-zinc|border-zinc|text-gray|bg-gray|border-gray|#[0-9A-Fa-f]{3,8}'` の hit lines を使う
- コメントや仕様説明ではなく、Renderer 実装に残る neutral / accent hardcode を主対象とする
- hit 数だけでなく shared leverage と isolation を加味して batch を決める

## 現物 inventory

| 対象                         | 検出数 | 代表パターン                                       | 判定        |
| ---------------------------- | ------ | -------------------------------------------------- | ----------- |
| `WorkspaceSearchPanel.tsx`   | 39     | `bg-slate-800`, `text-white`, `bg-blue-500`        | Batch D     |
| `AccountSection/index.tsx`   | 22     | `text-white`, `bg-white/10`, `border-white/20`     | Batch B     |
| `AuthKeySection/index.tsx`   | 21     | `bg-[#007AFF]`, `text-gray-700`, `border-gray-300` | Batch B     |
| `ApiKeysSection/index.tsx`   | 14     | `bg-white/5`, `text-white/60`, `text-white`        | Batch B     |
| `AuthModeSelector/index.tsx` | 6      | `bg-[#F5F5F7]`, `bg-[#007AFF]`, `text-[#1D1D1F]`   | Batch A     |
| `ThemeSelector/index.tsx`    | 4      | `bg-white/5`, `border-white/10`, `text-white/60`   | Batch A     |
| `AuthView/index.tsx`         | 4      | `text-white`, `text-white/40`, `text-white/60`     | Batch C     |
| `SettingsView/index.tsx`     | 0      | semantic token ベース                              | Verify only |
| `SettingsCard/index.tsx`     | 0      | semantic token ベース                              | Verify only |
| `DashboardView/index.tsx`    | 0      | semantic token ベース                              | Verify only |

## 機能要件

| ID   | 要件                                                                |
| ---- | ------------------------------------------------------------------- |
| FR-1 | 残件 component を batch 単位で分類する                              |
| FR-2 | neutral hardcode と accent hardcode を分離して扱う                  |
| FR-3 | token foundation task と regression guard task の責務境界を明記する |
| FR-4 | Phase 4 が流用できる existing test anchor を batch ごとに固定する   |
| FR-5 | Phase 11 が流用できる representative screen を batch ごとに定義する |
| FR-6 | batch ごとの `aiworkflow-requirements` 抽出マトリクスを残す         |

## 非機能要件

| ID    | 要件                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| NFR-1 | 新規 color value を local hardcode しない                                          |
| NFR-2 | `SettingsView` 公開シェルの安全性契約を崩さない                                    |
| NFR-3 | current build capture と screenshot root pinning を考慮した manual-test 設計にする |
| NFR-4 | commit / PR / 実装実行を含めない                                                   |
| NFR-5 | `.claude/skills` を canonical root として system spec を参照する                   |
| NFR-6 | verification-only 対象は無関係な実装 diff を入れない                               |

## 受入基準詳細

| AC   | 詳細                                                                 |
| ---- | -------------------------------------------------------------------- |
| AC-1 | inventory が現物コードと一致する                                     |
| AC-2 | Batch A-E / verification-only が定義される                           |
| AC-3 | timeout fallback / token / regression guard が別責務として整理される |
| AC-4 | 既存 tests / harness / system spec extraction が列挙される           |
| AC-5 | Phase 1-3 outputs が実体として存在する                               |

## verification-only 対象

- `SettingsView/index.tsx`
- `SettingsCard/index.tsx`
- `DashboardView/index.tsx`

理由: 現時点の hardcoded color inventory では主要残件ではなく、future implementation では「壊していないことの確認」に留める方が責務分離に合う。

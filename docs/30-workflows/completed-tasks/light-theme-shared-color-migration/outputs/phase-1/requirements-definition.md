# Phase 1 Output: Requirements Definition

## 概要

本タスクは light theme token baseline の再設計ではなく、component 層に残った hardcoded color の移行計画を作る。

## 現物 inventory

| 対象                         | 検出数 | 代表パターン                                     | 判定        |
| ---------------------------- | ------ | ------------------------------------------------ | ----------- |
| `WorkspaceSearchPanel.tsx`   | 41     | `bg-slate-800`, `text-white`, `bg-blue-500`      | Batch D     |
| `AccountSection/index.tsx`   | 27     | `text-white`, `bg-white/10`, `border-white/20`   | Batch B     |
| `ApiKeysSection/index.tsx`   | 14     | `bg-white/5`, `text-white/60`, `text-white`      | Batch B     |
| `AuthView/index.tsx`         | 5      | `text-white`, `text-white/40`, `text-white/60`   | Batch C     |
| `ThemeSelector/index.tsx`    | 4      | `bg-white/5`, `border-white/10`, `text-white/60` | Batch A     |
| `AuthModeSelector/index.tsx` | 3      | `bg-[#007AFF]`, `text-white`                     | Batch A     |
| `AuthKeySection/index.tsx`   | 2      | `bg-[#007AFF]`, `hover:bg-[#0066D6]`             | Batch A     |
| `SettingsView/index.tsx`     | 0      | semantic token ベース                            | Verify only |
| `SettingsCard/index.tsx`     | 0      | semantic token ベース                            | Verify only |
| `DashboardView/index.tsx`    | 0      | semantic token ベース                            | Verify only |

## 機能要件

| ID   | 要件                                                                |
| ---- | ------------------------------------------------------------------- |
| FR-1 | 残件 component を batch 単位で分類する                              |
| FR-2 | neutral hardcode と accent hardcode を分離して扱う                  |
| FR-3 | token foundation task と regression guard task の責務境界を明記する |
| FR-4 | Phase 4 が流用できる existing test anchor を batch ごとに固定する   |
| FR-5 | Phase 11 が流用できる representative screen を batch ごとに定義する |

## 非機能要件

| ID    | 要件                                                                               |
| ----- | ---------------------------------------------------------------------------------- |
| NFR-1 | 新規 color value を local hardcode しない                                          |
| NFR-2 | `SettingsView` 公開シェルの安全性契約を崩さない                                    |
| NFR-3 | current build capture と screenshot root pinning を考慮した manual-test 設計にする |
| NFR-4 | commit / PR / 実装実行を含めない                                                   |
| NFR-5 | `.claude/skills` を canonical root として system spec を参照する                   |

## 受入基準詳細

| AC   | 詳細                                                                 |
| ---- | -------------------------------------------------------------------- |
| AC-1 | inventory が現物コードと一致する                                     |
| AC-2 | P1/P2/verification-only が定義される                                 |
| AC-3 | timeout fallback / token / regression guard が別責務として整理される |
| AC-4 | 既存 tests と harness が列挙される                                   |
| AC-5 | Phase 1-3 outputs が実体として存在する                               |

## verification-only 対象

- `SettingsView/index.tsx`
- `SettingsCard/index.tsx`
- `DashboardView/index.tsx`

理由: 現時点の hardcoded color inventory では主要残件ではなく、future implementation では「壊していないことの確認」に留める方が責務分離に合う。

# 状態管理パターン（Desktop Renderer）

## 概要
この親仕様書はアーキテクチャ全体像の入口であり、詳細レイヤー / surface / support は child companion へ分離した。
旧連番 suffix の reference child は semantic filename へ移行済み。旧 filename と current filename の対応や migration 根拠が必要なときは `legacy-ordinal-family-register.md` を参照する。

## 仕様書インデックス
| ファイル | 役割 | 主な見出し |
| --- | --- | --- |
| [arch-state-management-core.md](arch-state-management-core.md) | core specification | UI Design Foundation 状態管理方針（TASK-UI-00-DESIGN-FOUNDATION） / Store Slice Baseline（TASK-UI-01-A-STORE-SLICE-BASELINE） / Workspace Layout 基盤（TASK-UI-04A-WORKSPACE-LAYOUT） / Workspace Preview / Quick Search（TASK-UI-04C-WORKSPACE-PREVIEW） |
| [arch-state-management-details.md](arch-state-management-details.md) | detail specification | Zustand Sliceパターン |
| [arch-state-management-advanced.md](arch-state-management-advanced.md) | advanced specification | P31対策: Store Hooks無限ループ防止パターン |
| [arch-state-management-reference.md](arch-state-management-reference.md) | reference bundle (loop guard / chat edit / skill slice baseline) | P31対策: Store Hooks無限ループ防止パターン / chatEditSlice（Workspace Chat Edit状態管理） / skillSlice（統合済み - TASK-FIX-6-1-STATE-CENTRALIZATION） |
| [arch-state-management-reference-permissions-import-lifecycle.md](arch-state-management-reference-permissions-import-lifecycle.md) | reference bundle (permissions / import defense / lifecycle integration) | permissionHistorySlice（権限要求履歴管理） / Skill Advanced Views 状態管理設計（TASK-UI-05B / completed） / Skill Import / SkillCenter 防御状態管理（2026-03-04） / TASK-10A-E-C: Store駆動ライフサイクル統合（2026-03-06） |
| [arch-state-management-reference-persist-hardening-test-quality.md](arch-state-management-reference-persist-hardening-test-quality.md) | reference bundle (persist hardening / test quality gate) | Persist Iterable Hardening（TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001） / TASK-043D: テスト品質ゲート設計（2026-03-08） |
| [arch-state-management-history.md](arch-state-management-history.md) | history bundle | 変更履歴 / 関連ドキュメント |

## 利用順序
- まずこの親仕様書で対象 child companion を選ぶ。
- 実装や契約の詳細は `core` / `details` / `advanced` 系を読む。
- 完了タスク、変更履歴、補助情報は `history` / `archive` 系を読む。

## 関連ドキュメント
- `indexes/quick-reference.md`
- `indexes/resource-map.md`

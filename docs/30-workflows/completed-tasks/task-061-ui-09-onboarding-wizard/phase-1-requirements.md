# Phase 1: Requirements

## メタ情報

| 項目         | 内容       |
| ------------ | ---------- |
| Phase        | 1          |
| Phase名      | 要件定義   |
| ステータス   | completed  |
| 作成日       | 2026-03-13 |
| 担当SubAgent | SubAgent-A |

## 目的

原本 task-061 の意図を current codebase の UI 契約、保存契約、テーマ契約、公開シェル契約へ接続し、実装前提を固定する。

## 実行タスク

- 要件差分整理: 原本 task と `App.tsx` / `SettingsView` / `store` の差分を抽出する
- 保存契約固定: onboarding の保存キーと完了条件を明文化する
- UI範囲確定: wizard 本体、Settings 再表示導線、Dashboard 反映範囲を区切る
- 非機能要求整理: keyboard、focus、responsive、theme、公開シェル制約を定義する

## 参照資料

| 参照資料      | パス                                                                          | 用途           |
| ------------- | ----------------------------------------------------------------------------- | -------------- |
| 原本タスク    | `docs/30-workflows/completed-tasks/task-061-ui-09-onboarding-wizard/index.md` | 方向性確認     |
| 要件定義書    | `outputs/phase-1/requirements-definition.md`                                  | FR/NFR の正本  |
| 受け入れ基準  | `outputs/phase-1/acceptance-criteria.md`                                      | 完了条件の基準 |
| スコープ定義  | `outputs/phase-1/scope-definition.md`                                         | 対象外の固定   |
| SubAgent 分担 | `outputs/phase-1/subagent-ownership.md`                                       | 関心ごとの分離 |

## 統合テスト連携

| 観点            | 後続Phase      | 連携内容                                                     |
| --------------- | -------------- | ------------------------------------------------------------ |
| 初回表示        | Phase 4, 11    | `onboarding.hasCompleted=false` の表示条件をテストへ接続する |
| 名前反映        | Phase 4, 5     | `useDisplayName()` の fallback 条件をテストへ接続する        |
| Settings 再表示 | Phase 4, 5, 11 | `SettingsView` header button の導線を接続する                |

## 成果物

- `outputs/phase-1/requirements-definition.md`
- `outputs/phase-1/acceptance-criteria.md`
- `outputs/phase-1/scope-definition.md`
- `outputs/phase-1/subagent-ownership.md`

## 完了条件

- [x] FR と NFR が current shell / state / theme 契約へ接続されている
- [x] `electronAPI.store` 再利用方針が要件段階で固定されている
- [x] Settings 再表示と Dashboard 表示名反映が同一タスク境界で整理されている

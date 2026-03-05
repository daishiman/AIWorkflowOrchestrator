# Phase 8 リファクタ計画

- 作成日: 2026-03-04
- 対象タスク: TASK-UI-00-ORGANISMS
- 目的: 外部契約を変えずに保守性と検証性を上げる

## SubAgent分担

| SubAgent               | 関心ごと | 予定成果物               |
| ---------------------- | -------- | ------------------------ |
| SubAgent-REF-Structure | 構造整理 | `refactor-result.md`     |
| SubAgent-REF-Test      | 回帰確認 | `refactor-validation.md` |

## リファクタ対象（優先順）

1. Organisms 公開境界の明確化

- 対象: `apps/desktop/src/renderer/components/organisms/index.ts`
- 方針: CardGrid / MasterDetailLayout / SearchFilterList の再利用導線を export 一覧で固定する。

2. 手動検証導線の分離

- 対象: `apps/desktop/src/renderer/views/OrganismsShowcaseView/index.tsx`, `apps/desktop/src/renderer/App.tsx`
- 方針: 既存画面の挙動に影響しない専用ルート（`/advanced/organisms-showcase`）を追加する。

3. スクリーンショット取得の安定化

- 対象: `apps/desktop/scripts/capture-organisms-components-screenshots.mjs`
- 方針: モバイル時は要素単位キャプチャを使い、重複証跡を防ぐ。

## 非対象（意図的に実施しない項目）

- Organisms 3コンポーネントの外部 Props 契約変更
- Store 参照導入（P31 回避のため props 駆動を維持）
- Main / Preload / IPC 契約変更

## 完了条件

- [x] 外部 API 互換を維持したまま導線整理が完了
- [x] 変更後に対象テストが Green
- [x] Typecheck / ESLint（直接実行）でエラーなし

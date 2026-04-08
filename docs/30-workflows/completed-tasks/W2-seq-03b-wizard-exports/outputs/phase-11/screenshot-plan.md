# W2-seq-03b スクリーンショット計画

## タスク情報

- タスクID: UT-SKILL-WIZARD-W2-seq-03b
- 対象: wizard/index.ts エクスポート更新
- 実施日: 2026-04-08

## 判定

本タスクは `wizard/index.ts` の export 契約更新とドキュメント同期が中心で、UI の表示変更はない。
そのため、`outputs/phase-11/screenshots/` への新規スクリーンショット保存は不要。

## 代替証跡

- `docs/30-workflows/W2-seq-03b-wizard-exports/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/W2-seq-03b-wizard-exports/outputs/phase-11/evidence-index.md`
- `pnpm --filter @repo/desktop exec tsc --noEmit`

## 将来対応

将来 UI 変更が発生した場合のみ、`outputs/phase-11/screenshots/` に PNG を保存する。

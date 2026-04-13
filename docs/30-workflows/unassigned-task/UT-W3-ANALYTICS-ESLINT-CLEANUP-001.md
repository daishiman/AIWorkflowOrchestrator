# UT-W3-ANALYTICS-ESLINT-CLEANUP-001: analyticsHandler 周辺の ESLint warnings 解消

## 概要

`apps/desktop/src/main/ipc/analyticsHandler.ts` および関連ファイルに残存する ESLint warnings 8 件を解消する。
これらは既存コードに由来し、UT-W3-ANALYTICS-HTTP-PROVIDER-001 のスコープ外として持ち越しとなった技術的負債。

## 背景

UT-W3-ANALYTICS-HTTP-PROVIDER-001 の Phase 12 スキルフィードバックレポートにて記録。
本実装作業中に ESLint warnings 8 件が確認されたが、いずれも既存コードに由来するため本タスクのスコープ外と判断された。
放置すると CI の警告ノイズが増え、真に重要な警告が埋もれるリスクがある。

## 受入基準

- [ ] `pnpm --filter @repo/desktop lint` 実行時に analyticsHandler 関連の warnings が 0 件になること
- [ ] 修正により既存テスト（TC-01〜TC-08、TC-E01〜TC-E05）が全て PASS すること
- [ ] 警告の抑制（`eslint-disable` コメント）ではなく根本修正を行うこと
- [ ] `pnpm typecheck` が PASS すること

## 苦戦箇所（UT-W3-ANALYTICS-HTTP-PROVIDER-001 より）

- **ESLint warnings の事前確認不足**: タスク開始前に既存 warnings を把握していなかったため、
  実装中に想定外の警告が発生した。本タスクでは `pnpm lint --max-warnings 0` を Phase 1 完了の条件として設定すること。
- **manifest parity の早期同期**: `artifacts.json` と `outputs/artifacts.json` の不一致を最終レビュー前に発見した。
  本タスクでも Phase 5 完了時に parity チェックを実施すること。

## 優先度

LOW

## 関連

- UT-W3-ANALYTICS-HTTP-PROVIDER-001（発生元タスク）
- `apps/desktop/src/main/ipc/analyticsHandler.ts`
- `apps/desktop/src/main/ipc/__tests__/analyticsHandler.test.ts`
- スキルフィードバックレポート（`docs/30-workflows/UT-W3-ANALYTICS-HTTP-PROVIDER-001/outputs/phase-12/skill-feedback-report.md`）

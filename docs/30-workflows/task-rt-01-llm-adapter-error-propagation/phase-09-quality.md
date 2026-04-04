# Phase 9: 品質保証 - LLMAdapter 初期化エラー UI 通知・状態公開

## メタ情報

| 項目    | 値                                                   |
| ------- | ---------------------------------------------------- |
| Phase   | 9 - 品質保証                                         |
| 機能名  | task-rt-01-llm-adapter-error-propagation             |
| 作成日  | 2026-04-04                                           |
| 前Phase | [Phase 8: リファクタリング](phase-08-refactoring.md) |

## 目的

typecheck・vitest・ESLint を全て PASS させ、Phase 10 最終レビューゲートに向けた品質基準を満たす。
本 Phase で全チェックが GREEN になることが Phase 10 進行の必要条件。

## 参照資料

| 資料名         | パス                 | 用途     |
| -------------- | -------------------- | -------- |
| Phase 2 設計書 | `phase-02-design.md` | 設計確認 |
| Phase 5 成果物 | `outputs/phase-5/`   | 実装参照 |

## 実行タスク

- **TypeScript 型チェック**: `pnpm --filter @repo/desktop typecheck` を PASS させる
- **全テスト実行**: 本タスク関連テストが全て PASS することを確認する
- **ESLint チェック**: `pnpm --filter @repo/desktop lint` を PASS させる
- **Prettier チェック**: フォーマット済みであることを確認する
- **受入条件照合**: Phase 1 の AC-1〜AC-8 に対して実装が満足しているか確認する

## チェックコマンド

```bash
# 1. TypeScript 型チェック
pnpm --filter @repo/desktop typecheck

# 2. 本タスク関連テスト
pnpm --filter @repo/desktop vitest run \
  src/main/ipc/__tests__/creatorHandlers.adapterStatus.test.ts \
  src/renderer/components/skill/__tests__/LLMAdapterErrorBanner.test.tsx \
  src/renderer/components/skill/hooks/__tests__/useLLMAdapterStatus.test.ts

# 3. ESLint
pnpm --filter @repo/desktop lint

# 4. 全テスト（リグレッション確認）
pnpm --filter @repo/desktop vitest run
```

## 受入条件チェックリスト（Phase 1 AC 照合）

| AC   | 内容                                                                                  | 実装箇所                                                                 | 判定 |
| ---- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---- |
| AC-1 | APIキー未設定時に `SkillLifecyclePanel` 上部にエラーバナーが表示される                | `SkillLifecyclePanel` + `useLLMAdapterStatus` + `LLMAdapterErrorBanner`  | 確認 |
| AC-2 | エラーバナーに actionable なメッセージ（「APIキーを設定してください」等）が含まれる   | `LLMAdapterErrorBanner.buildMessage()`                                   | 確認 |
| AC-3 | `skill-creator:get-adapter-status` invoke で `{ status, failureReason }` が返る       | `creatorHandlers.ts` + `channels.ts`                                     | 確認 |
| AC-4 | `setLLMAdapterFailed()` 呼び出し後に `adapter-status-changed` push が Renderer に届く | `Facade.onAdapterStatusChanged` → `creatorHandlers.ts` push ワイヤリング | 確認 |
| AC-5 | UI が `"ready"` / `"initializing"` / `"failed"` の 3 状態を正しく表示・切り替えられる | `LLMAdapterErrorBanner` + `useLLMAdapterStatus`                          | 確認 |
| AC-6 | 正常な API キー設定時（status が `"ready"`）にはエラーバナーが表示されない            | `LLMAdapterErrorBanner`: `status !== "failed"` → null                    | 確認 |
| AC-7 | 全 TypeScript 型チェックが通る                                                        | `pnpm --filter @repo/desktop typecheck`                                  | 確認 |
| AC-8 | 新規追加テストが全て PASS する                                                        | Phase 4・6 テストファイル                                                | 確認 |

## 品質チェック結果テーブル（実行後に記入）

| チェック項目               | コマンド                 | 結果 | エラー内容（あれば） |
| -------------------------- | ------------------------ | ---- | -------------------- |
| TypeScript 型チェック      | `typecheck`              | —    | —                    |
| 本タスクテスト             | `vitest run (3ファイル)` | —    | —                    |
| ESLint                     | `lint`                   | —    | —                    |
| 全テスト（リグレッション） | `vitest run`             | —    | —                    |

## エラー発生時の対応方針

| エラー種別        | 対応フェーズ                             |
| ----------------- | ---------------------------------------- |
| TypeScript エラー | Phase 5 実装コードを修正                 |
| テスト FAIL       | Phase 5 実装または Phase 4 テストを修正  |
| ESLint エラー     | Phase 8 リファクタリングで修正           |
| リグレッション    | 影響範囲を調査し、Phase 5 修正後に再実行 |

## 多角的チェック観点（AIが判断）

| 観点           | 確認内容                                                      |
| -------------- | ------------------------------------------------------------- |
| 受入条件網羅性 | AC-1〜AC-8 が全て実装で満たされているか                       |
| リグレッション | 既存テストが新規実装によって破壊されていないか                |
| 型安全         | `any` 型の使用が最小化されているか（`strict: true` 設定前提） |

## サブタスク管理

| ID     | 内容                           | ステータス |
| ------ | ------------------------------ | ---------- |
| ST-9-1 | TypeScript 型チェック PASS     | 未実施     |
| ST-9-2 | 本タスクテスト全 PASS          | 未実施     |
| ST-9-3 | ESLint PASS                    | 未実施     |
| ST-9-4 | 全テスト（リグレッション）PASS | 未実施     |
| ST-9-5 | 受入条件 AC-1〜AC-8 照合       | 未実施     |

## 成果物

| 成果物                   | パス                                      |
| ------------------------ | ----------------------------------------- |
| 品質チェック結果レポート | `outputs/phase-9/quality-check-report.md` |
| 受入条件照合結果         | `outputs/phase-9/ac-verification.md`      |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] 本タスク関連テスト（3ファイル）が全て PASS している
- [ ] `pnpm --filter @repo/desktop lint` が PASS している
- [ ] 全テスト実行でリグレッションが発生していない
- [ ] 受入条件 AC-1〜AC-8 が全て満たされている

## タスク100%実行確認【必須】

- [ ] 上記「完了条件」を全て達成した
- [ ] 成果物を `outputs/phase-9/` に配置した
- [ ] `artifacts.json` の Phase 9 を `completed` に更新した

## 統合テスト連携

本 Phase のテスト成果物は後続 Phase の品質確認・ゲート判定に使用される。

| Phase   | 連携内容                                  |
| ------- | ----------------------------------------- |
| Phase 5 | テスト GREEN を確認してから実装完了とする |
| Phase 9 | 品質保証フェーズで最終確認する            |

## 次Phase

Phase 9 完了後 → [Phase 10: 最終レビューゲート](phase-10-final-review.md) へ進む

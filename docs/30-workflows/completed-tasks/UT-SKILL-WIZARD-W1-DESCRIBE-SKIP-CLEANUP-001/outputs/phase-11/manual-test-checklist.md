# Phase 11 手動テストチェックリスト

## タスクID: UT-SKILL-WIZARD-W1-DESCRIBE-SKIP-CLEANUP-001

## タスク種別: NON_VISUAL

スクリーンショット不要（テストファイルのみの変更）。

## チェックリスト

| MT番号 | シナリオ                                           | 手順                                                                            | 期待結果      | 実施結果 |
| ------ | -------------------------------------------------- | ------------------------------------------------------------------------------- | ------------- | -------- |
| MT-01  | `skill-lifecycle-request-input` 参照の残存確認     | `grep -rn "skill-lifecycle-request-input" apps/desktop/src/.../__tests__/` 実行 | マッチ 0 件   | ✅ PASS  |
| MT-02  | `pnpm --filter @repo/desktop test:run` が全件 PASS | `pnpm --filter @repo/desktop test:run` を実行する                               | 全テスト PASS | ✅ PASS  |
| MT-03  | `pnpm --filter @repo/desktop typecheck` が PASS    | `pnpm --filter @repo/desktop typecheck` を実行する                              | エラー 0 件   | ✅ PASS  |

## NON_VISUAL 判定根拠

本タスクはテストファイル（`.test.tsx`）のみの変更であり、UI 変更なし。
スクリーンショットは不要で、CLI 出力のテキスト証跡により検証を実施する。

---

_作成日: 2026-04-11_

# Phase 4: テスト計画 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 4                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## テスト計画

| テストID | 観点             | コマンド / 方法                                                                                                                              | 期待結果                  | AC    |
| -------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----- |
| T-01     | runtime 判定     | `node -p "process.platform + '-' + process.arch"`                                                                                            | `darwin-arm64`            | AC-02 |
| T-02     | 対象テスト       | `pnpm --filter @repo/desktop exec -- npx vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts` | exit 0, 27 tests passed   | AC-01 |
| T-03     | mismatch 不在    | テスト出力確認                                                                                                                               | mismatch 系メッセージなし | AC-03 |
| T-04     | ドキュメント存在 | `test -f docs/40-guides/esbuild-arch-mismatch-prevention.md`                                                                                 | exit 0                    | AC-04 |
| T-05     | ドキュメント内容 | `grep` で `process.arch` / `pnpm install --force` / worktree checklist を確認                                                                | 必須項目あり              | AC-05 |

## Red 判定ルール

| 項目                  | Red 条件                                                   |
| --------------------- | ---------------------------------------------------------- |
| runtime / binary 整合 | pnpm 仮想ストアに対応する `@esbuild/darwin-*` が存在しない |
| 対象テスト            | exit code != 0                                             |
| 出力                  | mismatch 系メッセージが含まれる                            |
| ドキュメント          | ガイドが存在しない、または必須項目が欠ける                 |

## 完了条件

- [x] Red 状態の取得方法を定義した
- [x] AC 対応付きのテスト計画を定義した
- [x] 再検証時に同じコマンドを使えるようにした
- [x] 本Phase内の全タスクを100%実行完了

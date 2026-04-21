# Phase 9: 品質保証

## メタ情報

| 項目       | 値                                                   |
| ---------- | ---------------------------------------------------- |
| Phase      | 9                                                    |
| タスクID   | TASK-SC-08-FUP-02-PAYLOAD-TRACKING-ID                |
| タスク種別 | NON_VISUAL code task                                 |
| 前Phase    | [phase-8-refactoring.md](phase-8-refactoring.md)     |
| 次Phase    | [phase-10-final-review.md](phase-10-final-review.md) |

## 目的

typecheck / lint / targeted test / spec parity の 4 系統で品質ゲートを通過させ、
AC-9「`pnpm --filter @repo/desktop typecheck` / `lint` / targeted test が PASS」を充足する。

## 品質ゲートコマンド【必須】

```bash
# 型チェック（AC-1 / AC-2 配線の整合性確認）
pnpm --filter @repo/desktop typecheck

# Lint（preload / main / renderer 4 ファイルの静的解析）
pnpm --filter @repo/desktop lint

# targeted test: Renderer Hook filter 4 シナリオ（AC-4 / AC-5 / AC-6 / AC-7）
pnpm --filter @repo/desktop test -- --run useStreamingProgress

# targeted test: Main IPC 送信シグネチャ回帰（AC-2 / AC-8）
pnpm --filter @repo/desktop test -- --run skillCreatorHandlers

# ルート lint（monorepo 全体の整合性）
pnpm lint
```

## ゲート判定基準

| コマンド                                                | 期待結果 | AC 対応      |
| ------------------------------------------------------- | -------- | ------------ |
| `pnpm --filter @repo/desktop typecheck`                 | PASS     | AC-1 / AC-2  |
| `pnpm --filter @repo/desktop lint`                      | PASS     | AC-9         |
| `pnpm --filter @repo/desktop test useStreamingProgress` | PASS     | AC-4 〜 AC-8 |
| `pnpm --filter @repo/desktop test skillCreatorHandlers` | PASS     | AC-2 / AC-8  |
| `pnpm lint` (root)                                      | PASS     | AC-9         |

## spec parity 確認

- `artifacts.json` と `outputs/artifacts.json` の paths 一致
- `index.md` に記載された phase 成果物パスと、各 phase 仕様書 `成果物` 表の一致
- Phase 1-8 の `outputs/phase-N/` 配下に宣言済み成果物が揃っている

## 実行タスク

- 5 つの品質ゲートコマンドを実行して結果を記録する
- PASS / BLOCKED を AC と紐付ける
- spec parity の同期状態を確認する

## 成果物

| 成果物              | パス                                     |
| ------------------- | ---------------------------------------- |
| quality gate report | `outputs/phase-9/quality-gate-report.md` |

## 参照資料

- [phase-1-requirements.md](phase-1-requirements.md) — AC-1 〜 AC-9
- [phase-4-test-creation.md](phase-4-test-creation.md) — targeted test 4 シナリオ
- [phase-8-refactoring.md](phase-8-refactoring.md) — refactor 後の behavior 非変更担保
- `.claude/skills/aiworkflow-requirements/references/quality-requirements-core.md`

## 統合テスト連携

- targeted test の実行結果を Main / Renderer 両方の回帰証跡として扱う
- ここで得た結果を Phase 10 の AC 判定、Phase 11 の manual-test evidence、Phase 12 の close-out に引き継ぐ

## 完了条件

- [ ] 5 つの品質ゲートコマンド全てが PASS している
- [ ] 各コマンドの PASS エビデンス（log 出力 or 要約）が記録されている
- [ ] AC-9 への PASS 紐付けが明示されている
- [ ] `artifacts.json` parity 確認結果が記録されている
- [ ] `index.md` と各 phase 成果物名の一致が確認されている

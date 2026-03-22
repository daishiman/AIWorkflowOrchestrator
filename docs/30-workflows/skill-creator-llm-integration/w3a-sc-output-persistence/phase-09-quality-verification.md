# Phase 9: 品質検証

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 9                             |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |

## 目的

Lint・型チェック・全テスト実行を行い、SkillFileWriter および execute() 改修のコードが品質基準を満たすことを確認する。

## 実行タスク

1. **ESLint 実行**
   - `pnpm --filter @repo/desktop lint` を実行する
   - `apps/desktop/src/main/services/skill/SkillFileWriter.ts` を含む全エラー・警告を解消する
   - 未使用 import が残っていないことを確認する
2. **TypeScript 型チェック実行**
   - `pnpm --filter @repo/desktop typecheck` を実行する
   - `strict: true` 環境で全型エラーがゼロであることを確認する
   - `any` 型・`@ts-ignore` の使用がないことを確認する
3. **全テスト実行**
   - `pnpm --filter @repo/desktop test` を実行する
   - SkillFileWriter.test.ts を含む全テストが PASS することを確認する
4. **shared パッケージの型チェック**
   - `pnpm --filter @repo/shared typecheck` を実行する
   - SkillGeneratedContent 型の追加が shared パッケージ全体で整合することを確認する（P32 対策）
5. **SkillFileWriter の未使用ファイル確認**
   - `grep -rn "SkillFileWriter" apps/desktop/src/` で参照箇所を確認し、DI 配線が漏れていないことを確認する

## 参照資料

- CLAUDE.md（フック制御用環境変数）
- `.claude/rules/02-code-quality.md`（コーディング規約）
- `.claude/rules/06-known-pitfalls.md`（P32）

## 成果物

- 品質検証結果ログ（コンソール出力）
- `docs/30-workflows/skill-creator-llm-integration/04-phase-09-quality-output.md`（実行結果サマリー）

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS で完了した
- [ ] `pnpm --filter @repo/shared typecheck` がエラー 0 で完了した（P32 対策）
- [ ] 未使用 import が存在しない
- [ ] SkillFileWriter の DI 配線が全箇所で完成していることを確認した

## 次のPhase

Phase 10: 最終レビュー

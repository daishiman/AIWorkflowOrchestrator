# Phase 9: 品質検証

## メタ情報

| 項目     | 値                            |
| -------- | ----------------------------- |
| Phase    | 9                             |
| 機能名   | w3a-sc-output-persistence     |
| タスクID | TASK-SC-04-OUTPUT-PERSISTENCE |
| 作成日   | 2026-03-22                    |
| 更新日   | 2026-03-23                    |

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
- `docs/30-workflows/w3a-sc-output-persistence/phase-09-quality-output.md`（実行結果サマリー）

## 完了条件

- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 で完了した
- [ ] `pnpm --filter @repo/desktop test` が全テスト PASS で完了した
- [ ] `pnpm --filter @repo/shared typecheck` がエラー 0 で完了した（P32 対策）
- [ ] 未使用 import が存在しない
- [ ] SkillFileWriter の DI 配線が全箇所で完成していることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

## 統合テスト連携（Phase 1〜11は必須）

Phase 9 の品質ゲート結果を以下のテーブルで確認する。

| 品質ゲート                      | コマンド                                | 結果           | 判定 |
| ------------------------------- | --------------------------------------- | -------------- | ---- |
| ESLint                          | `pnpm --filter @repo/desktop lint`      | （実行後記入） | -    |
| TypeScript 型チェック (desktop) | `pnpm --filter @repo/desktop typecheck` | （実行後記入） | -    |
| TypeScript 型チェック (shared)  | `pnpm --filter @repo/shared typecheck`  | （実行後記入） | -    |
| 全テスト                        | `pnpm --filter @repo/desktop test`      | （実行後記入） | -    |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。

| 観点               | 適用判断                                     | 仕様参照先                                   |
| ------------------ | -------------------------------------------- | -------------------------------------------- |
| セキュリティ       | **適用**: パストラバーサル防止・書き込み制限 | `aiworkflow-requirements: security-*.md`     |
| アーキテクチャ     | **適用**: SkillFileWriter の DI 設計         | `aiworkflow-requirements: architecture-*.md` |
| エラーハンドリング | **適用**: アトミック書き込み・ロールバック   | `aiworkflow-requirements: error-handling.md` |
| UI/UX              | 非適用（バックエンド変更のみ）               | -                                            |

## サブタスク管理

Phase実行開始時に、TaskCreateツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビュー

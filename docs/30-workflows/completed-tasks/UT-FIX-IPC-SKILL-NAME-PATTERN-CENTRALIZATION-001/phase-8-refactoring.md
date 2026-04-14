# Phase 8: リファクタリング

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 8                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 7                                            |
| 後続Phase  | Phase 9                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

実装後の重複除去・命名統一を行い、`SKILL_NAME_PATTERN` の単一信頼源化を完遂する。
TypeScript 側（`SkillScanner.ts`）と ESM 側（`init_skill.js`）が同一定数を参照する構造を整備し、将来の変更コストを最小化する。

## 背景

- `SKILL_NAME_PATTERN` が `SkillScanner.ts` と `init_skill.js` に重複定義されており、片方のみ修正した場合に不整合が発生するリスクがある。
- `packages/shared` への一元化により単一責務原則を遵守し、定数の変更を1ファイルに集約する。
- SKILL.md の [Feedback RT-03] に準拠し、重複定数の除去をリファクタリング対象として明示する。

## SubAgentチーム編成

| SubAgent   | 関心ごと          | 主担当                                       |
| ---------- | ----------------- | -------------------------------------------- |
| SubAgent-A | shared 定数整備   | `skillName.ts` コメント整備・export確認      |
| SubAgent-B | TypeScript 側整合 | `SkillScanner.ts` import整理・旧定数削除     |
| SubAgent-C | ESM 側整合        | `init_skill.js` コメント更新・import参照確認 |
| SubAgent-D | 統合監査          | 矛盾・漏れ・整合・依存判定・mirror同期確認   |

## 実行タスク

- Task 8-1: `skillName.ts` のコメント整備（JSDoc追加・使用例記載）
- Task 8-2: `SkillScanner.ts` の import整理（旧ローカル定数削除・@repo/shared/constants からの import 確認）
- Task 8-3: `init_skill.js` のコメント更新（import 参照元変更の記録・旧定義削除確認）
- Task 8-4: `.agents` mirror同期確認（`.claude` ↔ `.agents` の `init_skill.js` 内容一致）
- Task 8-5: 責務境界マップ作成（どのファイルがどの責務を担うかを図示）

## 参照資料

| 参照資料               | パス                                              | 説明           |
| ---------------------- | ------------------------------------------------- | -------------- |
| 要件定義書             | `outputs/phase-1/requirements-definition.md`      | Phase 1 成果物 |
| 受け入れ基準           | `outputs/phase-1/acceptance-criteria.md`          | Phase 1 成果物 |
| アーキテクチャ設計     | `outputs/phase-2/design-document.md`              | Phase 2 成果物 |
| 実装サマリー           | `outputs/phase-5/implementation-summary.md`       | Phase 5 成果物 |
| 変更ファイル一覧       | `outputs/phase-5/changed-files.md`                | Phase 5 成果物 |
| 拡張テストケース       | `outputs/phase-6/expanded-test-cases.md`          | Phase 6 成果物 |
| 回帰テスト結果         | `outputs/phase-6/regression-test-result.md`       | Phase 6 成果物 |
| カバレッジ計画         | `outputs/phase-7/coverage-plan.md`                | Phase 7 成果物 |
| トレーサビリティ網羅率 | `outputs/phase-7/traceability-coverage-report.md` | Phase 7 成果物 |

## 実行手順

1. SubAgent-A: `packages/shared/src/constants/skillName.ts` の JSDoc コメントを整備し、`SKILL_NAME_PATTERN` の意味・制約・使用例を記述する。
2. SubAgent-B: `SkillScanner.ts` からローカル定義の `SKILL_NAME_PATTERN` を削除し、`@repo/shared/constants` からの import のみを残す。import 順序を整理する。
3. SubAgent-C: `init_skill.js`（`.claude` 配下）のコメントを更新し、`import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` 参照への変更内容を記録する。旧インライン定義の削除を確認する。
4. SubAgent-D: `.claude/skills/skill-creator/scripts/init_skill.js` と `.agents/skills/skill-creator/scripts/init_skill.js` の diff を確認し、内容一致を検証する。
5. SubAgent-D: refactoring-plan.md・post-refactor-test-plan.md・responsibility-boundary-map.md を outputs/phase-8/ に出力する。

## 統合テスト連携

- Phase 7 のカバレッジ報告を受け取り、Phase 9 の品質保証へつなぐ。
- `.claude` / `.agents` の差分が残る場合は Phase 10 で最終レビュー対象にする。

## 変更内容（Before/After テーブル）

SKILL.md の [Feedback RT-03] 準拠。

| 対象ファイル                                         | Before                                                       | After                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| `packages/shared/src/constants/skillName.ts`         | ファイル未存在                                               | `SKILL_NAME_PATTERN` を export、JSDoc コメント整備済み               |
| `packages/shared/src/constants/index.ts`             | `skillName.ts` の re-export なし                             | `export * from './skillName'` を追加                                 |
| `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | ローカルで `SKILL_NAME_PATTERN = /^[a-z][a-z0-9-]*$/` を定義 | `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` に変更 |
| `.claude/skills/skill-creator/scripts/init_skill.js` | インラインで正規表現を定義                                   | `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` を参照 |
| `.agents/skills/skill-creator/scripts/init_skill.js` | `.claude` 側と差異あり（mirror未同期）                       | `.claude` 側と同内容に同期                                           |

## 多角的チェック観点

| 観点        | 確認内容                                                                                          |
| ----------- | ------------------------------------------------------------------------------------------------- |
| 矛盾        | shared の定数値が SkillScanner.ts・init_skill.js で一致しているか                                 |
| 漏れ        | ローカル定義の削除漏れがないか（全ファイルを grep で確認）                                        |
| 整合性      | constants サブパスの ESM/CJS ビルド（dist/src/constants/index.cjs / .js）が正しく生成されているか |
| 依存関係    | `@repo/shared/constants` の依存が desktop の package.json に宣言されているか                      |
| mirror 同期 | `.claude` と `.agents` の `init_skill.js` が同内容であるか                                        |
| 命名統一    | エクスポート名が `SKILL_NAME_PATTERN` で統一されているか                                          |

## 成果物

| 成果物               | パス                                             | 説明                         |
| -------------------- | ------------------------------------------------ | ---------------------------- |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`            | 変更内容・優先順位・手順     |
| 再テスト計画         | `outputs/phase-8/post-refactor-test-plan.md`     | リファクタ後の回帰テスト計画 |
| 責務境界マップ       | `outputs/phase-8/responsibility-boundary-map.md` | ファイルごとの責務境界図示   |

## 完了条件

- [ ] `skillName.ts` の JSDoc コメントが整備されている
- [ ] `SkillScanner.ts` からローカル `SKILL_NAME_PATTERN` 定義が削除されている
- [ ] `init_skill.js` のコメントが更新されている
- [ ] `.claude` と `.agents` の `init_skill.js` が同内容である
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認

## サブタスク管理

1. 参照資料の確認
2. SubAgent-A/B/C の並列作業
3. SubAgent-D の統合判定
4. 成果物出力
5. 完了条件判定

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次のPhase

Phase 9: 品質保証

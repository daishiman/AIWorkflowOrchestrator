# Phase 4: テスト作成（TDD Red フェーズ）

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 4                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 3                                            |
| 後続Phase  | Phase 5                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

TDDのRedフェーズとして、実装前にテストを先行作成し、失敗することを確認する。
`SKILL_NAME_PATTERN` 定数の shared 一元化に対応するテストを網羅的に定義する。

## 実行タスク

- `SKILL_NAME_PATTERN` の正常系・異常系をテストマトリクスに固定する。
- `SkillScanner` と `init_skill.js` の回帰テストを Red 状態で準備する。
- 失敗ログを `outputs/phase-4/` に保存する。

## 背景

現在 `SKILL_NAME_PATTERN` 正規表現は `SkillScanner.ts` と `init_skill.js` にそれぞれ独立して定義されており、
定義の乖離リスクが存在する。shared定数として一元化するにあたり、先にテストを定義してRed状態を確認する。

## SubAgentチーム編成

| SubAgent   | 関心ごと             | 主担当                                                       |
| ---------- | -------------------- | ------------------------------------------------------------ |
| SubAgent-A | shared定数テスト     | `packages/shared/src/constants/skillName.test.ts` の新規作成 |
| SubAgent-B | TypeScript統合テスト | `SkillScanner.ts` の回帰テスト確認・追加                     |
| SubAgent-C | ESM統合テスト        | `init_skill.js` の import確認テスト作成                      |
| SubAgent-D | 統合監査             | 矛盾・漏れ・整合・依存判定                                   |

## テストマトリクス

| テストID | テスト対象                 | 入力                           | 期待値             | 種別 |
| -------- | -------------------------- | ------------------------------ | ------------------ | ---- |
| TC-01    | SKILL_NAME_PATTERN 正常系  | `"my-skill"`                   | マッチする         | 単体 |
| TC-02    | SKILL_NAME_PATTERN 正常系  | `"myskill"`                    | マッチする         | 単体 |
| TC-03    | SKILL_NAME_PATTERN 正常系  | `"my-skill-2"`                 | マッチする         | 単体 |
| TC-04    | SKILL_NAME_PATTERN 異常系  | `"my_skill"`（アンダースコア） | マッチしない       | 単体 |
| TC-05    | SKILL_NAME_PATTERN 異常系  | `"-my-skill"`（先頭ハイフン）  | マッチしない       | 単体 |
| TC-06    | SKILL_NAME_PATTERN 異常系  | `"my-skill-"`（末尾ハイフン）  | マッチしない       | 単体 |
| TC-07    | SKILL_NAME_PATTERN 異常系  | `"MY-SKILL"`（大文字）         | マッチしない       | 単体 |
| TC-08    | SKILL_NAME_PATTERN 異常系  | `""`（空文字）                 | マッチしない       | 単体 |
| TC-09    | SKILL_NAME_PATTERN 異常系  | `"スキル"`（日本語）           | マッチしない       | 単体 |
| TC-10    | validateSkillName 境界確認 | 64 文字の kebab-case           | `{ valid: true }`  | 統合 |
| TC-11    | validateSkillName 境界確認 | 65 文字の kebab-case           | `{ valid: false }` | 統合 |
| TC-12    | validateSkillName 回帰確認 | `"INVALID"`                    | `{ valid: false }` | 統合 |

## テストファイル配置

| ファイルパス                                      | 区分     | 説明                                    |
| ------------------------------------------------- | -------- | --------------------------------------- |
| `packages/shared/src/constants/skillName.test.ts` | 新規作成 | TC-01〜TC-09 の単体テスト               |
| 既存の `SkillScanner` テストファイル              | 回帰確認 | TC-10〜TC-12 の統合テスト（境界・回帰） |

## 参照資料

| 参照資料                 | パス                                                 | 説明                 |
| ------------------------ | ---------------------------------------------------- | -------------------- |
| 要件仕様                 | `.claude/skills/aiworkflow-requirements/references/` | 正本仕様の参照先     |
| Phase 3 設計レビュー結果 | `outputs/phase-3/design-review-result.md`            | Phase 3 成果物       |
| Phase 3 ゲート判定書     | `outputs/phase-3/gate-decision.md`                   | Phase 3 成果物       |
| 既存SkillScanner実装     | `apps/desktop/src/main/claude-cli/SkillScanner.ts`   | 現行実装の確認       |
| 既存init_skill           | `.claude/skills/skill-creator/scripts/init_skill.js` | 現行スクリプトの確認 |

## 実行手順

1. Phase 3 の成果物（設計書・契約定義）を入力として確認する。
2. SubAgent-A: `packages/shared/src/constants/skillName.test.ts` を新規作成し TC-01〜TC-09 を記述する。
3. SubAgent-B: 既存の `SkillScanner` テストファイルを確認し、TC-10〜TC-12 の回帰テストが存在するか確認する。不足分を追加する。
4. SubAgent-C: `init_skill.js` の import パスが変更後に動作するかを確認するテスト計画を作成する。
5. SubAgent-D: テスト網羅性・矛盾・漏れを統合判定する。
6. テストを実行してRed（失敗）状態を確認する。
7. Red状態の記録を `outputs/phase-4/red-test-result.md` に保存する。
8. 成果物を `outputs/phase-4/` に出力する。

## 統合テスト連携

- Phase 3 の gate 許可を受けてからテスト作成に進む。
- Phase 5 の実装はこの Red テストを Green にする前提で行う。

## Red確認コマンド

```bash
# shared定数テスト（新規作成ファイルが存在しないためRedになること）
pnpm --filter @repo/shared vitest run src/constants/skillName.test.ts

# SkillScanner回帰テスト
pnpm --filter @repo/desktop vitest run --reporter=verbose
```

## 多角的チェック観点

| 観点     | 確認内容                                                                |
| -------- | ----------------------------------------------------------------------- |
| 矛盾     | テストケースと仕様の矛盾がないか確認する                                |
| 漏れ     | テストマトリクスの全ケースがテストコードに反映されているか確認する      |
| 整合性   | TC-01〜TC-09（単体）と TC-10〜TC-12（統合）が相互補完しているか確認する |
| 依存関係 | Phase 3 の設計成果物を正しく参照しているか確認する                      |

## 成果物

| 成果物         | パス                                       | 説明                           |
| -------------- | ------------------------------------------ | ------------------------------ |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース定義と期待値の詳細 |
| Red結果        | `outputs/phase-4/red-test-result.md`       | テスト実行結果（失敗ログ）     |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | TC-10〜TC-12 の統合テスト計画  |

## 完了条件

- [ ] テストマトリクスの全13件がテストコードとして記述されている
- [ ] `skillName.test.ts` が新規作成されている
- [ ] テスト実行によりRed（失敗）状態が確認されている
- [ ] Red結果が `outputs/phase-4/red-test-result.md` に記録されている
- [ ] SubAgent-D による統合判定が完了している
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 3 成果物の確認
2. SubAgent-A: `skillName.test.ts` 新規作成（TC-01〜TC-09）
3. SubAgent-B: SkillScanner 回帰テスト確認・追加（TC-10〜TC-12）
4. SubAgent-C: ESM import 統合テスト計画作成
5. SubAgent-D: 統合判定
6. テスト実行・Red確認
7. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次のPhase

Phase 5: 実装

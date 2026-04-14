# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 6                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 5                                            |
| 後続Phase  | Phase 7                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

Phase 5 でGreenになった実装に対し、失敗パスと回帰ガードのテストケースを追加する。
ビルド失敗・import失敗の 2 観点でテストを拡充し、将来的な退行を防止する。

## 背景

Phase 4〜5 の TDD サイクルで正常系・異常系の基本テストは確立された。
しかし CI 環境での共有定数ビルド漏れや ESM import 解決失敗に対するガードが不足している。
本 Phase でこれらを補完する。

## SubAgentチーム編成

| SubAgent   | 関心ごと              | 主担当                                           |
| ---------- | --------------------- | ------------------------------------------------ |
| SubAgent-A | ビルド回帰ガード      | shared ビルド前後の定数解決テスト計画作成        |
| SubAgent-B | ESM import 回帰ガード | `init_skill.js` の import 失敗シナリオテスト作成 |
| SubAgent-C | constants 解決テスト  | `@repo/shared/constants` の解決可否確認          |
| SubAgent-D | 統合監査              | 拡充テストの網羅性・矛盾・漏れ判定               |

## 拡充テストケース一覧

### ビルド失敗時の回帰ガード

| テストID | テスト対象                | シナリオ                                                   | 期待値                                  | 種別       |
| -------- | ------------------------- | ---------------------------------------------------------- | --------------------------------------- | ---------- |
| TC-E01   | shared ビルド前の import  | `dist/src/constants/index.cjs` が存在しない状態での import | エラーメッセージが明確であること        | 回帰ガード |
| TC-E02   | shared ビルド後の import  | `pnpm --filter @repo/shared build` 実行後                  | `SKILL_NAME_PATTERN` が正常に解決される | 回帰ガード |
| TC-E03   | `index.ts` の export 漏れ | `skillName.ts` が `index.ts` から未エクスポートの場合      | TypeScript コンパイルエラーが発生する   | 回帰ガード |

### init_skill.js の import 失敗時の回帰ガード

| テストID | テスト対象                                | シナリオ                                                | 期待値                                         | 種別       |
| -------- | ----------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- | ---------- |
| TC-E04   | `import('@repo/shared/constants')` の解決 | `node_modules/@repo/shared/constants` が存在しない場合  | 分かりやすいエラーメッセージが出力される       | 回帰ガード |
| TC-E05   | `SKILL_NAME_PATTERN` の import            | shared から `SKILL_NAME_PATTERN` が未エクスポートの場合 | `undefined` になりバリデーションが安全失敗する | 回帰ガード |
| TC-E06   | init_skill.js の実行                      | import 成功後に正規表現が正常動作すること               | `"my-skill"` がマッチする                      | 統合       |

## テストファイル配置

| ファイルパス                                              | 区分     | 説明                                  |
| --------------------------------------------------------- | -------- | ------------------------------------- |
| `packages/shared/src/constants/skillName.test.ts`         | 修正     | TC-E01〜TC-E03 のビルド回帰ガード追加 |
| `.claude/skills/skill-creator/scripts/init_skill.test.js` | 新規作成 | TC-E04〜TC-E06 の CJS 回帰ガード      |

## 参照資料

| 参照資料         | パス                                                 | 説明             |
| ---------------- | ---------------------------------------------------- | ---------------- |
| テスト仕様書     | `outputs/phase-4/test-specification.md`              | Phase 4 成果物   |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md`          | Phase 5 成果物   |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`                   | Phase 5 成果物   |
| 契約差分         | `outputs/phase-5/contract-diff.md`                   | Phase 5 成果物   |
| 要件仕様         | `.claude/skills/aiworkflow-requirements/references/` | 正本仕様の参照先 |

## 実行手順

1. Phase 5 の成果物（実装サマリー・変更ファイル一覧・契約差分）を確認する。
2. SubAgent-A: ビルド回帰ガード（TC-E01〜TC-E03）のテストを `skillName.test.ts` に追加する。
3. SubAgent-B: ESM import 回帰ガード（TC-E04〜TC-E06）のテストを `init_skill.test.js` として新規作成する。
4. SubAgent-C: `@repo/shared/constants` 解決テストを整備し、CI 連携を確認する。
5. SubAgent-D: 拡充テストの網羅性・矛盾・漏れを統合判定する。
6. 拡充テストを実行して全件Greenを確認する。
7. 成果物を `outputs/phase-6/` に出力する。

## 実行タスク

- ビルド失敗ガードのテストケースを定義する。
- ESM import 失敗ガードのテストケースを定義する。
- `@repo/shared/constants` の解決可否を確認する。
- 回帰テスト結果とエッジケース結果を `outputs/phase-6/` に記録する。

## 統合テスト連携

- Phase 5 の実装結果を受け取り、Phase 7 のカバレッジ確認へつなぐ。
- `init_skill.js` の import 解決失敗パターンは Phase 9 の品質保証でも再確認する。

## 拡充テスト実行コマンド

```bash
# shared定数拡充テスト
pnpm --filter @repo/shared vitest run src/constants/skillName.test.ts

# ESM import 回帰テスト
node .claude/skills/skill-creator/scripts/init_skill.test.js
```

## 多角的チェック観点

| 観点     | 確認内容                                                           |
| -------- | ------------------------------------------------------------------ |
| 矛盾     | 拡充テストケースと Phase 4/5 テストケースに矛盾がないか確認する    |
| 漏れ     | ビルド・import の 2 観点が全てカバーされているか確認する           |
| 整合性   | 拡充テストが Phase 5 の実装内容と整合しているか確認する            |
| 依存関係 | CI 連携スクリプトが monorepo 構成に対応しているか確認する          |
| 再現性   | 拡充テストがローカル環境と CI 環境の両方で同一結果になるか確認する |

## 成果物

| 成果物           | パス                                        | 説明                                |
| ---------------- | ------------------------------------------- | ----------------------------------- |
| 拡充テストケース | `outputs/phase-6/expanded-test-cases.md`    | TC-E01〜TC-E06 の詳細定義           |
| 回帰テスト結果   | `outputs/phase-6/regression-test-result.md` | 拡充テスト実行結果（全件Green確認） |
| エッジケース結果 | `outputs/phase-6/edge-case-result.md`       | 失敗パス・境界値テストの実行結果    |

## 完了条件

- [ ] TC-E01〜TC-E06 の全テストケースが記述されている
- [ ] ビルド回帰ガードのテストが `skillName.test.ts` に追加されている
- [ ] ESM import 回帰ガードのテストが新規作成されている
- [ ] 全拡充テストがGreen（全件通過）である
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 5 成果物の確認
2. SubAgent-A: ビルド回帰ガードテスト追加（TC-E01〜TC-E03）
3. SubAgent-B: ESM import 回帰ガードテスト新規作成（TC-E04〜TC-E06）
4. SubAgent-C: `@repo/shared/constants` 解決テスト整備
5. SubAgent-D: 統合判定
6. 全拡充テスト実行・Green確認
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

Phase 7: カバレッジ確認

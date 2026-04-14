# Phase 5: 実装

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 5                                                  |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 4                                            |
| 後続Phase  | Phase 6                                            |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

最小実装でRedをGreenへ移行する方針を固定する。
`SKILL_NAME_PATTERN` を `packages/shared/src/constants/skillName.ts` に一元定義し、
`SkillScanner.ts` および `init_skill.js` の両方が単一の信頼源を参照する構造にする。

## 背景

TASK-FIX-IPC-SKILL-NAME-001 の調査で正規表現の分散定義が問題として特定された。
`SkillScanner.ts`（TypeScript）と `init_skill.js`（ESM）が各々独自の正規表現を持ち、
定義の乖離リスクが存在する。shared定数として一元化することで信頼源を単一化する。

## SubAgentチーム編成

| SubAgent   | 関心ごと           | 主担当                                                |
| ---------- | ------------------ | ----------------------------------------------------- |
| SubAgent-A | shared定数定義     | `packages/shared/src/constants/skillName.ts` 新規作成 |
| SubAgent-B | TypeScript参照更新 | `SkillScanner.ts` の import 更新・ローカル定義削除    |
| SubAgent-C | ESM参照更新        | `init_skill.js` の import 追加・ローカル定義削除      |
| SubAgent-D | 統合監査           | 矛盾・漏れ・整合・依存判定                            |

## 実行タスク

1. **`packages/shared/src/constants/skillName.ts` の新規作成**
   - `SKILL_NAME_PATTERN` 正規表現定数を定義する（`/^[a-z0-9]+(-[a-z0-9]+)*$/`）
   - TypeScript 型注釈 `RegExp` を付け、単一の定数として公開する

2. **`packages/shared/src/constants/index.ts` への export追加**
   - `skillName.ts` からの再エクスポートを追加する
   - 既存のエクスポートを破壊しないことを確認する

3. **`apps/desktop/src/main/claude-cli/SkillScanner.ts` の参照更新**
   - ローカル定義の `SKILL_NAME_PATTERN` を削除する
   - `@repo/shared` からの import に切り替える
   - 型整合性を維持する

4. **`.claude/skills/skill-creator/scripts/init_skill.js` の参照更新**
   - `import { SKILL_NAME_PATTERN } from '@repo/shared/constants'` を追加して `SKILL_NAME_PATTERN` を取得する
   - ローカル定義の正規表現を削除する
   - ESM/CJS 互換性を確認する

## 苦戦箇所テーブル（TASK-FIX-IPC-SKILL-NAME-001 からの引き継ぎ）

| 苦戦箇所                       | 発生状況                                          | 対処方針                                                                                |
| ------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 苦戦1: 正規表現の分散定義      | `SkillScanner.ts` と `init_skill.js` で別々に定義 | `skillName.ts` に一元化し、両ファイルから参照させる                                     |
| 苦戦2: monorepoでのESM依存解決 | `init_skill.js` が共有定数を import できない      | `pnpm --filter @repo/shared build` 後に `dist/src/constants/index.cjs` の存在を確認する |

## 参照資料

| 参照資料       | パス                                                 | 説明             |
| -------------- | ---------------------------------------------------- | ---------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`              | Phase 4 成果物   |
| Red結果        | `outputs/phase-4/red-test-result.md`                 | Phase 4 成果物   |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md`           | Phase 4 成果物   |
| 要件仕様       | `.claude/skills/aiworkflow-requirements/references/` | 正本仕様の参照先 |

## 実行手順

1. Phase 4 の成果物（テスト仕様書・Red結果・統合テスト計画）を確認する。
2. SubAgent-A: `skillName.ts` を新規作成し、定数を定義する。
3. SubAgent-A: `packages/shared/src/constants/index.ts` に export を追加する。
4. SubAgent-B: `SkillScanner.ts` のローカル定義を削除し、shared import に切り替える。
5. SubAgent-C: `init_skill.js`（`.claude/` 側）を更新し、import に切り替える。
6. SubAgent-D: `packages/shared/package.json` の `./constants` export と `packages/shared/src/constants/index.ts` の整合を確認する。
7. shared パッケージをビルドする。
8. 全テストを実行してGreen（全件通過）を確認する。
9. 成果物を `outputs/phase-5/` に出力する。

## ビルド・確認コマンド

```bash
# shared パッケージのビルド
pnpm --filter @repo/shared build

# constants サブパスの存在確認
ls packages/shared/dist/src/constants/index.cjs
ls packages/shared/dist/src/constants/index.js

# 全テスト実行（Green確認）
pnpm --filter @repo/shared vitest run src/constants/skillName.test.ts
pnpm --filter @repo/desktop vitest run --reporter=verbose
```

## 多角的チェック観点

| 観点     | 確認内容                                                                            |
| -------- | ----------------------------------------------------------------------------------- |
| 矛盾     | 仕様と成果物の矛盾がないか確認する                                                  |
| 漏れ     | 要件から成果物への未反映項目がないか確認する                                        |
| 整合性   | TypeScript（SkillScanner）と ESM（init_skill.js）が同一定数を参照しているか確認する |
| 依存関係 | shared ビルド後に `@repo/shared/constants` が解決できるか確認する                   |

## 統合テスト連携

- Phase 4 のテスト仕様・Red結果・統合テスト計画を入力として実装を開始する。
- Phase 6 の拡張テストで `@repo/shared/constants` の import 回帰を確認する。
- Phase 7 のカバレッジ確認で `SkillScanner.ts` と `init_skill.js` が同一の定数を参照していることを再確認する。

## 成果物

| 成果物           | パス                                        | 説明                         |
| ---------------- | ------------------------------------------- | ---------------------------- |
| 実装サマリー     | `outputs/phase-5/implementation-summary.md` | 実装計画と差分要約           |
| 変更ファイル一覧 | `outputs/phase-5/changed-files.md`          | 変更対象ファイルと変更内容   |
| 契約差分         | `outputs/phase-5/contract-diff.md`          | 実装差分と契約差分の1対1記録 |

## 完了条件

- [ ] `packages/shared/src/constants/skillName.ts` が新規作成されている
- [ ] `packages/shared/src/constants/index.ts` に export が追加されている
- [ ] `SkillScanner.ts` のローカル定義が削除され、shared import に切り替わっている
- [ ] `.claude/skills/skill-creator/scripts/init_skill.js` が import に切り替わっている
- [ ] shared ビルド後に `dist/src/constants/index.cjs` と `dist/src/constants/index.js` が存在する
- [ ] 全テストがGreen（全件通過）である
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 整合性が取れていることを確認
- [ ] 依存関係が取れていることを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. Phase 4 成果物の確認
2. SubAgent-A: `skillName.ts` 新規作成・`index.ts` export 追加
3. SubAgent-B: `SkillScanner.ts` 参照更新
4. SubAgent-C: `init_skill.js`（`.claude/` 側）参照更新
5. SubAgent-D: 統合判定
6. shared ビルド・CJS 確認
7. 全テスト実行・Green確認
8. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001
```

## 次のPhase

Phase 6: テスト拡充

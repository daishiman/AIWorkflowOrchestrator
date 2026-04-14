# Phase 10: 最終レビュー（ゲート）

## メタ情報

| 項目       | 内容                                               |
| ---------- | -------------------------------------------------- |
| Phase      | 10                                                 |
| 機能名     | UT-FIX-IPC-SKILL-NAME-PATTERN-CENTRALIZATION-001   |
| タスク名   | スキル名バリデーション正規表現の shared 定数一元化 |
| 前提Phase  | Phase 9                                            |
| 後続Phase  | Phase 11                                           |
| 作成日     | 2026-04-06                                         |
| ステータス | completed                                          |

## 目的

Phase 9 の品質保証結果をもとに、受け入れ基準を全件チェックし、Phase 11（手動テスト）への進行可否を判定する。BLOCKER が残存する場合は Phase 9 に差し戻す。

## 背景

- 最終レビューは品質ゲートであり、BLOCKER が 1 件でも残存する場合は次フェーズへ進めない。
- 受け入れ基準はタスク定義時に確定したものを使用し、追加・削除は行わない。

## SubAgentチーム編成

| SubAgent   | 関心ごと          | 主担当                                           |
| ---------- | ----------------- | ------------------------------------------------ |
| SubAgent-A | shared 定数確認   | `skillName.ts` export・定数値の正当性確認        |
| SubAgent-B | TypeScript 側確認 | `SkillScanner.ts` import 参照確認                |
| SubAgent-C | ESM 側確認        | `init_skill.js` import 参照確認・mirror 同期確認 |
| SubAgent-D | 統合審査          | 全受け入れ基準の合否判定・BLOCKER 判定           |

## 実行タスク

- Task 10-1: 受け入れ基準チェックリストの全項目を実行・判定する
- Task 10-2: BLOCKER 判定ロジックに従い、次フェーズへの進行可否を決定する
- Task 10-3: 是正計画（BLOCKER がある場合）または出荷準備チェック（PASS の場合）を作成する
- Task 10-4: 最終レビュー結果を outputs/phase-10/final-review-result.md に記録する

## 参照資料

| 参照資料             | パス                                             | 説明           |
| -------------------- | ------------------------------------------------ | -------------- |
| 要件定義書           | `outputs/phase-1/requirements-definition.md`     | Phase 1 成果物 |
| 受け入れ基準         | `outputs/phase-1/acceptance-criteria.md`         | Phase 1 成果物 |
| アーキテクチャ設計   | `outputs/phase-2/design-document.md`             | Phase 2 成果物 |
| 実装サマリー         | `outputs/phase-5/implementation-summary.md`      | Phase 5 成果物 |
| 拡張テストケース     | `outputs/phase-6/expanded-test-cases.md`         | Phase 6 成果物 |
| カバレッジ計画       | `outputs/phase-7/coverage-plan.md`               | Phase 7 成果物 |
| リファクタリング計画 | `outputs/phase-8/refactoring-plan.md`            | Phase 8 成果物 |
| 責務境界マップ       | `outputs/phase-8/responsibility-boundary-map.md` | Phase 8 成果物 |
| 品質レポート         | `outputs/phase-9/quality-report.md`              | Phase 9 成果物 |
| リスク台帳           | `outputs/phase-9/risk-register.md`               | Phase 9 成果物 |
| 因果ループ監査       | `outputs/phase-9/causal-loop-check.md`           | Phase 9 成果物 |

## 受け入れ基準チェックリスト

- [ ] `packages/shared/src/constants/skillName.ts` が `SKILL_NAME_PATTERN` を export している
- [ ] `SkillScanner.ts` の `validateSkillName()` が `@repo/shared/constants` からインポートしている
- [ ] `init_skill.js` の `validateSkillName()` が `@repo/shared/constants` を import して参照している
- [ ] `.claude` と `.agents` の `init_skill.js` が同内容である（mirror 同期）
- [ ] 全テスト PASS（`pnpm --filter @repo/shared test` および `pnpm --filter @repo/desktop test`）
- [ ] `pnpm typecheck` PASS（エラー 0 件）
- [ ] `pnpm lint` PASS（エラー 0 件）

## BLOCKER 判定ロジック

```
受け入れ基準チェックリストの項目のうち、
1件でも [ ] (未達成) が残存する場合 → BLOCKER = true
  → Phase 9 に差し戻し、是正計画を outputs/phase-10/corrective-action-plan.md に記録する
  → Phase 11 への進行は禁止

全項目が [x] (達成) である場合 → BLOCKER = false
  → outputs/phase-10/release-readiness-checklist.md を作成し、Phase 11 へ進行する
```

| 判定結果        | 対応アクション                                    |
| --------------- | ------------------------------------------------- |
| BLOCKER = true  | Phase 9 差し戻し・是正計画作成・Phase 11 進行禁止 |
| BLOCKER = false | 出荷準備チェック作成・Phase 11 進行許可           |

## 実行手順

1. SubAgent-A: `skillName.ts` の export を確認し、`SKILL_NAME_PATTERN` が正しく export されているか検証する。
2. SubAgent-B: `SkillScanner.ts` の import 文を確認し、`@repo/shared/constants` からの参照になっているか検証する。
3. SubAgent-C: `init_skill.js`（`.claude` 配下）の import 参照を確認し、mirror 同期の完了を検証する。
4. SubAgent-D: Phase 9 の quality-report.md を参照し、全テスト・typecheck・lint の合否を確認する。
5. SubAgent-D: BLOCKER 判定ロジックを適用し、進行可否を決定する。
6. SubAgent-D: 判定結果に応じて、final-review-result.md・corrective-action-plan.md または release-readiness-checklist.md を作成する。

## 統合テスト連携

- Phase 9 の品質レポートを受け取り、Phase 11 の手動テストへ進行可否を返す。
- BLOCKER の場合は Phase 11 へ進まず、Phase 9 の是正計画へ戻す。

## 多角的チェック観点

| 観点     | 確認内容                                                                  |
| -------- | ------------------------------------------------------------------------- |
| 矛盾     | 受け入れ基準と Phase 9 の品質レポートに矛盾がないか                       |
| 漏れ     | 受け入れ基準チェックリストの全項目が判定されているか                      |
| 整合性   | BLOCKER 判定ロジックが正しく適用されているか                              |
| 依存関係 | Phase 9 成果物が全件揃っていることを確認してから本 Phase を実行しているか |

## 成果物

| 成果物           | パス                                              | 説明                                   |
| ---------------- | ------------------------------------------------- | -------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md`         | 受け入れ基準全項目の合否・BLOCKER判定  |
| 是正計画         | `outputs/phase-10/corrective-action-plan.md`      | BLOCKER 時の是正アクション（条件付き） |
| 出荷準備チェック | `outputs/phase-10/release-readiness-checklist.md` | PASS 時の出荷準備確認                  |

## 完了条件

- [ ] 受け入れ基準チェックリストの全項目を判定済み
- [ ] BLOCKER 判定ロジックを適用し、結果を記録済み
- [ ] 判定結果に応じた成果物を作成済み
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

Phase 11: 手動テスト

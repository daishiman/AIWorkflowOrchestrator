# 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| 機能名       | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| タスク名     | SettingsView 実統合回帰カバレッジ整備                    |
| 分類         | 改善                                                     |
| 作成日       | 2026-03-06                                               |
| ステータス   | 仕様書作成完了（未実施）                                 |
| 優先度       | 高                                                       |
| 見積もり規模 | 中規模                                                   |
| 発見元       | 2026-03-06 の設定画面遷移不具合調査                      |

---

## 概要

SettingsView の既存テストが主要セクションをモックしており、実画面構成のまま auth-mode / apiKey / persist 経路を検証できていない。manual evidence も settings shell を通っていない。

## 背景

今回の調査では task-03 と task-04 の手動検証が SettingsView 実統合を通っていなかった。`SettingsView.test.tsx` でも `AccountSection` と `ApiKeysSection` と `AuthModeSelector` をモックしており、画面構成のまま落ちる不具合を拾えない。

## 対象ファイル

| 種別                  | パス                                                                                                                             | 用途                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Settings View Test    | apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx                                                               | 過剰モック解消の主対象          |
| Settings View         | apps/desktop/src/renderer/views/SettingsView/index.tsx                                                                           | real composition の確認先       |
| AuthModeSelector Test | apps/desktop/src/renderer/components/settings/AuthModeSelector/**tests**/AuthModeSelector.test.tsx                               | mode 切替統合観点の補強先       |
| ApiKeysSection Test   | apps/desktop/src/renderer/components/organisms/ApiKeysSection/**tests**/ApiKeysSection.test.tsx                                  | provider fallback との統合観点  |
| Integration Test      | apps/desktop/src/renderer/**tests**/integration/navigation.integration.test.ts                                                   | settings shell 遷移導線の確認先 |
| Manual Evidence       | docs/30-workflows/completed-tasks/04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001/outputs/phase-11/manual-test-result.md | 手動証跡の不足箇所を確認する    |

---

## 関連タスク

| タスク ID                                               | 関係                           | ステータス |
| ------------------------------------------------------- | ------------------------------ | ---------- |
| 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001           | 本タスクで守る対象の 1 つ      | 先行       |
| 06-TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001          | 本タスクで守る対象の 1 つ      | 先行       |
| 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001     | 本タスクで守る対象の 1 つ      | 先行       |
| 04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001 | 調査元。手動証跡不足を補完する | 完了       |

---

## 並列/直列ポリシー

- 本タスクは 05 / 06 / 07 の仕様確定後に直列で扱う。回帰テストの対象が先行タスクの AC を参照するためである。
- Phase 4-9 でコード編集が発生する場合は Codex へ実装委譲してよい。SubAgent は test matrix と evidence matrix を固定する。
- commit / push / PR 作成はユーザーの明示指示後に限る。

---

## Atent Team編成（SubAgent）

| SubAgent                 | 関心ごと                      | 実行モード | 責務                                                          |
| ------------------------ | ----------------------------- | ---------- | ------------------------------------------------------------- |
| SubAgent-Test-Harness    | integration harness           | 並列       | SettingsView を real composition で動かす test 基盤を設計する |
| SubAgent-Component-Scope | component / integration 境界  | 並列       | mock を残す場所と外す場所を定義する                           |
| SubAgent-Manual-Evidence | manual test / screenshot plan | 並列       | Settings shell を通る証跡条件を定義する                       |
| SubAgent-Lead-Sync       | 仕様統合 / aiworkflow 同期    | 直列統合   | 05 / 06 / 07 の AC を 1 つの回帰行列へ統合する                |

### Codex委譲ポリシー

| Phase帯     | 主担当           | 役割                                                                |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| Phase 1-3   | SubAgent         | 調査、要件固定、設計、レビュー観点の確定                            |
| Phase 4-9   | SubAgent + Codex | SubAgent が受入条件と変更境界を固定し、Codex が実装とテストを進める |
| Phase 10-13 | SubAgent         | 最終レビュー、manual evidence、仕様同期、handoff を整理する         |

---

## aiworkflow-requirements 抽出カバレッジ

| 観点                       | 参照先                                                                          | 本タスクでの用途                                    |
| -------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------- |
| testing-component-patterns | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md | component / integration の境界を確認する            |
| testing-dialog-patterns    | .claude/skills/aiworkflow-requirements/references/testing-dialog-patterns.md    | dialog / settings shell の test pattern を確認する  |
| ui-ux-settings             | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md             | Settings shell の構成要件を確認する                 |
| ui-ux-design-principles    | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md    | 実統合テストで守るUX説明順序を確認する              |
| testing-accessibility      | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md      | 実画面導線のa11y回帰項目を確認する                  |
| arch-state-management      | .claude/skills/aiworkflow-requirements/references/arch-state-management.md      | store を含む integration harness の組み方を確認する |
| development-guidelines     | .claude/skills/aiworkflow-requirements/references/development-guidelines.md     | test helper の配置規則を確認する                    |
| quality-requirements       | .claude/skills/aiworkflow-requirements/references/quality-requirements.md       | 回帰基盤の coverage 条件を確認する                  |
| error-handling             | .claude/skills/aiworkflow-requirements/references/error-handling.md             | 統合失敗時の診断情報粒度を確認する                  |
| task-workflow              | .claude/skills/aiworkflow-requirements/references/task-workflow.md              | Phase 11/12 の記録先を確認する                      |
| task-workflow-rules        | .claude/skills/aiworkflow-requirements/references/task-workflow-rules.md        | 回帰不備を未タスク化する判定基準を確認する          |
| lessons-learned            | .claude/skills/aiworkflow-requirements/references/lessons-learned.md            | settings回帰の再発防止カードを確認する              |
| task-workflow-phases       | .claude/skills/aiworkflow-requirements/references/task-workflow-phases.md       | Phase 11 / 12 で残す証跡の粒度を確認する            |

---

## 多面的思考統合レビュー

| 思考法                               | 判定した論点                                        | 採用結論                                          |
| ------------------------------------ | --------------------------------------------------- | ------------------------------------------------- |
| 水平思考 / 類推思考                  | 既存integration harnessをSettingsViewへ適用できるか | real composition 方針で再利用する                 |
| 逆説思考 / if思考                    | モックを増やせば安定するのでは                      | 欠陥検知力が落ちるため不採用                      |
| システム思考 / 因果関係ループ        | 過剰モック → 実障害未検知 → manual差戻しの連鎖      | モック境界を縮小して連鎖を断つ                    |
| 垂直思考 / 論点思考                  | どこを unit、どこを integration にするか            | 描画統合・契約境界・遷移導線で分離する            |
| 素人思考 / 価値提案思考              | 利用者価値                                          | 「設定画面が実運用通りに動く保証」を提供する      |
| トレードオン思考 / プラスサム思考    | 実在性と保守性                                      | 薄いテストダブルで速度を保ちつつ実在性を上げる    |
| 2軸思考                              | 実在性 × 実行コスト                                 | 中央領域（重要導線のみ統合）を採用する            |
| why思考 / 抽象化思考                 | なぜ見逃すか                                        | 「境界のモック化が多すぎる」検証設計問題          |
| 改善思考 / 戦略的思考 / プロセス思考 | 継続運用                                            | 回帰行列 + manual証跡 + Phase12同期を一体運用する |
| ダブル・ループ思考 / 仮説思考        | テスト方針の再定義                                  | mock-first から risk-first 統合検証へ更新する     |

## 仕様化する判断

- SettingsView 回帰は real composition を基本とし、モックは外部副作用境界に限定する。
- 05/06/07 の受入条件を 08 の統合行列に一本化する。
- manual evidence は settings shell 経由で取得し、画面・非画面証跡を対にする。

## 破棄判断と採用案

| 案  | 内容                                 | 判断                             |
| --- | ------------------------------------ | -------------------------------- |
| A   | 既存モック構成のままケース追加       | 破棄。実障害の再発検知に弱い     |
| B   | 全依存を実装実体で統合テスト         | 破棄。実行コストが過大           |
| C   | リスク高導線のみ real composition 化 | 採用。検知力と速度の均衡が取れる |

---

## Phase一覧

| Phase | 名称                 | 仕様書                                                       | ステータス |
| ----- | -------------------- | ------------------------------------------------------------ | ---------- |
| 1     | 要件定義             | [phase-1-requirements.md](phase-1-requirements.md)           | 未実施     |
| 2     | 設計                 | [phase-2-design.md](phase-2-design.md)                       | 未実施     |
| 3     | 設計レビューゲート   | [phase-3-design-review.md](phase-3-design-review.md)         | 未実施     |
| 4     | テスト作成           | [phase-4-test-creation.md](phase-4-test-creation.md)         | 未実施     |
| 5     | 実装                 | [phase-5-implementation.md](phase-5-implementation.md)       | 未実施     |
| 6     | テスト拡充           | [phase-6-test-expansion.md](phase-6-test-expansion.md)       | 未実施     |
| 7     | テストカバレッジ確認 | [phase-7-coverage-check.md](phase-7-coverage-check.md)       | 未実施     |
| 8     | リファクタリング     | [phase-8-refactoring.md](phase-8-refactoring.md)             | 未実施     |
| 9     | 品質保証             | [phase-9-quality-assurance.md](phase-9-quality-assurance.md) | 未実施     |
| 10    | 最終レビューゲート   | [phase-10-final-review.md](phase-10-final-review.md)         | 未実施     |
| 11    | 手動テスト検証       | [phase-11-manual-test.md](phase-11-manual-test.md)           | 未実施     |
| 12    | ドキュメント更新     | [phase-12-documentation.md](phase-12-documentation.md)       | 未実施     |
| 13    | PR作成               | [phase-13-pr-creation.md](phase-13-pr-creation.md)           | 未実施     |

---

## 実行フロー

```
05 / 06 / 07 の仕様・実装結果確認
  ↓
Phase 1 → Phase 2 → Phase 3 (Gate) → Phase 4 → Phase 5 → Phase 6 → Phase 7
                         ↓                                      ↓
                    (MAJOR→戻り)                           (未達→戻り)
                         ↓                                      ↓
Phase 8 → Phase 9 → Phase 10 (Gate) → Phase 11 → Phase 12 → Phase 13 → 完了
                         ↓
                    (MAJOR→戻り)
```

---

## Phase完了時の必須アクション

1. Phase 仕様書に書かれた全タスクを 100% 実行する。
2. outputs/phase-N/ 配下に定義された成果物を生成する。
3. `artifacts.json` の該当 Phase を更新する。
4. commit / push / PR を行う前にユーザー指示を確認する。

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 --phase {{N}} \
  --artifacts "outputs/phase-{{N}}/{{FILE}}.md:{{DESCRIPTION}}"
```

---

## 想定成果物

| Phase | 主要成果物                                             |
| ----- | ------------------------------------------------------ |
| 1     | 要件定義書, 受け入れ基準, スコープ境界                 |
| 2     | 設計方針, 責務分担表, 実行計画                         |
| 3     | 設計レビュー結果, ゲート判定                           |
| 4     | Red テスト計画, 統合ケース                             |
| 5     | 実装順序, 変更ファイル計画                             |
| 6     | 回帰拡張計画, fixture 計画                             |
| 7     | coverage 目標, gap log                                 |
| 8     | refactor ガード, 簡素化ログ                            |
| 9     | 品質チェックリスト, リスク登録簿                       |
| 10    | 最終レビュー結果, リリース判断                         |
| 11    | 手動テスト行列, 証跡計画                               |
| 12    | 実装ガイド, 更新履歴, 未タスク検出, スキル改善レポート |
| 13    | PR 計画, handoff checklist                             |

---

## 実行制約

- 現時点では仕様書作成までを完了状態とし、タスク実行そのものは開始しない。
- 05 / 06 / 07 は関心ごと分離の原則で並列実行できる。08 は 05 / 06 / 07 の結果を束ねる後続タスクとして扱う。
- 仕様書は Atent Team 編成を前提とし、実装フェーズは Codex 委譲を許可する。
- commit、push、PR、merge はユーザーの明示指示後に限る。

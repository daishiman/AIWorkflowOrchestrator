# 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| 機能名       | 07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001              |
| タスク名     | settings 遷移に関わる persist / navigation iterable ハードニング |
| 分類         | 不具合修正                                                       |
| 作成日       | 2026-03-06                                                       |
| ステータス   | Phase 12完了（実装・テスト完了、commit/PR未実施）                |
| 優先度       | 高                                                               |
| 見積もり規模 | 中規模                                                           |
| 発見元       | 2026-03-06 の設定画面遷移不具合調査                              |

---

## 概要

persist された `viewHistory` と `expandedFolders` が iterable でない値を持つと、hydrate または settings 遷移で `object is not iterable` が発生する経路が残っている。

## 背景

症状は Electron sandbox 上の iterable error として観測され、候補箇所は `navigationSlice.ts` の spread と `store/index.ts` の `new Set(parsed.state.expandedFolders)` に集約された。破損した persist state を前提にした防御が不足している。

## 対象ファイル

| 種別             | パス                                                                           | 用途                                             |
| ---------------- | ------------------------------------------------------------------------------ | ------------------------------------------------ |
| Renderer Store   | apps/desktop/src/renderer/store/index.ts                                       | hydrate と persist 正規化の主対象                |
| Renderer Slice   | apps/desktop/src/renderer/store/slices/navigationSlice.ts                      | viewHistory 更新の主対象                         |
| Renderer Test    | apps/desktop/src/renderer/store/slices/navigationSlice.test.ts                 | slice 単位の異常系固定先                         |
| Integration Test | apps/desktop/src/renderer/**tests**/integration/navigation.integration.test.ts | settings 遷移の結合確認先                        |
| Settings View    | apps/desktop/src/renderer/views/SettingsView/index.tsx                         | 再現導線の入口として確認する                     |
| Regression Test  | apps/desktop/src/renderer/**tests**/infinite-loop-prevention.test.tsx          | store 初期化周辺の既存回帰と競合しないか確認する |

---

## 関連タスク

| タスク ID                                                | 関係                                                 | ステータス |
| -------------------------------------------------------- | ---------------------------------------------------- | ---------- |
| 04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001  | 調査元。候補箇所の洗い出し                           | 完了       |
| 03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001             | store 初期化と selector の前提を再確認する関連タスク | 完了       |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 後続。settings shell 回帰へ接続する                  | 後続       |

---

## 並列/直列ポリシー

- 本タスクは 05 と 06 と並列で扱える。対象は store / navigation hardening に限定する。
- Phase 4-9 でコード編集が発生する場合は Codex へ実装委譲してよい。SubAgent は破損データ再現手順と復旧条件を固定する。
- commit / push / PR 作成はユーザーの明示指示後に限る。

---

## Atent Team編成（SubAgent）

| SubAgent                  | 関心ごと                       | 実行モード | 責務                                           |
| ------------------------- | ------------------------------ | ---------- | ---------------------------------------------- |
| SubAgent-Store-Hydrate    | persist / hydration            | 並列       | expandedFolders 正規化と復旧戦略を設計する     |
| SubAgent-Navigation-Slice | navigation state update        | 並列       | viewHistory 更新と fallback を設計する         |
| SubAgent-Regression-Tests | integration / corruption tests | 並列       | 破損 state 再現手順を設計する                  |
| SubAgent-Lead-Sync        | 仕様統合 / aiworkflow 同期     | 直列統合   | state management 正本と manual flow を統合する |

### Codex委譲ポリシー

| Phase帯     | 主担当           | 役割                                                                |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| Phase 1-3   | SubAgent         | 調査、要件固定、設計、レビュー観点の確定                            |
| Phase 4-9   | SubAgent + Codex | SubAgent が受入条件と変更境界を固定し、Codex が実装とテストを進める |
| Phase 10-13 | SubAgent         | 最終レビュー、manual evidence、仕様同期、handoff を整理する         |

---

## aiworkflow-requirements 抽出カバレッジ

| 観点                                 | 参照先                                                                                    | 本タスクでの用途                           |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------ |
| arch-state-management                | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | Zustand persist と selector 責務を確認する |
| architecture-patterns                | .claude/skills/aiworkflow-requirements/references/architecture-patterns.md                | store 分割と helper 配置の規則を確認する   |
| architecture-implementation-patterns | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | state migration と test pattern を確認する |
| patterns                             | .claude/skills/aiworkflow-requirements/references/patterns.md                             | P31 系の成功パターンを確認する             |
| development-guidelines               | .claude/skills/aiworkflow-requirements/references/development-guidelines.md               | 正規化 helper の配置と naming を確認する   |
| error-handling                       | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | persist破損時の復旧方針を確認する          |
| security-input-validation            | .claude/skills/aiworkflow-requirements/references/security-input-validation.md            | 永続データ復元時の入力検証境界を確認する   |
| ipc-type-resolution-guide            | .claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md            | iterable崩れの診断手順を確認する           |
| known-pitfalls                       | .claude/rules/06-known-pitfalls.md                                                        | iterable再発防止の失敗パターンを確認する   |
| ui-ux-navigation                     | .claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md                     | navigation の期待導線を確認する            |
| ui-ux-settings                       | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                       | settings遷移時の表示責務を確認する         |
| testing-accessibility                | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | settings遷移時のa11y回帰観点を確認する     |
| testing-component-patterns           | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md           | store と view の統合試験構成を確認する     |
| arch-ipc-persistence                 | .claude/skills/aiworkflow-requirements/references/arch-ipc-persistence.md                 | persist 復元と永続化境界の責務を確認する   |
| task-workflow-rules                  | .claude/skills/aiworkflow-requirements/references/task-workflow-rules.md                  | Phase 12 完了条件と品質ゲートを確認する    |

### 抽出根拠（resource-map 準拠）

- `indexes/resource-map.md` の「バグ修正（一般）」を起点に `error-handling.md` + 関連 `interfaces-*` を最低集合として採用する。
- 本タスク固有の persist / hydration を扱うため、最低集合に `arch-state-management.md` と `arch-ipc-persistence.md` を追加する。
- settings 遷移回帰を扱うため、UI観点として `ui-ux-navigation.md` と `ui-ux-settings.md` を追加する。
- Phase 12 同期漏れ防止として `task-workflow.md` と `task-workflow-rules.md` を追加する。

---

## 多面的思考統合レビュー

| 思考法                               | 判定した論点                                       | 採用結論                                             |
| ------------------------------------ | -------------------------------------------------- | ---------------------------------------------------- |
| 水平思考 / 類推思考                  | 他sliceの persist 復旧パターンを転用できるか       | iterable guard を共通化して転用する                  |
| 逆説思考 / if思考                    | 破損データは全破棄すべきか                         | 全破棄は履歴価値を失うため不採用                     |
| システム思考 / 因果関係ループ        | 破損persist → hydrate失敗 → settings遷移失敗の連鎖 | hydrate時正規化で連鎖を遮断する                      |
| 垂直思考 / 論点思考                  | 防御責務の配置                                     | store初期化とnavigation更新の2点に限定する           |
| 素人思考 / 価値提案思考              | 利用者価値                                         | 「壊れた状態でも設定画面へ到達できる」を最優先       |
| トレードオン思考 / プラスサム思考    | 復旧率と整合性                                     | 復旧可能分だけ保持し、不能分は安全既定値へ落とす     |
| 2軸思考                              | データ健全性 × 画面可用性                          | 4象限でfallback挙動とテストを固定する                |
| why思考 / 抽象化思考                 | 根本原因                                           | 「永続化データを信頼しすぎる設計」                   |
| 改善思考 / 戦略的思考 / プロセス思考 | 再発防止の仕組み化                                 | 破損fixture常設 + Phase 12 教訓同期を固定する        |
| ダブル・ループ思考 / 仮説思考        | 設計原則の見直し                                   | strict trust から resilient hydration へ方針更新する |

## 仕様化する判断

- `expandedFolders` と `viewHistory` は hydrate/update 時に iterable 判定を行い、非iterableなら安全既定値へ復旧する。
- 復旧挙動は silent ではなく、診断可能なログ/テスト証跡を残す。
- 07は store/nav hardening に限定し、SettingsView の UI仕様変更は扱わない。

## 破棄判断と採用案

| 案  | 内容                           | 判断                         |
| --- | ------------------------------ | ---------------------------- |
| A   | persist破損時に全stateを初期化 | 破棄。必要な履歴まで失う     |
| B   | 例外を許容して障害を顕在化     | 破棄。設定画面到達不能が残る |
| C   | フィールド単位で正規化し復旧   | 採用。可用性と診断性を両立   |

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
  --workflow docs/30-workflows/07-TASK-FIX-SETTINGS-PERSIST-ITERABLE-HARDENING-001 --phase {{N}} \
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

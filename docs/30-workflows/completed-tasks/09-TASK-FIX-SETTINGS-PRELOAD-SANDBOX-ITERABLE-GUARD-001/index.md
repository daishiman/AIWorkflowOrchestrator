# 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| 機能名       | 09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001            |
| タスク名     | settings 画面 preload/sandbox iterable 契約ガードと AuthGuard 復旧 |
| 分類         | 不具合修正                                                         |
| 作成日       | 2026-03-06                                                         |
| ステータス   | 仕様書作成完了（未実施）                                           |
| 優先度       | 高                                                                 |
| 見積もり規模 | 小規模                                                             |
| 発見元       | 2026-03-06 の設定画面遷移不具合調査                                |

---

## 概要

AuthGuard初期化境界 が `window.electronAPI 公開契約（contextBridge.exposeInMainWorld）` の戻り値 shape を無検証で扱い、`window.electronAPI` 公開オブジェクトが iterable でない場合に for...of/spread 前提でクラッシュする。

## 背景

task-04 では preload payload だけを防御したが、SettingsView 固有の `AuthGuard初期化境界` 側には response 正規化が入っていない。`preload expose API` の shape が崩れるだけで renderer 側が落ちる経路が残っている。

## 対象ファイル

| 種別               | パス                                                                | 用途                                |
| ------------------ | ------------------------------------------------------------------- | ----------------------------------- |
| Renderer Component | apps/desktop/src/preload/index.ts                                   | preload payload 正規化の主対象      |
| Renderer Tests     | apps/desktop/src/renderer/components/AuthGuard/AuthGuard.test.tsx   | shape 異常系の固定先                |
| Main IPC           | apps/desktop/src/main/index.ts                                      | preload起動契約の確認先             |
| Main IPC           | apps/desktop/src/main/index.ts と apps/desktop/src/preload/index.ts | sandbox起動時の契約防御との整合確認 |
| Shared Types       | apps/desktop/src/preload/types.ts                                   | transport 型の確認先                |
| Validator          | apps/desktop/src/preload/channels.ts                                | validation の責務境界確認           |

---

## 関連タスク

| タスク ID                                                | 関係                                      | ステータス |
| -------------------------------------------------------- | ----------------------------------------- | ---------- |
| 04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001  | 調査元。preload payload 防御の次段        | 完了       |
| 03-TASK-FIX-SKILL-CENTER-METADATA-DEFENSIVE-GUARD-001    | Renderer defensive guard の類似パターン   | 完了       |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 後続。Settings shell の統合回帰へ接続する | 後続       |

---

## 並列/直列ポリシー

- 本タスクは 05 と 07 と並列で扱える。依存は settings shell を共通に持つが、修正責務は独立している。
- Phase 4-9 でコード編集が発生する場合は Codex へ実装委譲してよい。SubAgent は fallback と異常系の完了条件を固定する。
- commit / push / PR 作成はユーザーの明示指示後に限る。

---

## Atent Team編成（SubAgent）

| SubAgent                | 関心ごと                         | 実行モード | 責務                                             |
| ----------------------- | -------------------------------- | ---------- | ------------------------------------------------ |
| SubAgent-Renderer-Guard | Renderer defensive normalization | 並列       | preload payload shape の正規化ポイントを設計する |
| SubAgent-Contract-IPC   | Main / Preload / Shared contract | 並列       | response envelope と shared type を確認する      |
| SubAgent-Test-Fallback  | 異常系テスト / fallback UX       | 並列       | preload 初期化失敗 ケースと文言を設計する        |
| SubAgent-Lead-Sync      | 仕様統合 / aiworkflow 同期       | 直列統合   | task-04 の調査結果と本タスク境界を統合する       |

### Codex委譲ポリシー

| Phase帯     | 主担当           | 役割                                                                |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| Phase 1-3   | SubAgent         | 調査、要件固定、設計、レビュー観点の確定                            |
| Phase 4-9   | SubAgent + Codex | SubAgent が受入条件と変更境界を固定し、Codex が実装とテストを進める |
| Phase 10-13 | SubAgent         | 最終レビュー、manual evidence、仕様同期、handoff を整理する         |

---

## aiworkflow-requirements 抽出カバレッジ

| 観点                       | 参照先                                                                          | 本タスクでの用途                                  |
| -------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| api-ipc-system             | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md             | システム IPC の response パターンを確認する       |
| interfaces-auth            | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md            | AuthGuard と preload API 契約の境界を確認する     |
| ipc-contract-checklist     | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md     | shape drift を検査する項目を固定する              |
| security-electron-ipc      | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md      | Preload 経由で不正 shape を通さない前提を確認する |
| ui-ux-settings             | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md             | 設定画面の異常時表示方針を確認する                |
| ui-ux-components           | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md           | セクション責務とエラー表示の配置を確認する        |
| ui-ux-design-system        | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md        | 異常状態ラベル/色トークンの一貫性を確認する       |
| ui-ux-design-principles    | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md    | 異常系導線の可読性と説明順序を確認する            |
| testing-accessibility      | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md      | fallback 表示のa11y検証観点を確認する             |
| testing-component-patterns | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md | preload 初期化失敗 の component test を組む       |
| development-guidelines     | .claude/skills/aiworkflow-requirements/references/development-guidelines.md     | 正規化 helper の配置規則を確認する                |
| error-handling             | .claude/skills/aiworkflow-requirements/references/error-handling.md             | preload 初期化失敗 時の復旧方針を確認する         |
| security-input-validation  | .claude/skills/aiworkflow-requirements/references/security-input-validation.md  | 受信データの型検証境界を確認する                  |
| ipc-type-resolution-guide  | .claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md  | payload shape drift の診断手順を確認する          |
| known-pitfalls             | .claude/rules/06-known-pitfalls.md                                              | iterable / shape drift 再発防止を確認する         |
| api-ipc-auth               | .claude/skills/aiworkflow-requirements/references/api-ipc-auth.md               | 認証系 IPC ハンドラとレスポンス整合を確認する     |

---

## 多面的思考統合レビュー

| 思考法                               | 判定した論点                                                    | 採用結論                                         |
| ------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------ |
| 水平思考 / 類推思考                  | task-04 の iterable 調査結果を preload 初期化防御へ転用できるか | 同型の defensive normalization を適用する        |
| 逆説思考 / if思考                    | 「不正shapeは落として気づくべき」案                             | settings全体停止は価値毀損のため不採用           |
| システム思考 / 因果関係ループ        | preload 初期化失敗 → render crash → 設定不能の連鎖              | normalize + warning表示で連鎖を切断する          |
| 垂直思考 / 論点思考                  | どこで正規化するのが最小責務か                                  | AuthGuard初期化境界で受信直後に正規化する        |
| 素人思考 / 価値提案思考              | 利用者に必要なのは何か                                          | 「壊れていても設定画面は使える」体験を優先する   |
| トレードオン思考 / プラスサム思考    | 厳格性と可用性の両立                                            | 契約逸脱を記録しつつUIは継続表示する             |
| 2軸思考                              | 契約準拠度 × UI継続性                                           | 準拠/逸脱の両軸で表示・テストケースを固定する    |
| why思考 / 抽象化思考                 | なぜ再発するか                                                  | 「Rendererが外部契約を無検証で信頼する」構造問題 |
| 改善思考 / 戦略的思考 / プロセス思考 | 一度の修正で終わらせない方法                                    | Phase 12へ診断手順・未タスク判定を同期する       |
| ダブル・ループ思考 / 仮説思考        | 方針自体の妥当性                                                | 「落とす設計」から「守る設計」へ学習更新する     |

## 仕様化する判断

- `window.electronAPI 公開契約（contextBridge.exposeInMainWorld）` の戻り値は Renderer 境界で必ず正規化し、`window.electronAPI` 公開オブジェクトが iterable でない場合もクラッシュさせない。
- 契約逸脱は黙殺せず、UIメッセージとログで観測可能にする。
- 09は「preload/sandbox契約防御」に限定し、preload API 追加や auth-mode 仕様拡張は扱わない。

## 破棄判断と採用案

| 案  | 内容                                          | 判断                                       |
| --- | --------------------------------------------- | ------------------------------------------ |
| A   | Main 側のみ修正して Renderer は現状維持       | 破棄。preload/mock経由の揺れを吸収できない |
| B   | 不正shape時に例外を投げて画面停止             | 破棄。設定不能状態を増やす                 |
| C   | Renderer 境界で正規化 + 異常表示 + テスト固定 | 採用。可用性と診断性を両立できる           |

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
  --workflow docs/30-workflows/09-TASK-FIX-SETTINGS-PRELOAD-SANDBOX-ITERABLE-GUARD-001 --phase {{N}} \
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

# 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 - タスク実行仕様書

## メタ情報

| 項目         | 内容                                          |
| ------------ | --------------------------------------------- |
| 機能名       | 05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 |
| タスク名     | 設定画面 authKey 導線の auth-mode 契約整合    |
| 分類         | 不具合修正                                    |
| 作成日       | 2026-03-06                                    |
| ステータス   | 仕様書作成完了（未実施）                      |
| 優先度       | 高                                            |
| 見積もり規模 | 中規模                                        |
| 発見元       | 2026-03-06 の設定画面遷移不具合調査           |

---

## 概要

SettingsView で auth-mode を API キー認証に切り替えても authKey を設定する UI が存在せず、さらに `auth-mode:status` と `auth-key:exists` の判定差分が画面で説明されないため、設定画面の表示と実行前判定が利用者視点で分断されている。

## 背景

既存コードでは `SettingsView` が `AuthModeSelector` と汎用 `ApiKeysSection` を表示する一方、auth-mode の状態表示は `AuthModeService#getStatus()`、実行前判定は `window.electronAPI.authKey.exists()` を経由している。前者は保存済みキーを正本とし、後者は `ANTHROPIC_API_KEY` の環境変数 fallback を含むため、API キー認証選択時に UI 導線が無いだけでなく、状態表示と実行可否が乖離しうる。

## 対象ファイル

| 種別                | パス                                                                     | 用途                                          |
| ------------------- | ------------------------------------------------------------------------ | --------------------------------------------- |
| Renderer View       | apps/desktop/src/renderer/views/SettingsView/index.tsx                   | authKey 導線の表示位置を定義する              |
| Renderer Component  | apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx | mode 切替 UX と状態表示を扱う                 |
| Renderer Utility    | apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts           | 実行前認証チェックとの整合を確認する          |
| Renderer Store      | apps/desktop/src/renderer/store/slices/authModeSlice.ts                  | 状態表示とガイダンスの現在実装を確認する      |
| Preload API         | apps/desktop/src/preload/index.ts                                        | authKey API 公開面を確認する                  |
| Preload AuthKey API | apps/desktop/src/preload/authKeyApi.ts                                   | authKey invoke API の境界を確認する           |
| Main Service        | apps/desktop/src/main/services/auth/AuthModeService.ts                   | mode と authKey 状態の正本を確認する          |
| Main IPC            | apps/desktop/src/main/ipc/authModeHandlers.ts                            | auth-mode status DTO と sender 検証を確認する |
| Main IPC            | apps/desktop/src/main/ipc/authKeyHandlers.ts                             | auth-key channel を確認する                   |
| Shared Types        | packages/shared/src/types/auth-mode.ts                                   | auth-mode transport DTO を確認する            |
| Tests               | apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx       | SettingsView の回帰試験対象を確認する         |

---

## 関連タスク

| タスク ID                                                | 関係                                                       | ステータス |
| -------------------------------------------------------- | ---------------------------------------------------------- | ---------- |
| TASK-AUTH-MODE-SELECTION-001                             | 元仕様。期待される UI 導線の正本                           | 完了       |
| 03-TASK-FIX-AUTH-MODE-CONTRACT-ALIGNMENT-001             | 公開契約の整合済みタスク。本タスクは UI 導線の欠損を埋める | 完了       |
| 04-TASK-INVESTIGATE-ELECTRON-SANDBOX-ITERABLE-ERROR-001  | 調査元。settings 未防御経路の洗い出し                      | 完了       |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 後続。統合回帰を固定する                                   | 後続       |

---

## 並列/直列ポリシー

- 本タスクは 06 と 07 と並列で仕様化・実装できる。UI 導線の決定は 06 と 07 の結果を待たない。
- Phase 4-9 でコード編集が発生する場合は Codex へ実装委譲してよい。SubAgent は受入条件とレビュー観点を固定する。
- commit / push / PR 作成はユーザーの明示指示後に限る。

---

## Atent Team編成（SubAgent）

| SubAgent                   | 関心ごと                   | 実行モード | 責務                                              |
| -------------------------- | -------------------------- | ---------- | ------------------------------------------------- |
| SubAgent-Renderer-Settings | Settings UI / local state  | 並列       | authKey 入力 UI の責務境界と表示条件を定義する    |
| SubAgent-Bridge-AuthKey    | Preload / Main 契約        | 並列       | auth-key API と auth-mode status の整合を確認する |
| SubAgent-Tests-Flow        | 統合テスト / manual flow   | 並列       | settings と preflight の回帰観点を設計する        |
| SubAgent-Lead-Sync         | 仕様統合 / aiworkflow 同期 | 直列統合   | 参照仕様とタスク境界を 1 つの仕様へ統合する       |

### Codex委譲ポリシー

| Phase帯     | 主担当           | 役割                                                                |
| ----------- | ---------------- | ------------------------------------------------------------------- |
| Phase 1-3   | SubAgent         | 調査、要件固定、設計、レビュー観点の確定                            |
| Phase 4-9   | SubAgent + Codex | SubAgent が受入条件と変更境界を固定し、Codex が実装とテストを進める |
| Phase 10-13 | SubAgent         | 最終レビュー、manual evidence、仕様同期、handoff を整理する         |

---

## aiworkflow-requirements 抽出カバレッジ

| 観点                                 | 参照先                                                                                    | 本タスクでの用途                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| interfaces-auth                      | .claude/skills/aiworkflow-requirements/references/interfaces-auth.md                      | auth-mode / IPCResponse の正本を確認する                              |
| api-ipc-system                       | .claude/skills/aiworkflow-requirements/references/api-ipc-system.md                       | システム設定系 IPC の命名と戻り値を確認する                           |
| api-ipc-auth                         | .claude/skills/aiworkflow-requirements/references/api-ipc-auth.md                         | 認証系 IPC の境界（authKey保存/削除導線）を確認する                   |
| ipc-contract-checklist               | .claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md               | 公開契約のチェック観点を固定する                                      |
| security-electron-ipc                | .claude/skills/aiworkflow-requirements/references/security-electron-ipc.md                | Preload 経由公開時の制約を確認する                                    |
| arch-state-management                | .claude/skills/aiworkflow-requirements/references/arch-state-management.md                | SettingsView と store の責務分離を確認する                            |
| architecture-implementation-patterns | .claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md | Main/Preload/Renderer 実装パターンと IPC ライフサイクルを確認する     |
| known-pitfalls                       | .claude/rules/06-known-pitfalls.md                                                        | P5/P31 を含む既知の落とし穴再発防止を確認する（正本は .claude/rules） |
| ui-ux-settings                       | .claude/skills/aiworkflow-requirements/references/ui-ux-settings.md                       | 設定画面 UI の構成方針を確認する                                      |
| ui-ux-forms                          | .claude/skills/aiworkflow-requirements/references/ui-ux-forms.md                          | 入力フォームの振る舞いと validation を確認する                        |
| ui-ux-components                     | .claude/skills/aiworkflow-requirements/references/ui-ux-components.md                     | 設定画面のコンポーネント責務分離を確認する                            |
| ui-ux-design-system                  | .claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md                  | 設定画面のラベル/状態色の一貫性を確認する                             |
| testing-component-patterns           | .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md           | SettingsView のテスト責務を確認する                                   |
| error-handling                       | .claude/skills/aiworkflow-requirements/references/error-handling.md                       | authKey 保存/削除失敗時のエラー契約とユーザー通知方針を確認する       |
| development-guidelines               | .claude/skills/aiworkflow-requirements/references/development-guidelines.md               | SettingsView の selector/useEffect 運用と P31 回避ガイドを確認する    |
| security-api-electron                | .claude/skills/aiworkflow-requirements/references/security-api-electron.md                | preload API 公開境界（contextBridge / invoke制約）を確認する          |
| security-input-validation            | .claude/skills/aiworkflow-requirements/references/security-input-validation.md            | authKey 入力値の trim/空文字/形式検証ポリシーを確認する               |
| ipc-type-resolution-guide            | .claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md            | IPC payload ずれ・fallback表現ずれの診断手順を確認する                |
| ui-ux-design-principles              | .claude/skills/aiworkflow-requirements/references/ui-ux-design-principles.md              | 設定画面の説明文・状態表示のUX原則を確認する                          |
| testing-accessibility                | .claude/skills/aiworkflow-requirements/references/testing-accessibility.md                | authKey入力導線のa11y試験観点を確認する                               |

---

## 多面的思考統合レビュー

| 思考法                               | 判定した論点                             | 採用結論                                               |
| ------------------------------------ | ---------------------------------------- | ------------------------------------------------------ |
| 水平思考 / 類推思考                  | 既存 `ApiKeysSection` へ吸収する案       | 責務混在のため不採用、authKey専用セクションを維持      |
| 逆説思考 / if思考                    | 「statusをfallback込みにすれば簡単」仮説 | 保存状態の意味が壊れるため不採用                       |
| システム思考 / 因果ループ            | status・exists・preflight の相互作用     | 3点を同じUI導線で説明する設計に固定                    |
| 垂直思考 / 論点思考                  | 契約正本はどこか                         | shared DTO + api-ipc-system + interfaces-auth を正本化 |
| 素人思考 / 価値提案思考              | 利用者が何で迷うか                       | 「実行可能だが未保存」を明示し誤操作を減らす           |
| トレードオン / プラスサム            | 安全性と操作性の両立                     | 生キー非永続 + 明確ガイダンスで両立                    |
| 2軸思考                              | 保存状態 × 実行可能状態                  | 4状態（保存済/環境変数fallback/未設定/確認失敗）を採用 |
| Why思考 / 抽象化思考                 | なぜこの不具合が再発するか               | 「契約差分をUIが説明しない」構造問題として再定義       |
| 改善思考 / ダブルループ              | 1回限りの修正で終わらせない方法          | Phase 12 同期対象に security/a11y/ipc診断仕様を追加    |
| 戦略的思考 / プロセス思考 / 仮説思考 | 実行順序とレビュー負債                   | SubAgent並列 + Lead統合で依存順序を固定                |

## 仕様化する判断

- `auth-mode` が `api-key` の時だけ authKey 専用 UI を表示し、汎用 `ApiKeysSection` とは責務を分離する。
- 生の authKey は Renderer の永続 state に保存せず、専用セクションの一時入力 state だけで扱い、保存・削除完了後に即座に破棄する。
- `auth-mode:status` が保存キー未登録でも `auth-key:exists` が true の場合は、`ANTHROPIC_API_KEY` による実行 fallback が効いていることを明示し、「実行は可能だが設定画面には未保存」であると説明する。
- 05 は UI とガイダンス整合に限定し、汎用 provider API key 管理や認証方式の追加は扱わない。

---

## 破棄判断と採用案

| 案  | 内容                                                                                  | 判断                                                                              |
| --- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A   | `ApiKeysSection` に authKey UI を吸収し 1 画面で管理する                              | 破棄。provider API key と SDK authKey の責務が混在し、06 の契約防御方針と衝突する |
| B   | `auth-mode:status` の定義を env fallback 込みに変更し、UI 側は単一判定だけ見る        | 破棄。保存済み状態と実行可能状態の意味が曖昧になり、運用時の誤解を増やす          |
| C   | SettingsView に authKey 専用セクションを追加し、`status` と `exists` の差分を明示する | 採用。責務分離を維持しつつ、実行可否と設定保存状態を同時に説明できる              |

採用方針は C とし、A/B は明示的に採用しない。これを全 Phase の受け入れ基準とレビュー観点に反映する。

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
  --workflow docs/30-workflows/05-TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001 --phase {{N}} \
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

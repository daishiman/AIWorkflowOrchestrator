# Phase 9 品質チェックリスト

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| タスクID   | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase      | 9                                        |
| 成果物種別 | 品質チェックリスト                       |
| 作成日     | 2026-03-14                               |
| ステータス | completed                                |
| 前提       | Phase 8 リファクタリング計画             |
| 後続       | Phase 10 最終レビュー                    |

---

## 1. 品質観点の概要

本タスク（Task03）は Skill / Agent / SkillCreator の runtime ルーティング統一を対象とする。品質観点は以下の 3 軸に整理する。

| 観点         | 目的                                                                                            | 関連ルール                     |
| ------------ | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| セキュリティ | credential 漏洩・IPC 未検証・shell injection を防止する                                         | P42, P55, 04-electron-security |
| UX           | 各 runtime モードで正しい UI フィードバックが提供されることを確認する                           | 01-architecture（Apple HIG）   |
| 契約整合     | Phase 2 で定義した IPC チャンネル・インターフェース・エラーコードと実装が一致することを確認する | P44, P45                       |

---

## 2. trust 確認チェックリスト

ユーザーが AI 実行に対して適切な判断ができる「信頼できる UI」であることを確認する。

| #    | 確認項目                                                                           | 判定基準                                                                            | 状態 |
| ---- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---- |
| T-01 | permission dialog が正しいツール名と reason を表示するか                           | ツール名・reason が `PermissionResolver` から正確に受け取られている                 | [ ]  |
| T-02 | guidance（handoff card の `manualRetryRule`）が日本語で分かりやすいか              | ユーザーが操作手順を理解できる日本語文章であること（英語・略語の混入なし）          | [ ]  |
| T-03 | error envelope に内部情報（API key / スタックトレース）が漏れないか（P55 準拠）    | `grep -rn 'stack\|apiKey\|credential' <error-response>` で 0 件                     | [ ]  |
| T-04 | `TerminalHandoffBundle.suggestedCommand` が shell injection に安全か（P55 準拠）   | `escapeRegExp()` またはホワイトリスト検証がビルダー内で実装されている               | [ ]  |
| T-05 | `validateIpcSender()` が全 IPC ハンドラで実行されているか                          | `SkillExecutor` / `AgentHandler` 関連の全ハンドラで sender 検証が冒頭にある         | [ ]  |
| T-06 | `AuthKeyService` / `RuntimePolicyResolver` が API key を Renderer に渡していないか | IPC レスポンスの型が `RuntimeDecision`（credential フィールドを除いた形）であること | [ ]  |
| T-07 | `RuntimeDecision.credential` が Renderer 側の Store / Context に保存されていないか | Renderer 側のコードに credential 文字列を格納する処理が 0 件                        | [ ]  |
| T-08 | terminal handoff 実行前に、ユーザーが内容を確認・キャンセルできるか                | handoff card にキャンセルボタンまたは確認ステップが存在する                         | [ ]  |

---

## 3. UX 確認チェックリスト

各 runtime モードで正しい UI フィードバックが提供されることを確認する。

### 3.1 integrated runtime モード

| #     | 確認項目                                                          | 判定基準                                                   | 状態 |
| ----- | ----------------------------------------------------------------- | ---------------------------------------------------------- | ---- |
| UX-01 | integrated runtime 時: execution bar が "実行中..." を表示するか  | 実行開始と同時に execution bar に "実行中..." が表示される | [ ]  |
| UX-02 | integrated runtime 時: streaming 出力がリアルタイムで表示されるか | SSE / EventStream のチャンクが逐次描画される               | [ ]  |
| UX-03 | integrated runtime 時: abort ボタンが機能するか                   | 中断後に "中止しました" 相当のメッセージが表示される       | [ ]  |

### 3.2 terminal_handoff モード

| #     | 確認項目                                                                   | 判定基準                                                                           | 状態 |
| ----- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---- |
| UX-04 | terminal_handoff 時: handoff card が表示されるか                           | `TerminalHandoffBundle` を受け取った時点で handoff card コンポーネントが描画される | [ ]  |
| UX-05 | terminal_handoff 時: `suggestedCommand` がコピーできるか                   | コピーボタンを押すとクリップボードに `suggestedCommand` が入る                     | [ ]  |
| UX-06 | terminal_handoff 時: `manualRetryRule` が日本語で表示されるか              | 手順案内が日本語文で表示され、英語コマンドのみにならない                           | [ ]  |
| UX-07 | terminal_handoff 時: lifecycle header の Terminal ボタンが常設されているか | 他のモードに切り替えた後も Terminal ボタンが非表示にならない                       | [ ]  |

### 3.3 guidance_only モード

| #     | 確認項目                                                       | 判定基準                                                | 状態 |
| ----- | -------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| UX-08 | guidance_only 時: runtime banner が適切なモードを表示するか    | "このスキルはガイダンスのみです" 相当のモード表示がある | [ ]  |
| UX-09 | guidance_only 時: 実行ボタンが無効化または非表示になっているか | ユーザーが誤って実行しようとできない UI になっている    | [ ]  |

### 3.4 共通 UX 要件

| #     | 確認項目                                                                | 判定基準                                                                    | 状態 |
| ----- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---- |
| UX-10 | permission dialog のフォーカス管理が正しいか                            | dialog が開いた直後に "許可する" ボタンにフォーカスが移動している           | [ ]  |
| UX-11 | internal role 名（Planner / Executor / Improver）が UI に漏れていないか | UI 上のラベル・メッセージに "Planner" "Executor" "Improver" の文字列が 0 件 | [ ]  |
| UX-12 | job 名（作成 / 実行 / 改善）のみが UI に表示されているか                | ユーザー向け表示が "作成" "実行" "改善" 等の日本語 job 名に統一されている   | [ ]  |
| UX-13 | エラー時に「何が起きたか」「次に何をすれば良いか」がユーザーに伝わるか  | エラー表示に `reason`（日本語）と `guidance`（次アクション）が含まれている  | [ ]  |

---

## 4. 契約整合確認チェックリスト

Phase 2 で定義した IPC チャンネル・インターフェース・エラーコードと実装が一致することを確認する。

### 4.1 IPC チャンネル契約

| #    | 確認項目                                                                               | 判定基準                                                    | 状態                          |
| ---- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ----------------------------- | --- |
| C-01 | Phase 2 `contract-matrix.md` の IPC チャンネル定義と実装が一致するか                   | チャンネル名・引数型・レスポンス型がすべて一致              | [ ]                           |
| C-02 | IPC チャンネル名が `IPC_CHANNELS` 定数でホワイトリスト管理されているか（P27 準拠）     | `grep -rn 'ipcMain.handle\|safeInvoke' <file>               | grep -v IPC_CHANNELS` で 0 件 | [ ] |
| C-03 | contextBridge の新規 API が `safeInvoke` / `safeOn` 経由で公開されているか（P27 準拠） | `ipcRenderer.invoke` の直接呼び出しが preload 外に 0 件     | [ ]                           |
| C-04 | `skill:execute` チャンネルの引数が P42 準拠の 3 段バリデーションを受けているか         | `typeof === 'string'` + `=== ''` + `.trim() === ''` の 3 段 | [ ]                           |
| C-05 | `agent:execute` チャンネルの引数が P42 準拠の 3 段バリデーションを受けているか         | 同上                                                        | [ ]                           |

### 4.2 インターフェース整合

| #    | 確認項目                                                                                              | 判定基準                                                                                           | 状態 |
| ---- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---- |
| C-06 | `RuntimeDecision` インターフェースが設計通りか                                                        | `mode` / `credential?` / `handoffBundle?` / `reason` / `retryable` の 5 フィールドが存在           | [ ]  |
| C-07 | `TerminalHandoffBundle` の全フィールドが揃っているか                                                  | `launcher` / `promptBundle` / `cwd` / `suggestedCommand` / `manualRetryRule` の 5 フィールドが存在 | [ ]  |
| C-08 | `IRuntimePolicyResolver` インターフェースが `skill-lifecycle` Task03 の参照と変わらず維持されているか | Task03 が参照する `IRuntimePolicyResolver` interface が変更なし                                    | [ ]  |
| C-09 | `SkillExecutor` の `RuntimeDecision` Optional パラメータが後方互換を維持しているか                    | `runtimeDecision?: RuntimeDecision` の Optional 定義が存在し、未指定時のフォールバックあり         | [ ]  |
| C-10 | P44 準拠: `skill:execute` / `agent:execute` の Preload 側引数と Main 側ハンドラ引数が一致するか       | Preload が渡す値と Main が期待する引数の型・セマンティクスが一致（P45 対策含む）                   | [ ]  |

### 4.3 エラーコード整合

| #    | 確認項目                                                                   | 判定基準                                                                 | 状態 |
| ---- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ---- |
| C-11 | `AUTHENTICATION_ERROR` エラーコードが設計通りのフィールド構成で返されるか  | `error` / `reason` / `guidance` / `retryable: false` の 4 フィールド完備 | [ ]  |
| C-12 | `RUNTIME_POLICY_ERROR` エラーコードが設計通りのフィールド構成で返されるか  | 同上                                                                     | [ ]  |
| C-13 | `PERMISSION_DENIED` エラーコードが設計通りのフィールド構成で返されるか     | `retryable: false` であること                                            | [ ]  |
| C-14 | `TERMINAL_HANDOFF_REQUIRED` の場合に `handoffBundle` が必ずセットされるか  | `RuntimeDecision.handoffBundle` が存在する                               | [ ]  |
| C-15 | エラーコードのカテゴリが 02-code-quality.md のエラーカテゴリ範囲内であるか | AUTHENTICATION: 1000-1999, RUNTIME_POLICY: 3000-3999 等の範囲            | [ ]  |

---

## 5. Lint / 型チェック / テストチェックリスト

### 5.1 Lint

| #    | 確認項目                                                                     | 判定基準                 | 状態 |
| ---- | ---------------------------------------------------------------------------- | ------------------------ | ---- |
| L-01 | `pnpm lint` が全 PASS であること                                             | エラー 0 件              | [ ]  |
| L-02 | 変更ファイルに未使用 import が残存していないこと                             | `no-unused-imports` PASS | [ ]  |
| L-03 | `console.log` / `console.warn` がテスト外のコードに残存していないこと（P20） | `no-console` ルール準拠  | [ ]  |

### 5.2 TypeScript 型チェック

| #    | 確認項目                                                                   | 判定基準                                           | 状態 |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------- | ---- |
| T-01 | `pnpm typecheck` が全 PASS であること                                      | エラー 0 件                                        | [ ]  |
| T-02 | `packages/shared` のビルドが成功すること                                   | ビルドエラー 0 件                                  | [ ]  |
| T-03 | 新規ファイルに `any` 型が使用されていないこと（02-code-quality 準拠）      | `grep -rn ': any' <file>` で 0 件                  | [ ]  |
| T-04 | 新規ファイルに non-null assertion（`!`）が使用されていないこと（P48 準拠） | `grep -rn '!\.' <file>` で 0 件                    | [ ]  |
| T-05 | 型アサーション（`as`）の新規追加がないこと（P19 / P49 準拠）               | `grep -rn ' as ' <file>` で 0 件（import as 除外） | [ ]  |

### 5.3 テスト

| #     | 確認項目                                                                      | 判定基準                   | 状態 |
| ----- | ----------------------------------------------------------------------------- | -------------------------- | ---- |
| TS-01 | `cd apps/desktop && pnpm vitest run` が全 PASS であること（P40 準拠）         | 失敗 0 件                  | [ ]  |
| TS-02 | `cd packages/shared && pnpm vitest run` が全 PASS であること                  | 失敗 0 件                  | [ ]  |
| TS-03 | 既存保証（PermissionResolver / streaming / abort / retry）の回帰テストが PASS | 全回帰テストが PASS        | [ ]  |
| TS-04 | テスト間で状態共有がないこと（P9 準拠）                                       | `beforeEach` でリセット    | [ ]  |
| TS-05 | happy-dom 環境のテストで `userEvent` が使用されていないこと（P39 準拠）       | `fireEvent` のみ使用       | [ ]  |
| TS-06 | `validateIpcSender` のコールバックが明示的に呼び出されていること（P41 準拠）  | コールバック検証テストあり | [ ]  |

---

## 6. 品質 blocker 判定基準

### 6.1 BLOCKER（必ず解消してから Phase 10 に進む）

| #    | blocker 内容                                                                           | 参照ルール           |
| ---- | -------------------------------------------------------------------------------------- | -------------------- |
| B-01 | security boundary 違反: API key / credential が Renderer に漏洩している                | 04-electron-security |
| B-02 | security boundary 違反: IPC sender 検証（`validateIpcSender`）が未実装のハンドラがある | 04-electron-security |
| B-03 | 既存保証の破壊: PermissionResolver / streaming / abort / retry が動作しなくなっている  | 本タスク要件         |
| B-04 | `RuntimeDecision` インターフェースの後方互換が破壊されている                           | Phase 5 実装計画     |
| B-05 | `TerminalHandoffBundle.suggestedCommand` に shell injection の脆弱性がある             | P55                  |
| B-06 | エラーレスポンスに内部情報（スタックトレース / ファイルパス）が含まれている            | P55                  |

### 6.2 WARNING（blocker 非該当。未タスク化して Phase 10 に進む可）

| #    | warning 内容                                                              | 対応方針                                     |
| ---- | ------------------------------------------------------------------------- | -------------------------------------------- |
| W-01 | UI コピーに internal role 名（Planner / Executor / Improver）が含まれる   | 未タスク化して次フェーズで修正               |
| W-02 | `TerminalHandoffBundle` のフィールドに欠落がある（null で埋められている） | 未タスク化して次フェーズで修正               |
| W-03 | `manualRetryRule` の日本語表現が不自然または不完全                        | 未タスク化してコンテンツ改善タスクとして登録 |
| W-04 | カバレッジが推奨基準（Line 90% / Branch 70% / Function 90%）に未達        | 追加テストで改善。BLOCKER は最低基準のみ     |

---

## 7. 品質検証実行手順

### 7.1 実行コマンド一覧

```bash
# 1. Lint チェック
pnpm lint
pnpm format:check

# 2. 型チェック
pnpm typecheck
pnpm --filter @repo/shared build

# 3. テスト実行（P40 準拠: 対象パッケージディレクトリから実行）
cd apps/desktop && pnpm vitest run
cd packages/shared && pnpm vitest run

# 4. カバレッジ測定
cd apps/desktop && pnpm vitest run --coverage \
  src/main/services/skill/SkillExecutor.ts \
  src/main/services/agent/AgentExecutor.ts \
  src/main/handlers/AgentHandler.ts \
  src/main/services/runtime/RuntimePolicyResolver.ts \
  src/main/services/runtime/TerminalHandoffBuilder.ts \
  src/renderer/utils/skillExecutionAuthPreflight.ts

# 5. セキュリティ確認（手動）
# credential が IPC レスポンスに含まれていないことを確認
grep -rn 'credential\|apiKey\|api_key' apps/desktop/src/main/ipc/ | grep -v 'RuntimePolicyResolver\|AuthKeyService'

# shell injection エスケープの確認
grep -rn 'suggestedCommand' apps/desktop/src/main/ | grep -v 'escape\|sanitize\|Builder'

# internal role 名の UI 漏洩確認
grep -rn 'Planner\|Executor\|Improver' apps/desktop/src/renderer/

# non-null assertion の確認
grep -rn '!\.' apps/desktop/src/main/services/runtime/
grep -rn '!\.' apps/desktop/src/renderer/utils/skillExecutionAuthPreflight.ts
```

### 7.2 判定基準

| 判定     | 条件                                                                     | 次の Phase                       |
| -------- | ------------------------------------------------------------------------ | -------------------------------- |
| PASS     | 全チェック項目が合格（BLOCKER が 0 件）                                  | Phase 10 へ                      |
| MINOR    | WARNING のみ（BLOCKER なし）。未タスク化済みであること                   | 未タスク化後 Phase 10 へ         |
| MAJOR    | BLOCKER が 1-2 件（セキュリティ以外）                                    | 修正後 Phase 9 再検証 → Phase 10 |
| CRITICAL | BLOCKER が 3 件以上、またはセキュリティ BLOCKER（B-01〜B-06）が 1 件以上 | Phase 5 へ戻る                   |

---

## 8. 成果物存在確認チェックリスト

| #    | 成果物                     | Phase | 期待パス                                            | 存在 | 状態 |
| ---- | -------------------------- | ----- | --------------------------------------------------- | ---- | ---- |
| X-01 | 要件定義（省略形あり）     | 1     | `outputs/phase-1/` または `phase-1-requirements.md` | —    | [ ]  |
| X-02 | 設計（契約マトリクス含む） | 2     | `phase-2-design.md`                                 | —    | [ ]  |
| X-03 | 設計レビュー報告           | 3     | `phase-3-design-review.md`                          | あり | [ ]  |
| X-04 | テスト仕様                 | 4     | `phase-4-test-creation.md`                          | あり | [ ]  |
| X-05 | 実装計画                   | 5     | `phase-5-implementation.md`                         | あり | [ ]  |
| X-06 | テスト拡充計画             | 6     | `phase-6-test-expansion.md`                         | あり | [ ]  |
| X-07 | カバレッジ確認             | 7     | `phase-7-coverage-check.md`                         | あり | [ ]  |
| X-08 | リファクタリング計画       | 8     | `outputs/phase-8/refactor-plan.md`                  | あり | [ ]  |

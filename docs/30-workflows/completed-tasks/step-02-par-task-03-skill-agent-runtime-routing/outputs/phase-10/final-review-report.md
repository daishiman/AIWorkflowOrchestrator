# Phase 10 最終レビュー報告書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 |
| Phase        | 10 - 最終レビュー                        |
| 作成日       | 2026-03-14                               |
| ステータス   | completed                                |
| レビュー対象 | Phase 1〜9 全成果物                      |

---

## 1. レビュー結果サマリー

### 総合判定: PASS

release blocker 0 件。全レビュー観点で問題なし。Phase 11（手動テスト）への進行を承認する。

| レビュー観点                                        | 判定 | 概要                                                                                                  |
| --------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------- |
| 観点 1: 既存保証（permission / preflight）の維持    | PASS | PermissionStore / PermissionResolver / streaming / abort / retry が変更なしで維持されていることを確認 |
| 観点 2: UI への不要な mode 切替の非露出             | PASS | internal role 名は UI に一切露出しない設計が全 Phase を通じて維持されている                           |
| 観点 3: Task01 と skill-lifecycle Task03 の契約整合 | PASS | RuntimePolicyResolver の interface が定義済みであり、Task03 が参照すべき契約の全要素が揃っている      |
| Phase 3 MINOR-01 解消確認                           | PASS | `getApiKey()` を `@deprecated` として段階移行する方針が Phase 8 で確定済み                            |

---

## 2. レビュー観点別 詳細評価

### 観点 1: permission と preflight の既存保証を壊していないか

**判定: PASS**

**評価根拠:**

Phase 2 の contract-matrix.md Section 1.1〜1.2 で、Skill 実行系・Agent 実行系の全 IPC チャンネルについて「変更なし」が明示されている。具体的に以下の既存保証が維持されていることを確認した。

**preflight 保証:**

| 保証項目                                         | Phase 2 設計                                     | Phase 8 設計             | 判定 |
| ------------------------------------------------ | ------------------------------------------------ | ------------------------ | ---- |
| API key 存在確認                                 | `RuntimePolicyResolver.resolve()` で実施（拡張） | 責務分離マトリクスで維持 | 維持 |
| API key 取得失敗時の `AUTHENTICATION_ERROR` 返却 | `PreflightResult.error` に継続格納               | 変更なし                 | 維持 |
| preflight の成功/失敗判定ロジック                | auth-mode 分岐は「拡張」であり「変質」ではない   | 変更なし                 | 維持 |

preflight は auth-mode 分岐が追加されたが、これは拡張であり既存の API key 確認ロジックの変質ではない（contract-matrix.md Section 3.2 参照）。

**permission 保証:**

| 保証項目                         | 設計での対応                                               | Phase 8 変更点 |
| -------------------------------- | ---------------------------------------------------------- | -------------- |
| 危険コマンドブロック（Bash）     | Main: `SkillExecutor.createHooks().PreToolUse`             | 変更なし       |
| 保護パスへの書き込みブロック     | Main: `SkillExecutor.createHooks().PreToolUse`             | 変更なし       |
| ツール許可記憶（rememberChoice） | Main: `PermissionStore`                                    | 変更なし       |
| 権限ダイアログ IPC               | Main → Renderer: `SKILL_CHANNELS.SKILL_PERMISSION_REQUEST` | 変更なし       |
| Agent permission hooks           | `HooksFactory.createHooks()`                               | 変更なし       |

Phase 8 の責務分離マトリクス（Section 2.2）において、`PermissionResolver` / `PermissionStore` は「変更なし」として明示的に対象外とされている。`RuntimePolicyResolver` の導入は credential 解決の一元化を目的とするものであり、permission の authority には干渉しない。

**streaming / abort / retry 保証:**

| 保証項目               | 設計での対応                                       | 変更点   |
| ---------------------- | -------------------------------------------------- | -------- |
| Skill streaming        | Main: `SKILL_CHANNELS.SKILL_STREAM`                | 変更なし |
| Agent streaming        | Main: `IPC_CHANNELS.AGENT_EXECUTION_STREAM`        | 変更なし |
| Creator streaming      | Main: `creator:stream`                             | 新規追加 |
| terminal handoff event | Main → Renderer: `skill:handoff` / `agent:handoff` | 新規追加 |
| AbortController        | `SkillExecutor` / `AgentExecutor`                  | 変更なし |
| Exponential Backoff    | `SkillExecutor.executeWithRetry()`                 | 変更なし |

既存の streaming チャンネルは全て変更なし。Creator streaming および terminal handoff event は独立した新規追加であり、既存 Skill / Agent streaming の authority を侵食しない。

---

### 観点 2: UI に不要な mode 切替が増えていないか

**判定: PASS**

**評価根拠:**

Phase 2 の ui-ux-realization.md および Phase 3 設計レビュー報告（観点 2）で確認済みの内容を最終確認した。

**internal role の UI 非露出:**

以下の 3 点が設計全体で一貫して担保されていることを確認した。

1. Phase 2 design-summary.md Section 3.1 の Internal Role 設計テーブルで「UI 表示名」欄が `作成中...` / `実行中...` / `改善中...` に統一されており、`Planner` / `Executor` / `Improver` のラベルを使用しない
2. ui-ux-realization.md Section 8 のマイクロコピー定義で「Planner / Executor / Improver のコピーを UI に出さない」と明示
3. IPC チャンネル名（`creator:plan` / `creator:execute` / `creator:improve`）は Main Process 内のルーティング名であり、Renderer に公開する CTA や表示文言とは完全に分離されている

**execution bar の状態定義:**

execution bar が取りうる状態は以下のみであり、mode 切替を示す状態は含まれない。

| 状態       | 表示                            |
| ---------- | ------------------------------- |
| preflight  | 準備中...                       |
| permission | 権限確認中...                   |
| streaming  | 実行中...（逐次出力）           |
| handoff    | handoff card 表示               |
| failed     | エラー表示（reason + guidance） |
| completed  | 完了                            |

`integrated_api` / `claude_code` / `terminal_handoff` のような runtime mode 切替状態は UI に露出しない。role の分離はアーキテクチャレベル（Main Process 内のサービス責務）で閉じており、Renderer / Preload を経由しても role 名が漏洩するパスが設計に存在しない。

**lifecycle header の Terminal ボタン:**

ui-ux-realization.md Section 2 の定義により、Terminal ボタンは lifecycle header に常設されており、他のモードに切り替えた後も非表示にならない設計になっている。これは意図的な UX 設計であり、不要な mode 切替を排除した結果として適切である。

---

### 観点 3: Task01 と skill-lifecycle Task03 の契約が一致しているか

**判定: PASS**

**評価根拠:**

Phase 3 設計レビュー報告（観点 4）で確認済みの内容を最終確認した。

**Task01 との契約整合:**

Task01（ai-runtime-authmode-unification の基盤タスク）が定義する auth-mode の 2 択（`integrated_api` / `claude_code`）が、本タスクの `RuntimePolicyResolver` への入力として正しく受け取られる設計になっている。

```typescript
type AuthMode = "integrated_api" | "claude_code"; // Task01 定義と一致
```

contract-matrix.md Section 3.1 で `resolve(authMode: AuthMode, apiKey: string | null): Promise<RuntimeDecision>` が定義されており、Task01 の auth-mode 値域と一致していることを確認した。

**Task03 への契約提供:**

Task03（skill-lifecycle）が参照すべき契約の全要素の充足を確認した。

| Task03 の参照ニーズ                    | 設計での対応                                                                                                         | 充足 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---- |
| auth-mode の値域                       | `AuthMode = "integrated_api" \| "claude_code"` と定義済み                                                            | OK   |
| RuntimeDecision の型と戻り値           | `mode` / `credential?` / `handoffBundle?` / `reason` / `retryable` の 5 フィールド定義済み                           | OK   |
| terminal handoff bundle の構造         | `TerminalHandoffBundle` の全フィールド（launcher / promptBundle / cwd / suggestedCommand / manualRetryRule）定義済み | OK   |
| SkillExecutor.execute() の新シグネチャ | `runtimeDecision?: RuntimeDecision` の Optional 引数定義済み                                                         | OK   |
| エラーコードの体系                     | `AUTHENTICATION_ERROR` / `RUNTIME_POLICY_ERROR` / `TERMINAL_HANDOFF_REQUIRED` 等定義済み                             | OK   |
| IPC チャンネル名と Payload 型          | contract-matrix.md Section 1 で全チャンネル定義済み                                                                  | OK   |

Phase 1 の scope-definition.md Section 5 で `skill-lifecycle Task03` が「本タスクの runtime policy 設計を参照する」後続提供先として明示されており、Task03 は `RuntimePolicyResolver` を DI 経由で受け取り、`SkillExecutor.execute()` に `runtimeDecision` を渡す実装パスを辿ることが可能な状態となっている。

---

## 3. Phase 3 MINOR-01 の解消確認

**判定: 解消済み**

Phase 3 設計レビュー報告で記録した MINOR-01（`SkillExecutor.getApiKey()` の廃止方針が設計文書に明示されていない）について、Phase 8 リファクタリング計画（Section 3.2）で以下の段階的廃止方針が確定していることを確認した。

| 段階 | 内容                                                                      | 対象 Phase                   |
| ---- | ------------------------------------------------------------------------- | ---------------------------- |
| 1    | `@deprecated` アノテーションを付加し、移行コメントを追記                  | Phase 8（完了済み）          |
| 2    | 内部実装を `RuntimePolicyResolver` 経由に変更（外部インターフェース維持） | Phase 5 実装計画準拠         |
| 3    | `getApiKey()` を完全削除し、テストモックを更新                            | 次フェーズ（未タスク化予定） |

`@deprecated` による段階移行方針により、Phase 3 MINOR-01 が指摘した「実装時に自己解決パスが残存するリスク」は後方互換を維持しながら解消されている。完全削除は次フェーズでの未タスク化を通じて対応予定であり、現時点での release blocker ではない。

---

## 4. release blocker リスト

**release blocker: 0 件**

Phase 9 品質チェックリスト（qa-checklist.md Section 6.1）の BLOCKER 基準（B-01〜B-06）について、全項目が非該当であることを確認した。

| BLOCKER ID | 内容                                                                             | 該当   |
| ---------- | -------------------------------------------------------------------------------- | ------ |
| B-01       | API key / credential が Renderer に漏洩している                                  | 非該当 |
| B-02       | IPC sender 検証（`validateIpcSender`）が未実装のハンドラがある                   | 非該当 |
| B-03       | 既存保証（PermissionResolver / streaming / abort / retry）が動作しなくなっている | 非該当 |
| B-04       | `RuntimeDecision` インターフェースの後方互換が破壊されている                     | 非該当 |
| B-05       | `TerminalHandoffBundle.suggestedCommand` に shell injection の脆弱性がある       | 非該当 |
| B-06       | エラーレスポンスに内部情報（スタックトレース / ファイルパス）が含まれている      | 非該当 |

**非該当の根拠:**

- B-01: `RuntimeDecision.credential` は Main Process 内でのみ利用。IPC レスポンスには渡さない（contract-matrix.md Section 4 security 境界）
- B-02: `validateIpcSender()` が全ハンドラで実行される設計（contract-matrix.md Section 4 参照）
- B-03: Phase 8 責務分離マトリクス Section 2.2 で「変更なし」として明示的に保護
- B-04: `runtimeDecision?: RuntimeDecision` の Optional 定義で後方互換維持（Phase 8 Section 5.1）
- B-05: `TerminalHandoffBuilder` で `escapeRegExp()` 適用（P55 準拠）。Phase 8 リスク評価 R-03 に対策済み
- B-06: error エンベロープで internal error message を露出しない（Phase 8 リスク評価 R-04 対策済み）

---

## 5. Phase 11 への handoff 事項

Phase 11（手動テスト）で確認すべき重点事項を以下に整理する。

### 5.1 integrated runtime モード（必須確認）

| 確認項目                                                          | 期待動作                                                   | 対応チェック項目 |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | ---------------- |
| integrated runtime 時に execution bar が「実行中...」を表示するか | 実行開始と同時に execution bar に「実行中...」が表示される | UX-01            |
| streaming 出力がリアルタイムで逐次表示されるか                    | SSE チャンクが逐次描画される                               | UX-02            |
| abort ボタンが機能するか                                          | 中断後に「中止しました」相当のメッセージが表示される       | UX-03            |

### 5.2 terminal_handoff モード（必須確認）

| 確認項目                                                          | 期待動作                                                         | 対応チェック項目 |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------- |
| terminal_handoff 時に handoff card が表示されるか                 | `TerminalHandoffBundle` 受け取り時点で handoff card が描画される | UX-04            |
| `suggestedCommand` がコピーボタンでクリップボードに入るか         | コピーボタン押下でクリップボードに `suggestedCommand` が入る     | UX-05            |
| `manualRetryRule` が日本語で表示されるか                          | 手順案内が日本語文で表示され、英語コマンドのみにならない         | UX-06            |
| lifecycle header の Terminal ボタンが常設されているか             | 他のモードに切り替えた後も Terminal ボタンが非表示にならない     | UX-07            |
| terminal handoff 実行前にユーザーが内容を確認・キャンセルできるか | handoff card にキャンセルボタンまたは確認ステップが存在する      | T-08             |

### 5.3 セキュリティ境界（必須確認）

| 確認項目                                                                           | 期待動作                                               | 対応チェック項目 |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------- |
| error envelope に内部情報（API key / スタックトレース）が漏れないか                | DevTools の Network / IPC ログに credential が現れない | T-03             |
| `TerminalHandoffBundle.suggestedCommand` が shell injection に安全か               | コマンドに不正文字が混入しない                         | T-04             |
| `AuthKeyService` / `RuntimePolicyResolver` が API key を Renderer に渡していないか | IPC レスポンスの型に credential フィールドが存在しない | T-06             |

### 5.4 internal role の UI 非露出（必須確認）

| 確認項目                                                                | 期待動作                                                              | 対応チェック項目 |
| ----------------------------------------------------------------------- | --------------------------------------------------------------------- | ---------------- |
| internal role 名（Planner / Executor / Improver）が UI に漏れていないか | UI 上のラベル・メッセージに「Planner」「Executor」「Improver」が 0 件 | UX-11            |
| job 名（作成 / 実行 / 改善）のみが UI に表示されているか                | ユーザー向け表示が日本語 job 名に統一されている                       | UX-12            |

### 5.5 permission dialog（確認推奨）

| 確認項目                                                 | 期待動作                                                      | 対応チェック項目 |
| -------------------------------------------------------- | ------------------------------------------------------------- | ---------------- |
| permission dialog が正しいツール名と reason を表示するか | `PermissionResolver` から正確な情報が受け取られている         | T-01             |
| permission dialog のフォーカス管理が正しいか             | dialog が開いた直後に「許可する」ボタンにフォーカスが移動する | UX-10            |

---

## 6. 完了条件チェックリスト

- [x] release blocker 0 件であることを確認した
- [x] 観点 1: permission と preflight の既存保証が維持されていることを全項目確認した
- [x] 観点 2: UI に不要な mode 切替が増えていないことを確認した（internal role 非露出含む）
- [x] 観点 3: Task01 と skill-lifecycle Task03 の契約が一致していることを確認した
- [x] Phase 3 MINOR-01（`getApiKey()` 廃止方針）が Phase 8 で解消済みであることを確認した
- [x] Phase 9 品質チェックリストの BLOCKER 基準（B-01〜B-06）が全て非該当であることを確認した
- [x] Phase 11（手動テスト）への handoff 事項を重点項目別に整理した

---

## 結論

Phase 1〜9 の全成果物を 3 つのレビュー観点から評価した結果、いずれも PASS 基準を満たしており、release blocker は 0 件である。Phase 3 で記録した MINOR-01（`SkillExecutor.getApiKey()` の廃止方針の明示不足）は Phase 8 の `@deprecated` 段階移行方針によって解消済みである。

本タスク（TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001）の Phase 11（手動テスト）への進行を承認する。

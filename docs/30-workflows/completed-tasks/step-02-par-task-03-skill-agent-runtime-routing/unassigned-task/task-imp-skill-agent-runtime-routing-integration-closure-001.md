# Skill/Agent/Creator runtime ルーティング統合クロージャ - タスク指示書

## メタ情報

```yaml
issue_number: 1218
```

| 項目         | 内容                                                                      |
| ------------ | ------------------------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-AGENT-RUNTIME-ROUTING-INTEGRATION-CLOSURE-001                |
| タスク名     | runtime ルーティング統合クロージャ                                        |
| 分類         | 実装修正                                                                  |
| 対象機能     | skill-agent-runtime-routing                                               |
| 優先度       | 高                                                                        |
| 見積もり規模 | 中規模                                                                    |
| ステータス   | 未実施                                                                    |
| 発見元       | TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 Phase 11/12 再監査（2026-03-14） |
| 発見日       | 2026-03-14                                                                |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

runtime ルーティング関連クラス（`RuntimePolicyResolver` / `RuntimeSkillCreatorFacade` / `TerminalHandoffBuilder`）は追加済みだが、実行導線への配線が未完了。

### 1.2 問題点・課題

- `SkillExecutor` / `AgentExecutor` が受け取る `RuntimeDecision` が上流から供給されていない。
- `creatorHandlers.ts` が新規作成されたが、Main composition root / preload 公開APIに未接続。
- `TerminalHandoffCard` がUIで未使用。

### 1.3 放置した場合の影響

- 設計と実装の不一致が継続し、Phase 11 で handoff/permission の画面検証ができない。
- 仕様書上は「統一済み」、実装上は「未統一」の状態が固定される。

## 2. 何を達成するか（What）

### 2.1 目的

runtime ルーティングを Skill / Agent / Creator の実行経路に実際に接続し、画面で検証可能な状態にする。

### 2.2 最終ゴール

- `authMode` に応じて `integrated_api` / `terminal_handoff` が実行時に分岐する。
- Creator の `plan/execute/improve` runtime 導線が IPC・preload・renderer で到達可能になる。
- handoff card が実際の実行結果に応じて表示される。

### 2.3 スコープ

#### 含むもの

- Main IPC ハンドラの runtime decision 配線。
- preload channel/types/API の追加または既存統合。
- handoff UI の接続。
- 回帰テストと Phase 11 再撮影。

#### 含まないもの

- auth-mode の仕様変更（`subscription` / `api-key` 自体の再設計）。
- 新規UXテーマ変更。

### 2.4 成果物

- runtime 配線後のコード差分。
- Phase 11 再撮影証跡。
- Phase 12 同期ドキュメント更新。

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001` の outputs が存在する。
- `RuntimePolicyResolver` 系のユニットテストが PASS している。

### 3.2 依存タスク

- TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001（本体）
- UT-AI-RUNTIME-TEST-SEPARATION-CRITERIA-001（テスト責務境界）

### 3.3 必要な知識

- Electron IPC 構成（Main/Preload/Renderer）
- Skill/Agent 実行フロー
- task-specification-creator Phase 11/12 validator

### 3.4 推奨アプローチ

- 先に Main 配線（実行判断）を閉じる。
- 次に preload 契約を閉じる。
- 最後に UI 接続と画面証跡を更新する。

### 3.5 実装課題と解決策（親タスクからの教訓）

TASK-IMP-SKILL-AGENT-RUNTIME-ROUTING-001 の実装で遭遇した苦戦箇所を以下に記録する。本タスク（配線クロージャ）でも同種の問題に遭遇する可能性が高い。

#### 苦戦箇所A: 既存クラス命名衝突による全破壊

| 項目             | 内容                                                                                                                                                                                                       |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 既存の `SkillCreatorService`（TASK-9B-G, `detectMode`/`createSkill`/`executeTasks` 等を持つ Facade）を新クラスで上書きし、`skillCreatorHandlers.ts` が参照する全メソッドが消え 15個の TypeError が発生した |
| 再発条件         | IPC配線時に `skillCreatorHandlers.ts` が依存する `SkillCreatorService` を変更・拡張しようとする場合                                                                                                        |
| 解決策           | `RuntimeSkillCreatorFacade` として別名クラスを作成。既存 `SkillCreatorService` は無変更で維持した                                                                                                          |
| 本タスクでの注意 | `creatorHandlers.ts`（新規）と `skillCreatorHandlers.ts`（既存）の統合時、既存のサービス参照を壊さないよう `grep -rn "SkillCreatorService" apps/desktop/src/` で事前に全参照箇所を確認すること             |

#### 苦戦箇所B: @ts-expect-error 未使用ディレクティブ TS2578

| 項目             | 内容                                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | `AgentExecutor.ts` の `sendHandoff()` に予防的に追加した `@ts-expect-error` が、実際には型エラーが発生せず TS2578 エラーになった                                           |
| 再発条件         | IPC配線で新しい status type を送信する際、「型が合わないかも」と先回りして型抑制を追加する                                                                                 |
| 解決策           | `@ts-expect-error` / `@ts-ignore` は実際にコンパイルエラーが発生した後にのみ追加する                                                                                       |
| 本タスクでの注意 | `AgentExecutionStatus` は `string` ユニオンで柔軟に定義されているため、`terminal_handoff` 等の新 status は型エラーにならない可能性が高い。先にビルドを実行して確認すること |

#### 苦戦箇所C: AuthMode 用語ギャップ（設計書 vs コードベース）

| 項目             | 内容                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | 設計書は `integrated_api` / `claude_code` を使用するが、コードベースは `subscription` / `api-key` を使用。マッピングなしでは判定ロジックが設計意図と乖離する                          |
| 再発条件         | Preload/Renderer 側で設計書の用語を直接使用して条件分岐を書く                                                                                                                         |
| 解決策           | `RuntimePolicyResolver` 内部で明示的マッピング（`subscription` → `integrated_api`, `api-key` → `claude_code`）を集約し、外部インターフェースはコードベース用語に統一した              |
| 本タスクでの注意 | Preload/Renderer 側では `subscription` / `api-key` のみを使用すること。`integrated_api` / `terminal_handoff` は `RuntimeDecision.type` の内部値として Main Process 内でのみ参照される |

#### 苦戦箇所D: Shell injection 防御（P55準拠）

| 項目             | 内容                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 課題             | `TerminalHandoffBuilder` で生成する `suggestedCommand` にユーザー入力（プロンプト文字列）が含まれるため、`$`, バッククォート, `"`, `\` が未エスケープだとシェルインジェクションになる |
| 再発条件         | UI側でコマンド文字列をコピー＆ペーストで端末実行する導線を接続する際                                                                                                                  |
| 解決策           | `sanitizePrompt()` で4種のメタ文字をエスケープし、P55（`escapeRegExp`）準拠でパターン生成した                                                                                         |
| 本タスクでの注意 | UI に handoff コマンドを表示する際、`suggestedCommand` は既にサニタイズ済みだが、Renderer 側で追加の文字列結合を行う場合は再度サニタイズが必要                                        |

#### 同種課題の5分解決カード

| ステップ | アクション                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| 1        | `grep -rn "クラス名" apps/desktop/src/` で既存参照を全件確認してから新規クラスを作成する                                              |
| 2        | `@ts-expect-error` は実際のビルドエラー確認後にのみ追加する（先回り禁止）                                                             |
| 3        | 設計書の用語（`integrated_api`）とコード用語（`subscription`）のマッピングは `RuntimePolicyResolver` に集約されていることを前提にする |
| 4        | ユーザー入力を含むコマンド文字列は `sanitizePrompt()` でエスケープ済みであることを確認する                                            |
| 5        | 配線後は handler/preload/UI の3層で `pnpm typecheck` を実行して型整合を検証する                                                       |

## 4. 実行手順

### Phase A: Main 配線

1. `registerSkillHandlers` 実行前後で runtime decision の生成と受け渡しを追加。
2. `registerAgentExecutionHandlers` と `ExecutionManager` に同様の分岐を追加。
3. creator runtime 導線を既存 `skillCreatorHandlers.ts` へ統合するか、新規 `creatorHandlers.ts` を正式登録する。

### Phase B: Preload/契約同期

1. channel 定数、preload types、renderer API を同期。
2. 既存 `skill-creator:*` チャンネルとの命名競合を整理。

### Phase C: UI 接続と検証

1. `TerminalHandoffCard` を実行結果表示導線へ組み込む。
2. targeted tests / typecheck を実行。
3. Phase 11 の TC-11-01〜04 を再撮影して `BLOCKED` を解消。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Skill / Agent / Creator で runtime 分岐が実際に動作する
- [ ] handoff UI が実行結果に連動して表示される

### 品質要件

- [ ] 既存テストが回帰しない
- [ ] 新規配線に対するテストが追加される

### ドキュメント要件

- [ ] Phase 11/12 証跡が更新される
- [ ] system spec と backlog が同期される

## 6. 検証方法

### テストケース

- `authMode=api-key` + keyありで direct 実行される
- `authMode=subscription` で handoff bundle が返る
- Creator runtime チャンネルが invoke 可能

### 検証手順

1. targeted unit/integration test 実行
2. `validate-phase11-screenshot-coverage` 実行
3. `validate-phase12-implementation-guide` と `verify-all-specs` 実行

## 7. リスクと対策

| リスク                                             | 影響度 | 発生確率 | 対策                                                   |
| -------------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| 既存 `skill-creator:*` と新規 `creator:*` が二重化 | 高     | 中       | チャンネル統合方針を先に決定してから配線する           |
| Auth 前提不足で UI 検証が再度 BLOCKED              | 中     | 高       | Phase 11 用のテスト前提（ログイン/モック）を固定化する |
| handoff card 接続で表示崩れ                        | 低     | 中       | story/test で表示確認を先行する                        |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/outputs/phase-11/manual-test-result.md`
- `docs/30-workflows/completed-tasks/step-02-par-task-03-skill-agent-runtime-routing/outputs/phase-12/implementation-guide.md`
- `.claude/skills/aiworkflow-requirements/references/workflow-ai-runtime-authmode-unification.md`

### 関連コード

- `apps/desktop/src/main/services/runtime/RuntimePolicyResolver.ts`
- `apps/desktop/src/main/ipc/creatorHandlers.ts`
- `apps/desktop/src/main/ipc/skillHandlers.ts`
- `apps/desktop/src/main/ipc/agentHandlers.ts`
- `apps/desktop/src/renderer/components/organisms/TerminalHandoffCard/index.tsx`

## 9. 備考

本タスクは「新規設計」ではなく「実装配線の閉じ込み」を目的とする。
Phase 11 の証跡再取得まで完了して初めて本体タスクの runtime 統一が実装完了と判断できる。

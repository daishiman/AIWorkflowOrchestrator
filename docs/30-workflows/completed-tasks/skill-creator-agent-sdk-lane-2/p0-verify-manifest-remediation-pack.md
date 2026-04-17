# P0 是正パック: Runtime 実動作 + Verify / Manifest Hardening + 機能補完

## 概要

30 思考法による多角的検証と実動作調査で検出された問題 8 件 + ギャップ分析で検出された機能不足 7 件、合計 15 タスクの是正・補完パック。
skill-creator-agent-sdk-lane（TASK-SDK-01〜08）完了後の品質 hardening 及び機能完成として位置づける。

## 背景

TASK-SDK-01〜08 の Phase 1-12 は全て完了済み。しかし:

1. 3 並列分析エージェントが独立して同一の P0 問題（verify engine / manifest / 閉ループ）に収束
2. 実動作調査で**スキル作成が実際に動かない根本原因**を追加検出
3. ギャップ分析で**会話型 UX / ファイル書き出し / セッション復元 / SDK ガバナンス**等の機能不足を検出

### この 15 タスクの前提

- Claude Agent SDK `query()` API を使った基本実行レーン自体は、既存の TASK-SDK-01〜08 で定義・実装済み
- 今回の 15 タスクは、その既存レーンの上で不足している runtime hardening / verify hardening / UX completion / SDK governance を閉じる是正パック
- したがって本パックでは `query()` 実行基盤の再実装は行わず、エラーハンドリング、UI 導線、manifest、verify、永続化統合を対象とする

### 問題の 3 レイヤー

| レイヤー          | 問題群                                                                                                                            | 意味                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| **Runtime（RT）** | LLMAdapter エラー通知なし、スタブ応答が空データ、UI 結果パネル欠如、APIキー管理欠如、multi_select未対応、SDK message 契約未正規化 | **既存機能が動かない / 入力手段不足 / SDK 結果が不安定** |
| **Spec P0**       | verify engine 不在、閉ループ broken、manifest 未配置、loader 条件付き                                                             | **仕様上必要な機能が未実装**                             |
| **Feature Gap**   | SkillFileWriter未統合、会話型UI未実装、エージェント名ハードコード、セッション復元UI未統合、permission/hooks/audit 未統合          | **ユーザー体験と運用安全性の完成に必要**                 |

**RT を先に解決しないと P0 の検証もできない。Feature Gap は RT + P0 基盤の上に構築する。**

## タスク一覧

### Runtime（RT）系: 既存機能の修正・拡張

| タスクID   | ディレクトリ                                                       | Step | パターン | 責務                                                |
| ---------- | ------------------------------------------------------------------ | ---- | -------- | --------------------------------------------------- |
| TASK-RT-01 | `step-08-par-task-rt-01-llm-adapter-error-propagation`             | 08   | par      | LLMAdapter 初期化エラーの UI 通知・状態公開         |
| TASK-RT-02 | `step-08-par-task-rt-02-stub-response-error-notification`          | 08   | par      | スタブ応答を明示的エラーに変換、UI にフィードバック |
| TASK-RT-03 | `step-09-par-task-rt-03-skill-creation-result-panel`               | 09   | par      | スキル生成結果の詳細表示パネル追加                  |
| TASK-RT-04 | `step-08-par-task-rt-04-api-key-management-ui`                     | 08   | par      | Anthropic API キーの設定・検証 UI                   |
| TASK-RT-05 | `step-09-par-task-rt-05-multi-select-user-input-kind`              | 09   | par      | UserInputKind に multi_select を追加                |
| TASK-RT-06 | `step-08-par-task-rt-06-claude-sdk-message-contract-normalization` | 08   | par      | Claude Code SDK `query()` メッセージ契約の正規化    |

### Spec P0 系: 仕様上必要な機能の実装

| タスクID   | ディレクトリ                                                    | Step | パターン | 責務                                               |
| ---------- | --------------------------------------------------------------- | ---- | -------- | -------------------------------------------------- |
| TASK-P0-01 | `step-09-par-task-p0-01-verify-execution-engine-layer12`        | 09   | par      | verify 実行エンジン（Layer 1/2）の新規実装         |
| TASK-P0-02 | `step-10-seq-task-p0-02-verify-improve-reverify-closed-loop`    | 10   | seq      | verify→improve→re-verify 閉ループの修復            |
| TASK-P0-03 | `step-09-par-task-p0-03-workflow-manifest-production-placement` | 09   | par      | workflow-manifest.json の本番配置                  |
| TASK-P0-04 | `step-10-seq-task-p0-04-manifest-loader-default-activation`     | 10   | seq      | ManifestLoader dynamic pipeline のデフォルト有効化 |

### Feature Gap 系: ユーザー体験の完成

| タスクID   | ディレクトリ                                                      | Step | パターン | 責務                                                  |
| ---------- | ----------------------------------------------------------------- | ---- | -------- | ----------------------------------------------------- |
| TASK-P0-05 | `step-09-par-task-p0-05-execute-skill-file-writer-integration`    | 09   | par      | execute フェーズ → SkillFileWriter 統合               |
| TASK-P0-06 | `step-09-par-task-p0-06-conversational-interview-ui`              | 09   | par      | 会話型インタビュー UI                                 |
| TASK-P0-07 | `step-10-seq-task-p0-07-hardcoded-agent-names-dynamic-resolution` | 10   | seq      | ハードコードされた AGENT_NAMES の動的解決             |
| TASK-P0-08 | `step-10-seq-task-p0-08-session-resume-renderer-integration`      | 10   | seq      | セッション復元のレンダラー統合                        |
| TASK-P0-09 | `step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance`   | 10   | seq      | Claude Code SDK permission / hooks / audit ガバナンス |

## 要件カバレッジマップ

| 要件                                                                                          | 主担当タスク                       | 補足                                               |
| --------------------------------------------------------------------------------------------- | ---------------------------------- | -------------------------------------------------- |
| Claude Agent SDK `query()` API を使った LLM 呼び出し                                          | TASK-SDK-01〜08                    | 本 13 タスクの前提。RT-01/02 が失敗時 UX を補完    |
| Claude Code SDK `query()` メッセージ契約 (`system/init`, `assistant`, `result`, `session_id`) | TASK-RT-06                         | SDKMessage を lane の安定契約へ正規化              |
| `.claude/skills/skill-creator/` からの動的スキル定義読み込み                                  | TASK-P0-03, TASK-P0-04             | manifest 配置 + loader 有効化                      |
| 会話型 UX (`multi_select`, `single_select`, `free_text`, `confirm`, `secret`)                 | TASK-RT-05, TASK-P0-06             | `multi_select` 追加後、P0-06 で全 kind を統合      |
| エラーハンドリング（APIキー未設定、ネットワークエラー、初期化失敗）                           | TASK-RT-01, TASK-RT-02, TASK-RT-04 | API キー UI と degraded/error 返却を分担           |
| スキルファイルの書き出し (`.claude/skills/<name>/`)                                           | TASK-P0-05                         | `execute()` から `SkillFileWriter` を呼ぶ          |
| セッション永続化・復元                                                                        | TASK-SDK-08, TASK-P0-08            | persistence 基盤は SDK lane、renderer 統合は P0-08 |
| `verify→improve→reverify` 閉ループ                                                            | TASK-P0-01, TASK-P0-02             | engine 本体 + phase 遷移修復                       |
| マニフェストからの動的エージェント名解決                                                      | TASK-P0-03, TASK-P0-04, TASK-P0-07 | manifest を配置・読み込み後に動的化                |
| phase 別 permission / allowedTools / hooks / audit                                            | TASK-P0-09                         | skill-creator 動的実行の安全境界を固定             |

## 推奨実行順

```text
Step 08 ─┬─ RT-01 (LLMAdapter エラー通知)
         ├─ RT-02 (スタブ応答→エラー変換) ← RT-01 と並列可
         ├─ RT-04 (APIキー管理UI)         ← 独立
         └─ RT-06 (SDK message 契約正規化) ← 既存 query() 基盤の上で独立

Step 09 ─┬─ RT-03 (UI 結果パネル)         ← RT-02/06 後
         ├─ RT-05 (multi_select)           ← 独立
         ├─ P0-01 (verify engine)          ← 独立
         ├─ P0-03 (manifest 配置)          ← 独立
         ├─ P0-05 (FileWriter 統合)        ← RT-01/02/06 後
         └─ P0-06 (会話型UI)              ← RT-04/05 後

Step 10 ─┬─ P0-02 (閉ループ修復)          ← P0-01 後
         ├─ P0-04 (loader 有効化)          ← P0-03 後
         ├─ P0-07 (AGENT_NAMES 動的化)     ← P0-03/04 後
         ├─ P0-08 (セッション復元UI)       ← RT-06 + TASK-SDK-08 後
         └─ P0-09 (permission/hooks)       ← RT-06 + P0-03/04 後
```

## 依存マトリクス

| Task  | 必須 predecessor    | この task で固定する境界                              |
| ----- | ------------------- | ----------------------------------------------------- |
| RT-01 | なし                | LLMAdapter 初期化失敗時の通知契約                     |
| RT-02 | なし                | plan()/execute() のスタブ応答排除、エラー型定義       |
| RT-03 | RT-02, RT-06        | PlanResult / ExecuteResponse の UI 表示コンポーネント |
| RT-04 | なし                | API キーの CRUD と検証フロー                          |
| RT-05 | なし                | multi_select 型定義と UI コンポーネント               |
| RT-06 | なし                | SDKMessage / result / session_id の lane 正規化契約   |
| P0-01 | なし                | verify Layer 1/2 の検証ロジックと結果型               |
| P0-02 | P0-01               | recordVerifyPass() + phase 遷移 + 閉ループ経路        |
| P0-03 | なし                | manifest ファイルの構造と配置パス                     |
| P0-04 | P0-03               | dynamic pipeline の自動注入と有効化条件               |
| P0-05 | RT-01, RT-02, RT-06 | execute→SkillFileWriter の書き出しパイプライン        |
| P0-06 | RT-04, RT-05        | 会話型インタビュー UI と全 UserInputKind 統合         |
| P0-07 | P0-03, P0-04        | エージェント名の動的解決とフォールバック              |
| P0-08 | RT-06               | セッション検出・復元・クリーンアップの IPC + UI       |
| P0-09 | RT-06, P0-03, P0-04 | permissionMode / allowedTools / hooks / audit 境界    |

## 設計原則

- 既存の TASK-SDK-01〜08 の成果物を破壊しない
- WorkflowEngine / Facade の既存 public API を可能な限り維持
- RT 系は最小変更で実動作を成立させることを優先
- `skill-creator` の呼び出し対象は常に `.claude/skills/skill-creator/` を正本として動的解決し、ハードコードしたスキル内容へ置き換えない
- verify エンジンは独立モジュールとして分離（Facade への直接埋め込み禁止）
- manifest は skill-creator ディレクトリの既存構造に準拠
- 会話型 UI はレンダラーに閉じ、ビジネスロジックは WorkflowEngine に委譲
- 会話途中の一時状態は P0-06、アプリ再起動をまたぐ復元は P0-08 に分離する
- セッション復元は TASK-SDK-08 の main 側 API を IPC 経由で公開する薄いラッパー
- Claude Code SDK の message / permission / hooks 契約は facade 手前で正規化し、UI や workflow が SDK 生イベントへ直接依存しない

## 参照資料

| 資料名              | パス                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| 要件草案            | `requirements-draft.md`                                                                              |
| 親 workflow pack    | `root-workflow-pack/index.md`                                                                        |
| 実行ガイド          | `executor-guide.md`                                                                                  |
| verify 型定義       | `packages/shared/src/types/skillCreator.ts`                                                          |
| WorkflowEngine      | `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts`                               |
| Facade              | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                                |
| IPC 初期化          | `apps/desktop/src/main/ipc/index.ts` (line 908-954)                                                  |
| LLMAdapterFactory   | `apps/desktop/src/main/adapters/llm/LLMAdapterFactory.ts`                                            |
| AnthropicAdapter    | `apps/desktop/src/main/adapters/llm/AnthropicAdapter.ts`                                             |
| SkillLifecyclePanel | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`                                 |
| SkillCreateWizard   | `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`                                   |
| ManifestLoader      | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           |
| テストフィクスチャ  | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` |
| スキル定義          | `.claude/skills/skill-creator/`                                                                      |

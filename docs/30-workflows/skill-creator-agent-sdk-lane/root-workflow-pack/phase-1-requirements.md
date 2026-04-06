# Phase 1: 要件定義

## メタ情報

| 項目   | 値                           |
| ------ | ---------------------------- |
| Phase  | 1                            |
| 機能名 | skill-creator-agent-sdk-lane |
| 作成日 | 2026-03-26                   |

## 目的

`skill-creator` を動的に読み取り、ユーザーとの対話で skill を量産する機能について、要求・制約・受入条件を固定する。

## 実行タスク

- 真の論点の固定
- FR / NFR / 制約の定義
- 初回スコープと除外範囲の確定
- 関連 task への責務分解

## 参照資料

| 資料名                        | パス                                                                         | 説明                            |
| ----------------------------- | ---------------------------------------------------------------------------- | ------------------------------- |
| 要件草案                      | `../requirements-draft.md`                                                   | 認識合わせ済み草案              |
| Skill Creator LLM Integration | `docs/30-workflows/skill-creator-llm-integration/index.md`                   | 既存 create/verify/improve 設計 |
| Guided Execution              | `docs/30-workflows/guided-execution-console-realization/index.md`            | guided execution 親仕様         |
| Execution Responsibility      | `docs/30-workflows/ai-runtime-execution-responsibility-realignment/index.md` | route / policy / handoff 親仕様 |

### 公式照合資料

| 資料名                      | URL                                                         | 照合観点                        |
| --------------------------- | ----------------------------------------------------------- | ------------------------------- |
| Claude Agent SDK Overview   | `https://platform.claude.com/docs/en/agent-sdk/overview`    | Agent SDK 主線妥当性            |
| Claude Agent SDK TypeScript | `https://platform.claude.com/docs/en/agent-sdk/typescript`  | TypeScript 実装前提             |
| Configure permissions       | `https://platform.claude.com/docs/en/agent-sdk/permissions` | `permissionMode` / `canUseTool` |
| Sessions                    | `https://platform.claude.com/docs/en/agent-sdk/sessions`    | session / resume 論点           |
| Client SDKs                 | `https://platform.claude.com/docs/en/api/client-sdks`       | Node SDK / TypeScript SDK 前提  |

### システム仕様（aiworkflow-requirements）

| 参照資料                                    | パス                                                                | 内容                            |
| ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------- |
| Runtime Skill Creator Public IPC            | `.agents/skills/aiworkflow-requirements/indexes/quick-reference.md` | public IPC 即時導線             |
| RuntimePolicyResolver subscription 判定統合 | `.agents/skills/aiworkflow-requirements/indexes/quick-reference.md` | 3パターン分岐                   |
| Advanced Console Safety Governance          | `.agents/skills/aiworkflow-requirements/indexes/quick-reference.md` | approval / disclosure / handoff |

## 実行手順

### ステップ1: 問題定義を固定

- 更新追従
- 量産品質
- 主導線統合

の 3 問題を分離し、混同しない。

### ステップ2: 機能要求を固定

- 動的更新追従
- dynamic source discovery / provenance
- workflow 実行
- UI 対話
- verify 契約
- route 分離
- 既存導線整理

### ステップ3: 非機能要求を固定

- 変更耐性
- 構成ドリフト耐性
- 可読性
- 運用性
- 監査性
- セキュリティ

## 統合テスト連携

- Phase 4 で root / child workflow の文書検証コマンドを定義する
- Phase 7 で `artifacts.json` と phase ファイル整合を確認する
- Phase 9 で参照パス切れと task 依存順を確認する

## 成果物

| 成果物     | パス                       | 説明                  |
| ---------- | -------------------------- | --------------------- |
| 要件定義書 | `phase-1-requirements.md`  | root requirement 定義 |
| 要件草案   | `../requirements-draft.md` | 事前認識合わせ文書    |

## 完了条件

- [ ] 真の論点が 3 つに整理されている
- [ ] FR / NFR / 制約が明記されている
- [ ] 固定ディレクトリ非前提と source discovery 方針が明記されている
- [ ] 初回スコープ縮小方針が明記されている
- [ ] 子 task へ責務分割できる状態になっている
- [ ] 公式ドキュメント照合観点が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

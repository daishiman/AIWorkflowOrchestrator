# Phase 1: 要件定義 - スキルライフサイクル統合テスト強化

## メタ情報

| 項目      | 内容            |
| --------- | --------------- |
| タスクID  | TASK-10A-G      |
| Phase     | 1               |
| 名称      | 要件定義        |
| 依存Phase | なし            |
| 次Phase   | Phase 2（設計） |

---

## 目的

TASK-10A-E（IPC契約定義）と TASK-10A-F（Store駆動ライフサイクルUI）で確立されたスキルライフサイクルの契約・状態遷移を、自動テストで保護するための要件を定義する。結線不良と契約ドリフトを実装前に検知する品質ゲートの要件を明確化する。

## 依存タスクから固定済みの前提

本タスクは、依存タスクで固定済みの契約を再設計しない。以下を入力として受け取り、テストで保護する。

| 依存元           | 固定済み前提                                                       | TASK-10A-G での扱い               |
| ---------------- | ------------------------------------------------------------------ | --------------------------------- |
| TASK-10A-E       | sender 検証、P42 3段バリデーション、エラーサニタイズ順序           | Layer 1 Main IPC 契約テストで保護 |
| TASK-10A-F       | RT-01〜RT-07 の回帰テスト観点、Store action 境界                   | Layer 2 Renderer 統合テストで保護 |
| TASK-10A-B/C/D/F | `SkillAnalysisView` / `SkillCreateWizard` / `ChatPanel` の責務境界 | direct IPC 呼び出し禁止前提で保護 |

## 実行タスク

- Task 1: スコープIN/OUTと依存タスク境界を確定する
- Task 2: Main IPC / Renderer / 既存テスト整合の機能要件を分解する
- Task 3: 品質ゲート・カバレッジ・実行時間の非機能要件を定量化する
- Task 4: P9/P31/P39/P40/P42/P48 の教訓を要件へ反映する

---

## スコープ

### IN（対象範囲）

| 項目                               | 説明                                                                            |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| Main IPC `skill:create` 契約テスト | `skillHandlers.ts` の `skill:create` ハンドラーの入力検証・委譲・エラー系テスト |
| Renderer統合テスト                 | ChatPanel起点の create -> list -> analyze -> improve 遷移テスト                 |
| 既存テスト整合                     | `ChatPanel.skill-management.test.tsx` の既存テストとの共存・拡張                |
| 品質ゲート定義                     | typecheck + 対象テスト実行の自動ゲート                                          |

### OUT（対象外）

| 項目                             | 理由                                                  |
| -------------------------------- | ----------------------------------------------------- |
| SkillCreatorService 単体テスト   | TASK-9B-H で別途カバー済み                            |
| skill-creator IPC ハンドラテスト | `skillCreatorHandlers` は TASK-9B-H のスコープ        |
| E2E テスト（Playwright）         | 本タスクは Vitest ベースの統合テストに限定            |
| Preload 層の契約テスト           | `skill-api.contract.test.ts` で既にカバー済み         |
| Store 単体テスト                 | `agentSlice.skill-lifecycle.test.ts` で既にカバー済み |

---

## 機能要件（FR）

### FR-G01: Main IPC `skill:create` 契約テスト

`apps/desktop/src/main/ipc/__tests__/skillHandlers.create.test.ts` で以下を検証する。

| ID       | 要件                                                             | 検証対象                                                |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------- |
| FR-G01-1 | Sender検証: 不正なsenderからのリクエストを拒否する               | `validateIpcSender` が `toIPCValidationError` を返す    |
| FR-G01-2 | P42準拠3段バリデーション: description引数を検証する              | 型チェック -> 空文字列 -> trim空文字列の3段階           |
| FR-G01-3 | P42準拠3段バリデーション: options引数を検証する                  | `typeof options !== "object"` または `options === null` |
| FR-G01-4 | 正常系: 有効な引数でSkillService.createSkillFromWizardに委譲する | description.trim() と typedOptions が正しく渡される     |
| FR-G01-5 | エラー系: サービス層例外を `CREATE_ERROR` コードでラップする     | `sanitizeErrorMessage` 経由のサニタイズ済みメッセージ   |
| FR-G01-6 | エラーサニタイズ: 内部パス・トークン・スタックトレースを除去する | UNIX/Windowsパス、`token=xxx` パターンの除去            |

### FR-G02: Renderer統合テスト（ChatPanel起点）

`apps/desktop/src/renderer/components/skill/__tests__/SkillLifecycle.integration.test.tsx` で以下を検証する。

| ID       | 要件                                                            | 検証対象                                         |
| -------- | --------------------------------------------------------------- | ------------------------------------------------ |
| FR-G02-1 | ChatPanel起点で SkillManagementPanel / SkillCreateWizard が開く | UI遷移と表示境界の確認                           |
| FR-G02-2 | 作成フロー: description入力 -> options選択 -> store action 実行 | `useCreateSkill` 経由で作成し、direct IPC しない |
| FR-G02-3 | 作成後リスト更新: 作成成功後に一覧同期が行われる                | RT-01: `fetchSkills` と一覧 state の整合         |
| FR-G02-4 | 分析/改善/再分析フローが store action 経由で完結する            | RT-02, RT-03, RT-06 を保護                       |
| FR-G02-5 | エラー回復と状態初期化が維持される                              | RT-04, RT-05 を保護                              |
| FR-G02-6 | 並行操作ガードと UI フォールバックが維持される                  | RT-07 とクラッシュ回避を保護                     |

### FR-G03: 既存テスト整合・品質ゲート

| ID       | 要件                                                                     | 検証対象                                   |
| -------- | ------------------------------------------------------------------------ | ------------------------------------------ |
| FR-G03-1 | 既存テスト維持: ChatPanel.skill-management.test.tsx の既存テストが全PASS | 既存テストの回帰なし                       |
| FR-G03-2 | テスト拡張: create -> list 遷移のテストケースを追加する                  | 既存テストファイルへのケース追加           |
| FR-G03-3 | 品質ゲート: `pnpm typecheck` + 対象テスト実行が全PASS                    | CI/ローカル両方で実行可能                  |
| FR-G03-4 | 失敗時切り分け: テスト失敗時に原因レイヤーを特定できる                   | Main IPC / Renderer / Store の切り分け手順 |

---

## 非機能要件（NFR）

### NFR-G01: テストパフォーマンス

| ID        | 要件                                       | 基準値    |
| --------- | ------------------------------------------ | --------- |
| NFR-G01-1 | Main IPCテスト全体の実行時間               | 10秒以内  |
| NFR-G01-2 | Renderer統合テスト全体の実行時間           | 15秒以内  |
| NFR-G01-3 | 品質ゲート（typecheck + テスト）の実行時間 | 120秒以内 |

### NFR-G02: テスト保守性

| ID        | 要件                                     | 基準                               |
| --------- | ---------------------------------------- | ---------------------------------- |
| NFR-G02-1 | テストデータはファクトリ関数で生成する   | ハードコード値の直接使用を避ける   |
| NFR-G02-2 | モック設定は `beforeEach` でリセットする | テスト間の状態リーク防止（P9準拠） |
| NFR-G02-3 | テストIDは `TC-Gxx-nnn` 形式で付与する   | トレーサビリティ確保               |

### NFR-G03: 独立実行可能性

| ID        | 要件                                     | 基準                                  |
| --------- | ---------------------------------------- | ------------------------------------- |
| NFR-G03-1 | 各テストファイルが単独で実行可能         | 他テストファイルへの依存なし          |
| NFR-G03-2 | テスト実行順序に依存しない               | ランダム順序でも全PASS                |
| NFR-G03-3 | `apps/desktop/` ディレクトリから実行する | P40（テスト実行ディレクトリ依存）準拠 |

---

## 受け入れ基準

### テストケース数

| テストファイル                          | 最小テストケース数 | カテゴリ内訳                                        |
| --------------------------------------- | ------------------ | --------------------------------------------------- |
| skillHandlers.create.test.ts            | 12                 | sender検証2 + バリデーション4 + 正常系2 + エラー系4 |
| SkillLifecycle.integration.test.tsx     | 10                 | 遷移テスト6 + エラー系4                             |
| ChatPanel.skill-management.test.tsx追加 | 4                  | create->list遷移2 + 回帰確認2                       |

### カバレッジ基準

| 指標              | 基準値  | 対象                                                |
| ----------------- | ------- | --------------------------------------------------- |
| Line Coverage     | 80%以上 | `skillHandlers.ts` の `skill:create` ハンドラー部分 |
| Branch Coverage   | 60%以上 | バリデーション分岐の網羅                            |
| Function Coverage | 80%以上 | `sanitizeErrorMessage`, `validateIpcSender`         |

### 実行時間上限

| ゲート             | 上限  |
| ------------------ | ----- |
| 全テスト実行       | 30秒  |
| typecheck + テスト | 120秒 |

---

## 既知の制約・教訓

| Pitfall | 概要                                   | 対策                                          |
| ------- | -------------------------------------- | --------------------------------------------- |
| P9      | モジュールスコープ変数のテスト間リーク | `beforeEach` で全モックをリセット             |
| P39     | happy-dom環境でのuserEvent非互換       | `fireEvent` を使用、`userEvent` 使用禁止      |
| P40     | テスト実行ディレクトリ依存             | `apps/desktop/` 配下から実行                  |
| P42     | trim()バリデーション漏れ               | 3段バリデーション（型/空文字列/trim空文字列） |
| P48     | useShallow未適用による無限ループ       | 派生セレクタに `useShallow` 適用              |
| P31     | Zustand Store Hooks無限ループ          | 個別セレクタを使用、合成Hook禁止              |

## 依存トレーサビリティ

| 依存元     | ID       | 内容                   | TASK-10A-G 要件への反映 |
| ---------- | -------- | ---------------------- | ----------------------- |
| TASK-10A-F | RT-01    | 作成後一覧同期         | FR-G02-3                |
| TASK-10A-F | RT-02    | 改善後再分析           | FR-G02-4                |
| TASK-10A-F | RT-03    | 全自動改善後再分析     | FR-G02-4                |
| TASK-10A-F | RT-04    | エラー回復             | FR-G02-5                |
| TASK-10A-F | RT-05    | 状態初期化             | FR-G02-5                |
| TASK-10A-F | RT-06    | 分析→改善→再分析フロー | FR-G02-4                |
| TASK-10A-F | RT-07    | 並行操作防止           | FR-G02-6                |
| TASK-10A-E | handover | sender / P42 / error   | FR-G01-1〜6             |

---

## 参照資料

| 参照資料                | パス                                                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| IPC API仕様             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                    |
| ChatPanel UI仕様        | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`                                          |
| UI機能仕様              | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                                         |
| 状態管理仕様            | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                                            |
| 実装パターン            | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                             |
| テストパターン          | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`                                       |
| 品質要件                | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`                                             |
| エラー仕様              | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                                                   |
| IPCセキュリティ         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                            |
| IPC契約チェック         | `.claude/skills/aiworkflow-requirements/references/ipc-contract-checklist.md`                                           |
| TASK-10A-F 引き渡し設計 | `docs/30-workflows/completed-tasks/store-driven-lifecycle-ui/phase-2-design.md`                                         |
| TASK-10A-E 引き渡し条件 | `docs/30-workflows/completed-tasks/task-043a-ipc-contract-and-security-alignment/outputs/phase-10/handover-criteria.md` |

---

## 成果物

| 成果物     | パス                                                                                            | 説明                           |
| ---------- | ----------------------------------------------------------------------------------------------- | ------------------------------ |
| 要件定義書 | `docs/30-workflows/completed-tasks/TASK-10A-G-LIFECYCLE-TEST-HARDENING/phase-1-requirements.md` | FR/NFR/受入基準/制約を固定する |

---

## 統合テスト連携

| レイヤー | このPhaseで固定する内容       | 後続Phaseへの受け渡し        |
| -------- | ----------------------------- | ---------------------------- |
| Layer 1  | `skill:create` 契約の検証境界 | Phase 2/4 のテストケース設計 |
| Layer 2  | ChatPanel起点の主要遷移       | Phase 2/4 の統合テスト設計   |
| Layer 3  | 既存テストとの共存条件        | Phase 2/5/9 の回帰判定基準   |

---

## 完了条件

- [ ] FR-G01（Main IPC テスト要件）の全項目が明確に定義されている
- [ ] FR-G02（Renderer統合テスト要件）の全項目が明確に定義されている
- [ ] FR-G03（品質ゲート要件）の全項目が明確に定義されている
- [ ] NFR全項目に定量的な基準値が設定されている
- [ ] 受け入れ基準（テストケース数、カバレッジ、実行時間）が明示されている
- [ ] スコープのIN/OUTが明確に区分されている
- [ ] 既知の制約・教訓（P9, P31, P39, P40, P42, P48）が反映されている

---

## 次Phase

Phase 2（設計）: テストアーキテクチャ設計、モック戦略、テストデータ設計を実施する。

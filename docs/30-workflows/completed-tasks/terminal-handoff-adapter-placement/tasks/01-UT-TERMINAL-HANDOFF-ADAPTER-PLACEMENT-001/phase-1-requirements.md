# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                 |
| ------ | ---------------------------------- |
| Phase  | 1                                  |
| 機能名 | terminal-handoff-adapter-placement |
| 作成日 | 2026-03-22                         |

## 目的

`toHandoffGuidance()` adapter 関数の配置先確定と統一実装に必要な要件を定義し、受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: 既存の変換ロジック分散状況から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR 分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名                      | パス                                                                     | 説明                             |
| --------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| GitHub Issue #1457          | [#1457](https://github.com/daishiman/AIWorkflowOrchestrator/issues/1457) | 元タスク定義                     |
| HandoffGuidance 型          | `packages/shared/src/types/handoff.ts`                                   | 統一 DTO 型定義                  |
| TerminalHandoffBundle 型    | `packages/shared/src/types/skillCreator.ts`                              | Runtime 用バンドル型             |
| Chat Edit Builder           | `apps/desktop/src/main/services/chat-edit/TerminalHandoffBuilder.ts`     | Chat Edit 変換ロジック           |
| Runtime Builder             | `apps/desktop/src/main/services/runtime/TerminalHandoffBuilder.ts`       | Runtime 変換ロジック             |
| HandoffBlock（UI）          | `apps/desktop/src/renderer/components/chat/HandoffBlock.tsx`             | ローカル型定義あり（P23 リスク） |
| LLM Adapter（参考パターン） | `apps/desktop/src/main/adapters/llm/`                                    | 既存 adapter ディレクトリ構成    |

## 実行手順

### 0. P50 チェック: 既実装状態の調査（必須）

```bash
# toHandoffGuidance 関数が既に存在するか
grep -rn "toHandoffGuidance" apps/desktop/src/ packages/shared/src/

# HandoffGuidance の import 元がどこか
grep -rn "import.*HandoffGuidance" apps/desktop/src/

# adapters/handoff/ ディレクトリが存在するか
ls -la apps/desktop/src/main/adapters/handoff/ 2>/dev/null || echo "未作成"
```

| 判定     | 条件                                 | 対応                                   |
| -------- | ------------------------------------ | -------------------------------------- |
| 未実装   | `toHandoffGuidance` 関数が存在しない | Phase 4-5 で新規実装                   |
| 部分実装 | 関数は存在するがテスト未作成         | Phase 4 でテスト追加、Phase 5 で補完   |
| 実装済   | 関数・テスト共に存在                 | Phase 4-5 を検証・補完モードに切り替え |

### 1. 現状の変換ロジック分散状況

#### Consumer 一覧と現在の変換パス

| #   | Consumer 名      | 入力型                     | 変換実装場所                                                 | 出力型            | 状態       |
| --- | ---------------- | -------------------------- | ------------------------------------------------------------ | ----------------- | ---------- |
| C1  | Chat Edit        | `SendWithContextRequest`   | `chat-edit/TerminalHandoffBuilder.ts#build()`                | `HandoffGuidance` | 実装済     |
| C2  | Runtime Agent    | `AgentHandoffBuildRequest` | `runtime/TerminalHandoffBuilder.ts#buildForAgentExecution()` | `HandoffGuidance` | 実装済     |
| C3  | Runtime Skill    | `SkillHandoffBuildRequest` | `runtime/TerminalHandoffBuilder.ts#buildForSkillExecution()` | `HandoffGuidance` | 実装済     |
| C4  | Skill Docs       | （未定義）                 | 未実装                                                       | `HandoffGuidance` | 未実装     |
| C5  | GuidanceBlock UI | `HandoffGuidance`          | `HandoffBlock.tsx`（ローカル型定義）                         | DOM 表示          | P23 要修正 |

### 2. 機能要件（FR）

| ID    | 要件                                                                                         | 優先度 |
| ----- | -------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `toHandoffGuidance()` adapter 関数を単一箇所に配置する                                       | 必須   |
| FR-02 | `SendWithContextRequest` → `HandoffGuidance` 変換をサポートする（C1）                        | 必須   |
| FR-03 | `AgentHandoffBuildRequest` → `HandoffGuidance` 変換をサポートする（C2）                      | 必須   |
| FR-04 | `SkillHandoffBuildRequest` → `HandoffGuidance` 変換をサポートする（C3）                      | 必須   |
| FR-05 | `TerminalHandoffBundle` → `HandoffGuidance` 変換をサポートする（汎用）                       | 必須   |
| FR-06 | `HandoffBlock.tsx` のローカル `HandoffGuidance` 型を `@repo/shared` の正本 import に置換する | 必須   |
| FR-07 | Skill Docs Consumer 用の変換インターフェースを定義する（C4 スタブ）                          | 推奨   |

### 3. 非機能要件（NFR）

| ID     | 要件                                                                              | 優先度 |
| ------ | --------------------------------------------------------------------------------- | ------ |
| NFR-01 | import サイクルが発生しないこと（`madge` または手動検証）                         | 必須   |
| NFR-02 | 既存の `TerminalHandoffBuilder` クラスの既存テストが破壊されないこと              | 必須   |
| NFR-03 | adapter 関数のユニットテストカバレッジ 90% 以上                                   | 必須   |
| NFR-04 | セキュリティ: `terminalCommand` に API キー・トークンが含まれないこと（P55 準拠） | 必須   |
| NFR-05 | 既存 adapter パターン（`adapters/llm/`）と一貫した命名・ディレクトリ構成          | 推奨   |

### 4. 受け入れ基準

- [ ] AC-01: `toHandoffGuidance()` が `apps/desktop/src/main/adapters/handoff/` に配置されている
- [ ] AC-02: C1-C3 の全 Consumer の変換が adapter 経由で動作する
- [ ] AC-03: C5 `HandoffBlock.tsx` が `@repo/shared` の `HandoffGuidance` を import している
- [ ] AC-04: `pnpm typecheck` が PASS する（import サイクルなし）
- [ ] AC-05: adapter 関数のユニットテストカバレッジが Line 90%+, Branch 60%+, Function 90%+
- [ ] AC-06: 既存テスト（`TerminalHandoffBuilder` 関連）が全て PASS する
- [ ] AC-07: `terminalCommand` に機密情報が含まれないことをテストで検証している

## 統合テスト連携（Phase 1）

- 要件定義段階のため統合テストの実行はなし
- Phase 4 以降で統合テストの対象を特定する

## 多角的チェック観点

| 観点           | 適用判断                     | 仕様参照先                                          |
| -------------- | ---------------------------- | --------------------------------------------------- |
| アーキテクチャ | adapter 配置先の設計判断     | `aiworkflow-requirements: architecture-overview.md` |
| セキュリティ   | terminalCommand のサニタイズ | `aiworkflow-requirements: security-electron-ipc.md` |

**Electron デスクトップアプリ観点**:

| 層                   | 適用判断                         | 仕様参照先                                                                               |
| -------------------- | -------------------------------- | ---------------------------------------------------------------------------------------- |
| バックエンド（Main） | adapter の配置は Main Process 層 | `aiworkflow-requirements: architecture-overview.md`                                      |
| IPC 通信             | HandoffGuidance の IPC 転送      | `aiworkflow-requirements: interfaces-agent-sdk-skill-reference-share-debug-analytics.md` |

## 成果物

| 成果物     | パス                              | 説明           |
| ---------- | --------------------------------- | -------------- |
| 要件定義書 | `outputs/phase-1/requirements.md` | 本ドキュメント |

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 参照資料の確認
2. P50チェック: 既実装状態の調査
3. Consumer一覧と変換パスの特定
4. 機能要件・非機能要件の定義
5. 受け入れ基準の作成
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/terminal-handoff-adapter-placement --phase 1
```

## 完了条件

- [ ] 全 Consumer（C1-C5）の変換パスが特定されている
- [ ] 機能要件（FR-01〜FR-07）が定義されている
- [ ] 非機能要件（NFR-01〜NFR-05）が定義されている
- [ ] 受け入れ基準（AC-01〜AC-07）が検証可能な形式で記述されている
- [ ] P50 チェック（既実装状態の調査）が完了している
- [ ] **本 Phase 内の全タスクを 100% 実行完了**

## 次の Phase

Phase 2: 設計

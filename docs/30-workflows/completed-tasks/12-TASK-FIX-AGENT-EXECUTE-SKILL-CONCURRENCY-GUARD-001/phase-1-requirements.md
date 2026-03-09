# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                                 |
| -------- | -------------------------------------------------- |
| Phase    | 1                                                  |
| タスクID | TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001 |
| 機能名   | agent-execute-skill-concurrency-guard              |
| 作成日   | 2026-03-07                                         |

## 目的

`agentSlice.executeSkill` の並行実行制御不足による問題（ストリーミングメッセージ混在・`executionId` 上書き・UX低下）を解消するため、要件・スコープ・受け入れ基準を明文化する。

## 実行タスク

- 要件抽出: ユーザー操作シナリオ（ボタン連打・非同期タイミング競合）から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定

## 参照資料

| 資料名                    | パス                                                                                        | 説明                                   |
| ------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------- |
| agentSlice実装            | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      | 修正対象のStore Slice                  |
| 状態管理アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store設計の正本仕様            |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | executeSkill / Skill UI型定義          |
| Agent IPC契約             | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                        | skill:execute の request/response 契約 |
| Agent実行UI仕様           | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`                | 実行中UIの正本仕様                     |
| Skill Stream UI仕様       | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`           | ChatPanel / SkillStreamingView 連携    |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | ガードパターン等の実装パターン         |
| 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md`                                                        | P31, P48等の関連Pitfall                |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Zustand Storeの設計原則・`isExecuting` 更新契約
- `interfaces-agent-sdk-skill.md`: `executeSkill` / `skillExecutionStatus` / `pendingPermission` 契約
- `api-ipc-agent.md`: `skill:execute` の request / response / error 契約
- `ui-ux-agent-execution.md`: 実行中UIの disabled / hidden / streaming 契約
- `ui-ux-feature-skill-stream.md`: ChatPanel と SkillStreamingView の連動仕様

### 前提Phase成果物

なし（初回Phaseのため前提成果物は存在しない）

## 実行手順

### ステップ0: ブランチ現況と実装モードの判定

1. `git diff --name-status main...HEAD` を実行し、コミット差分の有無を確認する
2. `agentSlice.ts` と UI 実装を読み、今回の作業が「全面新規実装」か「既存実装に対する局所修正」かを判定する
3. 本タスクでは以下のハイブリッド判定を採用する
   - Store 層: 未実装の再入ガードを追加する通常実装モード
   - UI 層: 既存ガード面を回帰確認する既存実装監査モード
4. この判定結果を Phase 2 以降の変更最小化戦略に引き継ぐ

### ステップ1: 現状の問題分析

1. `agentSlice.ts` の `executeSkill` 関数（L742-797）を読み、`isExecuting` チェックが欠落している箇所を特定する
2. 以下の再現シナリオを文書化する:
   - シナリオA: ユーザーがスキル実行ボタンを200ms以内に2回クリック
   - シナリオB: 1回目の実行中にユーザーが別のスキルを選択して実行
   - シナリオC: ネットワーク遅延により1回目のIPC応答前に2回目を実行

### ステップ1-B: 必要仕様抽出マトリクス

| 区分   | 採用する仕様                              | このタスクで使う理由                                                  |
| ------ | ----------------------------------------- | --------------------------------------------------------------------- |
| 必須   | `arch-state-management.md`                | `isExecuting` / `skillExecutionStatus` / Store境界の責務確認          |
| 必須   | `interfaces-agent-sdk-skill.md`           | `executeSkill` / streaming / permission 周辺契約確認                  |
| 必須   | `api-ipc-agent.md`                        | `skill:execute` request / response / error 契約確認                   |
| 必須   | `ui-ux-agent-execution.md`                | 実行中 UI の disabled / hidden 契約確認                               |
| 必須   | `ui-ux-feature-skill-stream.md`           | ChatPanel と SkillStreamingView の表示連動確認                        |
| 必須   | `quality-requirements.md`                 | TDD / coverage /性能要件の下限確認                                    |
| 必須   | `testing-fixtures.md`                     | Store / component test の fixture 再利用方針確認                      |
| 補助   | `architecture-implementation-patterns.md` | 最小変更での実装パターン確認                                          |
| 非採用 | `interfaces-agent-sdk-executor.md`        | Main executor DI が中心で今回の Renderer Store ガードの主論点ではない |
| 非採用 | `security-skill-execution.md`             | permission 永続化や危険ツール許可は今回の主変更範囲外                 |
| 非採用 | `ui-ux-settings.md`                       | 設定画面改修が今回の実装要件に含まれない                              |

### ステップ2: 機能要件の定義

| ID    | 要件                                                                                                                                                                                                                                                 | 優先度 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `executeSkill` 関数冒頭で `isExecuting === true` の場合、新しい実行を即座に拒否（早期return）する                                                                                                                                                    | 必須   |
| FR-02 | Store層ガード追加後も、既存UIガード面（`components/organisms/AgentView/ExecuteButton.tsx`、`views/AgentExecutionView/AgentExecutionView.tsx`、`components/chat/ChatPanel.tsx`）が `isExecuting` を一貫して反映し、ユーザーが二重実行を知覚できること | 必須   |
| FR-03 | 実行中のUIフィードバック（ExecuteButton 非表示、AgentExecutionView 入力無効化、ChatPanel の `skill-management-toggle` disabled + `SkillStreamingView` 表示）が維持されること                                                                         | 必須   |
| FR-04 | ガードによる拒否時、既存の `streamingMessages` や `executionId` が変更されないことを保証する                                                                                                                                                         | 必須   |

### ステップ3: 非機能要件の定義

| ID     | 要件                                                                                                                                                 | 優先度 |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| NFR-01 | ガード処理のオーバーヘッドは1ms未満（同期的な状態チェックのみ）                                                                                      | 必須   |
| NFR-02 | 既存テスト（race condition対策テスト含む）との後方互換性を維持する                                                                                   | 必須   |
| NFR-03 | P31（Zustand Store Hooks無限ループ）に抵触しない実装とする。`isExecuting` 参照は個別セレクタまたはプリミティブ直接セレクタに限定し、合成Hook化しない | 必須   |

### ステップ4: 受け入れ基準の定義

| ID    | 受け入れ基準                                                                                                                               |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-01 | `isExecuting === true` の状態で `executeSkill` を呼んだ場合、関数が即座にreturnする                                                        |
| AC-02 | AC-01の状況で `streamingMessages` 配列が変更されない                                                                                       |
| AC-03 | AC-01の状況で `executionId` が上書きされない                                                                                               |
| AC-04 | UI上で実行中フィードバックが既存仕様どおり表示される（ExecuteButton 非表示 / AgentExecutionView 入力disabled / ChatPanel toggle disabled） |
| AC-05 | 実行完了後に上記UIガード面が通常状態へ戻る                                                                                                 |
| AC-06 | 全既存テストがPASSする                                                                                                                     |

### ステップ5: 非採用案の明文化

- UI 改修を主変更にする案は採用しない
  - 理由: 既存 UI がすでに `isExecuting` を反映しており、主因は Store 側の再入防止欠落だから
- Main Process / Preload 契約変更案は採用しない
  - 理由: `skill:execute` 契約自体には今回の不整合がなく、変更すると影響半径だけが増えるため
- 新しい合成 selector / custom hook 追加案は採用しない
  - 理由: P31 の再発リスクを上げるため

## 統合テスト連携（Phase 1〜11は必須）

- Phase 1では統合テストの実施はない
- Phase 4以降で使用するテストシナリオの基盤としてAC-01〜AC-06を定義済み

## 多角的チェック観点（AIが判断）

| 観点           | 適用   | 理由                                       |
| -------------- | ------ | ------------------------------------------ |
| 状態管理       | 該当   | Zustand StoreのisExecutingフラグ制御       |
| UI/UX          | 該当   | ボタンのdisabled制御・視覚的フィードバック |
| セキュリティ   | 非該当 | IPC通信・認証には影響しない                |
| パフォーマンス | 該当   | ガード処理のオーバーヘッド確認             |

## 成果物

| 成果物     | パス                                                                                                              | 説明           |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/completed-tasks/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] FR-01〜FR-04の機能要件が定義されている
- [ ] NFR-01〜NFR-03の非機能要件が定義されている
- [ ] AC-01〜AC-06の受け入れ基準が検証可能な形式で定義されている
- [ ] 再現シナリオA〜Cが文書化されている
- [ ] 必要仕様抽出マトリクスと非採用理由が明文化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計

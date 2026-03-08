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

| 資料名                    | パス                                                                                        | 説明                           |
| ------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| agentSlice実装            | `apps/desktop/src/renderer/store/slices/agentSlice.ts`                                      | 修正対象のStore Slice          |
| 状態管理アーキテクチャ    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | Zustand Store設計の正本仕様    |
| Agent SDKインターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk.md`                 | Agent SDK型定義                |
| 実装パターン              | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | ガードパターン等の実装パターン |
| 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md`                                                        | P31, P48等の関連Pitfall        |

### システム仕様（aiworkflow-requirements）

- `arch-state-management.md`: Zustand Storeの設計原則・Slice分割基準
- `interfaces-agent-sdk.md`: executeSkillの型定義・戻り値仕様

### 前提Phase成果物

| 資料名          | パス                | 用途                                |
| --------------- | ------------------- | ----------------------------------- |
| Phase 1 成果物  | `outputs/phase-1/`  | Phase 1 の出力を入力として参照する  |
| Phase 2 成果物  | `outputs/phase-2/`  | Phase 2 の出力を入力として参照する  |
| Phase 3 成果物  | `outputs/phase-3/`  | Phase 3 の出力を入力として参照する  |
| Phase 4 成果物  | `outputs/phase-4/`  | Phase 4 の出力を入力として参照する  |
| Phase 5 成果物  | `outputs/phase-5/`  | Phase 5 の出力を入力として参照する  |
| Phase 6 成果物  | `outputs/phase-6/`  | Phase 6 の出力を入力として参照する  |
| Phase 7 成果物  | `outputs/phase-7/`  | Phase 7 の出力を入力として参照する  |
| Phase 8 成果物  | `outputs/phase-8/`  | Phase 8 の出力を入力として参照する  |
| Phase 9 成果物  | `outputs/phase-9/`  | Phase 9 の出力を入力として参照する  |
| Phase 10 成果物 | `outputs/phase-10/` | Phase 10 の出力を入力として参照する |
| Phase 11 成果物 | `outputs/phase-11/` | Phase 11 の出力を入力として参照する |
| Phase 12 成果物 | `outputs/phase-12/` | Phase 12 の出力を入力として参照する |

## 実行手順

### ステップ1: 現状の問題分析

1. `agentSlice.ts` の `executeSkill` 関数（742行目付近）を読み、`isExecuting` チェックが欠落している箇所を特定する
2. 以下の再現シナリオを文書化する:
   - シナリオA: ユーザーがスキル実行ボタンを200ms以内に2回クリック
   - シナリオB: 1回目の実行中にユーザーが別のスキルを選択して実行
   - シナリオC: ネットワーク遅延により1回目のIPC応答前に2回目を実行

### ステップ2: 機能要件の定義

| ID    | 要件                                                                                              | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------- | ------ |
| FR-01 | `executeSkill` 関数冒頭で `isExecuting === true` の場合、新しい実行を即座に拒否（早期return）する | 必須   |
| FR-02 | スキル実行ボタンに `disabled={isExecuting}` を適用し、実行中はクリック不可にする                  | 必須   |
| FR-03 | 実行中のボタンに視覚的フィードバック（opacity低下またはスピナー表示）を提供する                   | 必須   |
| FR-04 | ガードによる拒否時、既存の `streamingMessages` や `executionId` が変更されないことを保証する      | 必須   |

### ステップ3: 非機能要件の定義

| ID     | 要件                                                               | 優先度 |
| ------ | ------------------------------------------------------------------ | ------ |
| NFR-01 | ガード処理のオーバーヘッドは1ms未満（同期的な状態チェックのみ）    | 必須   |
| NFR-02 | 既存テスト（race condition対策テスト含む）との後方互換性を維持する | 必須   |
| NFR-03 | P31（Zustand Store Hooks無限ループ）に抵触しない実装とする         | 必須   |

### ステップ4: 受け入れ基準の定義

| ID    | 受け入れ基準                                                                        |
| ----- | ----------------------------------------------------------------------------------- |
| AC-01 | `isExecuting === true` の状態で `executeSkill` を呼んだ場合、関数が即座にreturnする |
| AC-02 | AC-01の状況で `streamingMessages` 配列が変更されない                                |
| AC-03 | AC-01の状況で `executionId` が上書きされない                                        |
| AC-04 | UI上でスキル実行ボタンが `isExecuting === true` 時にdisabled表示になる              |
| AC-05 | ボタンのdisabled状態がスキル実行完了後に解除される                                  |
| AC-06 | 全既存テストがPASSする                                                              |

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

| 成果物     | パス                                                                                              | 説明           |
| ---------- | ------------------------------------------------------------------------------------------------- | -------------- |
| 要件定義書 | `docs/30-workflows/12-TASK-FIX-AGENT-EXECUTE-SKILL-CONCURRENCY-GUARD-001/phase-1-requirements.md` | 本ドキュメント |

## 完了条件

- [ ] FR-01〜FR-04の機能要件が定義されている
- [ ] NFR-01〜NFR-03の非機能要件が定義されている
- [ ] AC-01〜AC-06の受け入れ基準が検証可能な形式で定義されている
- [ ] 再現シナリオA〜Cが文書化されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計

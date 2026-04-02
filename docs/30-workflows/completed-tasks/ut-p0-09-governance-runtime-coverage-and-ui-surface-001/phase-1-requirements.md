# Phase 1: 要件定義

## メタ情報

| 項目   | 値                                                      |
| ------ | ------------------------------------------------------- |
| Phase  | 1                                                       |
| 機能名 | ut-p0-09-governance-runtime-coverage-and-ui-surface-001 |
| 作成日 | 2026-04-02                                              |

## 目的

TASK-P0-09 完了状態と Issue #1791 要件のギャップを明確化し、実装スコープと受入条件を確定する。

## 実行タスク

- タスク1: 現状コード調査（Facade のフェーズ別 hooks 配線状況を確認）
- タスク2: renderer governance UI の実装状況確認
- タスク3: execute-only 文言の存在箇所特定
- タスク4: 受入条件テーブルの確定

## 参照資料

| 資料名             | パス                                                                                               | 説明              |
| ------------------ | -------------------------------------------------------------------------------------------------- | ----------------- |
| 親タスク仕様書     | `docs/30-workflows/completed-tasks/step-10-seq-task-p0-09-claude-sdk-permission-hooks-governance/` | TASK-P0-09 成果物 |
| Governance設計仕様 | `.claude/skills/aiworkflow-requirements/references/governance-hooks-factory-audit-sink.md`         | 設計仕様          |
| Facade実装         | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                              | 現状実装          |

## 実行手順

### ステップ1: Facade フェーズ別配線調査

- `RuntimeSkillCreatorFacade.ts` の `plan()`, `execute()`, `verifySkill()`, `improve()` メソッドを確認
- 各メソッドで `createGovernanceHooks(phase)` が正しいフェーズ引数で呼ばれているか確認
- 配線が不足しているフェーズをリスト化

### ステップ2: Renderer UI 実装状況確認

- `apps/desktop/src/renderer/components/` を検索し governance 表示コンポーネントを確認
- `getGovernanceState()` を消費している箇所を特定
- 未実装の表示要件（denial reason / recent denials / session summary）を確認

### ステップ3: execute-only 文言の特定

- `rg -n "execute.*only|execute-only|executeフェーズのみ|execute phase.*only" .claude/skills/aiworkflow-requirements/references/` で文言箇所を特定
- 対象ファイルをリスト化

### ステップ4: 受入条件確定

Issue #1791 の受入基準を実装観点で再定義：

| #    | 受入条件                                                         | 確認方法                    |
| ---- | ---------------------------------------------------------------- | --------------------------- |
| AC-1 | plan/execute/verify/improve で governance hooks が正しく呼ばれる | ユニットテスト              |
| AC-2 | renderer に GovernanceSummaryPanel が実装されている              | コードレビュー + 手動テスト |
| AC-3 | denial reason / recent denials / session summary が表示される    | 手動テスト                  |
| AC-4 | Phase 11 evidence が outputs/phase-11/ に存在する                | ファイル存在確認            |
| AC-5 | execute-only 文言がシステム仕様から除去されている                | grep による確認             |

## 統合テスト連携

- 現状の governance テスト（130+ tests）が全て PASS していることを確認
- `pnpm --filter @repo/desktop test` で実行

## 多角的チェック観点（AIが判断）

| 観点           | 適用判断 | 仕様参照先                           |
| -------------- | -------- | ------------------------------------ |
| セキュリティ   | 適用     | governance = セキュリティ境界        |
| UI/UX          | 適用     | renderer 表示追加あり                |
| アーキテクチャ | 適用     | Facade ← hooks ← renderer の依存関係 |
| API設計        | 適用     | IPC チャネル確認                     |
| Electron固有   | 適用     | Main/Renderer/IPC/Preload 全層関連   |

## 成果物

| 成果物               | パス                                     | 説明                   |
| -------------------- | ---------------------------------------- | ---------------------- |
| ギャップ分析レポート | `outputs/phase-1/gap-analysis.md`        | 現状 vs 要件のギャップ |
| 受入条件テーブル     | `outputs/phase-1/acceptance-criteria.md` | 確定した受入条件       |

## 完了条件

- [ ] Facade の全フェーズ hooks 配線状況が文書化されている
- [ ] renderer governance UI の実装状況が確認されている
- [ ] execute-only 文言の存在箇所がリスト化されている
- [ ] 受入条件テーブルが確定している
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理【Phase開始時】

1. 参照資料の確認
2. Facade 配線調査
3. renderer UI 確認
4. execute-only 文言特定
5. 受入条件確定
6. 成果物の作成・配置
7. artifacts.json 更新

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json が更新されている

## 次のPhase

Phase 2: 設計

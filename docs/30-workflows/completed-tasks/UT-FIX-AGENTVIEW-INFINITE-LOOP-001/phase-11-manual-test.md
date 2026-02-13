# Phase 11: 手動テスト検証

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 11                                 |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

自動テストで把握しにくい操作フローを手動で確認し、無限ループ再発がないことを検証する。

## 実行タスク

- 画面動作確認: AgentView表示と画面再遷移を確認する
- 操作確認: 検索、インポート、削除、再試行を確認する
- パフォーマンス確認: 呼び出し回数とCPU負荷を確認する

## 参照資料

| 資料名                   | パス                           | 説明          |
| ------------------------ | ------------------------------ | ------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`      | 依存Phase     |
| Phase 2 設計             | `phase-2-design.md`            | 依存Phase     |
| Phase 5 実装             | `phase-5-implementation.md`    | 依存Phase     |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md`    | 依存Phase     |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md`    | 依存Phase     |
| Phase 8 リファクタリング | `phase-8-refactoring.md`       | 依存Phase     |
| Phase 9 品質保証         | `phase-9-quality-assurance.md` | 依存Phase     |
| Phase 10 最終レビュー    | `phase-10-final-review.md`     | 依存Phase     |
| Phase 11 手動テスト      | `phase-11-manual-test.md`      | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容               |
| ------------------ | --------------------------------------------------------------------------------- | ------------------ |
| UI/UX 実行画面     | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`      | 手動観点           |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UI契約             |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 手動確認の合格条件 |

## 実行手順

### Step 1: 基本表示確認

起動後にAgentViewを表示し、初回読み込み挙動を確認する。

### Step 2: 操作フロー確認

検索、インポート、削除、エラー再試行を実施する。

### Step 3: 監視確認

DevToolsで呼び出し回数と警告有無を確認する。

## 統合テスト連携【必須】

| 観点          | 記録内容                           |
| ------------- | ---------------------------------- |
| Phase 10 接続 | 最終レビューで指示された観点の実施 |
| IPC/API       | 実行回数が収束すること             |
| 回帰          | 他画面の動作維持                   |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | 永続化やDB操作がある場合           | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理がある場合                 | `aiworkflow-requirements: error-handling.md` |

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | 永続化がある場合            | `aiworkflow-requirements: database-*.md`               |

## サブタスク管理

1. 参照資料の確認
2. 実行タスクの実施
3. 統合テスト連携の確認（Phase 1〜11）
4. 成果物の作成・配置
5. 完了条件の検証

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.json更新方針が明記されている
- [ ] Phase末端で完了を明記している

## 成果物

| 成果物         | パス                      | 説明   |
| -------------- | ------------------------- | ------ |
| 手動テスト仕様 | `phase-11-manual-test.md` | 本文書 |

## 完了条件

- [ ] 主要操作フローの確認結果が記録されている
- [ ] 呼び出し回数と再発有無が記録されている
- [ ] 回帰観点の結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 12: ドキュメント更新（`phase-12-documentation.md`）

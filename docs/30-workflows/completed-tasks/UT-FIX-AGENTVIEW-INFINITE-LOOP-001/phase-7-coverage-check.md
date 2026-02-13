# Phase 7: テストカバレッジ確認

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 7                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

カバレッジ計測を行い、基準達成可否を判定する。

## 実行タスク

- 計測実行: 対象テストのカバレッジを取得する
- 基準判定: Line/Branch/Functionを判定する
- ギャップ記録: 未達行と補完方針を記録する

## 参照資料

| 資料名                 | パス                        | 説明          |
| ---------------------- | --------------------------- | ------------- |
| Phase 5 実装           | `phase-5-implementation.md` | 依存Phase     |
| Phase 6 テスト拡充     | `phase-6-test-expansion.md` | 依存Phase     |
| Phase 7 カバレッジ確認 | `phase-7-coverage-check.md` | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容           |
| -------------------- | --------------------------------------------------------------------------------- | -------------- |
| テスト品質           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 判定閾値       |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テスト拡張方針 |

## 実行手順

### Step 1: 計測

カバレッジ付きで対象テストを実行する。

### Step 2: 判定

最低基準と実測値を比較する。

### Step 3: 差分整理

未達の場合は不足箇所をPhase 6へ戻す入力として記録する。

## 統合テスト連携【必須】

| 観点         | 記録内容             |
| ------------ | -------------------- |
| Phase 5 接続 | 実装変更の分岐網羅   |
| Phase 6 接続 | 拡充テストの反映確認 |
| 回帰         | 全体テストの破壊有無 |

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

| 成果物         | パス                        | 説明   |
| -------------- | --------------------------- | ------ |
| カバレッジ判定 | `phase-7-coverage-check.md` | 本文書 |

## 完了条件

- [ ] 計測コマンドの実行結果が記録されている
- [ ] 最低基準の達成可否が記録されている
- [ ] 未達時の補完方針が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 8: リファクタリング（`phase-8-refactoring.md`）

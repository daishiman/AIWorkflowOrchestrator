# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 9                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

品質ゲートを通過する状態かを確認し、レビュー入力を確定する。

## 実行タスク

- 静的検証: typecheck/lintの結果を確認する
- テスト検証: 対象テストと全体テストの結果を確認する
- セキュリティ検証: 新規脆弱性がないことを確認する

## 参照資料

| 資料名           | パス                           | 説明          |
| ---------------- | ------------------------------ | ------------- |
| Phase 5 実装     | `phase-5-implementation.md`    | 依存Phase     |
| Phase 9 品質保証 | `phase-9-quality-assurance.md` | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容             |
| ------------------ | ---------------------------------------------------------------------------- | ---------------- |
| テスト品質         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  | 品質閾値         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md` | Electron IPC観点 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`        | エラー分類       |

## 実行手順

### Step 1: 静的検証

型・Lintの結果を取得する。

### Step 2: テスト検証

対象テストと全体テストを実行する。

### Step 3: 品質記録

ゲート通過可否と残課題を記録する。

## 統合テスト連携【必須】

| 観点         | 記録内容                         |
| ------------ | -------------------------------- |
| Phase 5 接続 | 実装変更の影響確認               |
| API/IPC      | 呼び出し回数と失敗時ハンドリング |
| 回帰         | 既存機能への影響なしを確認       |

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

| 成果物       | パス                           | 説明   |
| ------------ | ------------------------------ | ------ |
| 品質保証仕様 | `phase-9-quality-assurance.md` | 本文書 |

## 完了条件

- [ ] 品質ゲートの判定結果が記録されている
- [ ] 静的検証の結果が記録されている
- [ ] テスト検証の結果が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 10: 最終レビュー（`phase-10-final-review.md`）

# Phase 6: テスト拡充

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 6                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

Phase 5で通過した実装に対して、分岐と回帰観点を追加して信頼性を上げる。

## 実行タスク

- 分岐拡充: ローディング/エラー/空状態のケースを増やす
- 操作拡充: インポート/削除/リトライの連続操作を検証する
- 再レンダリング拡充: 無関係状態変更での挙動を検証する

## 参照資料

| 資料名             | パス                                                                     | 説明          |
| ------------------ | ------------------------------------------------------------------------ | ------------- |
| Phase 5 実装       | `phase-5-implementation.md`                                              | 依存Phase     |
| AgentView test     | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 拡充対象      |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                              | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容                |
| -------------------- | --------------------------------------------------------------------------------- | ------------------- |
| テスト品質           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | カバレッジ目標      |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | renderHook/状態検証 |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 参照安定性観点      |

## 実行手順

### Step 1: 不足分岐抽出

カバレッジレポートから不足行を抽出する。

### Step 2: ケース追加

不足行を埋めるテストを追加する。

### Step 3: 回帰確認

既存テスト群と新規テスト群を同時に実行する。

## 統合テスト連携【必須】

| 観点    | 記録内容               |
| ------- | ---------------------- |
| API/IPC | 実行回数の上限確認     |
| UI      | 主要画面状態の分岐確認 |
| 回帰    | 既存ケース維持         |

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
| テスト拡充仕様 | `phase-6-test-expansion.md` | 本文書 |

## 完了条件

- [ ] 不足分岐に対応するテストが追加されている
- [ ] 回帰テストが全件成功している
- [ ] カバレッジ改善の方針が記録されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 7: テストカバレッジ確認（`phase-7-coverage-check.md`）

# Phase 5: 実装

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 5                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

Phase 4のテストを通す実装を行い、無限ループを発生させない構造へ移行する。

## 実行タスク

- セレクタ移行: `useFetchSkills` と状態セレクタへ置換する
- 依存配列修正: 不安定参照を依存配列から除去する
- デバッグコード除去: 不要ログと補助コードを削除する

## 参照資料

| 資料名             | パス                                                  | 説明          |
| ------------------ | ----------------------------------------------------- | ------------- |
| Phase 4 テスト作成 | `phase-4-test-creation.md`                            | 依存Phase     |
| AgentView          | `apps/desktop/src/renderer/views/AgentView/index.tsx` | 実装対象      |
| Phase 5 実装       | `phase-5-implementation.md`                           | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                 |
| ------------------ | --------------------------------------------------------------------------------- | -------------------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | 個別セレクタ適用     |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | インターフェース整合 |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時メッセージ     |

## 実行手順

### Step 1: Store参照置換

Action/State取得を個別セレクタ中心へ変更する。

### Step 2: ハンドラ修正

削除・インポート・再試行ハンドラを新構造へ合わせる。

### Step 3: テスト実行

Phase 4で追加したテストを実行しGreen化する。

## 統合テスト連携【必須】

| 観点       | 記録内容                 |
| ---------- | ------------------------ |
| 実行回数   | 初回読み込みの呼び出し数 |
| エラー経路 | 失敗時表示と再試行       |
| 回帰       | インポート/削除動線      |

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

| 成果物   | パス                        | 説明   |
| -------- | --------------------------- | ------ |
| 実装仕様 | `phase-5-implementation.md` | 本文書 |

## 完了条件

- [ ] RedテストがGreen化している
- [ ] 無限ループ発火経路が削除されている
- [ ] 主要ハンドラの回帰が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 6: テスト拡充（`phase-6-test-expansion.md`）

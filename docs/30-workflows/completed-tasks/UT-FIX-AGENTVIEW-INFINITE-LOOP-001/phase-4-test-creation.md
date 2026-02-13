# Phase 4: テスト作成

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 4                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

無限ループ修正を先に失敗テストで固定し、Green実装で満たす条件を明確化する。

## 実行タスク

- 失敗テスト作成: `fetchSkills` 呼び出し回数の検証を追加する
- 状態表示テスト作成: `isLoadingSkills` と `skillError` の表示を検証する
- 回帰テスト作成: インポート/削除/再試行の挙動を検証する

## 参照資料

| 資料名               | パス                                                                     | 説明          |
| -------------------- | ------------------------------------------------------------------------ | ------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`                                                | 依存Phase     |
| Phase 2 設計         | `phase-2-design.md`                                                      | 依存Phase     |
| Phase 3 設計レビュー | `phase-3-design-review.md`                                               | 依存Phase     |
| AgentView test       | `apps/desktop/src/renderer/views/AgentView/__tests__/AgentView.test.tsx` | 修正対象      |
| Phase 4 テスト作成   | `phase-4-test-creation.md`                                               | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料             | パス                                                                              | 内容           |
| -------------------- | --------------------------------------------------------------------------------- | -------------- |
| テスト品質           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | 基準値         |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | テストパターン |
| 状態管理             | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31観点        |

## 実行手順

### Step 1: テスト対象抽出

REQごとにテストケースIDを割り当てる。

### Step 2: Redケース追加

失敗を期待するケースを追加する。

### Step 3: 実行ログ確認

失敗内容を記録し、Phase 5の実装入力へ渡す。

## 統合テスト連携【必須】

| 観点     | 記録内容                                    |
| -------- | ------------------------------------------- |
| API/IPC  | `skill.list/getImported` の呼び出し回数検証 |
| 画面遷移 | 再訪時の再実行有無                          |
| 失敗復旧 | リトライ導線の成立                          |

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

| 成果物     | パス                       | 説明   |
| ---------- | -------------------------- | ------ |
| テスト仕様 | `phase-4-test-creation.md` | 本文書 |

## 完了条件

- [ ] Redテストケースが受け入れ基準を網羅している
- [ ] 既存テスト破壊が発生していない
- [ ] Phase 5の実装入力が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 5: 実装（`phase-5-implementation.md`）

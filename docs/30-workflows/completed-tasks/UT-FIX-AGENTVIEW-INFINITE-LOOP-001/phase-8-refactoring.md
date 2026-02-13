# Phase 8: リファクタリング

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 8                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

挙動を変えずに読みやすさと保守性を改善し、既存の個別セレクタ実装パターンへ統一する。

## 実行タスク

- 構造整理: 不要ラッパー関数を削減する
- 命名統一: 状態名とエラー名を統一する
- 参照安定性確認: 依存配列とセレクタの一貫性を確認する

## 参照資料

| 資料名                   | パス                        | 説明          |
| ------------------------ | --------------------------- | ------------- |
| Phase 1 要件定義         | `phase-1-requirements.md`   | 依存Phase     |
| Phase 2 設計             | `phase-2-design.md`         | 依存Phase     |
| Phase 5 実装             | `phase-5-implementation.md` | 依存Phase     |
| Phase 6 テスト拡充       | `phase-6-test-expansion.md` | 依存Phase     |
| Phase 7 カバレッジ確認   | `phase-7-coverage-check.md` | 依存Phase     |
| Phase 8 リファクタリング | `phase-8-refactoring.md`    | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容                  |
| ------------------ | ------------------------------------------------------------------------------------------- | --------------------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | P31対策の実装パターン |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 命名/構造の統一       |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型境界の維持          |

## 実行手順

### Step 1: 対象抽出

重複処理、長大関数、不要補助コードを抽出する。

### Step 2: 改善実施

可読性改善と命名統一を実施する。

### Step 3: 回帰確認

テスト実行で挙動不変を確認する。

## 統合テスト連携【必須】

| 観点         | 記録内容             |
| ------------ | -------------------- |
| Phase 5 接続 | 実装結果の維持       |
| Phase 6 接続 | 拡充テストの維持     |
| Phase 7 接続 | カバレッジ低下の有無 |

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

| 成果物               | パス                     | 説明   |
| -------------------- | ------------------------ | ------ |
| リファクタリング仕様 | `phase-8-refactoring.md` | 本文書 |

## 完了条件

- [ ] コード構造の改善点が列挙されている
- [ ] 挙動不変の確認結果が記録されている
- [ ] 個別セレクタ方針の準拠が確認されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 9: 品質保証（`phase-9-quality-assurance.md`）

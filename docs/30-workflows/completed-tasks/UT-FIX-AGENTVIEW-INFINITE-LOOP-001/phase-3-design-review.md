# Phase 3: 設計レビューゲート

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 3                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

Phase 1-2 の成果物をレビューし、実装開始可否を判定する。

## 実行タスク

- トレーサビリティ確認: REQと設計の対応を確認する
- リスク確認: 型変換と副作用経路のリスクを確認する
- 判定記録: PASS/MINOR/MAJORを明記する

## 参照資料

| 資料名               | パス                       | 説明          |
| -------------------- | -------------------------- | ------------- |
| Phase 1 要件定義     | `phase-1-requirements.md`  | 依存Phase     |
| Phase 2 設計         | `phase-2-design.md`        | 依存Phase     |
| Phase 3 設計レビュー | `phase-3-design-review.md` | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容               |
| ------------------ | --------------------------------------------------------------------------------- | ------------------ |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31対策の判定      |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時導線の妥当性 |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | UI契約確認         |

## 実行手順

### Step 1: 要件カバー確認

要件ごとに設計要素の対応表を作成する。

### Step 2: 技術レビュー

依存配列、参照安定性、型整合性を点検する。

### Step 3: ゲート判定

PASS/MINOR/MAJOR の根拠を記録する。

## 統合テスト連携【必須】

| 観点       | 記録内容                          |
| ---------- | --------------------------------- |
| テスト設計 | Phase 4で作成する失敗テストの対象 |
| IPC整合    | API呼び出し回数を観測する指標     |
| 回帰       | 既存機能への影響観点              |

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

| 成果物       | パス                       | 説明   |
| ------------ | -------------------------- | ------ |
| レビュー結果 | `phase-3-design-review.md` | 本文書 |

## 完了条件

- [ ] 要件と設計の対応が全件記録されている
- [ ] 判定理由が文章で記録されている
- [ ] 未解決事項がある場合は未タスク候補が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 4: テスト作成（`phase-4-test-creation.md`）

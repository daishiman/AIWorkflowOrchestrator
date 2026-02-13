# Phase 1: 要件定義

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 1                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 分類     | バグ修正                           |
| 作成日   | 2026-02-12                         |

## 目的

AgentViewで発生する再レンダリング連鎖を止め、`fetchSkills` がマウント時に有限回で収束する状態へ修正するための要件を定義する。

## 実行タスク

- 要件抽出: 無限ループの発火条件と再現条件を定義する
- 受け入れ基準定義: テストで検証できる形で成功条件を固定する
- スコープ確定: 対象ファイルと対象外項目を明確化する

## 参照資料

| 資料名           | パス                                                   | 説明                 |
| ---------------- | ------------------------------------------------------ | -------------------- |
| AgentView        | `apps/desktop/src/renderer/views/AgentView/index.tsx`  | 修正対象             |
| agentSlice       | `apps/desktop/src/renderer/store/slices/agentSlice.ts` | 既存アクションの確認 |
| Phase 1 要件定義 | `phase-1-requirements.md`                              | 本Phase成果物        |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                              | 内容                |
| ------------------ | --------------------------------------------------------------------------------- | ------------------- |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | 失敗時の扱い        |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | AgentView/skill境界 |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31対策の基準       |

## 実行手順

### Step 1: 現状分析

再現条件、依存配列、Store参照の安定性を確認する。

### Step 2: 要件化

機能要件と非機能要件を分離し、受け入れ基準へ落とし込む。

### Step 3: スコープ固定

対象ファイル、対象外項目、後続未タスク候補を明記する。

## 統合テスト連携【必須】

| 観点     | 記録内容                                               |
| -------- | ------------------------------------------------------ |
| API/IPC  | `skill.list`, `skill.getImported` 呼び出し回数の期待値 |
| 状態遷移 | `isLoadingSkills` / `skillError` の遷移条件            |
| UI       | 初回表示と再遷移時の挙動                               |

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

| 成果物     | パス                      | 説明   |
| ---------- | ------------------------- | ------ |
| 要件定義書 | `phase-1-requirements.md` | 本文書 |

## 完了条件

- [ ] 無限ループの原因が文章で説明されている
- [ ] 受け入れ基準が検証可能な文で定義されている
- [ ] スコープ内とスコープ外が分離されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 2: 設計（`phase-2-design.md`）

# Phase 2: 設計

## メタ情報

| 項目     | 値                                 |
| -------- | ---------------------------------- |
| Phase    | 2                                  |
| タスクID | UT-FIX-AGENTVIEW-INFINITE-LOOP-001 |
| 機能名   | AgentView無限ループ修正            |
| 作成日   | 2026-02-12                         |

## 目的

Phase 1の要件を満たす設計を定義し、`useFetchSkills` を中心に参照安定性を確保した実装方針を固定する。

## 実行タスク

- 設計方針決定: agentSliceの既存アクション再利用を採用する
- データフロー設計: 初回取得と再取得の呼び出し経路を定義する
- 影響分析: テストと子コンポーネントへの影響を整理する

## 参照資料

| 資料名           | パス                                                  | 説明          |
| ---------------- | ----------------------------------------------------- | ------------- |
| Phase 1 要件定義 | `phase-1-requirements.md`                             | 依存Phase     |
| AgentView        | `apps/desktop/src/renderer/views/AgentView/index.tsx` | 修正対象      |
| store index      | `apps/desktop/src/renderer/store/index.ts`            | セレクタ定義  |
| Phase 2 設計     | `phase-2-design.md`                                   | 本Phase成果物 |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                                        | 内容             |
| ------------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| 状態管理           | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                | 個別セレクタ方針 |
| Agent SDK Skill IF | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | 型とUI境界       |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | 既存パターン適用 |

## 実行手順

### Step 1: 取得アクション設計

`useFetchSkills`, `useRescanSkills`, `useImportSkill`, `useRemoveSkill` の利用箇所を固定する。

### Step 2: 状態参照設計

`importedSkills`, `isLoadingSkills`, `skillError` に統一する。

### Step 3: テスト設計接続

Phase 4で検証する観点をテストケースへマッピングする。

## 統合テスト連携【必須】

| 観点         | 記録内容                                  |
| ------------ | ----------------------------------------- |
| 呼び出し連鎖 | `useEffect -> fetchSkills` が有限回で収束 |
| API/IPC      | `skill.list/getImported` の実行期待値     |
| 失敗時       | `skillError` 表示と再試行導線             |

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

| 成果物 | パス                | 説明   |
| ------ | ------------------- | ------ |
| 設計書 | `phase-2-design.md` | 本文書 |

## 完了条件

- [ ] 設計方針が1つに確定している
- [ ] データフローと依存配列の設計が明記されている
- [ ] テスト観点への接続が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビュー（`phase-3-design-review.md`）

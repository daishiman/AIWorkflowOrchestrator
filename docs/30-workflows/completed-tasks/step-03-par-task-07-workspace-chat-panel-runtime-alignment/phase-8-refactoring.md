# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                                              |
| ---------- | ----------------------------------------------------------------- |
| Phase      | 8                                                                 |
| Phase名    | リファクタリング                                                  |
| タスクID   | TASK-IMP-WORKSPACE-CHAT-PANEL-AI-RUNTIME-001                      |
| 前提Phase  | Phase 5（実装）、Phase 6（テスト拡充）、Phase 7（カバレッジ確認） |
| 後続Phase  | Phase 9（品質検証）                                               |
| ステータス | not_started                                                       |
| 作成日     | 2026-03-13                                                        |
| 更新日     | 2026-03-17                                                        |
| 機能名     | workspace-chat-panel-runtime-alignment                            |

## 目的

Phase 5-7 で実装・テスト済みのコードについて、streaming / file context / conversation の責務分離を保ちながら構造を整理する。機能変更は行わず、可読性・保守性・テスタビリティの改善に限定する。

## 実行タスク

### T8-1: state 整理

useWorkspaceChatController 内の state 管理を整理する。

| 整理対象                             | 現状の問題                                        | 整理方針                                                        |
| ------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------- |
| stream state と context state の重複 | isStreaming と streamContent の管理が分散している | stream 関連 state を useStreamingState カスタム hook に抽出する |
| error state の散在                   | errorMessage が複数の handler から直接更新される  | setError / clearError を一元化する                              |
| cancel 関連の ref                    | requestIdRef と AbortController の管理が混在する  | cancel 関連を useCancelStream hook に抽出する                   |

### T8-2: helper 整理

mention / context / conversation helper の境界を整理する。

| 整理対象            | 現状の問題                                         | 整理方針                                       |
| ------------------- | -------------------------------------------------- | ---------------------------------------------- |
| mention 処理        | mention query と insert が controller に混在する   | useWorkspaceMentionQuery に完全分離する        |
| file context 組立   | buildFileContextBlock が controller 内にある       | buildFileContextBlock を独立関数として抽出する |
| conversation 永続化 | create / addMessage の呼び出しが controller に散在 | useConversationPersistence hook に抽出する     |

### T8-3: 命名・構造の統一

| 整理対象     | 整理方針                                                       |
| ------------ | -------------------------------------------------------------- |
| 変数命名     | streaming / context / conversation の prefix で統一する        |
| ファイル分割 | controller が 300 行を超える場合は上記 hook へ分割する         |
| import 整理  | 未使用 import を削除し、グループ（外部 / 内部 / 型）で整理する |

#### 語彙統一テーブル

親パック正本（ui-ux-realization.md / design-audit-matrix.md）に合わせて以下の語彙を統一する。

| 旧表現（非統一）       | 統一後の語彙       | 正本                   |
| ---------------------- | ------------------ | ---------------------- |
| `isApiKeyAvailable`    | `accessCapability` | design-audit-matrix.md |
| `openTerminal`         | `terminalHandoff`  | ui-ux-realization.md   |
| `showHelp` / `showTip` | `guidanceBlock`    | phase-2-design.md T2-5 |
| `authMode` / `apiMode` | `accessSurface`    | design-audit-matrix.md |
| `fallbackModel`        | （削除: P62 対策） | index.md GAP-03        |

### T8-4: dead code 除去

legacy authMode 関連の未使用コードを特定・除去する。

| 検出コマンド                                                                    | 除去対象の判定基準                                          |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `grep -rn "authMode\|isApiKey\|apiKeyToggle" src/renderer/views/WorkspaceView/` | Phase 2 T2-1 の authority 境界で不要と判断されたコード      |
| `grep -rn "DEFAULT_CONFIG\|defaultConfig" src/renderer/views/WorkspaceView/`    | P62 対策で禁止された fallback コード                        |
| `grep -rn "subscription\|toggle" src/renderer/views/WorkspaceView/`             | access matrix 移行で廃止された subscription/toggle パターン |

除去前に `git stash` でバックアップを取り、除去後にテストを実行して緑を確認する。

## リファクタリング対象テーブル

| 対象ファイル                    | 整理内容                                  | 影響範囲                        |
| ------------------------------- | ----------------------------------------- | ------------------------------- |
| `useWorkspaceChatController.ts` | stream state 分離、error state 一元化     | WorkspaceChatPanel              |
| `useWorkspaceChatController.ts` | cancel 関連を useCancelStream hook に抽出 | WorkspaceChatPanel              |
| `useWorkspaceChatController.ts` | mention 処理を完全分離                    | WorkspaceChatPanel              |
| `buildMessages.ts`              | file context 組み立てロジックを独立関数化 | llm handlers                    |
| `WorkspaceChatPanel.tsx`        | legacy authMode 参照の除去                | useWorkspaceChatController      |
| `conversationRepository.ts`     | conversation 永続化 hook の抽出元         | useConversationPersistence hook |

## リファクタリング原則

- 機能変更を行わない（全テストが refactor 前後で同一結果を返す）
- Phase 2 T2-1 の authority 境界を崩さない
- Phase 2 T2-3 の state 管理設計（Zustand / local の判断基準）に従う
- 抽出した hook / helper は既存テストでカバーされる粒度にする
- 一度に大きく変えず、1 hook 抽出ごとにテストを実行して緑を確認する

## 参照資料

| 参照資料                   | パス                                                                                | 内容                                       |
| -------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1（要件定義）        | `phase-1-requirements.md`                                                           | authority 前提を確認する                   |
| Phase 2（設計）            | `phase-2-design.md`                                                                 | 目標とする責務境界（T2-1〜T2-3）を確認する |
| Phase 5（実装）            | `phase-5-implementation.md`                                                         | 実装済み責務分布を確認する                 |
| Phase 7（カバレッジ確認）  | `phase-7-coverage-check.md`                                                         | coverage gap を確認する                    |
| useWorkspaceChatController | `apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts` | controller 責務を確認する                  |
| conversation repository    | `apps/desktop/src/main/repositories/conversationRepository.ts`                      | conversation authority を確認する          |

### システム仕様（aiworkflow-requirements）

| 参照資料                 | パス                                                                            | 内容                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| arch-state-management    | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | state 配置原則（T2-3 Zustand/local 判断基準）を確認する                                     |
| llm-streaming            | `.claude/skills/aiworkflow-requirements/references/llm-streaming.md`            | stream / cancel lifecycle の責務境界（T8-1 useStreamingState / useCancelStream 分離の根拠） |
| ui-ux-feature-components | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md` | WorkspaceChatPanel の 5 領域責務境界（T8-2 コンポーネント分離の正本）                       |

## 実行手順

### ステップ1: Phase 5-7 成果物の確認

Phase 5 の実装結果と Phase 7 のカバレッジ報告を読み、リファクタリング対象のファイルと行数を把握する。

### ステップ2: T8-1 state 整理

1. stream 関連 state（isStreaming / streamContent / requestIdRef）を useStreamingState hook に抽出する
2. テストを実行し緑を確認する
3. error 関連 state を setError / clearError に一元化する
4. テストを実行し緑を確認する
5. cancel 関連を useCancelStream hook に抽出する
6. テストを実行し緑を確認する

### ステップ3: T8-2 helper 整理

1. mention 処理を useWorkspaceMentionQuery に完全分離する
2. buildFileContextBlock を独立関数として抽出する
3. conversation 永続化を useConversationPersistence hook に抽出する
4. 各抽出後にテストを実行し緑を確認する

### ステップ4: T8-3 命名・構造の統一

1. 語彙統一テーブルに基づき変数命名を統一する
2. 未使用 import を削除する
3. controller の行数が 300 行以下になったことを確認する

### ステップ5: T8-4 dead code 除去

1. 検出コマンド 3 種を実行し、dead code 候補を列挙する
2. Phase 2 T2-1 の authority 境界に基づき除去対象を判定する
3. `git stash` でバックアップ後、dead code を除去する
4. テストを実行し緑を確認する

### ステップ6: 全テスト実行と回帰確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/
```

テストが失敗した場合の修復フロー:

| 失敗パターン                           | 修復手順                                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------- |
| hook 抽出後にインポートパス変更で失敗  | `grep -rn "from.*useStreamingState\|useCancelStream\|useConversationPersistence"` で参照箇所を特定し修正 |
| 命名統一後にテストの期待値が不一致     | テスト内の旧語彙を語彙統一テーブルに従い置換する                                                         |
| dead code 除去後に依存するテストが失敗 | `git stash pop` でバックアップを復元し、除去対象を再検討する                                             |
| 型エラーで vitest が起動しない         | `cd apps/desktop && pnpm typecheck 2>&1                                                                  | head -20` でエラー箇所を特定する |

### ステップ7: 成果物と完了条件の確認

リファクタ計画と実施結果を成果物に記録する。

## 統合テスト連携

| 確認観点          | 検証方法                                                |
| ----------------- | ------------------------------------------------------- |
| stream state 分離 | 既存 streaming テストが全て PASS する                   |
| mention hook 分離 | 既存 mention テストが全て PASS する                     |
| conversation 分離 | 既存 conversation テストが全て PASS する                |
| controller 行数   | `wc -l useWorkspaceChatController.ts` が 300 以下       |
| 機能変更なし      | `git diff --stat` で test ファイルの assertion 変更が 0 |

## 多角的チェック観点（AIが判断）

タスクの性質に応じて、以下の観点を確認する。
**具体的なチェック項目はAIがタスク内容に応じて判断・適用する。**

| 観点               | 適用判断                           | 仕様参照先                                   |
| ------------------ | ---------------------------------- | -------------------------------------------- |
| セキュリティ       | 認証・認可・入力検証が関係する場合 | `aiworkflow-requirements: security-*.md`     |
| UI/UX              | フロントエンド実装の場合           | `aiworkflow-requirements: ui-ux-*.md`        |
| アーキテクチャ     | 設計・構造変更の場合               | `aiworkflow-requirements: architecture-*.md` |
| API設計            | API実装・変更の場合                | `aiworkflow-requirements: api-*.md`          |
| データ整合性       | DB操作の場合                       | `aiworkflow-requirements: database-*.md`     |
| エラーハンドリング | 例外処理が必要な場合               | `aiworkflow-requirements: error-handling.md` |
| パフォーマンス     | 性能要件がある場合                 | `aiworkflow-requirements: architecture-*.md` |
| アクセシビリティ   | UI実装の場合                       | `aiworkflow-requirements: ui-ux-*.md`        |

**Electronデスクトップアプリ観点**（本プロジェクト固有）:

| 層                         | 適用判断                    | 仕様参照先                                             |
| -------------------------- | --------------------------- | ------------------------------------------------------ |
| フロントエンド（Renderer） | UI/React実装の場合          | `aiworkflow-requirements: ui-ux-*.md`                  |
| バックエンド（Main）       | サービス/ロジック実装の場合 | `aiworkflow-requirements: architecture-*.md`           |
| IPC通信                    | Main-Renderer連携の場合     | `aiworkflow-requirements: api-*.md`, `interfaces-*.md` |
| Preload/セキュリティ       | API公開の場合               | `aiworkflow-requirements: security-api-electron.md`    |
| ローカルストレージ         | データ永続化の場合          | `aiworkflow-requirements: database-*.md`               |

**本Phase固有の確認観点**:

| 観点           | 確認内容                                                                 |
| -------------- | ------------------------------------------------------------------------ |
| アーキテクチャ | hook 抽出後も Renderer -> Preload -> Main の一方向依存が維持されているか |
| 状態管理       | 抽出した hook が Zustand / local の判断基準（T2-3）に従っているか        |
| テスタビリティ | 抽出した hook が単体テスト可能な粒度になっているか                       |
| 可読性         | controller の行数が 300 行以下で、責務ごとにファイルが分離されているか   |

## 成果物

| 成果物         | パス                               | 内容                                       |
| -------------- | ---------------------------------- | ------------------------------------------ |
| リファクタ計画 | `outputs/phase-8/refactor-plan.md` | 整理対象、非対象、抽出 hook 一覧を明記する |

## 完了条件

- [ ] streaming / context / conversation の責務境界を壊さない整理方針が定義されている
- [ ] T8-1: stream state / error state / cancel 関連の分離が完了している
- [ ] T8-2: mention / file context / conversation helper の分離が完了している
- [ ] T8-3: 変数命名統一（語彙統一テーブル準拠）と未使用 import 削除が完了している
- [ ] T8-4: dead code 候補が列挙され、除去が完了している
- [ ] リファクタ対象と非対象の境界が明記されている
- [ ] 全テストが refactor 前後で同一結果（全 PASS）を返す
- [ ] controller の行数が 300 行以下になっている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

| サブタスクID | 内容                 | 依存先 | ステータス  |
| ------------ | -------------------- | ------ | ----------- |
| ST-8-1       | T8-1 state 整理      | なし   | not_started |
| ST-8-2       | T8-2 helper 整理     | ST-8-1 | not_started |
| ST-8-3       | T8-3 命名・構造統一  | ST-8-2 | not_started |
| ST-8-4       | T8-4 dead code 除去  | ST-8-3 | not_started |
| ST-8-5       | 全テスト回帰確認     | ST-8-4 | not_started |
| ST-8-6       | 成果物作成・完了確認 | ST-8-5 | not_started |

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

```bash
# 1. 成果物ファイルの存在確認
ls -la outputs/phase-8/refactor-plan.md

# 2. 全テスト PASS 確認
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView/ 2>&1 | tail -5

# 3. controller 行数確認
wc -l apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts

# 4. 機能変更なし確認（test assertion の変更が 0）
git diff --stat -- '*.test.ts' '*.test.tsx' | grep -c "insertion\|deletion" || echo "0 test changes"

# 5. 未使用 import がないことを確認
cd apps/desktop && pnpm lint -- --no-error-on-unmatched-pattern src/renderer/views/WorkspaceView/
```

## 次のPhase

- [Phase 9（品質検証）](./phase-9-quality-assurance.md) に進む
- Phase 9 へ引き渡す情報: リファクタ計画（抽出 hook 一覧、分離結果、回帰テスト結果）

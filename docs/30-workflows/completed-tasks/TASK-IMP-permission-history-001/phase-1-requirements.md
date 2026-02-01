# Phase 1: 要件定義

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 機能名 | TASK-IMP-permission-history-001 |
| 作成日 | 2026-01-31                      |

## 目的

Permission要求履歴トラッキングUIの機能要件・非機能要件を明文化し、受け入れ基準を定義する。

## 実行タスク

- 要件抽出: タスク仕様書・システム仕様書から機能要件・非機能要件を抽出
- 受け入れ基準作成: 各要件に対して検証可能な受け入れ基準を定義
- FR/NFR分類: 機能要件と非機能要件を分類し優先度を設定
- 既存実装分析: 現在のPermissionStore・PermissionDialog・PermissionSettingsの実装状況を確認

## 参照資料

| 資料名                 | パス                                                                                      | 説明                            |
| ---------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| タスク仕様書           | `docs/30-workflows/unassigned-task/task-imp-permission-history-001.md`                    | 元タスク仕様書                  |
| PermissionSettings仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md` L186-L277           | PermissionSettings UIの仕様     |
| Permission Store仕様   | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` L240-L324 | PermissionStore永続化仕様       |
| PermissionDialog仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-agent-execution.md`              | PermissionDialogの3ボタンUI仕様 |
| 状態管理パターン       | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`              | Zustand Store-directパターン    |
| エラーハンドリング仕様 | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                     | エラー処理パターン              |

### システム仕様（aiworkflow-requirements）

> 実装前に以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                            | 内容                                      |
| ---------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- |
| UI/UX設定画面仕様      | `.claude/skills/aiworkflow-requirements/references/ui-ux-settings.md`           | PermissionSettings UIコンポーネント仕様   |
| セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-skill-execution.md` | PermissionStore設計・セキュリティポリシー |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`    | Zustand Store-directパターン              |

## 実行手順

### 1. 既存実装の確認

以下の既存ファイルを確認し、現在の権限管理アーキテクチャを把握する:

- `apps/desktop/src/main/services/skill/PermissionStore.ts`: 現在のPermissionStoreのメソッド構成
- `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx`: 3ボタンパターン（拒否/1回許可/許可+記憶）の実装
- `apps/desktop/src/renderer/components/settings/PermissionSettings/index.tsx`: 許可済みツール一覧UI
- `apps/desktop/src/renderer/components/skill/permissionDescriptions.ts`: 人間可読な説明文生成（12ツール対応）
- `packages/shared/src/types/permission-store.ts`: AllowedToolEntry・IPermissionStore型定義

### 2. 機能要件の抽出

以下の機能要件を定義する:

| FR ID | 要件                                                                                              | 優先度 |
| ----- | ------------------------------------------------------------------------------------------------- | ------ |
| FR-1  | 権限許可/拒否/1回許可の判断時に自動的に履歴エントリを記録する                                     | 必須   |
| FR-2  | PermissionSettingsに「権限履歴」セクションを追加し、履歴を時系列で表示する                        | 必須   |
| FR-3  | 各エントリにタイムスタンプ・ツール名・引数要約・判断結果（approved/denied/approved_once）を含める | 必須   |
| FR-4  | ツール名でフィルタリングできる（ドロップダウン選択）                                              | 必須   |
| FR-5  | 判断結果でフィルタリングできる（approved/denied/approved_once）                                   | 必須   |
| FR-6  | 履歴のクリア機能を提供する（確認ダイアログ付き）                                                  | 必須   |
| FR-7  | 履歴件数の上限を1000件とし、超過時は古いエントリを自動削除する                                    | 必須   |

### 3. 非機能要件の抽出

| NFR ID | 要件                                                                      | 優先度 |
| ------ | ------------------------------------------------------------------------- | ------ |
| NFR-1  | 1000件以上の履歴でもスムーズに表示される（仮想スクロール使用）            | 必須   |
| NFR-2  | 履歴データはRenderer Process内のZustand storeで管理しlocalStorageに永続化 | 必須   |
| NFR-3  | TypeScript strict modeでエラーなし                                        | 必須   |
| NFR-4  | テストカバレッジ Lines 95%以上                                            | 必須   |
| NFR-5  | 引数スナップショットはsafeString()で安全化した要約テキストのみ保存        | 必須   |
| NFR-6  | アクセシビリティ: ARIA属性、キーボード操作対応                            | 推奨   |

### 4. 受け入れ基準の定義

| AC ID | 受け入れ基準                                                                                                  |
| ----- | ------------------------------------------------------------------------------------------------------------- |
| AC-1  | PermissionDialogで「許可」「1回許可」「拒否」のいずれかを選択した後、履歴パネルに最新エントリが追加されている |
| AC-2  | 履歴エントリにISO8601形式のタイムスタンプ、ツール名、引数要約テキスト、判断結果が表示される                   |
| AC-3  | ツール名ドロップダウンで「Bash」を選択すると、Bash関連エントリのみが表示される                                |
| AC-4  | 判断結果フィルタで「拒否」を選択すると、拒否エントリのみが表示される                                          |
| AC-5  | 「履歴をクリア」ボタンをクリックし確認ダイアログで承認すると、履歴が空になる                                  |
| AC-6  | 100件以上の履歴がある状態でスクロール操作がスムーズ（フレーム落ちなし）                                       |
| AC-7  | ブラウザリロード後も履歴が保持されている（localStorage永続化）                                                |
| AC-8  | 1001件目のエントリ追加時、最も古いエントリが自動削除され1000件が維持される                                    |

## 統合テスト連携【必須】

接続要件（API/認証/データフロー）を要件に明記する:

| 接続要件カテゴリ | 記載内容                                                                                |
| ---------------- | --------------------------------------------------------------------------------------- |
| IPC通信          | PermissionDialog応答（SKILL_PERMISSION_RESPONSE）→ 履歴記録（Renderer内Zustand）の連携  |
| データフロー     | PermissionDialog応答 → skillSlice.respondToSkillPermission → 履歴Store記録 → UI表示更新 |
| 状態永続化       | Zustand persist middleware → localStorage → 起動時復元                                  |

## アーキテクチャ層別要件（AIが判断）

| 層                         | 要件                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| フロントエンド（Renderer） | PermissionHistoryPanel UIコンポーネント、フィルタリングUI、仮想スクロール                  |
| バックエンド（Main）       | 不要（履歴はRenderer Processで管理）                                                       |
| IPC通信                    | 不要（履歴はRenderer Process内で完結、PermissionDialog応答は既存IPC）                      |
| セキュリティ               | 引数のsafeString()化、機密情報の非保存、localStorage暗号化は不要（機密データ非保持のため） |
| データ                     | localStorage永続化、Zustand persist middleware、最大1000件制限                             |

## 成果物

| 成果物       | パス                                         | 説明               |
| ------------ | -------------------------------------------- | ------------------ |
| 要件定義書   | `outputs/phase-1/requirements-definition.md` | 機能・非機能要件   |
| 受け入れ基準 | `outputs/phase-1/acceptance-criteria.md`     | AC定義             |
| スコープ定義 | `outputs/phase-1/scope-definition.md`        | 実装範囲・除外範囲 |

## 完了条件

- [ ] FR-1〜FR-7の機能要件が定義されている
- [ ] NFR-1〜NFR-6の非機能要件が定義されている
- [ ] AC-1〜AC-8の受け入れ基準が定義されている
- [ ] 既存PermissionStore/PermissionDialog/PermissionSettingsの実装状況が確認されている
- [ ] アーキテクチャ層別の要件が整理されている（Renderer中心、Main/IPC不要の判断を含む）
- [ ] 接続要件（PermissionDialog応答→履歴記録→UI表示のデータフロー）が明記されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実行タスクの実施（各タスクごとに1サブタスク）
3. 統合テスト連携の実施
4. 成果物の作成・配置
5. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-history-001 --phase 1
```

## 次のPhase

Phase 2: 設計

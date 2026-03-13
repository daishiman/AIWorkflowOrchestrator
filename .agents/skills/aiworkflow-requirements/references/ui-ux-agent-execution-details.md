# Agent Execution UI コンポーネント / detail specification

> 親仕様書: [ui-ux-agent-execution.md](ui-ux-agent-execution.md)
> 役割: detail specification

## ChatPanel統合UIフロー（TASK-7D実装済）

### 概要

ChatPanelコンポーネントにスキル実行機能を統合し、ユーザーがチャットインターフェースからスキル選択・実行・ストリーミング応答確認・権限確認を一貫して操作できるUIフローを提供する。

### 統合コンポーネント構成

| コンポーネント         | 役割                                           | 統合パターン                          |
| ---------------------- | ---------------------------------------------- | ------------------------------------- |
| ChatPanel              | 統合コンテナ（forwardRef + useImperativeHandle）| 既存チャットUIへのスキル機能注入       |
| SkillStreamingView     | ストリーミング応答表示（React.memo最適化）      | StatusBadge + StreamMessageItem表示    |
| SkillSelector          | スキル選択UI                                   | ChatPanel内に埋め込み表示             |
| SkillImportDialog      | スキルインポートダイアログ                     | モーダルオーバーレイ表示              |
| PermissionDialog       | 権限確認ダイアログ                             | Store-directパターンで自動表示        |

### ChatPanel統合実行フロー

| ステップ | アクション                             | 詳細                                                     |
| -------- | -------------------------------------- | -------------------------------------------------------- |
| 1        | ユーザーがスキルを選択                 | SkillSelectorでスキル一覧から選択                        |
| 2        | プロンプトを入力して送信               | ChatPanel入力欄からメッセージ送信                         |
| 3        | skillSlice.executeSkill()呼び出し      | Store経由でIPC実行開始                                   |
| 4        | SkillStreamingViewでリアルタイム表示   | StatusBadge（実行中）+ StreamMessageItemで差分表示        |
| 5        | 権限確認要求時にPermissionDialog表示   | Store.pendingPermissionの変更を検知し自動表示            |
| 6        | ユーザーが権限を応答                   | 3ボタン（拒否/1回許可/許可）で応答                       |
| 7        | 実行完了時にStatusBadge更新            | DisplayableStatus型で完了/エラー/キャンセルを表示        |

### DisplayableStatus型

SkillStreamingViewで表示するステータスを制御する型。実行状態に応じて適切なステータスバッジを表示する。

| ステータス     | バッジ表示 | 条件                          |
| -------------- | ---------- | ----------------------------- |
| executing      | 実行中     | isExecuting === true          |
| permission     | 権限待ち   | pendingPermission !== null    |
| completed      | 完了       | executionStatus === completed |
| error          | エラー     | skillError !== null           |
| idle           | （非表示） | 初期状態・待機中              |

### 再レンダー最適化パターン

ChatPanel統合ではStore個別セレクタパターンを採用し、不要な再レンダーを防止する。

| パターン             | 適用箇所               | 効果                                        |
| -------------------- | ---------------------- | ------------------------------------------- |
| React.memo           | SkillStreamingView     | props未変更時の再レンダースキップ           |
| 個別セレクタ         | useAppStore各プロパティ | 必要なプロパティのみsubscribe               |
| forwardRef           | ChatPanel              | 親コンポーネントからのref転送               |
| useImperativeHandle  | ChatPanel              | 外部からのメソッド公開を最小化              |

---

### タスク: PermissionDialogリスクレベル・セキュリティメタデータ表示（2026-01-31完了）

| 項目         | 内容                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| タスクID     | task-imp-permission-tool-metadata-001                                   |
| 完了日       | 2026-01-31                                                              |
| ステータス   | **完了**                                                                |
| テスト数     | 56（toolMetadata: 37 + PermissionDialog.metadata: 19）                  |
| 発見課題     | 0件                                                                     |
| ドキュメント | `docs/30-workflows/task-imp-permission-tool-metadata-001/`              |

#### テスト結果サマリー

| カテゴリ           | テスト数 | PASS | FAIL |
| ------------------ | -------- | ---- | ---- |
| toolMetadata機能   | 37       | 37   | 0    |
| PermissionDialog統合 | 19     | 19   | 0    |
| 既存テスト回帰     | 202      | 202  | 0    |

#### toolMetadata モジュール仕様

| 項目             | 内容                                                                      |
| ---------------- | ------------------------------------------------------------------------- |
| パス             | `apps/desktop/src/renderer/components/skill/toolMetadata.ts`              |
| 型定義           | `RiskLevel` (`"Low" \| "Medium" \| "High" \| "Critical"`), `ToolMetadata` |
| データ           | 12ツール定義 + デフォルト値（Medium）                                     |
| 準拠仕様         | security-skill-execution.md ALLOWED_TOOLS_WHITELIST                       |

#### 公開API

| 関数                    | 戻り値型       | 説明                                       |
| ----------------------- | -------------- | ------------------------------------------ |
| `getRiskLevel(tool)`    | `RiskLevel`    | ツールのリスクレベルを取得（未定義→Medium）|
| `getSecurityImpact(tool)` | `string`     | セキュリティ影響テキストを取得             |
| `getToolMetadata(tool)` | `ToolMetadata` | メタデータ全体を取得                       |

#### リスクレベル色分け

| RiskLevel | 背景色        | テキスト色      | WCAGコントラスト比 |
| --------- | ------------- | --------------- | ------------------ |
| Low       | bg-green-100  | text-green-800  | 6.49:1             |
| Medium    | bg-yellow-100 | text-yellow-800 | 6.44:1             |
| High      | bg-orange-100 | text-orange-800 | 6.43:1             |
| Critical  | bg-red-100    | text-red-800    | 6.87:1             |

#### RISK_LEVEL_STYLES定数

PermissionDialog.tsxで定義されるリスクレベル別UIスタイルの定数マッピング。

| 項目   | 型                                                                | 説明                         |
| ------ | ----------------------------------------------------------------- | ---------------------------- |
| 定数名 | `RISK_LEVEL_STYLES: Record<RiskLevel, { bg; text; border }>`     | Tailwind CSSクラスのマッピング |
| 配置   | `apps/desktop/src/renderer/components/skill/PermissionDialog.tsx` | toolMetadata.tsのRiskLevel型を参照 |

| RiskLevel | bg               | text               | border               |
| --------- | ---------------- | ------------------ | -------------------- |
| Low       | `bg-green-100`   | `text-green-800`   | `border-green-200`   |
| Medium    | `bg-yellow-100`  | `text-yellow-800`  | `border-yellow-200`  |
| High      | `bg-orange-100`  | `text-orange-800`  | `border-orange-200`  |
| Critical  | `bg-red-100`     | `text-red-800`     | `border-red-200`     |

#### PermissionDialog統合

toolMetadataモジュールはPermissionDialog.tsxで以下の形で統合されている。

| 統合要素             | 実装パターン       | 説明                                                                 |
| -------------------- | ------------------ | -------------------------------------------------------------------- |
| リスクバッジ         | IIFE（即時実行関数式） | `{(() => { const riskLevel = getRiskLevel(toolName); ... })()}` でインライン動的レンダリング |
| セキュリティ影響     | `<p>`テキスト      | `getSecurityImpact(toolName)` の返り値を `text-xs text-gray-500` で表示 |
| スタイル適用         | RISK_LEVEL_STYLES参照 | `bg`, `text`, `border` を組み合わせてバッジの `className` を構成     |
| aria-label           | リスクレベル読み上げ | `aria-label={リスクレベル: ${riskLevel}}` でスクリーンリーダー対応   |

#### ツールカバレッジマッピング

toolMetadata.ts（12ツール）とsecurity-skill-execution.md ALLOWED_TOOLS_WHITELIST（11ツール）のカバレッジ比較。

| ツール名     | toolMetadata | WHITELIST | 差異理由                                        |
| ------------ | ------------ | --------- | ----------------------------------------------- |
| Read         | ✅ Low       | ✅ Low    | -                                               |
| Write        | ✅ Medium    | ✅ Medium | -                                               |
| Edit         | ✅ Medium    | ✅ Medium | -                                               |
| Bash         | ✅ High      | ✅ High   | -                                               |
| Glob         | ✅ Low       | ✅ Low    | -                                               |
| Grep         | ✅ Low       | ✅ Low    | -                                               |
| Task         | ✅ Medium    | ✅ Medium | -                                               |
| WebSearch    | ✅ Low       | ✅ Low    | -                                               |
| WebFetch     | ✅ Medium    | ✅ Medium | -                                               |
| LS           | ❌           | ✅ Low    | WHITELISTのみ: Renderer UIでの使用頻度が低い   |
| TodoWrite    | ❌           | ✅ Low    | WHITELISTのみ: Renderer UIでの使用頻度が低い   |
| NotebookEdit | ✅ Medium    | ❌        | toolMetadataのみ: Jupyter統合用                 |
| Skill        | ✅ Medium    | ❌        | toolMetadataのみ: スキル実行用                  |
| AskUser      | ✅ Low       | ❌        | toolMetadataのみ: ユーザー確認用                |

**設計方針**: toolMetadataはPermissionDialogで表示されうる全ツールをカバーし、ALLOWED_TOOLS_WHITELISTはスキル実行時のセキュリティ制御に特化。未定義ツールはDEFAULT_METADATA（Medium, "ツールを実行します"）で安全側にフォールバック。

#### 成果物

| 成果物             | パス                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| 実装ガイド         | `docs/30-workflows/task-imp-permission-tool-metadata-001/outputs/phase-12/implementation-guide.md`        |
| 最終レビュー       | `docs/30-workflows/task-imp-permission-tool-metadata-001/outputs/phase-10/final-review-report.md`         |

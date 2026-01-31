# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                             |
| ------ | ------------------------------ |
| Phase  | 12                             |
| 機能名 | TASK-IMP-permission-tool-icons |
| 作成日 | 2026-01-30                     |

## 目的

実装ガイドの更新、システム仕様書の更新、ドキュメント更新履歴の作成、未タスク検出を行う。

## 実行タスク（4タスク - 全て完了必須）

- Task 1: 実装ガイド作成（2パート構成）
- Task 2: システム仕様書更新（2ステップ）
- Task 3: ドキュメント更新履歴作成
- Task 4: 未タスク検出レポート作成（0件でも出力必須）

## 参照資料

| 資料名                 | パス                                                                                    | 説明                   |
| ---------------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| Phase 11テスト結果     | `outputs/phase-11/manual-test-result.md`                                                | 手動テスト結果         |
| Phase 5実装サマリー    | `outputs/phase-5/implementation-summary.md`                                             | 実装内容               |
| 既存実装ガイド         | `docs/30-workflows/TASK-7C-permission-dialog/outputs/phase-12/implementation-guide.md`  | TASK-7Cの実装ガイド    |
| 仕様更新フロー         | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新手順           |
| Phase 11/12ガイド      | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | Phase 12詳細手順       |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | ドキュメント作成ガイド |
| インターフェース仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-ui.md`          | PermissionDialog仕様   |
| 未タスクガイドライン   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク検出ガイド     |

## 実行手順

### Task 1: 実装ガイド作成（2パート構成）

#### Part 1: 初学者・中学生レベル（概念説明）

**必須要件**:

- 日常生活での例え話を**必ず**含める
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**内容例**:

```markdown
## Part 1: ツールアイコンって何？（やさしい説明）

### なぜアイコンが必要なの？

想像してみてください。あなたが図書館にいて、本を探しています。
棚にはたくさんの本がありますが、全部白いカバーで名前だけ書いてあります。
探すのが大変ですよね？

でも、もし本のカバーに絵が描いてあったら？

- 料理の本には鍋のマーク 🍳
- 科学の本には試験管のマーク 🧪
- 漫画にはフキダシのマーク 💬

これなら一目で分かりますよね！

PermissionDialogのツールアイコンも同じ考え方です。
パソコンがユーザーに「このツールを使っていいですか？」と聞くとき、
ツールの名前だけでなく、絵（アイコン）も一緒に見せることで、
「あ、これはファイルを読むツールだな」とすぐに分かるようにしています。

### 何をしたの？

10個のツールそれぞれに絵文字（えもじ）をつけました。
知らないツールが来ても「🔧」マークが出るので安心です。
```

#### Part 2: 開発者・技術者レベル（技術的詳細）

**必須要件**:

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**内容例**:

```markdown
## Part 2: 技術的詳細

### 型定義

- `TOOL_ICONS: Record<string, string>` — 10ツール分のEmojiマッピング
- `DEFAULT_TOOL_ICON: string` — デフォルトアイコン '🔧'
- `getToolIcon(toolName: string): string` — アイコン取得ヘルパー

### 定数一覧

| 定数名            | 型                     | 値              |
| ----------------- | ---------------------- | --------------- |
| TOOL_ICONS        | Record<string, string> | {Bash:'💻',...} |
| DEFAULT_TOOL_ICON | string                 | '🔧'            |

### エッジケース

- 未定義ツール名 → DEFAULT_TOOL_ICON を返す
- 大文字小文字は区別（'Bash'のみ対応、'bash'はデフォルト）
- 空文字列 → DEFAULT_TOOL_ICON を返す

### アクセシビリティ

アイコンは装飾的要素として `aria-hidden="true"` を付与。
スクリーンリーダーはツール名テキストのみを読み上げる。
```

**出力先**: `outputs/phase-12/implementation-guide.md`

### Task 2: システム仕様書更新（2ステップ）

#### Step 1: タスク完了記録（必須）

**Step 1-A**: `interfaces-agent-sdk-ui.md` の「完了タスク」セクションに本タスクを追記する。

```markdown
### 完了タスク

| タスクID                           | タスク名                              | 完了日     |
| ---------------------------------- | ------------------------------------- | ---------- |
| task-imp-permission-tool-icons-001 | PermissionDialog ツール別アイコン表示 | 2026-0X-XX |
```

**Step 1-B**: 実装状況テーブルに本タスクの実装状態を更新する。

**Step 1-C**: 関連タスクテーブル（存在する場合）のステータスを更新する。

確認対象ファイル:

| タスク種別          | 確認ファイル               |
| ------------------- | -------------------------- |
| Skill/Agent関連     | `arch-state-management.md` |
| IPC/Preload関連     | `security-api-electron.md` |
| UI/UXコンポーネント | `ui-ux-components.md`      |
| Database関連        | `database-schema.md`       |

関連タスクテーブルに本タスクが記載されている場合、ステータスを `未着手` → `完了` に更新する。

**LOGS.md更新（必須 - 両方のファイル）**:

1. `.claude/skills/aiworkflow-requirements/LOGS.md` — システム仕様更新の記録
2. `.claude/skills/task-specification-creator/LOGS.md` — タスク仕様書スキル使用の記録

**topic-map.md更新**（新規セクション追加時は必須）:

ファイル: `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`
→ 仕様ファイルに新規セクションを追加した場合、topic-mapにエントリを追加する。

#### Step 2: システム仕様更新（条件付き）

本タスクは**新規インターフェース追加なし**（既存のPermissionRequest型をそのまま使用）のため、インターフェース仕様の更新は**不要**。

**更新判断**:

| 変更内容                   | 更新が必要？                          |
| -------------------------- | ------------------------------------- |
| 新規型定義の追加           | **不要** — 新規型なし                 |
| 既存インターフェースの変更 | **不要** — 変更なし                   |
| 新規定数の追加             | **不要** — コンポーネント内部定数のみ |
| API仕様の変更              | **不要** — API変更なし                |

ただし、`interfaces-agent-sdk-ui.md` の PermissionDialog セクションに toolIcons対応済みの記述を追加することを検討する。

### Task 3: ドキュメント更新履歴作成

```bash
node scripts/generate-documentation-changelog.js
```

フォールバック: 手動で `outputs/phase-12/documentation-changelog.md` を作成する。

**記録内容**:

- 更新日時
- 更新対象ファイル一覧
- 変更内容サマリー

### Task 4: 未タスク検出レポート作成（0件でも出力必須）

以下のソースから未タスク候補を検出する。

| ソース                 | 確認項目                           |
| ---------------------- | ---------------------------------- |
| 元タスク仕様書         | 「スコープ外」として明示された項目 |
| Phase 3/10レビュー結果 | MINOR判定の指摘事項                |
| Phase 11手動テスト     | スコープ外の発見事項・改善提案     |
| コードコメント         | TODO/FIXME/HACK/XXX                |

```bash
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/renderer/components/skill --output .tmp/unassigned-candidates.json
```

**検出候補の例**:

- ツールごとのカスタムカラー（元タスク仕様書のスコープ外）
- カスタムSVGアイコンの作成（元タスク仕様書のスコープ外）
- アイコン設定のUI（元タスク仕様書のスコープ外）

**出力先**: `outputs/phase-12/unassigned-task-detection.md`

## 統合テスト連携

Phase 12はドキュメント作成であり、コード変更はない。統合テスト影響なし。

## 多角的チェック観点

| 観点             | 該当 | 確認内容                                            |
| ---------------- | ---- | --------------------------------------------------- |
| UI/UX            | ✅   | Part 1の例え話がUI/UXコンセプトを適切に伝えているか |
| インターフェース | ✅   | Part 2の型定義が正確か                              |
| 仕様整合性       | ✅   | システム仕様書と実装の整合性が取れているか          |

## アーキテクチャ層別ドキュメント（AIが判断）

| 層                         | ドキュメント内容                            | 更新対象            | 該当 |
| -------------------------- | ------------------------------------------- | ------------------- | ---- |
| フロントエンド（Renderer） | コンポーネント設計、状態管理、Hooks使用方法 | `ui-ux-*.md`        | ✅   |
| バックエンド（Main）       | サービス設計、ビジネスロジック、API仕様     | `architecture-*.md` | -    |
| IPC通信                    | チャンネル定義、リクエスト/レスポンス型     | `interfaces-*.md`   | -    |
| Preload                    | 公開API一覧、セキュリティ考慮事項           | `security-*.md`     | -    |
| データ層                   | スキーマ定義、リポジトリパターン            | `database-*.md`     | -    |
| エラーハンドリング         | エラーコード、エラーメッセージ、復旧手順    | `error-handling.md` | -    |

→ 本タスクはRenderer Process層のみ。実装ガイドにコンポーネント設計情報を記載。

## 成果物

| 成果物               | パス                                            | 説明                    |
| -------------------- | ----------------------------------------------- | ----------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | 2パート構成の実装ガイド |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | 更新履歴                |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | 未タスク検出結果        |

## 完了条件

- [ ] 実装ガイドPart 1（中学生レベル概念説明）が作成されている
- [ ] 実装ガイドPart 2（技術者レベル詳細）が作成されている
- [ ] 【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加
- [ ] 【Task 2 Step 1-A】関連ドキュメントにリンク追加
- [ ] 【Task 2 Step 1-A】変更履歴セクションに追記
- [ ] 【Task 2 Step 1-B】実装状況テーブル更新（該当時）
- [ ] 【Task 2 Step 1-C】関連タスクテーブル更新（該当時）
- [ ] 【Task 2 Step 1】aiworkflow-requirements/LOGS.md更新
- [ ] 【Task 2 Step 1】task-specification-creator/LOGS.md更新
- [ ] 【Task 2 Step 1】topic-map.md追加（該当時）
- [ ] 【Task 2 Step 2】更新要否判定・記録
- [ ] アーキテクチャ層別ドキュメント作成（該当層のみ）
- [ ] ドキュメント更新履歴が作成されている
- [ ] 未タスク検出レポート出力【必須】（0件でも出力）
- [ ] 検出未タスク指示書作成（該当時）
- [ ] artifacts.json更新
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. 実装ガイドPart 1作成（Task 1）
3. 実装ガイドPart 2作成（Task 1）
4. システム仕様書更新 Step 1（Task 2）
5. システム仕様書更新 Step 2判定（Task 2）
6. LOGS.md両方更新（Task 2）
7. ドキュメント更新履歴作成（Task 3）
8. 未タスク検出レポート作成（Task 4）
9. artifacts.json更新
10. 成果物の作成・配置
11. 完了条件の検証

各サブタスクは実行完了後すぐに completed に更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-IMP-permission-tool-icons --phase 12
```

## 次のPhase

Phase 13: PR作成

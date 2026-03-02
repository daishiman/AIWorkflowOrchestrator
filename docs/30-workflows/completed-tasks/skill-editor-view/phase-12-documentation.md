# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 値                                                  |
| ---------- | --------------------------------------------------- |
| Phase      | 12                                                  |
| 機能名     | TASK-UI-05A-SKILL-EDITOR-VIEW                       |
| 作成日     | 2026-03-01                                          |
| 前提Phase  | Phase 11（手動テスト検証 完了）                     |
| 後続Phase  | Phase 13（PR作成）                                  |
| 使用スキル | aiworkflow-requirements, task-specification-creator |

## 目的

実装予定の SkillEditorView の内容をシステム要件ドキュメントに反映できるよう、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

> **注記（2026-03-02）**: 本タスクは `spec_created` を維持しつつ再監査を実施。`views/SkillEditorView` の実装ファイル実在を確認したが、導線配線と `skill:getFileTree` IPCは未完了のため、未タスク管理と仕様同期を継続する。

## 事前チェック【必須】

Phase 12実行前に、以下の既知の落とし穴を確認し、漏れを防止する:

1. `.claude/rules/06-known-pitfalls.md` の Phase 12 関連項目を読む
   - P1: LOGS.md 2ファイル更新漏れ
   - P2: topic-map.md 再生成忘れ
   - P3: 未タスク管理の3ステップ不完全
   - P4: documentation-changelog への早期「完了」記載
   - P25: LOGS.md 2ファイル更新漏れ（再発）
   - P26: システム仕様書更新遅延
   - P27: topic-map.md 再生成トリガーの判断ミス
   - P28: スキルフィードバックレポート未作成
   - P43: サブエージェントのrate limit中断（3ファイル以下/エージェントに分割）

## 実行タスク

- 技術ドキュメント作成: 実装ガイド（Part 1: 概念的 + Part 2: 技術的）の作成
- コンポーネントドキュメント作成: SkillEditorView のコンポーネントAPI仕様
- IPCドキュメント作成: skill:getFileTree / readFile / writeFile / createFile / deleteFile / listBackups / restoreBackup のAPI仕様
- システムドキュメント更新: aiworkflow-requirements の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録
- スキルフィードバックレポート作成: ワークフロー改善点と技術的教訓の記録

## 参照資料

| 資料名                        | パス                                                                                    | 説明                             |
| ----------------------------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| spec-update-workflow          | `.claude/skills/task-specification-creator/references/spec-update-workflow.md`          | 仕様更新ワークフロー             |
| phase-11-12-guide             | `.claude/skills/task-specification-creator/references/phase-11-12-guide.md`             | 手動テスト・ドキュメント更新詳細 |
| unassigned-task-guidelines    | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク検出・登録手順           |
| technical-documentation-guide | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | Part 1/2作成ガイド               |
| ui-ux-components              | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                 | 更新対象の仕様書                 |
| api-ipc-agent                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                    | `skill:getFileTree` 契約確認     |
| 抽出マトリクス                | `docs/30-workflows/skill-editor-view/aiworkflow-requirements-extraction-matrix.md`      | 必須仕様抽出の正本               |
| 差分反映マトリクス            | `docs/30-workflows/skill-editor-view/branch-diff-reflection-matrix.md`                  | ブランチ差分の反映漏れ防止       |
| 06-known-pitfalls             | `.claude/rules/06-known-pitfalls.md`                                                    | 既知の落とし穴                   |
| 05-task-execution             | `.claude/rules/05-task-execution.md`                                                    | Phase 12チェックリスト           |
| Phase 2 設計成果物            | `outputs/phase-2/architecture-design.md`                                                | 設計仕様                         |
| Phase 5 実装成果物            | `outputs/phase-5/implementation-summary.md`                                             | 実装サマリー                     |
| Phase 6 テスト拡充成果物      | `outputs/phase-6/test-expansion-report.md`                                              | テスト拡充結果                   |
| Phase 7 カバレッジ成果物      | `outputs/phase-7/coverage-report.md`                                                    | カバレッジ結果                   |
| Phase 8 リファクタ成果物      | `outputs/phase-8/refactoring-log.md`                                                    | 品質改善結果                     |
| Phase 9 品質成果物            | `outputs/phase-9/quality-report.md`                                                     | 品質検証結果                     |
| 最終レビュー結果              | `outputs/phase-10/final-review-result.md`                                               | Phase 10成果物                   |
| 手動テスト結果                | `outputs/phase-11/manual-test-result.md`                                                | Phase 11成果物                   |
| 発見課題リスト                | `outputs/phase-11/discovered-issues.md`                                                 | Phase 11成果物                   |

## aiworkflow-requirements 必須仕様の抽出（resource-map起点）

`indexes/resource-map.md` の「UI実装」「API設計」「セキュリティ実装」「テスト実装」から、今回の仕様更新対象を確定する。

| 更新カテゴリ               | 参照先仕様書                                                                      | Task 2 での扱い                          |
| -------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------- |
| UI/UX                      | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`           | Step 1-A/1-Bで更新                       |
| UI機能一覧                 | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`   | Step 1-A/1-Cで更新                       |
| アーキテクチャ             | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`         | Step 2で要否判定                         |
| 状態管理                   | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | Step 2で要否判定                         |
| IPC/API                    | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`              | Step 2で契約差分確認                     |
| API一覧                    | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`              | Step 2でチャネル用途整合確認             |
| 型定義                     | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` | Step 2で契約差分確認                     |
| セキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`      | Step 2で要否判定                         |
| セキュリティ               | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`         | Step 2で要否判定                         |
| エラーハンドリング         | `.claude/skills/aiworkflow-requirements/references/error-handling.md`             | Step 2で要否判定（失敗時契約の差分確認） |
| テスト戦略                 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | Step 1-Aの完了記録へ反映                 |
| アクセシビリティ試験       | `.claude/skills/aiworkflow-requirements/references/testing-accessibility.md`      | Step 1-Aの完了記録へ反映                 |
| 品質基準                   | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | Step 1-Aの完了記録へ反映                 |
| データ整合性（非適用確認） | `.claude/skills/aiworkflow-requirements/references/database-schema.md`            | DBスキーマ更新なしをStep 2で明示         |

### 抽出トレーサビリティ（再現コマンド）

```bash
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "ui-ux-components" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:readFile" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "skill:getFileTree" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "security-electron-ipc" -C 2
node .claude/skills/aiworkflow-requirements/scripts/search-spec.js "quality-requirements" -C 2
```

### 仕様書別 SubAgent 分担（関心ごと分離）

| SubAgent          | 担当仕様書                                                          | 責務                               | 完了条件                        |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------- | ------------------------------- |
| A（UI仕様）       | `ui-ux-components.md`, `ui-ux-feature-components.md`                | UI仕様の完了記録・実装状況更新     | Step 1-A/1-B 完了               |
| B（契約仕様）     | `api-ipc-agent.md`, `interfaces-agent-sdk-skill.md`                 | IPC/型契約の差分確認と更新要否判定 | Step 2 判定記録完了             |
| C（セキュリティ） | `security-electron-ipc.md`, `security-skill-ipc.md`                 | sender検証・入力検証の差分確認     | Step 2 判定記録完了             |
| D（台帳同期）     | `task-workflow.md`, `LOGS.md`（2ファイル）, `SKILL.md`（2ファイル） | 台帳・履歴・索引同期               | Step 1-C/1-D + 検証コマンド完了 |

---

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

#### Part 1: 概念的説明（中学生レベル）

日常の例えを使って SkillEditorView の概念を説明する:

- **例え**: 「SkillEditorView は、本棚から本を取り出してページを開き、中身を書き換えられるノートのような仕組み。左側に本棚（ファイルツリー）、右側にノート（エディター）がある」
- **ファイルツリー**: 「パソコンのフォルダ構造と同じで、フォルダをクリックすると中身が見える。選んだファイルは色が変わって "今ここを見ている" とわかる」
- **編集と保存**: 「ノートに書き込んだらまだ鉛筆書きの状態。保存ボタンを押すとペンで清書されて確定する。書き直す前のノートは自動的にコピーが残る（バックアップ）」
- **未保存マーカー**: 「保存していない変更があるファイルの横に小さな丸い点が付く。"まだ保存してないよ" という目印」
- **読み取り専用**: 「図書館の本は読めるけど書き込めない。それと同じで、他の人が作ったツール（~/.claude/skills/）は見るだけで編集できない。鍵マークが目印」

#### Part 2: 開発者向け技術詳細

- コンポーネントツリー構成（SkillEditorView/components/ の全体像）
- 状態管理設計（useSkillEditor, useFileTree, useUnsavedWarning カスタムフック）
- IPC連携（skill:getFileTree, readFile, writeFile, createFile, deleteFile, listBackups, restoreBackup）
- ファイルツリーのキーボードナビゲーション実装（role="tree" / role="treeitem" / aria-expanded）
- レスポンシブ設計（3ブレークポイント、左右分割 vs ドロワー切替）
- テスト設計（P31/P39/P40 対策込み、fireEvent 使用パターン）

#### IPCドキュメント

`ipc-documentation.md` として以下を記載:

| IPCチャネル         | 引数                                                       | 戻り値                 | 説明                                 |
| ------------------- | ---------------------------------------------------------- | ---------------------- | ------------------------------------ |
| skill:getFileTree   | `skillName: string`                                        | `{ tree: FileNode[] }` | スキル配下のファイルツリーを取得する |
| skill:readFile      | `skillName: string, relativePath: string`                  | `string`               | ファイル内容を読み込む               |
| skill:writeFile     | `skillName: string, relativePath: string, content: string` | `void`                 | ファイル内容を書き込む               |
| skill:createFile    | `skillName: string, relativePath: string, content: string` | `void`                 | 新規ファイルを作成する               |
| skill:deleteFile    | `skillName: string, relativePath: string`                  | `void`                 | ファイルを削除する                   |
| skill:listBackups   | `skillName: string`                                        | `BackupEntry[]`        | バックアップ一覧を取得する           |
| skill:restoreBackup | `skillName: string, backupPath: string`                    | `void`                 | バックアップからファイルを復元する   |

#### コンポーネントドキュメント

`component-documentation.md` として以下を記載:

| コンポーネント       | Props インターフェース                            | 主要動作                                        |
| -------------------- | ------------------------------------------------- | ----------------------------------------------- |
| SkillEditorView      | なし（ルートビュー）                              | 左右分割レイアウト構成、useSkillEditor統合      |
| FileTreePanel        | files, selectedFile, onSelect, onToggle           | ファイルツリー表示、role="tree"、キーボードナビ |
| FileTreeNode         | node, depth, isSelected, isExpanded, onSelect     | 個別ノード表示、lucide-reactアイコン            |
| EditorPanel          | content, language, isReadOnly, onChange           | textarea表示、ステータスバー統合                |
| EditorStatusBar      | lineCount, charCount, language                    | 行数・文字数・言語の動的表示                    |
| EditorToolBar        | isModified, isReadOnly, onSave, onBackup          | 保存ボタン、バックアップメニュートリガー        |
| UnsavedChangesDialog | isOpen, onSaveAndMove, onDiscardAndMove, onCancel | 3選択肢の確認ダイアログ                         |
| BackupMenu           | backups, onRestore                                | タイムスタンプ付きバックアップ一覧、復元操作    |

**成果物**:

- `outputs/phase-12/implementation-guide.md`
- `outputs/phase-12/ipc-documentation.md`
- `outputs/phase-12/component-documentation.md`

---

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照
> **P43対策**: 仕様書更新は3ファイル以下/エージェントに分割する

#### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] `branch-diff-reflection-matrix.md` で本ブランチ差分が 100% トレースされていることを確認
- [ ] `ui-ux-components.md` に「完了タスク」セクションを追加
  - SkillEditorView コンポーネントツリー、テスト結果サマリー、成果物テーブル
- [ ] `ui-ux-feature-components.md` にSkillEditor機能セクションを追加（該当する場合）
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] **aiworkflow-requirements/LOGS.md** にタスク完了エントリを追加
- [ ] **task-specification-creator/LOGS.md** にタスク完了記録を追加（**2ファイル両方必須** — P1, P25対策）
- [ ] **aiworkflow-requirements/SKILL.md** 変更履歴テーブルを更新（P29対策）
- [ ] **task-specification-creator/SKILL.md** 変更履歴テーブルを更新（P29対策）

##### LOGS.md 更新フォーマット

**aiworkflow-requirements/LOGS.md**:

```markdown
## 2026-XX-XX: SkillEditorView実装（TASK-UI-05A-SKILL-EDITOR-VIEW）

| 項目         | 内容                                             |
| ------------ | ------------------------------------------------ |
| タスクID     | TASK-UI-05A-SKILL-EDITOR-VIEW                    |
| 操作         | update-spec                                      |
| 対象ファイル | ui-ux-components.md, ui-ux-feature-components.md |
| 結果         | success                                          |
| 備考         | SkillEditorView（ツール編集エディター）実装      |

### 更新詳細

- **更新**: `references/ui-ux-components.md`
  - SkillEditorView セクション追加
  - コンポーネントツリー記載
```

**task-specification-creator/LOGS.md**:

```markdown
## 2026-XX-XX - SkillEditorView（TASK-UI-05A-SKILL-EDITOR-VIEW）タスク完了

### コンテキスト

- スキル: task-specification-creator
- タスクID: TASK-UI-05A-SKILL-EDITOR-VIEW
- タスク名: SkillEditorView（ツール編集エディター）
- Phase: 1-13

### 成果

- テストカバレッジ: XXテスト全件PASS
- 実装内容:
  - SkillEditorView 新規作成（ファイルツリー + コードエディター）
  - 保存・バックアップ機能
  - 未保存変更警告ダイアログ
  - 読み取り専用モード対応
  - レスポンシブ3ブレークポイント対応

### 結果

- ステータス: success
- 完了日時: 2026-XX-XX
```

#### Step 1-B: 実装状況テーブル更新（該当する場合）

- [ ] `ui-ux-components.md` の実装状況テーブルに SkillEditorView を「完了」として追加
- [ ] 更新対象として列挙した仕様書が実在することを `test -f <path>` で確認

#### Step 1-C: 関連タスクテーブル更新

- [ ] `grep -rn "TASK-UI-05A" .claude/skills/aiworkflow-requirements/references/` で関連仕様書を検索
- [ ] `grep -rn "TASK-UI-05A" .claude/skills/task-specification-creator/references/` で関連仕様書を検索
- [ ] 該当タスクのステータスを「**完了**」に更新

#### Step 1-D: topic-map.md 再生成（**仕様書に変更があれば必ず実行** — P2, P27対策）

- [ ] `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js` を実行して topic-map.md を再生成
- [ ] 再生成されたtopic-map.mdに新規セクションの行番号が正しく反映されていることを確認

#### Step 2: システム仕様更新【必要】

> SkillEditorView は新規ビューコンポーネントのため、システム仕様更新が**必要**。

更新対象ファイル（P43対策: 3ファイル以下/バッチで分割実行）:

**バッチ1（UIコンポーネント仕様）**: 最大3ファイル

| #   | 更新対象ファイル              | 更新内容                                                                     |
| --- | ----------------------------- | ---------------------------------------------------------------------------- |
| 1   | `ui-ux-components.md`         | SkillEditorView セクション追加（コンポーネントツリー、状態管理、IPC連携）    |
| 2   | `ui-ux-feature-components.md` | SkillEditor 機能追加（ファイルツリー、エディター、保存、バックアップ、警告） |
| 3   | `task-workflow.md`            | 残課題テーブル更新、完了タスクセクション追加                                 |

**バッチ2（ログ更新）**: 最大3ファイル

| #   | 更新対象ファイル                     | 更新内容               |
| --- | ------------------------------------ | ---------------------- |
| 1   | `aiworkflow-requirements/LOGS.md`    | タスク完了エントリ追加 |
| 2   | `task-specification-creator/LOGS.md` | タスク完了記録追加     |

**バッチ3（スキル履歴更新）**: 最大3ファイル

| #   | 更新対象ファイル                      | 更新内容             |
| --- | ------------------------------------- | -------------------- |
| 1   | `aiworkflow-requirements/SKILL.md`    | 変更履歴テーブル更新 |
| 2   | `task-specification-creator/SKILL.md` | 変更履歴テーブル更新 |

#### Step 3: IPC契約検証（既存チャネル利用確認）

- [ ] SkillEditorView が利用する IPC チャネル7件の状態が仕様と整合していることを確認
  - 実装済み: `skill:readFile`, `skill:writeFile`, `skill:createFile`, `skill:deleteFile`, `skill:listBackups`, `skill:restoreBackup`
  - 未実装（仕様定義済み）: `skill:getFileTree`（UT-UI-05A-GETFILETREE-001 で管理）
- [ ] Preload 側の呼び出し形式とハンドラ引数形式が一致していることを確認
- [ ] 引数名のセマンティクスが実際の値と一致していることを確認（P45対策）
- [ ] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラに適用されていることを確認

---

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

ドキュメント更新履歴（documentation-changelog.md）を作成し、artifacts.jsonを更新する。

**P4対策: 全Step確認前に「完了」と記載しない**

```bash
# Step 1: ドキュメント更新履歴生成
node .claude/skills/task-specification-creator/scripts/generate-documentation-changelog.js \
  --workflow docs/30-workflows/skill-editor-view

# Step 2: Phase 12完了登録（artifacts.json更新）
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/skill-editor-view \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/ipc-documentation.md:IPCドキュメント,outputs/phase-12/component-documentation.md:コンポーネントドキュメント,outputs/phase-12/spec-update-summary.md:仕様更新サマリー,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート,outputs/phase-12/skill-feedback-report.md:スキルフィードバックレポート"
```

**artifacts.json必須項目**:

- Phase 12のステータスが`completed`に更新されていること
- 全Phase（1-12）の成果物パスが登録されていること
- `qualityMetrics`セクションに品質指標が記録されていること

**スクリプト未存在時の代替手順**:

- 手動で `outputs/phase-12/documentation-changelog.md` を作成
- 手動で `artifacts.json` を更新
- 更新したドキュメントと変更内容を一覧化

#### documentation-changelog.md 記録内容

各Stepの完了結果を**詳細に**記録する（漏れの可視化）:

```markdown
## Step実行結果

| Step | 判定        | 理由                                                               |
| ---- | ----------- | ------------------------------------------------------------------ |
| 1-A  | ✅/❌       | ui-ux-components.md に完了タスクセクション追加 / LOGS.md 2ファイル |
| 1-B  | ✅/該当なし | 実装状況テーブル更新                                               |
| 1-C  | ✅/該当なし | grep結果と更新内容                                                 |
| 1-D  | ✅          | generate-index.js 実行結果                                         |
| 2    | ✅/更新不要 | 更新対象ファイル一覧と変更内容                                     |
| 3    | ✅          | IPC契約一致確認結果                                                |
```

---

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

**検出した未タスクの処理（P3/P38対策 — 3ステップ全完了必須）**:

1. `docs/30-workflows/unassigned-task/` に指示書を作成（`tasks/` 直下ではない — P38対策）
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

**0件の場合でも** `unassigned-task-detection.md` を作成し「検出結果: 0件」と明記する。

**成果物**:

- `outputs/phase-12/unassigned-task-detection.md`（**0件でも必須**）
- `docs/30-workflows/unassigned-task/*.md`（検出時のみ）

---

### Task 5: スキルフィードバックレポート作成【必須】

ワークフロー改善点と技術的教訓を記録する。**改善点がなくても「改善点なし」としてレポートを作成する（省略不可 — P28対策）。**

| セクション         | 記載内容                                             |
| ------------------ | ---------------------------------------------------- |
| ワークフロー改善点 | Phase実行中に発見したワークフロー上の改善提案        |
| 技術的教訓         | 実装中に得られた技術的な知見・注意点                 |
| スキル改善提案     | task-specification-creator/skill-creatorへの改善提案 |
| 新規Pitfall候補    | 06-known-pitfalls.mdに追加すべき新規Pitfall          |

**成果物**: `outputs/phase-12/skill-feedback-report.md`

---

## 検証コマンド順次実行（Step 1-G）

Phase 12 Task 2 の更新後は、以下を**この順序で**実行する:

### 1. 未タスク参照リンク検証

```bash
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js
```

### 2. 索引再生成

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
node .claude/skills/task-specification-creator/scripts/generate-index.js --workflow docs/30-workflows/skill-editor-view --regenerate
git diff --stat -- .claude/skills/*/indexes/topic-map.md .claude/skills/*/indexes/keywords.json
```

### 3. SKILL検証（全3スキル）

```bash
for skill in skill-creator task-specification-creator aiworkflow-requirements; do
  echo "=== $skill ===" && \
  node .claude/skills/skill-creator/scripts/quick_validate.js ".claude/skills/$skill"
done
```

- **合格基準**: Error 0件で合格
- **Warning**: 3段階分類（許容/要監視/要対応）に基づき対応

---

## 成果物

| 成果物                       | パス                                            | 必須 | 説明                       |
| ---------------------------- | ----------------------------------------------- | ---- | -------------------------- |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント  |
| IPCドキュメント              | `outputs/phase-12/ipc-documentation.md`         | ✅   | IPC API仕様                |
| コンポーネントドキュメント   | `outputs/phase-12/component-documentation.md`   | ✅   | コンポーネントAPI仕様      |
| ドキュメント更新履歴         | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                   |
| 仕様更新サマリー             | `outputs/phase-12/spec-update-summary.md`       | ✅   | 仕様書更新の概要           |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`     | ✅   | 改善点（なしでも出力必須） |
| 未完了タスク指示書           | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成             |

## 完了条件

### Task 1: 実装ガイド

- [ ] 実装ガイド（Part 1: 概念的説明 — 日常例え必須）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] IPCドキュメント（ipc-documentation.md）が作成されている
- [ ] コンポーネントドキュメント（component-documentation.md）が作成されている
- [ ] 実装ガイドのテストカテゴリテーブルがPhase 6後の実測値を反映している

### Task 2: システムドキュメント更新

- [ ] **【Step 1-A】** `ui-ux-components.md` に「完了タスク」セクションを追加した
- [ ] **【Step 1-A】** 関連ドキュメントセクションに実装ガイドリンクを追加した
- [ ] **【Step 1-A】** 変更履歴セクションにバージョンを追記した
- [ ] **【Step 1-A】** aiworkflow-requirements/LOGS.md にタスク完了エントリを追加した
- [ ] **【Step 1-A】** task-specification-creator/LOGS.md にタスク完了記録を追加した（P1/P25対策）
- [ ] **【Step 1-A】** aiworkflow-requirements/SKILL.md 変更履歴テーブルを更新した（P29対策）
- [ ] **【Step 1-A】** task-specification-creator/SKILL.md 変更履歴テーブルを更新した（P29対策）
- [ ] **【Step 1-B】** 実装状況テーブルの更新要否を判断し、該当する場合は「完了」に更新した
- [ ] **【Step 1-C】** `grep -rn "TASK-UI-05A" references/` で関連仕様書を検索して更新した
- [ ] **【Step 1-D】** topic-map.md を再生成した（P2/P27対策）
  - 再生成トリガー: セクション追加/削除/更新、行数変更
  - コマンド: `node .claude/skills/aiworkflow-requirements/scripts/generate-index.js`
- [ ] **【Step 2】** システム仕様更新を実施した（新規ビューコンポーネント追加のため必要）
  - `ui-ux-components.md`: SkillEditorView セクション追加
  - `ui-ux-feature-components.md`: SkillEditor 機能追加
  - `api-ipc-agent.md`: `skill:getFileTree` 契約（未実装注記を含む）を同期
- [ ] **【Step 3】** IPC契約検証を実施し、既存チャネル利用の整合性を確認した

### Task 3: ドキュメント更新履歴

- [ ] documentation-changelog.md に更新した全仕様書の変更内容を記録した
- [ ] 各Stepの完了結果を詳細に記録した（漏れの可視化）
- [ ] **全Step確認前に「完了」と記載していない**（P4対策）
- [ ] artifacts.json が更新されている
- [ ] artifacts.json の全完了Phase（1-12）のステータスが completed であること

### Task 4: 未タスク検出

- [ ] 未タスク検出レポートが出力されている【0件でも必須】
- [ ] 検出された未タスクに対して指示書が `docs/30-workflows/unassigned-task/` に作成されている（該当する場合）（P3/P38対策）
- [ ] 検出された未タスクが `task-workflow.md` 残課題テーブルに登録されている（該当する場合）
- [ ] 検出された未タスクの関連仕様書に参照リンクが追加されている（該当する場合）
- [ ] 未タスク指示書の物理ファイル存在を確認した（`ls docs/30-workflows/unassigned-task/` で検証）

### Task 5: スキルフィードバック

- [ ] スキルフィードバックレポートが出力されている【改善点なしでも必須】（P28対策）

### 検証

- [ ] `verify-unassigned-links.js` で `ALL_LINKS_EXIST` を確認した
- [ ] `generate-index.js` で索引を再生成した
- [ ] `quick_validate.js` で3スキル全てが Error 0件であることを確認した
- [ ] **本Phase内の全タスクを100%実行完了**

---

## Phase 12 既知の落とし穴対策チェックリスト

Phase 12 完了前に、以下の全項目を確認する:

| ID  | ポイント                                    | 対策                                                                | 確認 |
| --- | ------------------------------------------- | ------------------------------------------------------------------- | ---- |
| P1  | LOGS.md 2ファイル更新漏れ                   | aiworkflow-requirements + task-specification-creator 両方を同時更新 | [ ]  |
| P2  | topic-map.md 再生成忘れ                     | セクション変更時は必ず `generate-index.js` を実行                   | [ ]  |
| P3  | 未タスク管理の3ステップ不完全               | ①指示書 → ②task-workflow.md登録 → ③関連仕様書リンク                 | [ ]  |
| P4  | documentation-changelogへの早期「完了」記載 | 全Step確認完了後にのみ「完了」を記載                                | [ ]  |
| P25 | LOGS.md 2ファイル更新漏れ（再発）           | Phase 12チェックリストで「2ファイル更新」を明示的にチェック         | [ ]  |
| P26 | システム仕様書更新遅延                      | Phase 12完了時点でシステム仕様書を更新（PRマージを待たない）        | [ ]  |
| P27 | topic-map.md再生成トリガー判断ミス          | 追加だけでなく削除・更新も再生成トリガーに含める                    | [ ]  |
| P28 | スキルフィードバックレポート未作成          | 改善点がなくても「改善点なし」としてレポート作成                    | [ ]  |
| P29 | SKILL.md 変更履歴の更新漏れ                 | LOGS.mdとは別にSKILL.mdの変更履歴テーブルも必ず更新                 | [ ]  |
| P38 | 未タスク配置ディレクトリ間違い              | `unassigned-task/` 配下に配置（`tasks/` 直下ではない）              | [ ]  |
| P43 | サブエージェントのrate limit中断            | 仕様書更新は3ファイル以下/エージェントに分割                        | [ ]  |

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを更新（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

### スキル検証

```bash
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/skill-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/task-specification-creator
node .claude/skills/skill-creator/scripts/quick_validate.js .claude/skills/aiworkflow-requirements
```

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 事前チェック（06-known-pitfalls.md 確認）
2. Task 1: 実装ガイド作成（Part 1 + Part 2 + IPCドキュメント + コンポーネントドキュメント）
3. Task 2 バッチ1: UIコンポーネント仕様更新（ui-ux-components.md, ui-ux-feature-components.md, task-workflow.md）
4. Task 2 バッチ2: 関連仕様・ログ更新（LOGS.md×2, SKILL.md×2）
5. Task 2 Step 1-D: topic-map.md 再生成
6. Task 2 Step 3: IPC契約検証
7. Task 3: documentation-changelog.md + artifacts.json 更新
8. Task 4: 未タスク検出
9. Task 5: スキルフィードバックレポート
10. 検証コマンド実行（Step 1-G）
11. 完了条件の全項目チェック

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/skill-editor-view --phase 12
```

## 次の Phase

Phase 13: PR作成

# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                  |
| ------ | ------------------- |
| Phase  | 12                  |
| 機能名 | TASK-WCE-MONACO-001 |
| 作成日 | 2026-02-03          |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

## サブフェーズ

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート | 対象読者         | 内容                                  |
| ------ | ---------------- | ------------------------------------- |
| Part 1 | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）    |
| Part 2 | 開発者・技術者   | 技術的な詳細（スキーマ・API・使用例） |

**Part 1 概念説明の例**:

```markdown
## Monaco Editor選択範囲取得とは

### 日常の例え話

テキストエディタでテキストを選択するのは、本を読んでいて重要な部分に蛍光ペンでマーカーを引くようなものです。
「どこからどこまでマーカーを引いたか」という情報を、別の場所（AIアシスタント）に伝える仕組みがこの機能です。

### なぜ必要か

AIに「この部分をリファクタリングして」とお願いするとき、「この部分」がどこかを正確に伝える必要があります。
そのために、選択した範囲の「開始位置」「終了位置」「選択したテキスト」を取得する機能が必要です。
```

**Part 2 技術詳細の例**:

```markdown
## 技術的詳細

### インターフェース定義

interface TextSelection {
startLine: number; // 開始行（1始まり）
startColumn: number; // 開始列（1始まり）
endLine: number; // 終了行（1始まり）
endColumn: number; // 終了列（1始まり）
selectedText: string; // 選択されたテキスト
}

### IPC通信フロー

1. Renderer: chatEditAPI.getEditorSelection()呼び出し
2. Preload: ipcRenderer.invoke('chat-edit:get-selection')
3. Main: handleGetSelection実行
4. 戻り値: TextSelection | null
```

### Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**Step 1: タスク完了記録【必須】**

- [ ] 該当する仕様書に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加
- [ ] task-specification-creator/LOGS.mdにタスク完了記録を追加
- [ ] topic-map.mdに新規セクションエントリを追加（該当する場合）

**更新対象ファイル**:

| ファイル                           | 更新内容                              |
| ---------------------------------- | ------------------------------------- |
| api-ipc-agent.md                   | chat-edit:get-selectionの実装完了記録 |
| security-electron-ipc.md           | chatEditAPIセキュリティ完了記録       |
| aiworkflow-requirements/LOGS.md    | タスク完了エントリ追加                |
| task-specification-creator/LOGS.md | タスク完了記録追加                    |

**Step 2: システム仕様更新【条件付き】**

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |

**本タスクの場合**:

- TextSelection型は既存定義を再利用 → インターフェース追加不要
- chat-edit:get-selectionは既存定義済み → チャンネル追加不要
- **結論**: Step 2は「更新なし」と記録

### Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Phase 12完了登録
node scripts/complete-phase.js \
  --workflow docs/30-workflows/TASK-WCE-MONACO-001 \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク指示書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項               |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

**スコープ外項目（元タスク指示書より）**:

| 項目                     | 未タスク化要否 |
| ------------------------ | -------------- |
| マルチカーソル対応       | 要検討         |
| 選択範囲のハイライト表示 | 要検討         |
| エディタへの書き戻し機能 | 別タスク       |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 参照資料の確認
2. Task 1: 実装ガイド作成（Part 1 + Part 2）
3. Task 2: システムドキュメント更新（Step 1 + Step 2）
4. Task 3: ドキュメント更新履歴 & artifacts.json更新
5. Task 4: 未タスク検出
6. 成果物の作成・配置
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/TASK-WCE-MONACO-001 --phase 12
```

## 次のPhase

Phase 13: PR作成

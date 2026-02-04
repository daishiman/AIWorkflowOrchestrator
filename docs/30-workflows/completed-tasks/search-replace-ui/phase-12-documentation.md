# Phase 12: ドキュメント更新

## メタ情報

| 項目      | 値                     |
| --------- | ---------------------- |
| Phase     | 12                     |
| 機能名    | search-replace-ui      |
| タスクID  | task-imp-search-ui-001 |
| 関連Issue | #366                   |
| 作成日    | 2026-02-04             |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

## 実行タスク

- 技術ドキュメント作成: 実装ガイドの作成
- システムドキュメント更新: aiworkflow-requirements等の更新
- ドキュメント更新履歴作成: 変更履歴の記録
- 未タスク検出: 残課題の検出と記録

---

## Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

| パート     | 対象読者         | 内容                                                          |
| ---------- | ---------------- | ------------------------------------------------------------- |
| **Part 1** | 初学者・非技術者 | 概念的な説明（中学生でもわかる版）                            |
| **Part 2** | 開発者・技術者   | 技術的な詳細（インターフェース、API、コード例、エラーコード） |

### Part 1（中学生レベル）の必須要件

- 日常生活での例え話を**必ず**含める（例：「検索機能は本の索引のようなもの」）
- 専門用語は使わない（使う場合は即座に説明）
- 「なぜ必要か」を先に説明してから「何をするか」を説明

**Part 1の記載内容例**:

```markdown
## 検索機能ってなに？

想像してください。あなたの部屋に1000冊の本があって、「猫」という言葉が出てくるページを全部探したいとします。
1冊ずつ全ページをめくっていたら、何日もかかりますよね？

検索機能は、コンピューターがその作業を一瞬でやってくれる機能です。

### なぜ必要？

プログラマーは毎日たくさんのコードファイルを扱います。
「このエラーメッセージが出る場所はどこだろう？」と思ったとき、
検索機能があれば、何千ものファイルから一瞬で見つけることができます。
```

### Part 2（技術者レベル）の必須要件

- インターフェース/型定義（TypeScript）を含める
- APIシグネチャと使用例を記載
- エラーハンドリングとエッジケースを説明
- 設定可能なパラメータと定数を一覧化

**Part 2の記載内容**:

| 項目                   | 参照先                                            |
| ---------------------- | ------------------------------------------------- |
| SearchService API      | `aiworkflow-requirements: api-internal-search.md` |
| SearchOptions型        | `aiworkflow-requirements: ui-ux-search-panel.md`  |
| EditorInstanceメソッド | `aiworkflow-requirements: ui-ux-search-panel.md`  |
| エラーコード           | INVALID_PATTERN, TIMEOUT, FILE_READ_ERROR等       |

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

**4サブステップで実行**（全て確認必須）:

### Step 1-A: タスク完了記録【必須・全タスク】

- [ ] 該当する仕様書（`ui-ux-search-panel.md`）に「完了タスク」セクションを追加
- [ ] 関連ドキュメントセクションに実装ガイドリンクを追加
- [ ] 変更履歴セクションにバージョンを追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリを追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録を追加
- [ ] `topic-map.md` に新規セクションエントリを追加（該当する場合）

**完了タスクセクションテンプレート**:

```markdown
## 完了タスク

### タスク: task-imp-search-ui-001（2026-02-04完了）

| 項目       | 内容                                                   |
| ---------- | ------------------------------------------------------ |
| タスクID   | task-imp-search-ui-001                                 |
| ステータス | **完了**                                               |
| テスト数   | ユニット110件 + E2E 12件                               |
| カバレッジ | Line 80%+, Branch 60%+                                 |
| 成果物     | E2Eテスト、グローバルショートカット統合、IPCプロバイダ |
```

### Step 1-B: 実装状況テーブル更新【必須】

| 確認対象ファイル         | 確認項目                 |
| ------------------------ | ------------------------ |
| `ui-ux-search-panel.md`  | 検索パネル機能の実装状況 |
| `api-internal-search.md` | SearchService実装状況    |
| `interfaces-editor.md`   | EditorInstance実装状況   |

### Step 1-C: 関連タスクテーブル更新【必須】

関連する仕様書内の「関連タスク」テーブルのステータスを更新:

| 仕様書                  | タスクID               | 更新内容              |
| ----------------------- | ---------------------- | --------------------- |
| `ui-ux-search-panel.md` | task-imp-search-ui-001 | ステータス → **完了** |

### Step 2: システム仕様更新【条件付き】

**更新要否の判断基準**:

| 更新必要                    | 更新不要                   |
| --------------------------- | -------------------------- |
| 新規インターフェース/型追加 | 内部実装の変更のみ         |
| 既存インターフェース変更    | リファクタリング（IF不変） |
| 新規定数/設定値追加         | バグ修正（仕様変更なし）   |
| アーキテクチャパターン追加  | テスト追加のみ             |

**本タスクの判断**:

- グローバルショートカット統合: 実装パターン → 更新必要（ui-ux-search-panel.mdに統合手順追加）
- IPCプロバイダ: 新規実装 → 更新必要（api-internal-search.mdにIPCチャンネル追加）
- E2Eテスト追加: テストのみ → 更新不要

---

## Task 3: ドキュメント更新履歴 & artifacts.json更新【必須】

```bash
# Step 1: ドキュメント更新履歴生成
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/search-replace-ui

# Step 2: Phase 12完了登録（artifacts.json更新）
node scripts/complete-phase.js \
  --workflow docs/30-workflows/search-replace-ui \
  --phase 12 \
  --artifacts "outputs/phase-12/implementation-guide.md:実装ガイド,outputs/phase-12/documentation-changelog.md:ドキュメント更新履歴,outputs/phase-12/unassigned-task-detection.md:未タスク検出レポート"
```

**スクリプト未存在時の代替手順**:

| スクリプト                            | 代替手順                                                    |
| ------------------------------------- | ----------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動で `outputs/phase-12/documentation-changelog.md` を作成 |
| `complete-phase.js`                   | 手動で `artifacts.json` のPhase 12ステータスを更新          |

---

## Task 4: 未タスク検出【必須】

以下のソースから未完了タスクを検出する:

| #   | ソース                 | 確認項目                           |
| --- | ---------------------- | ---------------------------------- |
| 1   | 元タスク仕様書         | 「スコープ外」として明示された項目 |
| 2   | Phase 3レビュー結果    | MINOR判定の指摘事項                |
| 3   | Phase 10レビュー結果   | MINOR判定の指摘事項                |
| 4   | Phase 11手動テスト結果 | スコープ外の発見事項・改善提案     |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント        |

```bash
# 未タスク検出スクリプト
node scripts/detect-unassigned-tasks.js --scan apps/desktop/src/features/search --output .tmp/unassigned-candidates.json
```

**0件でも出力必須**: 未タスクが検出されなかった場合も、`unassigned-task-detection.md`に「0件」と明記する。

---

## アーキテクチャ層別ドキュメント（AIが判断）

実装ガイドPart 2（技術的詳細）では、タスクの性質に応じて以下の層別にドキュメントを作成する：

| 層                 | ドキュメント内容                               | 更新対象                                      |
| ------------------ | ---------------------------------------------- | --------------------------------------------- |
| Renderer Process   | SearchPanel/WorkspaceSearchPanelコンポーネント | `ui-ux-search-panel.md`                       |
| Main Process       | 検索サービス、IPCハンドラ                      | `api-internal-search.md`, `architecture-*.md` |
| IPC通信            | search:workspace等のチャンネル定義             | `api-internal-search.md`, `interfaces-*.md`   |
| エラーハンドリング | INVALID_PATTERN, TIMEOUT等のエラーコード       | `error-handling.md`                           |

---

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（0件でも出力）   |
| 未完了タスク指示書   | `docs/30-workflows/unassigned-task/*.md`        | 条件 | 検出時のみ作成            |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】システム仕様書に「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】関連ドキュメントセクションに実装ガイドリンクを追加した**
- [ ] **【Task 2 Step 1-A】変更履歴セクションにバージョンを追記した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-B】実装状況テーブルを更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルのステータスを「完了」に更新した**
- [ ] **【Task 2 Step 2】システム仕様更新の要否を判断し、documentation-changelog.mdに記録した**
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] artifacts.jsonが更新されている
- [ ] **本Phase内の全タスク（Task 1〜4）を100%実行完了**

---

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. Task 1: 実装ガイド作成（Part 1 + Part 2）
2. Task 2 Step 1-A: タスク完了記録
3. Task 2 Step 1-B: 実装状況テーブル更新
4. Task 2 Step 1-C: 関連タスクテーブル更新
5. Task 2 Step 2: システム仕様更新（条件付き）
6. Task 3: ドキュメント更新履歴 & artifacts.json更新
7. Task 4: 未タスク検出

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスク（Task 1〜4）を100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/search-replace-ui --phase 12
```

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                            | 代替手順                                                                                                             |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `generate-documentation-changelog.js` | 手動でdocumentation-changelog.mdを作成（`outputs/phase-12/documentation-changelog.md`の形式に従う）                  |
| `complete-phase.js`                   | 手動でartifacts.jsonを作成（参照: `docs/30-workflows/completed-tasks/TASK-4-1-ipc-channels/outputs/artifacts.json`） |
| `detect-unassigned-tasks.js`          | 手動で各Phaseのレビュー結果・発見課題を確認し、unassigned-task-detection.mdを作成                                    |
| `validate-phase-output.js`            | 手動で成果物の存在と完了条件を確認                                                                                   |

---

## 次のPhase

Phase 13: PR作成

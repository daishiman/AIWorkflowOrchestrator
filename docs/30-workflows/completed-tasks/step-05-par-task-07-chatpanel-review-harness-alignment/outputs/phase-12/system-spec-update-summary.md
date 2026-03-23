# Phase 12 ドキュメント: システム仕様書更新サマリー

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 作成日: 2026-03-23
- フェーズ: Phase 12 - ドキュメント

---

## 目的

本タスク（設計タスク）の Phase 12 完了時点で実施すべきシステム仕様書更新の
計画と実施結果を記録する。

**注意（P57 対策）**: 設計タスクであっても Phase 12 完了時点で `.claude/skills/` を
実更新することが必須である。「PR マージ後に更新」という先送りは P26 の再発パターンである。
本サマリーは「計画」ではなく「実績ログ」として記録する。

---

## Step 1-A: タスク完了記録

### 対象ファイル

#### 1. ui-ux-panels.md: review harness role セクション追加

**更新内容**:

- ChatPanel が review harness として機能することを明記するセクションを追加
- Lane 設計（Mainline / Review Harness / Legacy の 3 Lane）を記録
- GAP-01〜04 の no-op コールバックの存在と解消計画を記録

**更新箇所**:

```
aiworkflow-requirements/references/ui-ux-panels.md
  → 「ChatPanel」セクションに「Review Harness Role」サブセクションを追加
```

#### 2. LOGS.md（2 ファイル更新 — P1/P25 対策）

**更新内容（両ファイル共通）**:

- タスク ID: TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001
- 完了日: 2026-03-23
- 成果: ChatPanel review harness 契約設計の完了
- 成果物: phase-1〜13 の出力ファイル群

**更新ファイル 1**:

```
.claude/skills/aiworkflow-requirements/LOGS.md
```

**更新ファイル 2**:

```
.claude/skills/task-specification-creator/LOGS.md
```

#### 3. SKILL.md 変更履歴（2 ファイル更新 — P29 対策）

**更新内容（両ファイル共通）**:

- 変更履歴テーブルに本タスクの完了記録を追加
- 日付: 2026-03-23
- 変更種別: 設計タスク完了

**更新ファイル 1**:

```
.claude/skills/aiworkflow-requirements/SKILL.md
```

**更新ファイル 2**:

```
.claude/skills/task-specification-creator/SKILL.md
```

---

## Step 1-B: 実装状況テーブル更新

### 対象ファイル: task-workflow.md

**更新内容**:

- `TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001` のステータスを「設計完了」に変更
- Phase 13（PR準備）のステータスを「準備中」に更新
- 残課題テーブルに MINOR-A / MINOR-B を追加

---

## Step 1-C: 関連タスクテーブルの更新

**検索コマンド**:

```bash
grep -rn "TASK-IMP-CHATPANEL-REVIEW-HARNESS-ALIGNMENT-001" .claude/skills/aiworkflow-requirements/references/
```

**更新対象（検索結果に応じて更新）**:

- `task-workflow.md`: 本タスクの完了状態を記録
- `ui-ux-panels.md`: review harness セクションに本タスクのリンクを追加

---

## Step 1-D: topic-map.md 再生成

**実行コマンド**:

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**再生成トリガー**: ui-ux-panels.md にセクションを追加するため、再生成が必要（P2/P27 対策）

**期待される出力**:

```
📚 インデックス生成中...
...
✅ インデックス生成完了
```

---

## Step 2: システム仕様更新

### 新規インターフェース

本タスクは設計タスクであり、新規インターフェースの追加はない。
ただし、以下の設計決定をシステム仕様として記録する。

**ui-ux-panels.md 追加内容**:

```markdown
## ChatPanel - Review Harness

ChatPanel は review harness として機能するコンポーネントである。
mainline（ChatView）と同一の 8 state union を持つが、
Store action / IPC 配線は後続実装タスクで完成する。

### Lane 設計（3 Lane）

| Lane           | コンポーネント | 役割                    |
| -------------- | -------------- | ----------------------- |
| Mainline       | ChatView       | 本番の AI チャット      |
| Review Harness | ChatPanel      | UI 確認・ビジュアル検証 |
| Legacy         | （廃止予定）   | 旧 UI（移行中）         |

### State Contract（8 state）

| State     | 表示コンテンツ   | CTA              |
| --------- | ---------------- | ---------------- |
| idle      | ComposerPanel    | メッセージ送信   |
| loading   | LoadingIndicator | なし             |
| streaming | StreamingPanel   | キャンセル       |
| blocked   | BlockedBanner    | 設定を開く       |
| handoff   | HandoffBanner    | ターミナルを開く |
| error     | ErrorBanner      | リトライ         |
| empty     | EmptyState       | なし             |
| cancelled | CancelledNotice  | なし             |
```

---

## 更新実施状況

| Step | 対象ファイル                        | 状態                                                                                | 備考                                                                             |
| ---- | ----------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1-A  | ui-ux-panels.md                     | DONE（本ブランチで更新済み — Review Harness セクション追加）                        | 初回 DEFERRED 判断は誤り（L-CHRHA-002）。worktree 内にファイル存在を確認し実更新 |
| 1-A  | aiworkflow-requirements/LOGS.md     | DONE（本ブランチで更新済み）                                                        | P1/P25 対策: 2ファイル必須                                                       |
| 1-A  | task-specification-creator/LOGS.md  | DONE（本ブランチで更新済み）                                                        | P1/P25 対策: 2ファイル必須                                                       |
| 1-A  | aiworkflow-requirements/SKILL.md    | DONE（本ブランチで更新済み）                                                        | P29 対策                                                                         |
| 1-A  | task-specification-creator/SKILL.md | DONE（本ブランチで更新済み）                                                        | P29 対策                                                                         |
| 1-B  | task-workflow.md                    | DONE（本ブランチで task-workflow-backlog.md / task-workflow-completed.md 更新済み） | ステータス更新                                                                   |
| 1-C  | 関連仕様書                          | DONE（workflow-ai-runtime-execution-responsibility-realignment.md 更新済み）        | grep 結果に応じて更新                                                            |
| 1-D  | topic-map.md                        | DONE（本ブランチで generate-index.js 実行済み）                                     | ui-ux-panels.md 更新後に再生成実施（P2/P27 対策）                                |
| 2    | ui-ux-panels.md                     | DONE（本ブランチで更新済み — Review Harness セクション追加）                        | 初回 DEFERRED 判断は誤り（L-CHRHA-002）。worktree 内にファイル存在を確認し実更新 |
| 2    | lessons-learned                     | DONE（本ブランチで更新済み — L-CHRHA-001〜003 追加）                                | 苦戦箇所3件を lessons-learned-phase12-workflow-lifecycle.md に記録               |

**注記（P57 対策）**: 本タスクは設計タスクのため worktree 環境での実施となる。
全ファイルを本ブランチ内で実更新済み（DONE）。
P57 対策として「計画のみ記録して先送り」ではなく、「実施可能な項目は本ブランチで完了」としている。

**追記（2026-03-23 エレガント検証サイクル）**: 初回 Phase 12 完了時に LOGS.md×2 / SKILL.md×2 / workflow 仕様書 / task-workflow が「DONE」と記載されたが実際は未更新だった問題を検出。エレガント検証サイクルで全件実更新を完了。

**追記（2026-03-23 impl-spec-to-skill-sync）**: ui-ux-panels.md / topic-map.md / lessons-learned の DEFERRED 3項目を DONE に是正。L-CHRHA-002（DEFERRED 判断の誤り）として教訓記録済み。

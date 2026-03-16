# Phase 12: ドキュメント更新

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 12                                             |
| Phase名    | ドキュメント更新                               |
| タスクID   | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION |
| 前提Phase  | Phase 11（手動テスト）                         |
| 後続Phase  | Phase 13（PR作成）                             |
| ステータス | pending                                        |
| 作成日     | 2026-03-16                                     |
| 機能名     | conversation-ipc-handler-registration          |

## 目的

実装ガイド・システム仕様書更新・未タスク検出・スキルフィードバックを通じて、
本タスクの知見をプロジェクトに定着させる。
**5 タスク全て必須**（漏れは 05-task-execution.md の Phase 12 違反となる）。

## 実行タスク

- Task 12-1: 実装ガイド作成（Part 1 概念説明 + Part 2 技術詳細）
- Task 12-2: システムドキュメント更新（Step 1-A〜1-D + Step 2）
- Task 12-3: documentation-changelog.md 作成（P4 対策: 全 Step 完了後に記録）
- Task 12-4: 未タスク検出レポート作成（0 件でも出力必須）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

## 参照資料

### システム仕様テーブル

| 参照資料                | パス                                                                           | 内容                                |
| ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------- |
| architecture-overview   | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`   | Electronアーキテクチャ、IPC登録一覧 |
| database-implementation | `.claude/skills/aiworkflow-requirements/references/database-implementation.md` | DB初期化パターン                    |
| security-electron-ipc   | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`   | IPCセキュリティ原則                 |
| error-handling          | `.claude/skills/aiworkflow-requirements/references/error-handling.md`          | エラーハンドリングパターン          |

### コードベース参照

| ファイル                  | パス                                                                             | 備考                        |
| ------------------------- | -------------------------------------------------------------------------------- | --------------------------- |
| IPC登録ハブ（修正済み）   | `apps/desktop/src/main/ipc/index.ts`                                             | Section 13 を含む最終実装   |
| Conversationハンドラ      | `apps/desktop/src/main/ipc/conversationHandlers.ts`                              | 7 チャンネル実装            |
| LOGS.md (1)               | `.claude/skills/aiworkflow-requirements/LOGS.md`                                 | P1/P25 対策 — 2 ファイル目  |
| LOGS.md (2)               | `.claude/skills/task-specification-creator/LOGS.md`                              | P1/P25 対策 — 2 ファイル目  |
| SKILL.md (1)              | `.claude/skills/aiworkflow-requirements/SKILL.md`                                | P29 対策 — 変更履歴更新     |
| SKILL.md (2)              | `.claude/skills/task-specification-creator/SKILL.md`                             | P29 対策 — 変更履歴更新     |
| unassigned-task-detection | `.claude/skills/aiworkflow-requirements/references/unassigned-task-detection.md` | 件数・ステータス更新        |
| architecture-overview     | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md`     | IPC ハンドラ登録一覧        |
| database-implementation   | `.claude/skills/aiworkflow-requirements/references/database-implementation.md`   | ConversationRepository 追記 |
| topic-map.md              | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                    | P2/P27 対策 — 再生成必須    |
| Phase 11 手動テスト結果   | `outputs/phase-11/manual-test-result.md`                                         | Task 12-3 の情報源          |

### 漏れやすいポイント（既知の落とし穴）

| 落とし穴 | 内容                                                     | 対策                                                     |
| -------- | -------------------------------------------------------- | -------------------------------------------------------- |
| P1/P25   | LOGS.md は 2 ファイルあり、片方の更新忘れ                | 両方（aiworkflow + task-spec）を必ず更新                 |
| P2/P27   | topic-map.md 再生成を忘れる                              | 仕様書変更があれば必ず `node generate-index.js`          |
| P29      | SKILL.md 変更履歴の更新漏れ                              | LOGS.md と同時に 2 ファイル更新                          |
| P3/P38   | 未タスク指示書の配置先が `unassigned-task/` でない       | `docs/30-workflows/TASK-FIX-.../unassigned-task/` に配置 |
| P4       | documentation-changelog に全 Step 完了前に「完了」と書く | 全 Task 完了後の最終ステップで記録                       |

## 実行手順

---

### Task 12-1: 実装ガイド作成

成果物: `outputs/phase-12/implementation-guide.md`

#### Part 1: 概念説明（中学生レベル）

**お店の受付** で例えて conversation IPC を説明する。

---

**conversation IPC ハンドラとは？**

たとえば、あなたが図書館に行ったとき、受付の人に「この本を借りたい」「この本を返したい」と
お願いしますよね。受付の人はそのお願いを聞いて、作業を代わりにやってくれます。

conversation IPC ハンドラは、**アプリの受付係** のようなものです。

画面（Renderer）から「会話を作りたい」「会話の一覧を見せて」というお願いが届いたとき、
受付係（IPC ハンドラ）がそのお願いを聞いて、裏側のデータベースに記録したり、
記録された情報を取り出したりします。

今回の修正では、この受付係の登録が漏れていて、お願いが届いても誰も応答できない状態に
なっていました。`registerAllIpcHandlers()` という「受付係を全員配置する処理」に、
conversation の受付係（`registerConversationHandlers()`）を追加したのがこの修正です。

**なぜ必要なのか？**

お店の受付がいないと、お客さんのお願いが宙ぶらりんになってしまいます。
同じように、IPC ハンドラが登録されていないと、画面からの操作が永遠に応答を
待ち続けてしまいます。正しく受付係を配置することで、会話の作成・表示・削除などが
スムーズに動くようになります。

**もし受付係が来られない（DB 故障）ときは？**

DB（データの倉庫）が壊れていて受付係が来られないときでも、代わりの人（フォールバックハンドラ）が
「今は対応できません（DB_NOT_AVAILABLE）」と丁寧に答えるようになっています。

---

#### Part 2: 技術詳細（開発者向け）

**DB 初期化コードと Section 13 の追加パターン**

```typescript
// apps/desktop/src/main/ipc/index.ts — Section 13
import Database from "better-sqlite3";
import { registerConversationHandlers } from "./conversationHandlers";
import { ConversationRepository } from "../repositories/conversationRepository";

// Section 13: Conversation IPC ハンドラ登録
const CONVERSATION_DB_SCHEMA = `
  CREATE TABLE IF NOT EXISTS chat_sessions (...);
  CREATE TABLE IF NOT EXISTS chat_messages (...);
`;

let conversationRegistered = false;
try {
  const conversationDb = new Database(conversationDbPath);
  conversationDb.exec(CONVERSATION_DB_SCHEMA);
  const conversationRepository = new ConversationRepository(conversationDb);
  registerConversationHandlers(conversationRepository);
  conversationRegistered = true;
  successCount++;
} catch (error) {
  failures.push({ section: 13, handler: "conversationHandlers", error });
  registerConversationFallbackHandlers();
}
```

**フォールバックパターン**

```typescript
function registerConversationFallbackHandlers(): void {
  const channels = [
    IPC_CHANNELS.CONVERSATION_CREATE,
    IPC_CHANNELS.CONVERSATION_LIST,
    IPC_CHANNELS.CONVERSATION_GET,
    IPC_CHANNELS.CONVERSATION_UPDATE,
    IPC_CHANNELS.CONVERSATION_DELETE,
    IPC_CHANNELS.CONVERSATION_ADD_MESSAGE,
    IPC_CHANNELS.CONVERSATION_SEARCH,
  ];
  for (const channel of channels) {
    safeRegister(channel, async () => ({
      success: false,
      error: {
        code: "DB_NOT_AVAILABLE",
        message: "Conversation database is not available",
      },
    }));
  }
}
```

**TypeScript 型定義（主要インターフェース）**

```typescript
// ConversationRepository の主要メソッド
interface IConversationRepository {
  create(params: { title: string; userId: string }): Promise<Conversation>;
  list(params: {
    userId: string;
  }): Promise<{ conversations: Conversation[]; total: number }>;
  get(params: { id: string }): Promise<Conversation | null>;
  update(params: {
    id: string;
    data: Partial<Conversation>;
  }): Promise<Conversation>;
  delete(params: { id: string }): Promise<void>;
  addMessage(params: { sessionId: string; message: Message }): Promise<Message>;
  search(params: { userId: string; query: string }): Promise<Conversation[]>;
}
```

---

### Task 12-2: システムドキュメント更新

#### Step 1-A: タスク完了記録（P1/P25/P29 対策）

以下の 4 ファイルを更新する。**2 ファイル LOGS.md の同時更新を必ず確認**（P1/P25）。

| ファイル                                             | 更新内容                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/LOGS.md`     | TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION 完了記録を追加 |
| `.claude/skills/task-specification-creator/LOGS.md`  | 同上（P1/P25 — 2 ファイル目）                                 |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルに本タスク完了エントリを追加（P29）           |
| `.claude/skills/task-specification-creator/SKILL.md` | 同上（P29 — 2 ファイル目）                                    |

LOGS.md の追記フォーマット:

```markdown
## 2026-03-16

### TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION: Conversation IPC ハンドラ登録修正

- architecture-overview.md: IPC ハンドラ登録一覧に conversation ハンドラを追加
- database-implementation.md: ConversationRepository 初期化パターンを追記
- 修正ファイル: apps/desktop/src/main/ipc/index.ts（Section 13 追加、1 ファイルのみ）
```

#### Step 1-B: 実装状況テーブル更新

`architecture-overview.md` の IPC ハンドラ登録一覧テーブルに conversation エントリを追加する。

| ハンドラ                       | Section | 登録状況 | 備考                       |
| ------------------------------ | ------- | -------- | -------------------------- |
| registerConversationHandlers() | 13      | ✅ 完了  | DB 初期化 + フォールバック |

#### Step 1-C: 関連タスクテーブル更新

```bash
grep -rn "TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION" .claude/skills/
```

上記コマンドで検索し、関連仕様書の「関連タスク」テーブルに完了ステータスを反映する。

#### Step 1-D: topic-map.md 再生成（P2/P27 対策）

```bash
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

**重要**: 仕様書に変更があった場合は必ず再生成する（追加・削除・変更すべて対象）。
`git diff --stat -- .claude/skills/aiworkflow-requirements/indexes/` で再生成を確認すること。

#### Step 2: database-implementation.md への ConversationRepository 追記

`database-implementation.md` の「リポジトリ一覧」または「DB 初期化パターン」セクションに
以下を追記する。

```markdown
### ConversationRepository

- **初期化タイミング**: `registerAllIpcHandlers()` の Section 13
- **DBファイル**: `conversationDbPath`（アプリデータディレクトリ）
- **テーブル**: `chat_sessions`, `chat_messages`
- **フォールバック**: DB 初期化失敗時 → `registerConversationFallbackHandlers()` が
  全 7 チャンネルに `DB_NOT_AVAILABLE` レスポンスを返すハンドラを登録
```

---

### Task 12-3: documentation-changelog.md 作成

成果物: `outputs/phase-12/documentation-changelog.md`

**重要（P4 対策）**: 全 Task 完了後の最終ステップとして記録する。
実行前に「完了」と記載しないこと。

記録内容:

```markdown
## documentation-changelog

更新日: 2026-03-16
タスクID: TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION

### Step 1-A: LOGS.md 2ファイル更新

- [ ] aiworkflow-requirements/LOGS.md 更新（実行結果）
- [ ] task-specification-creator/LOGS.md 更新（実行結果）

### Step 1-A: SKILL.md 2ファイル更新

- [ ] aiworkflow-requirements/SKILL.md 変更履歴追加（実行結果）
- [ ] task-specification-creator/SKILL.md 変更履歴追加（実行結果）

### Step 1-B: architecture-overview.md 更新

- [ ] IPC 登録一覧に conversation ハンドラ追加（実行結果）

### Step 1-C: 関連タスクテーブル更新

- [ ] grep 検索結果（0件 or 更新ファイル一覧）

### Step 1-D: topic-map.md 再生成

- [ ] generate-index.js 実行ログ（実行結果）

### Step 2: database-implementation.md 更新

- [ ] ConversationRepository セクション追記（実行結果）

### Task 12-4: 未タスク検出レポート

- [ ] 検出件数: N件（実行後に記載）

### Task 12-5: スキルフィードバックレポート

- [ ] 改善点数: N件（実行後に記載）
```

---

### Task 12-4: 未タスク検出レポート作成

成果物: `outputs/phase-12/unassigned-task-report.md`

**0 件でも出力必須**。検出した未タスクがある場合は **3 ステップ全て** 実施する（P3/P38）:

1. `docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

検出ソース:

| ソース                       | 確認方法                                                                   |
| ---------------------------- | -------------------------------------------------------------------------- |
| Phase 3 MINOR 指摘           | `phase-3-design-review.md` を参照                                          |
| Phase 10 MINOR 指摘          | `outputs/phase-10/final-review-result.md` を参照                           |
| Phase 11 発見課題            | `outputs/phase-11/manual-test-result.md` を参照                            |
| コードコメント（TODO/FIXME） | `grep -rn "TODO\|FIXME" apps/desktop/src/main/ipc/conversationHandlers.ts` |

レポートフォーマット:

```markdown
## 未タスク検出レポート

検出日: 2026-03-16
対象タスク: TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION

### 検出された未タスク

（0件 or 以下の通り）

| ID  | ソース | 内容 | 優先度 | 指示書パス |
| --- | ------ | ---- | ------ | ---------- |
| -   | -      | なし | -      | -          |

### unassigned-task-detection.md 更新

件数: 0件
ステータス: 確認完了（2026-03-16）
```

`unassigned-task-detection.md` の件数・ステータスも更新すること。
再評価クローズした未タスクがある場合は `gh issue close <number>` も実行する（P56）。

---

### Task 12-5: スキルフィードバックレポート作成

成果物: `outputs/phase-12/skill-feedback-report.md`

**改善点なしでも出力必須**（P28 対策）。

```markdown
## スキルフィードバックレポート

作成日: 2026-03-16
対象タスク: TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION

### ワークフロー改善点

| 観点     | 内容 | 改善案 | 優先度 |
| -------- | ---- | ------ | ------ |
| （なし） | -    | -      | -      |

### 既知の落とし穴への対処

| 落とし穴 | 本タスクでの発生有無 | 対処結果                 |
| -------- | -------------------- | ------------------------ |
| P1/P25   | -                    | LOGS.md 2ファイル更新済  |
| P2/P27   | -                    | topic-map.md 再生成済    |
| P29      | -                    | SKILL.md 2ファイル更新済 |
| P4       | -                    | 全 Step 完了後に記録     |

### 次タスクへの引き継ぎ事項

（特になし or 以下の通り）
```

---

## IPC機能開発時の追加更新対象

IPC ハンドラ追加タスクでは以下 7 ファイルが更新対象となりやすい。

| ファイル                   | 内容                      | 今回の更新                              |
| -------------------------- | ------------------------- | --------------------------------------- |
| architecture-overview.md   | IPC ハンドラ登録一覧      | 必須                                    |
| database-implementation.md | DB 初期化・リポジトリ一覧 | 必須（新規 DB のため）                  |
| security-electron-ipc.md   | IPC セキュリティ設計      | 不要（既存設計のまま）                  |
| error-handling.md          | エラーコード一覧          | 不要（DB_NOT_AVAILABLE は既存パターン） |
| interfaces-\*.md           | TypeScript 型定義         | 不要（新規インターフェースなし）        |
| api-ipc-\*.md              | IPC チャンネル仕様        | 確認必要                                |
| task-workflow.md           | 残課題・完了タスク記録    | 必須                                    |

## 成果物

| 成果物                       | パス                                                       | 内容                                   |
| ---------------------------- | ---------------------------------------------------------- | -------------------------------------- |
| Phase 12 仕様書              | `docs/30-workflows/TASK-FIX-.../phase-12-documentation.md` | 本ドキュメント                         |
| 実装ガイド                   | `outputs/phase-12/implementation-guide.md`                 | Part 1（概念説明）+ Part 2（技術詳細） |
| documentation-changelog      | `outputs/phase-12/documentation-changelog.md`              | 全 Step の実行結果記録（P4 対策）      |
| 未タスク検出レポート         | `outputs/phase-12/unassigned-task-report.md`               | 検出件数・指示書パス（0 件でも必須）   |
| スキルフィードバックレポート | `outputs/phase-12/skill-feedback-report.md`                | 改善点・引き継ぎ事項（なしでも必須）   |

## 完了条件

- [ ] Task 12-1: 実装ガイド（Part 1 + Part 2）を `outputs/phase-12/implementation-guide.md` に作成した
- [ ] Task 12-2 Step 1-A: LOGS.md **2 ファイル**を更新した（P1/P25）
- [ ] Task 12-2 Step 1-A: SKILL.md **2 ファイル**の変更履歴を更新した（P29）
- [ ] Task 12-2 Step 1-B: `architecture-overview.md` の IPC 登録一覧を更新した
- [ ] Task 12-2 Step 1-C: 関連タスクテーブルを検索・更新した
- [ ] Task 12-2 Step 1-D: `topic-map.md` を再生成した（P2/P27）
- [ ] Task 12-2 Step 2: `database-implementation.md` に ConversationRepository を追記した
- [ ] Task 12-3: 全 Task 完了後に `documentation-changelog.md` を作成した（P4）
- [ ] Task 12-4: 未タスク検出レポートを作成した（0 件でも必須、P3 の 3 ステップ）
- [ ] Task 12-5: スキルフィードバックレポートを作成した（改善点なしでも必須）

## 次のPhase

`docs/30-workflows/TASK-FIX-CONVERSATION-IPC-HANDLER-REGISTRATION/phase-13-pr-creation.md`

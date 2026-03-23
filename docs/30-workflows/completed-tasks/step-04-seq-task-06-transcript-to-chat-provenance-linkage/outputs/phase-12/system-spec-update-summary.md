# Phase 12: システム仕様更新サマリー

> タスクID: TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001
> 確定日: 2026-03-22

## 目的

本設計タスク完了に伴い更新すべきシステム仕様書・ログファイル・インデックスの対象を明示する。

> **P57対策**: 設計タスクであってもPhase 12完了時点で実ファイル更新を行う。「計画文」ではなく「実績ログ」のみを残すこと。

---

## 更新対象一覧

### 1. workflow正本の更新先

| ファイル                                                                       | 更新内容                                                                 | 更新タイミング                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------ |
| `docs/30-workflows/step-04-seq-task-06-transcript-to-chat-provenance-linkage/` | 本タスクのワークフロー成果物ディレクトリ（本文書が存在するディレクトリ） | Phase 12完了時点で一式作成済み |

### 2. task-workflow.md の更新先

| 更新項目             | 更新内容                                                                           |
| -------------------- | ---------------------------------------------------------------------------------- |
| 完了タスクセクション | TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001（設計フェーズ）の完了記録を追加 |
| 残課題テーブル       | M-1（SelectedFile source対応）・M-2（TranscriptSession型）を未タスクとして登録     |

> **更新ファイルパス**: `.claude/skills/aiworkflow-requirements/references/task-workflow.md`（または該当するworkflow管理ファイル）

### 3. LOGS.md 2ファイル更新先（P1/P25対策：2ファイル必須）

| ファイル                                            | 更新内容                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `.claude/skills/aiworkflow-requirements/LOGS.md`    | 本タスク（TASK-IMP-TRANSCRIPT-TO-CHAT-PROVENANCE-LINKAGE-001）の設計フェーズ完了記録 |
| `.claude/skills/task-specification-creator/LOGS.md` | 本タスク仕様書の作成・確定記録                                                       |

### 4. SKILL.md 変更履歴更新先（P29対策）

| ファイル                                             | 更新内容                                                      |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| `.claude/skills/aiworkflow-requirements/SKILL.md`    | 変更履歴テーブルにTranscript Provenance Linkage設計完了を記録 |
| `.claude/skills/task-specification-creator/SKILL.md` | 変更履歴テーブルに本タスク仕様書の作成を記録                  |

### 5. topic-map.md の再生成（P2対策）

```bash
# 実行コマンド（P51対策：実行ログで確認すること）
node .claude/skills/aiworkflow-requirements/scripts/generate-index.js
```

> **確認方法**: `git diff --stat -- .claude/skills/aiworkflow-requirements/indexes/` で変更が生じていることを確認する

---

## 新規インターフェース・型定義（Step 2: システム仕様更新）

以下の新規インターフェースが確定したため、関連仕様書への記載が必要：

### TranscriptProvenance 型

```typescript
interface TranscriptProvenance {
  sourceType: "range" | "last-output" | "session";
  sharedAt: string; // ISO 8601
  sessionTitle: string;
  messageRange?: {
    startLine: number;
    endLine: number;
  };
  originalContent: string; // 最大10,000文字
}
```

**更新対象仕様書**:

- `interfaces-workspace-chat.md`（またはWorkspaceChatMessage型定義ファイル）
- `ui-ux-transcript-panel.md`（UI/UX仕様書）

### 状態遷移図

`TranscriptVisible -> RangeSelected -> ShareReady -> ChatAttached/ChatPasted -> ProvenanceVisible`

**更新対象仕様書**:

- `arch-state-management.md`（状態管理アーキテクチャ）

---

## IPC契約確認（Step 3）

本タスクはIPC修正タスクを含むため、実装フェーズ完了後に以下を確認すること：

- [ ] `ipc-contract-checklist.md` Phase 1-6 を実施
- [ ] ハンドラ引数形式とPreload側の呼び出し形式が一致
- [ ] 引数名のセマンティクスが実際の値と一致（P45対策）
- [ ] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）

> **注記**: 設計タスクのため、IPC実装前の時点では仕様書上の契約定義のみ確認。実装後に再度確認すること。

---

## 更新実績記録（P4対策：全Step完了後に記入）

| Step                                     | 対象                                | 状態     | 完了日         |
| ---------------------------------------- | ----------------------------------- | -------- | -------------- |
| 1-A: タスク完了記録（LOGS.md 2ファイル） | aiworkflow-requirements/LOGS.md     | 完了     | 2026-03-22     |
| 1-A: タスク完了記録（LOGS.md 2ファイル） | task-specification-creator/LOGS.md  | 完了     | 2026-03-22     |
| 1-A: SKILL.md変更履歴                    | aiworkflow-requirements/SKILL.md    | 完了     | 2026-03-22     |
| 1-A: SKILL.md変更履歴                    | task-specification-creator/SKILL.md | 完了     | 2026-03-22     |
| 1-D: topic-map.md再生成                  | indexes/topic-map.md                | 完了     | 2026-03-22     |
| 2: システム仕様更新                      | interfaces-workspace-chat.md 等     | DEFERRED | 実装フェーズ後 |
| 3: IPC契約確認                           | ipc-contract-checklist.md           | DEFERRED | 実装フェーズ後 |

> **実績**: Step 1-A と Step 1-D は 2026-03-22 に実更新完了。conflict marker 残骸（`||||||| 77abcbc7f`）の解消も同時に実施。Step 2/3 は設計タスクのため実装フェーズへ DEFERRED。

# Phase 12: ドキュメント更新

## メタ情報

| 項目     | 値                                    |
| -------- | ------------------------------------- |
| Phase    | 12                                    |
| 機能名   | task-fix-15-1-execute-handler-routing |
| タスクID | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING |
| 作成日   | 2026-02-09                            |
| 状態     | **未着手**                            |

## 目的

実装した内容をシステム要件ドキュメントに反映し、技術的な理解を促進するドキュメントを作成し、未完了タスクを検出・記録する。

---

## Task 1: 実装ガイド作成【必須】

### Part 1: 概念的説明（中学生レベル）

#### SKILL_EXECUTEハンドラーのルーティング修正とは？

**日常生活での例え:**

レストランで注文することを想像してください。

- **修正前**: ウェイター（ハンドラー）が注文を受けると、厨房（SkillService）に伝えますが、厨房は「注文を受けました」というメモだけ返して、実際には何も料理しませんでした。本当のシェフ（SkillExecutor）は別の場所にいて、料理を作る準備は万端なのに、誰も呼びに行かないのです。

- **修正後**: ウェイター（ハンドラー）が注文を受けると、まず厨房で「この注文は有効か？」を確認（バリデーション）してから、本当のシェフ（SkillExecutor）に料理を作ってもらいます。

**技術的な意味:**

私たちのアプリには「スキル」という機能があり、AIを使って様々なタスクを実行できます。しかし、ユーザーがスキル実行ボタンを押しても、AIを呼び出すコード（SkillExecutor）まで処理が届いていませんでした。

今回の修正で、ボタンを押す → バリデーション → AIを呼び出す、という正しい流れになりました。

### Part 2: 技術的詳細

#### 修正前のコードフロー

```
SKILL_EXECUTE handler (skillHandlers.ts)
  → skillService.executeSkill(skillId, params)
    → SkillService.executeSkill()
      → return `Skill "${skill.name}" executed successfully`  // スタブ
```

#### 修正後のコードフロー

```
SKILL_EXECUTE handler (skillHandlers.ts)
  → skillService.validateSkill(skillId)  // バリデーションは保持
  → _skillExecutorInstance.execute(request, skill)
    → callSDKQuery()
      → SDK query() API  // 実際のAI呼び出し
```

#### 主要な変更点

| 変更箇所                         | 変更内容                                       |
| -------------------------------- | ---------------------------------------------- |
| `skillHandlers.ts` SKILL_EXECUTE | SkillService.executeSkill()呼び出しを削除      |
| `skillHandlers.ts` SKILL_EXECUTE | SkillExecutor.execute()呼び出しを追加          |
| `SkillService.ts`                | executeSkill()メソッドを削除/deprecate         |
| バリデーションロジック           | ハンドラー内で直接実行するか、別メソッドに分離 |

#### インターフェース定義

```typescript
// SkillExecutor.execute() のシグネチャ
interface SkillExecutor {
  execute(
    request: SkillExecuteRequest,
    skill: Skill,
  ): Promise<SkillExecuteResult>;

  abort(executionId: string): void;

  getStatus(executionId: string): ExecutionStatus;
}

// リクエスト型
interface SkillExecuteRequest {
  skillId: string;
  params?: Record<string, unknown>;
  streaming?: boolean;
}
```

#### 責務分離

| コンポーネント   | 責務                                            |
| ---------------- | ----------------------------------------------- |
| skillHandlers.ts | IPCリクエスト受信、バリデーション委譲、実行委譲 |
| SkillService     | スキル管理（CRUD）、バリデーション              |
| SkillExecutor    | SDK統合、スキル実行、ストリーミング、リトライ   |

#### 3.2 エラーハンドリング

| エラーケース       | エラーコード            | リトライ | 対応                     |
| ------------------ | ----------------------- | -------- | ------------------------ |
| スキル未検出       | SKILL_NOT_FOUND         | 不可     | バリデーション段階で検出 |
| 未インポートスキル | SKILL_NOT_IMPORTED      | 不可     | インポート状態確認       |
| SDK呼び出し失敗    | EXECUTION_FAILED        | 不可     | エラー詳細をログ出力     |
| 同時実行数超過     | MAX_CONCURRENT_EXCEEDED | 待機後可 | 5件上限                  |
| 権限拒否           | PERMISSION_DENIED       | 不可     | PreToolUseフック拒否     |
| タイムアウト       | TIMEOUT                 | 不可     | 5分超過時                |
| 認証エラー         | AUTHENTICATION_ERROR    | 不可     | APIキー未設定/無効       |

#### 3.3 設定可能なパラメータ

| パラメータ | 型                      | デフォルト | 説明                           |
| ---------- | ----------------------- | ---------- | ------------------------------ |
| skillId    | string                  | -          | 必須。実行するスキルのID       |
| params     | Record<string, unknown> | {}         | スキル実行パラメータ           |
| timeout    | number                  | 300000ms   | SDK呼び出しタイムアウト（5分） |

#### 3.4 定数一覧

```typescript
const SKILL_EXECUTOR_CONSTANTS = {
  MAX_CONCURRENT_EXECUTIONS: 5,
  PERMISSION_TIMEOUT_MS: 300000, // 5分
  DEFAULT_RETRY_CONFIG: {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
  },
};
```

---

## Task 2: システムドキュメント更新【必須】

> **重要**: 詳細手順は `references/spec-update-workflow.md` を参照

### Step 1-A: タスク完了記録【必須・全タスク】

| 項目     | 更新内容                                             | ステータス |
| -------- | ---------------------------------------------------- | ---------- |
| 仕様書   | interfaces-agent-sdk-executor.mdに「完了タスク」追加 | [ ] 未完了 |
| 仕様書   | security-skill-ipc.mdに「完了タスク」追加            | [ ] 未完了 |
| LOGS.md  | aiworkflow-requirements/LOGS.mdにエントリ追加        | [ ] 未完了 |
| LOGS.md  | task-specification-creator/LOGS.mdに記録追加         | [ ] 未完了 |
| SKILL.md | aiworkflow-requirements/SKILL.md変更履歴更新         | [ ] 未完了 |
| SKILL.md | task-specification-creator/SKILL.md変更履歴更新      | [ ] 未完了 |

**LOGS.mdエントリ例:**

```markdown
## 2026-02-XX: TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING 完了

### タスク情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| タスクID   | TASK-FIX-15-1-EXECUTE-HANDLER-ROUTING      |
| タスク名   | SKILL_EXECUTEハンドラーのSkillExecutor委譲 |
| ステータス | **完了**                                   |
| テスト数   | N（自動）+ 7（手動）                       |

### 変更概要

- skillHandlers.tsのSKILL_EXECUTEハンドラーをSkillExecutor経由に修正
- SkillService.executeSkill()を削除
- バリデーションとSDK実行の責務を分離
```

### Step 1-B: 実装状況テーブル更新【実装完了時は必須】

| 項目                             | 確認結果                                    |
| -------------------------------- | ------------------------------------------- |
| interfaces-agent-sdk-executor.md | SKILL_EXECUTE実装ステータスを「完了」に更新 |

### Step 1-C: 関連タスクテーブル更新【該当する場合は必須】

```bash
# 検索コマンド
grep -rn "TASK-FIX-15-1" .claude/skills/aiworkflow-requirements/references/
grep -rn "SKILL_EXECUTE" .claude/skills/aiworkflow-requirements/references/
```

| 確認ファイル                     | 検索結果                          |
| -------------------------------- | --------------------------------- |
| interfaces-agent-sdk-executor.md | SKILL_EXECUTEハンドラー定義あり   |
| security-skill-ipc.md            | スキル実行IPCセキュリティ定義あり |
| skill-system-conflict-report.md  | #15として本タスクが記録されている |

### Step 1-D: topic-map.md 再生成

```bash
# topic-map.md再生成コマンド
node .claude/skills/aiworkflow-requirements/generate-index.js
```

### Step 2: システム仕様更新【条件付き】

**更新要否判断:**

| 変更内容                              | 更新必要か | 理由                        |
| ------------------------------------- | ---------- | --------------------------- |
| SKILL_EXECUTEハンドラーの実行パス変更 | YES        | IPCハンドラーの動作仕様変更 |
| SkillService.executeSkill()削除       | YES        | インターフェース変更        |
| SkillExecutor.execute()呼び出し追加   | YES        | 呼び出しチェーンの変更      |

**更新対象:**

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor.md`
  - SKILL_EXECUTEハンドラーの実行フロー図を更新
  - SkillService.executeSkill()削除を反映

- `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`
  - スキル実行時のセキュリティフローを更新

---

## Task 3: ドキュメント更新履歴【必須】

### documentation-changelog.md

| 更新対象ドキュメント             | 変更種別 | 変更内容                                    |
| -------------------------------- | -------- | ------------------------------------------- |
| interfaces-agent-sdk-executor.md | 更新     | SKILL_EXECUTE実行フロー変更、ステータス更新 |
| security-skill-ipc.md            | 更新     | スキル実行セキュリティフロー更新            |
| LOGS.md (両方)                   | 追加     | TASK-FIX-15-1完了エントリ                   |
| SKILL.md (両方)                  | 追加     | 変更履歴エントリ                            |
| topic-map.md                     | 再生成   | インデックス更新                            |

---

## Task 4: 未タスク検出【必須】

### 検出ソース確認

| #   | ソース                 | 確認結果                                                                                                             |
| --- | ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Phase 3レビュー結果    | 確認対象                                                                                                             |
| 2   | Phase 10レビュー結果   | 確認対象                                                                                                             |
| 3   | Phase 11手動テスト結果 | 確認対象                                                                                                             |
| 4   | 各Phase成果物          | TODO/FIXME/将来対応を検索                                                                                            |
| 5   | コードベース           | `grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/main/ipc/skillHandlers.ts apps/desktop/src/main/services/skill/` |

### 関連タスク確認

本タスク完了後に確認すべき関連タスク:

| タスクID                              | 関連性                             | ステータス |
| ------------------------------------- | ---------------------------------- | ---------- |
| TASK-FIX-7-1-EXECUTE-SKILL-DELEGATION | 本タスクと統合可能として言及       | 確認必要   |
| TASK-FIX-5-1                          | 引数形式の統一（本タスク後に対応） | 確認必要   |

### 未タスク検出レポート出力

**出力先**: `docs/30-workflows/unassigned-task/` （SKILL.md v9.48.0準拠）

**0件でも出力必須**: 検出結果が0件の場合も、以下の形式でレポートを出力:

```markdown
# 未タスク検出レポート - TASK-FIX-15-1

## 検出結果: 0件

### 検出ソース確認

- Phase 3レビュー: 追加要件なし
- Phase 10レビュー: MINOR指摘なし
- Phase 11手動テスト: 改善提案なし
- コードコメント: TODO/FIXME なし
```

**検出件数: 確認後に記載**

未タスクが検出された場合:

1. `docs/30-workflows/unassigned-task/` に指示書作成
2. `task-workflow.md` 残課題テーブルに登録
3. 関連仕様書に参照リンク追加

---

## 統合テスト連携（必須）

Phase 1〜11で実施した統合テストの最終確認を記録:

| テスト項目     | 実行結果 | 備考                          |
| -------------- | -------- | ----------------------------- |
| ユニットテスト | 全PASS   | skillHandlers.execute.test.ts |
| 統合テスト     | 全PASS   | IPC接続テスト完了             |
| 手動テスト     | 完了     | Phase 11で確認済み            |

---

## アーキテクチャ層別ドキュメント

| 層                 | ドキュメント内容                         | 更新対象                         |
| ------------------ | ---------------------------------------- | -------------------------------- |
| Main Process       | ハンドラー→SkillExecutor呼び出しチェーン | interfaces-agent-sdk-executor.md |
| IPC通信            | skill:executeチャンネルの動作仕様        | security-skill-ipc.md            |
| エラーハンドリング | バリデーションエラーの処理フロー         | error-handling.md (該当する場合) |

---

## 成果物

| 成果物               | パス                                          | 必須 | ステータス |
| -------------------- | --------------------------------------------- | ---- | ---------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`    | YES  | [ ] 未完了 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md` | YES  | [ ] 未完了 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`  | YES  | [ ] 未完了 |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】interfaces-agent-sdk-executor.mdに「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】security-skill-ipc.mdに「完了タスク」セクションを追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/LOGS.mdにタスク完了エントリを追加した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/LOGS.mdにタスク完了記録を追加した**
- [ ] **【Task 2 Step 1-A】aiworkflow-requirements/SKILL.md変更履歴を更新した**
- [ ] **【Task 2 Step 1-A】task-specification-creator/SKILL.md変更履歴を更新した**
- [ ] **【Task 2 Step 1-B】interfaces-agent-sdk-executor.md実装ステータスを更新した**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルをGrepで確認し更新した**
- [ ] **【Task 2 Step 1-D】topic-map.mdを再生成した**
- [ ] **【Task 2 Step 2】interfaces-agent-sdk-executor.mdの実行フロー図を更新した**
- [ ] **【Task 2 Step 2】security-skill-ipc.mdのセキュリティフローを更新した**
- [ ] **未タスク検出レポートが出力されている（0件でも必須）**
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] **本Phase内の全タスクを100%実行完了**

---

## フォールバック手順

スクリプトが存在しない場合の代替手順:

| スクリプト                 | 代替手順                           |
| -------------------------- | ---------------------------------- |
| `generate-index.js`        | 手動でtopic-map.mdを確認・更新     |
| `validate-phase-output.js` | 手動で成果物の存在と完了条件を確認 |

---

## 次のPhase

Phase 13: PR作成

# Phase 12: ドキュメント更新

## メタ情報

| 項目   | 値                          |
| ------ | --------------------------- |
| Phase  | 12                          |
| 機能名 | TASK-FIX-1-1-TYPE-ALIGNMENT |
| 作成日 | 2026-02-04                  |

## 目的

実装した型統合をドキュメントに反映し、未完了タスクを検出・記録する。

## 実行タスク

### Task 1: 実装ガイド作成【必須】

**2パート構成**の実装ガイドを作成する:

#### Part 1: 概念的説明（中学生レベル）

**日常の例え話**:

> スキルの型定義は「契約書」のようなものです。
>
> たとえば、宅配便を送るとき、「送り主」「届け先」「中身」を決まったフォーマットで書きますよね。
> これと同じで、スキルがメッセージを送るときも「誰が」「何を」「いつ」送ったかを決まった形式で書く必要があります。
>
> 今回の修正は、2種類あった「契約書のフォーマット」を1種類に統一したということです。
> これにより、「どのフォーマットを使えばいいの？」という混乱がなくなりました。

#### Part 2: 技術的詳細

**統合後の型定義**:

```typescript
// packages/shared/src/types/skill.ts

/**
 * ストリーミングメッセージ種別
 * @see specification.md §5.1
 */
export type SkillStreamMessageType =
  | "assistant"    // AIからのテキスト応答
  | "tool_use"     // ツール使用開始
  | "tool_result"  // ツール使用結果
  | "status"       // 実行状態変更
  | "error";       // エラー発生

/**
 * ストリーミングメッセージ（Discriminated Union）
 */
export type SkillStreamMessage =
  | { type: "assistant"; content: AssistantMessageContent; ... }
  | { type: "tool_use"; content: ToolUseMessageContent; ... }
  // ...
```

**使用例**:

```typescript
import { SkillStreamMessage } from "@repo/shared";

function handleMessage(message: SkillStreamMessage) {
  switch (message.type) {
    case "assistant":
      // TypeScriptが自動的にcontent.textを認識
      console.log(message.content.text);
      break;
    case "tool_use":
      // content.toolNameが使用可能
      console.log(message.content.toolName);
      break;
    // ...
  }
}
```

### Task 2: システムドキュメント更新【必須】

#### Step 1-A: タスク完了記録【必須】

- [ ] `interfaces-agent-sdk-skill.md` に「完了タスク」セクション追加
- [ ] 関連ドキュメントセクションに実装ガイドリンク追加
- [ ] 変更履歴セクションにバージョン追記
- [ ] `aiworkflow-requirements/LOGS.md` にタスク完了エントリ追加
- [ ] `task-specification-creator/LOGS.md` にタスク完了記録追加
- [ ] `topic-map.md` に新規セクションエントリ追加（該当する場合）

#### Step 1-B: 実装状況テーブル更新

- [ ] `interfaces-agent-sdk-skill.md` の実装状況テーブルで「型統一」を「完了」に更新

#### Step 1-C: 関連タスクテーブル更新

- [ ] 関連仕様書の「関連タスク」テーブルでTASK-FIX-1-1のステータスを「完了」に更新

#### Step 2: システム仕様更新【該当なし】

このタスクは既存型の統合であり、新規インターフェース追加なし。
「documentation-changelog.md」に「インターフェース更新なし」と記録。

### Task 3: ドキュメント更新履歴【必須】

```bash
# 更新履歴生成（スクリプトがない場合は手動作成）
node scripts/generate-documentation-changelog.js --workflow docs/30-workflows/skill-import-agent-system/TASK-FIX-1-1-TYPE-ALIGNMENT
```

### Task 4: 未タスク検出【必須】

| #   | ソース                 | 確認項目                      |
| --- | ---------------------- | ----------------------------- |
| 1   | Phase 3レビュー結果    | MINOR判定の指摘事項           |
| 2   | Phase 10レビュー結果   | MINOR判定の指摘事項           |
| 3   | Phase 11手動テスト結果 | スコープ外の発見事項          |
| 4   | 各Phase成果物          | 「将来対応」「TODO」「FIXME」 |
| 5   | コードベース           | TODO/FIXME/HACK/XXXコメント   |

```bash
# 未タスク検出
node scripts/detect-unassigned-tasks.js --scan packages/shared/src/types --output .tmp/unassigned-candidates.json
```

## アーキテクチャ層別ドキュメント

| 層      | ドキュメント内容             | 更新対象                        |
| ------- | ---------------------------- | ------------------------------- |
| Shared  | 型定義の統合方針、使用ガイド | `interfaces-agent-sdk-skill.md` |
| IPC通信 | チャンネル型定義の一貫性     | `api-ipc-agent.md`              |

## 成果物

| 成果物               | パス                                            | 必須 | 説明                      |
| -------------------- | ----------------------------------------------- | ---- | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`      | ✅   | 概念的+技術的ドキュメント |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   | ✅   | 更新履歴                  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` | ✅   | 検出結果（なしでも出力）  |

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明）が作成されている
- [ ] 実装ガイド（Part 2: 技術的詳細）が作成されている
- [ ] **【Task 2 Step 1-A】タスク完了記録が追加されている**
- [ ] **【Task 2 Step 1-B】実装状況テーブルが更新されている**
- [ ] **【Task 2 Step 1-C】関連タスクテーブルが更新されている（該当する場合）**
- [ ] **【Task 2 Step 2】システム仕様更新の要否が判断・記録されている**
- [ ] **【Task 2】aiworkflow-requirements/LOGS.md にエントリ追加**
- [ ] **【Task 2】task-specification-creator/LOGS.md にエントリ追加**
- [ ] ドキュメント更新履歴が出力されている
- [ ] **未タスク検出レポートが出力されている**【必須】
- [ ] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 13: PR作成

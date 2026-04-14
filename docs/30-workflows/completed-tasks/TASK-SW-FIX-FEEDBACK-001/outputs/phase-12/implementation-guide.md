# Phase 12: 実装ガイド

## メタ情報

| 項目       | 内容                     |
| ---------- | ------------------------ |
| Phase      | 12                       |
| Phase名    | ドキュメント更新         |
| タスクID   | TASK-SW-FIX-FEEDBACK-001 |
| 作成日     | 2026-04-14               |
| ステータス | completed                |

---

## Part 1: 初学者・中学生レベルの概念説明

### テーマ: 「一覧がすぐ更新されること」と「失敗したときに止まりすぎないことを分けて考える」

---

#### 「新しいスキルを作ったら、すぐに一覧に出てくる」仕組み

ゲームで新しいアイテムを手に入れたとき、アイテムボックスにすぐ追加されますよね。「倉庫に入れたのに、アイテム一覧には古いものしか出ない」では困ります。

このアプリでも同じことが起きていました。新しいスキル（ツールの設定ファイルみたいなもの）を作っても、一覧画面が更新されなかったのです。

**今のコードでは**、スキルを作る処理が終わったあと、自動で「一覧を更新する係（`fetchSkills`）」が呼ばれます。そのあと「いま作ったスキルを選ぶ係（`selectSkillByName`）」も続けて動きます。棚札を更新する担当がすでにいる状態です。

---

#### 「ルート変更が起きたときは、一覧更新しない」仕組み

お届け物の配達中に「やっぱり別の場所に届けてください」と連絡が来たとします。このとき「元の住所の表札を更新する」必要はありません。届け先が変わったのだから、そちらの準備をすればよいのです。

このアプリでは「terminal_handoff（別の処理に引き継ぎ）」というメッセージが来たとき、スキル一覧の更新をしないで、引き継ぎの案内だけを出すようになっています。

---

#### 「空なら失敗画面に分ける仕組み」

宅配ボックスに荷物が届いたか確認して、届いていなければ「受け取り案内」を出すようなものです。

スキルを作る処理が終わったとき、結果として「スキルのファイル場所（`skillPath`）」が返ってきます。この値が「空っぽ（null）」だった場合、「失敗しました」という画面を出します。届いていないのに「受取完了」と表示しない、という判断です。

---

#### 「成功ヘッダーの条件表示」

答案が返ってくる前に「合格おめでとう！」と表示するのはおかしいですよね。

このアプリでは、`skillPath` がちゃんと届いている（null ではない）ときだけ「スキルの骨格を生成しました」という成功メッセージが表示されます。結果が空のときには、成功メッセージは出ません。

---

## Part 2: 開発者・技術者レベルの技術的詳細

### 1. current contract の固定

#### CompleteStepProps

```typescript
interface CompleteStepProps {
  skillPath?: string | null; // null のみが失敗ケース
  onRetry?: () => void; // オプショナル（未指定でも安全）
  // その他のPropsは今回のスコープ外
}
```

| `skillPath` 値     | 判定       | 表示される UI                              |
| ------------------ | ---------- | ------------------------------------------ |
| `null`             | 失敗ケース | エラーUI（「スキルの生成に失敗しました」） |
| `undefined`        | 正常パス   | 成功ヘッダー（skillPath 表示なし）         |
| `""` (空文字)      | 正常パス   | 成功ヘッダー（skillPath 表示なし）         |
| `"/path/to/skill"` | 正常パス   | 成功ヘッダー + スキルパス表示              |

**根拠**: `CompleteStep.tsx` L117 — `if (skillPath === null)`（厳密等値）

---

### 2. SkillLifecyclePanel current flow

```
handleExecutePlan (L1036-L1124)
  │
  ├── executePlan IPC 呼び出し
  │     │
  │     ├── isExecuteTerminalHandoff() = true
  │     │   └── setHandoffGuidance → early return
  │     │       （fetchSkills / selectSkillByName は呼ばれない）
  │     │
  │     ├── errorResponse あり
  │     │   └── setGenerationError → return
  │     │       （fetchSkills は呼ばれない）
  │     │
  │     └── 成功パス
  │         ├── loadVerifyDetail()
  │         ├── await fetchSkills()       ← AC-1
  │         └── selectSkillByName(name)   ← AC-1
```

---

### 3. follow-up 候補の分離

| 項目               | 内容                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| issue 8            | `fetchSkills()` 非ブロッキング化                                                                         |
| 現行挙動           | `await fetchSkills()` 失敗 → `generationError` セット → early return。`selectSkillByName` は実行されない |
| 改善案             | `fetchSkills` 失敗を non-blocking 化し `selectSkillByName` は継続実行                                    |
| **current task**   | **対象外。docs-only / no-op で完了**                                                                     |
| follow-up 変更対象 | `SkillLifecyclePanel.tsx` + `SkillLifecyclePanel.llm-generation.test.tsx`                                |
| follow-up 対象外   | `CompleteStep.tsx`                                                                                       |

---

### 4. evidence mapping

| AC   | evidence ファイル                                                                                  | テストID        |
| ---- | -------------------------------------------------------------------------------------------------- | --------------- |
| AC-1 | `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.llm-generation.test.tsx` | U-8             |
| AC-2 | 同上                                                                                               | U-13            |
| AC-3 | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`                | TC-FEEDBACK-004 |
| AC-4 | 同上                                                                                               | TC-FEEDBACK-005 |
| AC-5 | 同上                                                                                               | TC-FEEDBACK-006 |

---

### 5. Consumer Contract & IPC Compatibility

| 確認項目                     | 結果                                    |
| ---------------------------- | --------------------------------------- |
| IPC インターフェースの変更   | **なし（N/A）**                         |
| public API の変更            | **なし**                                |
| `CompleteStepProps` の変更   | **なし**（current contract の固定のみ） |
| `SkillLifecyclePanel` の変更 | **なし**（docs-only / no-op）           |
| 下位互換性への影響           | **なし**                                |

---

### 6. output parity

| ファイル                 | 状態                  |
| ------------------------ | --------------------- |
| `artifacts.json`         | Phase 12 完了後に更新 |
| `outputs/artifacts.json` | Phase 12 完了後に作成 |
| `phase-13`               | `blocked` として維持  |

# Phase 3: 設計レビュー — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値              |
| --------- | --------------- |
| Phase番号 | 3               |
| 機能名    | conversation-ui |
| タスクID  | TASK-SDK-SC-02  |
| 作成日    | 2026-04-02      |
| 依存Phase | Phase 2（設計） |

## 目的

Phase 2 の設計が要件・依存関係・整合性の観点で正しいかを4条件で検証する。

## 実行タスク

### Task 3-1: 矛盾なしの検証

**検証項目**: 各質問タイプで UI が正しく切り替わり、矛盾する表示が発生しないこと

| 検証ポイント                   | 期待する動作                                                            | 状態 |
| ------------------------------ | ----------------------------------------------------------------------- | ---- |
| `type=single_select` のとき    | ChoiceButton リスト + 末尾に「その他（自由入力）」を常時表示            | OK   |
| `type=multi_select` のとき     | ChoiceButton リスト（複数選択）+ 末尾に「その他（自由入力）」を常時表示 | OK   |
| `type=free_text` のとき        | FreeTextInput のみ表示（isSecret=false）、ChoiceButton は表示しない     | OK   |
| `type=secret` のとき           | FreeTextInput のみ表示（isSecret=true）、ChoiceButton は表示しない      | OK   |
| `type=confirm` のとき          | 「はい」「いいえ」ChoiceButton のみ表示、FreeTextInput は表示しない     | OK   |
| 「その他（自由入力）」未選択時 | FreeTextInput は非表示（isFreeTextVisible=false）                       | OK   |
| 「その他（自由入力）」選択時   | FreeTextInput が展開表示される（isFreeTextVisible=true）                | OK   |

**結論**: 矛盾なし。各タイプは相互に排他的に制御され、「その他（自由入力）」の表示制御も一貫している。

### Task 3-2: 漏れなしの検証

**検証項目**: `QuestionPayload.type` の全タイプが処理されているか

| タイプ          | QuestionCard の処理                             | FreeTextInput の状態         | ChoiceButton の状態          |
| --------------- | ----------------------------------------------- | ---------------------------- | ---------------------------- |
| `single_select` | ChoiceButton リスト（単一選択・即時送信）       | 「その他」選択時のみ展開     | payload.choices + 「その他」 |
| `multi_select`  | ChoiceButton リスト（複数選択・送信ボタンあり） | 「その他」選択時のみ展開     | payload.choices + 「その他」 |
| `free_text`     | FreeTextInput のみ（isSecret=false）            | 常に表示                     | 表示しない                   |
| `secret`        | FreeTextInput のみ（isSecret=true）             | 常に表示（パスワードマスク） | 表示しない                   |
| `confirm`       | 「はい」「いいえ」ChoiceButton のみ             | 表示しない                   | 「はい」「いいえ」のみ       |

**結論**: 漏れなし。5タイプ全てに対する処理分岐が設計されている。

### Task 3-3: 整合性の検証

**検証項目**: IPCチャネル定数が `channels.ts` のエクスポートを使用しているか

```typescript
// 正しい参照（channels.ts のエクスポートを使用）
import {
  SKILL_CREATOR_QUESTION_RECEIVED,
  SKILL_CREATOR_ANSWER,
} from "@repo/shared/src/ipc/channels";

// 誤った参照（文字列リテラルの直書きは禁止）
// window.api.on('skill-creator:question-received', ...)  ← NG
// window.api.invoke('skill-creator:answer', ...)         ← NG
```

| 検証ポイント                                   | 状態 |
| ---------------------------------------------- | ---- |
| `SKILL_CREATOR_QUESTION_RECEIVED` 定数を使用   | OK   |
| `SKILL_CREATOR_ANSWER` 定数を使用              | OK   |
| 文字列リテラルの直書きなし                     | OK   |
| `@repo/shared/src/ipc/channels` からインポート | OK   |

**結論**: 整合性あり。IPCチャネル定数は全て `channels.ts` のエクスポートから参照する設計になっている。

### Task 3-4: 依存関係整合の検証

**検証項目**: TASK-SDK-SC-01 の成果物のみに依存しているか

| 依存先                                         | 依存の種類         | 許容性                           |
| ---------------------------------------------- | ------------------ | -------------------------------- |
| `packages/shared/src/types/skillCreator.ts`    | QuestionPayload 型 | OK（TASK-SDK-SC-01 成果物）      |
| `packages/shared/src/ipc/channels.ts`          | IPC チャネル定数   | OK（TASK-SDK-SC-01 成果物）      |
| `react`                                        | UIフレームワーク   | OK（外部依存）                   |
| `apps/desktop/src/renderer` の他コンポーネント | なし               | OK（本タスクで新規作成するため） |
| step-02-par 内の他タスク成果物                 | なし               | OK（並列実行のため依存なし）     |

**結論**: 依存関係整合あり。TASK-SDK-SC-01 の成果物のみを参照し、並列実行タスクとは独立している。

### Task 3-5: 設計上の問題点と対策

| 問題点                                            | 対策                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------- |
| `multi_select` の選択状態管理が複雑               | QuestionCard 内部で `selectedChoices: string[]` を useState で管理する          |
| 「その他（自由入力）」の表示タイミングが不明確    | `isFreeTextVisible` を QuestionCard 内部状態として管理する                      |
| `secret` タイプで Shift+Enter 改行は不要          | FreeTextInput の `isSecret=true` 時は Shift+Enter の挙動を無効化する            |
| IPCリスナーのクリーンアップ漏れリスク             | `useEffect` の cleanup 関数でリスナーを必ず解除する                             |
| `isSubmitting` 中の重複送信リスク                 | `isSubmitting=true` 時は全ての ChoiceButton と FreeTextInput を disabled にする |
| 「その他（自由入力）」を `payload.choices` に含む | `FREE_TEXT_LABEL` 定数で識別し、`payload.choices` の末尾に追加して判定する      |

## 参照資料

| 資料名           | パス                      |
| ---------------- | ------------------------- |
| Phase 1 要件定義 | `phase-1-requirements.md` |
| Phase 2 設計     | `phase-2-design.md`       |

## 成果物

| 成果物                       | パス                       | 形式     |
| ---------------------------- | -------------------------- | -------- |
| 設計レビュー書（本ファイル） | `phase-3-design-review.md` | Markdown |

## 完了条件

- [ ] 矛盾なしの検証: 全タイプで UI が正しく切り替わることを確認した
- [ ] 漏れなしの検証: 5タイプ（single_select/multi_select/free_text/secret/confirm）が全て処理されることを確認した
- [ ] 整合性の検証: IPCチャネル定数が `channels.ts` のエクスポートを使っていることを確認した
- [ ] 依存関係整合の検証: TASK-SDK-SC-01 の成果物のみに依存していることを確認した
- [ ] 設計上の問題点と対策を記録した

## 次の Phase: Phase 4 (phase-4-test-creation.md)

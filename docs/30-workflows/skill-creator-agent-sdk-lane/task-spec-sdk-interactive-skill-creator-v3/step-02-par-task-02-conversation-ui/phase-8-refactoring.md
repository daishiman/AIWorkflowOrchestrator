# Phase 8: リファクタリング — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                        |
| --------- | ------------------------- |
| Phase番号 | 8                         |
| 機能名    | conversation-ui           |
| タスクID  | TASK-SDK-SC-02            |
| 作成日    | 2026-04-02                |
| 依存Phase | Phase 7（カバレッジ確認） |

## 目的

Phase 5 の実装コードを品質・保守性・一貫性の観点で見直し、改善する。  
テストが全件 PASS の状態を維持しながらリファクタリングを行う。

## 実行タスク

### Task 8-1: IPCチャネル定数の使用確認

**確認内容**: 全コンポーネントで文字列リテラルを直書きしていないことを確認する。

```bash
# 文字列リテラルの直書きがないことを検索
grep -r "skill-creator:question-received" \
  apps/desktop/src/renderer/components/skill-creator/
grep -r "skill-creator:answer" \
  apps/desktop/src/renderer/components/skill-creator/
```

期待する結果: 0件（定数経由でのみ参照）

| 確認ポイント                                  | 期待する状態                                         |
| --------------------------------------------- | ---------------------------------------------------- |
| `SKILL_CREATOR_QUESTION_RECEIVED` 定数を使用  | `SkillCreatorConversationPanel.tsx` のみでインポート |
| `SKILL_CREATOR_ANSWER` 定数を使用             | `SkillCreatorConversationPanel.tsx` のみでインポート |
| 文字列リテラル `'skill-creator:...'` の直書き | 0件                                                  |

問題が発見された場合は定数参照に修正する。

### Task 8-2: コンポーネント責務の再確認

各コンポーネントが単一責任原則（SRP）に従っているかを確認する。

| コンポーネント                  | 責務                                  | SRP 遵守状況 | 改善アクション                    |
| ------------------------------- | ------------------------------------- | ------------ | --------------------------------- |
| `ChoiceButton`                  | 単一選択ボタンの表示・クリック処理    | OK           | なし                              |
| `FreeTextInput`                 | テキスト入力・送信・マスク表示        | OK           | なし                              |
| `ConversationProgress`          | 進捗表示のみ                          | OK           | なし                              |
| `QuestionCard`                  | タイプ別UI分岐・内部選択状態管理      | 要確認       | switch 分岐が長い場合は分割を検討 |
| `SkillCreatorConversationPanel` | IPC受信・状態管理・コンポーネント統合 | OK           | なし                              |

#### QuestionCard の switch 文が肥大化した場合の対策

`QuestionCard.tsx` の switch 文が Phase 5 の実装から大きく膨らんでいる場合、  
タイプごとのサブコンポーネントへの分割を検討する:

```typescript
// 分割例（必要な場合のみ）
const SingleSelectQuestion: React.FC<...> = ({ ... }) => { ... };
const MultiSelectQuestion: React.FC<...> = ({ ... }) => { ... };
const FreeTextQuestion: React.FC<...> = ({ ... }) => { ... };
const SecretQuestion: React.FC<...> = ({ ... }) => { ... };
const ConfirmQuestion: React.FC<...> = ({ ... }) => { ... };
```

### Task 8-3: `FREE_TEXT_LABEL` 定数の一元管理確認

`"その他（自由入力）"` という文字列が複数ファイルに散在していないかを確認する。

```bash
grep -r "その他（自由入力）" \
  apps/desktop/src/renderer/components/skill-creator/
```

期待する状態:

- `QuestionCard.tsx` の `FREE_TEXT_LABEL` 定数として1箇所のみ定義
- テストファイル内での参照は許容

問題が発見された場合は、`FREE_TEXT_LABEL` 定数をエクスポートして共通化する。

### Task 8-4: 型定義の重複確認

Props インターフェースが各ファイルにのみ存在し、重複定義がないことを確認する。

| 型名                                 | 定義場所                                    | 重複リスク     |
| ------------------------------------ | ------------------------------------------- | -------------- |
| `ChoiceButtonProps`                  | `ChoiceButton.tsx`                          | 低             |
| `FreeTextInputProps`                 | `FreeTextInput.tsx`                         | 低             |
| `ConversationProgressProps`          | `ConversationProgress.tsx`                  | 低             |
| `QuestionCardProps`                  | `QuestionCard.tsx`                          | 低             |
| `SkillCreatorConversationPanelProps` | `SkillCreatorConversationPanel.tsx`         | 低             |
| `QuestionPayload`                    | `packages/shared/src/types/skillCreator.ts` | なし（共有型） |

### Task 8-5: useReducer の Action 型整理

`SkillCreatorConversationPanel.tsx` の `Action` 型が適切に定義されているかを確認する。

```typescript
// 推奨: discriminated union による型安全な Action 定義
type Action =
  | { type: "QUESTION_RECEIVED"; payload: QuestionPayload }
  | { type: "ANSWER_SUBMITTING" }
  | { type: "ANSWER_SUBMITTED" };
```

- `type` フィールドが `string` ではなく literal type であることを確認
- `payload` フィールドが必要な Action にのみ存在することを確認

### Task 8-6: リファクタリング後のテスト実行

リファクタリング完了後、全テストが PASS していることを確認する。

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/
```

期待する結果: T-01 から T-11 以上の全テストが PASS

## 参照資料

| 資料名             | パス                                  |
| ------------------ | ------------------------------------- |
| Phase 5 実装       | `phase-5-implementation.md`           |
| Phase 7 カバレッジ | `phase-7-coverage.md`                 |
| IPC チャネル定数   | `packages/shared/src/ipc/channels.ts` |

## 成果物

| 成果物                             | パス                     | 形式     |
| ---------------------------------- | ------------------------ | -------- |
| リファクタリング記録（本ファイル） | `phase-8-refactoring.md` | Markdown |

## 完了条件

- [ ] IPCチャネル定数の文字列リテラル直書きが 0 件であることを確認した
- [ ] 各コンポーネントの責務が単一責任原則に従っていることを確認した
- [ ] `FREE_TEXT_LABEL` 定数が `QuestionCard.tsx` に一元管理されていることを確認した
- [ ] Props 型定義の重複がないことを確認した
- [ ] `useReducer` の Action 型が型安全な discriminated union で定義されていることを確認した
- [ ] リファクタリング後も全テストが PASS していることを確認した

## 次の Phase: Phase 9 (phase-9-quality-assurance.md)

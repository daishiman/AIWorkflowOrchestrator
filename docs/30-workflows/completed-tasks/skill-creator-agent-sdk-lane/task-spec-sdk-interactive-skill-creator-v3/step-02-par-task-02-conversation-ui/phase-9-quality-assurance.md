# Phase 9: 品質保証 — Conversation UI（質問受信・回答送信UIコンポーネント）

## メタ情報

| 項目      | 値                          |
| --------- | --------------------------- |
| Phase番号 | 9                           |
| 機能名    | conversation-ui             |
| タスクID  | TASK-SDK-SC-02              |
| 作成日    | 2026-04-02                  |
| 依存Phase | Phase 8（リファクタリング） |

## 目的

TypeScript 型チェック・ESLint・アクセシビリティの観点で品質を保証する。  
`pnpm typecheck` と `pnpm lint` がエラー 0 件であることを確認する。

## 実行タスク

### Task 9-1: TypeScript 型チェック

```bash
pnpm --filter @repo/desktop typecheck
```

期待する結果: エラー 0 件

#### 型チェック確認項目

| 確認ポイント                                           | 期待する状態                                             |
| ------------------------------------------------------ | -------------------------------------------------------- |
| `QuestionPayload` 型の全フィールドを正しく参照している | エラーなし                                               |
| `onAnswer: (answer: string \| string[]) => void` の型  | `QuestionCard` と `SkillCreatorConversationPanel` で一致 |
| `window.api.on` の戻り値（unsubscribe）の型            | `(() => void) \| undefined` として扱う                   |
| `window.api.invoke` の戻り値を `await` している        | エラーなし                                               |
| `useReducer` の `State` / `Action` 型の整合性          | エラーなし                                               |
| `React.FC<Props>` の Props 型が正しく定義されている    | エラーなし                                               |

型エラーが発生した場合は修正してから次に進む。

### Task 9-2: ESLint チェック

```bash
pnpm --filter @repo/desktop lint \
  src/renderer/components/skill-creator/
```

期待する結果: エラー 0 件、警告 0 件

#### ESLint 確認項目

| ルール                                    | 確認対象                                               |
| ----------------------------------------- | ------------------------------------------------------ |
| `@typescript-eslint/no-explicit-any`      | `any` 型の使用がないこと                               |
| `react-hooks/exhaustive-deps`             | `useEffect` の依存配列が適切であること                 |
| `react-hooks/rules-of-hooks`              | Hooks がコンポーネントのトップレベルで呼ばれていること |
| `no-unused-vars`                          | 未使用の変数・インポートがないこと                     |
| `@typescript-eslint/no-floating-promises` | `await` 漏れがないこと                                 |

ESLint エラーが発生した場合は修正してから次に進む。

### Task 9-3: アクセシビリティ確認

各コンポーネントのアクセシビリティ属性を確認する。

#### ChoiceButton

| 属性           | 期待する値                      | 確認状態 |
| -------------- | ------------------------------- | -------- |
| `role`         | `button`（デフォルト）          | OK       |
| `aria-pressed` | `isSelected` の値（true/false） | OK       |
| `disabled`     | `disabled` props と一致         | OK       |

#### FreeTextInput

| 属性              | 期待する値                           | 確認状態 |
| ----------------- | ------------------------------------ | -------- |
| `placeholder`     | 入力のヒントテキストが設定されている | OK       |
| `disabled`        | `disabled` props と一致              | OK       |
| `type="password"` | `isSecret=true` のとき適用           | OK       |

#### ConversationProgress

| 属性            | 期待する値            | 確認状態 |
| --------------- | --------------------- | -------- |
| `role`          | `progressbar`         | OK       |
| `aria-valuenow` | `current` の値        | OK       |
| `aria-valuemin` | `0`                   | OK       |
| `aria-valuemax` | `estimatedTotal` の値 | OK       |

#### QuestionCard

| 確認ポイント                           | 期待する状態                                       | 確認状態 |
| -------------------------------------- | -------------------------------------------------- | -------- |
| 質問テキストが見出しレベルで表示される | `<p>` または `<h2>` など適切な要素                 | OK       |
| コンテキストが補足として表示される     | 質問テキストと視覚的に区別されている               | OK       |
| 「その他（自由入力）」ボタンが識別可能 | `isFreeText=true` による破線ボーダーで視覚的に区別 | OK       |

### Task 9-4: Prettier フォーマット確認

```bash
pnpm --filter @repo/desktop format:check \
  src/renderer/components/skill-creator/
```

期待する結果: フォーマット差分 0 件

差分が存在する場合は自動修正を実行する:

```bash
pnpm --filter @repo/desktop format \
  src/renderer/components/skill-creator/
```

### Task 9-5: 最終テスト実行（品質確認後）

```bash
pnpm --filter @repo/desktop vitest run \
  src/renderer/components/skill-creator/__tests__/ \
  --reporter=verbose
```

期待する結果: 全テスト PASS（T-01 以降）

## 参照資料

| 資料名                   | パス                        |
| ------------------------ | --------------------------- |
| Phase 8 リファクタリング | `phase-8-refactoring.md`    |
| Phase 5 実装             | `phase-5-implementation.md` |

## 成果物

| 成果物                     | パス                           | 形式     |
| -------------------------- | ------------------------------ | -------- |
| 品質保証記録（本ファイル） | `phase-9-quality-assurance.md` | Markdown |

## 完了条件

- [ ] `pnpm --filter @repo/desktop typecheck` がエラー 0 件で完了した
- [ ] `pnpm --filter @repo/desktop lint` がエラー 0 件で完了した
- [ ] 全コンポーネントのアクセシビリティ属性（aria-pressed / role="progressbar" / aria-valuenow 等）を確認した
- [ ] `secret` タイプで `type="password"` が適用されていることを確認した
- [ ] Prettier フォーマット差分が 0 件であることを確認した
- [ ] 品質確認後も全テストが PASS していることを確認した

## 次の Phase: Phase 10 (phase-10-final-review.md)

# Phase 4: テスト作成（TDD Red）

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 4                                              |
| Phase名    | テスト作成（TDD Red）                          |
| 前提Phase  | Phase 3                                        |
| 後続Phase  | Phase 5                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

実装前にテストを作成し（TDD Red 状態）、テストマトリクスを確定する。
Phase 1-3 で確認した命名規則（camelCase / PascalCase）と整合しているかを TDD Red 前に検証する。

---

## private method テスト方針【Phase 4 明記必須】

- `buildInitialAnswers()` は `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` から **export** して単体テスト可能にする
  - `export function buildInitialAnswers(...)` として公開する
  - private method のテストには `(component as unknown as Private)` キャスト不要

---

## 実行タスク

### タスク1: テストマトリクスの確定

**テストマトリクス（TC-01〜TC-14）**:

| TC    | 対象                     | 入力・条件                                     | 期待出力 / 動作                                                                      | テストファイル                   |
| ----- | ------------------------ | ---------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| TC-01 | `buildInitialAnswers()`  | `SmartDefaultResult` 全フィールドに値あり      | `ConversationAnswers` の各 `selectedOption` に semantic default を正規化した値が入る | `ConversationRoundStep.test.tsx` |
| TC-02 | `buildInitialAnswers()`  | `SmartDefaultResult` の `tool` が `null`       | `q5.selectedOption` が `null`                                                        | `ConversationRoundStep.test.tsx` |
| TC-03 | `buildInitialAnswers()`  | `SmartDefaultResult` 全フィールド `null`       | 全質問が `selectedOption: null` / `freeText: ""`                                     | `ConversationRoundStep.test.tsx` |
| TC-04 | 初期表示（ページ 1）     | `smartDefaults` を渡してレンダリング           | Q1〜Q3 が表示され、Q4〜Q6 は非表示                                                   | `ConversationRoundStep.test.tsx` |
| TC-05 | 進捗インジケーター       | ページ 1 表示時                                | 「質問1/6」「質問2/6」「質問3/6」が表示される                                        | `ConversationRoundStep.test.tsx` |
| TC-06 | プリフィル表示           | `smartDefaults.who = "自分だけ"` の場合        | Q1 の選択肢「自分のみ」が初期選択された状態で表示される                              | `ConversationRoundStep.test.tsx` |
| TC-07 | null プリフィル表示      | `smartDefaults.tool = null` の場合             | Q5 の選択肢が未選択状態で表示される                                                  | `ConversationRoundStep.test.tsx` |
| TC-08 | ページ遷移（→ ページ 2） | ページ 1 の「次へ」ボタン押下                  | Q4〜Q6 が表示され、Q1〜Q3 は非表示になる                                             | `ConversationRoundStep.test.tsx` |
| TC-09 | 進捗インジケーター       | ページ 2 表示時                                | 「質問4/6」「質問5/6」「質問6/6」が表示される                                        | `ConversationRoundStep.test.tsx` |
| TC-10 | 完了コールバック         | ページ 2 の「完了」ボタン押下                  | `onComplete` が呼ばれ、`ConversationAnswers` 型の引数が渡される                      | `ConversationRoundStep.test.tsx` |
| TC-11 | 回答更新                 | Q1 の選択肢変更（「チームメンバー」を選択）    | `onComplete` に渡される `q1.selectedOption === "チームメンバー"`                     | `ConversationRoundStep.test.tsx` |
| TC-12 | 自由入力更新             | Q2 の `freeText` に入力                        | `onComplete` に渡される `q2.freeText` に入力値が含まれる                             | `ConversationRoundStep.test.tsx` |
| TC-13 | 戻るコールバック         | ページ 1 の「戻る」ボタン押下（`onBack` あり） | `onBack` が呼ばれる                                                                  | `ConversationRoundStep.test.tsx` |
| TC-14 | 戻るボタン非表示         | `onBack` を渡さなかった場合                    | 「戻る」ボタンが表示されない                                                         | `ConversationRoundStep.test.tsx` |

---

### タスク2: テストファイル新規作成（TDD Red）

**対象ファイル**:

- `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx`（新規作成）

**実行手順**:

1. テストファイルを新規作成し、TC-01〜TC-14 を記述する（Red 状態）
2. `pnpm vitest run --reporter=verbose apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` を実行して全テストが FAIL することを確認する（TDD Red 確認）
3. `buildInitialAnswers()` は `ConversationRoundStep.tsx` からエクスポートして単体テスト可能にする設計を採用する

**TDD Red 確認コマンド**:

```bash
# テストが FAIL することを確認（実装が存在しないため）
pnpm --filter @repo/desktop vitest run --reporter=verbose \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

**期待状態**: TDD Red を経て、現在は `ConversationRoundStep.tsx` 実装済みのため Green 状態

---

## 参照資料

| 資料名                     | パス                                                    | 説明                   |
| -------------------------- | ------------------------------------------------------- | ---------------------- |
| Phase 2 Props 設計         | `outputs/phase-2/props-interface.md`                    | テスト入力値の根拠     |
| Phase 2 状態管理設計       | `outputs/phase-2/state-design.md`                       | テスト期待値の根拠     |
| 既存テストパターン（参考） | `apps/desktop/src/renderer/components/skill/__tests__/` | テスト記述スタイル参照 |
| ConversationAnswers 型定義 | `packages/shared/src/types/skillCreator.ts`             | テストデータ作成に使用 |

---

## 成果物

| 成果物                    | 配置先                                                                                       | 形式           |
| ------------------------- | -------------------------------------------------------------------------------------------- | -------------- |
| テストファイル（Red状態） | `apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx` | TypeScript/TSX |
| テストマトリクス          | `outputs/phase-4/test-matrix.md`                                                             | Markdown       |
| TDD Red 確認ログ          | `outputs/phase-4/red-confirmation.md`                                                        | Markdown       |

---

## 完了条件

- [ ] TC-01〜TC-14 がテストファイルとして作成されている
- [ ] 全テストが意図した理由（実装がないため）で FAIL している
- [ ] `buildInitialAnswers()` が `export function` として設計されていることが記録されている
- [ ] `outputs/phase-4/` に全成果物が生成されていること

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド（Red 確認）
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

**確認項目**:

- [ ] テストが失敗することを確認（Red状態）— `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` が存在しないため FAIL が期待値

---

## 次Phase

**Phase 5: 実装** — TC-01〜TC-14 を Green にする `ConversationRoundStep.tsx` を実装する。

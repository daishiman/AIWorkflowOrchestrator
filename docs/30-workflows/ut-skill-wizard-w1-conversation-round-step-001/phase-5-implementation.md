# Phase 5: 実装

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| Phase      | 5                                              |
| Phase名    | 実装                                           |
| 前提Phase  | Phase 4                                        |
| 後続Phase  | Phase 6                                        |
| ステータス | completed                                      |
| 作成日     | 2026-04-08                                     |
| 機能名     | ut-skill-wizard-w1-conversation-round-step-001 |

---

## 目的

Phase 4 で作成したテスト（TC-01〜TC-14）を全て Green にする実装を行う。
semantic default を UI ラベルへ正規化する `ConversationRoundStep` を完成させ、wizard export まで接続する。

---

## 実装計画

### 変更対象ファイル

| ファイル                                                                      | 変更種別 | 内容                                                                |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 新規作成 | Step 1 コンポーネント本体・プリフィルロジック・ページング           |
| `apps/desktop/src/renderer/components/skill/wizard/ConfigureStep.tsx`         | 削除     | `ConversationRoundStep` 置換により不要化したため削除                |
| `apps/desktop/src/renderer/components/skill/wizard/index.ts`                  | 更新     | `ConversationRoundStep` export を追加し wizard 経由で利用可能にする |

### 変更ファイル（テスト）

（Phase 4 で作成済み — 変更なし）

---

## 実行タスク

### Task 5-1: 質問定義定数・プリフィル変換関数を実装する

**目的**: Phase 2 設計に基づき、定数と純粋関数を実装する

**実行手順**:

1. `QUESTIONS` 定数配列を定義する（Q1〜Q6 の質問文・選択肢・ID）
2. `buildInitialAnswers(defaults: SmartDefaultResult): ConversationAnswers` を `export` 可能な純粋関数として実装する
3. `null` フィールドを `selectedOption: null` / `freeText: ""` に変換し、semantic default を UI ラベルへ正規化することを確認する
4. TC-01〜TC-03 が Green になることを確認する

```bash
# TC-01〜TC-03 の確認
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx \
  --reporter=verbose -t "buildInitialAnswers"
```

---

### Task 5-2: ページング・回答状態管理を実装する

**目的**: `currentPage` と `answers` の state を実装する

**実行手順**:

1. `useState<1 | 2>(1)` でページ状態を管理する
2. `useState<ConversationAnswers>` の初期値を `buildInitialAnswers(smartDefaults)` で設定する
3. 現在ページに対応する質問スライス（インデックス 0〜2 または 3〜5）を導出するロジックを実装する
4. 「次へ」ボタンで `currentPage` を `2` に更新するハンドラを実装する
5. TC-04, TC-08 が Green になることを確認する

---

### Task 5-3: 進捗インジケーターを実装する

**目的**: 「質問N/6」表示を実装する

**実行手順**:

1. 現在のページと表示質問位置から「質問N/6」の N 値を計算するロジックを実装する
   - ページ 1: N = 1, 2, 3（インデックス + 1）
   - ページ 2: N = 4, 5, 6（インデックス + 4）
2. 各質問に対して「質問N/6」の進捗テキストを表示する
3. TC-05, TC-09 が Green になることを確認する

---

### Task 5-4: 回答 UI を実装する

**目的**: 選択肢 UI・自由入力 UI をレンダリングする

**実行手順**:

1. 選択肢（`SingleSelectChips` 相当 or interview-widgets）のレンダリングを実装する
2. 自由入力（`FreeTextInput` 相当）のレンダリングを実装する
3. プリフィル値が初期状態として正しく表示されることを確認する（TC-06, TC-07）
4. 回答変更時に `answers` state が更新されることを確認する（TC-11, TC-12）

---

### Task 5-5: コールバック・ページ遷移を完成させる

**目的**: ページ遷移と外部コールバックを実装する

**実行手順**:

1. ページ 1 の「次へ」→ `setCurrentPage(2)` 遷移を実装する（TC-08）
2. ページ 2 の「完了」→ `onComplete(answers)` 呼び出しを実装する（TC-10）
3. `onBack` が渡された場合のみ「戻る」ボタンを表示し、押下時に `onBack()` を呼ぶ（TC-13, TC-14）
4. `apps/desktop/src/renderer/components/skill/wizard/index.ts` に `ConversationRoundStep` を export する

---

### Task 5-6: 全テスト Green 確認

**実行手順**:

1. 全 TC-01〜TC-14 が Green になることを確認する
2. typecheck が PASS することを確認する

```bash
# 全テスト Green 確認
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx

# typecheck 確認
pnpm --filter @repo/desktop typecheck
```

---

## 参照資料

| 資料名                              | パス                                                                     | 説明                               |
| ----------------------------------- | ------------------------------------------------------------------------ | ---------------------------------- |
| Phase 2 設計成果物                  | `outputs/phase-2/`                                                       | 実装の根拠となる設計               |
| ConversationAnswers 型定義          | `packages/shared/src/types/skillCreator.ts`                              | 回答データ構造                     |
| SmartDefaultResult 型定義           | `packages/shared/src/types/skillCreator.ts`                              | プリフィル変換元                   |
| InterviewProgressBar（再利用）      | `apps/desktop/src/renderer/components/skill/InterviewProgressBar.tsx`    | 既存の進捗表示部品                 |
| interview-widgets（参考）           | `apps/desktop/src/renderer/components/skill/interview-widgets/`          | SingleSelectChips 等のウィジェット |
| ConversationalInterview.tsx（参考） | `apps/desktop/src/renderer/components/skill/ConversationalInterview.tsx` | 既存質問 UI パターン               |

---

## 成果物

| 成果物                 | 配置先                                                                        | 形式           |
| ---------------------- | ----------------------------------------------------------------------------- | -------------- |
| 実装済みコンポーネント | `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | TypeScript/TSX |
| 実装結果サマリー       | `outputs/phase-5/implementation-result.md`                                    | Markdown       |
| Green 確認ログ         | `outputs/phase-5/green-confirmation.md`                                       | Markdown       |

---

## 完了条件

- [ ] TC-01〜TC-14 が全て Green になっている
- [ ] `pnpm --filter @repo/desktop typecheck` が PASS している
- [ ] `buildInitialAnswers()` が `export function` として実装されている
- [ ] `apps/desktop/src/renderer/components/skill/wizard/index.ts` に `ConversationRoundStep` export が追加されている
- [ ] `ConfigureStep.tsx` が削除されている
- [ ] `rg -n "ConfigureStep\\.tsx|WizardOptions" apps/desktop/src/renderer/components/skill/wizard apps/desktop/src/renderer/components/skill` が 0 件である
- [ ] Q3 スケジュール設定 UI は最小実装（`scheduleConfig: undefined`）であることが記録されている
- [ ] `outputs/phase-5/` に全成果物が生成されていること

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド（Green 確認）
pnpm --filter @repo/desktop vitest run \
  apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
```

**確認項目**:

- [ ] テストが成功することを確認（Green 状態）— 14 テストが PASS

---

## 次Phase

**Phase 6: テスト拡充** — エッジケース・回帰ガード（TC-15〜TC-19）を追加する。

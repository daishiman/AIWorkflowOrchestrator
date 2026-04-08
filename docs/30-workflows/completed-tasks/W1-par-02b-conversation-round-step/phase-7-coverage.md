# Phase 7: カバレッジ確認

## メタ情報

- Phase: 7
- タスクID: UT-SKILL-WIZARD-W1-par-02b
- 機能名: ConversationRoundStep コンポーネント実装（Step 1）
- 作成日: 2026-04-07

## 目的

テストカバレッジを計測し、未カバーのコードパスを特定する。カバレッジ目標（80%以上）を達成するために追加テストを実施する。

## Phase 6 との差分（重複防止）

- Phase 6: 仕様を守るための追加テスト（エッジケース/回帰）を入れる
- Phase 7: **計測して不足だけ埋める**（テストの増やしすぎを防ぐ）

## 実行タスク

- [ ] カバレッジレポートを生成する
- [ ] 未カバー箇所を特定する（ConversationRoundStep / InterviewProgressBar / ApplySummaryCard）
- [ ] 不足テストを追加する
- [ ] カバレッジ目標（80%以上）を達成する

## 参照資料

| 資料名             | パス                                                 | 説明           |
| ------------------ | ---------------------------------------------------- | -------------- |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                          | 拡充済みテスト |
| Vitest 設定        | `apps/desktop/vitest.config.ts`                      | カバレッジ設定 |
| 実装ファイル群     | `apps/desktop/src/renderer/components/skill/wizard/` | カバレッジ対象 |

## 実行手順

### Step 1: カバレッジレポート生成

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/components/skill/wizard/__tests__/
```

### Step 2: カバレッジ結果確認（ファイル単位）

確認すべき指標（各ファイルごと）:

| ファイル                  | Statements | Branches | Functions | Lines   |
| ------------------------- | ---------- | -------- | --------- | ------- |
| ConversationRoundStep.tsx | 80%以上    | 80%以上  | 80%以上   | 80%以上 |
| InterviewProgressBar.tsx  | 80%以上    | 80%以上  | 80%以上   | 80%以上 |
| ApplySummaryCard.tsx      | 80%以上    | 80%以上  | 80%以上   | 80%以上 |

### Step 3: 未カバー箇所の特定（Gap List を作る）

カバレッジレポートから、未カバー箇所を **「どの条件分岐が未実行か」**で箇条書きにする。
この Gap List は Phase 6 のように網羅テストを増やすのではなく、足りない分岐だけに絞る。

例（実装に合わせて調整）:

| コードパス                                                   | 対応テスト                      |
| ------------------------------------------------------------ | ------------------------------- |
| `currentPage === 2` でPage1が非表示                          | Page2表示中のPage1非表示テスト  |
| Q3「定期実行」以外の選択肢でScheduleConfigInputが消える      | 定期実行→手動実行切り替えテスト |
| サマリーカードを閉じた後に再度「今すぐ生成する」を押した場合 | 再表示テスト                    |
| 全問回答済みの場合のサマリーカード（未回答リストが空）       | 全問回答済みサマリーテスト      |
| 自由入力テキストの変更                                       | freeText変更テスト              |

### Step 4: 不足分だけ追加テストを入れる

追加は原則として Phase 6 で作成したテストファイル群に追記する（新規ファイルを増やさない）。
テストは「Gap List の 1 行 = 1 テスト」程度に抑え、過剰に網羅しない。

### Step 5: 最終カバレッジ確認

```bash
pnpm --filter @repo/desktop vitest run \
  --coverage \
  src/renderer/components/skill/wizard/__tests__/
```

カバレッジ結果を記録する。

## 統合テスト連携

- Phase 4/6 の TC スイート全体に対する line/branch カバレッジを計測し、変更ブロック（ConversationRoundStep / InterviewProgressBar / ApplySummaryCard）の 80%以上を目標とする。
- カバレッジ不足の Gap List は Phase 6 テストファイルへ追記し、Phase 8 以降に持ち越さない。

## 成果物

- カバレッジレポート（コンソール出力）
- 追加テストコード（不足箇所対応分）

## 完了条件

- [ ] カバレッジレポートが生成されている
- [ ] ConversationRoundStep / InterviewProgressBar / ApplySummaryCard 全て 80% 以上
- [ ] 未カバー箇所に対するテストが追加されている
- [ ] 全テストが GREEN になっている

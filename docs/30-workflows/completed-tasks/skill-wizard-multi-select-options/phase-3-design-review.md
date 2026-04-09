# Phase 3: 設計レビュー - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 3                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |
| 判定   | MINOR                             |

## 総合判定: MINOR

Phase 4（実装）への移行を条件付きで承認する。
下記の MINOR 指摘事項を Phase 5（実装）完了までに対処すること。

---

## レビュー観点別評価

### 1. 型変更の妥当性

**評価: PASS**

`selectedOption: string | null` → `selectedOptions: string[]` への移行は明快で、
null の除去により型安全性が向上する。`freeText` と `scheduleConfig` への影響がない点も確認済み。

`SmartDefaultResult` を変更しない判断は正しい。LLMプロンプト変更の連鎖リスクを回避しており、
`createQuestionAnswer()` 内の `string → [string]` 変換でコストを最小化している。

### 2. トグルロジックの妥当性

**評価: PASS**

```typescript
const isSelected = current.includes(option);
const nextSelectedOptions = isSelected
  ? current.filter((o) => o !== option)
  : [...current, option];
```

このトグルパターンは正しく、イミュータブルに state を更新する。
`filter` による除去と spread による追加はどちらも O(n)（n = 選択肢数 ≦ 4）のため、パフォーマンス上の問題なし。

### 3. Q3 定期実行特殊処理

**評価: PASS**

`selectedOptions.includes("定期実行")` による展開判定は直感的で正しい。
状態遷移表（Phase 2）の4パターンがすべて論理的に整合している。

`handleCronChange` / `handleTimezoneChange` 内でも
`selectedOptions.includes("定期実行")` を用いて自動追加する設計は適切。

### 4. ApplySummaryCard の変更

**評価: PASS**

`answer.selectedOptions.length === 0` による未回答判定は `answer.selectedOption === null` と等価であり、
意図の変更はない。

表示ロジック（SmartDefault の文字列表示）は変更不要との判断も正しい。

### 5. resolveExternalIntegration の先頭値参照

**評価: MINOR（要注意）**

```typescript
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

先頭値参照は実用上問題ないが、以下の懸念がある:

- 「Slack」と「GitHub」を両方選択した場合、先頭値のみが統合対象になる
- ユーザーが選択した順序に依存するため、選択順が変わると挙動が変わる
- 現行の `CompleteStep` や `createSkill()` は外部ツール名を1値しか扱わないため、
  複数ツール対応は本タスクのスコープ外であり、先頭値参照で許容できる

**対処方針**: Phase 5 の実装時にコメントで「先頭値優先（複数選択対応は別タスク）」と明記すること。

### 6. 既存テストへの影響

**評価: MINOR（対処必須）**

`selectedOption` を直接参照しているテストが存在する可能性が高い。
Phase 4（テスト作成）で既存テストの修正方針を明示し、Phase 5 の実装と並走して修正すること。

確認が必要な主なテストファイル:

```
apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx
apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
packages/shared/src/**/__tests__/skillCreator.test.ts（型テストがある場合）
```

### 7. アクセシビリティ

**評価: PASS**

各ボタンへの `aria-pressed={selectedOptions.includes(opt)}` は WCAG 2.1 SC 4.1.2 に準拠しており、
スクリーンリーダーで各ボタンの押下状態が独立して伝達される。

現行の `<section>` による問のグルーピングで識別可能なため、`role="group"` の追加は不要との判断を支持する。

### 8. 下位互換性・永続化

**評価: PASS**

`QuestionAnswer` が IPC 型・永続化スキーマに含まれていないことを確認済み。
`ConversationAnswers` は Renderer インメモリ state に閉じており、
既存の永続化データ・IPC 契約への影響はない。

### 9. データフロー

**評価: PASS**

Phase 2 のデータフロー図は正確であり、以下の2つのフローが明快に分離されている:

1. ユーザー操作 → `handleOptionSelect` → `selectedOptions[]` 更新
2. SmartDefault 適用 → `createQuestionAnswer` → `string → [string]` 変換

---

## MINOR 指摘事項（Phase 5 完了までに対処）

### M-01: `resolveExternalIntegration` に先頭値参照の注釈を追加

**対処**: 実装コード内に以下のコメントを追加する。

```typescript
// 複数選択時は先頭値を主ツールとして参照する。
// 複数ツールの並列統合対応は別タスクのスコープ。
const selected = (q5Answer.selectedOptions[0] ?? "").trim();
```

### M-02: 既存テストの `selectedOption` 参照を Phase 4 で洗い出し

**対処**: Phase 4 でテストファイルを全件確認し、`selectedOption` → `selectedOptions` の
移行箇所リストを phase-4-test-creation.md に記載すること。

### M-03: `handleCronChange` / `handleTimezoneChange` の `selectedOptions` フォールバック設計を明記

**対処**: Phase 5 の実装時に、cron 入力中に `selectedOptions` から「定期実行」が抜けた場合の
フォールバック（自動追加）ロジックを明示的にコメントで記述すること。

---

## MAJOR 指摘事項

なし。

---

## 設計の強み（レビュアーコメント）

1. **SmartDefaultResult 不変の判断**: バックエンド・LLMプロンプトへの影響を完全に遮断している。最小コストで最大の後方互換性を確保した正しい判断。

2. **トグル実装の単純さ**: `filter` + spread というシンプルなパターンで、副作用がなく、テストが書きやすい。

3. **Q3 特殊処理の維持**: 既存の ScheduleConfigInput 展開ロジックを `includes()` 1つの変更で複数選択対応にできており、変更量が最小。

4. **型変更の影響範囲の小ささ**: `QuestionAnswer` が IPC 型・永続化型から独立しているため、変更のリップル効果がゼロ。

---

## Phase 4 開始条件

以下をすべて満たした時点で Phase 4（テスト作成）を開始してよい。

| 条件                                      | 確認方法                           |
| ----------------------------------------- | ---------------------------------- |
| Phase 1（要件定義）レビュー済み           | 本ドキュメント存在                 |
| Phase 2（設計）レビュー済み               | 本ドキュメント存在                 |
| M-02 の洗い出し方針が確定している         | Phase 4 着手時に確認               |
| 実装担当者が MINOR 指摘事項を把握している | Phase 4 の冒頭に M-01〜M-03 を確認 |

**Phase 4 着手時の必須アクション**:

1. 既存テストファイルで `selectedOption` を参照している箇所をすべてリストアップする
2. 新規テストケースとして AC-01〜AC-13（Phase 1）を TC-xx に変換した一覧を作成する
3. `isQuestionAnswered`・`handleOptionSelect`・`createQuestionAnswer` のユニットテストを優先して作成する

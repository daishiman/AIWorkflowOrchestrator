# スキルウィザード UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除）- タスク指示書

## メタ情報

```yaml
issue_number: 2133
task_id: TASK-SW-FIX-UI-001
status: completed
priority: medium
scale: medium
task_type: BUGFIX
```

| 項目         | 内容                                                                                            |
| ------------ | ----------------------------------------------------------------------------------------------- |
| タスクID     | TASK-SW-FIX-UI-001                                                                              |
| タスク名     | スキルウィザード UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar・カテゴリ解除）        |
| 分類         | バグ修正（UI task・VISUAL）                                                                     |
| 対象機能     | スキルウィザード / SkillInfoStep / ConversationRoundStep / ApplySummaryCard / SkillCreateWizard |
| 優先度       | 中（`priority:medium`）                                                                         |
| 見積もり規模 | 中規模（`scale:medium`）                                                                        |
| ステータス   | 未実施（`status:open`）                                                                         |
| 発見元       | スキルウィザードバグ修正ウェーブ クラスターD（問題2・3・11・15・16）                            |
| 発見日       | 2026-04-12                                                                                      |
| タスク分類   | BUGFIX タスク（UI整合性・視覚的一貫性）                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

スキルウィザードの UI クラスターDに属する5件の問題（問題2・3・11・15・16）が検出された。
これらはいずれもユーザー操作の直感性、視覚的一貫性、回答進捗の正確な表示に関わる問題であり、
ウィザードのUX品質を著しく損なっている。

### 1.2 問題点・課題

**問題2**: `SkillInfoFormData.category` が `SkillCategory`（単数型）のため、カテゴリを複数選択できない。
スキルには「自動化」と「外部連携」のように複数の性質が同時に当てはまるケースが多く、
単一選択の制約が実際の用途と合っていない。

**問題3**: 選択済みカテゴリを再クリックしても解除できない（トグル動作がない）。
`handleCategoryClick` が同一値のクリックを無視しているため、一度選んだカテゴリを外せない。

**問題11**: Step 0の「次へ」・LLMモードの「次へ」・ConversationRoundStep の「次のページ」ボタンのスタイルが統一されていない。
`SkillInfoStep.tsx` と `SkillCreateWizard.tsx` では `bg-blue-600 text-white` がハードコードされているが、
`ConversationRoundStep.tsx` では CSS 変数（`--status-primary`・`--text-inverse`）を使用しており、
ライトテーマ・ダークテーマ切替時に色が不一致になる。

**問題15**: `InterviewProgressBar` の `currentQuestion` が固定値（1 または 4）のため、
回答進捗が正確に表示されない。実際の回答済み問数（1/6〜6/6）が反映されない。

**問題16**: カテゴリ型変更に伴い、`ApplySummaryCard`・`ConversationRoundStep`・shared 推論・
代表カテゴリ解決・計装（`trackEvent`）の配列対応が必要。

### 1.3 放置した場合の影響

- 「外部連携 + 自動化」のように複数カテゴリが該当するスキルを適切に分類できない
- 一度選んだカテゴリを修正できないため、ユーザーが Step 0 を最初からやり直す必要が生じる
- テーマ切替時にボタン色が不整合となり、視覚品質が損なわれる
- インタビュー中の回答進捗が正しく表示されず、ユーザーが自分の位置を把握できない
- `category` 型の不整合が拡大し、TypeScript 型エラーが積み重なる

---

## 2. 何を達成するか（What）

### 2.1 目的

スキルウィザードにおける UI 整合性問題（クラスターD: 問題2・3・11・15・16）を一括修正し、
カテゴリ複数選択・解除・ボタンスタイル統一・ProgressBar 動的化・型整合性を実現する。

### 2.2 最終ゴール

- `SkillInfoFormData.category` を `SkillCategory[]` 型（複数選択・未選択は `[]`）に変更
- カテゴリボタンをトグル動作（選択・解除）に対応
- ウィザード全体のプライマリボタンを CSS 変数（`--status-primary` / `--text-inverse`）に統一
- `InterviewProgressBar` が実際の回答済み問数（1/6〜6/6）を動的表示
- カテゴリ型変更に伴う全依存箇所（Q5 必須判定・推論・計装）の配列対応

### 2.3 スコープ

**含むもの**:

- `packages/shared/src/types/skillCreator.ts` の `SkillInfoFormData.category` 型変更
- `SkillInfoStep.tsx` の `handleCategoryClick` トグル化・`isSelected` 判定修正・`isNextEnabled` 修正・ボタンスタイル変更
- `ConversationRoundStep.tsx` の `currentQuestion` 動的計算・Q5 必須判定の配列対応
- `ApplySummaryCard.tsx` の Q5 必須判定の配列対応（`includes("external-integration")`）
- `SkillCreateWizard.tsx` の代表カテゴリ解決・共有推論利用・LLM モードボタンの CSS 変数化
- `smartDefaultReasoningService.ts` の `inferFormat` 配列対応
- 関連テストの更新（型テスト・ロジックテスト・スタイルテスト）

**含まないもの**:

- カテゴリ選択順序の並び替え機能
- カテゴリの最大選択数制限
- ルートバレル（`@repo/shared` の index）への変更
- `SkillCategory` union 型定義自体の変更
- ConversationRoundStep の「次のページ」ボタンスタイル（確認済みで変更不要）

### 2.4 成果物

- `packages/shared/src/types/skillCreator.ts`（修正）
- `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`（修正）
- `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts`（修正）
- `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`（修正）
- `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`（修正）
- `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`（修正）
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`（修正）
- 対応テストファイル（更新）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SW-FIX-MODE-MGMT-001（Wave B）の完了
- TASK-SW-FIX-FEEDBACK-001（Wave B）の完了
- `SkillInfoStep.tsx` / `ConversationRoundStep.tsx` / `SkillCreateWizard.tsx` の現状コード理解
- `packages/shared/src/types/skillCreator.ts` の現状型定義理解

### 3.2 依存タスク

| タスクID                     | 関係       | 理由                                             |
| ---------------------------- | ---------- | ------------------------------------------------ |
| TASK-SW-FIX-MODE-MGMT-001    | 必須先行   | モード管理修正により状態フロー整合性が確保される |
| TASK-SW-FIX-FEEDBACK-001     | 必須先行   | フィードバック修正により UI 基盤が安定する       |
| TASK-SW-FIX-STATE-DETAIL-001 | 並列実行可 | Wave C の別タスク（同時進行可）                  |

### 3.3 必要な知識

- TypeScript のユニオン型・配列型・型ガード
- React のコンポーネント間状態管理と Props 伝達
- Tailwind CSS の CSS 変数参照構文（`bg-[var(--xxx)]`）
- TDD（テスト先行開発）: Phase 4 でテストを書き Phase 5 で実装
- `@repo/shared` のサブパスエクスポート構造

### 3.4 推奨アプローチ

型変更を起点に上流から下流へ順番に修正する。
`skillCreator.ts` の型変更後、コンパイルエラーを起点として全影響箇所を特定・修正する。
ボタンスタイルの変更はテーマ対応の観点から CSS 変数への統一を優先する。

---

## 4. 実行手順

### Phase 1: 要件定義

- `SkillInfoFormData.category` 型変更の影響範囲を調査する
- `SkillCategory[]` と `[]` を用いた選択・解除ロジックを確定する
- `InterviewProgressBar` の `currentQuestion` 計算方法を確定する
- shared 推論・代表カテゴリ解決・ボタンスタイル統一の対象ファイルを特定する
- 既存テストの変更が必要な箇所を特定する

### Phase 2: 設計

- `SkillInfoFormData.category` 型変更設計（`SkillCategory | null` → `SkillCategory[]`）
- `handleCategoryClick` 複数選択・トグル解除設計（`includes` で判定し `filter` で除去）
- `isNextEnabled` 判定ロジック変更設計（`category.length > 0`）
- `InterviewProgressBar` の `currentQuestion` 動的計算設計（`Math.max(1, answeredCount)`）
- ボタン CSS 変数統一設計（`bg-[var(--status-primary)]` / `text-[var(--text-inverse)]`）
- Q5 必須判定設計（`category.includes("external-integration")`）
- サブパスエクスポートへの影響方針確定

### Phase 3: 設計レビュー

- Phase 2 の設計内容をレビューし、実装前に懸念点を解消する
- `resolvePrimaryCategory` ヘルパー関数の設計・責務を確認する
- `trackEvent` の契約（単一カテゴリ維持）を確認する

### Phase 4: テスト作成（TDD）

以下のテストを実装前に作成し、Phase 5 実装後に PASS となることを確認する。

**型テスト（`skillCreator-wizard.test.ts`）:**

- `category` が `SkillCategory[]` 型であること
- 空配列 `[]` を指定できること
- 複数カテゴリ `["automation", "external-integration"]` を指定できること

**SkillInfoStep テスト（`SkillInfoStep.test.tsx`）:**

- カテゴリクリックで選択状態になること
- 選択済みカテゴリの再クリックで解除されること
- 複数カテゴリを同時に選択できること
- `category.length > 0` かつ `purpose` 10文字以上で次へボタンが活性化すること
- 次へボタンに `bg-blue-600` が含まれないこと（CSS 変数使用確認）

**ConversationRoundStep テスト（`ConversationRoundStep.test.tsx`）:**

- 回答数増加に応じて `currentQuestion` が増えること
- 全問未回答時は `1/6` を表示すること

**shared 推論・ApplySummaryCard テスト:**

- `inferFormat` が `SkillCategory[]` を受け取ること
- Q5 必須判定が `includes("external-integration")` で動作すること

### Phase 5: 実装

**Step 1: `skillCreator.ts` の修正**

```typescript
// 変更後
export interface SkillInfoFormData {
  skillName?: string;
  purpose: string;
  /** スキルカテゴリ（複数選択可・未選択時は空配列） */
  category: SkillCategory[];
}
```

**Step 2: `SkillInfoStep.tsx` の修正（4箇所）**

```typescript
// handleCategoryClick: トグル動作
const handleCategoryClick = (value: SkillCategory) => {
  const next = formData.category.includes(value)
    ? formData.category.filter((c) => c !== value)
    : [...formData.category, value];
  onFormDataChange({ ...formData, category: next });
};

// isNextEnabled: 配列長チェック
const isNextEnabled =
  formData.purpose.trim().length >= 10 && formData.category.length > 0;

// isSelected: includes で判定
const isSelected = formData.category.includes(value);
```

```tsx
{
  /* 次へボタン: CSS変数スタイルに変更 */
}
className =
  "rounded-lg bg-[var(--status-primary)] px-6 py-2 text-sm font-medium text-[var(--text-inverse)] disabled:cursor-not-allowed disabled:opacity-40";
```

**Step 3: `ConversationRoundStep.tsx` の修正**

```typescript
// currentQuestion 動的計算
const answeredCount = QUESTION_KEYS.filter((key) =>
  isQuestionAnswered(answers[key]),
).length;
const currentQuestion = Math.max(1, answeredCount);

// Q5 必須判定
const isQ5Required = formData.category.includes("external-integration");
```

**Step 4: `ApplySummaryCard.tsx` の修正**

```typescript
const isQ5Required = formData.category.includes("external-integration");
```

**Step 5: `SkillCreateWizard.tsx` の修正**

```typescript
// 代表カテゴリ解決
const primaryCategory = resolvePrimaryCategory(formData.category);

trackEvent("skill_wizard_generation_completed", {
  method,
  category: primaryCategory,
  hasExternalIntegration: integration.hasExternalIntegration,
});
```

```tsx
{
  /* LLMモード次へボタン: CSS変数スタイルに変更 */
}
className =
  "rounded-lg bg-[var(--status-primary)] px-4 py-2 text-sm text-[var(--text-inverse)]";
```

**Step 6: `smartDefaultReasoningService.ts` の修正**

```typescript
function inferFormat(category: SkillInfoFormData["category"]): {
  format: SmartDefaultResult["format"];
  log: string | null;
} {
  if (category.includes("code-support")) {
    return {
      format: "code",
      log: "category includes 'code-support' → format = 'code'",
    };
  }
  if (category.includes("data-analysis")) {
    return {
      format: "structured",
      log: "category includes 'data-analysis' → format = 'structured'",
    };
  }
  return { format: null, log: null };
}
```

### Phase 6: テスト拡充

- Phase 4 のテストが全件 PASS することを確認する
- エッジケース（全カテゴリ解除・全カテゴリ選択・Q5 が `external-integration` 以外で非必須）のテストを追加する

### Phase 7: カバレッジ確認

- `SkillInfoStep.tsx` の `handleCategoryClick` 全分岐をカバーする
- `currentQuestion` の 0〜6 の全パターンをカバーする
- `inferFormat` の全分岐をカバーする

### Phase 8: リファクタリング

- `resolvePrimaryCategory` のロジックを整理・コメント追加
- `inferSmartDefaults.ts` の shared 推論への薄い再利用を整理
- 不要な型アサーション（`as`）や `any` を除去

### Phase 9: 品質保証

```bash
# shared パッケージ全チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/shared lint
pnpm --filter @repo/shared test

# desktop パッケージ全チェック
pnpm --filter @repo/desktop typecheck
pnpm --filter @repo/desktop lint
pnpm --filter @repo/desktop test

# bg-blue-600 残存確認（0件であること）
grep -rn "bg-blue-600" apps/desktop/src/renderer/components/skill/ --include="*.tsx"
```

### Phase 10: 最終レビュー

- AC-1〜AC-6 の受け入れ基準をすべて満たしていることを確認する
- コードレビューを実施する

### Phase 11: 手動テスト（VISUAL）

ライトテーマ・ダークテーマ両方で以下を目視確認する。

- カテゴリを複数選択できること
- 選択済みカテゴリをクリックして解除できること
- 次へボタンの色が他ボタンと統一されていること
- インタビュー中の ProgressBar が回答数に応じて進むこと

### Phase 12: ドキュメント・コンプライアンス確認

- `SkillInfoFormData` の JSDoc コメントを `category: SkillCategory[]` に更新
- 詳細仕様書（`docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/`）と実装の整合性確認

### Phase 13: PR 作成

ユーザーの明示的承認を得た後に実施する。

```bash
# ブランチ作成
git checkout -b fix/task-sw-fix-ui-001-wizard-ui-consistency

# コミット
git commit -m "fix(skill-wizard): TASK-SW-FIX-UI-001 UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar）"

# push
git push -u origin fix/task-sw-fix-ui-001-wizard-ui-consistency

# PR 作成
gh pr create \
  --title "fix(skill-wizard): TASK-SW-FIX-UI-001 UI整合性修正（カテゴリ複数選択・ボタン統一・ProgressBar）" \
  --body "..."
```

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] カテゴリを複数選択できる（`SkillInfoFormData.category` が `SkillCategory[]` 型、未選択は `[]`）
- [ ] 選択済みカテゴリを再クリックで解除できる（`handleCategoryClick` でトグル動作、全解除時は `[]`）
- [ ] Step 0の「次へ」・LLMモードの「次へ」・ConversationRoundStep の「次のページ」が同一の CSS 変数ボタンスタイルを使用する
- [ ] `InterviewProgressBar` が実際の回答済み問数（1/6〜6/6）を動的に表示する
- [ ] `ApplySummaryCard` / `ConversationRoundStep` / `SkillCreateWizard` / shared 推論の依存が更新され、外部連携判定・推論・計装が回帰していない
- [ ] カテゴリ型変更に伴う既存テストの更新が完了している

### 品質要件

- [ ] `pnpm --filter @repo/shared typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop typecheck` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/desktop lint` がエラーなしで通過する
- [ ] `pnpm --filter @repo/shared test` が全件パスする
- [ ] `pnpm --filter @repo/desktop test` が全件パスする
- [ ] `bg-blue-600` のハードコードクラスがウィザード関連ファイルに存在しない
- [ ] `any` 型の新規使用がない
- [ ] ライトテーマ・ダークテーマの両方で目視確認が完了している

### ドキュメント要件

- [ ] `SkillInfoFormData.category` の JSDoc コメントが `SkillCategory[]` を反映している
- [ ] 詳細仕様書（`docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/`）の各 Phase が完了条件をチェックされている

---

## 6. 検証方法

### テストケース

| テスト対象                      | 入力/操作                                           | 期待結果                                                     | 備考 |
| ------------------------------- | --------------------------------------------------- | ------------------------------------------------------------ | ---- |
| カテゴリ選択                    | 未選択状態で「自動化」ボタンをクリック              | `category: ["automation"]`                                   | AC-1 |
| カテゴリ複数選択                | `["automation"]` 状態で「外部連携」ボタンをクリック | `category: ["automation", "external-integration"]`           | AC-1 |
| カテゴリ解除                    | `["automation"]` 状態で「自動化」ボタンを再クリック | `category: []`                                               | AC-2 |
| 次へボタン活性化                | `purpose` 10文字以上・`category.length > 0`         | 次へボタンが活性化（disabled でない）                        | AC-1 |
| 次へボタン非活性                | `category: []`（空配列）                            | 次へボタンが非活性（disabled）                               | AC-1 |
| ボタンスタイル確認              | SkillInfoStep の次へボタン                          | `bg-blue-600` なし・`status-primary` あり・`rounded-lg` あり | AC-3 |
| ProgressBar: 全未回答           | 回答なし                                            | 質問 1/6 表示                                                | AC-4 |
| ProgressBar: Q1・Q2 回答済み    | `q1` / `q2` のみ回答済み                            | 質問 2/6 表示                                                | AC-4 |
| ProgressBar: 全問回答済み       | `q1`〜`q6` 全回答済み                               | 質問 6/6 表示                                                | AC-4 |
| Q5 必須判定（配列対応）         | `category: ["external-integration"]`                | Q5 が必須扱い                                                | AC-5 |
| Q5 必須判定（配列に含まれない） | `category: ["automation"]`                          | Q5 が非必須                                                  | AC-5 |
| Q5 必須判定（複数選択で含む）   | `category: ["automation", "external-integration"]`  | Q5 が必須扱い                                                | AC-5 |
| inferFormat（code-support）     | `category: ["code-support"]`                        | `format: "code"`                                             | AC-5 |
| inferFormat（data-analysis）    | `category: ["data-analysis"]`                       | `format: "structured"`                                       | AC-5 |
| 型テスト                        | `category: SkillCategory[]`                         | TypeScript 型エラーなし                                      | AC-6 |
| 型テスト（空配列）              | `category: []`                                      | TypeScript 型エラーなし                                      | AC-6 |

---

## 7. リスクと対策

| リスク                                                         | 影響度 | 発生確率 | 対策                                                                                    |
| -------------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| `category` 型変更が広範囲の型エラーを引き起こす                | 高     | 高       | `pnpm --filter @repo/shared typecheck` を早期実行し、エラーを起点に全修正箇所を特定する |
| `resolvePrimaryCategory` の優先順ロジックが不明確              | 中     | 中       | Phase 3 設計レビューで優先順を確定し、JSDoc に明記する                                  |
| CSS 変数未定義テーマでボタンが透明になる                       | 中     | 低       | Phase 11 手動テストでライト・ダーク両テーマを確認する                                   |
| `inferSmartDefaults.ts` の shared 推論統合で二重ロジックが残る | 中     | 中       | Phase 8 リファクタリングで shared 側への統一を徹底する                                  |
| `currentQuestion` が `undefined` になる                        | 低     | 低       | `QUESTION_KEYS` と `isQuestionAnswered` の参照スコープを Phase 5 で確認する             |
| テスト更新漏れで CI が失敗する                                 | 高     | 中       | Phase 4 で全テストの更新対象リストを作成し、Phase 6 でカバレッジを確認する              |

---

## 8. 参照情報

### 関連ドキュメント

| 資料名               | パス                                                                                        | 説明                           |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------ |
| Phase 1 要件定義     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/phase-1-requirements.md`      | 受け入れ基準・影響範囲調査     |
| Phase 2 設計         | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/phase-2-design.md`            | 変更前後コード・ファイル別設計 |
| Phase 4 テスト仕様   | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/phase-4-test-creation.md`     | TDD テストケース・実行コマンド |
| Phase 5 実装仕様     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/phase-5-implementation.md`    | 実装手順・エラー対処表         |
| Phase 9 品質保証     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/phase-9-quality-assurance.md` | QA チェックリスト・AC 確認表   |
| Phase 13 PR 作成     | `docs/30-workflows/skill-wizard-bugfix-wave/WC-par-03b-fix-ui/phase-13-pr-creation.md`      | コミット・PR 本文テンプレート  |
| バグ修正ウェーブ全体 | `docs/30-workflows/skill-wizard-bugfix-wave/index.md`                                       | 問題番号・全体コンテキスト     |

### 関連ファイル

| ファイル                                                                        | 変更種別 | 内容                                     |
| ------------------------------------------------------------------------------- | -------- | ---------------------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                     | 修正     | `category` 型を `SkillCategory[]` へ変更 |
| `packages/shared/src/services/skillCreator/smartDefaultReasoningService.ts`     | 修正     | `inferFormat` を配列対応へ変更           |
| `apps/desktop/src/renderer/components/skill/wizard/utils/inferSmartDefaults.ts` | 修正     | shared 推論の薄い再利用へ整理            |
| `apps/desktop/src/renderer/components/skill/wizard/SkillInfoStep.tsx`           | 修正     | トグル選択・スタイル・次へボタン         |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`        | 修正     | Q5 必須判定の配列対応                    |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx`   | 修正     | `currentQuestion` 動的計算・Q5 必須判定  |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`              | 修正     | 代表カテゴリ解決・LLM モードボタン変更   |

---

## 9. 備考

### 苦戦箇所

| 項目                 | 内容                                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 型変更の波及         | `category` 型変更（単数→配列）は `packages/shared` への変更のため広範囲の影響が生じる。全テスト・型チェックの再確認が必須                                                                |
| ProgressBar 状態同期 | `currentQuestion` の動的計算で `ConversationRoundStep` と `SkillCreateWizard` の状態同期が複雑になる可能性がある。`QUESTION_KEYS` と `isQuestionAnswered` の参照スコープを慎重に確認する |
| CSS 変数統一         | ボタンスタイル変更後にライトテーマ・ダークテーマ両方での表示確認が必要。hover 状態のスタイルも CSS 変数側で定義されているかを確認する                                                    |
| 代表カテゴリ解決     | `resolvePrimaryCategory` の優先順ロジックが Phase 3 設計レビューまで未確定。`trackEvent` の単一カテゴリ契約を壊さないよう注意する                                                        |
| TDD の厳守           | Phase 4 でテストを先行作成し Phase 5 で実装する。テスト失敗なしに実装を開始しないこと                                                                                                    |

### 発見経緯

スキルウィザードのバグ修正ウェーブ（Wave B 完了後）における クラスターD の問題分析時に、
UI 整合性に関する5件の問題（問題2・3・11・15・16）がまとめて検出された。
いずれも単独では軽微だが、複合すると「カテゴリを変更しながらインタビューを進めると進捗表示がズレる」
などのユーザー体験上の混乱を引き起こす。Wave C で一括修正対象とし、このタスクとして分離した。

Wave C の他タスク（TASK-SW-FIX-STATE-DETAIL-001）とは並列実行可能だが、
Wave B の TASK-SW-FIX-MODE-MGMT-001・TASK-SW-FIX-FEEDBACK-001 の完了が前提条件となる。

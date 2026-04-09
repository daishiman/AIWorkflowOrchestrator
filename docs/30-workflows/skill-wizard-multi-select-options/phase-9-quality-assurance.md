# Phase 9: 品質保証 - スキルウィザード複数選択対応

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 9                                 |
| 機能名 | skill-wizard-multi-select-options |
| 作成日 | 2026-04-08                        |
| 前提   | Phase 8（リファクタリング）完了   |

## 目的

実装・テスト・リファクタリングを経たコードが、プロジェクト品質基準（型安全性・Lint・ラインバジェット・リンク整合）を
すべて満たすことを確認する。Phase 10（最終レビュー）への移行ゲートとして機能する。

---

## 1. ラインバジェット確認

変更ファイルの追加行数が想定範囲内であることを確認する。
行数が著しく超過している場合は Phase 8（リファクタリング）に戻り、
不要なコードが混入していないか再確認する。

### 想定ラインバジェット

| ファイル                                                                      | 変更種別   | 想定増減行数（目安）        |
| ----------------------------------------------------------------------------- | ---------- | --------------------------- |
| `packages/shared/src/types/skillCreator.ts`                                   | 型変更     | ±5行（1行削除・1行追加）    |
| `apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx` | 動作変更   | +15〜+30行（コメント込み）  |
| `apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx`      | 表示変更   | ±5行（参照変更のみ）        |
| `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`            | 参照変更   | +5〜+10行（コメント込み）   |
| テストファイル群（合計）                                                      | テスト修正 | +50〜+150行（新規TCが多い） |

### 確認コマンド

```bash
# 変更ファイルの差分行数を確認
git diff main --stat

# 特定ファイルの差分内容を確認
git diff main -- packages/shared/src/types/skillCreator.ts
git diff main -- apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
git diff main -- apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx
git diff main -- apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

### 超過時の判断基準

| 増減幅               | 対処                                                             |
| -------------------- | ---------------------------------------------------------------- |
| 想定の 1.5倍以内     | 許容（コメント・テストの増加は正当）                             |
| 想定の 2倍以上       | Phase 8 に戻り、不要なコード・コメントを整理する                 |
| 削除行が想定より多い | Phase 5 実装の意図しない削除がないか `git diff` で内容を精査する |

---

## 2. リンク整合確認

仕様書間のリンクが正しく解決できることを確認する。

### `index.md` のリンク整合

`docs/30-workflows/skill-wizard-multi-select-options/index.md` の Phase 一覧テーブルを確認する。

| Phase | 仕様書ファイル名                   | 存在確認                        |
| ----- | ---------------------------------- | ------------------------------- |
| 1     | `phase-1-requirements.md`          | 存在する（作成済み）            |
| 2     | `phase-2-design.md`                | 存在する（作成済み）            |
| 3     | `phase-3-design-review.md`         | 存在する（作成済み）            |
| 4     | `phase-4-test-creation.md`         | 存在する（Phase 4 作業後）      |
| 5     | `phase-5-implementation.md`        | 存在する（Phase 5 作業後）      |
| 6     | `phase-6-test-expansion.md`        | 存在する（Phase 6 作業後）      |
| 7     | `phase-7-coverage-verification.md` | 存在する（Phase 7 作業後）      |
| 8     | `phase-8-refactoring.md`           | 存在する（Phase 8 作業後）      |
| 9     | `phase-9-quality-assurance.md`     | 存在する（本ドキュメント）      |
| 10    | `phase-10-final-review.md`         | 未作成（Phase 10 着手時に作成） |
| 11    | `phase-11-manual-test.md`          | 未作成（Phase 11 着手時に作成） |
| 12    | `phase-12-documentation.md`        | 未作成（Phase 12 着手時に作成） |
| 13    | `phase-13-pr-creation.md`          | 未作成（Phase 13 着手時に作成） |

確認コマンド:

```bash
ls docs/30-workflows/skill-wizard-multi-select-options/
```

### 参照設計書の実在確認

`index.md` の「参照設計書」セクションに記載されたファイルパスが実際に存在することを確認する。

```bash
# 実装ファイルの存在確認
ls packages/shared/src/types/skillCreator.ts
ls apps/desktop/src/renderer/components/skill/wizard/ConversationRoundStep.tsx
ls apps/desktop/src/renderer/components/skill/wizard/ApplySummaryCard.tsx
ls apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

---

## 3. TypeScript 型安全性確認

### 3-1. `selectedOptions` の null 安全性

`selectedOptions: string[]` は空配列 `[]` を初期値とするため null になりえないが、
以下の観点で型安全性を確認する。

| 確認観点                                                             | 確認方法                                       | 期待結果                            |
| -------------------------------------------------------------------- | ---------------------------------------------- | ----------------------------------- |
| `selectedOptions` に `null` / `undefined` が代入されていない         | `pnpm typecheck`                               | コンパイルエラー 0件                |
| `selectedOptions[0]` のアクセス時に `??` フォールバックがある        | コードレビュー（`resolveExternalIntegration`） | `?? ""` または `?? null` が存在する |
| `selectedOptions.includes(...)` の呼び出しが配列に対して行われている | `pnpm typecheck`                               | コンパイルエラー 0件                |
| `createQuestionAnswer()` の戻り値が `QuestionAnswer` 型に適合する    | `pnpm typecheck`                               | コンパイルエラー 0件                |

### 3-2. `selectedOptions[0]` のアクセス安全性（M-01 対応確認）

`resolveExternalIntegration` 内の `selectedOptions[0]` は配列が空の場合に `undefined` を返すため、
`??` 演算子でフォールバックが必要。以下のパターンのみ許容する。

```typescript
// OK: undefined を空文字でフォールバック
const selected = (q5Answer.selectedOptions[0] ?? "").trim();

// NG: フォールバックなし（undefined が trim() に渡る）
const selected = q5Answer.selectedOptions[0].trim(); // コンパイルエラーにはならないが危険
```

確認コマンド（NG パターンの検出）:

```bash
grep -n "selectedOptions\[0\]\." \
  apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx
```

期待結果: ヒットなし（`[0]` の直後に `.` でメソッドチェーンしている箇所がない）

### 3-3. strict mode 対応確認

プロジェクトの `tsconfig.json` が `strict: true` であることを前提に、
以下の strict チェックが通ることを確認する。

| strict オプション     | 影響箇所                                                          |
| --------------------- | ----------------------------------------------------------------- |
| `strictNullChecks`    | `selectedOptions[0]` が `string \| undefined` と推論されること    |
| `noImplicitAny`       | `options.includes(defaultValue as QuestionOption)` のキャスト     |
| `strictFunctionTypes` | `handleOptionSelect` のシグネチャが親から渡す型と一致していること |

確認コマンド:

```bash
pnpm typecheck
```

期待結果: エラー 0件、警告 0件

---

## 4. 品質チェックコマンド

以下のコマンドをこの順序で実行し、すべてエラーなしで完了することを確認する。

### ステップ 1: TypeScript 型チェック

```bash
pnpm typecheck
```

- 対象: プロジェクト全体（`packages/shared`・`apps/desktop` を含む）
- 期待結果: `error TS` が 0件
- 失敗時の対処: エラーメッセージを確認し、型不整合箇所を修正する（主に `selectedOption` 残存の可能性）

### ステップ 2: ESLint

```bash
pnpm lint
```

- 対象: プロジェクト全体
- 期待結果: `error` が 0件（`warning` は許容するが、新規追加の warning は調査する）
- 失敗時の対処: `pnpm lint --fix` で自動修正を試み、修正不能な場合はコードを手修正する

### ステップ 3: 単体テスト

```bash
pnpm vitest run
```

または特定ファイルのみ実行する場合:

```bash
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/ConversationRoundStep.test.tsx
pnpm vitest run apps/desktop/src/renderer/components/skill/wizard/__tests__/ApplySummaryCard.test.tsx
pnpm vitest run apps/desktop/src/renderer/components/skill/__tests__/SkillCreateWizard.test.tsx
```

- 期待結果: すべてのテストが `PASS`
- 失敗時の対処: 失敗テストのスタックトレースを確認し、実装またはテストを修正する

### ステップ 4: ビルド確認

```bash
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build
```

- 期待結果: ビルドエラー 0件
- 目的: 型チェックとは別に、バンドル時のエラーがないことを確認する

---

## 5. 受け入れ基準の最終確認

Phase 1（要件定義）の受け入れ基準（AC-01〜AC-13）が実装・テストによって満たされていることを確認する。

| AC    | 確認方法                                    | ステータス |
| ----- | ------------------------------------------- | ---------- |
| AC-01 | `ConversationRoundStep` ユニットテスト PASS | 要確認     |
| AC-02 | `ConversationRoundStep` ユニットテスト PASS | 要確認     |
| AC-03 | 初期値テスト PASS                           | 要確認     |
| AC-04 | Q3 特殊処理テスト PASS                      | 要確認     |
| AC-05 | Q3 特殊処理テスト PASS                      | 要確認     |
| AC-06 | Q3 複数選択テスト PASS                      | 要確認     |
| AC-07 | SmartDefaults テスト PASS                   | 要確認     |
| AC-08 | SmartDefaults テスト PASS                   | 要確認     |
| AC-09 | DOM アサーション PASS                       | 要確認     |
| AC-10 | `ApplySummaryCard` テスト PASS              | 要確認     |
| AC-11 | `pnpm typecheck` エラー 0件                 | 要確認     |
| AC-12 | `pnpm lint` エラー 0件                      | 要確認     |
| AC-13 | `resolveExternalIntegration` テスト PASS    | 要確認     |

**全 AC が「PASS」になった時点で本 Phase を完了とし、Phase 10（最終レビュー）に移行する。**

---

## 6. 完了条件

| 条件                                                  | 確認コマンド / 方法                 |
| ----------------------------------------------------- | ----------------------------------- |
| `pnpm typecheck` がエラー 0件                         | コマンド実行結果                    |
| `pnpm lint` がエラー 0件                              | コマンド実行結果                    |
| `pnpm vitest run` が全件 PASS                         | テスト実行結果                      |
| `pnpm --filter @repo/shared build` がエラー 0件       | コマンド実行結果                    |
| `pnpm --filter @repo/desktop build` がエラー 0件      | コマンド実行結果                    |
| ラインバジェットが想定の 2倍を超えていない            | `git diff main --stat` で確認       |
| Phase 1 受け入れ基準 AC-01〜AC-13 がすべて PASS       | テスト実行結果 + コードレビュー     |
| `index.md` のリンクが Phase 9 まで正しく解決できる    | `ls` コマンドで存在確認             |
| `selectedOptions[0]` に `??` フォールバックが存在する | コードレビュー（`grep` による確認） |

---

## 参照ドキュメント

| ドキュメント          | パス                                                   |
| --------------------- | ------------------------------------------------------ |
| 要件定義              | [phase-1-requirements.md](./phase-1-requirements.md)   |
| 設計                  | [phase-2-design.md](./phase-2-design.md)               |
| 設計レビュー（MINOR） | [phase-3-design-review.md](./phase-3-design-review.md) |
| 前フェーズ            | [phase-8-refactoring.md](./phase-8-refactoring.md)     |
| 次フェーズ            | phase-10-final-review.md（Phase 10 着手時に作成）      |

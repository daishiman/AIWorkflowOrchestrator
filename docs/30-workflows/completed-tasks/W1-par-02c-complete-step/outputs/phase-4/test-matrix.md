# Phase 4 成果物: テストマトリクス

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| Phase      | 4                                           |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                  |
| 機能名     | CompleteStep 完了画面再設計（起点画面化）   |
| 作成日     | 2026-04-08                                  |
| ステータス | completed（テスト仕様確定。実装は Phase 5） |

---

## テストファイル情報

| 項目                 | 内容                                                                                |
| -------------------- | ----------------------------------------------------------------------------------- |
| 対象ファイル         | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                |
| テストファイル       | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` |
| テストフレームワーク | Vitest + @testing-library/react                                                     |
| 環境制約             | happy-dom 環境 → `fireEvent` のみ使用（`userEvent` 禁止 / P39 準拠）                |

---

## テストユーティリティ設計

```typescript
const defaultProps: CompleteStepProps = {
  generatedSkill: null,
  hasExternalIntegration: false,
  onQualityFeedback: vi.fn(),
};

const renderCompleteStep = (props?: Partial<CompleteStepProps>) =>
  render(<CompleteStep {...defaultProps} {...props} />);
```

---

## テストケース一覧

### カテゴリ 1: 基本レンダリング（5 件）

| TC#  | テスト名                                           | 検証方法                                                    | 対応要件 |
| ---- | -------------------------------------------------- | ----------------------------------------------------------- | -------- |
| T-01 | 完了ヘッダーが表示される                           | `data-testid="complete-step-header"` が DOM に存在する      | FR-01    |
| T-02 | ヘッダーに「スキルの骨格を生成しました」が含まれる | テキスト検索                                                | FR-01    |
| T-03 | 👍 フィードバックボタンが表示される                | `data-testid="complete-step-feedback-satisfied"` 存在確認   | FR-02    |
| T-04 | 👎 フィードバックボタンが表示される                | `data-testid="complete-step-feedback-unsatisfied"` 存在確認 | FR-02    |
| T-05 | `generatedSkill=null` でも正常レンダリングされる   | エラーなし・クラッシュなし                                  | FR-01    |

### カテゴリ 2: ネクストアクション 3 カード（4 件）

| TC#  | テスト名                                              | 検証方法                                                     | 対応要件 |
| ---- | ----------------------------------------------------- | ------------------------------------------------------------ | -------- |
| T-06 | 「今すぐ実行する」カードが存在する                    | `data-testid="complete-step-action-execute"` 存在確認        | FR-03    |
| T-07 | 「エディタで開く」カードが存在する                    | `data-testid="complete-step-action-open-editor"` 存在確認    | FR-03    |
| T-08 | 「別のスキルを作る」カードが存在する                  | `data-testid="complete-step-action-create-another"` 存在確認 | FR-03    |
| T-09 | `onExecuteNow` 未指定の場合カードが `disabled` になる | `aria-disabled="true"` または `disabled` 属性確認            | FR-07    |

### カテゴリ 3: ネクストアクション ハンドラ（3 件）

| TC#  | テスト名                                                    | 検証方法                     | 対応要件 |
| ---- | ----------------------------------------------------------- | ---------------------------- | -------- |
| T-10 | 「今すぐ実行する」クリックで `onExecuteNow` が呼ばれる      | `vi.fn()` の呼び出し回数 = 1 | FR-07    |
| T-11 | 「エディタで開く」クリックで `onOpenInEditor` が呼ばれる    | `vi.fn()` の呼び出し回数 = 1 | FR-08    |
| T-12 | 「別のスキルを作る」クリックで `onCreateAnother` が呼ばれる | `vi.fn()` の呼び出し回数 = 1 | FR-09    |

### カテゴリ 4: 品質フィードバック（4 件）

| TC#  | テスト名                                            | 検証方法                                                 | 対応要件 |
| ---- | --------------------------------------------------- | -------------------------------------------------------- | -------- |
| T-13 | 👍 クリックで `onQualityFeedback(true)` が呼ばれる  | `vi.fn()` 引数確認                                       | FR-02    |
| T-14 | 👎 クリックで `onQualityFeedback(false)` が呼ばれる | `vi.fn()` 引数確認                                       | FR-02    |
| T-15 | 👎 クリックで `onRetry` が呼ばれる                  | `onRetry` の `vi.fn()` 呼び出し回数 = 1                  | FR-04    |
| T-16 | フィードバック送信後は二重送信されない              | 👍 を 2 回クリックしても `onQualityFeedback` は 1 回のみ | FR-02    |

### カテゴリ 5: 外部連携チェックリスト（4 件）

| TC#  | テスト名                                                       | 検証方法                                                    | 対応要件 |
| ---- | -------------------------------------------------------------- | ----------------------------------------------------------- | -------- |
| T-17 | `hasExternalIntegration=true` の場合チェックリストが表示される | `data-testid="complete-step-external-checklist"` 存在確認   | FR-06    |
| T-18 | `hasExternalIntegration=false` の場合チェックリストが非表示    | `data-testid="complete-step-external-checklist"` 非存在確認 | FR-06    |
| T-19 | Webhook チェックボックスをクリックでトグルできる               | `checked` 状態の変化確認                                    | FR-06    |
| T-20 | 設定ボタンは表示されない                                       | 「今すぐ設定」ボタンが存在しないことを確認                  | FR-06    |

---

## 対応要件カバレッジ

| 要件ID | テストケース                         | カバー状況   |
| ------ | ------------------------------------ | ------------ |
| FR-01  | T-01, T-02, T-05                     | OK           |
| FR-02  | T-03, T-04, T-13〜T-16               | OK           |
| FR-03  | T-06, T-07, T-08                     | OK           |
| FR-04  | T-15                                 | OK           |
| FR-05  | スコープ外（W2-seq-03a）             | 境界確認済み |
| FR-06  | T-17〜T-20                           | OK           |
| FR-07  | T-09, T-10                           | OK           |
| FR-08  | T-11                                 | OK           |
| FR-09  | T-12                                 | OK           |
| NFR-01 | Phase 6 アクセシビリティテストで補完 | Phase 6      |
| NFR-02 | T-01〜T-20 全体で data-testid 確認   | OK           |

---

## 完了確認

- [x] テストケース一覧が作成されている（計 20 件）
- [x] 基本レンダリングテストが記述されている
- [x] 👍/👎 フィードバックテストが記述されている
- [x] ネクストアクション 3 カードのテストが記述されている
- [x] 外部連携チェックリストの条件付き表示テストが記述されている
- [x] リカバリーフロー（👎 → `onRetry`）のテストが記述されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

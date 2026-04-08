# Phase 4 成果物: テストマトリクス

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 4                                         |
| タスクID   | UT-SKILL-WIZARD-W1-COMPLETE-STEP-001      |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 作成日     | 2026-04-08                                |
| ステータス | completed                                 |

## テストファイル

`apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx`

## テストケース対応表（Phase 4: 基本テスト）

### 基本レンダリング

| テストID | テスト内容                                    | 対応要件 | ステータス |
| -------- | --------------------------------------------- | -------- | ---------- |
| R-01     | 完了ヘッダーが表示される                      | FR-01    | PASS       |
| R-02     | 👍フィードバックボタンが表示される            | FR-02    | PASS       |
| R-03     | 👎フィードバックボタンが表示される            | FR-02    | PASS       |
| R-04     | ネクストアクション3カードが全て表示される     | FR-03    | PASS       |
| R-05     | generatedSkill が null でもレンダリングできる | -        | PASS       |
| R-06     | ルートコンテナにdata-testidが付与されている   | NFR-02   | PASS       |

### 品質フィードバック

| テストID | テスト内容                                     | 対応要件 | ステータス |
| -------- | ---------------------------------------------- | -------- | ---------- |
| F-01     | 👍クリックでonQualityFeedback(true)が呼ばれる  | FR-02    | PASS       |
| F-02     | 👎クリックでonQualityFeedback(false)が呼ばれる | FR-02    | PASS       |
| F-03     | 👎クリックでonRetryが呼ばれる                  | FR-04    | PASS       |
| F-04     | onRetryが未指定でも👎クリックで正常動作        | FR-04    | PASS       |
| F-05     | フィードバック送信後は二重送信されない         | FR-02    | PASS       |

### ネクストアクションカード

| テストID | テスト内容                                                    | 対応要件 | ステータス |
| -------- | ------------------------------------------------------------- | -------- | ---------- |
| N-01     | 「今すぐ実行する」カードクリックでonExecuteNowが呼ばれる      | FR-07    | PASS       |
| N-02     | 「エディタで開く」カードクリックでonOpenInEditorが呼ばれる    | FR-08    | PASS       |
| N-03     | 「別のスキルを作る」カードクリックでonCreateAnotherが呼ばれる | FR-09    | PASS       |
| N-04     | onExecuteNowが未指定の場合カードがdisabledになる              | FR-07    | PASS       |
| N-05     | onOpenInEditorが未指定の場合カードがdisabledになる            | FR-08    | PASS       |
| N-06     | onCreateAnotherが未指定の場合カードがdisabledになる           | FR-09    | PASS       |
| N-07     | ハンドラが指定されている場合カードはdisabledでない            | -        | PASS       |

### 外部連携チェックリスト

| テストID | テスト内容                                               | 対応要件 | ステータス |
| -------- | -------------------------------------------------------- | -------- | ---------- |
| E-01     | hasExternalIntegration=trueの場合チェックリストが表示    | FR-06    | PASS       |
| E-02     | hasExternalIntegration=falseの場合チェックリストが非表示 | FR-06    | PASS       |
| E-03     | Webhookチェックボックスをクリックでトグルできる          | FR-06    | PASS       |
| E-04     | テスト実行チェックボックスをクリックでトグルできる       | FR-06    | PASS       |

## テストユーティリティ

```typescript
const defaultProps: CompleteStepProps = {
  generatedSkill: null,
  hasExternalIntegration: false,
  onQualityFeedback: vi.fn(),
};

const renderCompleteStep = (props?: Partial<CompleteStepProps>) =>
  render(<CompleteStep {...defaultProps} {...props} />);
```

## テスト実行結果

- 実行日: 2026-04-08
- テスト件数（Phase 4): 20件
- 全件PASS: ✅

## 完了確認

- [x] テストファイルが作成されている
- [x] 基本レンダリングテストが記述されている
- [x] 👍/👎フィードバックテストが記述されている
- [x] ネクストアクション3カードのテストが記述されている
- [x] 外部連携チェックリストの条件付き表示テストが記述されている
- [x] リカバリーフロー（👎→onRetry）のテストが記述されている
- [x] 本Phase内の全タスクを100%実行完了

# Phase 6: テスト拡充

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 6                                         |
| Phase名    | テスト拡充                                |
| タスクID   | UT-SKILL-WIZARD-W1-par-02c                |
| 機能名     | CompleteStep 完了画面再設計（起点画面化） |
| 前提Phase  | Phase 5: 実装                             |
| 次Phase    | Phase 7: カバレッジ確認                   |
| ステータス | pending                                   |
| 作成日     | 2026-04-07                                |

## 目的

Phase 4 で作成したテストに加え、エッジケース・統合シナリオ・アクセシビリティテストを拡充し、カバレッジを向上させる。

## 実行タスク

### Task 1: エッジケーステスト追加

```typescript
describe("エッジケース", () => {
  it("generatedSkill=nullでも正常にレンダリングされる", () => {
    // generatedSkill=null で renderCompleteStep() → エラーなし
  });

  it("externalToolNameが未指定の場合にデフォルト名が表示される", () => {
    // hasExternalIntegration=true, externalToolName=undefined
    // → 「外部ツール」が表示される
  });

  it("全てのオプショナルPropsが未指定でも正常動作する", () => {
    // onExecuteNow, onOpenInEditor, onCreateAnother, onRetry 全て undefined
    // → クラッシュしない
  });

  it("非常に長いexternalToolNameでもUI崩れなし", () => {
    // externalToolName="非常に長いSlack Webhook URLを持つ外部連携ツール" → truncate確認
  });
});
```

### Task 2: 統合シナリオテスト追加

```typescript
describe("統合シナリオ", () => {
  it("リカバリーフロー全体が正しく動作する", async () => {
    const onQualityFeedback = vi.fn();
    const onRetry = vi.fn();
    // 1. 👎ボタンをクリック
    // 2. onQualityFeedback(false) が呼ばれる
    // 3. onRetry() が呼ばれる
    // 4. フィードバックボタンが disabled になる（二重送信防止）
  });

  it("外部連携ありで全チェック完了後の状態が正しい", async () => {
    // hasExternalIntegration=true
    // webhookCheckをクリック → checked=true
    // testRunCheckをクリック → checked=true
    // 両方 checked 状態を確認
  });

  it("ネクストアクション → フィードバックの順で操作しても正常動作する", async () => {
    const onExecuteNow = vi.fn();
    const onQualityFeedback = vi.fn();
    // 「今すぐ実行する」クリック → onExecuteNow()
    // その後👍クリック → onQualityFeedback(true)
    // 両方正常に呼ばれる
  });
});
```

### Task 3: アクセシビリティテスト追加

```typescript
describe("アクセシビリティ", () => {
  it("完了ヘッダーにrole=statusが付与されている", () => {
    // complete-step-header の role="status" を確認
  });

  it("フィードバックボタンにaria-labelが付与されている", () => {
    // 👍ボタン: aria-label="期待通り"
    // 👎ボタン: aria-label が存在する
  });

  it("disabled状態のカードにaria-disabledが付与されている", () => {
    // onExecuteNow=undefined → aria-disabled="true"
  });

  it("チェックボックスにaria-checkedが反映される", async () => {
    // hasExternalIntegration=true
    // Webhookチェック前: aria-checked="false"
    // クリック後: aria-checked="true"
  });
});
```

### Task 4: スナップショットテスト追加

```typescript
describe("スナップショット", () => {
  it("標準表示のスナップショットが一致する", () => {
    // hasExternalIntegration=false での snapshot
  });

  it("外部連携あり表示のスナップショットが一致する", () => {
    // hasExternalIntegration=true, externalToolName="Slack" での snapshot
  });
});
```

### Task 5: テスト実行・確認

```bash
pnpm --filter @repo/desktop vitest run -- CompleteStep
```

## 参照資料

| 資料名         | パス                                                                                | 説明       |
| -------------- | ----------------------------------------------------------------------------------- | ---------- |
| テストファイル | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | 拡充対象   |
| 実装ファイル   | `apps/desktop/src/renderer/components/skill/wizard/CompleteStep.tsx`                | 実装確認用 |

## 成果物

| 成果物         | パス                                                                                | 説明                   |
| -------------- | ----------------------------------------------------------------------------------- | ---------------------- |
| 拡充済みテスト | `apps/desktop/src/renderer/components/skill/wizard/__tests__/CompleteStep.test.tsx` | エッジケース含む一式   |
| テスト拡充記録 | `outputs/phase-6/test-expansion.md`                                                 | 追加テストケースの説明 |

## 完了条件

- [ ] エッジケーステストが追加されている（5件以上）
- [ ] 統合シナリオテストが追加されている（3件以上）
- [ ] アクセシビリティテストが追加されている（4件以上）
- [ ] スナップショットテストが追加されている
- [ ] 全テストがpassしている
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次Phase

→ [Phase 7: カバレッジ確認](./phase-7-coverage.md)

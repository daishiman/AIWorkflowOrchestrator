# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                       |
| ---------- | ------------------------------------------ |
| Phase      | 4                                          |
| タスクID   | UT-SKILL-WIZARD-W2-seq-03a                 |
| 機能名     | SkillCreateWizard オーケストレーション更新 |
| 前提Phase  | Phase 3                                    |
| 後続Phase  | Phase 5                                    |
| 作成日     | 2026-04-07                                 |
| ステータス | pending                                    |

## 目的

実装前に Red（失敗）状態のテストを定義し、TDD サイクルの起点を固める。

## テスト対象

| テスト対象                                   | テスト種別     | 目的                                                 |
| -------------------------------------------- | -------------- | ---------------------------------------------------- |
| `inferSmartDefaults`                         | ユニットテスト | 推論ルールの正確性検証                               |
| `handleStep0Next`                            | 統合テスト     | formData → smartDefaults → Step遷移                  |
| `handleGenerate("complete")`                 | 統合テスト     | complete フラグ付き LLM 生成呼び出し                 |
| `handleGenerate("skip")`                     | 統合テスト     | skip フラグ付き LLM 生成呼び出し                     |
| `handleQualityFeedback`                      | ユニットテスト | trackEvent 呼び出し確認                              |
| `handleRetry`                                | 統合テスト     | Step 0 への復帰と入力プリフィル維持                  |
| `skillPath` 受け渡し                         | 統合テスト     | 完了画面への生成結果伝達                             |
| `CompleteStep` action cards                  | ユニットテスト | 今すぐ実行/エディタ/別作成の導線確認                 |
| `CompleteStep` 外部連携表示                  | ユニットテスト | hasExternalIntegration / externalToolName の表示分岐 |
| STEPS 配列                                   | ユニットテスト | ステップ名称の正確性                                 |
| `GenerateStep` の `generationMode` prop 削除 | ユニットテスト | LLM 専用化後にモード依存が残らないこと               |

## テストケース定義

### inferSmartDefaults テスト

```typescript
describe("inferSmartDefaults", () => {
  it("目的に'Slack'を含む場合、tool='slack'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "Slack通知を送る",
      category: "automation",
    });
    expect(result.tool).toBe("slack");
  });

  it("目的に'毎日'を含む場合、timing='scheduled'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "毎日レポートを生成する",
      category: "automation",
    });
    expect(result.timing).toBe("scheduled");
  });

  it("category='code-support'の場合、format='code'を推論すること", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "コードレビューを行う",
      category: "code-support",
    });
    expect(result.format).toBe("code");
  });

  it("推論対象キーワードが含まれない場合、nullを返すこと", () => {
    const result = inferSmartDefaults({
      skillName: "テスト",
      purpose: "汎用的なタスク",
      category: null,
    });
    expect(result.tool).toBeNull();
    expect(result.timing).toBeNull();
    expect(result.format).toBeNull();
  });
});
```

### STEPS 配列テスト

```typescript
describe("STEPS", () => {
  it("STEPS配列が['スキル情報入力','詳細設定','生成','完了']であること", () => {
    expect(STEPS).toEqual(["スキル情報入力", "詳細設定", "生成", "完了"]);
  });
});
```

### 旧 state / legacy prop 削除確認テスト

```typescript
describe("SkillCreateWizard（legacy state削除後）", () => {
  it("テンプレート生成の切り替えUIが存在しないこと", () => {
    const { queryByTestId } = render(<SkillCreateWizard />);
    expect(queryByTestId("generation-mode-selector")).toBeNull();
  });

  it("GenerateStep に generationMode prop を渡さないこと", () => {
    // Step 2 レンダリング時に generationMode prop が存在しないことを確認
  });

  it("description / options の旧入力 state が残らないこと", () => {
    // Step 0 の新UIのみが表示され、旧 description/options UI が存在しないことを確認
  });
});
```

### handleStep0Next テスト

```typescript
describe("handleStep0Next", () => {
  it("formData を受け取り、smartDefaults を推論して Step 1 へ遷移すること", async () => {
    const { getByTestId } = render(<SkillCreateWizard />);
    // Step 0 の SkillInfoStep で onNext を呼び出す
    // Step 1（ConversationRoundStep）が表示されることを確認
  });
});
```

### handleRetry テスト

```typescript
describe("handleRetry", () => {
  it("CompleteStep から Step 0 に戻り、前回入力を保持すること", () => {
    // 完了画面で onRetry を呼び出す
    // currentStep が 0 に戻り、Step 0 の入力値が再表示されることを確認
  });
});
```

### CompleteStep action cards テスト

```typescript
describe("CompleteStep action cards", () => {
  it("今すぐ実行する / エディタで開く / 別のスキルを作る の各カードがクリック可能であること", () => {
    // CompleteStep で各 data-testid を確認し、クリック時に対応する handler が呼ばれることを確認
  });

  it("hasExternalIntegration=true のとき外部連携チェックリストが表示されること", () => {
    // externalToolName を含む外部連携チェック項目が表示されることを確認
  });
});
```

## 参照資料

| 資料名             | パス                                      | 用途           |
| ------------------ | ----------------------------------------- | -------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3 成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`        | Phase 3 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`  | Phase 2 成果物 |
| 推論フローチャート | `outputs/phase-2/inference-flowchart.md`  | Phase 2 成果物 |

## 実行手順

1. Phase 3 成果物を確認し、ゲート判定が PASS であることを確認する。
2. テストファイルを `__tests__/SkillCreateWizard.test.tsx` と `__tests__/GenerateStep.test.tsx` に作成する。
3. 全テストケースが Red（失敗）状態であることを確認する。
4. テスト仕様書として成果物を出力する。

## 成果物

| 成果物         | パス                                       | 説明                 |
| -------------- | ------------------------------------------ | -------------------- |
| テスト仕様書   | `outputs/phase-4/test-specification.md`    | テストケース一覧     |
| Red テスト結果 | `outputs/phase-4/red-test-result.md`       | 実装前の失敗確認記録 |
| 統合テスト計画 | `outputs/phase-4/integration-test-plan.md` | 統合テストシナリオ   |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] `inferSmartDefaults` の全推論ルールのテストが定義されていること
- [ ] 旧 state / legacy prop 削除確認テストが定義されていること
- [ ] `handleRetry` / `skillPath` の接続確認テストが定義されていること
- [ ] `CompleteStep` action cards / 外部連携表示のテストが定義されていること
- [ ] STEPS 配列テストが定義されていること
- [ ] 全テストが Red（失敗）状態であることが確認されていること
- [ ] 矛盾がないことを確認
- [ ] 漏れがないことを確認
- [ ] 本Phase内の全タスクを100%実行完了

## サブタスク管理

1. 参照資料の確認
2. テストケース設計
3. テストファイル作成（Red段階）
4. Red状態確認
5. 成果物出力

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次のPhase

Phase 5: 実装

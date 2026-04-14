# Phase 4: テスト作成

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| Phase      | 4                                                             |
| タスクID   | TASK-SW-FIX-MODE-MGMT-001                                     |
| 機能名     | generationModeラジオボタン廃止・LLM専用化・Step 1スキップ修正 |
| 前提Phase  | Phase 3                                                       |
| 後続Phase  | Phase 5                                                       |
| 作成日     | 2026-04-12                                                    |
| ステータス | completed                                                     |

## 目的

実装前に Red（失敗）状態のテストを定義し、`test-specification.md` と `test-cases.md` で command suite / expected result を固定する。

## テスト方針

- Phase 4 では Red を先に固定し、実装前に失敗が再現できることを確認する。
- `test-specification.md` には command suite と expected result の対応を記録する。
- `test-cases.md` には各 TC の詳細、前提、期待 UI、必要なモックを記録する。
- 正規フローは Step 0→Step 1→Step 2→Step 3 まで到達することを必須とする。
- 旧 template 系の残骸は検出対象として残し、LLM 専用化後に 0 件へ収束させる。

## テストマトリクス

| TC-ID | シナリオ                                                    | command suite                                                                                                      | expected result                         |
| ----- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------- | ------------------------------------------------------- | ----------------------------------------- |
| TC-01 | Step 0 にラジオボタンが表示されない                         | `render(<SkillCreateWizard />)` → `queryByText("テンプレートから作成")` / `queryByText("LLMで生成")`               | どちらも `null`                         |
| TC-02 | `generationMode` / `hasActivatedLlmMode` state の残骸がない | `render(<SkillCreateWizard />)` → `queryByTestId("generation-mode-selector")`                                      | selector が見つからない                 |
| TC-03 | Step 0 の次へで Step 1 に遷移する                           | `render(<SkillCreateWizard />)` → `click(step0-next-button)` → `waitFor(conversation-round-step)`                  | Step 1 が表示される                     |
| TC-04 | Step 1 をスキップして Step 2 へ直接遷移できない             | `render(<SkillCreateWizard />)` → `click(step0-next-button)` → `assert(generate-step is null)`                     | Step 2 は表示されず Step 1 が維持される |
| TC-05 | 正規フローで Step 3 まで到達する                            | `render(<SkillCreateWizard />)` → `click(step0-next-button)` → `click(generate-button)` → `waitFor(complete-step)` | Step 0→1→2→3 を順番に通過する           |
| TC-06 | 旧 template 系テスト残骸が消えている                        | `rg -n "generationMode                                                                                             | hasActivatedLlmMode                     | テンプレートから作成 | LLMで生成" apps/desktop/src/renderer/components/skill/` | 参照残骸が 0 件、または新フローへ更新済み |

## テストケース詳細

### TC-05: 正規フロー通過確認

```typescript
describe("SkillCreateWizard - LLM専用フロー", () => {
  it("Step 0→Step 1→Step 2→Step 3 の順番で遷移すること", async () => {
    const { getByTestId, queryByTestId } = render(<SkillCreateWizard />);
    expect(getByTestId("skill-info-step")).toBeInTheDocument();

    fireEvent.click(getByTestId("step0-next-button"));
    await waitFor(() => {
      expect(getByTestId("conversation-round-step")).toBeInTheDocument();
    });

    fireEvent.click(getByTestId("generate-button"));
    await waitFor(() => {
      expect(getByTestId("generate-step")).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(getByTestId("complete-step")).toBeInTheDocument();
    });
    expect(queryByTestId("generation-mode-selector")).toBeNull();
  });
});
```

## 参照資料

| 資料名             | パス                                      | 用途           |
| ------------------ | ----------------------------------------- | -------------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Phase 3 成果物 |
| ゲート判定         | `outputs/phase-3/gate-decision.md`        | Phase 3 成果物 |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`  | Phase 2 成果物 |
| フロー比較図       | `outputs/phase-2/flow-comparison.md`      | Phase 2 成果物 |

## 実行手順

1. Phase 3 成果物を確認し、ゲート判定が PASS であることを確認する。
2. テストファイルを `__tests__/SkillCreateWizard.test.tsx` に追加・修正する。
3. 全テストケースが Red（失敗）状態であることを確認する。
4. `test-specification.md` と `test-cases.md` を成果物として出力する。

## 成果物

| 成果物             | パス                                    | 説明                                    |
| ------------------ | --------------------------------------- | --------------------------------------- |
| テスト仕様書       | `outputs/phase-4/test-specification.md` | command suite と expected result を整理 |
| テストケース定義書 | `outputs/phase-4/test-cases.md`         | TC-01〜TC-06 の詳細定義とコード例       |

## 完了条件

- [ ] 実行タスクで定義した成果物を全件作成
- [ ] ラジオボタンUI削除確認テストが定義されていること
- [ ] `generationMode` / `hasActivatedLlmMode` 廃止確認テストが定義されていること
- [ ] Step 0→Step 1 遷移確認テストが定義されていること
- [ ] Step 1スキップ禁止テストが定義されていること
- [ ] 正規フロー通過確認テストが定義されていること
- [ ] 旧 template 系テスト残骸の確認が定義されていること
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

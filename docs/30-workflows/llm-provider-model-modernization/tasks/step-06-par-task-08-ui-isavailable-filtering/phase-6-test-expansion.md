# Phase 6: テスト拡充 -- UI isAvailable フィルタリング実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 6                        |
| 機能名     | ui-isavailable-filtering |
| タスクID   | TASK-LLM-MOD-08          |
| 作成日     | 2026-03-23               |
| ステータス | 実施済み                 |
| 依存 Phase | Phase 5（実装）          |

## 目的

Phase 5 の実装完了後、Phase 4 で追加したテストのカバレッジ不足を補完する。境界値・エッジケース・ライフサイクルテストを追加し、カバレッジ基準（Line: 80%、Branch: 60%、Function: 80%）を達成する。

## 実行タスク

### Task 6-1: カバレッジ測定

Phase 5 の実装完了後、以下でカバレッジを測定した：

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx --coverage
```

カバレッジレポートから `InlineModelSelector.tsx` のカバレッジ数値を確認した。

### Task 6-2: 追加テストケース実装

以下のテストを追加した。

#### テストブロック: `InlineModelSelector - isAvailable 拡充テスト（TASK-LLM-MOD-08）`

| テストID | テストケース                                         | 検証内容                                               |
| -------- | ---------------------------------------------------- | ------------------------------------------------------ |
| T-06     | APIキー設定 -> 未設定 -> 再設定のライフサイクル      | Provider の isAvailable が動的に変化した際の表示追従   |
| T-07     | Provider fetch 後の isAvailable 変化                 | Store 経由でプロバイダー情報が更新された際のフィルタ   |
| T-08     | compact mode でのフィルタ動作                        | compact 表示モードでも isAvailable フィルタが動作する  |
| T-09     | onSelectionChange がフィルタ済みプロバイダーのみ発火 | 利用不可プロバイダーは選択不可のためコールバック未発火 |

```typescript
describe("InlineModelSelector - isAvailable 拡充テスト（TASK-LLM-MOD-08）", () => {
  describe("T-06: APIキーライフサイクル", () => {
    it("should update displayed providers when isAvailable changes", () => {
      // 初回: Anthropic(true), OpenAI(false), Google(true) -> 2件表示
      // 再レンダー: OpenAI(true) に変更 -> 3件表示
      // 再レンダー: Anthropic(false) に変更 -> 2件表示（OpenAI, Google）
    });
  });

  describe("T-07: Provider fetch 後の isAvailable 変化", () => {
    it("should reflect isAvailable changes after provider refetch", () => {
      // Store 経由でプロバイダー情報が更新された際に
      // フィルタ結果が即座に反映されることを確認
    });
  });

  describe("T-08: compact mode でのフィルタ動作", () => {
    it("should filter providers in compact mode as well", () => {
      // compact={true} props を渡した状態でも
      // isAvailable フィルタが正しく動作することを確認
    });
  });

  describe("T-09: onSelectionChange コールバック", () => {
    it("should fire onSelectionChange only for available providers", () => {
      // 利用可能プロバイダー選択時にコールバックが発火する
      // 利用不可プロバイダーは選択肢に現れないため発火しない
    });
  });
});
```

### Task 6-3: カバレッジ再測定

追加テスト実装後に再度カバレッジを測定し、基準達成を確認した：

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx --coverage
```

結果（`InlineModelSelector.tsx` のみ）:

- Line Coverage: 80% 以上 -- 達成
- Branch Coverage: 60% 以上 -- 達成
- Function Coverage: 80% 以上 -- 達成

## 参照資料

| 資料名             | パス                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Phase 4 テスト     | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-4-test-creation.md` |
| 現行テストファイル | `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`                                                |
| コード品質ルール   | `.claude/rules/02-code-quality.md`（カバレッジ基準）                                                                             |

## 成果物

| 成果物                       | パス                                                                              | 形式       |
| ---------------------------- | --------------------------------------------------------------------------------- | ---------- |
| 拡充済みテストファイル       | `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx` | TypeScript |
| カバレッジレポート（確認用） | `apps/desktop/coverage/`（実行時生成）                                            | HTML/JSON  |

## 完了条件

- [x] Phase 5 の全テストが PASS していることを確認した
- [x] T-06（APIキーライフサイクル）テストを追加した
- [x] T-07（Provider fetch 後の isAvailable 変化）テストを追加した
- [x] T-08（compact mode でのフィルタ動作）テストを追加した
- [x] T-09（onSelectionChange コールバック）テストを追加した
- [x] `InlineModelSelector.tsx` の Line Coverage が 80% 以上であることを確認した
- [x] `InlineModelSelector.tsx` の Branch Coverage が 60% 以上であることを確認した
- [x] `InlineModelSelector.tsx` の Function Coverage が 80% 以上であることを確認した

## 次の Phase

Phase 7: カバレッジ確認（`phase-7-coverage.md`）

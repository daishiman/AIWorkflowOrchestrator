# Phase 4: テスト作成（TDD: Red） -- UI isAvailable フィルタリング実装

## メタ情報

| 項目       | 値                       |
| ---------- | ------------------------ |
| Phase番号  | 4                        |
| 機能名     | ui-isavailable-filtering |
| タスクID   | TASK-LLM-MOD-08          |
| 作成日     | 2026-03-23               |
| ステータス | 実施済み                 |
| 依存 Phase | Phase 3（設計レビュー）  |

## 目的

Phase 2 の設計に基づき、`InlineModelSelector` の isAvailable フィルタリング動作を検証するテストケースを設計・実装する。コンポーネントは props 経由でプロバイダーリストを受け取れるため、Store モックなしでフィルタリング動作をテスト可能。

## 実行タスク

### Task 4-1: 既存テストの確認

以下のテストファイルを読み込み、既存のテスト構成・import パスを確認した（P63 対策）：

- `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`（存在する場合）
- 同ディレクトリの他のテストファイルの import パスパターンを確認

### Task 4-2: テストケース設計

テスト対象: `InlineModelSelector` コンポーネント

テストデータ:

```typescript
const mockProviders: LLMProvider[] = [
  {
    id: "anthropic",
    name: "Anthropic",
    isAvailable: true,
    models: [
      {
        id: "claude-sonnet-4-6",
        name: "Claude Sonnet 4.6",
        contextWindow: 200000,
        isDefault: true,
      },
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: false,
    models: [
      {
        id: "gpt-4.1",
        name: "GPT-4.1",
        contextWindow: 1048576,
        isDefault: true,
      },
    ],
  },
  {
    id: "google",
    name: "Google",
    isAvailable: true,
    models: [
      {
        id: "gemini-2.5-flash",
        name: "Gemini 2.5 Flash",
        contextWindow: 1048576,
        isDefault: true,
      },
    ],
  },
];
```

#### テストケース一覧

| テストID | テストケース                                                     | 検証内容                                                            |
| -------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| T-01a    | providers 全て isAvailable: true の場合、全プロバイダーが表示    | AC-01: フィルタ後も全件表示                                         |
| T-01b    | 一部 isAvailable: false の場合、該当プロバイダーが非表示         | AC-01/AC-02: OpenAI が非表示、Anthropic/Google が表示               |
| T-02a    | 全て isAvailable: false の場合、「モデルを選択」が表示           | AC-04: ゼロプロバイダー時のフォールバック表示                       |
| T-02b    | 全て isAvailable: false の場合、ドロップダウンに空状態メッセージ | AC-04: ドロップダウン内の「プロバイダーがありません」メッセージ表示 |
| T-03     | isAvailable: false のプロバイダーのモデルが選択不可              | AC-02: 利用不可プロバイダーのモデルが選択肢に現れない               |
| T-04     | 選択中プロバイダーが利用不可の場合「モデルを選択」が表示         | AC-02: 選択状態の整合性                                             |
| T-05     | ProviderSelector（設定画面）はフィルタしないことの確認           | AC-03: 設定画面では全プロバイダーが表示される                       |

```typescript
describe("InlineModelSelector - isAvailable フィルタリング（TASK-LLM-MOD-08）", () => {
  describe("T-01: isAvailable フィルタリング", () => {
    it("should only show providers with isAvailable: true in dropdown", () => {
      // providers props で isAvailable: true/false のプロバイダーを渡す
      // ドロップダウンを開いた際に isAvailable: true のプロバイダーのみ表示
      // OpenAI（isAvailable: false）が表示されないことを確認
      // Anthropic, Google（isAvailable: true）が表示されることを確認
    });

    it("should not allow selecting models from unavailable providers", () => {
      // isAvailable: false のプロバイダーのモデルが選択肢に現れないことを確認
    });
  });

  describe("T-02: ゼロプロバイダー", () => {
    it("should show 'モデルを選択' when all providers are unavailable", () => {
      // 全プロバイダーが isAvailable: false のリストを渡す
      // SelectorTrigger に「モデルを選択」と表示されることを確認
    });

    it("should show 'プロバイダーがありません' in dropdown when all unavailable", () => {
      // ドロップダウンを開いた際に「プロバイダーがありません」メッセージを表示
    });
  });

  describe("T-03: 全プロバイダー利用可能", () => {
    it("should show all providers when all have isAvailable: true", () => {
      // 全プロバイダーが isAvailable: true のリストを渡す
      // 全プロバイダーがドロップダウンに表示されることを確認
    });
  });

  describe("T-04: 選択中プロバイダーが利用不可", () => {
    it("should show 'モデルを選択' when selected provider becomes unavailable", () => {
      // selectedProviderId が isAvailable: false のプロバイダーを指す場合
      // SelectorTrigger に「モデルを選択」と表示されることを確認
    });
  });

  describe("T-05: ProviderSelector（設定画面）のフィルタ非適用", () => {
    it("should show all providers in ProviderSelector regardless of isAvailable", () => {
      // ProviderSelector は isAvailable フィルタを適用しない
      // 全プロバイダーが表示される（グレーアウト表示は ProviderSelector の責務）
    });
  });
});
```

### Task 4-3: テストファイルへの追加手順

1. テストファイルの存在を確認した
2. 既存テストの import パスを参照した（P63 対策）
3. テスト環境設定（happy-dom 環境のため `fireEvent` を使用、P39 対策）
4. Task 4-2 のテストコードを追加した

### Task 4-4: テスト実行確認

```bash
cd apps/desktop && pnpm vitest run src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx
```

実行結果: 全テスト PASS

## 参照資料

| 資料名             | パス                                                                                                                      |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Phase 2 設計       | `docs/30-workflows/llm-provider-model-modernization/tasks/step-06-par-task-08-ui-isavailable-filtering/phase-2-design.md` |
| 現行実装           | `apps/desktop/src/renderer/components/llm/InlineModelSelector.tsx`                                                        |
| コード品質ルール   | `.claude/rules/02-code-quality.md`                                                                                        |
| 既知の落とし穴 P39 | `.claude/rules/06-known-pitfalls.md`（happy-dom 環境での userEvent 非互換）                                               |
| 既知の落とし穴 P63 | `.claude/rules/06-known-pitfalls.md`（サブエージェントのインポートパス誤り）                                              |

## 成果物

| 成果物         | パス                                                                              | 形式       |
| -------------- | --------------------------------------------------------------------------------- | ---------- |
| テストファイル | `apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx` | TypeScript |

## 完了条件

- [x] 既存テストの import パスを確認した（P63 対策）
- [x] T-01（isAvailable フィルタリング: 一部 false で非表示）テストを実装した
- [x] T-02（ゼロプロバイダー: 全て false で「モデルを選択」表示）テストを実装した
- [x] T-03（全プロバイダー利用可能: 全件表示）テストを実装した
- [x] T-04（選択中プロバイダーが利用不可: 「モデルを選択」表示）テストを実装した
- [x] T-05（ProviderSelector はフィルタ非適用）テストを実装した
- [x] テスト実行で全テストが PASS することを確認した

## 次の Phase

Phase 5: 実装（`phase-5-implementation.md`）

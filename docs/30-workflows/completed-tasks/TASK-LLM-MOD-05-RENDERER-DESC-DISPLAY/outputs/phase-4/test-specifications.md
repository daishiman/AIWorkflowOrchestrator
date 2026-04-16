# Phase 4 成果物: テスト仕様書

## タスク: TASK-LLM-MOD-05-RENDERER-DESC-DISPLAY

## TDD Red Phase 概要

Phase 4 では実装前にテストケースを定義し、Red（失敗）状態を意図的に作成する。

## テストフィクスチャ

```typescript
// description ありのプロバイダーリスト（テスト専用）
const mockProvidersWithDescription: LLMProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    isAvailable: true,
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        description: "高性能マルチモーダルモデル",
        isDefault: true,
        contextWindow: 128000,
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4o Mini",
        description: undefined,
        isDefault: false,
        contextWindow: 128000,
      },
      {
        id: "gpt-4o-nano",
        name: "GPT-4o Nano",
        description: "",
        isDefault: false,
        contextWindow: 64000,
      },
    ],
  },
];
```

## コアテストケース（T-1〜T-9）

| テストID  | グループ         | 説明                                                     | 検証内容                                        |
| --------- | ---------------- | -------------------------------------------------------- | ----------------------------------------------- |
| T-DESC-1  | description 表示 | description ありのモデルに title 属性が付与される        | button[title="..."] 確認                        |
| T-DESC-1b | description 表示 | description ありのモデルに aria-describedby が付与される | aria-describedby 属性確認                       |
| T-DESC-1c | description 表示 | description ありのモデルに sr-only span が存在する       | id付きspan DOM確認                              |
| T-DESC-2  | 安全処理         | description が undefined のとき補助要素が付与されない    | title/aria-describedby 不在確認                 |
| T-DESC-3  | 安全処理         | description が空文字のとき補助要素が付与されない         | title/aria-describedby 不在確認                 |
| T-DESC-4  | 回帰             | description ありでもモデル選択イベントが正常発火         | onSelectionChange 呼出確認                      |
| T-DESC-5  | 回帰             | description ありでもキーボード操作が正常動作             | Escape でドロップダウン閉じる                   |
| T-DESC-6  | provider切替     | provider 切り替え後に description が更新される           | 再描画後の title 確認                           |
| T-DESC-7  | 境界値           | 長文 description でも title 属性が保持される             | 500文字でも title 保持                          |
| T-DESC-8  | セキュリティ     | HTML タグが含まれてもテキストとして扱われる              | XSS script タグが DOM に挿入されない            |
| T-DESC-9  | トリガー表示     | description ありでもトリガーにはモデル名のみ表示         | trigger.textContent に description が含まれない |

## 実装場所

`apps/desktop/src/renderer/components/llm/__tests__/InlineModelSelector.test.tsx`

- `describe("T-DESC: description 表示テスト", ...)` に T-DESC-1〜T-DESC-9 を追加
- `describe("T-DESC-EXT: description 拡充テスト", ...)` に T-DESC-10〜T-DESC-15 を追加

## 命名規則整合確認

- [x] テストファイル: PascalCase（InlineModelSelector.test.tsx）
- [x] describe ブロック: コンポーネント名と一致
- [x] フィクスチャ: mockProvidersWithDescription（camelCase）

## Phase 4 完了確認

- [x] T-1〜T-9 のテストケース定義が完了している
- [x] フィクスチャ（description あり/なし/空文字）が定義されている
- [x] 命名規則との整合が確認されている
- [x] 本 Phase 内の全タスクを 100% 実行完了

# Phase 11: 手動テスト — 共有型スキーマ拡張検討

## メタ情報

| 項目      | 値                       |
| --------- | ------------------------ |
| Phase番号 | 11                       |
| 機能名    | schema-extension         |
| タスクID  | TASK-LLM-MOD-05          |
| 作成日    | 2026-03-23               |
| 依存Phase | Phase 10（最終レビュー） |

## 目的

`PROVIDER_CONFIGS` の `description` 追加が実際に IPC 経由でRendererに届いていることを、Electron DevTools または単体スクリプトで確認する。

## 実行タスク

### Task 11-1: IPC 返却値の確認（DevTools）

Electron アプリを起動し、DevTools の Console で以下を実行する:

```javascript
// 設定画面または ChatView が開いている状態で実行
window.electronAPI.llm.getProviders().then((providers) => {
  providers.forEach((p) => {
    console.log(`[${p.id}] ${p.name}`);
    p.models.forEach((m) => {
      console.log(`  - ${m.id}: ${m.description ?? "(undefined)"}`);
    });
  });
});
```

**期待される出力例:**

```
[openai] OpenAI
  - gpt-4o: Most capable multimodal model
  - gpt-4o-mini: Fast and affordable GPT-4o
  - gpt-4-turbo: Powerful model with vision support
[anthropic] Anthropic
  - claude-3-5-sonnet-20241022: Best performance and speed balance
  ...
```

### Task 11-2: 型の到達確認（TypeScript側）

アプリ起動が難しい場合、Node.js スクリプトで直接確認する（Main Process相当のテスト）:

```bash
# pnpm exec vitest run で単体テストとして確認する方法
pnpm --filter @repo/desktop exec vitest run src/main/handlers/__tests__/llm.test.ts --reporter=verbose
```

TS-B-01 が PASS していれば description は IPC 経由で伝搬されている。

### Task 11-3: スキーマバリデーション確認

`LLMModelSchema` で description ありのオブジェクトがバリデーションを通ることを確認する:

```bash
pnpm --filter @repo/shared exec vitest run src/types/llm/schemas/__tests__/provider.test.ts --reporter=verbose
```

TS-A-01 〜 TS-A-04 が PASS していればスキーマ側は問題なし。

### Task 11-4: 既存機能の回帰確認

`description` 追加が既存の LLM 接続・選択機能に影響を与えていないことを確認する:

| テストシナリオ                                  | 確認方法                                         | 期待結果                         |
| ----------------------------------------------- | ------------------------------------------------ | -------------------------------- |
| LLM プロバイダー一覧の取得                      | `llm:get-providers` の IPC が正常に返る          | プロバイダー一覧が返却される     |
| プロバイダー選択（設定保存）                    | `llm:set-selected-config` が正常に動作する       | `{ success: true }` が返却される |
| モデル選択 UI が動作する                        | InlineModelSelector でモデルが選択できる         | 選択状態が更新される             |
| `description` が undefined のモデルでも動作する | description なしのモデルを持つプロバイダーで確認 | エラーなく動作する               |

### Task 11-5: CLI環境での対応方針（P53対策）

CLI環境でElectronアプリを起動できない場合、以下を代替手段として採用する:

1. 自動テスト（TS-B-01）の PASS をもって description の伝搬確認とする
2. `handleGetProviders()` の返却値をテストのスナップショットで記録する
3. 未来の手動確認タスクとして「Electronアプリ起動時のDevTools確認」を未タスク化する

## 参照資料

| 資料                                                   | 用途                              |
| ------------------------------------------------------ | --------------------------------- |
| `apps/desktop/src/main/handlers/llm.ts`                | 確認対象の実装                    |
| `apps/desktop/src/main/handlers/__tests__/llm.test.ts` | 自動テストによる代替確認          |
| `.claude/rules/06-known-pitfalls.md` P53               | CLI環境でのスクリーンショット制約 |

## 成果物

| 成果物         | パス                              | 備考                               |
| -------------- | --------------------------------- | ---------------------------------- |
| 手動テスト結果 | 本ファイル内（各Task の結果記録） | DevTools出力またはテスト結果を記録 |

## 統合テスト連携

Phase 11 の確認が完了したら Phase 12 でドキュメントを更新する。

## 完了条件

- [ ] Task 11-1（DevTools確認）またはTask 11-2（自動テスト確認）のいずれかで description の IPC 伝搬を確認した
- [ ] Task 11-3 でスキーマバリデーションの PASS を確認した
- [ ] Task 11-4 の回帰確認シナリオを全て確認した（または自動テストによる代替確認）
- [ ] CLI環境の場合は P53 対策として自動テスト結果を記録した

## 次のPhase

[Phase 12: ドキュメント更新](./phase-12-documentation.md)

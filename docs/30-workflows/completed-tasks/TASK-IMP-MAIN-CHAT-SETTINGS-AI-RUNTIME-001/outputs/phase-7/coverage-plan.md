# Phase 7: カバレッジ計画

## メタ情報

| 項目     | 内容                                       |
| -------- | ------------------------------------------ |
| Phase    | 7                                          |
| 機能名   | Main Chat / Settings runtime 同期          |
| タスクID | TASK-IMP-MAIN-CHAT-SETTINGS-AI-RUNTIME-001 |
| 成果物   | coverage-plan.md                           |
| 作成日   | 2026-03-17                                 |

---

## 1. カバレッジ目標

### 1.1 プロジェクト基準

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### 1.2 本タスクの目標設定根拠

- **AI_CHAT 経路** (GAP-01/03): ユーザーの主要フローのため Line 90%+ / Function 90%+ を目標とする
- **IPC ハンドラ群**: P42 バリデーション追加により Branch Coverage が重要。Branch 70%+ を目標とする
- **Zustand スライス**: P31/P48 対策を含む状態管理コードは Function 90%+ を目標とする
- **React コンポーネント**: UI 表示ロジックは Line 80%+ / Branch 60%+ を最低限とする

---

## 2. ファイル別カバレッジ目標テーブル

| ファイルパス                                                          | Line 目標 | Branch 目標 | Function 目標 | 重要度 |
| --------------------------------------------------------------------- | --------- | ----------- | ------------- | ------ |
| `apps/desktop/src/main/handlers/aiHandlers.ts`                        | 90%       | 75%         | 90%           | 高     |
| `apps/desktop/src/main/handlers/llm.ts`                               | 90%       | 70%         | 90%           | 高     |
| `apps/desktop/src/main/handlers/authModeHandlers.ts`                  | 85%       | 70%         | 85%           | 高     |
| `apps/desktop/src/main/handlers/authKeyHandlers.ts`                   | 85%       | 70%         | 85%           | 高     |
| `apps/desktop/src/main/handlers/apiKeyHandlers.ts`                    | 85%       | 70%         | 85%           | 高     |
| `apps/desktop/src/main/handlers/ragHandlers.ts`                       | 90%       | 75%         | 90%           | 中     |
| `apps/desktop/src/main/services/LLMConfigProvider.ts`                 | 90%       | 70%         | 90%           | 高     |
| `apps/desktop/src/main/services/LLMAdapterFactory.ts`                 | 80%       | 65%         | 80%           | 中     |
| `apps/desktop/src/renderer/store/slices/chatSlice.ts`                 | 90%       | 70%         | 90%           | 高     |
| `apps/desktop/src/renderer/store/slices/llmSlice.ts`                  | 90%       | 70%         | 90%           | 高     |
| `apps/desktop/src/renderer/store/slices/authModeSlice.ts`             | 90%       | 70%         | 90%           | 高     |
| `apps/desktop/src/renderer/store/slices/systemPromptTemplateSlice.ts` | 85%       | 65%         | 85%           | 中     |
| `apps/desktop/src/renderer/store/slices/ragSlice.ts`                  | 85%       | 65%         | 85%           | 中     |
| `apps/desktop/src/renderer/store/index.ts`                            | 80%       | 60%         | 80%           | 中     |
| `apps/desktop/src/renderer/views/ChatView/index.tsx`                  | 85%       | 65%         | 85%           | 高     |
| `apps/desktop/src/renderer/views/SettingsView/index.tsx`              | 80%       | 60%         | 80%           | 高     |
| `apps/desktop/src/renderer/components/LLMSelectorPanel/index.tsx`     | 80%       | 60%         | 80%           | 高     |
| `apps/desktop/src/renderer/components/ApiKeysSection/index.tsx`       | 80%       | 65%         | 80%           | 中     |
| `apps/desktop/src/renderer/components/AuthKeySection/index.tsx`       | 80%       | 60%         | 80%           | 中     |
| `apps/desktop/src/renderer/components/AuthModeSelector/index.tsx`     | 80%       | 60%         | 80%           | 中     |
| `apps/desktop/src/renderer/components/SystemPromptPanel/index.tsx`    | 80%       | 60%         | 80%           | 中     |
| `packages/shared/src/agent/types.ts`                                  | -         | -           | -             | 除外   |
| `packages/shared/src/llm/types.ts`                                    | -         | -           | -             | 除外   |
| `packages/shared/src/llm/constants.ts`                                | -         | -           | -             | 除外   |

---

## 3. カバレッジ不足時の対応方針

### 3.1 Branch Coverage 不足（< 60%）

Branch Coverage が最低基準を下回る場合は、以下の順序でテストを追加する。

```
優先度 1: P42 バリデーション 3段（型チェック → 空文字列 → トリム空文字列）
  - 各 IPC ハンドラの正常系 / 空文字 / スペースのみの3パターン

優先度 2: エラーパス（fail-fast 条件）
  - API key 未設定 / providerId 無効 / model drift

優先度 3: Optional フィールドのデフォルト値
  - conversationId が undefined / null の場合
  - systemPrompt が空の場合
```

### 3.2 Function Coverage 不足（< 80%）

P41 の教訓（v8 プロバイダーがインライン arrow function をカウントする）に従い、以下を確認する。

```typescript
// P41 対策: インライン arrow function のカバレッジ確認
// getAllowedWindows: () => [mainWindow] 等のコールバックを
// テストで明示的に呼び出してカバレッジを確保する
expect(mockValidateIpcSender.mock.calls[0][2].getAllowedWindows()).toEqual([
  mainWindow,
]);
```

### 3.3 Line Coverage 不足（< 80%）

- 未到達行を特定し、テストシナリオを追加する
- ガード節（early return）は必ず無効パスのテストを追加する

### 3.4 カバレッジレポートの確認方法

```bash
# カバレッジレポート生成
pnpm --filter @repo/desktop exec vitest run --coverage --reporter=html

# 不足箇所の特定（uncovered lines）
open apps/desktop/coverage/index.html

# ターミナルサマリー
pnpm --filter @repo/desktop exec vitest run --coverage --reporter=text-summary
```

---

## 4. 除外ファイル一覧と理由

| ファイルパス                                        | 除外理由                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/shared/src/agent/types.ts`                | 型定義のみ。実行可能コードなし                                   |
| `packages/shared/src/llm/types.ts`                  | 型定義のみ。実行可能コードなし                                   |
| `packages/shared/src/llm/constants.ts`              | 定数定義のみ。ロジックなし                                       |
| `packages/shared/src/llm/ipc-channels.ts`           | チャンネル名定数のみ。ロジックなし                               |
| `apps/desktop/src/preload/types.ts`                 | 型定義のみ                                                       |
| `apps/desktop/src/renderer/store/slices/*.types.ts` | 型定義のみ                                                       |
| `apps/desktop/src/**/*.d.ts`                        | 宣言ファイル。実行可能コードなし                                 |
| `apps/desktop/src/**/__tests__/**`                  | テストファイル自体はカバレッジ対象外                             |
| `apps/desktop/src/**/*.test.ts`                     | テストファイル自体はカバレッジ対象外                             |
| `apps/desktop/src/main/index.ts`                    | Electron エントリポイント。E2E テスト対象（Unit テストでは除外） |
| `apps/desktop/src/renderer/index.tsx`               | Renderer エントリポイント。E2E テスト対象                        |

---

## 5. Vitest Coverage 設定

### 5.1 推奨 vitest.config.ts 設定

```typescript
// apps/desktop/vitest.config.ts 追記例
export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // P41 対策: インライン arrow function の正確なカウント
      reporter: ["text", "html", "lcov"],
      include: [
        "src/main/handlers/**/*.ts",
        "src/main/services/**/*.ts",
        "src/renderer/store/slices/**/*.ts",
        "src/renderer/views/**/*.tsx",
        "src/renderer/components/**/*.tsx",
      ],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.types.ts",
        "src/**/__tests__/**",
        "src/**/*.test.ts",
        "src/main/index.ts",
        "src/renderer/index.tsx",
      ],
      thresholds: {
        lines: 80,
        branches: 60,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

### 5.2 カバレッジ CI 設定

```yaml
# .github/workflows/coverage.yml の thresholds
coverage:
  global:
    statements: 80
    branches: 60
    functions: 80
    lines: 80
```

---

## 6. カバレッジ基準未達時のフォールバック

### 6.1 判定フロー

```
Phase 7: カバレッジ確認
  │
  ├─ Line < 80% または Function < 80%
  │    → Phase 6（テスト拡充）へ戻る
  │      不足箇所を特定し、テストケースを追加する
  │
  ├─ Branch < 60%
  │    → Phase 6（テスト拡充）へ戻る
  │      P42 バリデーション 3段・エラーパスのテストを優先追加
  │
  └─ 全基準達成
       → Phase 8（リファクタリング）へ進む
```

### 6.2 Phase 6 へ戻る条件テーブル

| 指標              | 最低基準 | 未達時のアクション                                       |
| ----------------- | -------- | -------------------------------------------------------- |
| Line Coverage     | 80%      | Phase 6 へ戻り、未到達行を含む関数のテストを追加         |
| Branch Coverage   | 60%      | Phase 6 へ戻り、P42 バリデーション 3段のテストを優先追加 |
| Function Coverage | 80%      | Phase 6 へ戻り、未カバーの関数に対するテストを追加       |

### 6.3 Phase 6 戻り時の手順

1. `vitest run --coverage --reporter=html` でレポートを生成し、未到達行を特定する
2. 未到達行に対応するテストケースを `test-matrix.md` に追記する
3. Phase 6 でテストコードを実装する
4. Phase 7 を再実行して基準充足を確認する

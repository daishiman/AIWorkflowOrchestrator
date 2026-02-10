# Phase 7: カバレッジ確認 - Zustand Store Hooks無限ループ修正

## メタ情報

| 項目      | 内容                                 |
| --------- | ------------------------------------ |
| タスクID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase     | 7 - カバレッジ確認                   |
| 前提Phase | Phase 6（テスト拡充）                |
| 成果物    | カバレッジレポート                   |
| 次Phase   | Phase 8（リファクタリング）          |

## 1. 目的

テストカバレッジが基準を満たしていることを確認する。未達の場合は Phase 6 に戻り、テストを追加する。

## 2. カバレッジ基準

### 2.1 プロジェクト全体の基準（02-code-quality.md 準拠）

| 指標              | 最低基準 | 推奨基準 | 今回のターゲット |
| ----------------- | -------- | -------- | ---------------- |
| Line Coverage     | 80%      | 90%      | 80%以上          |
| Branch Coverage   | 60%      | 70%      | 60%以上          |
| Function Coverage | 80%      | 90%      | 80%以上          |

### 2.2 修正対象ファイルの個別基準

| ファイル               | Line | Branch | Function | 備考                 |
| ---------------------- | ---- | ------ | -------- | -------------------- |
| SettingsView/index.tsx | 80%+ | 60%+   | 80%+     | 主要修正対象         |
| LLMSelectorPanel.tsx   | 80%+ | 60%+   | 80%+     | 主要修正対象         |
| SkillSelector.tsx      | -    | -      | -        | 確認のみ（修正なし） |

## 3. カバレッジ確認コマンド

### 3.1 基本コマンド

```bash
# カバレッジ付きテスト実行
pnpm --filter @repo/desktop test -- --run --coverage

# 特定ファイルのカバレッジ
pnpm --filter @repo/desktop test -- --run --coverage \
  --collectCoverageFrom='src/renderer/views/SettingsView/**/*.tsx'

# 詳細レポート（HTMLレポート生成）
pnpm --filter @repo/desktop test -- --run --coverage \
  --coverageReporters='text' \
  --coverageReporters='html'
```

### 3.2 対象ファイル指定

```bash
# SettingsView のカバレッジ
pnpm --filter @repo/desktop test -- --run --coverage \
  --collectCoverageFrom='src/renderer/views/SettingsView/index.tsx'

# LLMSelectorPanel のカバレッジ
pnpm --filter @repo/desktop test -- --run --coverage \
  --collectCoverageFrom='src/renderer/components/llm/LLMSelectorPanel.tsx'
```

## 4. カバレッジレポートの確認

### 4.1 コンソール出力の読み方

```
----------------------------|---------|----------|---------|---------|
File                        | % Stmts | % Branch | % Funcs | % Lines |
----------------------------|---------|----------|---------|---------|
views/SettingsView/         |         |          |         |         |
 index.tsx                  |   85.71 |    66.67 |   83.33 |   85.71 |
components/llm/             |         |          |         |         |
 LLMSelectorPanel.tsx       |   82.35 |    62.50 |   80.00 |   82.35 |
----------------------------|---------|----------|---------|---------|
```

### 4.2 HTMLレポートの確認

```bash
# HTMLレポートを開く
open apps/desktop/coverage/index.html
```

## 5. カバレッジ未達時の対応

### 5.1 判定基準

| 状況                   | 対応                                       |
| ---------------------- | ------------------------------------------ |
| すべての基準を満たす   | Phase 8 へ進む                             |
| Line Coverage 未達     | Phase 6 に戻り、未カバー行のテストを追加   |
| Branch Coverage 未達   | Phase 6 に戻り、分岐条件のテストを追加     |
| Function Coverage 未達 | Phase 6 に戻り、未テスト関数のテストを追加 |

### 5.2 よくある未カバー箇所

| 箇所                     | 対策                               |
| ------------------------ | ---------------------------------- |
| エラーハンドリング分岐   | エラー状態のテストケース追加       |
| ローディング状態の分岐   | isLoading=true のテストケース追加  |
| 条件付きレンダリング     | 各条件のテストケース追加           |
| イベントハンドラ内の分岐 | 各分岐を通るイベント発火テスト追加 |

## 6. カバレッジ確認チェックリスト

### 6.1 SettingsView

- [ ] Line Coverage: 80%以上
- [ ] Branch Coverage: 60%以上
- [ ] Function Coverage: 80%以上
- [ ] `useEffect` 内の `if` 文がテストされている
- [ ] `authModeInitRef` の初期化処理がテストされている

### 6.2 LLMSelectorPanel

- [ ] Line Coverage: 80%以上
- [ ] Branch Coverage: 60%以上
- [ ] Function Coverage: 80%以上
- [ ] `providersFetchedRef` の初期化処理がテストされている
- [ ] `prevProviderIdRef` による変更検知がテストされている
- [ ] エラー表示とリトライ処理がテストされている

### 6.3 全体

- [ ] 既存のテストが全てパス
- [ ] 新規追加したテストが全てパス
- [ ] カバレッジレポートが生成されている

## 7. カバレッジ結果の記録

### 7.1 テンプレート

```markdown
## カバレッジ結果（YYYY-MM-DD）

### SettingsView/index.tsx

- Line: XX.XX%
- Branch: XX.XX%
- Function: XX.XX%
- 判定: PASS / FAIL

### LLMSelectorPanel.tsx

- Line: XX.XX%
- Branch: XX.XX%
- Function: XX.XX%
- 判定: PASS / FAIL

### 全体判定

- [ ] すべてのファイルが基準を満たしている
```

### 7.2 記録場所

カバレッジ結果は以下のファイルに記録：

```
docs/30-workflows/auth-mode-store-fix/outputs/phase-7-coverage-report.md
```

## 8. 完了条件

- [ ] すべての修正対象ファイルがカバレッジ基準を満たしている
- [ ] カバレッジレポートが生成・保存されている
- [ ] 未達の場合は Phase 6 に戻り、テストを追加した上で再確認

## 9. 次Phase

カバレッジ基準を満たしている場合、Phase 8（リファクタリング）へ進む。

未達の場合、Phase 6 に戻る：

```
Phase 7（カバレッジ未達）→ Phase 6（テスト追加）→ Phase 7（再確認）
```

## 10. 参考情報

### 10.1 Vitest カバレッジ設定

`vitest.config.ts` に以下の設定があることを確認：

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/index.ts", // バレルファイル
      ],
    },
  },
});
```

### 10.2 カバレッジ除外パターン

以下のコードはカバレッジ対象外：

```typescript
/* istanbul ignore next */
function debugOnlyFunction() {
  // テスト不要なデバッグ用コード
}
```

ただし、この除外は最小限に留め、本来テストすべきコードに使用しないこと。

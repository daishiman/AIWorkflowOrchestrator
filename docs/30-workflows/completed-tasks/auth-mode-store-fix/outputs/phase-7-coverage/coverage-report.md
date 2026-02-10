# Phase 7: カバレッジ確認レポート

## メタ情報

| 項目       | 値                                   |
| ---------- | ------------------------------------ |
| タスク ID  | UT-FIX-STORE-HOOKS-INFINITE-LOOP-001 |
| Phase      | 7 - カバレッジ確認                   |
| 作成日     | 2026-02-10                           |
| ステータス | 準備完了                             |

---

## 1. カバレッジ実行コマンド

### 全体カバレッジ

```bash
# desktopパッケージでカバレッジ付きテスト実行
pnpm --filter @repo/desktop test:coverage
```

### 個別ファイル指定でのカバレッジ確認

```bash
# 特定ファイルのテストをカバレッジ付きで実行
cd /Users/dm/dev/dev/個人開発/AIWorkflowOrchestrator/.worktrees/task-20260208-233850-wt4/apps/desktop

# SettingsView のテスト
pnpm vitest run --coverage src/renderer/views/SettingsView/SettingsView.test.tsx

# LLMSelectorPanel のテスト
pnpm vitest run --coverage src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx

# SkillSelector のテスト
pnpm vitest run --coverage src/renderer/components/skill/__tests__/SkillSelector.test.tsx

# 3ファイル同時実行
pnpm vitest run --coverage \
  src/renderer/views/SettingsView/SettingsView.test.tsx \
  src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx \
  src/renderer/components/skill/__tests__/SkillSelector.test.tsx
```

### カバレッジレポート出力

- **テキスト**: コンソールに出力
- **JSON**: `coverage/coverage-final.json`
- **HTML**: `coverage/index.html`（ブラウザで確認）
- **LCOV**: `coverage/lcov.info`（CI連携用）

---

## 2. カバレッジ基準

### プロジェクト設定（vitest.config.ts）

| 指標       | 最低基準 | 備考                     |
| ---------- | -------- | ------------------------ |
| Lines      | 80%      | 行カバレッジ             |
| Functions  | 80%      | 関数カバレッジ           |
| Branches   | 60%      | 分岐カバレッジ           |
| Statements | 80%      | ステートメントカバレッジ |

### 品質基準（02-code-quality.md 準拠）

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

---

## 3. 確認対象ファイルとテストファイル

### 対象ファイル一覧

| #   | 対象ファイル                                       | 対応テストファイル                                                |
| --- | -------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | `src/renderer/views/SettingsView/index.tsx`        | `src/renderer/views/SettingsView/SettingsView.test.tsx`           |
| 2   | `src/renderer/components/llm/LLMSelectorPanel.tsx` | `src/renderer/components/llm/__tests__/LLMSelectorPanel.test.tsx` |
| 3   | `src/renderer/components/skill/SkillSelector.tsx`  | `src/renderer/components/skill/__tests__/SkillSelector.test.tsx`  |

### 修正内容と確認ポイント

| ファイル         | 修正内容                                        | カバレッジ確認ポイント                     |
| ---------------- | ----------------------------------------------- | ------------------------------------------ |
| SettingsView     | useRef ガードによる初期化無限ループ防止         | initializeAuthMode 呼び出しパス            |
| LLMSelectorPanel | useRef ガードによる認証モード取得無限ループ防止 | fetchAuthMode 呼び出しパス、認証モード分岐 |
| SkillSelector    | useRef ガードによるスキル取得無限ループ防止     | fetchSkills 呼び出しパス、ローディング分岐 |

---

## 4. カバレッジ確認チェックリスト

### 4.1 テスト実行前

- [ ] 対象テストファイルの存在確認
- [ ] テストファイルが最新の実装を反映しているか確認
- [ ] vitest.config.ts のカバレッジ設定確認

### 4.2 カバレッジ実行

- [ ] `pnpm --filter @repo/desktop test:coverage` 実行
- [ ] 全テストが PASS すること
- [ ] カバレッジレポートが正常に生成されること

### 4.3 対象ファイル別カバレッジ確認

#### SettingsView/index.tsx

- [ ] Lines: 80% 以上
- [ ] Functions: 80% 以上
- [ ] Branches: 60% 以上
- [ ] useRef ガード部分がテストでカバーされている

#### LLMSelectorPanel.tsx

- [ ] Lines: 80% 以上
- [ ] Functions: 80% 以上
- [ ] Branches: 60% 以上
- [ ] 認証モード（supabase/local）の分岐がカバーされている

#### SkillSelector.tsx

- [ ] Lines: 80% 以上
- [ ] Functions: 80% 以上
- [ ] Branches: 60% 以上
- [ ] ローディング状態の分岐がカバーされている

### 4.4 カバレッジ未達時の対応

- [ ] カバレッジ未達の場合は Phase 6 に戻る
- [ ] 未達箇所を特定し、追加テストを作成
- [ ] 再度カバレッジ確認を実行

---

## 5. カバレッジ除外設定

vitest.config.ts で以下のファイルはカバレッジ計測から除外されています：

```typescript
exclude: [
  "node_modules/",
  "out/",
  "dist/",
  "**/*.test.{ts,tsx}",
  "**/*.config.{ts,js}",
  "**/*.spec.{ts,tsx}",
  "src/test/**",
  "e2e/**",
  "scripts/**",
  "src/main/index.ts",
  "src/main/updater.ts",
  "src/preload/index.ts",
  "src/preload/types.ts",
  "src/preload/types.d.ts",
  "src/renderer/main.tsx",
  "src/renderer/App.tsx",
  "src/main/ipc/__mocks__/**",
  "src/main/services/watcher/**",
  "**/index.ts", // エクスポート用ファイル
  "**/types.ts", // 型定義ファイル
];
```

**注意**: `**/index.ts` が除外されているため、`SettingsView/index.tsx` はカバレッジ計測対象外になる可能性があります。ファイル名が `SettingsView.tsx` ではないため確認が必要です。

---

## 6. 次のステップ

1. カバレッジ実行コマンドを実行
2. 各ファイルのカバレッジ率を確認
3. 基準未達の場合は Phase 6 に戻りテスト追加
4. 基準達成の場合は Phase 8（リファクタリング）に進む

---

## 7. カバレッジ結果記録（実行後に記入）

| ファイル         | Lines | Functions | Branches | Statements | 判定 |
| ---------------- | ----- | --------- | -------- | ---------- | ---- |
| SettingsView     | -     | -         | -        | -          | -    |
| LLMSelectorPanel | -     | -         | -        | -          | -    |
| SkillSelector    | -     | -         | -        | -          | -    |

**総合判定**: 未実行

---

## 参照

- [02-code-quality.md](/.claude/rules/02-code-quality.md) - カバレッジ基準
- [vitest.config.ts](/apps/desktop/vitest.config.ts) - テスト設定
- [Phase 6 テスト拡充](../phase-6-test-expansion/) - テスト追加時の戻り先

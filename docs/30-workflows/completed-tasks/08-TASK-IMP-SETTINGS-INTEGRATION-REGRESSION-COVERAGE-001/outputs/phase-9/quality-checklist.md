# Phase 9: 品質チェックリスト

## メタ情報

| 項目     | 内容                                                     |
| -------- | -------------------------------------------------------- |
| タスク名 | 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 |
| Phase    | 9                                                        |
| 作成日   | 2026-03-08                                               |

---

## チェック項目

- [ ] TypeScript 型チェック PASS
- [ ] ESLint PASS
- [ ] 統合テスト 9/9 GREEN
- [ ] 既存テスト（SettingsView.test.tsx 26件）に影響なし
- [ ] 既存テスト（ApiKeysSection.test.tsx 46件）に影響なし
- [ ] 既存テスト（AuthModeSelector.test.tsx 20件）に影響なし
- [ ] P31（個別セレクタ使用）準拠 -- useAuthMode, useSetAuthMode 等の個別セレクタを使用し、合成 Store Hook を useEffect 依存配列に含めていない
- [ ] P39（fireEvent 使用）準拠 -- happy-dom 環境で userEvent を使用せず、全テストで fireEvent を使用
- [ ] P40（テスト実行ディレクトリ）準拠 -- `cd apps/desktop` からテストを実行し、vitest.config.ts の environment 設定が正しく読み込まれる
- [ ] AC-01 充足: 統合テストで AccountSection / ApiKeysSection / AuthModeSelector の vi.mock() が存在しない
- [ ] AC-02 充足: INT-02 で role="radio" 経由の auth-mode 切替テストが存在する
- [ ] AC-03 充足: INT-03, INT-04a, INT-04b, INT-04c で provider fallback テストが存在する
- [ ] AC-04 充足: Phase 11 手動テスト手順に settings shell 到達が必須条件として明記されている
- [ ] AC-05 充足: task-05/06/07 の AC と INT テストケース ID の対応行列が integration-test-cases.md に存在する
- [ ] AC-06 充足: settings-test-harness.ts で store mock と electronAPI mock の境界が一元管理されている

---

## 実行コマンド

```bash
cd apps/desktop

# TypeScript 型チェック
pnpm typecheck

# ESLint
pnpm lint

# 統合テスト（9件）
pnpm vitest run src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx

# 既存テスト（92件）
pnpm vitest run src/renderer/views/SettingsView/SettingsView.test.tsx
pnpm vitest run src/renderer/components/organisms/ApiKeysSection/__tests__/ApiKeysSection.test.tsx
pnpm vitest run src/renderer/components/settings/AuthModeSelector/__tests__/AuthModeSelector.test.tsx
```

---

## 合格基準

| 項目       | 基準                    |
| ---------- | ----------------------- |
| TypeScript | エラー 0件              |
| ESLint     | エラー 0件              |
| 統合テスト | 9/9 PASS                |
| 既存テスト | 92/92 PASS              |
| AC 充足    | AC-01 〜 AC-06 全て充足 |

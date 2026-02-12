# Phase 9: 品質保証

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 9                                      |
| タスクID | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| タスク名 | Store Hooks コンポーネント移行         |
| 機能名   | UT-STORE-HOOKS-COMPONENT-MIGRATION-001 |
| 作成日   | 2026-02-12                             |

## 目的

定義された品質基準をすべて満たすことを検証し、Store Hooks移行の品質を保証する。

## 実行タスク

- 機能検証: 自動テストの完全成功
- コード品質: Lint/型チェッククリア
- テスト網羅性: カバレッジ基準達成
- セキュリティ: 重大な脆弱性の不在
- パフォーマンス: 無限ループ・不要再レンダリングの不在

## 参照資料

| 資料名                       | パス                                    | 説明                      |
| ---------------------------- | --------------------------------------- | ------------------------- |
| Phase 8 リファクタリング結果 | `outputs/phase-8/refactoring-result.md` | Phase 8成果物             |
| コード品質ルール             | `.claude/rules/02-code-quality.md`      | 品質基準                  |
| 既知の落とし穴               | `.claude/rules/06-known-pitfalls.md`    | P31 Zustand無限ループ対策 |
| セキュリティルール           | `.claude/rules/04-electron-security.md` | Electronセキュリティ      |

## 品質ゲート

### 1. 機能検証ゲート

| 項目              | 基準         | 確認コマンド                                   |
| ----------------- | ------------ | ---------------------------------------------- |
| ユニットテスト    | 全テスト成功 | `pnpm --filter @repo/desktop test`             |
| 統合テスト        | 全テスト成功 | `pnpm --filter @repo/desktop test:integration` |
| Store Hooksテスト | 全テスト成功 | `pnpm --filter @repo/desktop test -- store`    |

### 2. コード品質ゲート

| 項目                 | 基準                 | 確認コマンド                               |
| -------------------- | -------------------- | ------------------------------------------ |
| ESLint               | エラーゼロ           | `pnpm --filter @repo/desktop lint`         |
| TypeScript型チェック | エラーゼロ           | `pnpm --filter @repo/desktop typecheck`    |
| Prettier             | フォーマット差分なし | `pnpm --filter @repo/desktop format:check` |

### 3. テスト網羅性ゲート

| 指標              | 最低基準 | 推奨基準 | 確認コマンド                                |
| ----------------- | -------- | -------- | ------------------------------------------- |
| Line Coverage     | 80%      | 90%      | `pnpm --filter @repo/desktop test:coverage` |
| Branch Coverage   | 60%      | 70%      | 同上                                        |
| Function Coverage | 80%      | 90%      | 同上                                        |

### 4. セキュリティゲート

| 項目           | 基準                                   | 確認方法                     |
| -------------- | -------------------------------------- | ---------------------------- |
| 認証情報の漏洩 | Rendererに認証情報が直接渡されていない | コードレビュー + grep検索    |
| 状態の分離     | 機密情報がMain Processに留まっている   | authModeSlice.tsの確認       |
| XSS脆弱性      | ユーザー入力の適切なサニタイズ         | 動的コンテンツ生成箇所の確認 |

```bash
# セキュリティ確認コマンド
# 認証情報がRendererコードに含まれていないか確認
grep -rn "apiKey" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
grep -rn "token" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
grep -rn "password" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
```

### 5. パフォーマンスゲート

| 項目                 | 基準                                     | 確認方法                |
| -------------------- | ---------------------------------------- | ----------------------- |
| 無限ループ           | P31パターンの不在                        | grep + コードレビュー   |
| 不要な再レンダリング | セレクタが最小限の状態のみ返す           | React DevTools Profiler |
| メモリリーク         | リスナーが適切にクリーンアップされている | リスナー登録/解除の確認 |

```bash
# P31パターン（無限ループ）の検出
# 合成Store Hookの関数がuseEffect依存配列に含まれていないか確認
grep -rn "useEffect.*useAuthModeStore\|useEffect.*useLLMStore\|useEffect.*useSkillStore" apps/desktop/src/renderer/
```

## 実行手順

### ステップ1: 全自動テスト実行

```bash
# ユニットテスト
pnpm --filter @repo/desktop test

# 統合テスト
pnpm --filter @repo/desktop test:integration

# カバレッジ測定
pnpm --filter @repo/desktop test:coverage
```

### ステップ2: 静的解析実行

```bash
# ESLint
pnpm --filter @repo/desktop lint

# TypeScript型チェック
pnpm --filter @repo/desktop typecheck

# Prettierフォーマットチェック
pnpm --filter @repo/desktop format:check
```

### ステップ3: セキュリティ検証

1. **機密情報の漏洩確認**

   ```bash
   # 認証情報がRendererに含まれていないか
   grep -rn "apiKey\|token\|password\|secret" apps/desktop/src/renderer/ --include="*.ts" --include="*.tsx"
   ```

2. **状態管理の分離確認**
   - `authModeSlice.ts`で認証情報がMain Processからのみ取得されていることを確認
   - Rendererには最小限の状態（`mode`, `status`, `error`等）のみが渡されていることを確認

### ステップ4: パフォーマンス検証

1. **無限ループパターンの検出**

   ```bash
   # P31パターンの検出
   grep -rn "useEffect" apps/desktop/src/renderer/views/ --include="*.tsx" -A 5 | grep -E "\[.*Store\(\)"
   ```

2. **useRefガードパターンの確認**

   初期化関数呼び出しに`useRef`ガードが適用されていることを確認:

   ```typescript
   // 正しいパターン
   const initRef = useRef(false);
   useEffect(() => {
     if (!initRef.current) {
       initRef.current = true;
       // 初期化処理
     }
   }, []);
   ```

### ステップ5: 品質レポート作成

品質検証結果を以下の形式で記録:

```markdown
## 品質検証結果

### 機能検証

- ユニットテスト: ✅ PASS / ❌ FAIL
- 統合テスト: ✅ PASS / ❌ FAIL
- Store Hooksテスト: ✅ PASS / ❌ FAIL

### コード品質

- ESLint: ✅ エラーゼロ / ❌ エラーあり
- TypeScript: ✅ エラーゼロ / ❌ エラーあり
- Prettier: ✅ 差分なし / ❌ 差分あり

### テスト網羅性

- Line Coverage: XX% (基準: 80%)
- Branch Coverage: XX% (基準: 60%)
- Function Coverage: XX% (基準: 80%)

### セキュリティ

- 認証情報漏洩: ✅ なし / ❌ あり
- 状態分離: ✅ 適切 / ❌ 不適切

### パフォーマンス

- 無限ループ: ✅ なし / ❌ あり
- 不要再レンダリング: ✅ なし / ❌ あり
```

## 統合テスト連携【必須】

品質保証で統合テスト結果を確認:

| 品質項目       | 確認内容            | 結果       |
| -------------- | ------------------- | ---------- |
| 機能検証       | 全自動テスト成功    | {{RESULT}} |
| 統合テスト     | 全統合テスト成功    | {{RESULT}} |
| Store Hooks    | Hooks専用テスト成功 | {{RESULT}} |
| セキュリティ   | 脆弱性スキャン通過  | {{RESULT}} |
| パフォーマンス | 無限ループなし      | {{RESULT}} |

## 多角的チェック観点（AIが判断）

| 観点               | 適用判断 | 確認内容                                 |
| ------------------ | -------- | ---------------------------------------- |
| 状態管理           | ✅ 適用  | Zustand設計原則との整合性確認            |
| セキュリティ       | ✅ 適用  | 認証情報がRendererに漏洩していないか     |
| パフォーマンス     | ✅ 適用  | P31対策、不要再レンダリング防止          |
| エラーハンドリング | ✅ 適用  | エラー状態の適切な管理とユーザーへの表示 |
| アクセシビリティ   | 条件付き | UIコンポーネント変更がある場合のみ       |

### Electronデスクトップアプリ観点

| 層                         | 適用判断 | 確認内容                        |
| -------------------------- | -------- | ------------------------------- |
| フロントエンド（Renderer） | ✅ 適用  | Store Hooks使用パターンの正確性 |
| IPC通信                    | ✅ 適用  | authMode IPC呼び出しの正確性    |
| Preload/セキュリティ       | ✅ 適用  | contextBridge経由のAPI使用確認  |

## 成果物

| 成果物       | パス                                | 説明         |
| ------------ | ----------------------------------- | ------------ |
| 品質レポート | `outputs/phase-9/quality-report.md` | 品質検証結果 |

## 完了条件

- [ ] 全品質ゲートをクリア
  - [ ] ユニットテスト全成功
  - [ ] 統合テスト全成功
  - [ ] ESLintエラーゼロ
  - [ ] TypeScript型チェックエラーゼロ
  - [ ] カバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+）
- [ ] セキュリティチェック完了
  - [ ] 認証情報がRendererに漏洩していない
  - [ ] 状態の分離が適切
- [ ] パフォーマンスチェック完了
  - [ ] P31パターン（無限ループ）が存在しない
  - [ ] 不要な再レンダリングがない
- [ ] 統合テスト結果が確認されている
- [ ] 品質レポートが作成されている
- [ ] **本Phase内の全タスクを100%実行完了**

## サブタスク管理

Phase実行開始時に、TodoWriteツールで以下のサブタスクを作成すること:

1. 全自動テスト実行
2. 静的解析実行（ESLint, TypeScript, Prettier）
3. セキュリティ検証
4. パフォーマンス検証
5. カバレッジ測定・確認
6. 品質レポート作成
7. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

## タスク100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクの成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

## 次のPhase

Phase 10: 最終レビューゲート

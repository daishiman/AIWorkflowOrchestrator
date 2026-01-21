# Vitest テスト分離問題の修正 - タスク指示書

## メタ情報

```yaml
issue_number: 383
```

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| タスクID     | vitest-isolation-bugfix     |
| タスク名     | Vitest テスト分離問題の修正 |
| 分類         | バグ修正                    |
| 対象機能     | apps/desktop テストスイート |
| 優先度       | 中                          |
| 見積もり規模 | 中規模                      |
| ステータス   | 未実施                      |
| 発見元       | Phase 11（手動テスト検証）  |
| 発見日       | 2026-01-17                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

skill-ipc-handlers-registration-bugfix タスクのPhase 11（手動テスト検証）において、
全テストを一括実行した際に一部のテストが失敗することが発見された。

個別にテストを実行すると全て成功するが、`pnpm --filter @repo/desktop test`で
全テストを一括実行すると、以下のテストが失敗する：

- `src/main/ipc/__tests__/agentHandlers.test.ts` (16 tests)
- `src/main/services/agent/__tests__/integration.test.ts` (8 tests)

### 1.2 問題点・課題

**現象**:

```
Error: Failed to resolve entry for package "@repo/shared".
The package may have incorrect main/module/exports specified in its package.json.
File: apps/desktop/src/main/services/agent/HooksFactory.ts
```

**検証結果**:

| 実行方法                   | 結果          |
| -------------------------- | ------------- |
| HooksFactory.test.ts 単体  | ✅ 20/20 パス |
| agentHandlers.test.ts 単体 | ✅ 16/16 パス |
| integration.test.ts 単体   | ✅ 8/8 パス   |
| 全テスト一括実行           | ❌ 24件 失敗  |

**原因分析**:

1. **テスト間の干渉（Test Isolation Issue）**
   - 先行テストがモジュールキャッシュや`vi.mock`の状態を汚染
   - 後続テストで`@repo/shared`の解決が失敗

2. **vitest.config.ts の alias 不完全**
   - `@repo/shared/agent`、`@repo/shared/schemas` にはaliasあり
   - `@repo/shared`（デフォルトエクスポート）のaliasがない

3. **`@repo/shared` の dist/index.js の構造**
   - トップレベルで `@supabase/supabase-js` をインポート
   - モック状態の影響を受けやすい構造

### 1.3 放置した場合の影響

| 影響                   | 詳細                                         |
| ---------------------- | -------------------------------------------- |
| CI/CD の不安定化       | 全テスト実行が不定で失敗する可能性           |
| 開発効率の低下         | テスト失敗の原因調査に時間を浪費             |
| 品質保証の不確実性     | テスト結果が実行順序に依存する状態           |
| 新規テスト追加時の問題 | 新しいテストが既存テストに影響を与える可能性 |

---

## 2. 何を達成するか（What）

### 2.1 目的

全テストを一括実行しても、テスト間の干渉なく全てパスする状態を実現する。

### 2.2 最終ゴール

```bash
pnpm --filter @repo/desktop test
# 結果: 全259テストファイル、5122テストがパス
```

### 2.3 スコープ

#### 含むもの

- vitest.config.ts の alias 設定修正
- テスト間のモジュール分離改善
- 影響を受けるテストファイルの修正
- 修正後の全テスト実行確認

#### 含まないもの

- `@repo/shared` パッケージのリファクタリング
- Supabase関連機能の変更
- 新規テストの追加
- E2Eテストの修正

### 2.4 成果物

| 成果物                         | 配置先                              |
| ------------------------------ | ----------------------------------- |
| 修正されたvitest.config.ts     | apps/desktop/vitest.config.ts       |
| テスト分離修正（該当ファイル） | apps/desktop/src/\*_/**tests**/_.ts |
| 品質確認レポート               | outputs/phase-9/quality-report.md   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] 現行テストの失敗パターンを把握している
- [ ] 個別テスト実行で全て成功することを確認済み
- [ ] `@repo/shared` のビルドが完了している

### 3.2 依存タスク

| 依存タスク                             | 状態 |
| -------------------------------------- | ---- |
| skill-ipc-handlers-registration-bugfix | 完了 |

### 3.3 必要な知識

| 分野          | 必要な知識                         |
| ------------- | ---------------------------------- |
| Vitest        | モジュールモック、テスト分離、設定 |
| Vite          | resolve.alias、モジュール解決      |
| pnpm monorepo | ワークスペース、パッケージ解決     |
| TypeScript    | モジュールシステム、ESM            |

### 3.4 推奨アプローチ

**アプローチA（推奨）: vitest.config.ts の alias 追加**

```typescript
// vitest.config.ts
resolve: {
  alias: {
    // 既存のalias...
    "@repo/shared": resolve(__dirname, "../../packages/shared/src/index.ts"),
  },
},
```

**アプローチB: テストファイルでの明示的なモジュールリセット**

```typescript
// 各テストファイルの beforeEach で
beforeEach(() => {
  vi.resetModules();
});
```

**アプローチC: テスト実行の順序制御**

```typescript
// vitest.config.ts
test: {
  sequence: {
    shuffle: false,
  },
  pool: 'forks', // 'threads' から変更
},
```

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 内容                               |
| ----- | ------------ | ---------------------------------- |
| 1     | 要件定義     | 失敗パターンの詳細分析             |
| 2     | 設計         | 修正アプローチの選定               |
| 3     | 設計レビュー | アプローチの妥当性確認             |
| 4     | TDD Red      | 失敗を再現するテスト環境構築       |
| 5     | TDD Green    | 修正の実装                         |
| 6     | テスト拡充   | 全テスト一括実行の確認             |
| 7-9   | 品質保証     | 静的解析、セキュリティチェック     |
| 10-12 | 最終確認     | レビュー、手動テスト、ドキュメント |

### Phase 1: 要件定義

#### 目的

失敗パターンを詳細に分析し、根本原因を特定する。

#### 手順

1. 全テスト実行時の失敗ログを収集
2. 失敗するテストの依存関係を分析
3. モジュール解決の流れを追跡
4. 根本原因を特定

#### 成果物

- `outputs/phase-1/root-cause-analysis.md`
- `outputs/phase-1/acceptance-criteria.md`

#### 完了条件

- [ ] 失敗の根本原因が特定されている
- [ ] 受け入れ基準が定義されている

### Phase 5: TDD Green（実装）

#### 目的

テスト分離問題を修正する。

#### 手順

1. vitest.config.ts に `@repo/shared` の alias を追加
2. 必要に応じてテストファイルに `vi.resetModules()` を追加
3. テスト実行プールの設定を検討
4. 全テスト一括実行で成功を確認

#### 成果物

- 修正されたvitest.config.ts
- 修正されたテストファイル（該当する場合）

#### 完了条件

- [ ] 全テストが一括実行でパスする
- [ ] 個別テスト実行も引き続きパスする
- [ ] CI環境でも成功する

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `pnpm --filter @repo/desktop test` で全テストがパス
- [ ] 個別テスト実行でも全テストがパス
- [ ] テスト実行順序に依存しない状態

### 品質要件

- [ ] ESLint エラーなし
- [ ] TypeScript 型エラーなし
- [ ] 既存テストの挙動が変わらない

### ドキュメント要件

- [ ] 修正内容がコメントで説明されている
- [ ] Phase成果物が全て作成されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テストケース               | 期待結果         |
| ------ | -------------------------- | ---------------- |
| TC-001 | 全テスト一括実行           | 全5122件パス     |
| TC-002 | agentHandlers.test.ts 単体 | 16件パス         |
| TC-003 | integration.test.ts 単体   | 8件パス          |
| TC-004 | HooksFactory.test.ts 単体  | 20件パス         |
| TC-005 | テスト実行順序をシャッフル | 全テストパス     |
| TC-006 | 3回連続で全テスト実行      | 全て安定してパス |

### 検証手順

```bash
# 1. 全テスト実行
pnpm --filter @repo/desktop test -- --run

# 2. 順序シャッフルで実行
pnpm --filter @repo/desktop test -- --run --sequence.shuffle

# 3. 3回連続実行
for i in 1 2 3; do
  echo "Run $i:"
  pnpm --filter @repo/desktop test -- --run
done
```

---

## 7. リスクと対策

| リスク                      | 影響度 | 発生確率 | 対策                               |
| --------------------------- | ------ | -------- | ---------------------------------- |
| alias追加で他テストが壊れる | 中     | 低       | 段階的に変更、各段階でテスト実行   |
| テスト実行速度の低下        | 低     | 中       | pool設定を最適化                   |
| monorepo依存関係の問題      | 中     | 低       | pnpm workspace設定の確認           |
| 本番コードへの影響          | 高     | 低       | テスト設定のみ変更、本番コード不変 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント     | パス                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| 発見時のレポート | `skill-ipc-handlers-registration-bugfix/outputs/phase-11/discovered-issues.md`         |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            |
| テスト戦略       | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md#テスト戦略` |

### 参考資料

| 資料                  | URL                                                       |
| --------------------- | --------------------------------------------------------- |
| Vitest Configuration  | https://vitest.dev/config/                                |
| Vitest Test Isolation | https://vitest.dev/guide/test-context.html                |
| Vite resolve.alias    | https://vite.dev/config/shared-options.html#resolve-alias |

---

## 9. 備考

### 発見時の観察

```
全テスト実行: 18 failed | 241 passed (259 Test Files)
             204 failed | 4913 passed | 5 skipped (5122 Tests)

エラーメッセージ:
Error: Failed to resolve entry for package "@repo/shared".
The package may have incorrect main/module/exports specified in its package.json.
  File: apps/desktop/src/main/services/agent/HooksFactory.ts
```

### 補足事項

- この問題はmainブランチにも存在する可能性が高い
- HooksFactory.ts導入時（コミット 4f173f3f）に vitest設定が完全に更新されなかったことが原因
- skill-ipc-handlers-registration-bugfix タスクとは無関係の既存問題

### 優先度の根拠

- **中**: テストの信頼性に影響するが、個別テストは成功するため開発は継続可能
- CI/CDの安定性向上のため、早めの対応が望ましい

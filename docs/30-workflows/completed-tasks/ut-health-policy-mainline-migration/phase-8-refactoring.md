# Phase 8: リファクタリング

## メタ情報

| 項目         | 値                                      |
| ------------ | --------------------------------------- |
| タスクID     | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 |
| フェーズ     | Phase 8                                 |
| フェーズ名   | リファクタリング                        |
| 前提フェーズ | Phase 7（カバレッジ確認 PASS）          |
| 担当         | 実装担当者                              |
| 成果物       | `outputs/phase-8/refactoring-report.md` |

---

## 目的

Phase 5 で実施した実装変更（`apiKeyDegraded` 独自算出ロジックの削除）を対象に、コードの可読性・保守性を確認する。

本タスクは変更規模が小さい（主に L117-120 の削除と関数呼び出しへの置き換え）ため、大規模なリファクタリングは不要である。このフェーズでは「削除されたロジックの記録」と「コードレビュー観点の確認」を主目的とする。

---

## 対象ファイル

| 区分                     | ファイルパス                                                    |
| ------------------------ | --------------------------------------------------------------- |
| リファクタリング確認対象 | `apps/desktop/src/renderer/hooks/useMainlineExecutionAccess.ts` |

---

## 削除されたロジックの記録

削除した `apiKeyDegraded` 独自算出ロジック（旧 L117-120）を以下の Before/After テーブルに記録する。

### Before / After / 理由 テーブル

| 項目                                         | Before（削除前）                                                                  | After（削除後）                                                                                                       | 理由                                                                                      |
| -------------------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `apiKeyDegraded` の算出方法                  | `useMainlineExecutionAccess.ts` 内で独自ロジックにより算出（L117-120）            | `resolveHealthPolicy()` が返す `HealthPolicy` を `buildMainlineExecutionAccessState()` に渡すことで間接的に表現       | ヘルス判定ロジックを `resolveHealthPolicy()` に一元化し、フック内の重複実装を排除するため |
| `apiKeyDegraded` 変数の存在                  | 存在する（`const apiKeyDegraded = ...`）                                          | 存在しない（変数自体を削除）                                                                                          | `HealthPolicy` 型が同等の情報を内包するため変数は不要                                     |
| `buildMainlineExecutionAccessState()` の引数 | `apiKeyDegraded` フラグを個別引数として渡していた                                 | `healthPolicy: HealthPolicy` オブジェクトを渡す                                                                       | 型安全性の向上と将来の拡張容易性のため                                                    |
| インポート                                   | `apiKeyDegraded` 関連の型・ユーティリティをインポートしていた場合、その import 文 | `resolveHealthPolicy` / `HealthPolicy` / `buildMainlineExecutionAccessState` を `@repo/shared/types` 経由でインポート | 一元化されたインポートパスへの統一（AC-4 対応）                                           |

### 削除コードスニペット（参考記録）

```typescript
// 削除前（旧 L117-120 相当の独自算出ロジック）
// ※ 実際のコードは Phase 5 実装時に記録すること
const apiKeyDegraded =
  selectedHealthStatus === "degraded" ||
  (selectedHealthStatus === "unknown" && !isApiKeySet);
```

### 追加コードスニペット（参考記録）

```typescript
// 削除後（resolveHealthPolicy() + buildMainlineExecutionAccessState() への統一）
const healthPolicy = resolveHealthPolicy({
  connectionStatus,
  selectedHealthStatus,
  isApiKeySet,
});

const accessState = buildMainlineExecutionAccessState({
  healthPolicy /* 他引数 */,
});
```

> **注意**: 上記スニペットは概念説明用のサンプルである。実際のコードは `useMainlineExecutionAccess.ts` を参照すること。

---

## コードレビュー観点

以下の観点でコードを確認し、問題があれば修正する。

### 1. import 順序

| 確認項目                                                      | 基準                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| `@repo/shared/types` からのインポートが適切に整理されているか | 外部パッケージ → 内部パッケージ（`@repo/...`）→ 相対パスの順  |
| 不要になった import 文が残っていないか                        | `apiKeyDegraded` 関連の旧インポートがあれば削除済みであること |
| import の重複がないか                                         | 同一モジュールからの import が複数行に分散していないこと      |

### 2. 命名一貫性

| 確認項目                                                                   | 基準                                    |
| -------------------------------------------------------------------------- | --------------------------------------- |
| `healthPolicy` 変数名が `resolveHealthPolicy()` の命名規則と一貫しているか | `resolve*` → `*Policy` パターンの一貫性 |
| 関数名・変数名が camelCase で統一されているか                              | TypeScript コーディング規約に従う       |
| `HealthPolicy` 型名が `@repo/shared/types` の定義と一致しているか          | 型エイリアスや再定義がないこと          |

### 3. その他の観点

| 確認項目                                 | 基準                                               |
| ---------------------------------------- | -------------------------------------------------- |
| マジックナンバー・マジック文字列がないか | 条件値は定数または型で表現する                     |
| コメントが実態と乖離していないか         | 削除ロジックに関する古いコメントが残っていないこと |
| `any` 型の使用がないか                   | 厳密な型定義を維持する                             |

---

## リファクタリング対象外の確認

以下の項目は本タスクのスコープ外であり、変更しないこと。

| 項目                                             | 理由                   |
| ------------------------------------------------ | ---------------------- |
| `resolveHealthPolicy()` の内部実装               | 別タスクのスコープ     |
| `buildMainlineExecutionAccessState()` の内部実装 | 別タスクのスコープ     |
| テストファイルのリファクタリング                 | Phase 6 で対応済み     |
| `useMainlineExecutionAccess.ts` 以外のファイル   | 変更最小限の原則に従う |

---

## 完了条件（フェーズゲート）

| 条件                                                                           | 確認方法                      |
| ------------------------------------------------------------------------------ | ----------------------------- |
| Before/After テーブルが outputs/phase-8/refactoring-report.md に記録されている | ファイル確認                  |
| import 順序が規約に沿っている                                                  | コードレビュー                |
| 命名一貫性が保たれている                                                       | コードレビュー                |
| 不要な import が削除されている                                                 | `pnpm typecheck` でエラーなし |
| `any` 型が使用されていない                                                     | TypeScript 型チェック         |

---

## 成果物

- **レポートファイル**: `outputs/phase-8/refactoring-report.md`
  - Before/After テーブル（削除されたロジックの記録）
  - コードレビュー観点の確認結果
  - 指摘事項と対応状況
  - 次フェーズ（Phase 9）への引き継ぎ事項

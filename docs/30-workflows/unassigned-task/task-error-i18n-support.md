# エラーメッセージ国際化対応 - タスク指示書

## メタ情報

| 項目         | 内容                                     |
| ------------ | ---------------------------------------- |
| タスクID     | error-i18n-support                       |
| タスク名     | エラーメッセージ国際化対応               |
| 分類         | 改善                                     |
| 対象機能     | HistoryService / エラーハンドリング      |
| 優先度       | 低                                       |
| 見積もり規模 | 中規模                                   |
| ステータス   | 未実施                                   |
| 発見元       | Phase 9 (history-service-db-integration) |
| 発見日       | 2026-01-12                               |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

history-service-db-integration タスクのPhase 9（品質保証）において、`toRendererError` 関数が「未使用関数」として検出された。この関数は将来のエラーメッセージ国際化対応のために準備されたものであり、現時点では使用されていないが、将来拡張用に保持されている。

現在のエラーメッセージはハードコードされた日本語文字列であり、国際化（i18n）対応が必要になった際にスムーズに対応できるよう、`toRendererError` 関数を活用した仕組みを構築しておくことが望ましい。

### 1.2 問題点・課題

| 問題                         | 詳細                                                 |
| ---------------------------- | ---------------------------------------------------- |
| ハードコードされたメッセージ | エラーメッセージが日本語で固定されている             |
| 未使用コードの存在           | `toRendererError` が定義されているが使用されていない |
| 将来の拡張性                 | 多言語対応時に大規模な修正が必要になる可能性         |

### 1.3 放置した場合の影響

| 影響                   | 深刻度 |
| ---------------------- | ------ |
| 多言語対応時の工数増加 | 中     |
| コードの一貫性の欠如   | 低     |
| 未使用コードの蓄積     | 低     |

---

## 2. 何を達成するか（What）

### 2.1 目的

HistoryServiceのエラーメッセージを国際化対応可能な仕組みに置き換え、将来の多言語サポートに備える。

### 2.2 最終ゴール

- `toRendererError` 関数を活用したエラーメッセージ変換の実装
- エラーメッセージキー方式への移行（リソースファイル管理）
- 日本語/英語の2言語サポート（初期実装）

### 2.3 スコープ

#### 含むもの

- `toRendererError` 関数の活用と拡張
- エラーメッセージリソースファイルの作成
- HistoryServiceでのi18n対応
- ユニットテストの追加

#### 含まないもの

- 他のサービスへのi18n展開
- UI側の言語切り替え機能
- 3言語以上のサポート

### 2.4 成果物

| 成果物                           | 配置先                                                                    |
| -------------------------------- | ------------------------------------------------------------------------- |
| エラーメッセージリソースファイル | `packages/shared/src/i18n/messages/` または `apps/desktop/src/main/i18n/` |
| 更新されたHistoryService         | `apps/desktop/src/main/services/HistoryService.ts`                        |
| ユニットテスト                   | `apps/desktop/src/main/services/__tests__/HistoryService.i18n.test.ts`    |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 前提条件                                          | 必須 |
| ------------------------------------------------- | ---- |
| history-service-db-integration が完了していること | ✅   |
| 現在のHistoryServiceが動作していること            | ✅   |

### 3.2 依存タスク

なし（独立した改善タスク）

### 3.3 必要な知識

| 技術       | 必要レベル | 備考               |
| ---------- | ---------- | ------------------ |
| TypeScript | 中級       | 型安全なi18n実装   |
| i18n基礎   | 基礎       | メッセージキー方式 |
| テスト     | 中級       | モック・スタブ活用 |

### 3.4 推奨アプローチ

1. **設計**: i18n方式の検討（リソースファイル vs インライン）
2. **実装**: メッセージリソースファイル作成
3. **統合**: HistoryServiceへの組み込み
4. **テスト**: ユニットテスト作成

---

## 4. 実行手順

### Phase構成

標準的なPhase構成（1-12）を簡略化して適用。

### Phase 1: 要件定義

#### 目的

i18n対応の詳細要件を定義する。

#### 手順

1. 現在のエラーメッセージを洗い出し

   ```bash
   grep -rn "指定された\|見つかりません\|できません\|問題があります" apps/desktop/src/main/services/HistoryService.ts
   ```

2. 対応言語を決定（初期: ja, en）

3. メッセージリソース形式を決定（JSON vs TypeScript）

#### 成果物

- エラーメッセージ一覧
- i18n要件仕様書

#### 完了条件

- [ ] 全エラーメッセージが洗い出されている
- [ ] 対応言語が決定されている

### Phase 2: 設計

#### 目的

i18n実装の詳細設計を行う。

#### 手順

1. メッセージキー命名規則を決定

   ```
   例: history.error.versionNotFound
   例: history.error.cannotRestore
   ```

2. リソースファイル構造を設計

   ```typescript
   // messages/ja.ts
   export const ja = {
     history: {
       error: {
         versionNotFound: "指定されたバージョンが見つかりません",
         cannotRestore: "このファイルには復元できません",
         databaseError: "データベース接続に問題があります",
         unexpectedError: "予期しないエラーが発生しました",
       },
     },
   };
   ```

3. `toRendererError` 関数の拡張設計

   ```typescript
   type ErrorKey =
     | "versionNotFound"
     | "cannotRestore"
     | "databaseError"
     | "unexpectedError";

   function toRendererError(key: ErrorKey, locale: "ja" | "en" = "ja"): string {
     return messages[locale].history.error[key];
   }
   ```

#### 成果物

- i18n設計書

#### 完了条件

- [ ] メッセージキー命名規則が決定
- [ ] リソースファイル構造が設計されている
- [ ] `toRendererError` の拡張仕様が定義されている

### Phase 3-4: テスト作成・実装（TDD）

#### 目的

TDDでi18n機能を実装する。

#### テスト作成手順

1. `toRendererError` のユニットテスト作成

   ```typescript
   describe("toRendererError", () => {
     it("日本語メッセージを返す（デフォルト）", () => {
       expect(toRendererError("versionNotFound")).toBe(
         "指定されたバージョンが見つかりません",
       );
     });

     it("英語メッセージを返す", () => {
       expect(toRendererError("versionNotFound", "en")).toBe(
         "The specified version was not found",
       );
     });

     it("不正なキーでフォールバックメッセージを返す", () => {
       expect(toRendererError("unknown" as any)).toBe(
         "An unexpected error occurred",
       );
     });
   });
   ```

2. HistoryServiceの統合テスト更新

#### 実装手順

1. メッセージリソースファイル作成
   - `messages/ja.ts`
   - `messages/en.ts`
   - `messages/index.ts`

2. `toRendererError` 関数の実装

3. HistoryServiceのエラーメッセージを置き換え

   ```typescript
   // Before
   return {
     success: false,
     error: new Error("指定されたバージョンが見つかりません"),
   };

   // After
   return {
     success: false,
     error: new Error(toRendererError("versionNotFound")),
   };
   ```

#### 成果物

- ユニットテスト
- メッセージリソースファイル
- 更新されたHistoryService

#### 完了条件

- [ ] テストが全てパス
- [ ] カバレッジ80%以上維持
- [ ] 日本語/英語メッセージが正しく返る

### Phase 5-9: 検証・品質保証

#### 手順

1. ユニットテスト実行

   ```bash
   pnpm --filter @repo/desktop test -- --testPathPattern="HistoryService"
   ```

2. カバレッジ確認

   ```bash
   pnpm --filter @repo/desktop test:coverage
   ```

3. ESLint/TypeScript確認
   ```bash
   pnpm lint
   pnpm typecheck
   ```

#### 完了条件

- [ ] テストカバレッジ80%以上
- [ ] ESLintエラー0件
- [ ] TypeScriptエラー0件

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `toRendererError` 関数が活用されている
- [ ] 日本語エラーメッセージが正常に表示される
- [ ] 英語エラーメッセージが正常に表示される
- [ ] フォールバックメッセージが定義されている

### 品質要件

- [ ] テストカバレッジ80%以上
- [ ] ESLintエラー0件
- [ ] TypeScriptエラー0件
- [ ] 既存テストが全てパス

### ドキュメント要件

- [ ] メッセージキー一覧がドキュメント化されている
- [ ] 新しい言語追加手順がドキュメント化されている

---

## 6. 検証方法

### テストケース

| #   | テスト               | 期待結果                 |
| --- | -------------------- | ------------------------ |
| 1   | 日本語メッセージ取得 | 日本語メッセージが返る   |
| 2   | 英語メッセージ取得   | 英語メッセージが返る     |
| 3   | 不正なキー           | フォールバックメッセージ |
| 4   | HistoryService統合   | i18nメッセージが返る     |

### 検証手順

```bash
# テスト実行
pnpm --filter @repo/desktop test -- --testPathPattern="i18n\|HistoryService"

# カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# 型チェック
pnpm typecheck
```

---

## 7. リスクと対策

| リスク             | 影響度 | 発生確率 | 対策                                   |
| ------------------ | ------ | -------- | -------------------------------------- |
| 既存テストの破損   | 中     | 中       | テストも同時に更新                     |
| パフォーマンス影響 | 低     | 低       | シンプルなオブジェクトルックアップ採用 |
| 型安全性の欠如     | 中     | 低       | 厳密な型定義                           |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント        | パス                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| Phase 9品質レポート | `docs/30-workflows/history-service-db-integration/outputs/phase-9/quality-report.md` |
| HistoryService実装  | `apps/desktop/src/main/services/HistoryService.ts`                                   |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料       | パス                                                                                | 内容                 |
| -------------- | ----------------------------------------------------------------------------------- | -------------------- |
| 内部API仕様    | `.claude/skills/aiworkflow-requirements/references/api-internal-conversion.md`      | エラーメッセージ仕様 |
| アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/architecture-file-conversion.md` | HistoryService設計   |

### 参考資料

| 資料                     | URL                                                             |
| ------------------------ | --------------------------------------------------------------- |
| TypeScript i18n パターン | https://www.typescriptlang.org/docs/handbook/utility-types.html |
| React-intl（参考）       | https://formatjs.io/docs/react-intl/                            |

---

## 9. 備考

### 現在のエラーメッセージ一覧

| 内部エラー                | 現在のメッセージ                         |
| ------------------------- | ---------------------------------------- |
| `Conversion not found`    | 「指定されたバージョンが見つかりません」 |
| `does not belong to file` | 「このファイルには復元できません」       |
| `database` / `DB`         | 「データベース接続に問題があります」     |
| その他                    | 「予期しないエラーが発生しました」       |

### toRendererError 関数の現在の実装

```typescript
// apps/desktop/src/main/services/HistoryService.ts
// 現在は未使用だが、将来の国際化対応用に保持

private toRendererError(internalError: string): string {
  if (internalError.includes('Conversion not found')) {
    return '指定されたバージョンが見つかりません';
  }
  if (internalError.includes('does not belong to file')) {
    return 'このファイルには復元できません';
  }
  if (internalError.toLowerCase().includes('database') ||
      internalError.toLowerCase().includes('db')) {
    return 'データベース接続に問題があります';
  }
  return '予期しないエラーが発生しました';
}
```

### 補足事項

- 優先度は「低」だが、将来の保守性向上に貢献
- 他サービスへの展開は別タスクとして扱う
- UIの言語切り替え機能は別途検討が必要

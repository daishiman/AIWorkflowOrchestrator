# UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001: vitest resolve.alias 標準化

## メタ情報

| 項目         | 値                                                                     |
| ------------ | ---------------------------------------------------------------------- |
| タスクID     | UT-SKILL-WIZARD-FB-01-VITEST-ALIAS-STANDARDIZATION-001                 |
| issue_number | 2029                                                                   |
| 検出元       | UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001 Phase 11 フィードバック |
| 優先度       | MEDIUM                                                                 |
| 影響         | フック自動import変換後にテスト解決不可になる（全テスト失敗リスク）     |
| 検出日       | 2026-04-07                                                             |

## 概要

`packages/shared/` 内テストが `@repo/shared` をインポートする場合、vitest.config.ts に resolve.alias 設定が必須だが、パッケージ標準テンプレートに含まれていなかった。ESLint post-tool-use フックが import パスを `../smartDefaultReasoningService` → `@repo/shared` へ自動変換した後、vitest が `@repo/shared` を解決できずテストが全件失敗する問題が発生した。

## 現状

```typescript
// 現状: resolve.alias なし
export default defineConfig({
  test: {
    environment: "node",
  },
});
```

## 期待される修正

```typescript
// 修正後: @repo/shared alias を追加
import { resolve } from "path";
export default defineConfig({
  test: {
    environment: "node",
  },
  resolve: {
    alias: {
      "@repo/shared": resolve(__dirname, "./index.ts"),
    },
  },
});
```

## 完了条件

- [ ] packages/shared/vitest.config.ts に resolve.alias 設定が含まれる
- [ ] @repo/shared インポートを含むテストが vitest で解決できる
- [ ] 既存の全テストが PASS する
- [ ] 新規パッケージ作成時のテンプレートに resolve.alias が標準で含まれる

## 苦戦箇所記録

ESLint post-tool-use フックが自動的にインポートパスを変換する挙動と vitest の alias 未設定が組み合わさることで、フックが実行された後に突然テストが全件解決不可になる。フックが変更したファイルを手動でレビューしないと原因特定が困難。

## 関連

- 検出タスク: UT-SKILL-WIZARD-W0-SMART-DEFAULT-REASONING-001
- 関連フィードバック: FB-01（Phase 12 skill-feedback-report.md）
- 対象ファイル: packages/shared/vitest.config.ts

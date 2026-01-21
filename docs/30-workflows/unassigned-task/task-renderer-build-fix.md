# Rendererビルド問題修正 - タスク指示書

## メタ情報

```yaml
issue_number: 357
```

## メタ情報

| 項目         | 内容                                      |
| ------------ | ----------------------------------------- |
| タスクID     | renderer-build-fix                        |
| タスク名     | Rendererビルド問題修正                    |
| 分類         | バグ修正                                  |
| 対象機能     | Electron Renderer / Vite設定              |
| 優先度       | 高                                        |
| 見積もり規模 | 小規模                                    |
| ステータス   | 未実施                                    |
| 発見元       | Phase 11 (history-service-db-integration) |
| 発見日       | 2026-01-12                                |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

history-service-db-integration タスクのPhase 11（手動テスト検証）において、Electron Rendererビルド時に以下のエラーが発生した:

```
Error: Rollup failed to resolve import "@repo/shared/types/skill"
from "src/renderer/components/molecules/SkillCategoryFilter/index.tsx"
```

このエラーは、ViteのRollupバンドラーがmonorepo内の共有パッケージ（`@repo/shared`）のインポートを正しく解決できないことに起因する。

### 1.2 問題点・課題

| 問題               | 詳細                                              |
| ------------------ | ------------------------------------------------- |
| インポート解決失敗 | `@repo/shared/types/skill` がRollupで解決できない |
| ビルド失敗         | Rendererのプロダクションビルドが完了しない        |
| GUI機能停止        | Electronアプリ全体のGUI機能が動作しない           |

### 1.3 放置した場合の影響

| 影響                                  | 深刻度 |
| ------------------------------------- | ------ |
| HistoryPanel含む全GUI機能のテスト不可 | 高     |
| 本番リリース不可                      | 高     |
| 他の機能開発への波及（E2Eテスト不可） | 中     |

---

## 2. 何を達成するか（What）

### 2.1 目的

Electron Rendererのビルドを正常に完了させ、GUI機能が動作する状態に復旧する。

### 2.2 最終ゴール

- `pnpm --filter @repo/desktop build` が成功する
- Electronアプリが正常に起動し、GUI画面が表示される
- `@repo/shared` パッケージのインポートがすべて解決される

### 2.3 スコープ

#### 含むもの

- Vite設定（`vite.config.ts`）の修正
- `@repo/shared` パッケージのalias設定
- SkillCategoryFilterコンポーネントのインポートパス修正（必要な場合）
- ビルド成功の検証

#### 含まないもの

- 新機能の追加
- 他パッケージのリファクタリング
- テストコードの追加

### 2.4 成果物

| 成果物                           | 配置先                          |
| -------------------------------- | ------------------------------- |
| 修正済みVite設定                 | `apps/desktop/vite.*.config.ts` |
| 修正済みインポートパス（該当時） | `src/renderer/components/**`    |
| ビルド成功ログ                   | Phase完了レポート               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Node.js 20.x以上がインストールされている
- pnpmがインストールされている
- プロジェクトの依存関係がインストール済み（`pnpm install`）

### 3.2 依存タスク

なし（独立したバグ修正タスク）

### 3.3 必要な知識

| 技術       | 必要レベル | 備考                            |
| ---------- | ---------- | ------------------------------- |
| Vite       | 中級       | alias設定、Rollup解決オプション |
| TypeScript | 基礎       | パスエイリアス理解              |
| Monorepo   | 基礎       | パッケージ参照の仕組み          |

### 3.4 推奨アプローチ

1. **原因特定**: どのファイルで解決失敗しているか確認
2. **Vite設定調査**: 現在のalias設定を確認
3. **修正適用**: alias設定を追加/修正
4. **ビルド検証**: プロダクションビルドを実行

---

## 4. 実行手順

### Phase構成

このタスクは小規模なため、簡易Phase構成（3 Phase）を採用。

### Phase 1: 調査・原因特定

#### 目的

ビルドエラーの根本原因を特定する。

#### 手順

1. エラーログを詳細に確認

   ```bash
   pnpm --filter @repo/desktop build:renderer 2>&1 | tee build-error.log
   ```

2. 現在のVite設定を確認

   ```bash
   cat apps/desktop/vite.renderer.config.ts
   ```

3. `@repo/shared` パッケージのexports設定を確認

   ```bash
   cat packages/shared/package.json | jq '.exports'
   ```

4. TypeScriptのパスエイリアス設定を確認
   ```bash
   cat apps/desktop/tsconfig.json | jq '.compilerOptions.paths'
   ```

#### 成果物

- 原因特定レポート（どこで解決失敗しているか）

#### 完了条件

- [ ] エラーの根本原因が特定されている
- [ ] 修正すべきファイルが特定されている

### Phase 2: 修正実装

#### 目的

特定された原因に対する修正を実装する。

#### 手順

1. Vite設定にalias追加（最も可能性の高い修正）

   ```typescript
   // vite.renderer.config.ts
   import { resolve } from "path";

   export default defineConfig({
     resolve: {
       alias: {
         "@repo/shared": resolve(__dirname, "../../packages/shared/src"),
         // または個別のサブパス
         "@repo/shared/types": resolve(
           __dirname,
           "../../packages/shared/src/types",
         ),
       },
     },
   });
   ```

2. または `optimizeDeps` 設定を追加

   ```typescript
   export default defineConfig({
     optimizeDeps: {
       include: ["@repo/shared"],
     },
   });
   ```

3. TypeScript paths設定との整合性を確認・修正

#### 成果物

- 修正されたVite設定ファイル

#### 完了条件

- [ ] Vite設定が修正されている
- [ ] TypeScript paths設定と整合性がある

### Phase 3: 検証・完了

#### 目的

修正が正常に動作することを検証する。

#### 手順

1. ビルド実行

   ```bash
   pnpm --filter @repo/desktop build
   ```

2. アプリ起動確認

   ```bash
   pnpm --filter @repo/desktop start
   ```

3. GUI画面が表示されることを確認

4. SkillCategoryFilterコンポーネントが正常に動作することを確認

#### 成果物

- ビルド成功ログ
- アプリ起動スクリーンショット

#### 完了条件

- [ ] `pnpm --filter @repo/desktop build` が成功
- [ ] アプリが正常に起動
- [ ] GUI画面が表示される
- [ ] ESLint/TypeScriptエラーがない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Rendererビルドが成功する
- [ ] `@repo/shared` のインポートが解決される
- [ ] Electronアプリが正常に起動する
- [ ] GUI画面が表示される

### 品質要件

- [ ] ESLintエラー 0件
- [ ] TypeScriptエラー 0件
- [ ] 既存のテストが全てパス

### ドキュメント要件

- [ ] 修正内容がコミットメッセージに記載
- [ ] 必要に応じてREADME更新

---

## 6. 検証方法

### テストケース

| #   | テスト                              | 期待結果               |
| --- | ----------------------------------- | ---------------------- |
| 1   | `pnpm --filter @repo/desktop build` | ビルド成功             |
| 2   | `pnpm --filter @repo/desktop start` | アプリ起動             |
| 3   | GUI画面表示                         | 正常表示               |
| 4   | SkillCategoryFilter表示             | 正常表示（該当画面で） |

### 検証手順

```bash
# 1. クリーンビルド
pnpm --filter @repo/desktop clean
pnpm --filter @repo/desktop build

# 2. ビルド成功確認
echo $?  # 0であれば成功

# 3. アプリ起動
pnpm --filter @repo/desktop start

# 4. GUI確認（手動）
# - アプリウィンドウが表示される
# - エラーダイアログが表示されない
```

---

## 7. リスクと対策

| リスク                              | 影響度 | 発生確率 | 対策                           |
| ----------------------------------- | ------ | -------- | ------------------------------ |
| alias設定が他のインポートを破壊     | 中     | 低       | 変更後に全テスト実行           |
| 複数箇所で同様の問題が発生          | 中     | 中       | 全インポートパスを一括確認     |
| sharedパッケージのexports設定が原因 | 中     | 低       | package.json の exports も確認 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント   | パス                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| Vite設定ガイド | [Vite Resolve Options](https://vitejs.dev/config/shared-options.html#resolve-alias)       |
| pnpm Monorepo  | [pnpm Workspaces](https://pnpm.io/workspaces)                                             |
| 発見元レポート | `docs/30-workflows/history-service-db-integration/outputs/phase-11/manual-test-result.md` |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料     | パス                                                             | 内容                        |
| ------------ | ---------------------------------------------------------------- | --------------------------- |
| 技術スタック | `.claude/skills/aiworkflow-requirements/references/techstack.md` | Vite/Electronバージョン仕様 |

---

## 9. 備考

### 発見時のエラーログ原文

```
Error: Rollup failed to resolve import "@repo/shared/types/skill"
from "src/renderer/components/molecules/SkillCategoryFilter/index.tsx"
```

### 補足事項

- このエラーはhistory-service-db-integration実装前から存在していた可能性がある
- Rendererビルド設定の見直しにより、同様の問題の再発を防止できる
- 修正完了後、history-gui-manual-test タスクの実施が可能になる

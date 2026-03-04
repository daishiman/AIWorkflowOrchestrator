# [#846] "[UT-FIX-TS-VITEST-TSCONFIG-PATHS-001] Vitest alias と tsconfig paths の同期自動化"

## メタ情報

```yaml
task_id: UT-FIX-TS-VITEST-TSCONFIG-PATHS-001
task_name: Vitest alias と tsconfig paths の同期自動化
category: 改善
target_feature: `@repo/shared` サブパス解決運用
priority: 中
scale: 中規模
status: 未実施
source_phase: Phase 3（設計レビュー MINOR）
created_date: 2026-02-20
dependencies: []
spec_path: docs/30-workflows/completed-tasks/unassigned-task/task-vitest-tsconfig-paths-sync-automation.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001` で `apps/desktop/tsconfig.json` と `apps/desktop/vitest.config.ts` に `@repo/shared` サブパスを明示追加し、型解決エラーを解消した。

### 1.2 問題点・課題

サブパス追加時に以下3箇所を手動同期する必要がある。

- `packages/shared/package.json` (`exports` / `typesVersions`)
- `apps/desktop/tsconfig.json` (`compilerOptions.paths`)
- `apps/desktop/vitest.config.ts` (`resolve.alias`)

手動同期は更新漏れを起こしやすい。

### 1.3 放置した場合の影響

- `pnpm typecheck` は通るが `vitest` で解決失敗、または逆の不整合が発生
- 参照先ズレにより回帰バグの検出が遅れる

---

## 2. 何を達成するか（What）

### 2.1 目的

`exports` を正本として `paths` / `alias` を自動検証または自動生成し、手動同期コストと漏れを削減する。

### 2.2 最終ゴール

- CI で `exports ↔ paths ↔ alias` の不整合を自動検出できる
- 新規サブパス追加時に更新手順が1アクションに集約される

### 2.3 スコープ

#### 含むもの

- 同期検証スクリプトの追加
- 失敗時の明確な差分レポート出力
- 開発ガイドライン更新

#### 含まないもの

- `@repo/shared` 以外の全パッケージ同期自動化
- 既存ランタイムAPIの変更

### 2.4 成果物

- 同期検証スクリプト（例: `scripts/verify-shared-subpath-sync.ts`）
- CI 実行コマンドの追加
- 運用ガイド更新

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001` の変更が取り込み済み

### 3.2 依存タスク

- なし（独立実施可）

### 3.3 必要な知識

- TypeScript `paths`
- Vitest `resolve.alias`
- package `exports` / `typesVersions`

### 3.4 推奨アプローチ

- まず「検証のみ」スクリプトを導入し、既存運用を壊さない
- 次段階で自動生成（fix モード）を追加

### 3.5 実装課題と解決策（TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 からの学び）

本タスクの親タスクである TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 の実装で以下の苦戦箇所が判明した。同期自動化スクリプトの設計時にこれらを考慮すること。

#### 課題1: TypeScript paths の定義順序による優先度問題

- **問題**: `tsconfig.json` の `paths` は定義順序で優先度が決まる。`"@repo/shared/*": ["../../packages/shared/src/*"]` のような汎用パスを先に定義すると、`"@repo/shared/types/llm/schemas"` のような具体的サブパスが汎用パスにマッチしてしまい、意図したファイルが解決されない
- **影響**: 自動生成スクリプトで paths を出力する際、順序を間違えると TS2307 エラーが発生する
- **解決策**: 自動生成時は**具体的なパス → 汎用パスの順**（最長一致優先）でソートして出力する。比較時も順序を考慮した検証ロジックが必要

```typescript
// ❌ 汎用パスが先 → 具体パスが無視される
"paths": {
  "@repo/shared/*": ["../../packages/shared/src/*"],        // これが先にマッチ
  "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas.ts"]
}

// ✅ 具体パスが先 → 最長一致で正しく解決
"paths": {
  "@repo/shared/types/llm/schemas": ["../../packages/shared/src/types/llm/schemas.ts"],
  "@repo/shared/*": ["../../packages/shared/src/*"]
}
```

#### 課題2: exports と typesVersions の二重管理

- **問題**: `package.json` の `exports` と `typesVersions` は異なる TypeScript バージョンで参照される。`exports` を更新しても `typesVersions` の更新を忘れると、古い TypeScript 環境で型解決が失敗する
- **影響**: 同期スクリプトが `exports` のみを正本とする場合、`typesVersions` の検証漏れが発生する
- **解決策**: 同期スクリプトでは `exports` と `typesVersions` の両方を正本として扱い、両者の一致も検証対象に含める

#### 課題3: vitest alias の正規表現パターン差異

- **問題**: `tsconfig.json paths` は `@repo/shared/*` のようなワイルドカードで一括マッチするが、`vitest.config.ts alias` は `find/replacement` ペアで個別に定義する必要があるケースがある。特に `@repo/shared/types` と `@repo/shared/types/llm/schemas` のように入れ子のパスは、alias の定義順序やパターンの粒度が結果に影響する
- **影響**: paths と alias の形式差を正しく変換しないと、同期チェックで偽陽性（一致しているのにFAIL）や偽陰性（不整合なのにPASS）が発生する
- **解決策**: paths のワイルドカードパターンと alias の find パターンを正規化して比較するロジックを実装する。変換テーブル方式で明示的なマッピングを定義することを推奨

#### 課題4: 4ファイル同期の網羅性

- **問題**: TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 では `package.json`、`tsconfig.json`、`vitest.config.ts` の3ファイルに加え、`tsup.config.ts`（ビルドエントリ）も同期対象であることが判明した。特に `tsup.config.ts` の `entry` フィールドは dist 出力に影響する
- **影響**: 同期スクリプトが3ファイルのみ対象とすると、ビルド出力との不整合が検出できない
- **解決策**: 同期対象ファイルを設定可能にし、初期は3ファイル（exports/paths/alias）、拡張で4ファイル（+tsup entry）をサポートする設計にする

---

## 4. 実行手順

### Phase 1: 仕様整備

#### 目的

同期対象キーと正本（`exports`）を確定する。

#### 手順

1. `packages/shared/package.json` のサブパスキーを抽出
2. `tsconfig.json` / `vitest.config.ts` の対応キー抽出ロジックを定義
3. 不整合時のエラーフォーマットを定義

#### 成果物

- 同期仕様メモ

#### 完了条件

- 比較仕様がレビュー可能な形で定義されている

### Phase 2: スクリプト実装

#### 目的

不整合検出を自動化する。

#### 手順

1. 比較スクリプト実装
2. 不整合差分（不足・余剰・パス不一致）を出力
3. npm script 追加

#### 成果物

- 実装済みスクリプト

#### 完了条件

- 既知ケースで想定通りに PASS/FAIL する

### Phase 3: CI/ドキュメント連携

#### 目的

恒常運用に組み込む。

#### 手順

1. CI に同期チェックを追加
2. ガイドライン更新
3. 失敗時対応手順を追記

#### 成果物

- CI設定更新
- ガイドライン更新

#### 完了条件

- PR 上で同期不整合が自動検出される

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `exports ↔ paths ↔ alias` 比較スクリプトが追加されている
- [ ] 不整合時に差分が具体的に出力される

### 品質要件

- [ ] 正常系/異常系テストがある
- [ ] CI で自動実行される

### ドキュメント要件

- [ ] 更新手順が `development-guidelines.md` または同等文書に記載される

---

## 6. 検証方法

### テストケース

- `exports` に追加して `paths` 未更新 → FAIL
- `paths` と `alias` の解決先不一致 → FAIL
- 全一致 → PASS

### 検証手順

1. 故意に1エントリ外して FAIL を確認
2. 修正後に PASS を確認

---

## 7. リスクと対策

| リスク                       | 影響度 | 発生確率 | 対策                       |
| ---------------------------- | ------ | -------- | -------------------------- |
| 正規表現ベース抽出の誤検知   | 中     | 中       | AST/JSONベース抽出を優先   |
| 自動修正で意図しない並び替え | 中     | 低       | 初期は検証専用モードに限定 |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`
- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
- `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-3-design-review.md`

---

## 9. 備考

### レビュー指摘の原文（抜粋）

`サブパス追加時の更新箇所が実質3箇所。将来的に自動同期で削減すべき。`

# TypeScript `@repo/shared` モジュール解決エラー 228件の根本解決

## メタ情報

```yaml
issue_number: 837
```

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | task-fix-ts-shared-module-resolution-001                       |
| タスク名     | TypeScript `@repo/shared` モジュール解決エラー 228件の根本解決 |
| 分類         | バグ修正                                                       |
| 対象機能     | モノレポ基盤（TypeScript / パッケージ解決）                    |
| 優先度       | 高                                                             |
| 見積もり規模 | 中規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | TASK-FIX-10-1-VITEST-ERROR-HANDLING Phase 10（既知の問題 2.2） |
| 発見日       | 2026-02-19                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-10-1-VITEST-ERROR-HANDLING の Phase 10 最終レビューにおいて、TypeScript コンパイラが `Cannot find module '@repo/shared'` 系のエラーを 228件報告した。これらは `@repo/shared` パッケージのサブパスエクスポート（例: `@repo/shared/infrastructure/ai/apiKeyValidator`）が TypeScript のモジュール解決と完全に整合していないことに起因する。

TASK-FIX-10-1 では Vitest 側の解決として `vitest.config.ts` に 18個の `resolve.alias` を追加したが、これは Vitest のテスト実行時のみ有効であり、TypeScript コンパイラ（`tsc`）による型チェック時には適用されない。

### 問題点

- `pnpm typecheck` 実行時に 228件の `Cannot find module` エラーが報告される
- `packages/shared/package.json` の `exports` フィールドと、`apps/desktop/tsconfig.json` の `paths` 設定が整合していない
- TypeScript の `moduleResolution` 設定（`bundler` / `node16` / `nodenext`）とサブパスエクスポートの解決方法に齟齬がある

### 放置時の影響

- **開発体験の悪化**: IDE の型推論が動作せず、開発効率が低下する
- **型安全性の形骸化**: 型チェックエラーが大量にある状態では、新規エラーの検出が困難になる（ノイズに埋もれる）
- **CI/CD への影響**: `pnpm typecheck` をゲートに設定できず、型エラーの混入を防止できない
- **二重管理の負担**: Vitest の alias と TypeScript の paths を個別に管理する必要があり、サブパス追加時に 2箇所の更新が必要になる

---

## 2. 何を達成するか（What）

### 目的

`@repo/shared` パッケージのサブパスエクスポートを TypeScript コンパイラが正しく解決できるようにし、`Cannot find module '@repo/shared'` 系エラー 228件を 0件にする。

### 最終ゴール

1. `pnpm typecheck` で `@repo/shared` 関連のモジュール解決エラーが 0件であること
2. Vitest の `resolve.alias` と TypeScript の `paths` が一元管理され、二重管理が解消されること
3. 新しいサブパスエクスポートを追加する際の手順が明確化されていること

### スコープ

**対象**:

- `packages/shared/package.json` の `exports` フィールド
- `packages/shared/tsconfig.json` の設定
- `apps/desktop/tsconfig.json` の `paths` 設定
- `apps/desktop/vitest.config.ts` の `resolve.alias`（一元管理化の検討）
- 必要に応じて `tsconfig.base.json`（プロジェクトルート）

**対象外**:

- `@repo/shared` のモジュール構造自体の再設計
- Vitest 以外のテストフレームワークへの移行
- `apps/web` や `apps/backend` のモジュール解決（本タスクでは `apps/desktop` を優先。他パッケージは同様のパターンで後続対応）

### 成果物

- 修正済み設定ファイル群（`package.json`, `tsconfig.json` 等）
- サブパスエクスポート追加手順ドキュメント（実装ガイド内）
- テスト実行結果（typecheck 0件エラー、全テスト PASS）

---

## 3. どのように実行するか（How）

### 前提条件

- TASK-FIX-10-1-VITEST-ERROR-HANDLING が完了していること
- `vitest.config.ts` に 18個の alias が追加済みであること
- `packages/shared` のビルドが正常に完了すること（`pnpm --filter @repo/shared build`）

### 推奨アプローチ

#### アプローチ A: `package.json` の `exports` + `typesVersions` による正規化（推奨）

`packages/shared/package.json` に `typesVersions` フィールドを追加し、TypeScript が `exports` フィールドを正しく解決できるようにする。

```jsonc
// packages/shared/package.json
{
  "typesVersions": {
    "*": {
      "infrastructure/ai/apiKeyValidator": [
        "./dist/infrastructure/ai/apiKeyValidator.d.ts",
      ],
      "agent/types": ["./dist/agent/types.d.ts"],
      // ... 他のサブパス
    },
  },
}
```

**利点**: `tsconfig.json` の `paths` を大量に追加する必要がなく、パッケージ側で完結する。

#### アプローチ B: `tsconfig.json` の `paths` 一括設定

`apps/desktop/tsconfig.json` に全サブパスの `paths` マッピングを追加する。

```jsonc
// apps/desktop/tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@repo/shared/*": ["../../packages/shared/src/*"],
    },
  },
}
```

**利点**: シンプルだがワイルドカードの挙動が `exports` のサブパスパターンと一致しない場合がある。

#### アプローチ C: `moduleResolution: "bundler"` への移行

TypeScript 5.x の `moduleResolution: "bundler"` を使用し、`package.json` の `exports` フィールドを直接解決させる。

**利点**: `exports` フィールドの条件付きエクスポートを TypeScript が直接理解するため、追加設定が最小限。ただし、既存の `moduleResolution` 設定との互換性を検証する必要がある。

### 3.5 実装課題と解決策

#### 課題 1: Vitest と TypeScript で異なるモジュール解決方法が必要

`@repo/shared` のサブパスエクスポートパターン（`@repo/shared/infrastructure/ai/apiKeyValidator` 等）は、Vitest では `resolve.alias` で解決できるが、TypeScript コンパイラでは `tsconfig.json` の `paths` 設定または `package.json` の `typesVersions` が必要。2つのツールで同じパスを異なる方法で解決する必要があり、設定の同期が課題となる。

**解決策**: 共通のサブパス定義ファイル（JSON または TypeScript）を作成し、`vitest.config.ts` の alias 生成と `tsconfig.json` の paths 生成を自動化するスクリプトを検討する。もしくは `typesVersions` + `exports` の正規化によって TypeScript 側の解決を `package.json` に集約し、Vitest alias の必要性自体を除去する。

#### 課題 2: alias の順序が重要

18個のエイリアスを手動追加した際、具体的なパス（例: `@repo/shared/infrastructure/ai/apiKeyValidator`）を先に、汎用パス（例: `@repo/shared`）を後に配置する必要があった。順序を誤ると、汎用パスが先にマッチして意図しない解決結果になる。

**解決策**: alias/paths 定義を具体度順（深いパスから浅いパスへ）にソートするルールを確立し、自動生成スクリプトにソートロジックを組み込む。手動管理の場合はコメントで順序の重要性を明記する。

#### 課題 3: `package.json` の `exports` と `tsconfig.json` の `paths` の整合性

`packages/shared/package.json` の `exports` フィールドに定義されたサブパスと、`tsconfig.json` の `paths` の間で整合性を保つ方法が不明確だった。`exports` に新しいサブパスを追加した際に `paths` の更新を忘れるリスクがある。

**解決策**: (1) `typesVersions` を `exports` と並行して `package.json` に配置し、型解決を `package.json` 内に集約する。(2) CI に整合性チェックスクリプトを追加し、`exports` のエントリと `typesVersions` のエントリが一致していることを検証する。(3) `moduleResolution: "bundler"` を採用し、`exports` フィールドのみで TypeScript と Vitest の両方を解決する方向も検討する。

---

## 4. 実行手順

### Phase 1: 要件定義

- 現在の 228件のエラーを分類し、影響範囲を確定
- `@repo/shared` の全サブパスエクスポートを一覧化
- アプローチ（A/B/C）の選択基準を定義

### Phase 2: 設計

- 選択したアプローチの詳細設計
- 設定ファイルの変更計画（差分の明示）
- Vitest alias との統合方法の設計

### Phase 3: 設計レビュー

- 設計の妥当性検証（レビューゲート）

### Phase 4: テスト作成

- `pnpm typecheck` のエラー件数を検証するテスト
- サブパスインポートの解決を検証するテスト

### Phase 5: 実装

- 設定ファイルの修正
- Vitest alias の統合/整理

### Phase 6-7: テスト拡充・カバレッジ確認

- 全サブパスの解決を網羅的に検証

### Phase 8: リファクタリング

- 不要になった alias/paths の除去
- 設定ファイルの整理

### Phase 9: 品質検証

- `pnpm lint` / `pnpm typecheck` / 全テスト実行

### Phase 10: 最終レビュー

- 228件 → 0件の達成確認

### Phase 11: 手動テスト

- IDE での型推論が正常に動作することを確認
- 新しいサブパスを追加した際の手順を実際に試行

### Phase 12: ドキュメント

- 実装ガイド・システム仕様書更新

### Phase 13: 完了

- PR 準備

---

## 5. 完了条件チェックリスト

- [ ] `pnpm typecheck` で `@repo/shared` 関連の `Cannot find module` エラーが 0件
- [ ] `pnpm --filter @repo/desktop exec vitest run` で全テストが PASS
- [ ] Vitest の `resolve.alias` と TypeScript の `paths` が一元管理されている、もしくは自動同期の仕組みがある
- [ ] 新しいサブパスエクスポート追加時の手順が文書化されている
- [ ] `apps/desktop` 以外のパッケージ（`apps/web`, `apps/backend`）に同様のエラーがないことを確認（存在する場合は未タスク化）
- [ ] IDE（VSCode）で `@repo/shared` のサブパスインポートの型推論が正常に動作する

---

## 6. 検証方法

### 6.1 自動検証

```bash
# TypeScript 型チェック（エラー 0件を確認）
pnpm typecheck 2>&1 | grep -c "Cannot find module" # 期待値: 0

# Vitest テスト実行
pnpm --filter @repo/desktop exec vitest run

# Lint チェック
pnpm lint
```

### 6.2 手動検証

1. VSCode で `apps/desktop/src` 配下のファイルを開き、`@repo/shared/...` のインポートにマウスホバーして型情報が表示されることを確認
2. `@repo/shared` に新しいモジュールを仮追加し、`apps/desktop` からインポートして型解決が動作することを確認
3. `vitest.config.ts` の alias と TypeScript の型解決が同じモジュールを指していることを確認

---

## 7. リスクと対策

| リスク                                                       | 影響度 | 発生確率 | 対策                                                     |
| ------------------------------------------------------------ | ------ | -------- | -------------------------------------------------------- |
| `moduleResolution` 変更による既存コードの破壊                | 高     | 中       | 変更前に全テスト実行。段階的に適用し影響を確認           |
| `typesVersions` と `exports` の不整合                        | 中     | 中       | 整合性チェックスクリプトを CI に追加                     |
| Vitest alias 除去時のテスト失敗                              | 中     | 低       | alias 除去は段階的に実施。各段階でテスト実行             |
| 他パッケージ（`apps/web` 等）への波及                        | 低     | 中       | 本タスクでは `apps/desktop` に限定。他は後続タスクで対応 |
| `tsconfig.json` の `paths` 追加による IDE パフォーマンス低下 | 低     | 低       | ワイルドカードパターンを活用し paths 数を最小化          |

---

## 8. 参照情報

### システム仕様書

- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` - テスト品質要件、alias 管理ルール
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` - ESModule モッキング制約
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - TASK-FIX-10-1 教訓（v1.15.0）

### ルールファイル

- `.claude/rules/01-architecture.md` - モノレポ構造ルール
- `.claude/rules/06-known-pitfalls.md` - P8（幽霊依存）、P40（テスト実行ディレクトリ依存）

### 関連タスク

- TASK-FIX-10-1-VITEST-ERROR-HANDLING - Vitest エラーハンドリング改善（本タスクの発見元）

### 外部参考資料

- TypeScript Handbook: Module Resolution（`moduleResolution` オプション）
- Node.js Documentation: Package Exports（`exports` フィールド）
- Vitest Documentation: resolve.alias

---

## 9. 備考

- 本タスクは TASK-FIX-10-1-VITEST-ERROR-HANDLING の Phase 10 最終レビューで「既知の問題 2.2」として報告された問題を根本解決するものである
- 228件のエラーは TASK-FIX-10-1 以前から存在していた既知の問題であり、TASK-FIX-10-1 が原因で発生したものではない
- アプローチの選択（A/B/C）は Phase 1-2 で調査・検討し、Phase 3 のレビューで確定すること
- `apps/desktop` での解決パターンが確立した後、同じパターンを `apps/web` や `apps/backend` にも適用可能。ただし、本タスクのスコープには含めず、必要に応じて後続タスクを作成する
- Vitest の `resolve.alias` を完全に除去できるかは、選択するアプローチと `moduleResolution` の設定に依存する。除去できない場合でも、自動生成による一元管理を目指す

# Phase 8: リファクタリング - TypeScript @repo/shared モジュール解決エラー修正

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 8                                        |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Phase名    | リファクタリング                         |
| 前提Phase  | Phase 7 (テストカバレッジ確認)           |
| 次Phase    | Phase 9 (品質保証)                       |
| 作成日     | 2026-02-20                               |
| ステータス | 未着手                                   |

---

## 目的

TDD（テスト駆動開発）の Refactor 段階として、テストを維持しながら設定ファイルとモジュール解決構成の品質を改善する。具体的には以下を実施する：

1. 不要になった Vitest alias の除去
2. 設定ファイルの整理（重複定義の解消、コメント追加）
3. SOLID 原則に基づくコード改善
4. リファクタリング後のテスト継続成功確認

---

## 実行タスク

- 不要な Vitest alias の除去: exports 整備で不要になった alias を削除
- 設定ファイルの重複定義解消: tsconfig.json と package.json exports の整合
- 設定ファイルへのコメント追加: 変更意図・制約の明文化
- SOLID 原則に基づくコード改善: 単一責務・開放閉鎖の観点でコード品質向上
- リファクタリング後のテスト継続成功確認: 全テストが引き続き PASS することを確認

| #   | タスク名                               | 目的                                         |
| --- | -------------------------------------- | -------------------------------------------- |
| 1   | 不要な Vitest alias の除去             | exports 整備で不要になった alias を削除      |
| 2   | 設定ファイルの重複定義解消             | tsconfig.json と package.json exports の整合 |
| 3   | 設定ファイルへのコメント追加           | 変更意図・制約の明文化                       |
| 4   | SOLID 原則に基づくコード改善           | 単一責務・開放閉鎖の観点でコード品質向上     |
| 5   | リファクタリング後のテスト継続成功確認 | 全テストが引き続き PASS することを確認       |

---

## 参照資料

| 参照資料           | パス                                                                                   | 確認内容             |
| ------------------ | -------------------------------------------------------------------------------------- | -------------------- |
| Phase 1 要件定義   | `phase-1-requirements.md`                                                              | 受入基準の維持       |
| Phase 2 設計       | `phase-2-design.md`                                                                    | 設定方針との整合     |
| Phase 7 成果物     | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-7-coverage-check.md` | カバレッジ結果       |
| Phase 5 実装       | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-5-implementation.md` | 実装内容             |
| Phase 6 テスト拡充 | `phase-6-test-expansion.md`                                                            | 回帰テスト観点       |
| モノレポ要件       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`           | `exports`/依存境界   |
| 品質要件           | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`            | alias運用と検証基準  |
| 開発ガイドライン   | `.claude/skills/aiworkflow-requirements/references/development-guidelines.md`          | 設定変更時の実装規約 |
| アーキテクチャ     | `.claude/rules/01-architecture.md`                                                     | モノレポ構造ルール   |
| コーディング規約   | `.claude/rules/02-code-quality.md`                                                     | コードスタイル       |

---

## 実行手順

### 1. 不要な Vitest alias の除去

`package.json` の `exports` フィールドを正しく整備したことで、Vitest の `resolve.alias` で `@repo/shared` のサブパスを個別にマッピングする必要がなくなった箇所を特定・除去する。

#### 確認コマンド

```bash
# Vitest 設定ファイルで @repo/shared 関連の alias を検索
grep -rn "@repo/shared" apps/desktop/vitest.config.ts
grep -rn "@repo/shared" apps/web/vitest.config.ts 2>/dev/null
grep -rn "@repo/shared" packages/shared/vitest.config.ts 2>/dev/null
```

#### 除去判定基準

| alias エントリ                | 除去可否 | 理由                                    |
| ----------------------------- | -------- | --------------------------------------- |
| `@repo/shared` → ルートパス   | 要検討   | exports の `.` エントリで代替可能か確認 |
| `@repo/shared/xxx` → 個別パス | 除去可   | exports の `./xxx` エントリで解決される |

> **注意**: alias を除去した後、必ずテストを実行して解決エラーが発生しないことを確認する。

### 2. 設定ファイルの重複定義解消

以下のファイル間で重複・矛盾している定義を一元化する：

| ファイル                        | 確認内容                                       |
| ------------------------------- | ---------------------------------------------- |
| `packages/shared/package.json`  | `exports` フィールドの各サブパスエントリ       |
| `packages/shared/tsconfig.json` | `compilerOptions.paths` の定義                 |
| `apps/desktop/tsconfig.json`    | `compilerOptions.paths` の `@repo/shared` 定義 |
| `apps/desktop/vitest.config.ts` | `resolve.alias` の `@repo/shared` 定義         |

#### 一元管理の方針

- **正本**: `packages/shared/package.json` の `exports` フィールド
- **参照**: TypeScript の `paths` は `exports` と一致するよう設定
- **Vitest alias**: `exports` で解決できるエントリは alias から除去

### 3. 設定ファイルへのコメント追加

設定ファイルに変更意図と制約を明文化する：

```jsonc
// packages/shared/package.json の exports フィールド例
{
  "exports": {
    // メインエントリポイント
    ".": {
      "types": "./src/index.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
    },
    // サブパスエクスポートは exports に追加時、
    // 同時に apps/desktop/tsconfig.json の paths も更新すること
  },
}
```

> **注**: `package.json` は JSON であり厳密にはコメントを書けないため、`README.md` またはプロジェクトドキュメントに制約を記載する方針も検討する。

### 4. SOLID 原則に基づくコード改善

| 観点                           | チェック項目                                                               |
| ------------------------------ | -------------------------------------------------------------------------- |
| 単一責務原則 (SRP)             | 各設定ファイルが単一の関心事のみを担当しているか                           |
| 開放閉鎖原則 (OCP)             | 新しいサブパスエクスポート追加時に既存設定を変更せず追加のみか             |
| 依存性逆転原則 (DIP)           | `apps/desktop` が `@repo/shared` のパッケージ公開 API のみに依存しているか |
| インターフェース分離原則 (ISP) | エクスポートが必要最小限のモジュールのみを公開しているか                   |

### 5. リファクタリング後のテスト継続成功確認

```bash
# @repo/shared ビルド
cd packages/shared && pnpm build

# 全テスト実行
cd apps/desktop && pnpm vitest run

# 型チェック
pnpm typecheck

# Lint
pnpm lint
```

---

## 統合テスト連携

| 連携観点                 | 内容                                                | 参照先                                                                       |
| ------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------- |
| alias/paths/exports 整合 | リファクタ後に 3 経路の解決先が一致することを確認   | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |
| 品質退行防止             | `pnpm typecheck` と `vitest` の退行がないことを確認 | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |

---

## リファクタリングチェックリスト

| 項目                                       | 完了 |
| ------------------------------------------ | ---- |
| 不要な Vitest alias が除去されている       | [ ]  |
| TypeScript paths と exports が整合している | [ ]  |
| 設定ファイル間の重複定義が解消されている   | [ ]  |
| 変更意図がドキュメント化されている         | [ ]  |
| 新規サブパス追加手順が明確化されている     | [ ]  |
| 全てのテストが PASS している               | [ ]  |
| カバレッジ基準を維持している               | [ ]  |
| TypeScript 型エラーがない                  | [ ]  |
| ESLint 警告がない                          | [ ]  |

---

## 成果物

| 成果物                 | 配置先                                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| リファクタリング記録   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-8/refactoring-log.md`        |
| サブパス追加手順ガイド | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-8/subpath-addition-guide.md` |

---

## 完了条件

- [ ] 不要な Vitest alias が除去されている
- [ ] TypeScript paths と package.json exports が一元管理されている
- [ ] 設定ファイル間の重複・矛盾が解消されている
- [ ] 新しいサブパスエクスポート追加時の手順が明確化されている
- [ ] 全てのテストが PASS している
- [ ] カバレッジ基準を維持している（Phase 7 の基準以上）
- [ ] TypeScript 型エラーがない
- [ ] ESLint 警告がない
- [ ] リファクタリング記録が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

Phase 9（品質保証）へ進み、Lint・型チェック・全テスト実行による総合品質検証を実施する。

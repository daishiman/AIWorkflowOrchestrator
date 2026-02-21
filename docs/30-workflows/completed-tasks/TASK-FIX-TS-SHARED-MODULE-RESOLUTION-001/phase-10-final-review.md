# Phase 10: 最終レビュー - TypeScript @repo/shared モジュール解決エラー修正

## メタ情報

| 項目       | 内容                                     |
| ---------- | ---------------------------------------- |
| Phase      | 10                                       |
| 機能名     | TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001 |
| Phase名    | 最終レビュー                             |
| 前提Phase  | Phase 9 (品質保証)                       |
| 次Phase    | Phase 11 (手動テスト)                    |
| 作成日     | 2026-02-20                               |
| ステータス | 未着手                                   |

---

## 目的

全体品質・整合性を多角的に検証し、手動テストに進む準備が整っているかを確認する。以下の5つの観点からレビューを実施する：

1. `pnpm typecheck` エラー 0件の最終確認
2. 全テスト PASS の確認
3. Vitest alias と TypeScript paths の一元管理確認
4. `apps/desktop` 以外のパッケージへの影響確認
5. IDE での型推論が正常動作するかの確認

---

## 実行タスク

- 要件充足レビュー: 228件エラー→0件の達成を最終確認
- コード品質レビュー: テスト・型チェック・Lint の総合確認
- 設定一元管理レビュー: exports/paths/alias の整合性を最終確認
- 影響範囲レビュー: desktop 以外パッケージへの波及影響を確認
- IDE 型推論レビュー: VS Code/Cursor での型推論動作確認
- ゲート判定: PASS/MINOR/MAJOR/CRITICAL の最終判定

| #   | タスク名             | 目的                                     |
| --- | -------------------- | ---------------------------------------- |
| 1   | 要件充足レビュー     | 228件エラー→0件の達成を最終確認          |
| 2   | コード品質レビュー   | テスト・型チェック・Lint の総合確認      |
| 3   | 設定一元管理レビュー | exports/paths/alias の整合性を最終確認   |
| 4   | 影響範囲レビュー     | desktop 以外パッケージへの波及影響を確認 |
| 5   | IDE 型推論レビュー   | VS Code/Cursor での型推論動作確認        |
| 6   | ゲート判定           | PASS/MINOR/MAJOR/CRITICAL の最終判定     |

---

## 参照資料

| 参照資料         | パス                                                                                      | 確認内容                |
| ---------------- | ----------------------------------------------------------------------------------------- | ----------------------- |
| Phase 9 成果物   | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-9-quality-assurance.md` | 品質検証結果            |
| Phase 1 要件定義 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-1-requirements.md`      | 要件・受入基準          |
| Phase 2 設計     | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/phase-2-design.md`            | 設計方針                |
| Phase 5 実装     | `phase-5-implementation.md`                                                               | 実装仕様との整合        |
| 品質要件         | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`               | 品質基準                |
| モノレポ要件     | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | `@repo/shared` 依存境界 |
| アーキテクチャ   | `.claude/rules/01-architecture.md`                                                        | モノレポ構造ルール      |

---

## 実行手順

### 1. 要件充足レビュー

Phase 1 で定義した要件・受入基準との照合を実施する。

| チェック項目                                                            | 判定 | 備考 |
| ----------------------------------------------------------------------- | ---- | ---- |
| `pnpm typecheck` で `@repo/shared` 関連のモジュール解決エラーが 0件     | -    |      |
| Vitest の `resolve.alias` と TypeScript の `paths` が一元管理されている | -    |      |
| 新しいサブパスエクスポート追加時の手順が明確化されている                | -    |      |

```bash
# 最終型チェック確認
pnpm typecheck

# @repo/shared 関連エラー件数の最終確認
pnpm typecheck 2>&1 | grep "@repo/shared" | wc -l
```

### 2. コード品質レビュー

| チェック項目                                                      | 判定 | 備考 |
| ----------------------------------------------------------------- | ---- | ---- |
| TypeScript 型エラー 0件                                           | -    |      |
| ESLint エラー・警告 0件                                           | -    |      |
| テストカバレッジ基準達成（Line 80%+, Branch 60%+, Function 80%+） | -    |      |
| 全テストが PASS                                                   | -    |      |
| `@repo/shared` ビルドが成功                                       | -    |      |

```bash
# 一括検証コマンド
pnpm --filter @repo/shared build && \
pnpm typecheck && \
pnpm lint && \
cd apps/desktop && pnpm vitest run
```

### 3. 設定一元管理レビュー

Vitest alias と TypeScript paths の一元管理が実現されているか確認する。

| チェック項目                                         | 判定 | 備考 |
| ---------------------------------------------------- | ---- | ---- |
| `package.json` の `exports` が正本として機能している | -    |      |
| TypeScript `paths` が `exports` と一致している       | -    |      |
| Vitest alias に不要なエントリが残っていない          | -    |      |
| 新規サブパス追加ガイドが作成されている               | -    |      |

```bash
# exports と paths の整合性チェック
# exports のサブパスエントリを確認
node -e "console.log(Object.keys(require('./packages/shared/package.json').exports || {}))"

# TypeScript paths の @repo/shared エントリを確認
grep -A 20 '"paths"' apps/desktop/tsconfig.json | grep "@repo/shared"

# Vitest alias の @repo/shared エントリを確認
grep -n "@repo/shared" apps/desktop/vitest.config.ts
```

### 4. 影響範囲レビュー

`apps/desktop` 以外のパッケージ（`apps/web`, `apps/backend`）への影響を確認する。

| チェック項目                                               | 判定 | 備考 |
| ---------------------------------------------------------- | ---- | ---- |
| `apps/web` の `@repo/shared` import が正常に解決される     | -    |      |
| `apps/backend` の `@repo/shared` import が正常に解決される | -    |      |
| `packages/shared` の公開 API に breaking change がない     | -    |      |
| 既存のインポートパスが引き続き動作する（後方互換性）       | -    |      |

```bash
# apps/web の型チェック
pnpm --filter @repo/web typecheck 2>/dev/null || echo "web typecheck 未設定"

# apps/backend の型チェック
pnpm --filter @repo/backend typecheck 2>/dev/null || echo "backend typecheck 未設定"

# @repo/shared を import している全ファイルの確認
grep -rn "from '@repo/shared" apps/ --include="*.ts" --include="*.tsx" | head -20
```

### 5. IDE 型推論レビュー

VS Code / Cursor での型推論が正常動作するか確認する。

| チェック項目                                                | 判定 | 備考 |
| ----------------------------------------------------------- | ---- | ---- |
| `@repo/shared` からの import で型補完が動作する             | -    |      |
| `@repo/shared/xxx` サブパスからの import で型補完が動作する | -    |      |
| Go to Definition で正しいソースファイルにジャンプする       | -    |      |
| ホバー時に型情報が正しく表示される                          | -    |      |

> **確認方法**: `apps/desktop/src/` 配下で `@repo/shared` をインポートしているファイルを IDE で開き、上記チェック項目を手動確認する。

---

## 統合テスト連携

| 連携観点               | 内容                                                    | 参照先                                                                       |
| ---------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| 要件-実装-検証の一貫性 | Phase 1/2 の要件設計と Phase 9 の品質結果を相互照合する | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`  |
| 依存境界の最終確認     | `@repo/shared` 公開境界に破壊的変更がないことを確認する | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` |

---

## レビュー結果

### 指摘事項

| ID    | 重要度 | 観点 | 指摘内容 | 対応方針 |
| ----- | ------ | ---- | -------- | -------- |
| FR-01 | -      | -    | -        | -        |

---

## ゲート判定

### 判定基準テーブル

| 判定     | 条件                                 | 対応                                               |
| -------- | ------------------------------------ | -------------------------------------------------- |
| PASS     | 指摘なし、または INFO レベルのみ     | Phase 11 へ進む                                    |
| MINOR    | 軽微な改善推奨事項のみ               | 未タスク仕様書に変換後 Phase 11 へ（**省略不可**） |
| MAJOR    | 品質基準未達、設計上の問題           | 影響範囲に応じて Phase 1-5 へ戻る                  |
| CRITICAL | 要件未達、セキュリティ問題、動作不能 | Phase 1 へ戻り要件再確認                           |

> **重要**: MINOR 判定時は指摘事項を**全て**未タスク仕様書に変換する。「機能影響なし」であっても省略不可。

### MINOR 判定時の未タスク仕様書変換ルール

1. 指摘事項ごとに `docs/30-workflows/unassigned-task/` に指示書を作成
2. `task-workflow.md` の残課題テーブルに登録
3. 関連仕様書に参照リンクを追加

### 判定結果

| 項目           | 内容 |
| -------------- | ---- |
| 判定           | -    |
| CRITICAL 件数  | -    |
| MAJOR 件数     | -    |
| MINOR 件数     | -    |
| 次のアクション | -    |

---

## レビュー結果テンプレート

```markdown
## レビュー結果サマリ

- **判定**: [PASS / MINOR / MAJOR / CRITICAL]
- **レビュー日**: YYYY-MM-DD
- **レビュアー**: [名前]

### 要件充足

- typecheck エラー件数: [0件 / N件]
- テスト結果: [全 PASS / N件 FAIL]

### 指摘事項

| ID  | 重要度 | 内容 | 対応 |
| --- | ------ | ---- | ---- |
| -   | -      | -    | -    |

### 総合所見

[自由記述]

### 次のアクション

- [ ] [具体的なアクション]
```

---

## 成果物

| 成果物       | 配置先                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| レビュー結果 | `docs/30-workflows/TASK-FIX-TS-SHARED-MODULE-RESOLUTION-001/outputs/phase-10/final-review-result.md` |

---

## 完了条件

- [ ] 全ての要件充足がチェックされている
- [ ] コード品質が確認されている（型チェック・Lint・テスト）
- [ ] 設定一元管理（exports/paths/alias）の整合性が確認されている
- [ ] `apps/desktop` 以外のパッケージへの影響が確認されている
- [ ] IDE での型推論動作が確認されている
- [ ] ゲート判定が実施されている
- [ ] MINOR 指摘がある場合、全て未タスク仕様書に変換済み（省略不可）
- [ ] CRITICAL/MAJOR 指摘がない場合、Phase 11 への移行が承認されている
- [ ] レビュー結果が出力されている
- [ ] **本Phase内の全タスクを100%実行完了**

---

## 次のPhase

- **PASS の場合**: Phase 11（手動テスト）へ進む
- **MINOR の場合**: 未タスク仕様書に変換後、Phase 11 へ進む
- **MAJOR の場合**: 影響範囲に応じて Phase 1-5 へ戻り修正
- **CRITICAL の場合**: Phase 1 へ戻り要件再確認

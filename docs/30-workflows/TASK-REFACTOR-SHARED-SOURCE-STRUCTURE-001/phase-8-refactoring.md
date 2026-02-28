# Phase 8: リファクタリング - タスク仕様書

## メタ情報

| 項目       | 内容                                      |
| ---------- | ----------------------------------------- |
| Phase      | 8                                         |
| Phase名    | リファクタリング（TDD: Refactor）         |
| タスクID   | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |
| 前提Phase  | Phase 7（カバレッジ確認）                 |
| 後続Phase  | Phase 9（品質検証）                       |
| ステータス | 未着手                                    |
| 作成日     | 2026-02-28                                |
| 機能名     | TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001 |

---

## 目的

Phase 5（実装）で完了した `types/` → `src/types/` への移行後のコード品質を改善する。re-export の整理、設定ファイルの冗長エントリー除去、旧パスの残存コメント削除を実施し、移行完了後のコードベースを清潔な状態にする。

## 背景

Phase 5 では5ファイル（auth.ts, api-keys.ts, common.ts, file-selection.ts, workflow.ts）+ index.ts + `__tests__/` を `types/` から `src/types/` に移行し、4ファイル（package.json / tsconfig.json / vitest.config.ts / tsup.config.ts）を同期更新した。移行は機能的に完了しているが、以下の品質改善が未実施のまま残っている:

1. `src/types/index.ts` に統合された re-export の並び順が不統一
2. `package.json` の exports/typesVersions に旧構造に由来する冗長エントリーが残存する可能性
3. `tsup.config.ts` に旧パスのコメントアウトが残存する可能性
4. `tsconfig.json` の `include` に移行完了後は不要な `types/**/*.ts` が残存する可能性

---

## 実行タスク

### タスク1: src/types/index.ts の re-export 整理

**目的**: 旧 `types/index.ts` から統合された re-export と既存の re-export を、一貫した並び順に整理する。

**実行手順**:

1. `packages/shared/src/types/index.ts` を開く
2. 全ての `export` 文を確認し、以下の基準で並び替える:
   - **ドメイン順**（認証 → API → エージェント → スキル → チャット → ワークフロー → 共通）
   - 同一ドメイン内はアルファベット順
3. 旧構造に関する TODO コメント（例: `// TODO: types/ から移行`）が残存していれば削除する
4. 不要な空行・重複コメントを削除する
5. 統合前の `types/index.ts` に存在した re-export が全て `src/types/index.ts` に含まれていることを確認する

**並び順の基準テーブル**:

| 順序 | ドメイン     | 対象ファイル例        |
| ---- | ------------ | --------------------- |
| 1    | 認証         | auth.ts, auth-mode.ts |
| 2    | APIキー      | api-keys.ts           |
| 3    | エージェント | agent.ts              |
| 4    | スキル       | skill.ts, skill-\*.ts |
| 5    | チャット     | chat-session.ts       |
| 6    | LLM          | llm/                  |
| 7    | RAG          | rag/                  |
| 8    | ワークフロー | workflow.ts           |
| 9    | ファイル     | file-selection.ts     |
| 10   | 共通         | common.ts             |

**確認コマンド**:

```bash
cat packages/shared/src/types/index.ts
```

---

### タスク2: package.json の exports/typesVersions 整理

**目的**: `package.json` の `exports` および `typesVersions` フィールドから冗長なエントリーを除去し、並び順を統一する。

**実行手順**:

1. `packages/shared/package.json` を開く
2. `exports` フィールドの全エントリーを確認する
3. 以下の観点で整理する:
   - `dist/types/`（`src` なし）を参照するエントリーが残存していないことを確認する
   - 全エントリーが `dist/src/types/` を参照していることを確認する
   - エントリーの並び順をアルファベット順に統一する
4. `typesVersions` フィールドも同様に確認する:
   - `./types/*.ts`（`src` なし）を参照するエントリーが残存していないことを確認する
   - 全エントリーが `./dist/src/types/` を参照していることを確認する
   - エントリーの並び順をアルファベット順に統一する
5. 冗長なエントリー（同一ファイルを異なるパスで参照するエントリー）を統合する

**確認コマンド**:

```bash
# 旧パス残存チェック
grep -n "dist/types/" packages/shared/package.json | grep -v "dist/src/types/"

# typesVersions 旧パス残存チェック
grep -n '"types/' packages/shared/package.json | grep -v '"./types/' | grep -v "dist/src/types/"
```

**期待結果**: 上記 grep コマンドの出力が 0 件であること。

---

### タスク3: tsup.config.ts のエントリーポイント整理

**目的**: ビルド設定から旧パスのコメントアウトや不要な記述を除去し、エントリーポイントの並び順を統一する。

**実行手順**:

1. `packages/shared/tsup.config.ts` を開く
2. `entry` フィールドの全エントリーを確認する
3. 以下の観点で整理する:
   - 旧パス（`types/` を直接参照）のコメントアウトが残存していれば削除する
   - 全エントリーが `src/types/` を参照していることを確認する
   - エントリーの並び順をアルファベット順に統一する
4. `entry` 以外のフィールド（`format`, `dts`, `outDir` 等）に旧構造に関するコメントが残存していれば削除する

**確認コマンド**:

```bash
# 旧パスのコメントアウト残存チェック
grep -n "types/" packages/shared/tsup.config.ts | grep -v "src/types/"
```

**期待結果**: 上記 grep コマンドの出力が 0 件であること（`// types/` のようなコメントも含めて残存しないこと）。

---

### タスク4: tsconfig.json の include 最適化

**目的**: 移行完了後に不要となった `types/**/*.ts` の include 指定を削除し、tsconfig の設定を最適化する。

**実行手順**:

1. `packages/shared/tsconfig.json` を開く
2. `include` フィールドを確認する
3. `"types/**/*.ts"` エントリーが存在する場合:
   - `types/` ディレクトリが完全に削除されていることを前提に、このエントリーを削除する
   - 削除後に `pnpm --filter @repo/shared typecheck` でエラーが発生しないことを確認する
4. `rootDir` の設定を確認し、変更の必要性を記録する:
   - 現在の `rootDir: "./"` が維持されている理由（他のルート直下ディレクトリ: core/, infrastructure/, schemas/, utils/ の存在）を記録する
   - `rootDir` 変更は本タスクのスコープ外であるが、将来的な最適化候補としてリファクタリングレポートに記録する

**確認コマンド**:

```bash
# tsconfig.json の include 確認
grep -A 10 '"include"' packages/shared/tsconfig.json

# types/ ディレクトリの不在確認
ls -la packages/shared/types/ 2>&1
```

**期待結果**:

- `include` に `"types/**/*.ts"` が含まれていないこと
- `packages/shared/types/` ディレクトリが存在しないこと（`No such file or directory`）

---

## 参照資料

| 参照資料                   | パス                                                                                                    | 内容                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------- |
| src/types/index.ts         | `packages/shared/src/types/index.ts`                                                                    | 統合済み re-export ファイル  |
| package.json               | `packages/shared/package.json`                                                                          | exports/typesVersions 定義   |
| tsup.config.ts             | `packages/shared/tsup.config.ts`                                                                        | ビルドエントリーポイント定義 |
| tsconfig.json              | `packages/shared/tsconfig.json`                                                                         | TypeScript コンパイル設定    |
| Phase 1 要件定義           | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-1-requirements.md`                   | 後方互換・受入基準の確認     |
| Phase 2 設計書             | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-2-design.md`                         | 移行設計との差分確認         |
| Phase 5 実装サマリー       | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-5/implementation-summary.md` | 移行実装の詳細記録           |
| Phase 6 テスト拡充レポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-6/test-expansion-report.md`  | 回帰観点と追加テスト確認     |
| Phase 7 カバレッジレポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-7/coverage-report.md`        | カバレッジ確認結果           |

### システム仕様（aiworkflow-requirements）

| 参照資料           | パス                                                                         | 内容                 |
| ------------------ | ---------------------------------------------------------------------------- | -------------------- |
| アーキテクチャ概要 | `.claude/skills/aiworkflow-requirements/references/architecture-overview.md` | モノレポ構造の正本   |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | パッケージ間依存関係 |

---

## 統合テスト連携

| 統合テスト観点             | 確認方法                                                            |
| -------------------------- | ------------------------------------------------------------------- |
| リファクタ後の公開パス整合 | Phase 4/6 の `module-resolution` 系テストを再実行                   |
| 4ファイル同期の維持確認    | Phase 4 の `config-sync.test.ts` を再実行                           |
| ビルド成果物の契約維持     | `pnpm --filter @repo/shared build` 後に `dist/src/types` 配置を確認 |
| カバレッジ水準の維持       | Phase 7 の閾値を下回らないことを `coverage-report.md` で再確認      |
| `desktop` 消費側の互換確認 | `pnpm --filter @repo/desktop typecheck` の再実行                    |

## 成果物

| 成果物                   | パス                                                                                                | 内容                          |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ----------------------------- |
| リファクタリングレポート | `docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/outputs/phase-8/refactoring-report.md` | 変更前/変更後の対比と判定結果 |

---

## 完了条件

- [ ] `src/types/index.ts` の re-export がドメイン順（上記テーブル準拠）で並んでいること
- [ ] `src/types/index.ts` に旧構造に関する TODO コメントが残存していないこと
- [ ] `package.json` の exports に `dist/types/`（`src` なし）を参照するエントリーが 0 件であること
- [ ] `package.json` の typesVersions に旧パスを参照するエントリーが 0 件であること
- [ ] `tsup.config.ts` に旧パス（`types/` を直接参照）のコメントアウトが残存していないこと
- [ ] `tsup.config.ts` のエントリーポイントが全て `src/types/` を参照していること
- [ ] `tsconfig.json` の `include` に `"types/**/*.ts"` が含まれていないこと
- [ ] `rootDir` の現状と将来的な最適化候補がリファクタリングレポートに記録されていること
- [ ] リファクタリングレポート（`outputs/phase-8/refactoring-report.md`）が作成されていること
- [ ] リファクタリング後に `pnpm --filter @repo/shared typecheck` がエラー 0 件で通ること

## Phase末端アクション【必須】

- [ ] `artifacts.json` の Phase 8 ステータスを更新
- [ ] リファクタリングレポートの全セクションが記入済みであることを確認
- [ ] Phase 9 の前提条件が満たされていることを確認

---

## 依存関係

- **前提**: Phase 7（カバレッジ確認）が完了していること
- **後続**: Phase 9（品質検証）で Lint・型チェック・全テスト実行を実施

## 次のPhase

完了後、以下を実行:

```
docs/30-workflows/TASK-REFACTOR-SHARED-SOURCE-STRUCTURE-001/phase-9-quality-assurance.md
```

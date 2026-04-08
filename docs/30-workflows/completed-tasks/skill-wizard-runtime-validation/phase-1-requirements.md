# Phase 1: 要件定義

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 1                               |
| 機能名 | skill-wizard-runtime-validation |
| 作成日 | 2026-04-08                      |

## 目的

`SkillInfoFormData` に対するランタイムバリデーションの要件を定義し、
修正範囲・受入基準・依存関係を確定する。

---

## Step 0: P50チェック【必須】

Phase 1 開始前に、対象ファイルの実装状態を確認し、既実装コードとの重複・齟齬を防止する。

```bash
# SkillInfoFormData の型定義確認
grep -n "SkillInfoFormData\|skillName\|purpose\|category" \
  packages/shared/src/types/skillCreator.ts

# 既存バリデーション関数の有無を確認
grep -rn "validateSkillInfo\|skillInfoValidat\|skillNameValidat" \
  packages/shared/src/ --include="*.ts"

# agent/validation.ts のパターン確認（参考）
cat packages/shared/src/agent/validation.ts

# 既存テストの状態確認
ls packages/shared/src/types/__tests__/ 2>/dev/null

# 公開エクスポート先の確認
ls packages/shared/src/types/index.ts
```

**確認事項**:

- [ ] `packages/shared/src/types/skillCreator.ts` に `SkillInfoFormData` 型が存在すること
- [ ] `skillName?: string` （任意）と `purpose: string` （必須）が定義されていること
- [ ] ランタイムバリデーション関数が未実装であること（`validateSkillInfo` 等が存在しない）
- [ ] `packages/shared/src/types/index.ts` が存在し、公開エクスポートの追記先として利用できること
- [ ] `packages/shared/src/types/skillInfoFormValidation.ts` が存在しないこと（新規作成対象）

---

## 実行タスク

- **タスク1**: P50チェック — 対象ファイルの現状実装状態を確認
- **タスク2**: 問題の根本原因を特定・文書化
- **タスク3**: 修正スコープの確定（変更ファイル一覧・変更種別）
- **タスク4**: 受入基準（AC-1〜AC-5）の定義
- **タスク5**: 依存関係・前提条件の整理

---

## 参照資料

| 資料名                                  | パス                                                 | 説明                                    |
| --------------------------------------- | ---------------------------------------------------- | --------------------------------------- |
| SkillInfoFormData 型定義                | `packages/shared/src/types/skillCreator.ts`          | バリデーション対象の型（line 944 付近） |
| 既存バリデーションパターン              | `packages/shared/src/agent/validation.ts`            | 参考: バリデーション関数実装パターン    |
| 親タスク仕様書                          | `docs/30-workflows/unassigned-task/` 配下            | UT-SKILL-WIZARD-W0-seq-01 の成果物      |
| システム仕様（aiworkflow-requirements） | `.claude/skills/aiworkflow-requirements/references/` | DI設計・アーキテクチャ整合確認          |

---

## 実行手順

### ステップ1: 対象型の現状確認

```bash
# SkillInfoFormData の全フィールドを確認
grep -A 10 "SkillInfoFormData" packages/shared/src/types/skillCreator.ts
```

**把握すべき情報**:

- `skillName` フィールドのオプショナル性（`skillName?: string`）
- `purpose` フィールドの必須性
- `category` フィールドの型（`SkillCategory | null`）

### ステップ2: バリデーション要件の確定

以下のバリデーションルールを確定し、`outputs/phase-1/scope-definition.md` に記録する。

**`skillName` バリデーションルール**:

| ルール       | 条件                            | エラーメッセージ（日本語）                  |
| ------------ | ------------------------------- | ------------------------------------------- |
| 空白チェック | `skillName.trim() === ""`       | 「スキル名を入力してください」              |
| 最大文字数   | `skillName.trim().length > 100` | 「スキル名は100文字以内で入力してください」 |

**`purpose` バリデーションルール**:

| ルール     | 条件                          | エラーメッセージ（日本語）              |
| ---------- | ----------------------------- | --------------------------------------- |
| 最小文字数 | `purpose.trim().length < 10`  | 「目的は10文字以上で入力してください」  |
| 最大文字数 | `purpose.trim().length > 500` | 「目的は500文字以内で入力してください」 |

### ステップ3: 受入基準の確定

以下の受入基準を確定し、`outputs/phase-1/acceptance-criteria.md` に記録する。

| AC番号 | 基準                                                                       | 検証方法         |
| ------ | -------------------------------------------------------------------------- | ---------------- |
| AC-1   | `skillName` が空白のみの場合、バリデーションエラーが返される               | ユニットテスト   |
| AC-2   | `purpose` が最小文字数（10文字）未満の場合、バリデーションエラーが返される | ユニットテスト   |
| AC-3   | バリデーション関数のユニットテストが実装され PASS する                     | `pnpm test` PASS |
| AC-4   | バリデーションエラーメッセージが日本語で定義されている                     | コードレビュー   |
| AC-5   | `pnpm --filter @repo/shared typecheck` が通る                              | typecheck PASS   |

**入出力境界（Phase 1固定）**:

- 入力: `SkillInfoFormData` のうち `skillName` / `purpose` を検証対象とする
- 非対象: `category` は本タスクのランタイムバリデーション対象外（型契約のみ維持）

### ステップ4: スコープ確定

**変更ファイル（コード）**:

| ファイル                                               | 変更種別 | 変更内容                                     |
| ------------------------------------------------------ | -------- | -------------------------------------------- |
| `packages/shared/src/types/skillInfoFormValidation.ts` | 新規作成 | バリデーション関数・型・エラーメッセージ定義 |
| `packages/shared/src/types/index.ts`                   | 更新     | 新規バリデーションAPIの再エクスポート追加    |

**新規作成ファイル（テスト）**:

| ファイル                                                              | 変更種別 | 変更内容                           |
| --------------------------------------------------------------------- | -------- | ---------------------------------- |
| `packages/shared/src/types/__tests__/skillInfoFormValidation.test.ts` | 新規作成 | バリデーション関数のユニットテスト |

**スコープ外（変更しない）**:

- `packages/shared/src/types/skillCreator.ts` — 型定義変更なし
- `packages/shared/index.ts` — 既存の `export * from "./types";` に追随するため直接変更不要
- `apps/desktop/src/renderer/` 配下の UI コンポーネント — 後続 Wave で対応
- IPC ハンドラ — 本タスクのスコープ外

---

## 統合テスト連携

- バリデーション関数はピュア関数として実装するため、統合テスト不要
- Phase 4 のユニットテストで全 AC を検証可能
- UI との統合は後続 Wave（UIフォームコンポーネント変更）で対応

---

## 多角的チェック観点（AIが判断）

### システム系

- **因果ループ**: ランタイムバリデーション未実装 → 不正入力がスキル作成 API に到達 → 上流での早期検出ができない（強化ループ: 入力品質劣化の固定化）
- **責務境界**: バリデーション関数は `packages/shared/src/types/` に配置し、UIと独立。フォームとバックエンドで同一ロジックを再利用可能
- **状態所有権**: バリデーション結果は呼び出し元が所有。バリデーション関数は副作用なしのピュア関数

### 価値・コスト系

- **価値**: 不正入力の早期検出により、スキルウィザードの UX が改善される
- **コスト**: 変更ファイル数は少ない（新規1種 + 更新1種 + テスト1種）。影響範囲は `packages/shared` に限定
- **トレードオン**: 文字数の定数値（100文字 / 10文字 / 500文字）は Phase 2 設計で確定する

### 問題解決系

- **優先順位**: AC-1（空白チェック）と AC-2（最小文字数）が最重要
- **リスク**: `skillName` がオプショナル（`string | undefined`）なため、undefined チェックを正確に処理する必要がある

---

## サブタスク管理

| ID     | タスク名             | 担当 | ステータス |
| ------ | -------------------- | ---- | ---------- |
| T-01-1 | P50チェック          | -    | 未実施     |
| T-01-2 | 問題の根本原因文書化 | -    | 未実施     |
| T-01-3 | スコープ確定         | -    | 未実施     |
| T-01-4 | 受入基準定義         | -    | 未実施     |
| T-01-5 | 依存関係整理         | -    | 未実施     |

---

## 成果物

| 成果物               | 配置先                                   | 形式     |
| -------------------- | ---------------------------------------- | -------- |
| 受入基準ドキュメント | `outputs/phase-1/acceptance-criteria.md` | Markdown |
| P50チェック結果      | `outputs/phase-1/p50-check-result.md`    | Markdown |
| スコープ定義書       | `outputs/phase-1/scope-definition.md`    | Markdown |

---

## 完了条件

- [ ] P50チェックを実行し、対象ファイルの現状実装状態が確認済みであること
- [ ] `SkillInfoFormData` に `skillName?: string` と `purpose: string` が存在することを確認済みであること
- [ ] `category: SkillCategory | null` を検証対象外として扱う方針が明記されていること
- [ ] ランタイムバリデーション関数が未実装であることを確認済みであること
- [ ] 受入基準 AC-1〜AC-5 が全て定義・文書化されていること
- [ ] 変更対象ファイル一覧（新規1種 + 更新1種 + テスト1種）が確定していること
- [ ] `outputs/phase-1/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

Phase 1 完了時に以下を確認して記録すること:

- [ ] T-01-1: P50チェック実行済み
- [ ] T-01-2: 問題の根本原因を `outputs/phase-1/p50-check-result.md` に記録済み
- [ ] T-01-3: スコープを `outputs/phase-1/scope-definition.md` に記録済み
- [ ] T-01-4: 受入基準 AC-1〜AC-5 を `outputs/phase-1/acceptance-criteria.md` に記録済み
- [ ] T-01-5: 依存関係（親タスク UT-SKILL-WIZARD-W0-seq-01 完了確認）を記録済み

---

## 次Phase

**Phase 2: 設計** — バリデーション関数のインターフェース・エラーメッセージ定数・配置先を設計する。

**ゲート条件**: Phase 1 の全完了条件を満たさない場合、Phase 2 へ進まないこと。

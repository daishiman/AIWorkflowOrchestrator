# TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001 - タスク指示書

## メタ情報

```yaml
issue_number: 881
```

## メタ情報

| 項目         | 内容                                                   |
| ------------ | ------------------------------------------------------ |
| タスクID     | TASK-IMP-MODULE-SYNC-REPORT-ENHANCEMENT-001            |
| タスク名     | check-shared-module-sync レポート拡充                  |
| 分類         | 改善                                                   |
| 対象機能     | `scripts/check-shared-module-sync.ts` レポート出力     |
| 優先度       | 低                                                     |
| 見積もり規模 | 小規模                                                 |
| ステータス   | 未実施                                                 |
| 発見元       | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 Phase 10 MINOR |
| 発見日       | 2026-02-22                                             |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001` の Phase 10 最終レビューで、モジュール整合チェックのコア機能は成立している一方、レポート表現が Phase 2 設計と完全一致していないことが MINOR 判定で確認された。

### 1.2 問題点・課題

| 指摘ID | 問題                                                              |
| ------ | ----------------------------------------------------------------- |
| M1     | 失敗時レポートに修正ガイダンス（4ステップ）がない                 |
| M2     | サマリーに各層のエントリ数・不足数がない                          |
| M3     | `printSummary` のシグネチャが設計（5引数）と実装（1引数）で不一致 |

### 1.3 放置した場合の影響

- 失敗時の修正初動が遅くなる
- 設計仕様との乖離が残り、将来の保守時に判断コストが増える
- レポートの一貫性不足で、レビュー品質が下がる

---

## 2. 何を達成するか（What）

### 2.1 目的

`check-shared-module-sync` のレポートを Phase 2 設計と一致させ、失敗時に即修正できる出力へ改善する。

### 2.2 最終ゴール

- [ ] 失敗時レポートに 4ステップ修正ガイダンスが出力される
- [ ] サマリーに `exports/paths/alias/typesVersions` の件数と不足数が出力される
- [ ] `printSummary` シグネチャが設計通り 5 引数になる
- [ ] `scripts/__tests__/check-shared-module-sync.test.ts` が全件 PASS

### 2.3 スコープ

#### 含むもの

- `formatReport` の出力強化
- `printSummary` シグネチャ変更
- `main` 呼び出し側の引数更新
- テストの更新/追加

#### 含まないもの

- 5段階チェックの判定ロジック変更
- CIジョブ構成の変更
- `@repo/shared` 以外のパッケージ拡張

### 2.4 成果物

| 成果物             | パス                                                 |
| ------------------ | ---------------------------------------------------- |
| 改善済みスクリプト | `scripts/check-shared-module-sync.ts`                |
| 更新テスト         | `scripts/__tests__/check-shared-module-sync.test.ts` |
| 実施結果           | 対象タスクの Phase 10/12 成果物                      |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001` の成果物が現行ブランチに存在すること
- `pnpm tsx scripts/check-shared-module-sync.ts` が実行可能であること
- `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts` が実行可能であること

### 3.2 依存タスク

| タスクID                                | 種別     | 状態 |
| --------------------------------------- | -------- | ---- |
| TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 | 親タスク | 完了 |

### 3.3 必要な知識

- TypeScript（関数シグネチャ変更）
- Vitest（スナップショット/文字列検証）
- Phase 2 設計仕様（レポートフォーマット）

### 3.4 推奨アプローチ

1. まず `printSummary` の設計シグネチャを先に合わせる
2. 次に `formatReport` にサマリー詳細と修正ガイドを追加する
3. 最後に `main` とテストを同期し、回帰確認する

### 3.5 実装課題と解決策（TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 からの学び）

親タスクの実装で苦戦した箇所のうち、本タスクの実装者が知るべき内容を以下に記録する。

| #   | 課題                               | 原因                                                                                                             | 解決策                                                                                                                          | 教訓                                                                                                     |
| --- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | vitest.config.ts の正規表現パース  | TypeScriptファイルは JSON.parse() 不可。alias 定義を正規表現で抽出する必要がある                                 | `/"(@repo\/shared[^"]*)":\s*resolve\(\s*__dirname,\s*"([^"]+)"\s*\)/g` で抽出。コメント挿入・シングルクォートは意図的にスキップ | 正規表現パーサーの対応範囲と制約をテストで明文化すること。AST解析（ts-morph等）は YAGNI                  |
| 2   | キー形式の相互変換                 | 4設定ファイル間でキー形式が異なる: exports(`./utils`), paths/alias(`@repo/shared/utils`), typesVersions(`utils`) | `toModuleKey`/`toSubpath`/`toTypesVersionsKey` の3ヘルパー関数で変換を一元化                                                    | M2（サマリー件数表示）実装時に各層のエントリ数を正確にカウントするには、このキー変換ロジックの理解が必須 |
| 3   | process.exitCode vs process.exit() | `process.exit(1)` を使うとテストプロセス自体が終了し、テスト不可能                                               | `process.exitCode = 1` を使用。テストでは `afterEach` で `process.exitCode = undefined` にリセット                              | M1（修正ガイダンス追加）でレポート出力テストを書く際も、process.exitCode パターンを維持すること          |

#### コード例: キー変換ヘルパー（M2実装時の参考）

```typescript
// exports のサブパスを paths/alias 形式に変換
function toModuleKey(subpath: string): string {
  if (subpath === ".") return "@repo/shared";
  return `@repo/shared/${subpath.slice(2)}`; // "./utils" → "@repo/shared/utils"
}

// exports のサブパスを typesVersions 形式に変換（"." は null）
function toTypesVersionsKey(subpath: string): string | null {
  if (subpath === ".") return null; // typesVersions にメインエントリは不要
  return subpath.slice(2); // "./utils" → "utils"
}
```

### 3.6 システム仕様書参照

本タスクの実装時に参照すべき aiworkflow-requirements 仕様書:

| 仕様書                                | 参照目的                                                                          |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| `references/quality-requirements.md`  | モジュール解決整合性テスト仕様（3スイート分類）、品質ゲート項目                   |
| `references/architecture-monorepo.md` | `@repo/shared` 三層モジュール解決アーキテクチャ、サブパス追加運用ルール           |
| `references/technology-devops.md`     | CI ジョブ構成（check-module-sync）、パイプラインフロー                            |
| `references/lessons-learned.md`       | TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001 苦戦箇所7件（正規表現パース、キー変換等） |

---

## 4. 実行手順

### Phase 1: 設計同期

#### 目的

Phase 2 設計と現行実装の差分を固定化する。

#### 手順

1. `phase-2-design.md` のレポート仕様を再確認する
2. 現行 `formatReport` / `printSummary` の差分を列挙する
3. テスト期待値の変更対象を確定する

#### 成果物

- 差分一覧（作業メモまたはレビューコメント）

#### 完了条件

- [ ] M1/M2/M3 の実装差分が明文化されている

### Phase 2: 実装

#### 目的

M1/M2/M3 をコードに反映する。

#### 手順

1. `printSummary` を 5引数シグネチャに変更する
2. `formatReport` にサマリー件数と不足数を追加する
3. 失敗時の 4ステップ修正ガイダンスを追加する
4. `main` の呼び出しを新シグネチャへ更新する

#### 成果物

- 更新済み `scripts/check-shared-module-sync.ts`

#### 完了条件

- [ ] M1/M2/M3 の3項目が実装済み

### Phase 3: 検証

#### 目的

改善後の挙動を機械検証する。

#### 手順

1. `scripts/__tests__/check-shared-module-sync.test.ts` を更新する
2. テスト実行して全件 PASS を確認する
3. スクリプト単体実行で正常/異常メッセージを確認する

#### 成果物

- 更新済みテスト
- テスト実行ログ

#### 完了条件

- [ ] 対象テストが全件 PASS
- [ ] レポート文言が設計準拠

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] M1: 修正ガイダンス 4ステップが出力される
- [ ] M2: 各層の件数/不足数がサマリー表示される
- [ ] M3: `printSummary` が5引数シグネチャになる

### 品質要件

- [ ] `pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts` がPASS
- [ ] `pnpm tsx scripts/check-shared-module-sync.ts` が正常系で exit code 0
- [ ] 不整合時に exit code 1 と改善可能なメッセージが出る

### ドキュメント要件

- [ ] 必要に応じて親タスクの Phase 10/12 成果物へ改善結果を反映
- [ ] 残課題テーブルが最新状態に同期される

---

## 6. 検証方法

### テストケース

| TC-ID | 内容         | 期待結果                             |
| ----- | ------------ | ------------------------------------ |
| TC-01 | 失敗時出力   | 4ステップ修正ガイドが表示される      |
| TC-02 | サマリー出力 | 各層件数と不足数が表示される         |
| TC-03 | 関数契約     | `printSummary` が5引数で呼び出される |

### 検証手順

```bash
pnpm vitest run scripts/__tests__/check-shared-module-sync.test.ts
pnpm tsx scripts/check-shared-module-sync.ts
```

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                                    |
| ------------------------------------ | ------ | -------- | ------------------------------------------------------- |
| レポート文言変更で既存テストが壊れる | 中     | 高       | 先に期待値更新方針を決めてから実装する                  |
| シグネチャ変更で呼び出し漏れが出る   | 中     | 中       | `printSummary(` を全検索し、呼び出し1箇所を必ず更新する |
| 情報過多で可読性が下がる             | 低     | 中       | サマリーは固定順序・短文で統一する                      |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/phase-2-design.md`
- `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-10/review-report.md`
- `docs/30-workflows/TASK-IMP-MODULE-RESOLUTION-CI-GUARD-001/outputs/phase-12/unassigned-task-report.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow.md`

### システム仕様書（aiworkflow-requirements）

- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`
- `.claude/skills/aiworkflow-requirements/references/technology-devops.md`
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`

### 参考コード

- `scripts/check-shared-module-sync.ts`
- `scripts/__tests__/check-shared-module-sync.test.ts`

---

## 9. 備考

### レビュー指摘の原文（要約）

- M1: 修正ガイダンス未実装
- M2: サマリー件数未表示
- M3: `printSummary` シグネチャ設計不一致

### 補足事項

- 本タスクはコア機能を変更しない「レポート品質改善」専用タスクである。

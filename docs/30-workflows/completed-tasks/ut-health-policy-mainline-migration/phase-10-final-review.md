# Phase 10: 最終レビューゲート

## メタ情報

| 項目         | 値                                        |
| ------------ | ----------------------------------------- |
| タスクID     | UT-HEALTH-POLICY-MAINLINE-MIGRATION-001   |
| フェーズ     | Phase 10                                  |
| フェーズ名   | 最終レビューゲート                        |
| 前提フェーズ | Phase 9（品質保証 全 PASS）               |
| 担当         | レビュアー（実装担当者以外が望ましい）    |
| 成果物       | `outputs/phase-10/final-review-result.md` |

---

## 目的

全フェーズ（Phase 1〜9）の完了を確認し、受入基準（AC-1〜AC-6）を全て満たしていることをレビュアーが最終確認する。判定結果に応じて、タスクを完了とするか、該当フェーズへ差し戻すかを決定する。

---

## レビュー観点（AC-1〜AC-6 全チェック）

以下の全受入基準について、コード・テスト・レポートを確認して PASS/FAIL を判定する。

### AC チェックリスト

| AC   | 受入基準                                                                     | 確認方法                                                                       | 判定        |
| ---- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------- |
| AC-1 | `resolveHealthPolicy()` が `useMainlineExecutionAccess` 内で呼び出されている | `useMainlineExecutionAccess.ts` のコードを直接確認                             | PASS / FAIL |
| AC-2 | `buildMainlineExecutionAccessState()` に `healthPolicy` が渡されている       | `useMainlineExecutionAccess.ts` の関数呼び出し引数を確認                       | PASS / FAIL |
| AC-3 | 旧 L117-120 の `apiKeyDegraded` 独自算出ロジックが削除されている             | `useMainlineExecutionAccess.ts` に `apiKeyDegraded` 変数が存在しないことを確認 | PASS / FAIL |
| AC-4 | `@repo/shared/types` 経由でインポートしている                                | `useMainlineExecutionAccess.ts` の import 文を確認                             | PASS / FAIL |
| AC-5 | 既存のユニットテストが全て PASS する（`pnpm --filter @repo/desktop test`）   | `outputs/phase-9/quality-report.md` のチェック 1 結果を確認                    | PASS / FAIL |
| AC-6 | TypeScript の型チェックがエラーなく通過する（`pnpm typecheck`）              | `outputs/phase-9/quality-report.md` のチェック 3 結果を確認                    | PASS / FAIL |

---

## 判定基準

### 判定ランク定義

| 判定ランク   | 定義                                                                              | 対応                                     |
| ------------ | --------------------------------------------------------------------------------- | ---------------------------------------- |
| **PASS**     | AC-1〜AC-6 が全て満たされており、コード品質上の問題がない                         | タスク完了とする                         |
| **MINOR**    | AC は全て満たされているが、コードスタイル・命名・コメント等の軽微な改善余地がある | タスク完了とし、指摘事項を未タスク化する |
| **MAJOR**    | 1 件以上の AC が満たされていないが、機能動作には影響しない問題がある              | 該当フェーズへ差し戻す                   |
| **CRITICAL** | 機能動作に影響する問題（テスト失敗・型エラー・重大なロジック誤り）がある          | 該当フェーズへ即時差し戻す               |

### 判定ランク別の対応詳細

**PASS**

- 全 AC が満たされている
- 品質レポート（Phase 9）で全チェック PASS
- タスクを「完了」ステータスへ移行する

**MINOR**

- 全 AC が満たされている
- 例: import の整理が不完全、コメントが古い記述を含む、変数名が微妙に不一致
- タスクは「完了」とし、指摘事項を別タスクとして未タスクリストに追加する
- MINOR 指摘事項は本タスクのブロッカーにはならない

**MAJOR**

- 一部の AC が未達だが、動作には直接影響しない
- 例: AC-4 の import パスが `@repo/shared/types` ではなく直接パスになっている
- 差し戻し先を特定し、修正後に Phase 10 を再実施する

**CRITICAL**

- 動作に影響する問題が存在する
- 例: テストが FAIL している（AC-5 未達）、型エラーが残存している（AC-6 未達）
- 即時差し戻しを行い、修正完了後に Phase 9 から再実施する

---

## MINOR 判定時の未タスク化手順

MINOR 判定となった指摘事項は、以下のフォーマットで未タスクリストに追加する。

```markdown
## 未タスク: [UT-HEALTH-POLICY-MAINLINE-MIGRATION-001 MINOR指摘] <指摘内容の概要>

- 発生元タスク: UT-HEALTH-POLICY-MAINLINE-MIGRATION-001
- 発見フェーズ: Phase 10（最終レビューゲート）
- 判定ランク: MINOR
- 指摘内容: <詳細説明>
- 推奨対応: <対応方針>
- 優先度: Low（タスク完了後の対応で可）
```

未タスクの追加先: `docs/30-workflows/unassigned-task/` 以下の適切なファイル

---

## 戻り先決定基準テーブル

| 問題の種類                               | 判定ランク | 差し戻し先フェーズ                                | 差し戻し理由                             |
| ---------------------------------------- | ---------- | ------------------------------------------------- | ---------------------------------------- |
| テストが FAIL している                   | CRITICAL   | Phase 6（テスト拡充）または Phase 5（実装）       | テストコードまたは実装コードの修正が必要 |
| 型エラーが残存している                   | CRITICAL   | Phase 5（実装）または Phase 8（リファクタリング） | 型定義の修正が必要                       |
| `apiKeyDegraded` ロジックが残存している  | CRITICAL   | Phase 5（実装）                                   | AC-3 未達。削除が不完全                  |
| `resolveHealthPolicy()` が呼ばれていない | CRITICAL   | Phase 5（実装）                                   | AC-1 未達。実装が不完全                  |
| `healthPolicy` が渡されていない          | CRITICAL   | Phase 5（実装）                                   | AC-2 未達。実装が不完全                  |
| import パスが `@repo/shared/types` 以外  | MAJOR      | Phase 8（リファクタリング）                       | AC-4 未達。import パスの修正が必要       |
| カバレッジが目標未達                     | MAJOR      | Phase 7（カバレッジ確認）経由で Phase 6           | テスト追加が必要                         |
| import 順序の乱れ                        | MINOR      | 未タスク化して完了                                | 動作には影響しない                       |
| コメントの古い記述                       | MINOR      | 未タスク化して完了                                | 動作には影響しない                       |
| 命名の微妙な不一致                       | MINOR      | 未タスク化して完了                                | 動作には影響しない                       |

---

## final-review-result.md の記録フォーマット

```markdown
## Phase 10: 最終レビューゲート結果

レビュー実施日時: YYYY-MM-DD HH:MM
レビュアー: <名前>

### AC チェック結果

| AC   | 受入基準                                                   | 判定        | 備考 |
| ---- | ---------------------------------------------------------- | ----------- | ---- |
| AC-1 | resolveHealthPolicy() の呼び出し                           | PASS / FAIL |      |
| AC-2 | buildMainlineExecutionAccessState() への healthPolicy 渡し | PASS / FAIL |      |
| AC-3 | apiKeyDegraded 独自算出ロジックの削除                      | PASS / FAIL |      |
| AC-4 | @repo/shared/types 経由のインポート                        | PASS / FAIL |      |
| AC-5 | 全ユニットテスト PASS                                      | PASS / FAIL |      |
| AC-6 | TypeScript 型チェック PASS                                 | PASS / FAIL |      |

### 総合判定

**判定ランク: PASS / MINOR / MAJOR / CRITICAL**

### 指摘事項一覧

| No. | 指摘内容 | 判定ランク | 対応方針   |
| --- | -------- | ---------- | ---------- |
| 1   | ...      | MINOR      | 未タスク化 |

### MINOR 指摘の未タスク化

- [ ] 指摘事項を未タスクリストに追加済み

### 結論

- [ ] PASS / MINOR → タスク完了
- [ ] MAJOR / CRITICAL → Phase X に差し戻し

差し戻し先（該当の場合）: Phase X
差し戻し理由（該当の場合）: <理由>
```

---

## 完了条件（フェーズゲート）

| 条件                                                     | 確認方法                                  |
| -------------------------------------------------------- | ----------------------------------------- |
| AC-1〜AC-6 が全て PASS または MINOR 判定                 | final-review-result.md の AC チェック結果 |
| 総合判定が PASS または MINOR                             | final-review-result.md の総合判定         |
| MINOR 指摘事項が未タスク化されている（MINOR 判定の場合） | 未タスクリストへの追加確認                |
| MAJOR / CRITICAL の場合は差し戻し先が明記されている      | final-review-result.md の結論             |
| outputs/phase-10/final-review-result.md が作成されている | ファイル確認                              |

---

## 成果物

- **レポートファイル**: `outputs/phase-10/final-review-result.md`
  - AC-1〜AC-6 のチェック結果（PASS/FAIL）
  - 総合判定（PASS / MINOR / MAJOR / CRITICAL）
  - 指摘事項一覧と対応方針
  - MINOR 指摘の未タスク化記録
  - タスク完了または差し戻し先の結論

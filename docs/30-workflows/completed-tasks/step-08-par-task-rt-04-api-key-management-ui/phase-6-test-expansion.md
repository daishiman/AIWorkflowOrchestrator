# Phase 6: テスト拡充

## メタ情報

| 項目       | 値                    |
| ---------- | --------------------- |
| Phase      | 6                     |
| 機能名     | api-key-management-ui |
| 作成日     | 2026-03-29            |
| ステータス | pending               |

## 目的

error path、env-fallback、連続操作の回帰 guard を追加し、導線品質を安定化する。

## 実行タスク

- error path テストを追加する
- env-fallback / not-set / validate-error を補強する
- regression guard を作る

## 参照資料

| 資料名         | パス                                                                  | 説明     |
| -------------- | --------------------------------------------------------------------- | -------- |
| Phase 5        | `phase-5-implementation.md`                                           | 実装     |
| error handling | `.agents/skills/aiworkflow-requirements/references/error-handling.md` | 失敗分類 |

## 実行手順

### ステップ1: failure mode を洗う

1. 空文字
2. プレフィックス不正
3. validate 失敗
4. delete 失敗
5. env-fallback

### ステップ2: regression guard を追加する

1. 連続保存
2. 保存直後削除
3. CTA 表示切替

### ステップ3: 結果を整理する

1. current 追加ケース
2. baseline 既知問題

## 統合テスト連携

- Phase 7 の coverage 計測対象へ追加ケースを反映する。
- Phase 11 の UI状態と failure mode 名称を合わせる。

## 成果物

| 成果物            | パス                                       | 説明     |
| ----------------- | ------------------------------------------ | -------- |
| error path ケース | `outputs/phase-6/error-path-cases.md`      | 異常系   |
| 回帰ガード        | `outputs/phase-6/regression-guards.md`     | 維持項目 |
| テスト拡充結果    | `outputs/phase-6/test-expansion-result.md` | 実行結果 |

## 完了条件

- [ ] 主要 failure mode がカバーされている
- [ ] regression guard が追加されている
- [ ] current / baseline が区別されている
- [ ] **本Phase内の全タスクを100%実行完了**

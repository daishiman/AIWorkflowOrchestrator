# Phase 11: 手動テスト検証

## メタ情報

| 項目       | 内容                                                |
| ---------- | --------------------------------------------------- |
| Phase      | 11                                                  |
| タスクID   | UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001 |
| 機能名     | evals-skill-scanner-content-validate                |
| 前提Phase  | Phase 10                                            |
| 後続Phase  | Phase 12                                            |
| 作成日     | 2026-04-21                                          |
| ステータス | pending                                             |

## 目的

3層評価（Semantic / Visual / AI UX）の観点から実装の正確性を手動で確認する。

| 評価層   | 概要                                         | 適用   |
| -------- | -------------------------------------------- | ------ |
| Semantic | バリデーションロジックの動作が仕様通りか確認 | 対象   |
| Visual   | UI/UX 変更の視覚的確認                       | 対象外 |
| AI UX    | AI ワークフロー上の利用体験確認              | 対象外 |

## NON_VISUAL タスク宣言

本タスク（UNASSIGNED-EVALS-SKILL-SCANNER-CONTENT-VALIDATE-001）は **NON_VISUAL** 分類です。
`SkillScanner.ts` および `SkillScanner.test.ts` のみを変更対象としており、UI/UX 変更は含まれません。
Visual 評価・AI UX 評価は本タスクのスコープ外です。

## Semantic 評価チェックリスト

### バリデーション動作の手動確認

- [ ] SEQ-1: 正常な EVALS.json（必須キー全揃い）を持つスキルがスキャン結果に含まれる
- [ ] SEQ-2: 空 `{}` の EVALS.json を持つスキルがスキャン結果でバリデーション失敗として扱われる
- [ ] SEQ-3: 破損 JSON（構文エラー）の EVALS.json を持つスキルがパースエラーとして報告される
- [ ] SEQ-4: 必須キー（例: `evals` 配列など）が欠落した EVALS.json を持つスキルが無効と判定される
- [ ] SEQ-5: camelCase キーを持つ EVALS.json が valid として受理される
- [ ] SEQ-6: snake_case キーを持つ EVALS.json が valid として受理される（両言語許容ポリシー確認）
- [ ] SEQ-7: EVALS.json を持たないスキルの挙動が変更前と同じである（回帰確認）
- [ ] SEQ-8: ファイルサイズのみの既存チェックが壊れていない（回帰確認）

### テスト自動実行確認

- [ ] `pnpm --filter @repo/desktop test SkillScanner` が全テスト通過する
- [ ] 新規追加テストケース（破損 EVALS）が実行・通過している
- [ ] 更新された既存3テスト（with-evals / with-all-others / with-sized-evals）が通過している

## 手動テスト手順

### 前提環境

```bash
# デスクトップアプリのビルド確認
pnpm --filter @repo/desktop build

# テストを実行して全通過を確認
pnpm --filter @repo/desktop test --run SkillScanner
```

### テストシナリオ一覧

| シナリオ                   | 手順                                                                   | 期待結果                                                 |
| -------------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------- |
| 正常 EVALS スキャン        | 正常な EVALS.json を持つスキルディレクトリを `SkillScanner` でスキャン | スキャン結果に含まれ、バリデーション通過                 |
| 空 JSON スキャン           | `{}` の EVALS.json を持つスキルディレクトリをスキャン                  | バリデーション失敗として扱われる（または警告付きで返る） |
| 破損 JSON スキャン         | `{invalid json` の EVALS.json を持つスキルディレクトリをスキャン       | パースエラーが適切に処理され、クラッシュしない           |
| 必須キー欠落スキャン       | 必須キーのない EVALS.json を持つスキルディレクトリをスキャン           | バリデーション失敗として報告される                       |
| camelCase EVALS スキャン   | camelCase キーの EVALS.json をスキャン                                 | valid として受理される                                   |
| snake_case EVALS スキャン  | snake_case キーの EVALS.json をスキャン                                | valid として受理される（両言語許容ポリシー）             |
| EVALS なしスキルのスキャン | EVALS.json を持たないスキルディレクトリをスキャン                      | 変更前と同じ挙動（回帰なし）                             |

### テスト用フィクスチャ確認

```bash
# SkillScanner テスト用フィクスチャの場所を確認
find apps/desktop/src/main/services/skill/__tests__ -name "*.json" -o -name "*.ts"
```

## 代替証跡

Phase 11 は NON_VISUAL タスクのため、スクリーンショットの代わりに以下を証跡とする。

| 証跡種別           | パス                                      | 説明                                |
| ------------------ | ----------------------------------------- | ----------------------------------- |
| 最終レビュー結果   | `outputs/phase-10/final-review-result.md` | Phase 10 ゲート PASS の確認         |
| 手動テスト実行結果 | `outputs/phase-11/manual-test-result.md`  | 各シナリオの実行結果と合否          |
| テスト実行ログ     | `outputs/phase-11/test-run-log.txt`       | `pnpm test SkillScanner` の実行ログ |

## 視覚証跡

UI/UX 変更なしのため Phase 11 スクリーンショット不要

## フィードバックループ

手動テストで HIGH レベルの問題（バリデーション動作の不正・テスト失敗など）が発見された場合:

1. `outputs/phase-11/manual-test-result.md` に問題を記録する
2. 問題の重要度を判定する（HIGH / MEDIUM / LOW）
3. HIGH 問題の場合は `docs/30-workflows/unassigned-task/` へ自動生成タスクを作成する
4. Phase 5（実装）または Phase 6（テスト拡充）に差し戻して修正する

```bash
# 未タスク自動生成（HIGH問題発見時）
node .claude/skills/task-specification-creator/scripts/create-unassigned-task.js \
  --source "phase-11-manual-test" \
  --severity HIGH \
  --description "SkillScanner バリデーション動作の問題"
```

## 参照資料

| 資料名           | パス                                      | 用途            |
| ---------------- | ----------------------------------------- | --------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Phase 10 成果物 |
| 品質レポート     | `outputs/phase-9/quality-report.md`       | Phase 9 成果物  |

## 成果物

| 成果物           | パス                                     | 説明                       |
| ---------------- | ---------------------------------------- | -------------------------- |
| 手動テスト結果   | `outputs/phase-11/manual-test-result.md` | 各シナリオの実行結果と合否 |
| 証跡インデックス | `outputs/phase-11/evidence-index.md`     | テスト証跡・ログの一覧     |

## 完了条件

- [ ] 全手動テストシナリオ（SEQ-1〜SEQ-8）を実行した
- [ ] `pnpm --filter @repo/desktop test SkillScanner` が全通過することを確認した
- [ ] 破損 JSON のパース時にアプリがクラッシュしないことを確認した
- [ ] camelCase / snake_case 両対応が正しく動作することを確認した
- [ ] HIGH 問題がない、または HIGH 問題を記録・差し戻し手続きを実施した
- [ ] 成果物テーブル記載のファイルを全件生成した

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを100%実行完了
- [ ] 成果物テーブル記載のファイルを全件生成

## 次のPhase

Phase 12: ドキュメント更新

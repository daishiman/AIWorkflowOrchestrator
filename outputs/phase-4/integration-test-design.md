# Phase 4 統合テスト設計

- タスクID: UT-IMP-AIWORKFLOW-SPEC-REFERENCE-SYNC-001
- 作成日: 2026-02-25
- 担当SubAgent: SubAgent-B

## IT-001 検証スクリプト順次実行

1. `verify-unassigned-links.js` を実行する
2. `generate-index.js` を2スキルで実行する
3. 索引差分を確認する
4. `quick_validate.py` を2スキルで実行する
5. 3点同期 grep 突合を実行する

## 全体判定

- 5ステップすべて PASS で統合PASS
- 1ステップでも FAIL の場合は Phase 5 へ差し戻し

## 引き継ぎ先

- 実行結果は Phase 6 `coverage-report.md` / `integration-test.md` に記録する

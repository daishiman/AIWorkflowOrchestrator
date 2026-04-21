# 検証導線

## 1. 実コード確認

### 差分確認コマンド

```bash
# SkillCreatorService の cancel cleanup 実装確認
grep -n "cleanupCancelledSkillDir\|skillDirExistedBefore\|catch\|finally" \
  apps/desktop/src/main/services/skill/SkillCreatorService.ts
```

### 確認ポイント

| 確認項目                                  | 期待値                                |
| ----------------------------------------- | ------------------------------------- |
| `cleanupCancelledSkillDir` の呼び出し位置 | `catch` ブロック内                    |
| `skillDirExistedBefore` の取得タイミング  | try ブロック開始前                    |
| `finally` の内容                          | `currentAbortController` リセットのみ |
| `createdByThisRun` フラグ                 | 使用なし                              |

## 2. spec 命名確認

```bash
# canonical artifact 名の確認
cat docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/artifacts.json | \
  python3 -m json.tool | grep -A2 '"artifacts"'

# outputs/artifacts.json との parity 確認
diff <(cat artifacts.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join([a for p in d['phases'].values() for a in p.get('artifacts',[])]))" 2>/dev/null) \
     <(cat outputs/artifacts.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('\n'.join([a for p in d['phases'].values() for a in p.get('artifacts',[])]))" 2>/dev/null)
```

## 3. 回帰テスト実行

```bash
# targeted test（依存関係チェック込み）
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop test -- SkillCreatorService
```

### 期待結果

| テスト        | 期待値                          |
| ------------- | ------------------------------- |
| SC-CANCEL-001 | PASS（新規 dir が削除される）   |
| SC-CANCEL-002 | PASS（既存 dir は削除されない） |
| 全体          | エラーなし                      |

## 4. phase spec の Phase 間参照整合確認

```bash
# Phase spec の成果物名が artifact-canonical-list.md と一致するか確認
grep -h "outputs/phase-" \
  docs/30-workflows/TASK-SC-CANCEL-CLEANUP-PARTIAL-DIR-001/phase-*.md | \
  sort | uniq
```

## 5. NON_VISUAL close-out 確認

- `outputs/phase-11/manual-test-result.md` の存在
- `outputs/phase-12/implementation-guide.md` に `## 視覚証跡` セクションの存在
- `## 視覚証跡` に「UI/UX変更なしのため Phase 11 スクリーンショット不要」の記述

## ゲート判定

| ゲート        | 条件                                         | 状態                  |
| ------------- | -------------------------------------------- | --------------------- |
| Phase 2 → 3   | 4条件の暫定 PASS または修正方針確定          | Phase 2 完了後に評価  |
| Phase 3 → 4   | 差分確認型 task への転換が妥当と判断         | Phase 3 完了後に評価  |
| Phase 10 → 11 | `final-review-result.md` で blocker 0 件     | Phase 10 完了後に評価 |
| Phase 12 → 13 | mandatory 5 tasks 完了、artifact parity 完了 | Phase 12 完了後に評価 |

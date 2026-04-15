# Phase 11: 手動テスト検証

## メタ情報

| 項目   | 値                       |
| ------ | ------------------------ |
| Phase  | 11                       |
| 機能名 | task-ci-optimization-001 |
| 作成日 | 2026-04-14               |

## 目的

実際の GitHub Actions CI を実行して CI 最適化の改善効果を検証する。
UI 変更なし（`NON_VISUAL`）のため、検証はすべて CI 実行ログと計測値で行う。
AC-2（7分40秒以内）の最終確認をここで実施する。

## テスト方式

- 本タスクは UI/UX 変更なしの `NON_VISUAL` 扱いとする
- スクリーンショット計画は作成しない
- CI 実行時間・キャッシュヒット率・テスト PASS 率を `manual-test-report.md` に記録する
- `phase11-capture-metadata.json` には `captureMode: "NON_VISUAL"` と理由を残す

---

## 実行タスク

- **タスク 1**: PR を作成し CI を実行（観察対象は CI 実行時間と各ジョブのログ）
- **タスク 2**: 5 回分の CI 実行時間を計測・記録
- **タスク 3**: node_modules キャッシュのヒット/ミスをログで確認
- **タスク 4**: AC-2（7分40秒以内）の達成確認
- **タスク 5**: 初回実行（キャッシュ未存在時）の時間も計測・記録

---

## 参照資料

| 資料名                      | パス                                                                                          | 説明                   |
| --------------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| CI 設定                     | `.github/actions/pnpm-install-retry/action.yml` / `.github/workflows/ci.yml`                  | 最適化後の設定         |
| Vitest 設定                 | `apps/desktop/vitest.config.ts`                                                               | CI_MAX_FORKS=3 の設定  |
| Phase 5 実装結果            | `outputs/phase-5/implementation-result.md`                                                    | 実装内容の確認         |
| Phase 7 計測レポート        | `outputs/phase-7/ci-timing-report.md`                                                         | Phase 7 での事前計測値 |
| 受入基準                    | `outputs/phase-1/acceptance-criteria.md`                                                      | AC-1〜AC-6             |
| GitHub Actions ドキュメント | https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows | actions/cache の使い方 |
| 最終レビュー結果            | `outputs/phase-10/final-review-result.md`                                                     | Phase 10 成果物        |
| AC検証記録                  | `outputs/phase-10/ac-verification.md`                                                         | Phase 10 成果物        |

---

## 実行手順

### ステップ 1: PR 作成と CI 実行

```bash
# 変更をコミット・プッシュ済みであること確認
git status

# PR 作成（Phase 13 実施前の動作確認用）
gh pr create --title "perf(ci): CI最適化動作確認用" --body "Phase 11 手動テスト用"

# CI 実行状況をリアルタイム確認
gh run watch
```

### ステップ 2: CI 実行時間の計測

```bash
# 直近 5 回の CI 実行時間を計測
gh run list \
  --repo daishiman/AIWorkflowOrchestrator \
  --workflow=ci.yml \
  --limit 5 \
  --json databaseId,name,status,conclusion,startedAt,updatedAt | \
python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
for r in data:
    s = datetime.fromisoformat(r['startedAt'].replace('Z','+00:00'))
    e = datetime.fromisoformat(r['updatedAt'].replace('Z','+00:00'))
    diff = int((e - s).total_seconds())
    print(f\"{r['databaseId']}: {diff}s ({diff//60}m{diff%60}s) - {r['conclusion']}\")
"
```

### ステップ 3: キャッシュヒット確認

```bash
# 特定 run の node_modules キャッシュヒット状況を確認
gh run view <RUN_ID> \
  --repo daishiman/AIWorkflowOrchestrator \
  --log | grep -i "cache hit\|cache miss\|node_modules"
```

### ステップ 4: ジョブ別実行時間内訳

```bash
# 特定 run のジョブ別時間を確認
gh run view <RUN_ID> \
  --repo daishiman/AIWorkflowOrchestrator \
  --json jobs | python3 -c "
import json, sys
from datetime import datetime
data = json.load(sys.stdin)
for job in sorted(data['jobs'], key=lambda x: x['name']):
    name = job['name']
    s = datetime.fromisoformat(job['startedAt'].replace('Z','+00:00'))
    e = datetime.fromisoformat(job['completedAt'].replace('Z','+00:00'))
    diff = int((e - s).total_seconds())
    conclusion = job['conclusion']
    print(f'{diff:4d}s | {name}: {conclusion}')
"
```

### ステップ 5: 計測結果を記録テーブルに転記

```
| Run # | 実行時間 | キャッシュ | 結論 | AC-2 判定 |
|-------|---------|-----------|------|----------|
| 1     | ?m ?s   | ヒット/ミス | success/failure | PASS/FAIL |
| 2     | ?m ?s   | ヒット/ミス | success/failure | PASS/FAIL |
| 3     | ?m ?s   | ヒット/ミス | success/failure | PASS/FAIL |
| 4     | ?m ?s   | ヒット/ミス | success/failure | PASS/FAIL |
| 5     | ?m ?s   | ヒット/ミス | success/failure | PASS/FAIL |
| 平均  | ?m ?s   | —          | —               | PASS/FAIL |
```

---

## 統合テスト連携

CI 変更タスクのため単体テストは存在しないが、以下を確認する:

- [ ] Phase 5 で変更した `action.yml` / `ci.yml` の YAML 構文が正しい（actionlint で検証済み）
- [ ] 全 17 シャードの test-desktop が PASS していること
- [ ] test-shared、typecheck、e2e-desktop が PASS していること
- [ ] カバレッジアップロードが main ブランチで正常動作していること

---

## 3 層評価

| 層       | 確認項目                                                        | 判定            |
| -------- | --------------------------------------------------------------- | --------------- |
| Semantic | CI が正しいジョブ・トリガー条件で起動するか                     | ☐ PASS / ☐ FAIL |
| Visual   | GitHub Actions UI でキャッシュヒット/ミスが視覚的に確認できるか | ☐ PASS / ☐ FAIL |
| AI UX    | キャッシュサイズ・download 時間が妥当か（90 秒未満が目安）      | ☐ PASS / ☐ FAIL |

---

## サブタスク管理

| #   | タスク                            | 担当   | 状態        |
| --- | --------------------------------- | ------ | ----------- |
| 1   | PR 作成・CI 起動                  | manual | not-started |
| 2   | 5 回分 CI 実行時間計測・記録      | manual | not-started |
| 3   | node_modules キャッシュヒット確認 | manual | not-started |
| 4   | AC-2（7分40秒以内）達成確認       | manual | not-started |
| 5   | 初回実行（キャッシュ未存在）計測  | manual | not-started |

---

## 成果物

| 成果物ファイル                                   | 内容                               |
| ------------------------------------------------ | ---------------------------------- |
| `outputs/phase-11/manual-test-result.md`         | 計測結果と AC 達成状況の記録       |
| `outputs/phase-11/manual-test-report.md`         | 詳細な実行レポート                 |
| `outputs/phase-11/discovered-issues.md`          | 発見された問題（0 件でも出力必須） |
| `outputs/phase-11/ci-timing-measurements.md`     | 5 回分の CI 実行時間計測値         |
| `outputs/phase-11/phase11-capture-metadata.json` | captureMode: NON_VISUAL の記録     |

---

## 完了条件

- [ ] 5 回分の CI 実行時間を計測し記録した
- [ ] AC-2（平均 7分40秒以内）を達成していることを確認した
- [ ] AC-3（全シャード PASS）を確認した
- [ ] node_modules キャッシュのヒット率が 2 回目以降で 100% であることを確認した
- [ ] 発見された問題を `discovered-issues.md` に記録した（0 件でも記録）
- [ ] `phase11-capture-metadata.json` を作成した

---

## タスク 100%実行確認【必須】

- [ ] タスク 1 完了: PR 作成・CI 起動
- [ ] タスク 2 完了: 5 回分計測・記録
- [ ] タスク 3 完了: キャッシュヒット確認
- [ ] タスク 4 完了: AC-2 達成確認
- [ ] タスク 5 完了: 初回実行計測
- [ ] 全成果物ファイルが生成されていること

```bash
node .claude/skills/task-specification-creator/scripts/complete-phase.js \
  --workflow docs/30-workflows/task-ci-optimization-001 --phase 11 \
  --artifacts "outputs/phase-11/manual-test-result.md:手動テスト結果"
```

---

## 次 Phase

Phase 12: ドキュメント更新 → [phase-12-documentation.md](phase-12-documentation.md)

> **条件**: AC-2 未達成の場合は Phase 5（実装）または Phase 3（設計）へ戻ること。

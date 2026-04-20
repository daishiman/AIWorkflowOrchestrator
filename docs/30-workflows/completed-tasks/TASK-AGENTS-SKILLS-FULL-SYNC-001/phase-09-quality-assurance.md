# Phase 9: 品質保証

## メタ情報

| 項目      | 値                                                       |
| --------- | -------------------------------------------------------- |
| Phase     | 9                                                        |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001                         |
| 作成日    | 2026-04-19                                               |
| 前提Phase | Phase 1〜Phase 8 完了（Phase 5 実装 + Phase 8 整理済み） |

## 目的

Phase 5 で配置した 2 本のスクリプト・2 箇所の hook 追記、および Phase 5 で解消した drift 7 件（内容差分 6 + `int-test-skill` 初回同期）に対して、line budget / link check / mirror parity / index 一致 / structure 整合 / shellcheck を束ねた一括判定コマンド列で品質ゲートを通過できることを保証する。

## 実行タスク

1. line budget（bash script 各 < 80 行）を実測する
2. 仕様書内のパス参照が全て実在することを link check する
3. `diff -qr .claude/skills .agents/skills` が空出力であることを確認する
4. `keywords.json` / `topic-map.md` が canonical / mirror で一致することを確認する
5. `validate-structure.js` による structure 整合を確認する
6. `shellcheck` を推奨項目として実行する（必須ではない）
7. `verify-skills-parity.sh` が exit 0 を返すことを確認する
8. `audit-unassigned-tasks.js` で本仕様書の登録を確認する
9. 一括判定コマンド列を `outputs/phase-9/command-log.md` に記録する

## 参照資料

| 資料名                        | パス                                                                                          | 用途                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Phase 1 要件定義              | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-01-requirements.md`                 | AC-1〜AC-9 の実測対象                      |
| Phase 2 設計                  | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-02-design.md`                       | verify / sync 契約の実測基準               |
| Phase 8 リファクタリング      | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-08-refactoring.md`                  | 整理後のスクリプト / hook を検証対象にする |
| generate-index 契約           | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`                            | deterministic output / `--quiet`           |
| validate-structure            | `.claude/skills/aiworkflow-requirements/scripts/validate-structure.js`                        | skill ディレクトリ構造検証                 |
| audit-unassigned-tasks        | `.claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js`                 | 仕様書登録確認                             |
| verify-all-specs              | `.claude/skills/task-specification-creator/scripts/verify-all-specs.js`                       | workflow 検証（参考）                      |
| conflict-prevent Phase 9 実績 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/phase-09-quality-assurance.md` | 先行タスクの品質ゲート運用例               |

### システム仕様（aiworkflow-requirements）

| 参照資料                  | パス                                                                 | 内容                           |
| ------------------------- | -------------------------------------------------------------------- | ------------------------------ |
| canonical / mirror 契約   | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 本タスクの parity ゴールの根拠 |
| topic-map / keywords 契約 | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`        | deterministic index の参照先   |

## 実行手順

### ステップ 1: line budget 計測

bash script 各 < 80 行を目標とし、超過時は Phase 8 の navigation drift 削除をやり直す。

```bash
wc -l .claude/scripts/verify-skills-parity.sh
wc -l .claude/scripts/sync-skills-mirror.sh
```

| スクリプト                | 目標    | 判定方針                                                             |
| ------------------------- | ------- | -------------------------------------------------------------------- |
| `verify-skills-parity.sh` | < 80 行 | 超過 = MINOR（コメント削減で対応）。100 行超 = MAJOR（Phase 8 戻し） |
| `sync-skills-mirror.sh`   | < 80 行 | 同上                                                                 |

### ステップ 2: link check（仕様書内パス参照の実在確認）

本仕様書群および Phase 8 が参照するパスが全て実在することを確認する。

```bash
# Phase 1-10 仕様書が参照する bash / node スクリプトおよび hook ファイルの存在確認
for p in \
  .claude/scripts/verify-skills-parity.sh \
  .claude/scripts/sync-skills-mirror.sh \
  .claude/hooks/session-init.sh \
  .claude/hooks/post-merge-index-regenerate.sh \
  .claude/scripts/setup-merge-drivers.sh \
  .claude/skills/aiworkflow-requirements/scripts/generate-index.js \
  .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  .husky/pre-push \
  .agents/skills/int-test-skill/SKILL.md; do
  test -e "$p" && echo "OK: $p" || echo "MISSING: $p"
done
```

判定:

- `MISSING:` が 1 件でもあれば MAJOR として Phase 5 に戻す
- 全件 `OK:` で次のステップへ進む

### ステップ 3: mirror parity（`diff -qr`）

```bash
diff -qr .claude/skills .agents/skills
echo "exit code: $?"
```

| 期待           | 判定                                                                 |
| -------------- | -------------------------------------------------------------------- |
| 空出力、exit 0 | AC-1 成立、次へ                                                      |
| 非空、exit 1   | MAJOR: `bash .claude/scripts/sync-skills-mirror.sh` を実行して再測定 |

### ステップ 4: keywords.json / topic-map.md の canonical/mirror 一致

```bash
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json

diff .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
     .agents/skills/aiworkflow-requirements/indexes/topic-map.md
```

| 期待     | 判定                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 差分なし | `generate-index.js --quiet` の deterministic 性と rsync 整合が同時に確認できる |
| 差分あり | MAJOR: `generate-index.js` の deterministic 性破綻または rsync 抜けを調査      |

### ステップ 5: validate-structure による structure 整合

```bash
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/aiworkflow-requirements

node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .agents/skills/aiworkflow-requirements
```

| 期待                 | 判定                                   |
| -------------------- | -------------------------------------- |
| 両ルートで exit 0    | 構造整合 OK                            |
| どちらかで exit 非 0 | MAJOR: 構造崩れを Phase 5 実装側で直す |

### ステップ 6: shellcheck（推奨、必須ではない）

`shellcheck` がインストール済みであれば実行する。未インストールの場合は SKIP として記録し、必須要件とはしない。

```bash
if command -v shellcheck >/dev/null 2>&1; then
  shellcheck .claude/scripts/verify-skills-parity.sh
  shellcheck .claude/scripts/sync-skills-mirror.sh
else
  echo "shellcheck not installed: SKIP"
fi
```

| 判定         | 対応                                                       |
| ------------ | ---------------------------------------------------------- |
| warning なし | best                                                       |
| warning あり | MINOR（Phase 8 wording 整理で対応済みで無ければ追加修正）  |
| SKIP         | 必須ではないため quality-report に「未実施」として記録のみ |

### ステップ 7: verify-skills-parity.sh の exit 0 確認

```bash
bash .claude/scripts/verify-skills-parity.sh
echo "exit code: $?"
```

| 期待   | 判定                                                   |
| ------ | ------------------------------------------------------ |
| exit 0 | AC-2（parity OK 時 exit 0）が成立                      |
| exit 1 | Phase 5 drift 解消 または スクリプト contract を再点検 |

### ステップ 8: audit-unassigned-tasks による本仕様書登録確認

```bash
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
```

| 期待                     | 判定                                                                                                      |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| registered: true の JSON | 仕様書と unassigned-task の対応関係が健全                                                                 |
| registered: false        | MAJOR: `docs/30-workflows/unassigned-task/` 直下のファイル配置を Phase 12 で調整（本 Phase では記録のみ） |

### ステップ 9: 一括判定コマンド列

上記 7 ステップを 1 ブロックにまとめ、実行ログを `outputs/phase-9/command-log.md` に保存する。

```bash
set +e
echo "=== line budget ==="
wc -l .claude/scripts/verify-skills-parity.sh .claude/scripts/sync-skills-mirror.sh

echo "=== link check ==="
for p in \
  .claude/scripts/verify-skills-parity.sh \
  .claude/scripts/sync-skills-mirror.sh \
  .claude/hooks/session-init.sh \
  .husky/pre-push \
  .agents/skills/int-test-skill/SKILL.md \
  .claude/skills/aiworkflow-requirements/scripts/generate-index.js \
  .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js; do
  test -e "$p" && echo "OK: $p" || echo "MISSING: $p"
done

echo "=== mirror parity ==="
diff -qr .claude/skills .agents/skills
echo "parity exit: $?"

echo "=== index parity ==="
diff .claude/skills/aiworkflow-requirements/indexes/keywords.json \
     .agents/skills/aiworkflow-requirements/indexes/keywords.json
diff .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
     .agents/skills/aiworkflow-requirements/indexes/topic-map.md

echo "=== validate-structure ==="
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .claude/skills/aiworkflow-requirements
node .claude/skills/aiworkflow-requirements/scripts/validate-structure.js \
  .agents/skills/aiworkflow-requirements

echo "=== shellcheck (optional) ==="
if command -v shellcheck >/dev/null 2>&1; then
  shellcheck .claude/scripts/verify-skills-parity.sh .claude/scripts/sync-skills-mirror.sh
else
  echo "shellcheck not installed: SKIP"
fi

echo "=== verify-skills-parity ==="
bash .claude/scripts/verify-skills-parity.sh
echo "verify exit: $?"

echo "=== audit-unassigned-tasks ==="
node .claude/skills/task-specification-creator/scripts/audit-unassigned-tasks.js \
  --json \
  --target-file docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md
set -e
```

pnpm / node / bash の呼び分けは以下の通り:

| コマンド                                   | 実行基盤 | 理由                                                   |
| ------------------------------------------ | -------- | ------------------------------------------------------ |
| `wc -l` / `diff` / `bash` / `test`         | bash     | OS 標準、依存なし                                      |
| `node ...generate-index.js`                | node     | deterministic JSON/MD 生成の契約先                     |
| `node ...validate-structure.js`            | node     | skill ディレクトリ構造検証                             |
| `node ...audit-unassigned-tasks.js --json` | node     | 仕様書登録の機械判定                                   |
| `shellcheck`                               | bash     | 推奨項目、欠落時は SKIP                                |
| `pnpm`                                     | pnpm     | 本タスクでは新規 package script を追加しないため未使用 |

### ステップ 10: 判定ルール

| 観点                                | 判定                                              |
| ----------------------------------- | ------------------------------------------------- |
| link check MISSING あり             | MAJOR: Phase 5 / Phase 8 へ差し戻し               |
| mirror parity 差分あり              | MAJOR: sync 再実行 + Phase 5 原因調査             |
| index parity 差分あり               | MAJOR: `generate-index.js` deterministic 性を調査 |
| validate-structure 失敗             | MAJOR: 構造崩れを Phase 5 で修正                  |
| verify スクリプト exit 非 0         | MAJOR                                             |
| line budget 超過（< 100 行）        | MINOR: Phase 8 wording 削減で対応                 |
| line budget 超過（>= 100 行）       | MAJOR: Phase 8 差し戻し                           |
| shellcheck warning                  | MINOR（fix か SKIP 判断を record）                |
| audit-unassigned-tasks unregistered | MAJOR: Phase 12 で docs 配置調整                  |
| 上記すべてクリア                    | PASS: Phase 10 へ                                 |

## 統合テスト連携

- Phase 10 最終レビューへ `outputs/phase-9/command-log.md` と `quality-report.md` を入力する
- Phase 11 手動テスト（NG / OK / pre-push abort 3 シナリオ）の前提条件として「Phase 9 の一括判定コマンドが PASS していること」を明示する

## 多角的チェック観点（AIが判断）

- 批判的思考: command が実測に繋がっているか（ログを残しているか）
- 因果ループ: Phase 8 wording 整理を飛ばすと line budget が超過するループ認識
- 価値提案思考: 品質ゲートが運用コストを過度に増やしていないか（9 コマンドで 1 分以内）
- システム思考: canonical / mirror / index の 3 整合を独立して測れているか

## 成果物

- `outputs/phase-9/quality-report.md`（9 ステップの判定結果サマリ）
- `outputs/phase-9/command-log.md`（一括判定コマンドの実行ログ）
- `outputs/phase-9/mirror-parity-summary.md`（AC-1 の実測エビデンス）

## 完了条件

- [ ] bash script 各 < 80 行（line budget）を実測し記録している
- [ ] link check で全パスが `OK:` となっている
- [ ] `diff -qr .claude/skills .agents/skills` が空出力である
- [ ] `keywords.json` / `topic-map.md` が canonical/mirror で一致している
- [ ] `validate-structure.js` が canonical / mirror の両方で成功している
- [ ] `shellcheck` 実施結果（PASS / warning / SKIP）が記録されている
- [ ] `bash .claude/scripts/verify-skills-parity.sh` が exit 0 を返す
- [ ] `audit-unassigned-tasks.js` で本仕様書が `registered: true` として判定される
- [ ] 一括判定コマンド列の実行ログが `outputs/phase-9/command-log.md` に保存されている

## 次のPhaseへの引き継ぎ

- Phase 10 最終レビュー: 本 Phase の判定結果テーブル（10 ステップ）を AC-1〜AC-9 判定にマッピングする
- Phase 10: MAJOR が 1 件でもあれば Phase 2 または Phase 5 へ戻す判断基準を本 Phase の判定ルールに従って下す
- Phase 11 手動テスト: 本 Phase で PASS したことを前提に、NG / OK / pre-push abort シナリオを実行する
- Phase 13: user 承認前は `blocked` 維持、本 Phase の品質レポートは承認判断の根拠として提示する

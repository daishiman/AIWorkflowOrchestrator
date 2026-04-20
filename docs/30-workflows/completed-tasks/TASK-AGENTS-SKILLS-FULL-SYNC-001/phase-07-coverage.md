# Phase 7: カバレッジ確認

## メタ情報

| 項目      | 値                               |
| --------- | -------------------------------- |
| Phase     | 7                                |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001 |
| 作成日    | 2026-04-19                       |
| 前提Phase | Phase 1 / 2 / 3 / 4 / 5 / 6 完了 |

## 目的

Phase 2 で定義した 5 コンポーネント（C-1〜C-5）それぞれについて、exit code パス（0 / 1 / skip）が Phase 4 + Phase 6 の TC で覆われているかをマトリクスで可視化する。Bash script はユニットテストフレームワーク（vitest）にはかけられないため、**シェルテスト + 手動確認**の混成モデルとし、「どの TC がどの exit code パスを踏むか」を全数走査して gap を残さない。加えて、dependency edge（verify→script 存在、sync→generate-index.js、pre-push→.husky、session-init→既存 hook）のエッジも別途カバレッジ判定する。

## 実行タスク

1. 5 コンポーネント × 各 exit code パス（0 / 1 / skip）のカバレッジマトリクスを作成する
2. dependency edge のカバレッジ確認表を作成する
3. 未カバー領域を特定し、fix-in-wave / follow-up のどちらかに分類する
4. coverage 判定基準（全シナリオ × 全 exit path の実行記録）を明記する

## 参照資料

| 資料名                   | パス                                                                                 | 用途                       |
| ------------------------ | ------------------------------------------------------------------------------------ | -------------------------- |
| Phase 2 設計             | `phase-02-design.md`                                                                 | C-1〜C-5 の exit code 契約 |
| Phase 4 テスト仕様       | `phase-04-test-creation.md`                                                          | TC-4-01〜TC-4-12           |
| Phase 6 テスト拡充       | `phase-06-test-expansion.md`                                                         | TC-6-01〜TC-6-12           |
| conflict-prevent Phase 7 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/phase-07-coverage.md` | coverage 軸の参考          |

### システム仕様（aiworkflow-requirements）

| 参照資料            | パス                                                                 | 内容                                     |
| ------------------- | -------------------------------------------------------------------- | ---------------------------------------- |
| generate-index 契約 | `.claude/skills/aiworkflow-requirements/scripts/generate-index.js`   | deterministic output と `--quiet` フラグ |
| canonical / mirror  | `.claude/skills/aiworkflow-requirements/references/task-workflow.md` | 一方向同期の原則                         |

## コンポーネント × exit code カバレッジマトリクス

| コンポーネント                                     | exit 0 パス                                  | exit 0 対応 TC                                        | exit 1 パス                                                                       | exit 1 対応 TC                     | skip（0）パス                            | skip 対応 TC     |
| -------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------- | ---------------- |
| C-1 `verify-skills-parity.sh`                      | 差分なし                                     | TC-4-02                                               | 差分あり / `MIRROR` 欠損                                                          | TC-4-01, TC-6-03                   | bootstrap 前に両 root 不在               | TC-4-12, TC-6-02 |
| C-2 `sync-skills-mirror.sh`                        | rsync + index 再生成後に parity OK           | TC-4-04, TC-6-12                                      | rsync 後も差分残存 / generate-index エラー / 権限エラー / `--check-only` 差分検出 | TC-4-05, TC-6-01, TC-6-04, TC-6-09 | 両 root 不在                             | —                |
| C-3 `.husky/pre-push`                              | parity OK で push 許可                       | （pre-push の正常通過は `git push --dry-run` で確認） | parity NG で push 中止                                                            | TC-4-03                            | `.husky/pre-push` 未存在のフォールバック | TC-4-08          |
| C-4 `.claude/hooks/session-init.sh` parity warning | parity OK で無出力                           | TC-4-06（timing）                                     | 通常 exit しない（warning のみ）                                                  | —                                  | `CLAUDE_SKIP_HEAVY_HOOKS=1`              | TC-4-07, TC-6-10 |
| C-5 drift 解消（初回 rsync + int-test-skill）      | rsync 完了で int-test-skill が mirror に存在 | TC-4-09                                               | —（初回のみのイベント）                                                           | —                                  | —                                        | —                |

### マトリクス読み方

- **exit 0 / exit 1 の両方に TC が紐づいていれば、そのコンポーネントの exit code パスは full covered**
- C-4 の exit 1 は設計上発生しない（warning のみ blocking ではない）→ **intentionally unreachable** として扱う
- C-5 は初回イベント（Phase 5 ステップ 1）であり、繰り返し実行対象ではない → **one-shot covered**

## Dependency edge カバレッジ

| edge                             | 要件                                                    | カバー手段                                | カバー TC                        |
| -------------------------------- | ------------------------------------------------------- | ----------------------------------------- | -------------------------------- |
| verify → `.claude/scripts/` 存在 | PARITY_SCRIPT が配置されている                          | `test -f` + bash 実行 exit code           | TC-4-11（Red）/ TC-4-02（Green） |
| sync → `generate-index.js`       | canonical 側の generate-index.js が呼び出し可能         | `node ... --quiet` の exit 0              | TC-4-04, TC-6-01                 |
| pre-push → `.husky/`             | husky インストール済みで pre-push hook が追記されている | `test -f .husky/pre-push` + push dry-run  | TC-4-03, TC-4-08                 |
| session-init → 既存 hook         | `merge.ours.driver` 警告の直後に追記されている          | session-init 実行で両方のメッセージが出る | TC-6-08                          |
| sync → rsync コマンド            | rsync が PATH 上で利用可能                              | `which rsync` で存在確認                  | Phase 5 前提チェック             |
| verify → `diff` コマンド         | diff が PATH 上で利用可能                               | `which diff` で存在確認                   | Phase 5 前提チェック             |

### edge カバレッジ判定

- 4 本の主 edge は TC で double-covered（正常 + 失敗 / skip）
- rsync / diff コマンドの存在は Phase 5 の前提条件で担保（macOS / Linux 標準）
- node の存在は Phase 5 前提（`.claude/scripts/` 配下の既存スクリプト群と同一前提）

## 未カバー領域とその扱い

| 領域                                          | カバー不能の理由                                               | 扱い                                                           |
| --------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| C-2 同時実行の勝敗                            | 非決定的（OS スケジューラ依存）                                | Phase 6 TC-6-11 で「最終 parity OK」のみ保証。カバレッジ対象外 |
| pre-push の正常通過経路（exit 0）             | dry-run でも実リモートとの疎通が絡むため CI で不安定           | Phase 11 手動再現で記録。自動テスト対象外                      |
| 他 worktree からの同時 push                   | 複数 worktree セットアップが必要                               | Phase 6 の注記で説明し、検証は follow-up                       |
| C-4 の warning メッセージ本文の snapshot 比較 | 既存 session-init の warning 群が将来増減すると false positive | 本 wave では grep で "NG" の有無のみ確認                       |
| `generate-index.js` 自体のユニットテスト      | 本タスクの責務外（canonical 側スクリプトの契約テスト）         | 隣接タスク（TASK-CONFLICT-PREVENT-001 の Phase 9）に委譲       |

### 判定

- 未カバー 5 領域はすべて「fix-in-wave で閉じない合理的理由あり」
- follow-up 対象として Phase 12 の未タスク検出にも転記する
- 本 wave の「coverage 100%」判定は **決定的に検証可能なパス**に限定して行う

## Coverage 判定基準

| 判定名              | 基準                                                                                                             | 本 wave での充足状況              |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| exit code coverage  | C-1〜C-5 の各 exit code パス（0 / 1 / skip）のうち、発生可能なものすべてに TC がある                             | 充足（上記マトリクス参照）        |
| scenario coverage   | 3 シナリオ（NG / OK / pre-push abort）+ 補助 2（`--check-only` / `CLAUDE_SKIP_HEAVY_HOOKS`）のすべてに TC がある | 充足（TC-4-01〜05 + TC-6-09〜10） |
| edge coverage       | 6 dependency edge のうち 4 が TC で、2 が前提条件で担保                                                          | 充足                              |
| regression coverage | 既存 `.gitattributes` / EVALS.json / post-merge hook / session-init driver 警告が非破壊                          | 充足（TC-6-05〜08）               |
| snapshot coverage   | Phase 1 snapshot vs Phase 5 後 snapshot が「差分 7 → 0」へ収束                                                   | 充足（TC-6-12）                   |

### 総合判定

- 5 判定すべて充足 → **本 wave の coverage は OK**
- 未カバー 5 領域は合理的に除外済み / follow-up 登録済み
- Phase 8 のドキュメント簡潔化へ進行可

## 実行手順

### ステップ 1: カバレッジマトリクスの埋め込み確認

```bash
# Phase 4 / 6 の TC 番号を集計
grep -E "^\| TC-4-[0-9]+" docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-04-test-creation.md \
  | wc -l   # 期待: 12
grep -E "^\| TC-6-[0-9]+" docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-06-test-expansion.md \
  | wc -l   # 期待: 12

# 本 Phase のマトリクスに全 TC が 1 回以上出現することを grep で確認
for tc in TC-4-01 TC-4-02 TC-4-03 TC-4-04 TC-4-05 TC-4-06 TC-4-07 TC-4-08 TC-4-09 TC-4-10 TC-4-11 TC-4-12; do
  grep -q "$tc" docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-07-coverage.md \
    && echo "[OK] $tc referenced" \
    || echo "[GAP] $tc missing"
done
```

### ステップ 2: dependency edge の実機確認

```bash
# 6 edge の前提コマンド存在確認
for cmd in diff rsync node git; do
  which "$cmd" >/dev/null 2>&1 \
    && echo "[OK] $cmd available" \
    || echo "[FAIL] $cmd missing"
done

# hook / script のファイル存在
for path in \
  .claude/scripts/verify-skills-parity.sh \
  .claude/scripts/sync-skills-mirror.sh \
  .husky/pre-push \
  .claude/hooks/session-init.sh \
  .claude/skills/aiworkflow-requirements/scripts/generate-index.js ; do
  test -f "$path" \
    && echo "[OK] $path exists" \
    || echo "[FAIL] $path missing"
done
```

### ステップ 3: 未カバー領域の分類記録

未カバー 5 領域を fix-in-wave / follow-up に分類し、follow-up 対象は Phase 12 の未タスク検出フェーズで `docs/30-workflows/unassigned-task/` に転記する。

| 領域                          | 分類                | 転記先（Phase 12）                                                |
| ----------------------------- | ------------------- | ----------------------------------------------------------------- |
| C-2 同時実行の勝敗            | follow-up（低優先） | `unassigned-task/worktree-parallel-sync-guard-002.md`（新規候補） |
| pre-push 正常通過の CI 化     | follow-up（低優先） | `unassigned-task/ci-skills-parity-check.md`（新規候補）           |
| 複数 worktree 同時 push       | follow-up（低優先） | 上に同じ                                                          |
| session-init warning snapshot | fix-in-wave 不要    | 現状の grep で十分                                                |
| generate-index.js 本体テスト  | 隣接タスク委譲      | TASK-CONFLICT-PREVENT-001 Phase 9 に委譲済み                      |

## 多角的チェック観点（AIが判断）

- MECE: 5 コンポーネント × 3 exit path（0 / 1 / skip）の切り口が重複・欠落なく整理されているか
- 論点思考: 未カバー領域が「なぜ本 wave でカバーしないか」まで言語化されているか
- プラスサム思考: fix-in-wave（コストに見合う）と follow-up（別 wave に送る）の判断基準が明確か
- 批判的思考: 「カバレッジ OK」と主張する根拠が、マトリクス + edge + regression + snapshot の 5 軸で裏付けられているか

## サブタスク管理

| SubTask | 内容                                                                   | 並列性 | 担当 Lane         |
| ------- | ---------------------------------------------------------------------- | ------ | ----------------- |
| ST-7-1  | exit code マトリクス 5×3 の作成                                        | seq    | Lane A（matrix）  |
| ST-7-2  | dependency edge 6 件のカバレッジ表                                     | par    | Lane B（edge）    |
| ST-7-3  | 未カバー 5 領域の分類と follow-up 案                                   | par    | Lane C（gap）     |
| ST-7-4  | 5 判定基準（exit / scenario / edge / regression / snapshot）の総合判定 | seq    | Lane A（verdict） |

## 成果物

- コンポーネント × exit code カバレッジマトリクス（5 行）
- dependency edge カバレッジ表（6 行）
- 未カバー領域分類表（5 行）
- coverage 判定基準表（5 行）と総合判定
- Phase 12 未タスク転記候補リスト（2 件）

## 完了条件

- [ ] C-1〜C-5 × exit 0 / 1 / skip のマトリクスが埋まり、各セルに TC が紐づいている
- [ ] 6 dependency edge のカバレッジ確認表が作成されている
- [ ] 未カバー 5 領域がそれぞれ「fix-in-wave 不要」または「follow-up」に分類されている
- [ ] 5 判定（exit / scenario / edge / regression / snapshot）すべてが充足と判定されている
- [ ] 本 Phase の判定が「Phase 8 進行可」になっている
- [ ] follow-up 候補 2 件（worktree-parallel-sync-guard-002 / ci-skills-parity-check）が Phase 12 向けに記録されている

## 次のPhaseへの引き継ぎ

- Phase 8（ドキュメント簡潔化）では、Phase 4 / 6 / 7 の重複した TC 記述を 1 箇所にまとめる余地がないか検討する
- Phase 9 品質保証では、本 Phase のマトリクスを command suite に落とし、自動走査スクリプトで回帰検知する
- Phase 12 では未カバー領域 follow-up 2 件を `docs/30-workflows/unassigned-task/` に新規登録する

## 統合テスト連携

- Phase 9 は本 Phase の coverage 判定を quality-report の判定根拠に流用する
- Phase 12 は本 Phase の未カバー領域を unassigned-task-detection の候補一覧へ引き継ぐ

# Phase 10: 最終レビュー

## メタ情報

| 項目      | 値                                            |
| --------- | --------------------------------------------- |
| Phase     | 10                                            |
| 機能名    | TASK-AGENTS-SKILLS-FULL-SYNC-001              |
| 作成日    | 2026-04-19                                    |
| 前提Phase | Phase 1〜Phase 9 完了（品質ゲート PASS 必須） |

## 目的

Phase 1 で固定した acceptance criteria AC-1〜AC-9 の達成可否を一つずつ判定し、blocker の有無を最終判断する。4 条件（価値性・実現性・整合性・運用性）で再評価し、Phase 11 手動テストへ進められる状態であることを確認する。Phase 13 は user の明示承認があるまで `blocked` を維持することを再確認する。

## 実行タスク

1. AC-1〜AC-9 を 1 つずつ判定し合否テーブルを作成する
2. blocker 判定（ある場合は記録、なければ「なし」と明記）
3. Phase 1〜Phase 9 の成果物チェックリストを確認する
4. 4 条件（価値性・実現性・整合性・運用性）を最終確認する
5. 残タスク / 未タスク候補（future scope）を列挙する
6. Phase 11 手動テストへの申し送り事項をまとめる
7. Phase 13 が user 承認前は `blocked` 維持されることを再確認する

## 参照資料

| 資料名                    | パス                                                                                     | 用途                            |
| ------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件定義          | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-01-requirements.md`            | AC-1〜AC-9 の原文               |
| Phase 2 設計              | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-02-design.md`                  | C-1〜C-5 コンポーネント契約     |
| Phase 3 設計レビュー      | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-03-design-review.md`           | 設計時の 4 条件判定             |
| Phase 8 リファクタリング  | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-08-refactoring.md`             | 変更内容テーブル / 将来検討項目 |
| Phase 9 品質保証          | `docs/30-workflows/TASK-AGENTS-SKILLS-FULL-SYNC-001/phase-09-quality-assurance.md`       | 実測結果サマリ                  |
| 単一ファイル版仕様書      | `docs/30-workflows/unassigned-task/TASK-AGENTS-SKILLS-FULL-SYNC-001.md`                  | Issue #2278 本文                |
| conflict-prevent Phase 10 | `docs/30-workflows/completed-tasks/conflict-prevent-skills-001/phase-10-final-review.md` | 先行タスクの最終レビュー運用例  |

### システム仕様（aiworkflow-requirements）

| 参照資料                | パス                                                                           | 内容                         |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------- |
| canonical / mirror 原則 | `.claude/skills/aiworkflow-requirements/references/task-workflow.md`           | 本タスクの parity 要件の根拠 |
| task-workflow-completed | `.claude/skills/aiworkflow-requirements/references/task-workflow-completed.md` | 完了タスク扱い時の参照先     |

## 実行手順

### ステップ 1: AC-1〜AC-9 合否判定テーブル

| AC   | 原文（要約）                                                                                 | 判定方式                                                                                                           | 期待結果                | 判定 | 根拠（Phase 参照）                          |
| ---- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ----------------------- | ---- | ------------------------------------------- |
| AC-1 | `diff -qr .claude/skills .agents/skills` が空出力となる（Phase 5 完了時点）                  | Phase 9 ステップ 3 の mirror parity を実測                                                                         | 空出力、exit 0          | TBD  | Phase 9 `quality-report.md`                 |
| AC-2 | `verify-skills-parity.sh` が差分あり時 exit 1、なし時 exit 0 を deterministic に返す         | Phase 9 ステップ 7 の exit code 実測 + Phase 11 シナリオ 1/2 再現                                                  | exit 0 / 1 が切り替わる | TBD  | Phase 9 実測 + Phase 11 申し送り            |
| AC-3 | `sync-skills-mirror.sh` が rsync → generate-index → diff -qr の 3 ステップで完結する         | Phase 5 実装ログと Phase 9 の index parity を照合                                                                  | 1 コマンドで parity OK  | TBD  | Phase 5 / Phase 9 ステップ 4                |
| AC-4 | pre-push hook が parity NG 時に push を中止し、`--no-verify` 回避導線を設けない              | Phase 5 実装した `.husky/pre-push` のレビュー + Phase 11 シナリオ 3（disposable remote への push abort）の申し送り | push が exit 1 で中止   | TBD  | Phase 5 / Phase 8 / Phase 11 申し送り       |
| AC-5 | `int-test-skill` が `.agents/skills/int-test-skill/` 配下に SKILL.md ごと同期されている      | `test -e .agents/skills/int-test-skill/SKILL.md`                                                                   | ファイル存在            | TBD  | Phase 9 ステップ 2 link check               |
| AC-6 | session-init.sh の parity warning が `diff -qr` を 1 秒未満 / `CLAUDE_SKIP_HEAVY_HOOKS=1` 可 | Phase 11 手動テストで timing 計測 + env var スキップ確認                                                           | 1 秒未満 / スキップ可   | TBD  | Phase 11 申し送り（timing 計測は Phase 11） |
| AC-7 | `.gitattributes` の merge policy を本タスクで変更しない                                      | Phase 8 非スコープ明文化 + `git diff` で `.gitattributes` に変更が無いこと                                         | 変更なし                | TBD  | Phase 8 / git diff                          |
| AC-8 | 本仕様書の Phase 13 は user 明示承認があるまで `blocked` を維持する                          | Phase 13 仕様書（本タスク外で作成）の初期状態を確認、本 Phase では「blocked 維持の再確認」を記録                   | Phase 13 = blocked      | TBD  | 本 Phase ステップ 7                         |
| AC-9 | EVALS.json の schema を本タスクで変更しない                                                  | Phase 8 非スコープ明文化 + `git diff` で `EVALS.json` schema に変更が無いこと                                      | schema 変更なし         | TBD  | Phase 8 / git diff                          |

注: TBD は Phase 10 実行時に実測で PASS / MAJOR / MINOR に更新する。Phase 9 の PASS が前提。

### ステップ 2: blocker 判定

| カテゴリ              | 判定方針                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| MAJOR（blocker）      | Phase 9 品質保証のいずれかが MAJOR、または AC-1〜AC-9 に 1 件でも FAIL がある場合                                                            |
| MINOR                 | wording / path 名 / コメントの軽微な修正のみ                                                                                                 |
| PASS                  | Phase 11 手動テスト + Phase 12 documentation + Phase 13 PR 準備へ進める                                                                      |
| **本 Phase での記録** | blocker がある場合は `outputs/phase-10/blocker-disposition.md` に列挙し戻り先（Phase 2 / 5 / 8）を指定。無い場合は「blocker なし」と明記する |

### ステップ 3: Phase 1〜Phase 9 成果物チェックリスト

| Phase | 主成果物                                                                                  | 確認方法                                      |
| ----- | ----------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1     | AC-1〜AC-9 / inventory 7 件 / 差し込み点 5 箇所                                           | Phase 1 仕様書存在 + AC 9 件記載              |
| 2     | C-1〜C-5 コンポーネント契約 / データフロー / エッジケース 6 件                            | Phase 2 仕様書存在 + コンポーネント 5 件記載  |
| 3     | AC ↔ コンポーネント トレーサビリティ / 4 条件判定 / 残リスク 5 件                         | Phase 3 仕様書存在 + 判定サマリ               |
| 4     | テスト観点（NG / OK / pre-push abort / skill 追加 / timing 計測 / husky 非存在 fallback） | Phase 4 仕様書存在（本タスク外で作成）        |
| 5     | 2 スクリプト配置 / 2 hook 追記 / drift 解消 7 件 / `int-test-skill` 初回同期              | Phase 9 link check OK + mirror parity 空出力  |
| 6     | mirror-only / generate-index エラー時の再現テスト                                         | Phase 6 仕様書存在（本タスク外で作成）        |
| 7     | 5 コンポーネント × exit code カバレッジ                                                   | Phase 7 仕様書存在（本タスク外で作成）        |
| 8     | 変更内容テーブル / 将来検討 3 項目 / CANONICAL / MIRROR 変数名統一                        | Phase 8 仕様書存在 + リファクタ完了           |
| 9     | quality-report / command-log / mirror-parity-summary                                      | Phase 9 仕様書存在 + 一括判定コマンド実行ログ |

### ステップ 4: 4 条件の最終確認

| 条件   | Phase 3 時点の判定 | Phase 10 での再評価                                                                                                | 最終判定 |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------ | -------- |
| 価値性 | OK                 | 「手 rsync 忘れ」の根本原因を hook と CI で自動化することが Phase 9 で実測 PASS されているか                       | TBD      |
| 実現性 | OK                 | 既存ツール（diff / rsync / generate-index.js）のみで Phase 5 実装が完了し Phase 9 PASS か                          | TBD      |
| 整合性 | OK                 | `.gitattributes` / EVALS.json 非変更、`post-merge-index-regenerate.sh` 非改変が git diff で確認できるか            | TBD      |
| 運用性 | OK                 | pre-push blocking + session-init warning の 2 段構成、`CLAUDE_SKIP_HEAVY_HOOKS=1` opt-out が Phase 11 で確認可能か | TBD      |

判定基準: Phase 9 PASS + blocker なし → 4 条件すべて OK に確定。いずれか MAJOR → 当該条件を NG として Phase 2 へ戻す。

### ステップ 5: 残タスク / 未タスク候補（future scope）

| 項目                                                               | 起票タイミング                                          | 関連タスク                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------- | -------------------------------------------- |
| `post-merge-index-regenerate.sh` と `sync-skills-mirror.sh` の統合 | 本タスク完了 + 1 wave 運用後に drift 再発頻度を見て判断 | （未起票）                                   |
| `.claude/scripts/lib/` 的な共通 bash ライブラリ導入                | スクリプト 3 本以上かつ重複 30 行超になった時           | （未起票）                                   |
| GitHub Actions 側での parity check（pre-push の fallback）         | task-p0-05-mirror-sync-automation の実装時              | task-p0-05-mirror-sync-automation            |
| manual canonical docs の same-wave closure                         | 並行タスク                                              | task-imp-aiworkflow-same-wave-sync-guard-001 |
| mirror-only ファイルの自動検出 & 削除前 dry-run report             | 本タスク完了 + mirror-only 実績が出た時                 | （未起票）                                   |

### ステップ 6: Phase 11 手動テストへの申し送り事項

| 項目                                            | 要求                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| シナリオ 1: parity NG 検出                      | `echo "dummy" >> .claude/skills/aiworkflow-requirements/LOGS.md` で drift を作り、verify が exit 1                   |
| シナリオ 2: sync による修復                     | `bash .claude/scripts/sync-skills-mirror.sh` 後に verify が exit 0 を返す                                            |
| シナリオ 3: pre-push abort                      | drift を commit した状態で disposable local bare remote へ `git push` を試み、`.husky/pre-push` が exit 1 で中止する |
| シナリオ 4: `int-test-skill` の mirror 存在確認 | `ls .agents/skills/int-test-skill/SKILL.md` でファイル存在を目視                                                     |
| timing 計測                                     | `time bash .claude/scripts/verify-skills-parity.sh` が 1 秒未満（AC-6）                                              |
| `CLAUDE_SKIP_HEAVY_HOOKS=1` opt-out             | 環境変数設定時に session-init の parity check がスキップされる                                                       |
| husky 非導入環境での fallback                   | `.husky/` が存在しない場合でもスクリプト本体は独立で動作する                                                         |
| 前提                                            | Phase 9 一括判定コマンドが PASS している状態で開始する                                                               |

### ステップ 7: Phase 13 の blocked 維持再確認

- **AC-8 の要求**: 本仕様書の Phase 13 は user の明示承認があるまで `blocked` を維持する
- Phase 10 の責務: 最終レビュー PASS 後も Phase 13 を自動的に実行しない。Phase 11 手動テスト + Phase 12 documentation を経て、user 承認を取得してから Phase 13 を `unblocked` に遷移させる
- **本 Phase での扱い**: Phase 13 仕様書（本タスク外で作成される）の初期状態が `blocked` であること、およびその解除条件が user 承認であることを明文化する
- project remote への push / PR 作成は Phase 13 解除後のみ。本 Phase を含む Phase 1〜12 では project remote への push / PR を行わない。Phase 11 の hook 検証で使う disposable local bare remote はテスト evidence としてのみ許可する

### ステップ 8: レビュー判定

| 結論                  | 次 Phase                                                           |
| --------------------- | ------------------------------------------------------------------ |
| PASS（blocker なし）  | Phase 11（手動テスト / ウォークスルー）へ進む                      |
| MINOR（wording のみ） | 本 Phase 内で修正 → 再判定 → Phase 11 へ                           |
| MAJOR（blocker あり） | `outputs/phase-10/blocker-disposition.md` に戻り先を明記し差し戻し |

## 多角的チェック観点（AIが判断）

- 論点思考: 判定と根拠が 1:1 で対応しているか（AC ごとに Phase 参照が明示されているか）
- プラスサム思考: future scope 化したことで本 wave の品質が上がっているか
- ダブルループ思考: 受入基準そのものに誤りがないか、設計レビュー時と比較して見直したか
- 批判的思考: Phase 9 PASS を前提とした判定が、実測抜きの思い込みになっていないか
- why 思考: Phase 13 を blocked 維持する本質的な理由（user の意思決定を奪わない）が保持されているか

## 成果物

- `outputs/phase-10/final-review-result.md`（AC-1〜AC-9 判定テーブル + 4 条件最終判定）
- `outputs/phase-10/blocker-disposition.md`（blocker の有無と戻り先。無い場合は「blocker なし」と明記）
- `outputs/phase-10/review-prompt.txt`（user 向けの Phase 11 進行可否確認プロンプト）

## 完了条件

- [ ] AC-1〜AC-9 の判定テーブルが全行埋まっている（TBD が残っていない）
- [ ] blocker の有無が `blocker-disposition.md` に明記されている
- [ ] Phase 1〜Phase 9 の成果物チェックリストが全て確認済み
- [ ] 4 条件（価値性・実現性・整合性・運用性）すべての最終判定が記録されている
- [ ] 残タスク / future scope が列挙されている
- [ ] Phase 11 手動テストへの申し送り事項（4 シナリオ + timing + opt-out + fallback + 前提）が明記されている
- [ ] Phase 13 が user 承認前は `blocked` 維持されることが再確認されている
- [ ] 本 Phase 実施中に commit / push / PR を一切行っていない

## 次のPhaseへの引き継ぎ

- Phase 11 手動テスト: 申し送り事項の 4 シナリオ + timing + opt-out + fallback を実行し、エビデンスを記録する
- Phase 12 documentation: Part 1（中学生レベル）で「なぜ canonical と mirror を完全一致させる必要があるか」を説明、Part 2（開発者向け）でスクリプト 2 本と hook 2 箇所の使い方を説明する
- Phase 13 PR 作成: user の明示承認が得られるまで `blocked` を維持。承認後に本タスクの PR を作成する
- Issue #2278: Phase 11〜Phase 13 の進行状況を Issue 本文のチェックリストに反映する（Phase 12 documentation 時に実施）

## 統合テスト連携

- Phase 11 は本 Phase の AC 判定表を manual evidence の確認観点として再利用する
- Phase 12 は本 Phase の blocker 判定と future scope を documentation close-out と未タスク検出へ引き渡す

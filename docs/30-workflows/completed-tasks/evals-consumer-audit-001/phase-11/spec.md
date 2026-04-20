# Phase 11: 監査結果の再現検証 - タスク仕様書

## メタ情報

| 項目                | 内容                                         |
| ------------------- | -------------------------------------------- |
| タスクID            | TASK-EVALS-CONSUMER-AUDIT-001                |
| Phase               | 11                                           |
| Phase名             | 監査結果の再現検証（NON_VISUAL / docs-only） |
| 前提Phase           | Phase 10                                     |
| 後続Phase           | Phase 12                                     |
| ステータス          | 完了（成果物作成済み）                       |
| 作成日              | 2026-04-19                                   |
| 機能名              | evals-consumer-audit                         |
| taskType            | NON_VISUAL / 監査タスク（コード実装なし）    |
| implementation_mode | verify_existing                              |
| primary evidence    | `outputs/phase-11/manual-test-result.md`     |
| issue_number        | 2279                                         |
| issue_status        | CLOSED（仕様書のみ作成方針）                 |

---

## 1. 目的（Why）

Phase 4〜10 で確定した監査成果物を、第三者が同一コマンド列で再実行して同じ結論へ到達できることを検証する。  
本 Phase は `task-specification-creator` の docs-only / NON_VISUAL ルールに従い、**`manual-test-result.md` を一次証跡の正本**として扱う。

固定方針:

- `UI/UX 変更なしのため Phase 11 スクリーンショット不要`
- 本 Phase は NON_VISUAL 監査タスクのため、証跡は再現コマンド実行ログと差分確認で残す

---

## 2. 入力（前Phase成果物・参照資料）

### 2.1 前Phase成果物

| 成果物                                     | 役割                                 |
| ------------------------------------------ | ------------------------------------ |
| `outputs/phase-5/consumer-audit-report.md` | 再現対象 1: consumer 一覧            |
| `outputs/phase-5/evals-field-map.md`       | 再現対象 2: field map                |
| `outputs/phase-6/dual-root-parity.md`      | 再現対象 3: dual root 差分表         |
| `outputs/phase-7/coverage-recheck.md`      | 再現対象 4: 漏れ再検索の結論         |
| `outputs/phase-8/schema-change-guide.md`   | 再現対象 5: 変更手順ガイド           |
| `outputs/phase-10/ac6-release-verdict.md`  | AC-6 判定の再現性確認対象            |
| `outputs/phase-10/final-review-log.md`     | Phase 10 指摘の追跡対象              |
| `outputs/phase-4/raw-*.txt`                | 再実行差分比較の一次スナップショット |

### 2.2 参照資料

| 資料                                                                                    | 用途                                |
| --------------------------------------------------------------------------------------- | ----------------------------------- |
| `.claude/skills/task-specification-creator/references/phase-template-phase11.md`        | Phase 11 テンプレ準拠               |
| `.claude/skills/task-specification-creator/references/phase-11-guide.md`                | docs-only / NON_VISUAL の実行ガイド |
| `.claude/skills/task-specification-creator/references/phase-11-test-report-template.md` | `manual-test-result.md` の構成基準  |
| `docs/30-workflows/evals-consumer-audit-001/design-docs/phase-3-phase-design.md`        | Phase 11 責務定義                   |

---

## 3. 実行手順

### Step 0: 事前チェック

1. `git status` で、監査対象の途中変更が混入していないことを確認する。
2. Phase 5 / 6 / 7 / 8 / 10 の成果物が存在することを確認する。
3. `rg --version`、`diff --version`、`node --version` を記録する。
4. `.claude/skills/` と `.agents/skills/` の両 root が参照可能であることを確認する。

### Step 1: 再現ケースを定義する

`outputs/phase-11/manual-test-result.md` に、少なくとも以下の再現ケースを記録する。

| RC-ID | 検証内容                                     | 期待値                                    |
| ----- | -------------------------------------------- | ----------------------------------------- |
| RC-1  | `EVALS.json` ファイル全列挙の再実行          | Phase 4 `raw-find-evals.txt` と同一集合   |
| RC-2  | code / script / test / docs 参照検索の再実行 | Phase 4 `raw-grep-*.txt` と同一集合       |
| RC-3  | 動的パス生成 consumer 再検索                 | Phase 4 `raw-grep-dynamic.txt` と同一集合 |
| RC-4  | dual root diff の再実行                      | Phase 6 判定と同一                        |
| RC-5  | 漏れ再検索と未記載 0 件の再確認              | Phase 7 結論と同一                        |

### Step 2: 再実行ログを保存する

各 RC について次を `outputs/phase-11/logs/` に保存する。

- コマンド文字列
- stdout / stderr
- 終了コード
- 前段成果物との diff

命名規約: `rc-{RC-ID}-{short-desc}.log`

### Step 3: `manual-test-result.md` を作成する

docs-only / NON_VISUAL の正本証跡として、以下を 1 ファイルに集約する。

1. テスト件数サマリー
2. RC-1〜RC-5 の結果表
3. edge case 一覧表
4. 仕様判断根拠
5. 実行記録
6. FAIL があれば原因と戻し先 Phase

### Step 4: 補助成果物を作成する

- `reproduction-verification.md`: RC ごとの詳細差分まとめ
- `manual-test-checklist.md`: 1 枚サマリー
- `discovered-issues.md`: Blocker / Note / Info の分類

ただし、判定の一次ソースは常に `manual-test-result.md` とする。

### Step 5: Phase 12 への引き継ぎを明記する

以下を `manual-test-result.md` 末尾へ記載する。

- RC 全件 PASS / FAIL
- AC-6 判定の再現性コメント
- Phase 12 で参照すべきログと発見事項

---

## 4. 成果物（パス・フォーマット・スキーマ）

| 成果物名                 | パス                                            | 必須 | 説明                                       |
| ------------------------ | ----------------------------------------------- | ---- | ------------------------------------------ |
| 手動テスト結果（正本）   | `outputs/phase-11/manual-test-result.md`        | ✅   | docs-only / NON_VISUAL の primary evidence |
| 再現検証詳細             | `outputs/phase-11/reproduction-verification.md` | ✅   | RC ごとの詳細差分と補足                    |
| 手動テストチェックリスト | `outputs/phase-11/manual-test-checklist.md`     | ✅   | 1 枚サマリー                               |
| 発見事項                 | `outputs/phase-11/discovered-issues.md`         | ✅   | Blocker / Note / Info                      |
| 再実行ログ               | `outputs/phase-11/logs/rc-*.log`                | ✅   | 再実行証跡                                 |

### 4.1 `manual-test-result.md` 必須セクション

```md
# Phase 11 Manual Test Result

## メタ情報

## 1. テスト対象と方針

## 2. 実施環境

## 3. テスト件数サマリー

## 4. RC-1〜RC-5 実行結果

## 5. edge case 一覧表

## 6. 仕様判断根拠

## 7. 発見事項サマリー

## 8. Phase 12 への引き継ぎ
```

---

## 5. 完了条件チェックリスト

- [ ] `outputs/phase-11/manual-test-result.md` が作成されている
- [ ] `manual-test-result.md` に `UI/UX 変更なしのため Phase 11 スクリーンショット不要` が明記されている
- [ ] RC-1〜RC-5 の結果が `manual-test-result.md` に集約されている
- [ ] `manual-test-checklist.md` と `discovered-issues.md` は補助成果物として整合している
- [ ] `outputs/phase-11/logs/` に RC ごとのログが保存されている
- [ ] FAIL がある場合、戻し先 Phase が明記されている
- [ ] screenshots ディレクトリを必須成果物として要求していない

---

## 6. 検証方法

### 6.1 正本証跡の存在確認

```bash
test -f docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-result.md
```

### 6.2 固定フレーズ確認

```bash
rg -n 'UI/UX 変更なしのため Phase 11 スクリーンショット不要' \
  docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-result.md
```

### 6.3 再現ケース件数確認

```bash
rg -n '^\\| RC-' \
  docs/30-workflows/evals-consumer-audit-001/outputs/phase-11/manual-test-result.md
```

---

## 7. リスクと対策

| ID     | リスク                                        | 対策                                        |
| ------ | --------------------------------------------- | ------------------------------------------- |
| P11-R1 | 再実行時点の root 構造が変わり、diff が増える | Step 0 で対象成果物と root 存在を固定       |
| P11-R2 | `manual-test-result.md` 以外に判定根拠が散る  | 一次ソースを `manual-test-result.md` に固定 |
| P11-R3 | docs-only なのに screenshot 前提の記述が残る  | 固定フレーズ確認と screenshot 非要求を明記  |

---

## 8. 前後 Phase との依存

- 前 Phase から受け取るもの: Phase 5 / 6 / 7 / 8 / 10 の成果物
- 後 Phase へ渡すもの: `manual-test-result.md`、`reproduction-verification.md`、`discovered-issues.md`

---

## 統合テスト連携【必須】

| 観点                                                       | 期待値 | ステータス |
| ---------------------------------------------------------- | ------ | ---------- |
| 再現ケース 5 件が `manual-test-result.md` に集約されている | PASS   | pending    |
| screenshots 必須ルールが残っていない                       | PASS   | pending    |
| Phase 12 参照パスが実在する                                | PASS   | pending    |

---

## タスク100%実行確認【必須】

- [ ] Step 0 事前チェック完了
- [ ] Step 1 再現ケース定義完了
- [ ] Step 2 再実行ログ保存完了
- [ ] Step 3 `manual-test-result.md` 作成完了
- [ ] Step 4 補助成果物作成完了
- [ ] Step 5 Phase 12 引き継ぎ記載完了

---

## 次Phase

Phase 12 では `manual-test-result.md` を正本証跡として参照し、close-out 6 成果物へ反映する。

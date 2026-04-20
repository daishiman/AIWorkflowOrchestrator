# Phase 10: 最終レビュー

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase      | 10                               |
| タスクID   | TASK-LOGS-ARCHIVE-POLICY-001     |
| 機能名     | LOGS.md アーカイブポリシー詳細化 |
| 前提Phase  | Phase 9                          |
| 後続Phase  | Phase 11                         |
| 作成日     | 2026-04-19                       |
| ステータス | completed                        |

## 本タスクにおける最終レビューの位置づけ

本タスクは **文書作成のみで実装コード変更を伴わない**。そのため、
Phase 10 最終レビューは実装コードの振る舞いレビューではなく、以下の
**文書整合性の最終点検**として実施する。

- Phase 3 設計レビューで挙げられた Findings F-001〜F-005 がすべて解消されていること
- Issue #2282 の要件 7 項目がポリシー文書にトレースできること
- Phase 1〜Phase 9 の全 AC が最終成果物で満たされていること
- `.claude/` と `.agents/` の mirror 対称性が最終成果物で担保されていること
- `topic-map.md` からポリシー文書への参照が正しく追加されていること

## 目的

Phase 5 で執筆し Phase 6〜Phase 8 で検証・調整、Phase 9 で品質保証を通過した
ポリシー文書・mirror 文書・topic-map.md 更新を、Issue #2282 および Phase 1〜Phase 9
の要件に対して最終点検する。Phase 11 の手動読み合わせに進むゲートとして機能する。

## 実行タスク

- Phase 3 Findings F-001〜F-005 の解消確認
- Issue #2282 要件 7 項目のトレーサビリティマトリクス作成と充足確認
- Phase 1〜Phase 9 全 AC の総点検
- mirror 対称性の最終確認（`diff .claude/... .agents/...`）
- topic-map.md 参照追加の最終確認
- 最終レビュー結果の記録（`outputs/phase-10/final-review-result.md`）

## 参照資料

| 資料名                 | パス                                                                       | 用途                      |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------- |
| Issue #2282            | https://github.com/daishiman/AIWorkflowOrchestrator/issues/2282            | 要件原本                  |
| Phase 1 要件           | `docs/30-workflows/logs-archive-policy-001/phase-1-requirements.md`        | AC トレース元             |
| Phase 2 設計           | `docs/30-workflows/logs-archive-policy-001/phase-2-design.md`              | D-1〜D-4 / 不変条件 / AC  |
| Phase 3 設計レビュー   | `docs/30-workflows/logs-archive-policy-001/phase-3-design-review.md`       | F-001〜F-005 Findings     |
| Phase 9 品質保証       | `docs/30-workflows/logs-archive-policy-001/phase-9-quality-assurance.md`   | 品質ゲート通過確認        |
| ポリシー文書（正本）   | `.claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` | 最終確認対象              |
| ポリシー文書（mirror） | `.agents/skills/aiworkflow-requirements/references/logs-archive-policy.md` | mirror 対称性最終確認対象 |
| topic-map.md           | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`              | 参照追加最終確認対象      |

## 統合テスト連携【必須】

| 判定項目            | 基準                                                 | 結果 |
| ------------------- | ---------------------------------------------------- | ---- |
| final-review-result | `outputs/phase-10/final-review-result.md` に集約可能 | PASS |
| mirror / index      | 差分と参照が説明可能                                 | PASS |
| docs-only close-out | Phase 12 へ引き渡し可能                              | PASS |

## 実行手順

### 1. Phase 3 Findings F-001〜F-005 の解消確認

| ID    | 指摘内容                                                                        | 期待される解消状態                                                                                        | 確認コマンド例                                                                                                      |
| ----- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| F-001 | 既存 feb/march 表記と新規 YYYY-MM 数値形式の共存方針を文書化する                | ポリシー文書に「legacy 表記は残置、新規は YYYY-MM 数値形式」の記述あり                                    | `rg -n "legacy\|feb\|march\|YYYY-MM" .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`      |
| F-002 | mirror sync 対象に `references/` が含まれるか実測で証明する                     | ポリシー文書に mirror sync 対象範囲 + 検証手順が記述されている、または Phase 4 テスト結果が参照されている | `rg -n "mirror\|sync\|\.agents" .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`           |
| F-003 | 閾値「月次」の判定タイミング（月初 or 月末）を文書で固定する                    | ポリシー文書に判定タイミング（例: 毎月 1 日 09:00 JST）が明記されている                                   | `rg -n "月初\|月末\|判定タイミング\|毎月" .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md` |
| F-004 | 見直しサイクル 6 か月の次回予定日を文書の最終更新日とセットで記載する           | 最終更新日と次回見直し日（例: 2026-10-19）が冒頭メタ情報にある                                            | `rg -n "最終更新日\|次回見直し" .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`           |
| F-005 | ポリシー違反発生時のエスカレーション先（人 or AI エージェント）を文書に追記する | ポリシー文書に「エスカレーションフロー」セクションが存在し、担当者/エージェント名が明記されている         | `rg -n "エスカレーション\|escalation" .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md`     |

**判定**: 5 項目すべてヒットした上で、内容が Phase 3 で期待された水準を満たすこと。

### 2. Issue #2282 要件 7 項目のトレーサビリティ確認

Issue #2282 本文から以下 7 項目の要件を抽出し、ポリシー文書内の該当セクションにマッピングする。

| 要件 ID | Issue 要件                                                               | ポリシー文書内の該当セクション     | 状態 |
| ------- | ------------------------------------------------------------------------ | ---------------------------------- | ---- |
| REQ-1   | `.claude/skills/*/LOGS.md` / `.agents/skills/*/LOGS.md` の適用範囲を明記 | §1 適用範囲                        | PASS |
| REQ-2   | 行数閾値（300 行）の明記                                                 | §2 アーカイブ閾値                  | PASS |
| REQ-3   | バイトサイズ閾値（30 KB）の明記                                          | §2 アーカイブ閾値                  | PASS |
| REQ-4   | 月次タイミングの明記                                                     | §2 アーカイブ閾値 / 判定タイミング | PASS |
| REQ-5   | archive 先パス規則（`logs-archive-YYYY-MM.md`）の明記                    | §3 archive 先パス規則              | PASS |
| REQ-6   | アーカイブ手順（6 ステップ）の明記                                       | §4 アーカイブ手順                  | PASS |
| REQ-7   | 正本 + mirror 配置と `topic-map.md` 参照の明記                           | §5 運用ルール / §6 参照            | PASS |

**判定コマンド**:

```bash
# 各要件に対応するキーワードが正本・mirror 両方に存在するか確認
for kw in "適用範囲" "300 行" "30 KB" "月次" "logs-archive-YYYY-MM" "手順" "topic-map"; do
  echo "=== $kw ==="
  rg -n "$kw" \
    .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
    .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
done
```

### 3. Phase 1〜Phase 9 全 AC の総点検

| Phase   | AC      | 内容                                                      | 状態 |
| ------- | ------- | --------------------------------------------------------- | ---- |
| Phase 1 | AC-1    | 現行 LOGS.md の計測結果が整理されている                   | PASS |
| Phase 1 | AC-2    | 閾値候補が 3 軸で 2 案以上提示されている                  | PASS |
| Phase 1 | AC-3    | 既存 `logs-archive-*.md` 命名パターンとの整合性確認あり   | PASS |
| Phase 1 | AC-4    | Phase 2 への引き継ぎ事項が明示されている                  | PASS |
| Phase 2 | AC-1    | D-1〜D-4 が Phase 1 計測データを根拠に決定されている      | PASS |
| Phase 2 | AC-2    | ポリシー文書構造が必須 6 セクションを含む                 | PASS |
| Phase 2 | AC-3    | 既存 `logs-archive-*.md` と命名衝突なし                   | PASS |
| Phase 2 | AC-4    | mirror sync 機構の利用方法が具体的に記述されている        | PASS |
| Phase 2 | AC-5    | 不変条件 4 項目がすべて満たされる設計になっている         | PASS |
| Phase 3 | Finding | F-001〜F-005 すべてに対応 Phase が明確                    | PASS |
| Phase 9 | AC-1    | Markdown lint / Prettier check が 0 error                 | PASS |
| Phase 9 | AC-2    | リンク切れチェックで全リンク ALIVE                        | PASS |
| Phase 9 | AC-3    | メタ情報テーブル必須項目が揃っている                      | PASS |
| Phase 9 | AC-4    | 相対パス解決で NOT FOUND ゼロ                             | PASS |
| Phase 9 | AC-5    | 不変条件 I-1〜I-4 の機械的検証が PASS                     | PASS |
| Phase 9 | AC-6    | 品質レポートが `outputs/phase-9/quality-report.md` に保存 | PASS |

### 4. mirror 対称性の最終確認

```bash
# 正本と mirror が完全一致することの最終確認
diff \
  .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
  .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
# 期待: 差分なし（exit code 0）

# 念のため行数・バイトサイズが一致することも確認
wc -l .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
       .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
wc -c .claude/skills/aiworkflow-requirements/references/logs-archive-policy.md \
       .agents/skills/aiworkflow-requirements/references/logs-archive-policy.md
```

### 5. topic-map.md 参照追加の最終確認

```bash
# topic-map.md にポリシー文書への参照エントリが追加されているか
rg -n "logs-archive-policy" \
  .claude/skills/aiworkflow-requirements/indexes/topic-map.md
# 期待: 1 行以上ヒット

# mirror 側 topic-map.md（存在する場合）
if [ -f .agents/skills/aiworkflow-requirements/indexes/topic-map.md ]; then
  diff \
    .claude/skills/aiworkflow-requirements/indexes/topic-map.md \
    .agents/skills/aiworkflow-requirements/indexes/topic-map.md
fi
```

### 6. ゲート判定

| 判定      | 基準                                                                                                    | 条件              |
| --------- | ------------------------------------------------------------------------------------------------------- | ----------------- |
| **PASS**  | F-001〜F-005 解消 + REQ-1〜REQ-7 トレース成立 + 全 AC 充足 + mirror 差分ゼロ + topic-map 参照追加確認済 | Phase 11 へ進む   |
| **MAJOR** | 上記のいずれかが未充足                                                                                  | 該当 Phase へ戻る |

**戻り先の判定**:

- F-001〜F-005 の文書反映漏れ → Phase 5
- REQ-1〜REQ-7 のいずれかが文書に存在しない → Phase 5
- mirror 対称性の差分 → Phase 7（mirror 同期）
- topic-map.md 参照漏れ → Phase 5
- 品質ゲート未達 → Phase 9

## 受け入れ基準（AC）

| ID   | 受け入れ基準                                                                  | 検証方法                             |
| ---- | ----------------------------------------------------------------------------- | ------------------------------------ |
| AC-1 | Phase 3 Findings F-001〜F-005 がすべてポリシー文書に反映されている            | 手順 1 の `rg` 出力                  |
| AC-2 | Issue #2282 要件 7 項目（REQ-1〜REQ-7）がポリシー文書にトレース可能である     | 手順 2 のトレース表が全 PASS         |
| AC-3 | Phase 1〜Phase 9 の全 AC が充足されている                                     | 手順 3 の総点検表が全 pending → PASS |
| AC-4 | 正本と mirror の `diff` が差分ゼロ                                            | 手順 4 の `diff` 出力                |
| AC-5 | `topic-map.md` にポリシー文書への参照が追加されている                         | 手順 5 の `rg` 出力                  |
| AC-6 | 最終レビュー結果が `outputs/phase-10/final-review-result.md` に記録されている | ファイル存在確認                     |

## スコープ

### 含むもの

- Findings / 要件 / AC のトレーサビリティ最終点検
- mirror 対称性の最終確認
- topic-map.md 参照追加の最終確認
- ゲート判定（PASS / MAJOR）の記録

### 含まないもの

- 実装コードの振る舞いレビュー（本タスクはコード変更なし）
- 手動読み合わせ（Phase 11 で実施）
- 文書内容の再執筆（必要な場合 Phase 5 へ戻る）

## リスクと対策

| リスク                                | 影響度 | 対策                                                                           |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| F-001〜F-005 の解消判定が主観的になる | 中     | 手順 1 に確認コマンド例を明記し、キーワードヒット + 内容確認の 2 段階で判定    |
| Issue #2282 要件の抽出漏れ            | 中     | REQ-1〜REQ-7 をトレース表で明示し、Issue 本文と照合する                        |
| mirror 対称性が CRLF 差分で誤検出     | 低     | Phase 9 で Prettier フォーマット統一済み、`diff` 差分は Phase 7 同期手順で解消 |
| topic-map.md の mirror 側が未同期     | 低     | 手順 5 の diff ブロックで両 mirror の一致を確認                                |

## 多角的チェック観点

| 観点             | チェック内容                                        |
| ---------------- | --------------------------------------------------- |
| 最終判定         | PASS / MINOR / MAJOR / BLOCKED のいずれかを選べるか |
| blocked 運用     | Phase 13 を先走って実行しない前提が保てるか         |
| docs-only 妥当性 | close-out が過剰実装要求へ逸脱していないか          |

## サブタスク管理

- [ ] Findings 解消確認
- [ ] Issue 7 項目トレース
- [ ] final-review-result 出力方針の固定

## 次Phaseへの引き継ぎ

### Phase 11（手動テスト）に引き継ぐ事項

- 最終レビュー結果（`outputs/phase-10/final-review-result.md`）
- F-001〜F-005 の解消記録（エスカレーションフロー・legacy 共存方針等の読み合わせ対象）
- mirror 対称性の最終 `diff` 結果（Phase 11 で別 worktree 検証の根拠）
- Issue #2282 要件トレース表（手動読み合わせの照合軸）

### 未解決事項

- なし（全 PASS が Phase 10 の完了条件）。PASS しない場合は該当 Phase へ戻る。

## 成果物

| 成果物           | パス                                      | 説明                                           |
| ---------------- | ----------------------------------------- | ---------------------------------------------- |
| 最終レビュー結果 | `outputs/phase-10/final-review-result.md` | Findings 解消 / 要件トレース / AC 総点検の記録 |

## 完了条件

- [ ] F-001〜F-005 の解消がポリシー文書で確認済み
- [ ] Issue #2282 要件 REQ-1〜REQ-7 のトレースが全 PASS
- [ ] Phase 1〜Phase 9 全 AC の総点検が全 PASS
- [ ] 正本 / mirror の `diff` が差分ゼロ
- [ ] `topic-map.md` への参照追加が確認済み
- [ ] ゲート判定が PASS
- [ ] 最終レビュー結果が `outputs/phase-10/final-review-result.md` に記録済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] final-review-result の出力方針を固定した
- [ ] Phase 12 へ持ち込む blocker を明記した

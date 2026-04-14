# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                                                           |
| ---------- | -------------------------------------------------------------- |
| Phase      | 9                                                              |
| タスクID   | UT-SKILL-WIZARD-FB-05-TEST-EVIDENCE-CONSOLIDATION-001          |
| 機能名     | Phase 11 テスト証跡の一本化テンプレート整備（edge case一覧表） |
| 前提Phase  | Phase 8                                                        |
| 後続Phase  | Phase 10                                                       |
| 作成日     | 2026-04-13                                                     |
| ステータス | pending                                                        |

## 目的

Phase 8 でリファクタリングされたテンプレート群が、定義された品質基準を満たしていることを機械的・目視的に確認する。
具体的には line budget（行数の適切さ）・link 整合性・mirror parity（`.claude/` と `.agents/` の同期状態）の3観点で検証する。

## 品質確認項目

### QA-1: Line Budget（行数の適切さ）

| 対象ファイル                      | 上限行数目安 | 確認結果 | 判定      |
| --------------------------------- | ------------ | -------- | --------- |
| manual-test-result-template-v2.md | 150行        | （記入） | PASS/FAIL |
| skill-phase11-template-v2.md      | 100行        | （記入） | PASS/FAIL |

> **判定基準**: 上限を超えた場合は FAIL。超過した場合はセクション分割または内容圧縮を検討する。

### QA-2: Link 確認（参照リンクの整合性）

| リンク元ファイル         | リンク先パス   | 存在確認  | 判定      |
| ------------------------ | -------------- | --------- | --------- |
| （Phase 9 実行時に記入） | （参照先パス） | あり/なし | PASS/FAIL |

確認コマンド例:

```bash
# Markdown内リンクの存在確認
grep -rn '\[.*\](.*\.md)' outputs/phase-8/ | while IFS= read -r line; do
  link=$(echo "$line" | grep -oP '(?<=\().*?(?=\))');
  [ -f "$link" ] || echo "MISSING: $link";
done
```

### QA-3: Mirror Parity（`.claude/` と `.agents/` の同期）

task-specification-creator スキルの Phase 11 テンプレートが `.claude/skills/` と `.agents/skills/` の両方に存在し、内容が一致していることを確認する。

| 確認項目                                          | 期待値          | 実測値   | 判定      |
| ------------------------------------------------- | --------------- | -------- | --------- |
| `.claude/skills/task-specification-creator/` 存在 | あり            | （記入） | PASS/FAIL |
| `.agents/skills/task-specification-creator/` 存在 | あり            | （記入） | PASS/FAIL |
| Phase 11 テンプレート箇所の diff                  | 差分なし（0行） | （記入） | PASS/FAIL |

確認コマンド例:

```bash
diff \
  .claude/skills/task-specification-creator/SKILL.md \
  .agents/skills/task-specification-creator/SKILL.md \
  | wc -l
# 出力が 0 なら PASS
```

### QA-4: テンプレート品質基準確認

| 品質基準                                      | 基準詳細                                           | 確認結果 | 判定      |
| --------------------------------------------- | -------------------------------------------------- | -------- | --------- |
| edge case 一覧表が含まれている（AC-1）        | テーブル形式でedge caseが列挙されている            | （記入） | PASS/FAIL |
| テスト件数集約セクションが1箇所（AC-2）       | 重複なし・1箇所のみ                                | （記入） | PASS/FAIL |
| 仕様判断根拠が明示されている（AC-3）          | 判断根拠カラムまたはセクションが存在する           | （記入） | PASS/FAIL |
| task-specification-creator に反映済み（AC-4） | スキルの Phase 11 テンプレートに新構造が入っている | （記入） | PASS/FAIL |

## 総合判定

| 判定 | 条件                             |
| ---- | -------------------------------- |
| PASS | QA-1〜4 の全項目が PASS          |
| FAIL | QA-1〜4 のいずれか1項目でも FAIL |

> FAIL の場合は Phase 8 に差し戻し、問題箇所を修正してから再実行する。

## 実行タスク

1. 各テンプレートファイルの行数を計測し、line budget を確認する
2. Markdown 内の参照リンクを列挙し、リンク先の存在を確認する
3. `.claude/` と `.agents/` の diff を取得し、mirror parity を確認する
4. AC-1〜4 に対応する品質基準を目視確認する
5. 総合判定を下し、FAIL の場合は差し戻し理由を明記する

## 成果物

| 成果物           | パス                                     | 説明                              |
| ---------------- | ---------------------------------------- | --------------------------------- |
| 品質確認レポート | `outputs/phase-9/qa-report.md`           | QA-1〜4 の全確認結果と総合判定    |
| diff ログ        | `outputs/phase-9/mirror-parity-diff.txt` | `.claude/` vs `.agents/` 差分ログ |

## 完了条件

- [ ] QA-1 line budget 確認完了（全ファイル）
- [ ] QA-2 link 整合性確認完了
- [ ] QA-3 mirror parity 確認完了（差分なし）
- [ ] QA-4 テンプレート品質基準確認完了（AC-1〜4 全件）
- [ ] 総合判定が PASS であること
- [ ] 本 Phase 内の全タスクを 100% 実行完了

## サブタスク管理

1. line budget 確認
2. link 確認
3. mirror parity 確認
4. テンプレート品質基準確認
5. 総合判定と成果物出力

## タスク100%実行確認【必須】

- [ ] 本 Phase 内の全タスクを 100% 実行完了
- [ ] 成果物テーブル記載のファイルを全件生成
- [ ] 矛盾なし・漏れなし・整合あり・依存整合を確認
- [ ] 実行記録を残した

## 次の Phase

Phase 10: 最終レビュー

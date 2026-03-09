# Phase 12 Task 5: スキル改善レポート

## メタ情報

| 項目     | 値                |
| -------- | ----------------- |
| タスクID | TASK-10A-G        |
| Phase    | 12 - ドキュメント |
| 実行日   | 2026-03-09        |

## 改善サマリー

| 観点         | 検出した課題                                              | 改善内容                                                                       |
| ------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 水平思考     | tests-only タスクで screenshot を省略しがち               | user 要求時は UI変更有無に関係なく TC単位 screenshot を必須化                  |
| 垂直思考     | validator 前提の細部（見出し・列名）が漏れやすい          | `phase-11-manual-test` に `テストケース` / `画面カバレッジマトリクス` を標準化 |
| システム思考 | workflow本文・outputs・system spec の三層同期が崩れる     | Step 1-A/1-B/1-C と Step 2 を同時更新する運用を固定                            |
| 逆説思考     | 「非視覚だから screenshot 不要」という前提が破綻          | 再監査時は `NON_VISUAL` 固定を禁止し、証跡昇格を許可                           |
| 論点思考     | blocker と defect の混同                                  | preflight失敗を環境 blocker として分離記録                                     |
| プロセス思考 | screenshot 実体があっても再実行コマンドが無いと属人化する | task単位で `screenshot:<workflow>` を package script として公開する            |

## スキル別フィードバック

### aiworkflow-requirements

1. `quick-reference.md` に TASK-10A-G の検索導線と既存 suite 棚卸し手順を追加する。
2. `resource-map.md` に TASK-10A-G 用参照ルートを追加し、入口選択の迷いを減らす。
3. `task-workflow.md` に TASK-10A-G の完了台帳と検証証跡を追加する。
4. screenshot 再取得コマンドと metadata 証跡の存在を task 台帳に記録する。
5. 継続利用する open backlog も「配置済み」だけでなくテンプレート準拠まで確認する。

### skill-creator

1. Phase 12 パターンに `screenshot:<workflow>` + `phase11-capture-metadata.json` のセット運用を追加する。
2. 既存 open backlog を継続利用する場合でも、旧テンプレートのまま放置しないパターンを追加する。
3. 成功パターンは「存在確認」ではなく「target-file 監査 PASS まで閉じる」形で記録する。

### task-specification-creator

1. `execute-workflow.md` に hardening/spec-only 向けガード（成果物実在確認、no-PR運用）を追加する。
2. Phase 11 の validator 互換フォーマット（`TC-ID + 証跡`）をテンプレート準拠として徹底する。
3. Phase 12 実装ガイドの Part 1/2 必須見出しを先に満たす運用を固定する。
4. Phase 12 Step 1-A 必須要件（`LOGS.md x2 + SKILL.md x2 + topic-map`）を checklist 化して機械検証する。
5. UI screenshot 必須タスクは `apps/desktop/package.json` に `screenshot:<workflow>` を登録し、Phase 11/12 に同じコマンドを転記する。

## 再発防止チェックリスト

- [x] user が screenshot 検証を要求した場合は TC単位証跡を必須にする
- [x] `phase-11-manual-test.md` と `manual-test-result.md` の TC対応を1:1で保持する
- [x] `verify-all-specs` / `validate-phase-output` / `validate-phase11` / `validate-phase12` を同ターンで再実行する
- [x] system spec 更新時は `.claude` と `.agents` の差分ドリフトを同時に是正する
- [x] Step 1-A 必須証跡（LOGS.md/SKILL.md/topic-map）を再監査で固定する
- [x] 継続利用する open backlog は `audit --target-file` で単体合格まで確認する

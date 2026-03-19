# システム仕様更新ワークフロー

> 読み込み条件:
> Phase 12 Task 2 を開始する時。Step 1 と Step 2 を混同しないための index。

## 2種類の更新アクション

| アクション | 必須 | 役割 | 詳細 |
| --- | --- | --- | --- |
| Step 1: 完了記録 | すべての task で必須 | workflow 完了と台帳の同期 | [spec-update-step1-completion.md](spec-update-step1-completion.md) |
| Step 1: 詳細チェックリスト | Step 1 実施時 | Step 1-A〜G の詳細手順 | [spec-update-step1-detailed-checklist.md](spec-update-step1-detailed-checklist.md) |
| Step 1-G: 検証コマンド | Step 1-G 実施時 | 検証コマンド詳細・Warning 3段階分類 | [spec-update-step1-validation-commands.md](spec-update-step1-validation-commands.md) |
| Step 2: domain spec sync | 条件付き | interface / API / architecture 変更の反映 | [spec-update-step2-domain-sync.md](spec-update-step2-domain-sync.md) |
| IPC/型定義 マッピング | Step 2 判断時 | 機能キーワード → 仕様ファイル対応表 | [spec-update-ipc-mapping-guide.md](spec-update-ipc-mapping-guide.md) |
| validation | 完了前に必須 | 4系統の validator と pass 基準 | [spec-update-validation-matrix.md](spec-update-validation-matrix.md) |

## 判断フロー

1. まず Step 1-A〜1-G を完了する。
2. 次に interface、API、state、security、UI contract の変更有無を判定する。
3. Step 2 が不要でも、判断根拠を `documentation-changelog.md` と `system-spec-update-summary.md` に残す。
4. final validation を通してから Phase 12 を閉じる。

## よくある誤判断

| 誤判断 | 正しい扱い |
| --- | --- |
| 「実装ガイドを書いたので Step 1 は完了」 | 実装ガイドは Task 12-1。Step 1 は別物 |
| 「`.agents` を更新したから spec sync も終わった」 | 正本は `.claude`。mirror は代替不可 |
| 「spec_created task なので Step 1-B は不要」 | `spec_created` の記録も Step 1 で残す |
| 「warning だけなら Phase 12 を閉じてよい」 | pass 基準は validator ごとに明文化する |
| 「既存型を再利用しているので更新不要」 | **Step 1-B必須** |
| 「内部実装のみなので更新不要」 | **Step 1-A必須** |
| 「Renderer側で定義済みなので更新不要」 | **Step 2必要** |
| 「未タスク指示書のunassigned-task/配置は見送り」 | **作成が必要** |
| 「task-specification-creator/LOGS.mdは後で更新」 | **Step 1-A必須（2ファイル同時更新）** |
| 「worktree環境なのでStep 1-Aはマージ後でよい」 | **Step 1-A必須** |
| 「mirror sync 完了は summary 記述だけでよい」 | **`diff -qr` の実行結果が必須** |
| 「topic-map.mdは変更なし」 | **セクション更新・削除・行数変更があれば再生成必須** |
| 「スキル改善なし」と判断 | **フィードバック必須（0件でも report 作成）** |

## 参照リソース

| リソース                   | パス                                                                           |
| -------------------------- | ------------------------------------------------------------------------------ |
| 仕様スキル                 | `.claude/skills/aiworkflow-requirements/SKILL.md`                              |
| トピックマップ             | `.claude/skills/aiworkflow-requirements/indexes/topic-map.md`                  |
| 記述ガイドライン           | `.claude/skills/aiworkflow-requirements/references/spec-guidelines.md`         |
| 仕様テンプレート           | `.claude/skills/aiworkflow-requirements/assets/spec-template.md`               |
| ドキュメント更新履歴テンプレート | `.claude/skills/task-specification-creator/assets/documentation-changelog-template.md` |

## 関連ファイル

- [phase-12-documentation-guide.md](phase-12-documentation-guide.md)
- [phase12-checklist-definition.md](phase12-checklist-definition.md)
- [technical-documentation-guide.md](technical-documentation-guide.md)
- [patterns-phase12-sync.md](patterns-phase12-sync.md)

## 変更履歴

| Date | Changes |
| ---- | ------- |
| 2026-03-18 | ファイル分割: step1-detailed-checklist / step1-validation-commands / ipc-mapping-guide を独立ファイルとして分離。本ファイルをインデックスに変換 |
| 2026-03-12 | Step 1 / Step 2 / validation の 3 ファイルへ責務分離 |
| 2026-02-26 | `UT-IMP-SKILL-VALIDATION-GATE-ALIGNMENT-001` 反映 |

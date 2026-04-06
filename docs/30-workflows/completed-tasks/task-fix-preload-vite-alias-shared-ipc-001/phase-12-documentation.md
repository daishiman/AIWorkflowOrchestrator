# Phase 12: ドキュメント close-out

## メタ情報

| 項目   | 値                                         |
| ------ | ------------------------------------------ |
| Phase  | 12                                         |
| 機能名 | TASK-FIX-PRELOAD-VITE-ALIAS-SHARED-IPC-001 |
| 作成日 | 2026-03-31                                 |

## 目的

preload alias 修正の current facts を、workflow 成果物、system spec 正本、skills、follow-up 台帳まで same-wave で同期する。

## 必須成果物

| 成果物               | パス                                                     | 役割                         |
| -------------------- | -------------------------------------------------------- | ---------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`               | Part 1/2 の説明と技術詳細    |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md`         | Step 1-A〜1-C / Step 2 判定  |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`            | changed files と検証結果     |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`          | current 0件 / 完了移管の記録 |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`              | 再発防止の学び               |
| 準拠チェック         | `outputs/phase-12/phase12-task-spec-compliance-check.md` | same-wave sync の最終確認    |

## close-out 方針

- Step 1-A〜1-C は N/A にせず、completed ledger / backlog / lessons / LOGS / SKILL history まで同ターンで閉じる。
- Step 2 は public contract 追加なしのため no-op だが、その理由を成果物へ明記する。
- `UT-DX-VITE-ALIAS-SHARED-IMPORT-001` は同一 wave で解消し、open set から除外したうえで completed 側へ移管する。
- `artifacts.json` と `outputs/artifacts.json` は同一内容で同期し、Phase 11 の `manual-test-checklist.md` を追加する。
- build artifact の監査は `rg -F` / `rg -q` を使い、引用揺れのない evidence に統一する。

## Task 12-1: 実装ガイド作成

- Part 1 に `たとえば` を含む日常アナロジーを入れる。
- Part 2 に型定義、API シグネチャ、使用例、エラーハンドリング、エッジケース、設定一覧を入れる。
- screenshot は N/A。今回タスクは UI/UX 変更を含まない。

## Task 12-2: 仕様更新サマリー

- `task-workflow-completed.md`、`task-workflow-history.md`、`task-workflow-backlog.md`、`lessons-learned-ipc-preload-runtime.md` を更新する。
- `LOGS.md` 2ファイルと `SKILL.md` 2ファイルを同一ターンで更新する。
- `generate-index.js` を実行して topic-map / resource-map / keywords を再生成する。
- `artifacts.json` / `outputs/artifacts.json` を同値化し、Phase 11 `manual-test-checklist.md` を補完する。

## Task 12-3: ドキュメント更新履歴

- `CHANGELOG.md` は root canonical のみを更新対象にする。
- workflow root の status / output path / compliance file 追加を current facts に揃える。
- `.claude` 正本と `.agents` mirror の parity を記録する。

## Task 12-4: 未タスク検出

- `UT-DX-VITE-ALIAS-SHARED-IMPORT-001` を current task へ吸収した事実と、completed 側への移管先を記録する。
- 新規の open unassigned は 0 件で閉じる。

## Task 12-5: スキルフィードバック

- fixed-string evidence は `rg -F` / `rg -q` を優先する。
- branch-level `outputs/` 競合時は workflow spec / artifacts / close-out 文書を同一ターンで current path へ揃える。

## Task 12-6: 準拠チェック

- Task 12-1〜12-5、Step 1-A〜1-C、Step 2 no-op、Phase 11 `NON_VISUAL_FALLBACK` を一箇所で確認する。
- planned wording 残存、artifacts status、system spec sync、mirror parity を同時監査する。

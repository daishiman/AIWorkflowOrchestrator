# スキル改善レポート

## aiworkflow-requirements への改善

- Task03 には既に `Skill Creator 作成・実行・改善統合の引き方` があったが、検索導線だけでは implementation state が追いにくかったため、Task03 専用の feature / navigation / architecture / state / task ledger 同期を追加した
- `SkillLifecycleSessionCard` のような「既存 surface の一次導線化」は、Task10A 系の再利用だけでなく current workflow 側の完成形を system spec に残す方が再利用しやすい
- `2026-03-12` の再監査では user 指定 root が `.claude` だったため、workflow 本文・outputs・system spec を `.claude/skills/...` 正本へ戻し、`.agents` は mirror として同期する方が矛盾が少ないと確認できた

## task-specification-creator への改善

- `complete-phase.js` は workflow `artifacts.json` の `phases` を object map 前提で扱う箇所があり、array-based schema の current workflow では破損要因になり得る
- そのため `references/phase-11-12-guide.md` に、配列スキーマを検出した場合は manual sync と validator 再確認へ切り替える guard を追加した
- `phase12-task-spec-compliance-check.md` を補助成果物に加えると、Task 12-1〜12-5 / Step 1-A〜1-G / Step 2 の準拠漏れを 1 ファイルで再確認できる
- 補助成果物を `artifacts.json` / `phase-12-documentation.md` / `documentation-changelog.md` に登録した場合は、実ファイル存在確認と `outputs/verification-report.md` 再生成までを完了条件に含めるべきだと分かった
- Phase 11 capture を current workflow 用 harness route で固定したことにより、UI 統合タスクでは app shell 全体より dedicated harness を優先する運用が有効だと再確認できた

## 今回の改善

- Phase 11 の代表画面 5 件を current workflow 配下へ保存し、Apple UI/UX 所見まで成果物化した
- Phase 12 では workflow outputs だけでなく、`artifacts.json` / `index.md` / `verification-report.md` / system spec / skill docs / phase12-task-spec-compliance-check を同一ターンで同期した
- session card の stale success message 解消や global error 境界整理のような UI 品質改善も、実装ガイドと lessons の両方へ落とし込んだ

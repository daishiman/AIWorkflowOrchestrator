# TASK-10A-F スキルフィードバックレポート

## メタ情報

| 項目     | 値         |
| -------- | ---------- |
| タスクID | TASK-10A-F |
| Phase    | 12 Task 5  |
| 実施日   | 2026-03-08 |
| モード   | 仕様再監査 |

---

## 1. task-specification-creator 観点

### 有効だった点

- `validate-phase11-screenshot-coverage.js` により、スクリーンショットがあっても `manual-test-result.md` の証跡表がない状態を即座に検知できた
- `validate-phase12-implementation-guide.js` により、Part 1/2 の見出しだけでなく内容不足まで検出できた
- `phase-11-12-guide.md` の current / completed 分離ルールが、今回の 2workflow 監査で有効に機能した

### 改善した点

- `apps/desktop/scripts/capture-skill-create-wizard-screenshots.mjs` に `--output-dir` を追加し、移管前 workflow と completed 正本の両方で再利用可能にした
- wizard 補助キャプチャの error 待機を Store 経由 UI の実文言 `スキル生成に失敗しました` に合わせ、scenario 単位の失敗診断を追加した
- `apps/desktop/scripts/capture-skill-analysis-view-screenshots.mjs` の ready selector を `data-testid` 基準へ寄せ、improved シナリオの flaky wait を解消した
- `task-specification-creator/SKILL.md` に Phase 11/12 補助ガイド 3件の直リンクを実体として追加し、`quick_validate` warning を 3→0 にした
- `task-specification-creator/references/phase-11-12-guide.md` に comparison baseline 正規化ルールを追加し、移管前 workflow だけ通して branch 判定してしまう再発を防ぐようにした
- `task-specification-creator/references/unassigned-task-guidelines.md` に `currentViolations=0` と `baselineViolations>0` の二層報告ルールを追加し、「指定ディレクトリに配置済み」と「ディレクトリ全体の legacy 負債」を分けて報告できるようにした
- `skill-creator/references/patterns.md` に branch 再監査の comparison baseline 正規化パターンを追加し、今回の改善を次回の skill 更新へ再利用可能にした
- `aiworkflow-requirements/SKILL.md` / `task-specification-creator/SKILL.md` / `arch-state-management.md` に残っていた change history / 仕様本文の競合痕跡を除去し、正本性を回復した
- 移管前 workflow だけでなく completed workflow baseline も同ターンで正規化し、2workflow 監査の validator ノイズを解消した

### まだ改善余地がある点

- wizard 補助キャプチャで `TC-01/03/05` を `TC-09/10/11` 名へコピーしているため、将来的には `--scenario` と `--rename-map` を一体化できるとさらに運用が軽くなる

---

## 2. aiworkflow-requirements 観点

### 有効だった点

- `task-workflow.md` が TASK-10A-F の canonical backlog ID を持っていたため、raw ID を open backlog へ誤登録せずに済んだ
- `lessons-learned.md` の既存教訓（文書名ドリフト、証跡未参照化）が移管前 workflow 修正の直接ガイドになった

### 今回追加で固定したい運用

- 移管前 workflow でも `outputs/phase-11` / `outputs/phase-12` は completed workflow 参照だけで済ませず、validator が通る実体を保持してから統合する
- 未タスク指示書は canonical ID と物理ファイル確認まで揃えて初めて「登録済み」とみなす
- 移管前 workflow で実際に再監査した Phase は、`artifacts.json` / `outputs/artifacts.json` / `index.md` まで同期したうえで completed 正本へ統合する

---

## 3. 未タスク / pitfall 運用観点

### 判定

- 新規 pitfall 追加は不要
- open backlog は 5 件で継続管理
- `UT-IMP-TASK10A-F-PHASE11-FILENAME-EVIDENCE-SYNC-GUARD-001` は履歴上の完了済み運用ガードとして扱う

### 補足

- TASK-10A-F 由来 5 文書は親 workflow 配下 `unassigned-task/` への移管とテンプレート準拠を確認できた
- 一方で repo 全体の `docs/30-workflows/unassigned-task/` には legacy 正規化負債が残っていたため、`task-imp-unassigned-task-legacy-normalization-001.md` の自己矛盾（`## メタ情報` 重複）を是正しつつ、directory 全体の完全準拠は別 backlog で追跡する方針を固定した

---

## 総合評価

今回の再確認で、問題は実装本体より移管前 workflow の Phase 11/12 出力ドリフトに集中していた。validator、canonical backlog、2workflow 監査を組み合わせ、完了後は completed 正本へ統合する運用は有効だったため、この3点を今後も再監査の基本セットとして維持する。

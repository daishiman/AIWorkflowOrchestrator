# Phase 12 スキルフィードバック

## task-specification-creator

- `references/phase-11-12-guide.md` に「ユーザー明示の screenshot 要求時は `NON_VISUAL` 単独不可」「ready 判定は loaded-state selector を使う」「light 証跡は theme mock を撮影シナリオへ追従させる」を反映した
- Phase 11 再監査のテンプレートとして、関連UI screenshot と non-visual ledger check を併記するパターンが有効だった
- `validate-phase12-implementation-guide.js` を追加し、Task 12-1 の内容要件を構造チェックから独立して機械検証できるようにした
- `SKILL.md` から未リンクだった `evidence-sync-rules.md` / `phase12-checklist-definition.md` / `screenshot-verification-procedure.md` を参照可能にし、`quick_validate` warning を潰す導線を作った

## aiworkflow-requirements

- `SKILL.md` のベストプラクティスへ「active/completed を同一表で維持しない」を追加した
- `task-workflow.md` / `ui-ux-feature-components.md` / `lessons-learned.md` / `ui-ux-components.md` に SkillAnalysisView 再監査追補を反映し、台帳同期だけでなく UI再監査の教訓も正本へ格納した
- `task-workflow.md` / `lessons-learned.md` に「Phase 12 実装ガイドは理由先行 + 型/API/設定一覧まで満たして初めて完了」の追補を追加した

## skill-creator

- `quick_validate` の warning を単に許容するのではなく、SKILL.md の未リンク reference を解消する更新判断に使う運用が有効だった

# スキルフィードバックレポート（Phase 12 Task 5）

## 対象タスク

- タスクID: TASK-IMP-RUNTIME-POLICY-CAPABILITY-BRIDGE-001
- Phase: 12（ドキュメント）
- 作成日: 2026-03-21

---

## フィードバック一覧

### FB-01: task-specification-creator — index / phase / artifacts / outputs/artifacts の同期ガード強化

**カテゴリ**: task-specification-creator スキル改善

**観察事実**:
workflow root の `index.md` と `phase-1..12` が completed になっていても、`artifacts.json` と `outputs/artifacts.json` の内容がずれると `validate-phase-output` が warning を返した。Phase 本文・台帳・成果物 inventory の parity を同じターンで閉じるルールが不足していた。

**影響**:
Phase 12 完了に見えても artifact inventory が stale のまま残り、completed 判定の信頼性が落ちる。

**改善提案**:
`phase-12-documentation-guide.md` と `spec-update-workflow.md` に「`index.md` / `phase-*.md` / `artifacts.json` / `outputs/artifacts.json` の4点同期」を完了条件として追記する。

---

### FB-02: task-specification-creator — `manual-test-result.md` の `not_run` を completed 扱いしない

**カテゴリ**: task-specification-creator スキル改善

**観察事実**:
Phase 11 / Phase 12 は completed になっている一方で、`manual-test-result.md` の execution status が `not_run` のまま残っていた。Phase status と manual evidence の整合ガードが弱い。

**影響**:
手動テスト未実施のまま completed に見えるため、監査時に false positive を生む。

**改善提案**:
`phase-12-documentation-guide.md` に「`manual-test-result.md` が `not_run` なら Phase 11 / 12 completed として閉じない」を明記し、non-visual fallback の場合も blocker と代替 evidence を必須化する。

---

### FB-03: aiworkflow-requirements / task-specification-creator — internal adapter と public IPC contract を混同しない

**カテゴリ**: cross-skill 仕様改善

**観察事実**:
`creatorHandlers.ts` の internal `creator:*` adapter を実装した結果を、誤って public preload / app registration まで更新済みと読める文面が混入していた。実際の public surface は `registerSkillCreatorHandlers` / `skill-creator:*` のままだった。

**影響**:
system spec が current code より先行し、利用者が public IPC contract を誤認する。

**改善提案**:
`spec-update-workflow.md` に「internal adapter 追加だけでは public IPC / preload 更新済みと記録しない」ルールを追記し、必要時は follow-up formalization を必須化する。

---

## サマリー

| ID    | 対象スキル                 | 改善カテゴリ             | 優先度 |
| ----- | -------------------------- | ------------------------ | ------ |
| FB-01 | task-specification-creator | artifact parity guard    | 高     |
| FB-02 | task-specification-creator | manual evidence guard    | 高     |
| FB-03 | cross-skill                | internal/public 境界整流 | 高     |

今回の 3件はどれも Phase 12 の completed false positive を防ぐためのガードであり、優先度をすべて「高」とした。

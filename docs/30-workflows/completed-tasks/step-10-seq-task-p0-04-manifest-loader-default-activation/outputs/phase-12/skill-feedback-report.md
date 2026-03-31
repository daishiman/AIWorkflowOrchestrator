# Phase 12 成果物: スキルフィードバックレポート

## task-specification-creator スキルへの改善観点

### FB-01: `SkillCreatorSourceResolver` の常時候補パスについての注意

**観察**: `getSkillCreatorRootCandidates()` は `REPO_SKILL_CREATOR_PATH`（`.claude/skills/skill-creator`）を常に候補に含む。この挙動はテスト設計に大きな影響を与えるが、仕様書には記載がなかった。

**提案**: Phase 4 のテスト仕様書に「SkillCreatorSourceResolver を使うテストでは prototype mock が必須」という前提条件を明記すると良い。

### FB-02: microtask flush 依存テストの脆弱性

**観察**: `Promise.resolve()` を n 回フラッシュして非同期フローを待つパターンは、実装変更で簡単に壊れる。

**提案**: フラッシュ依存の代わりに「sendChat が呼ばれるまでポーリング」するヘルパーを共通化することを検討する。

## aiworkflow-requirements スキルへの改善観点

改善点なし。参照した要件仕様は適切に整理されていた。

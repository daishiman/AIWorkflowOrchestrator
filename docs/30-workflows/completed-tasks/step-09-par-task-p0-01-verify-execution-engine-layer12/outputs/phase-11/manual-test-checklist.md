# Phase 11 Manual Test Checklist

## current state

- workflow status: `implemented`
- code implementation: 完了
- manual walkthrough: 実施済み

## 確認結果

- [x] 完全 skill directory で Layer 1/2 の想定結果が返る (TC-11-01)
- [x] `SKILL.md` 欠落 fixture で `L1-001` fail が返る (TC-11-02)
- [x] `agents/` 欠落 fixture で `L1-002` fail が返る (TC-11-02)
- [x] 空ディレクトリで全 Layer 1 error + graceful degradation (TC-11-03)
- [x] `layer` / `severity` / `summary` / `evidenceSummary` の型が保持される (TC-11-04)

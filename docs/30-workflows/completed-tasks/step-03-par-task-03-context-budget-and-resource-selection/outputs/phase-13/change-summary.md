# Change Summary

## この wave で整えた内容

- `apps/desktop/src/main/services/runtime/SkillCreatorSourceResolver.ts` を追加し、`explicit -> env -> home -> repo` 候補列と `structure_mismatch` 検出を実装
- `apps/desktop/src/main/services/runtime/PhaseResourcePlanner.ts` を追加し、resource kind / tier / budget / degrade を分離
- `apps/desktop/src/main/services/runtime/ResolvedResourceReader.ts` を追加し、multi-root でも `ResourceLoader` を leaf reader として再利用できるようにした
- `RuntimeSkillCreatorFacade.plan()` / `improve()` を動的 resource pipeline 対応にし、legacy loader 経路は後方互換のため維持した
- `apps/desktop/src/main/ipc/index.ts` で runtime skill creator の本線 wiring を新 pipeline へ切り替えた
- Task03 向けテストとして source resolver / planner / facade integration の3スイートを追加した

## 未実施

- `esbuild` 依存不整合の解消
- Vitest の再実行
- commit
- PR 作成
- push

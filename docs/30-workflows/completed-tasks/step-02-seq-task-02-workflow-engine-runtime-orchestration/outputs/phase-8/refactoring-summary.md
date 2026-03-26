# Phase 8 Refactoring Summary

## 境界の整理

- engine 固有 state 型は `apps/desktop/src/main/services/runtime/SkillCreatorWorkflowEngine.ts` に閉じ、shared public contract へ漏らしていない。
- facade は state を保持せず、workflow engine への委譲と public response 形成に限定した。
- `ResourceLoader.getBasePath()` は provenance 取得に限定し、resource selection ロジック自体は追加していない。

## Guard

- public IPC channel 名と preload method 名は変更していない。
- `RuntimeSkillCreatorExecuteResponse` の union は shared contract のまま維持している。

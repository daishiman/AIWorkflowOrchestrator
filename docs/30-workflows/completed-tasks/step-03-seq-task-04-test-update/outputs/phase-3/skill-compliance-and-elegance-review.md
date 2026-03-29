# Skill Compliance And Elegance Review

- task-specification-creator 観点:
  - canonical naming を `coverage-check` / `manual-test` / `pr-creation` に統一
  - Phase 12 必須5成果物 + compliance check を追加
  - `artifacts.json` / `outputs/artifacts.json` を同期
- aiworkflow-requirements 観点:
  - current facts を `provider-registry.ts`, `AnthropicAdapter.ts`, `GoogleAdapter.ts` へ寄せた
  - 旧 nested path と非実在 file 参照を除去

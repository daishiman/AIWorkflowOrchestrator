# Phase 6: テスト拡充

## 追加済みテストの確認

### TASK-P0-07 テスト（RuntimeSkillCreatorFacade.plan.test.ts）

新規追加テスト:

- **T-P7-02**: reference エントリが agent 名導出に混入しない → GREEN
- **T-P7-04**: `loadAgent` の呼び出し順が `PLAN_RESOURCE_REQUESTS` の agent id 順と一致 → GREEN

既存テスト（後方互換性）:

- T-P7-01（L86）: agent 3件の loadAgent 呼び出し → GREEN
- T-P7-03（L120）: system プロンプトに agent 内容が含まれる → GREEN

合計: 23/23 PASS

### TASK-SDK-04-U2 テスト（SkillLifecyclePanel.llm-generation.test.tsx）

drift 防止テスト（全て GREEN）:

- U-8b: plan → textarea 変更 → execute で canonical spec 維持 → GREEN
- U-18b: cancel → 再 plan で snapshot 差し替わる → GREEN
- U-19b: 複数回 textarea 編集後も snapshot 固定 → GREEN
- U-20b: cancel で clearGenerationState が呼ばれる → GREEN
- U-21: execute 失敗後も snapshot 保持 → GREEN

Pre-existing failure（2件、今回の変更と無関係）:

- TASK-RT-05 multi_select: `toBeDisabled` / `toBeChecked` matcher 未設定

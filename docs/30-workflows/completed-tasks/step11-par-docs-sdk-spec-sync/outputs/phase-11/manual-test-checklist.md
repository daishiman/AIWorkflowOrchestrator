# Phase 11 成果物: Manual Test Checklist

## 確認対象

| 対象ファイル                              | 観点         | 確認箇所                              |
| ----------------------------------------- | ------------ | ------------------------------------- |
| `task-workflow-completed.md`              | パスの正確性 | TASK-SDK-04 完了記録のパス記述        |
| `architecture-overview-core.md`           | 文脈の自然さ | SkillCreatorWorkflowEngine owner 記述 |
| `arch-electron-services-details-part2.md` | wording      | 実装済みファクトの記述                |
| `api-ipc-system-core.md`                  | API 仕様整合 | workflow engine IPC 完了タスク記述    |

## チェックリスト

### SDK-04 対象: task-workflow-completed.md

- [ ] TASK-SDK-04 完了記録のパスが `docs/30-workflows/completed-tasks/step-03-par-task-04-user-interaction-bridge-and-phase-ui/` を指していること
- [ ] パス形式が前後の文脈（他のタスク完了記録）と同じであること
- [ ] `step-04-par-task-04` や `skill-creator-agent-sdk-lane` 等の stale path が残っていないこと
- [ ] ファイル全体を読んで「作業中」「未確定」の印象を受けないこと

### SDK-02 対象: architecture-overview-core.md

- [ ] `SkillCreatorWorkflowEngine` の記述が現在形で「workflow state owner」として書かれていること
- [ ] 「future」「将来的には」「実装予定」等の表現がないこと
- [ ] 前後の文脈と自然につながっており読んで違和感がないこと

### SDK-02 対象: arch-electron-services-details-part2.md

- [ ] `SkillCreatorWorkflowEngine` 関連の記述が実装前の状態を示していないこと
- [ ] 「廃止予定」の記述がある場合、それはファイル自体の廃止（feature の廃止ではない）であること
- [ ] 現状コードと矛盾する記述がないこと

### SDK-02 対象: api-ipc-system-core.md

- [ ] workflow engine 関連の IPC API 記述が「完了タスク（TASK-SDK-02）」として記録されていること
- [ ] 未実装として記述されているが実際は実装済みのエンドポイントがないこと

### 共通

- [ ] 更新後の文書を読んで「作業中」「未確定」の印象を受けない
- [ ] docs-only であり、コードへの影響を記述していない

### docs-only representative evidence

- [ ] `outputs/phase-11/screenshot-plan.json` が存在し、`captureRequired: false` である
- [ ] `outputs/phase-11/screenshots/placeholder.png` が存在し、非視覚証跡として保持されている

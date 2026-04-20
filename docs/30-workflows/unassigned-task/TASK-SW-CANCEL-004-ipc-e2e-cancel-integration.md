# IPC E2E接続確認（Renderer統合） - skill-creator cancel chain follow-up

## メタ情報

```yaml
issue_number: 2358
```

| 項目       | 内容                                                                                 |
| ---------- | ------------------------------------------------------------------------------------ |
| タスクID   | TASK-SW-CANCEL-004-ipc-e2e-cancel-integration                                        |
| 親タスク   | TASK-SW-CANCEL-004                                                                   |
| 分類       | unassigned / NON_VISUAL follow-up                                                    |
| ステータス | open                                                                                 |
| 発見元     | `docs/30-workflows/p04-seq-CANCEL-004/outputs/phase-12/unassigned-task-detection.md` |
| 更新日     | 2026-04-20                                                                           |

## 背景

`TASK-SW-CANCEL-004` 本体では、`useCancelGeneration.ts` の hook contract、IPC 4層接続、`window.skillCreatorAPI` 未定義時の no-op safety までを close した。実コードと unit test の整合は取れているが、次の3点は別フォローアップとして残す。

1. `SkillCreateWizard` の cancel ボタンから hook 呼び出しまでの UI binding 証跡
2. Renderer → Preload → Main をまたぐ統合 close の証跡
3. `startGeneration()` の consumer を実利用へ接続するか、契約から外すかの整理

## 現在までに確認済みのこと

- `useCancelGeneration.cancelGeneration()` は `abort -> ref clear -> setStage("cancelled") -> IPC await -> catch swallow` の順で実装済み
- `SKILL_CREATOR_CANCEL` は shared / preload / main / renderer の4層で接続済み
- hook 単体テストは 6 ケースで PASS し、IPC reject と API surface 未定義の両方を吸収できる

## 未回収項目

| ID    | 内容                                                                                   | 優先度 |
| ----- | -------------------------------------------------------------------------------------- | ------ |
| UT-01 | `SkillCreateWizard` の cancel UI から IPC 経路までの統合証跡を追加する                 | High   |
| UT-02 | `startGeneration()` の consumer を特定し、利用継続か API 整理かを決める                | High   |
| UT-03 | 必要なら Renderer 統合テストを追加し、hook unit test と chain close を分離して証明する | Medium |

## 完了条件

- [ ] `SkillCreateWizard` 側の cancel 導線を根拠付きで close した
- [ ] `startGeneration()` の扱いを current fact に同期した
- [ ] 統合証跡を追加するか、不要判断の根拠を記録した

## 参照

- `docs/30-workflows/p04-seq-CANCEL-004/index.md`
- `docs/30-workflows/p04-seq-CANCEL-004/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
- `apps/desktop/src/renderer/hooks/useCancelGeneration.ts`

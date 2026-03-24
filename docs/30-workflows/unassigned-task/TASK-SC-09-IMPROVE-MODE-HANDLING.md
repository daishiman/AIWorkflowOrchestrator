# TASK-SC-09: improve モードハンドリング実装

## メタ情報

- 検出元: TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー
- 優先度: Medium
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
  - `apps/desktop/src/preload/skill-creator-api.ts`
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`

## 目的

SkillLifecyclePanel の handlePrepare で detectMode が "improve" を返した場合のハンドリングを実装し、既存スキルの改善フローを正しく動作させる。

## 背景

TASK-SC-06-UI-RUNTIME-CONNECTION の AC-1（planSkill 呼出し）は "plan" モードでのみ動作するように実装された。しかし detectMode は "plan" と "improve" の2つのモードを返す可能性がある。"improve" モードが返された場合、planSkill ではなく improveSkill API を呼ぶ必要があるが、現在の実装ではこのパスが未処理のまま放置されている。ユーザーが既存スキルを改善しようとした場合、意図した動作にならない。

## 実行タスク

- [ ] detectMode の戻り値を調査し、"improve" モードの条件を明確化する
- [ ] handlePrepare 内で "improve" モードの分岐を追加し、improveSkill API を呼出す
- [ ] improveSkill の IPC ハンドラが存在するか確認し、不足していれば追加する
- [ ] "improve" モードの場合の UI 状態遷移（generationStep, generationProgress 等）を定義する
- [ ] "improve" モードのユニットテストを追加する
- [ ] "plan" モードと "improve" モードの統合テストを追加する

## 完了条件

- [ ] detectMode が "improve" を返した場合に improveSkill API が呼ばれること
- [ ] "improve" モードで generationStep/generationProgress が適切に遷移すること
- [ ] "plan" モードの既存動作に影響がないこと（回帰テスト PASS）
- [ ] TypeScript 型チェック PASS
- [ ] 関連テスト全件 PASS

## 苦戦箇所（TASK-SC-06 実装知見）

| 苦戦箇所                                    | 問題                                                                                                                                                                           | 解決策                                                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| detectMode の戻り値パターン拡大             | detectMode は "plan" 以外のモード（"improve" 含む）を返す可能性があるが、TASK-SC-06 では "plan" のみ処理した。他モードの分岐が未実装でも既存動作に影響しない（フォールバック） | 新モード追加時は handlePrepare の if/else 分岐を追加し、該当 API の存在チェック（`skillCreatorApi.improveSkill`）を必ず行う |
| SkillCreatorRuntimeApi の optional メソッド | ローカル型で全メソッドが `?` (optional) のため、null チェック漏れがコンパイル時に検出されない                                                                                  | API メソッドの存在チェック後に early return し、Graceful Degradation パターン（P65/S30）に従う                              |

## 参照

- TASK-SC-06-UI-RUNTIME-CONNECTION Phase 10 レビュー（U-1）
- UT-SC-05-APPLY-IMPROVEMENT-UI（関連する改善 UI の未タスク）

# TASK-SC-15: Store 競合防止 UI 制御

## メタ情報

- 検出元: TASK-SC-07-SKILL-CREATE-WIZARD-LLM-CONNECTION Phase 12 レビュー
- 優先度: Low
- GitHub Issue: #1600
- 関連ファイル:
  - `apps/desktop/src/renderer/components/skill/SkillCreateWizard.tsx`
  - `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
  - `apps/desktop/src/renderer/store/slices/agentSlice.ts`

## 目的

SkillCreateWizard と SkillLifecyclePanel が同一 agentSlice の generationState を共有する際の競合を防止する UI ガードを実装する。

## 背景

TASK-SC-07 で SkillCreateWizard に LLM 生成フローを接続した結果、SkillLifecyclePanel（TASK-SC-06 で接続済み）と同じ agentSlice の generationState（isGenerating, generationProgress, planResult 等）を共有するようになった。

現在の UI 設計では Wizard と Panel が同時にアクティブになる導線はないが、将来の UI 変更（タブ切り替え、ドロワー表示等）で同時アクティブになった場合、以下の競合が発生する:

- 一方が planSkill を実行中に他方が clearGenerationState を呼ぶ
- 両方が同時に isGenerating=true を参照し、予期しない UI 状態になる
- planResult が他方のコンテキストで表示される

TASK-SC-10（agentSlice から generationSlice を分割）の実施後に対応するのが効率的。

## 実行タスク

- [ ] generationState の「所有者」を追跡するフィールドを追加する（例: `generationOwner: "wizard" | "panel" | null`）
- [ ] 生成中に他方のコンポーネントが生成を開始しようとした際のガード処理を実装する
- [ ] UI 上で「他の場所で生成中です」等の通知を表示する
- [ ] useEffect cleanup で generationOwner をリセットする
- [ ] テストケースを追加する

## 完了条件

- [ ] 2つのコンポーネントが同時に generationState を操作できないこと
- [ ] 競合時にユーザーへ適切なフィードバックが表示されること
- [ ] コンポーネントアンマウント時に所有権が正しくリリースされること
- [ ] TypeScript 型チェック PASS
- [ ] 全テスト PASS

## 苦戦箇所（TASK-SC-07 実装知見）

| 苦戦箇所                            | 問題                                                     | 解決策                                                               |
| ----------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------- |
| useEffect クリーンアップ（P3）      | コンポーネントアンマウント時に store state が残留        | useEffect の return で clearGenerationState を呼ぶ                   |
| Hybrid State Pattern の非対称クリア | ローカル state と store state の両方を必ずクリアする必要 | 対称クリアパターン: 全パス（cancel, execute, unmount）で両方をクリア |

## 参照

- TASK-SC-07 Phase 12 未タスクレポート (Store 競合防止)
- TASK-SC-10: agentSlice から generationSlice を分割（前提タスク）
- TASK-SC-12: Hybrid State Pattern ガイド

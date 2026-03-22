# Workspace Chat streaming error banner のトランジション追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1448
task_id: UT-WORKSPACE-CHAT-STREAM-ERROR-TRANSITION-001
task_name: StreamingErrorDisplay の表示/非表示トランジションを追加する
category: 改善
target_feature: Workspace Chat / StreamingErrorDisplay
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR Phase 12
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-workspace-chat-stream-error-transition-001.md
```

| 項目         | 内容                                                        |
| ------------ | ----------------------------------------------------------- |
| タスクID     | UT-WORKSPACE-CHAT-STREAM-ERROR-TRANSITION-001               |
| タスク名     | StreamingErrorDisplay の表示/非表示トランジションを追加する |
| 分類         | 改善                                                        |
| 対象機能     | Workspace Chat / StreamingErrorDisplay                      |
| 優先度       | 低                                                          |
| 見積もり規模 | 小規模                                                      |
| ステータス   | 未実施                                                      |
| 発見元       | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR Phase 12               |
| 発見日       | 2026-03-22                                                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task 04 では `StreamingErrorDisplay` により structured error UI を実装したが、表示と非表示は即時切り替えであり、Phase 1 の NFR-1 にある 200-300ms のアニメーション要件は未反映である。

### 1.2 問題点・課題

1. エラー発生時の視線誘導が急で、表示変化がやや硬い。
2. dismiss 時も即座に消えるため、UI 状態変化の因果が見えにくい。
3. reduced motion 配慮を含めた animation contract が未定義である。

### 1.3 放置した場合の影響

- Apple HIG 準拠の完成度が中途半端なまま残る。
- 将来バナー系 UI を共通化するときに motion 仕様が再び場当たりになる。
- manual test / screenshot review で「正しいが少し荒い」状態が継続する。

## 2. 何を達成するか（What）

### 2.1 目的

`StreamingErrorDisplay` に軽量な entrance / exit transition を追加し、表示切り替えを視覚的に自然にする。

### 2.2 最終ゴール

1. error banner が 200-300ms で穏やかに出入りする。
2. `prefers-reduced-motion` では過剰な motion を抑制する。
3. runtime test と screenshot evidence で回帰を防げる。

### 2.3 スコープ

#### 含むもの

- `StreamingErrorDisplay` の transition 仕様
- reduced motion 配慮
- 必要な component/runtime test の追加
- component documentation / UI spec の同期

#### 含まないもの

- error code mapping の変更
- retry / settings CTA の振る舞い変更
- Workspace Chat 全体のレイアウト刷新

### 2.4 成果物

| 成果物          | 説明                                   |
| --------------- | -------------------------------------- |
| transition 実装 | banner 表示/非表示の motion            |
| テスト          | transition 導入後の表示条件ガード      |
| spec sync       | component doc / UI spec の motion 追記 |

## 3. どのように実行するか（How）

### 3.1 前提条件

- `StreamingErrorDisplay` が current root で稼働していること
- Task 04 の Phase 11 screenshot evidence が再取得可能であること

### 3.2 推奨アプローチ

1. `opacity` と軽い `transform` に限定した transition を設計する。
2. `prefers-reduced-motion` を見て animation を最小化する。
3. exit 時に layout shift や button focus 崩れが起きないよう確認する。
4. screenshot / runtime test を更新して証跡を残す。

### 3.3 実装時の注意点

| 注意点                          | 理由                        | 対策                               |
| ------------------------------- | --------------------------- | ---------------------------------- |
| transform を大きくしすぎない    | error banner が過剰に目立つ | 4-8px 程度の軽い移動に留める       |
| dismiss 直後の focus を壊さない | keyboard 操作が不安定になる | exit 中も focus 管理を明示する     |
| reduced motion を無視しない     | a11y 低下                   | media query または hook で抑制する |

## 4. 実行手順

1. `StreamingErrorDisplay` の表示/非表示ロジックを調査する。
2. 200-300ms の motion contract を定義する。
3. reduced motion を考慮して実装する。
4. component/runtime test と screenshot evidence を更新する。
5. component documentation / workflow spec を同期する。

## 5. 完了条件チェックリスト

- [ ] error banner の entrance / exit が 200-300ms で動作する
- [ ] reduced motion で過剰なアニメーションが抑制される
- [ ] dismiss / retry / settings CTA の操作性が維持される
- [ ] runtime または component test で回帰を防げる
- [ ] UI spec / component documentation に motion contract が反映される

## 6. 検証方法

### 6.1 画面確認

- light / dark theme で transition の視認性を確認する。
- retryable / non-retryable の両ケースで表示崩れがないことを確認する。
- dismiss 後に composer へ自然に戻れることを確認する。

### 6.2 文書確認

- `component-documentation.md` に motion の責務が追記されていることを確認する。
- `ui-ux-feature-components-details.md` と実装が一致していることを確認する。

## 7. リスクと対策

| リスク                            | 影響                            | 対策                                     |
| --------------------------------- | ------------------------------- | ---------------------------------------- |
| animation が過剰                  | エラー時の可読性が下がる        | fade + short distance の最小構成に留める |
| exit timing で click/focus が競合 | retry や dismiss が不安定になる | pointer/focus の実測テストを追加する     |
| theme ごとに見え方が異なる        | light/dark の品質差が出る       | screenshot を両 theme で撮る             |

## 8. 参照情報

- `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md`
- `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md`
- `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/component-documentation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`

## 9. 備考

- 本タスクは defect 修正ではなく polish だが、Task 04 の NFR-1 完遂に必要な follow-up である。
- contrast 検証タスクとは分離し、motion 契約だけに集中した方が差分が小さい。

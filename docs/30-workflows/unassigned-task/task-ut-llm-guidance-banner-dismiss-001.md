# LLM guidance banner dismiss UX 追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1428
task_id: UT-FIX-LLM-BANNER-DISMISS-001
task_name: LLM guidance banner の dismiss UX を追加する
category: 改善
target_feature: ChatView / guidance banner
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE Phase 12
created_date: 2026-03-21
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-llm-guidance-banner-dismiss-001.md
```

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-FIX-LLM-BANNER-DISMISS-001                  |
| タスク名     | LLM guidance banner の dismiss UX を追加する   |
| 分類         | 改善                                           |
| 対象機能     | ChatView / guidance banner                     |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE Phase 12 |
| 発見日       | 2026-03-21                                     |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の LLM guidance banner は未選択状態で常時表示される。初回導線としては正しいが、すぐに設定できないケースでは毎回同じ警告が見え続ける。

### 1.2 問題点・課題

1. ユーザーが内容を理解した後も同じ banner が残り続ける。
2. 画面の縦スペースを継続的に占有する。
3. dismiss の寿命が未定義で、単純実装すると再表示条件が曖昧になる。

### 1.3 放置した場合の影響

- guidance が「助け」ではなく「ノイズ」に変わる。
- ChatView の第一印象が警告中心になりやすい。
- 将来の onboarding UX と競合する。

## 2. 何を達成するか（What）

### 2.1 目的

ユーザーが一時的に banner を閉じられるようにしつつ、未設定状態への気づきは維持する。

### 2.2 最終ゴール

1. dismiss ボタンで banner を一時的に閉じられる。
2. 再表示条件が明確に定義される。
3. アクセシビリティを壊さずに実装される。

### 2.3 スコープ

#### 含むもの

- dismiss button の UI 追加
- dismiss state の寿命定義
- 再表示条件の設計
- 関連テスト追加

#### 含まないもの

- Settings direct scroll
- LLM 選択ロジック変更
- onboarding 全体 redesign

### 2.4 成果物

| 成果物          | 説明                          |
| --------------- | ----------------------------- |
| dismiss UX 仕様 | 表示・再表示・寿命のルール    |
| banner 実装     | close control 付き banner     |
| テスト          | dismiss / reopen の回帰 guard |
| spec sync       | UI/UX と lessons の更新       |

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現行 banner が `role="alert"` と CTA を持っていること
- 未選択状態を selector で判定していること

### 3.2 推奨アプローチ

1. dismiss state を local state か store state かで整理する。
2. 「いつ再表示するか」を先に決める。
3. close button をアクセシブルに追加する。
4. banner の主 CTA より dismiss が強く見えないように調整する。

### 3.3 実装時の注意点

| 注意点                          | 理由                            | 対策                                                 |
| ------------------------------- | ------------------------------- | ---------------------------------------------------- |
| dismiss を永続化しすぎない      | モデル未設定への気づきが消える  | セッション単位か画面再訪時の再表示条件を定義する     |
| CTA より close が目立つ         | 本来の誘導価値が落ちる          | dismiss は secondary action にする                   |
| `role="alert"` の意味を壊さない | assistive tech への通知が弱まる | close button を追加しても alert 文言の構造を保持する |

## 4. 実行手順

1. dismiss state の寿命候補を比較する。
2. banner UI に close control を追加する。
3. 未選択状態・dismiss 済み・再表示条件のテストを書く。
4. screenshot と component doc を更新する。
5. system spec / lessons / backlog を同期する。

## 5. 完了条件チェックリスト

- [ ] banner に dismiss control が追加されている
- [ ] dismiss 後の再表示条件が文書化されている
- [ ] CTA と dismiss の優先順位が視覚的に分離されている
- [ ] keyboard / screen reader で dismiss 操作できる
- [ ] banner の未選択通知責務が維持されている

## 6. 検証方法

### 6.1 画面確認

- 未選択状態で banner が表示されることを確認する。
- dismiss 後に banner が閉じることを確認する。
- 再表示条件に従って banner が戻ることを確認する。

### 6.2 文書確認

- `component-documentation.md` に dismiss control の責務が追加されていることを確認する。
- `ui-ux-llm-selector.md` と lessons に再表示条件が記録されていることを確認する。

## 7. リスクと対策

| リスク                           | 影響                               | 対策                                                               |
| -------------------------------- | ---------------------------------- | ------------------------------------------------------------------ |
| dismiss で重要な警告が消え続ける | 未設定に気づけなくなる             | 再表示条件を「画面再訪」「一定時間」「設定変更時」から明示選択する |
| state の持ち場所が不適切         | banner が意図せず復活 / 永続化する | store に入れる前に local state で必要性を検証する                  |
| UI が過密になる                  | header 直下の視認性が落ちる        | close button を icon-only にし、CTA との余白を分離する             |

## 8. 参照情報

- `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/component-documentation.md`
- `docs/30-workflows/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`
- `.claude/skills/aiworkflow-requirements/references/error-handling.md`

## 9. 備考

- 本タスクは direct scroll task とは独立して扱う。
- dismiss UX は導線価値を下げないことが最優先であり、単純な「閉じる」実装だけで完了扱いにしない。

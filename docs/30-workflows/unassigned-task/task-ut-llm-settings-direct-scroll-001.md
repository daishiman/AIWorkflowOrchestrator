# Settings の LLM セクション直接スクロール導線追加 - タスク指示書

## メタ情報

```yaml
issue_number: 1427
task_id: UT-FIX-LLM-SETTINGS-DIRECT-SCROLL-001
task_name: Settings の LLM セクションへ直接スクロールする導線を追加する
category: 改善
target_feature: ChatView / WorkspaceView / SettingsView
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE Phase 12
created_date: 2026-03-21
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-llm-settings-direct-scroll-001.md
```

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-FIX-LLM-SETTINGS-DIRECT-SCROLL-001                        |
| タスク名     | Settings の LLM セクションへ直接スクロールする導線を追加する |
| 分類         | 改善                                                         |
| 対象機能     | ChatView / WorkspaceView / SettingsView                      |
| 優先度       | 低                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE Phase 12               |
| 発見日       | 2026-03-21                                                   |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現在の guidance CTA は `setCurrentView("settings")` により Settings root へ遷移できる。ただし、ユーザーは到着後に LLM セクションを自分で探してスクロールしなければならない。

### 1.2 問題点・課題

1. 「設定画面へ」はできても「設定すべき場所まで一発で届く」が未達。
2. 初回導線の最後の 1 ステップだけが手動で残り、導線価値が中途半端になる。
3. ChatView と WorkspaceView の両方から使う deep link 仕様が未定義。

### 1.3 放置した場合の影響

- モデル未選択ユーザーが Settings 画面内で迷う。
- guidance を追加したのに解決までの操作回数が十分に減らない。
- 将来別画面から同じ LLM セクションへ飛ばしたい時に導線が重複実装になりやすい。

## 2. 何を達成するか（What）

### 2.1 目的

guidance CTA から SettingsView の LLM セクションへ直接移動できるようにし、未設定状態から設定完了までの操作数を減らす。

### 2.2 最終ゴール

1. ChatView / WorkspaceView から同一の deep link API で LLM セクションへ移動できる。
2. SettingsView 側に scroll target が定義される。
3. keyboard / screen reader でも到達先が分かる。

### 2.3 スコープ

#### 含むもの

- SettingsView の LLM section anchor 設計
- `setCurrentView("settings")` の拡張か、等価な誘導 API の追加
- ChatView / WorkspaceView CTA の移動先改善
- 導線テスト追加

#### 含まないもの

- LLM 設定 UI 自体の redesign
- persist 仕様変更
- provider/model 選択ロジックの変更

### 2.4 成果物

| 成果物         | 説明                                    |
| -------------- | --------------------------------------- |
| deep link 仕様 | SettingsView の到達先 contract          |
| UI 実装        | ChatView / WorkspaceView CTA の遷移改善 |
| テスト         | direct scroll / focus 到達の回帰 guard  |
| spec sync      | navigation / selector spec の更新       |

## 3. どのように実行するか（How）

### 3.1 前提条件

- LLM guidance banner と Workspace blocked guidance が current build に存在すること
- SettingsView に LLM セクションの明確な DOM 境界を追加できること

### 3.2 推奨アプローチ

1. SettingsView 側に `data-testid` または section anchor を追加する。
2. 遷移 API を `settings` root から `settings + target=llm` へ拡張する。
3. 到達後に scroll / focus を同期する。
4. screenshot / integration test で到達位置を固定する。

### 3.3 実装時の注意点

| 注意点                                       | 理由                                           | 対策                           |
| -------------------------------------------- | ---------------------------------------------- | ------------------------------ |
| scroll と focus を混同しない                 | 画面だけ動いてもキーボードユーザーに伝わらない | 到達後 focus 先を定義する      |
| ChatView / WorkspaceView で別 API を作らない | 導線 contract が重複しやすい                   | 共通 helper に寄せる           |
| SettingsView の section 構造を固定しすぎない | 将来のレイアウト変更で壊れやすい               | semantic anchor を先に設計する |

## 4. 実行手順

1. `SettingsView` の LLM セクション境界を調査する。
2. deep link / scroll target の contract を設計する。
3. ChatView と WorkspaceView の CTA を共通 API へ切り替える。
4. 到達位置の integration test を追加する。
5. screenshot と Phase 12 system spec を同期する。

## 5. 完了条件チェックリスト

- [ ] ChatView から LLM セクションへ直接移動できる
- [ ] WorkspaceView から LLM セクションへ直接移動できる
- [ ] 到達後に target section が視覚的に確認できる
- [ ] keyboard / screen reader でも到達先が分かる
- [ ] navigation spec と implementation が一致している

## 6. 検証方法

### 6.1 画面確認

- ChatView CTA で SettingsView の LLM セクション先頭が viewport 内に入ることを確認する。
- WorkspaceView CTA でも同じ到達位置になることを確認する。
- dark/light 両 theme で到達後のレイアウトが崩れないことを確認する。

### 6.2 文書確認

- `ui-ux-navigation.md` と `ui-ux-llm-selector.md` に deep link の正本記述があることを確認する。
- parent workflow / backlog / lessons に follow-up の位置づけが反映されることを確認する。

## 7. リスクと対策

| リスク                                                | 影響                      | 対策                                                        |
| ----------------------------------------------------- | ------------------------- | ----------------------------------------------------------- |
| SettingsView の DOM 構造変更で scroll target が壊れる | guidance CTA が空振りする | anchor を semantic に設計し test で固定する                 |
| focus 先が不適切                                      | アクセシビリティ低下      | 到達後 focus 先を section heading か最初の input に統一する |
| 画面遷移 state が肥大化する                           | navigation 保守性低下     | target section を enum 化し `settings` 専用に閉じる         |

## 8. 参照情報

- `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/phase-2-design.md`
- `docs/30-workflows/completed-tasks/02-TASK-FIX-LLM-SELECTOR-INLINE-GUIDANCE/outputs/phase-12/unassigned-task-detection.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-llm-selector.md`

## 9. 備考

- 本タスクは guidance CTA の価値を最後まで貫通させるための follow-up である。
- 実装時は dismiss task と分離し、導線 contract だけに集中した方が回帰点を減らせる。

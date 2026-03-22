# Workspace Chat streaming error banner の WCAG AA コントラスト検証 - タスク指示書

## メタ情報

```yaml
issue_number: 1449
task_id: UT-WORKSPACE-CHAT-STREAM-ERROR-CONTRAST-001
task_name: StreamingErrorDisplay のコントラスト比を数値検証し必要なら調整する
category: 改善
target_feature: Workspace Chat / StreamingErrorDisplay
priority: 低
scale: 小規模
status: 未実施
source_phase: TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR Phase 12
created_date: 2026-03-22
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-ut-workspace-chat-stream-error-contrast-001.md
```

| 項目         | 内容                                                               |
| ------------ | ------------------------------------------------------------------ |
| タスクID     | UT-WORKSPACE-CHAT-STREAM-ERROR-CONTRAST-001                        |
| タスク名     | StreamingErrorDisplay のコントラスト比を数値検証し必要なら調整する |
| 分類         | 改善                                                               |
| 対象機能     | Workspace Chat / StreamingErrorDisplay                             |
| 優先度       | 低                                                                 |
| 見積もり規模 | 小規模                                                             |
| ステータス   | 未実施                                                             |
| 発見元       | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR Phase 12                      |
| 発見日       | 2026-03-22                                                         |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Task 04 では Apple HIG に寄せた error color を採用したが、light/dark 両 theme の foreground と background の組み合わせについて WCAG 2.1 AA を数値で検証した記録はまだない。

### 1.2 問題点・課題

1. 色選定が見た目中心で、数値上の合格判定が残っていない。
2. button / hint / body text の各組み合わせで基準が同一表に整理されていない。
3. 将来デザイントークン化する際の基準値が不足している。

### 1.3 放置した場合の影響

- a11y レビュー時に再計算が毎回必要になる。
- dark theme だけ基準未達でも見逃される可能性がある。
- 色変更時の regression guard がなく、仕様が口頭依存になる。

## 2. 何を達成するか（What）

### 2.1 目的

`StreamingErrorDisplay` の text / background / action color を数値検証し、必要なら色または背景濃度を調整して基準を固定する。

### 2.2 最終ゴール

1. light/dark 両 theme の主要テキストが WCAG 2.1 AA を満たす。
2. 検証結果がドキュメントに残る。
3. 再計算が必要なときの基準色と測定方法が共有される。

### 2.3 スコープ

#### 含むもの

- error text / hint / action button のコントラスト計算
- 必要時の color token 調整
- 計算結果のドキュメント化
- screenshot / spec の同期

#### 含まないもの

- banner layout の再設計
- animation 導入
- error code / CTA 挙動の変更

### 2.4 成果物

| 成果物          | 説明                                       |
| --------------- | ------------------------------------------ |
| contrast report | light/dark 各組み合わせの数値              |
| 必要な色調整    | AA 未達時の修正                            |
| spec sync       | component doc / UI spec / lessons への反映 |

## 3. どのように実行するか（How）

### 3.1 前提条件

- `StreamingErrorDisplay` の current colors が確定していること
- light / dark screenshot evidence を再確認できること

### 3.2 推奨アプローチ

1. body text、hint、action button を theme ごとに色抽出する。
2. contrast ratio を算出し、4.5:1 基準で判定する。
3. 未達があれば最小差分で background opacity か foreground color を調整する。
4. 計算結果を component doc と workflow spec に同期する。

### 3.3 実装時の注意点

| 注意点                            | 理由                                | 対策                       |
| --------------------------------- | ----------------------------------- | -------------------------- |
| text 種別を混ぜない               | body / hint / action で条件が異なる | 組み合わせごとに表を分ける |
| screenshot 見た目だけで判断しない | 目視は再現性が低い                  | 数値計算を正本にする       |
| 色を変えすぎない                  | HIG との整合が崩れる                | 最小調整を優先する         |

## 4. 実行手順

1. 現在の foreground/background 色を theme ごとに棚卸しする。
2. contrast ratio を計算する。
3. AA 未達があれば最小修正案を決める。
4. component documentation / spec / screenshot evidence を更新する。
5. 結果を follow-up task として閉じる。

## 5. 完了条件チェックリスト

- [ ] light/dark 両 theme の主要テキスト組み合わせを計測した
- [ ] WCAG 2.1 AA の判定結果を文書化した
- [ ] 未達項目があれば修正し再計測した
- [ ] component documentation と実装色が一致している
- [ ] 将来の token 化に使える基準値が残っている

## 6. 検証方法

### 6.1 数値確認

- body text と background の ratio が 4.5:1 以上であることを確認する。
- hint text と action text も個別に確認する。
- light / dark の両 theme で記録を残す。

### 6.2 文書確認

- `component-documentation.md` に color contract が反映されていることを確認する。
- `ui-ux-feature-components-details.md` と `phase-11-manual-test.md` の evidence 記述が一致することを確認する。

## 7. リスクと対策

| リスク                   | 影響                     | 対策                                                   |
| ------------------------ | ------------------------ | ------------------------------------------------------ |
| AA 未達が見つかる        | 追加修正が必要になる     | 背景 opacity と text color の最小差分案を先に用意する  |
| hint text だけ未達       | 部分的な a11y 不備が残る | text 種別ごとに個別判定する                            |
| token 変更で他画面へ波及 | 横断影響が広がる         | Task 04 ローカル色から先に閉じ、必要なら別タスク化する |

## 8. 参照情報

- `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-1-requirements.md`
- `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/component-documentation.md`
- `docs/30-workflows/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-11-manual-test.md`
- `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components-details.md`

## 9. 備考

- 本タスクは Task 04 の a11y 証跡を数値化するための follow-up である。
- transition 追加タスクとは分離し、色の妥当性だけを独立に判断できるようにする。

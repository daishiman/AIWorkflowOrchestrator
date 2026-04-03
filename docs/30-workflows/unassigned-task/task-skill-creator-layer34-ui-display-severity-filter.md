# UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001: SkillCreator Layer3/4 verify detail の severity フィルタ追加

## メタ情報

```yaml
issue_number: 1861
task_id: UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001
task_name: SkillCreator Layer3/4 verify detail の severity フィルタ追加
category: 改善
target_feature: SkillCreator UI (renderer side) - verify detail severity filtering
priority: 中
scale: 小規模
status: 未実施
source_phase: Phase 12
created_date: 2026-04-03
dependencies: [UT-SDK-L34-UI-DISPLAY-001]
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-SDK-L34-UI-DISPLAY-SEVERITY-FILTER-001                    |
| タスク名     | SkillCreator Layer3/4 verify detail の severity フィルタ追加 |
| 分類         | 改善                                                         |
| 対象機能     | SkillCreator UI (renderer side)                              |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模                                                       |
| ステータス   | 未実施                                                       |
| 発見元       | UT-SDK-L34-UI-DISPLAY-001 の Phase 12 候補                   |
| 発見日       | 2026-04-03                                                   |
| 依存タスク   | UT-SDK-L34-UI-DISPLAY-001（完了後に着手）                    |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Layer3/4 の checks を Layer 別に整理できるようになったが、件数が増えると
`info` まで含めた全件表示では「先に直すべきもの」が埋もれやすい。
severity で絞り込めれば、ユーザーは重要度の高い問題に集中できる。

### 1.2 問題点・課題

- warning / error を素早く見たいのに、全件の中から目視で拾う必要がある
- Layer grouping と severity 表示が揃っても、情報量が多いとスキャンコストが残る
- default の全表示を保ちながら、必要時だけ絞り込みたい

### 1.3 放置した場合の影響

- check 数が増えるほど、UI は「整理されているが探しにくい」状態になる
- 重要な error が大量の info に埋もれて、修正優先度を見誤る
- UI が冗長になり、verify detail を開いてもすぐ閉じられる

---

## 2. 何を達成するか（What）

### 2.1 目的

Layer3/4 の verify detail に severity フィルタを追加し、
`all` / `warning+` / `error only` などの切り替えで表示粒度を調整できるようにする。

### 2.2 最終ゴール

- severity フィルタで表示対象を切り替えられる
- フィルタをかけても Layer grouping と accordion の状態が破綻しない
- 既定は `all` で、現行表示を壊さない

### 2.3 スコープ

#### 含むもの

- `SkillLifecyclePanel.tsx` への severity filter state 追加
- verify detail ヘッダー近辺への filter control 追加
- group/individual check の表示条件制御
- 対応テストの追加・更新

#### 含まないもの

- backend の check 生成ロジック変更
- check severity の再定義
- 永続化されたユーザー設定

### 2.4 成果物

- severity フィルタ付き verify detail UI
- フィルタ条件ごとのテスト
- 重要度に応じた表示制御の記録

---

## 3. どう実装するか（How）

### 3.1 前提条件

- UT-SDK-L34-UI-DISPLAY-001 の Layer grouping が実装済みであること
- severity の `info` / `warning` / `error` が backend 契約として固定されていること

### 3.2 依存タスク

| タスクID                  | 関係 | 状況         |
| ------------------------- | ---- | ------------ |
| UT-SDK-L34-UI-DISPLAY-001 | 先行 | 完了済み想定 |

### 3.3 推奨アプローチ

1. filter state は `all` を既定値にする
2. `warning+` を選んだ場合は `warning` と `error` のみ表示する
3. `error only` を選んだ場合は `error` のみ表示する
4. empty layer は既存のルールに従って非表示にする
5. reverify 後も filter state を維持する

### 3.4 苦戦箇所記録

- filter を先にかけるか、layer grouping の後にかけるかで空 layer の扱いが変わる
- `reverify` 時に filter 状態をリセットすると、ユーザーが見ていた範囲が勝手に変わる
- all 表示と filtered 表示で、件数バッジの意味が変わらないように注意が必要

---

## 4. 完了条件

- [ ] severity フィルタで表示対象を切り替えられる
- [ ] default の `all` 表示が現行 UI と互換である
- [ ] Layer grouping と accordion の操作が壊れていない
- [ ] コンポーネントテストが全て PASS する

---

## 5. 参照情報

- [UT-SDK-L34-UI-DISPLAY-001](/docs/30-workflows/unassigned-task/task-skill-creator-layer34-ui-display.md)
- `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx`
- `apps/desktop/src/renderer/components/skill/__tests__/SkillLifecyclePanel.test.tsx`

# SkillCreator Layer3/4 VerifyLayerGroup 分離 - タスク指示書

## メタ情報

```yaml
issue_number: 1860
task_id: UT-SDK-L34-VERIFY-LAYERGROUP-SPLIT-001
task_name: SkillCreator Layer3/4 VerifyLayerGroup 分離
category: リファクタリング
target_feature: SkillCreator UI (renderer side) - 検証結果表示
priority: 低
scale: 小規模
status: 未実施
source_phase: UT-SDK-L34-UI-DISPLAY-001 Phase 12 follow-up
created_date: 2026-04-03
dependencies: [UT-SDK-L34-UI-DISPLAY-001]
spec_path: docs/30-workflows/unassigned-task/task-skill-creator-layer34-verify-layergroup-split.md
```

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-SDK-L34-VERIFY-LAYERGROUP-SPLIT-001         |
| タスク名     | SkillCreator Layer3/4 VerifyLayerGroup 分離    |
| 分類         | リファクタリング                               |
| 対象機能     | SkillCreator UI (renderer side) - 検証結果表示 |
| 優先度       | 低                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | UT-SDK-L34-UI-DISPLAY-001 Phase 12 follow-up   |
| 発見日       | 2026-04-03                                     |
| 関連タスク   | UT-SDK-L34-UI-DISPLAY-001                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Layer 別 UI の実装を `SkillLifecyclePanel.tsx` 内に閉じ込めた結果、関連する helper と合わせたローカル領域が 100 行を超えた。
現状は動作するが、今後の UI 拡張を考えると責務分離を先に整える価値がある。

### 1.2 問題点・課題

- `SkillLifecyclePanel.tsx` がさらに肥大化しやすい
- Layer 表示だけの変更でも、巨大ファイルの差分になりやすい
- helper 関数と UI が同一ファイルにあると、再利用性が弱い

### 1.3 放置した場合の影響

- 将来の UI 改修で、関連する変更がまとまりにくくなる
- テスト範囲が大きいまま残り、回帰調査が重くなる

---

## 2. 何を達成するか（What）

### 2.1 目的

`VerifyLayerGroup` とその周辺 helper を独立ファイルへ切り出し、Layer 表示の責務を一箇所に閉じる。

### 2.2 最終ゴール

- `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx` に表示責務がまとまる
- `SkillLifecyclePanel.tsx` は state とデータ供給に寄る
- テストが新しい分離構造に追従する

### 2.3 スコープ

#### 含むもの

- `VerifyLayerGroup` 本体の分離
- Layer 集計 helper の移設
- import / export の整理
- 必要に応じたテストの微修正

#### 含まないもの

- UI の見た目変更
- 検証ロジックの変更
- backend / shared 変更

### 2.4 成果物

| 成果物                   | パス                                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| 分離後コンポーネント     | `apps/desktop/src/renderer/components/skill/VerifyLayerGroup.tsx`    |
| 更新済み親コンポーネント | `apps/desktop/src/renderer/components/skill/SkillLifecyclePanel.tsx` |
| 必要に応じたテスト更新   | `apps/desktop/src/renderer/components/skill/__tests__/...`           |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- 現在の Layer 表示が typecheck / test で通っていること
- `VerifyLayerGroup` が親コンポーネント内のローカル責務として確立していること

### 3.2 依存タスク

| タスクID                  | ステータス |
| ------------------------- | ---------- |
| UT-SDK-L34-UI-DISPLAY-001 | 完了       |

### 3.3 必要な知識

- React コンポーネント分割
- Props 設計
- テストの責務分離

### 3.4 推奨アプローチ

- helper 関数はコンポーネントの近くで一緒に移す
- state と data fetching は親に残す
- UI コンポーネントは props だけで描画できる形にする

---

## 4. 苦戦箇所記録

### 4.1 記録1: 分割しないままでは差分が読みにくい

UI・集計・開閉ロジックが同じファイルにあると、Layer 別の修正でも関係のない差分が増える。

**対処方針**: `VerifyLayerGroup` と helper を独立させる。

### 4.2 記録2: 親子の責務境界

分離時に、`useState` まで子へ押し込むと再利用性が下がる。

**対処方針**: 開閉状態と group source は親、表示は子に分ける。

---

## 5. 完了条件

- [ ] `VerifyLayerGroup` が独立ファイルに分離されている
- [ ] 親コンポーネントの責務が軽くなっている
- [ ] 既存のテストが壊れていない
- [ ] typecheck / test が通る

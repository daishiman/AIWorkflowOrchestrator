# UT-FIX-LIFECYCLE-SLICE-CLEAR-EVENTS-TYPE-001 clearEvents 型ミス修正 - タスク指示書

## メタ情報

```yaml
issue_number: 1255
```

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | UT-FIX-LIFECYCLE-SLICE-CLEAR-EVENTS-TYPE-001       |
| タスク名     | clearEvents の events 初期化型ミス修正（{} -> []） |
| 分類         | バグ修正                                           |
| 対象機能     | lifecycleHistorySlice の clearEvents アクション    |
| 優先度       | 低                                                 |
| 見積もり規模 | 小規模                                             |
| ステータス   | 未実施                                             |
| 発見元       | TASK-SKILL-LIFECYCLE-07 Phase 10 MINOR FR-M-02     |
| 発見日       | 2026-03-16                                         |
| 関連タスク   | TASK-SKILL-LIFECYCLE-07                            |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-SKILL-LIFECYCLE-07 の Phase 10 最終レビューで MINOR 判定 FR-M-02 として検出された。`lifecycle-history-slice-spec.md` の `clearEvents` アクション仕様で、events を空にする際に `events: {}` (空オブジェクト) が指定されているが、events の型は配列 (`SkillLifecycleEvent[]`) であるため `events: []` (空配列) が正しい。

### 1.2 問題点・課題

`events: {}` はオブジェクト型であり、配列型として定義されている `events` プロパティに代入すると TypeScript の型チェックではエラーとなる。仕様書をそのまま実装した場合、コンパイルエラーまたは実行時の配列操作（`.map()`, `.filter()`, `.length` 等）で予期しない動作が発生する。

### 1.3 放置した場合の影響

- 実装者が仕様書の `{}` をそのまま採用すると TypeScript コンパイルエラーが発生する
- 仕様書の信頼性が低下し、他の箇所の記述も疑われるようになる

## 2. 何を達成するか（What）

### 2.1 目的

`lifecycle-history-slice-spec.md` の `clearEvents` アクション仕様で `events: {}` を `events: []` に修正する。

### 2.2 最終ゴール

`clearEvents` アクション仕様が正しい配列初期化 `events: []` を使用している。

### 2.3 スコープ

#### 含むもの

- `lifecycle-history-slice-spec.md` の `clearEvents` アクション仕様の修正
- 実装時の `lifecycleHistorySlice.ts`（該当する場合）の同箇所修正

#### 含まないもの

- clearEvents 以外のアクションの修正
- ライフサイクルスライスの機能変更

### 2.4 成果物

- 修正済み `lifecycle-history-slice-spec.md`

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-SKILL-LIFECYCLE-07 の成果物が確定していること
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` の lifecycleHistorySlice セクションを確認済みであること

### 3.2 依存タスク

なし。

### 3.3 必要な知識

- TypeScript の配列型とオブジェクト型の違い
- Zustand スライスの状態リセットパターン

### 3.4 推奨アプローチ

仕様書内の該当箇所を `events: {}` から `events: []` に変更する。変更は1行のみの軽微な修正。

```typescript
// 変更前（型ミス）
clearEvents: () => set({ events: {} }),

// 変更後（正しい配列初期化）
clearEvents: () => set({ events: [] }),
```

### 3.5 親タスクで記録された苦戦箇所（TASK-SKILL-LIFECYCLE-07）

| 課題                                              | 発見経緯                                           | 解決策                                         | 教訓                                           |
| ------------------------------------------------- | -------------------------------------------------- | ---------------------------------------------- | ---------------------------------------------- |
| clearEvents の初期値型ミス（{} vs []）            | Phase 10 最終レビューで FR-M-02 として検出         | events の初期値を {} から [] に修正            | Zustand スライスの初期値は型定義と一致させる   |
| Phase 12 サブエージェントが実ファイル更新を保留   | Phase 12 Step 2 で仕様書更新が計画のみで保留された | 設計タスクでも Phase 12 の実ファイル更新は必須 | サブエージェントに「計画記録のみ」を許容しない |
| aggregateViews の persist 対象外設定（TECH-M-01） | Phase 3 で検出、Phase 5 で解決                     | partialize で aggregateViews を除外            | 派生データは persist 対象外が原則              |

## 4. 実行手順

### Phase構成

修正 -> 確認。

### Phase 1: 型ミスの修正

#### 目的

`clearEvents` の初期化値を正しい型に修正する。

#### 手順

1. `lifecycle-history-slice-spec.md` 内の `clearEvents` 仕様を検索する
2. `events: {}` を `events: []` に変更する
3. 同ファイル内で他に同様の型ミスがないか `grep -n "events: {}" lifecycle-history-slice-spec.md` で確認する

#### 成果物

- 修正済み仕様書

#### 完了条件

- `clearEvents` が `events: []` を使用している
- 同ファイル内に同様の型ミスが残存していない

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `clearEvents` アクションが `events: []` で初期化している

### 品質要件

- [ ] 同ファイル内に `events: {}` パターンが残存していない

### ドキュメント要件

- [ ] 変更内容が変更履歴に記録されている

## 6. 検証方法

### テストケース

- Case 1: `grep -n "events: {}" lifecycle-history-slice-spec.md` が 0 件
- Case 2: `clearEvents` の仕様が `events: []` を使用している

### 検証手順

1. 対象ファイルで `events: {}` の残存を grep 確認する
2. `clearEvents` の仕様が配列初期化を使用していることを目視確認する

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                          |
| ---------------------------------------- | ------ | -------- | ----------------------------- |
| 他のアクションにも同様の型ミスが存在する | 低     | 低       | grep で全仕様書を横断検索する |

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/skill-lifecycle-unification/tasks/step-05-par-task-07-lifecycle-history-feedback/outputs/` 配下の Phase 10 成果物
- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md` — lifecycleHistorySlice セクション（persist 対象外設計）
- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md` — ライフサイクル型定義セクション
- `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` — TASK-SKILL-LIFECYCLE-07 教訓セクション

### 参考資料

- `.claude/rules/03-state-management.md`（Zustand 設計原則）

## 9. 備考

### レビュー指摘の原文（該当する場合）

```text
Phase 10 MINOR FR-M-02: clearEvents で events: {} を events: [] に修正（型ミス: オブジェクト→配列）
```

### 補足事項

1行の修正で完了する極めて軽微なタスク。

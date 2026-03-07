# UT-10A-E-C-001 - タスク指示書

## メタ情報

```yaml
issue_number: 1026
```

## メタ情報

| 項目         | 内容                                 |
| ------------ | ------------------------------------ |
| タスクID     | UT-10A-E-C-001                       |
| タスク名     | SkillImportDialog selector migration |
| 分類         | 改善                                 |
| 対象機能     | SkillImportDialog / Store selector   |
| 優先度       | 低                                   |
| 見積もり規模 | 小規模                               |
| ステータス   | 未実施                               |
| 発見元       | Phase 10/12                          |
| 発見日       | 2026-03-06                           |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-10A-E-C で selector 分離方針を定義したが、`SkillImportDialog` に inline selector が残存している。

### 1.2 問題点・課題

inline selector が残ると、P31対策（`useShallow` を含む派生 selector 方針）の適用境界が曖昧になる。

### 1.3 放置した場合の影響

同種改修時に selector 実装が分散し、再描画安定性の回帰が再発しやすくなる。

## 2. 何を達成するか（What）

### 2.1 目的

`SkillImportDialog` の selector 利用を project 標準（個別 selector）に統一する。

### 2.2 最終ゴール

- `SkillImportDialog` で inline selector 使用が0件。
- selector 契約が `arch-state-management.md` と一致。

### 2.3 スコープ

#### 含むもの

- `SkillImportDialog` の selector 呼び出し見直し
- 必要なテスト更新

#### 含まないもの

- create/analyze 経路の移行（UT-10A-E-C-002）

### 2.4 成果物

- 修正コード
- 回帰テスト結果
- system spec 同期差分

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-10A-E-C の仕様同期が完了していること

### 3.2 依存タスク

- TASK-10A-E-D（実装フェーズ）

### 3.3 必要な知識

- Zustand selector 設計
- P31再描画ループの再発条件

### 3.4 推奨アプローチ

- inline selector を個別 selector へ置換
- `.filter()` 派生は `useShallow` 条件を維持

### 3.5 実装課題と解決策（親タスクからの教訓）

TASK-10A-E-C の実装で判明した苦戦箇所を、本タスク実装時の参考として記録する。

| 課題                                        | 発見経緯                                                                                                                                                | 解決策                                                                               | 教訓                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `.filter()` 派生selectorの無限ループ（P48） | Phase 8のリファクタリングで `renderHook` テストがタイムアウト。`.filter()` が毎回新しい配列参照を返し、Zustandの `Object.is` 比較で常に差分と判定された | `zustand/react/shallow` の `useShallow` でセレクタをラップし、shallow比較を適用      | 配列を返す派生セレクタには `useShallow` が必須。適用判断基準は S18パターンを参照               |
| worktree環境でのnative module不足           | vitest実行時に `Cannot find module @rollup/rollup-darwin-x64` が発生                                                                                    | worktreeディレクトリで `pnpm install --frozen-lockfile` を実行                       | worktreeでのテスト実行前に必ず `pnpm install --frozen-lockfile` を実行する                     |
| 既存実装との差分分析                        | Phase 2で設計した要件の大半が既存 `agentSlice` に実装済みで、新規実装が派生セレクタ2件のみに縮小                                                        | Phase 1-2の初期段階で既存コードを `grep` / `Read` で確認し、差分のみを設計対象とした | selector migration タスクでも事前に inline selector の棚卸しを先行し、置換対象を正確に特定する |

**参照先**:

- [architecture-implementation-patterns.md#S18](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)（useShallow派生selectorパターン）
- [06-known-pitfalls.md#P48](../../.claude/rules/06-known-pitfalls.md)（useShallow未適用による無限ループ）
- [06-known-pitfalls.md#P31](../../.claude/rules/06-known-pitfalls.md)（Zustand Store Hooks無限ループ）

## 4. 実行手順

### Phase構成

- Phase A: 現状分析
- Phase B: 実装
- Phase C: 検証と仕様同期

### Phase A: 現状分析

#### 目的

inline selector の残存箇所を特定する。

#### 手順

1. `SkillImportDialog` の `useAppStore((state)=>...)` を棚卸し。
2. 既存個別 selector へ置換可能か判定。
3. 追加 selector が必要なら設計メモ化。

#### 成果物

- 置換対象一覧

#### 完了条件

- 置換対象が漏れなく列挙されている。

### Phase B: 実装

#### 目的

selector 利用を統一する。

#### 手順

1. inline selector を個別 selector に置換。
2. 参照安定性が必要な箇所へ `useShallow` を適用。
3. 既存テストの期待値を更新。

#### 成果物

- 修正コード

#### 完了条件

- inline selector が0件。

### Phase C: 検証と仕様同期

#### 目的

回帰防止と仕様整合を完了する。

#### 手順

1. 対象テストを実行。
2. P31回帰観点を追加確認。
3. 必要なら `arch-state-management.md` を同期。

#### 成果物

- テスト結果
- 仕様更新差分

#### 完了条件

- テストPASS、仕様整合完了。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] inline selector が0件
- [ ] 個別 selector へ統一

### 品質要件

- [ ] P31回帰テストがPASS
- [ ] 既存挙動を壊さない

### ドキュメント要件

- [ ] 必要時に system spec を同期

## 6. 検証方法

### テストケース

- SkillImportDialog selector 利用テスト
- P31回帰テスト

### 検証手順

1. `rg` で inline selector 0件を確認。
2. 対象テストを実行。
3. 仕様書との差分有無を確認。

## 7. リスクと対策

| リスク                  | 影響度 | 発生確率 | 対策                                                                          |
| ----------------------- | ------ | -------- | ----------------------------------------------------------------------------- |
| selector置換漏れ        | 中     | 中       | `rg` で最終確認                                                               |
| 過剰再描画の回帰        | 高     | 低       | P31テストを必須実行                                                           |
| useShallow未適用（P48） | 高     | 高       | `.filter()` を使う新規セレクタには必ず `useShallow` を適用（S18パターン準拠） |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`
- `docs/30-workflows/completed-tasks/task-043c-store-lifecycle-integration-design/phase-2-design.md`
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`（S18: useShallow派生selectorパターン）
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`（TASK-10A-E-Cセクション）

### 参考資料

- `.claude/rules/06-known-pitfalls.md`（P31）
- `.claude/rules/06-known-pitfalls.md`（P48: useShallow未適用による無限ループ）

## 9. 備考

### レビュー指摘の原文（該当する場合）

該当なし

### 補足事項

本未タスクは `TASK-10A-E-D` スコープで実施する。

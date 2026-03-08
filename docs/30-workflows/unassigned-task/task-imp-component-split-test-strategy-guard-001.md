# コンポーネント分割前テスト戦略設計ガード - タスク指示書

## メタ情報

```yaml
issue_number: 1055
```

## メタ情報

| 項目         | 内容                                                         |
| ------------ | ------------------------------------------------------------ |
| タスクID     | UT-IMP-COMPONENT-SPLIT-TEST-STRATEGY-GUARD-001               |
| タスク名     | コンポーネント分割前テスト戦略設計ガード                     |
| 分類         | 改善                                                         |
| 対象機能     | テスト設計プロセス（task-specification-creator Phase 2/4）   |
| 優先度       | 中                                                           |
| 見積もり規模 | 小規模（2-3時間）                                            |
| ステータス   | 未実施                                                       |
| 発見元       | TASK-UI-03 AgentView Enhancement（テスト戦略が後手に回った） |
| 発見日       | 2026-03-08                                                   |
| 依存         | なし                                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-UI-03 で AgentView（556行テスト）をコンポーネント分割した際、テスト責務境界が曖昧になった。元の `AgentView.test.tsx` が統合テスト的に書かれており、個別コンポーネント単体テストへの変換が困難だった。分割後、どのテストケースがどのコンポーネントに属するかの判断に時間がかかり、レイアウトテスト（`.layout.test.tsx`）と個別テストの境界も不明確だった。

### 1.2 問題点・課題

- コンポーネント分割の Phase 2（設計）で、テストファイルの分割戦略が定義されていなかった
- テスト設計が Phase 4（テスト作成）まで後回しにされ、実装済みコードに対して後からテスト構造を合わせる形になった
- 結果として、テストの網羅性低下と重複テストの作成リスクが発生した

### 1.3 放置した場合の影響

- コンポーネント分割タスクのたびに、テスト戦略の再設計が Phase 4 以降で発生し、手戻りコストが増大する
- テストの責務境界が曖昧なまま実装が進み、テスト間の重複や網羅性の欠落が繰り返される
- コンポーネント分割は繰り返し発生するリファクタリングパターンのため、影響は長期的に累積する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 2（設計）の段階で「テストファイル責務マトリクス」を定義し、コンポーネント分割時のテスト戦略を設計段階で確定させる。

### 2.2 最終ゴール

- Phase 2 テンプレートに「テストファイル責務マトリクス」セクションが追加されている
- Phase 3 レビューチェックリストで責務マトリクスの妥当性が検証される
- コンポーネント分割タスクで、テスト設計が Phase 2 の時点で確定し、Phase 4 での手戻りが発生しない

### 2.3 スコープ

#### 含むもの

- `task-specification-creator` の Phase 2 テンプレートに「テストファイル責務マトリクス」セクション追加
- Phase 3 レビューチェックリストに責務マトリクス検証項目追加
- `testing-component-patterns.md` のセクション15に責務マトリクステンプレート追加

#### 含まないもの

- 既存テストファイルのリファクタリング
- テストフレームワークやツールの変更
- Phase 2/3/4 以外の Phase テンプレート変更

### 2.4 成果物

- 更新済み `.claude/skills/task-specification-creator/references/phase-templates.md`（Phase 2 テンプレート）
- 更新済み Phase 3 レビューチェックリスト
- 更新済み `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md`（セクション15）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-UI-03 の AgentView Enhancement が完了し、テスト分割の実例が存在すること

### 3.2 依存タスク

なし

### 3.3 必要な知識

- task-specification-creator の Phase テンプレート構造
- コンポーネント分割時のテスト責務境界の設計パターン
- TASK-UI-03 での AgentView テスト分割の実例と教訓

### 3.4 推奨アプローチ

1. `.claude/skills/task-specification-creator/references/phase-templates.md` の Phase 2 テンプレートに「テストファイル責務マトリクス」セクションを追加
2. Phase 3 のレビューチェックリストに「テストファイル責務マトリクスが定義されているか」を追加
3. `testing-component-patterns.md` のセクション15に責務マトリクステンプレートを追加

---

## 4. 実行手順

### Phase構成

小規模タスクのため Phase 4-5-9-12 の4フェーズ構成。

### Phase 4-5: テスト作成→実装

#### 目的

テスト戦略設計ガードをテンプレートとチェックリストに組み込む

#### 手順

1. Phase 2 テンプレートに以下の「テストファイル責務マトリクス」セクションを追加:
   ```
   | コンポーネント | テストファイル | テスト責務 |
   |--------------|--------------|-----------|
   | ParentView | ParentView.layout.test.tsx | 子コンポーネントの配置・表示制御 |
   | ChildComponent | ChildComponent.test.tsx | 単体UI: Props渡し、イベントハンドラ |
   ```
2. Phase 3 レビューチェックリストに「コンポーネント分割タスクの場合、テストファイル責務マトリクスが定義されているか」を追加
3. `testing-component-patterns.md` セクション15に責務マトリクステンプレートと適用ガイドラインを追加
4. TASK-UI-03 の AgentView 事例でテンプレートが適用可能であることを検証

#### 成果物

修正済みテンプレートファイル + チェックリスト

#### 完了条件

- Phase 2 テンプレートに責務マトリクスセクションが存在する
- Phase 3 チェックリストに検証項目が存在する
- テンプレートが AgentView 事例に適用可能である

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Phase 2 テンプレートに「テストファイル責務マトリクス」セクションが追加されている
- [ ] Phase 3 レビューチェックリストに責務マトリクス検証項目が追加されている
- [ ] `testing-component-patterns.md` に責務マトリクステンプレートが記載されている
- [ ] 実際のコンポーネント分割タスク（TASK-UI-03の事例）でテンプレートが適用可能であることを検証

### 品質要件

- [ ] テンプレートのマークダウン構文が正しい
- [ ] 既存テンプレートとの整合性が保たれている

### ドキュメント要件

- [ ] lessons-learned.md に教訓追記
- [ ] documentation-changelog.md に変更内容記録

---

## 6. 検証方法

### テストケース

- Phase 2 テンプレートに責務マトリクスセクションが含まれていること
- Phase 3 チェックリストに検証項目が含まれていること
- TASK-UI-03 の AgentView 分割事例に対してテンプレートを適用し、以下のマトリクスが自然に導出できること:

| コンポーネント | テストファイル            | テスト責務                          |
| -------------- | ------------------------- | ----------------------------------- |
| AgentView      | AgentView.layout.test.tsx | 子コンポーネントの配置・表示制御    |
| SkillChip      | SkillChip.test.tsx        | 単体UI: Props渡し、クリックイベント |
| ExecuteButton  | ExecuteButton.test.tsx    | 単体UI: 状態別表示、disabled制御    |

### 検証手順

```bash
# テンプレートファイルに責務マトリクスセクションが存在することを確認
grep -n "テストファイル責務マトリクス" .claude/skills/task-specification-creator/references/phase-templates.md
grep -n "責務マトリクス" .claude/skills/aiworkflow-requirements/references/testing-component-patterns.md
```

---

## 7. リスクと対策

| リスク                                        | 影響度 | 発生確率 | 対策                                                         |
| --------------------------------------------- | ------ | -------- | ------------------------------------------------------------ |
| テンプレート追加がPhase 2の記述量を増大させる | 低     | 中       | コンポーネント分割タスクの場合のみ記述を求める条件付きにする |
| 責務マトリクスが形骸化する                    | 中     | 低       | Phase 3 レビューで妥当性を検証する項目として明示する         |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - 「AgentView コンポーネント分割時のテスト戦略」セクション
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` - セクション15「テストファイル拡張分離パターン」
- `.claude/skills/skill-creator/references/patterns.md` - 「コンポーネント分割テスト戦略パターン」

### 参考資料

- `apps/desktop/src/renderer/components/organisms/AgentView/__tests__/` - TASK-UI-03 でのテスト分割実装例
- `.claude/skills/task-specification-creator/references/phase-templates.md` - 現行 Phase 2/3/4 テンプレート

---

## 9. 備考

### TASK-UI-03 からの教訓（苦戦箇所）

- AgentView（556行テスト）をコンポーネント分割した際、元のテストが統合テスト的に書かれており、個別コンポーネント単体テストへの変換が困難だった
- 分割後、どのテストケースがどのコンポーネントに属するかの判断に時間がかかった
- レイアウトテスト（`.layout.test.tsx`）と個別テストの境界が不明確だった
- 根本原因: Phase 2（設計）でテストファイルの分割戦略を定義しなかったため、テスト設計が Phase 4（テスト作成）まで後回しになった

### 補足事項

- 優先度「中」: コンポーネント分割は繰り返し発生するパターンのため、早期にガードを設けることで累積的な手戻りコストを削減できる
- テンプレート追加はコンポーネント分割タスクに限定し、全タスクに一律で適用しない（過剰な記述負荷を避ける）

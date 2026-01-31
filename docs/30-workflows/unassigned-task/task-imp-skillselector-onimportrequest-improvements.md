# SkillSelector onImportRequest prop 追加 - タスク指示書

## メタ情報

```yaml
issue_number: 599
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | task-imp-skillselector-onimportrequest-001 |
| タスク名     | SkillSelector onImportRequest prop 追加    |
| 分類         | 改善                                       |
| 対象機能     | SkillSelector コンポーネント               |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 3（設計レビュー MINOR 判定）         |
| 発見日       | 2026-01-30                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-7D（ChatPanel 統合）の Phase 3 設計レビューにおいて、SkillSelector コンポーネントに `onImportRequest` prop が存在しないことが MINOR 判定で指摘された。ChatPanel は `handleImportRequest` メソッドを内部に持ち、`useImperativeHandle` で外部公開しているが、SkillSelector から直接呼び出す UI 動線が存在しない。

### 1.2 問題点・課題

現状の SkillSelector は「スキル選択」のみを担当しており、未インポートのスキルをクリックした場合の「インポート提案」動線がない。ユーザーが未インポートスキルを選択した際、インポートダイアログへの誘導が自動的に行われず、別途手動操作が必要となる。

具体的には以下の問題がある:

1. SkillSelector の Props に `onImportRequest` コールバックが定義されていない
2. 未インポートスキル選択時のフローが未定義
3. ChatPanel の `handleImportRequest` との接続が ref 経由のみで、宣言的な Props 経由の接続ができない

### 1.3 放置した場合の影響

- ユーザーが未インポートスキルを選択した際の導線が不足し、UX が低下する
- ChatPanel の `handleImportRequest` が ref 経由でのみ利用可能で、宣言的なデータフローの一貫性が損なわれる
- ただし、ref 経由で同等機能は実現済みであるため、機能的なブロッカーにはならない

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillSelector コンポーネントに `onImportRequest` コールバック prop を追加し、未インポートスキル選択時に ChatPanel のインポートダイアログを自動表示する UI 動線を構築する。

### 2.2 最終ゴール

- SkillSelector で未インポートスキルを選択した際、自動的に SkillImportDialog が表示される
- ChatPanel 側で `<SkillSelector onImportRequest={handleImportRequest} />` として宣言的に接続できる
- 既存の ref 経由のフローも維持され、後方互換性がある

### 2.3 スコープ

#### 含むもの

- SkillSelector Props への `onImportRequest?: (skill: SkillMetadata) => void` 追加
- SkillSelector 内部での未インポートスキル判定ロジック
- ChatPanel での SkillSelector `onImportRequest` prop 接続
- 関連する単体テスト追加

#### 含まないもの

- SkillSelector の UI デザイン変更
- スキルインポートフロー自体の変更
- SkillImportDialog の機能変更

### 2.4 成果物

| 成果物                     | 説明                                           |
| -------------------------- | ---------------------------------------------- |
| SkillSelector.tsx（更新）  | `onImportRequest` prop 追加、未インポート判定  |
| ChatPanel.tsx（更新）      | SkillSelector への `onImportRequest` prop 接続 |
| SkillSelector.test.tsx     | `onImportRequest` コールバック呼び出しテスト   |
| ChatPanel.test.tsx（更新） | SkillSelector 経由のインポート動線テスト       |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-7A（SkillSelector 実装）が完了していること
- TASK-7D（ChatPanel 統合）が完了していること
- `@repo/shared` の `SkillMetadata` 型が利用可能であること

### 3.2 依存タスク

| タスクID | タスク名           | ステータス |
| -------- | ------------------ | ---------- |
| TASK-7A  | SkillSelector 実装 | 完了       |
| TASK-7D  | ChatPanel 統合     | 完了       |

### 3.3 必要な知識

- React コンポーネント Props 設計
- Zustand Store セレクタパターン
- `SkillMetadata` 型の `imported` 判定ロジック（Store 内の `availableSkillsMetadata` 参照）
- 既存の SkillSelector のドロップダウン UI パターン（WAI-ARIA Listbox）

### 3.4 推奨アプローチ

1. SkillSelector の `SkillSelectorProps` インターフェースに `onImportRequest` を追加
2. ドロップダウンの `onChange` ハンドラ内で、選択されたスキルが未インポートかを判定
3. 未インポートの場合は `onImportRequest(skill)` を呼び出し、通常選択は既存フローを維持
4. ChatPanel 側で `handleImportRequest` を SkillSelector の `onImportRequest` に接続

---

## 4. 実行手順

### Phase構成

本タスクは小規模であり、Phase 4（テスト作成）→ Phase 5（実装）→ Phase 6（テスト拡充）の TDD サイクルで実施する。

### Phase 4: テスト作成

#### 目的

SkillSelector の `onImportRequest` コールバック呼び出しをテストするテストケースを作成する。

#### 手順

1. `SkillSelector.test.tsx` に `onImportRequest` テストケースを追加
2. 未インポートスキル選択時にコールバックが呼ばれることを検証
3. インポート済みスキル選択時にコールバックが呼ばれないことを検証
4. `ChatPanel.test.tsx` に SkillSelector 経由のインポート動線テストを追加

#### 成果物

- `SkillSelector.test.tsx`（テストケース追加）
- `ChatPanel.test.tsx`（テストケース追加）

#### 完了条件

- テストがすべて RED（失敗）状態であること

### Phase 5: 実装

#### 目的

テストを GREEN にする最小限の実装を行う。

#### 手順

1. `SkillSelectorProps` に `onImportRequest?: (skill: SkillMetadata) => void` を追加
2. `handleSkillSelect` 内で未インポート判定ロジックを追加
3. ChatPanel の JSX で `<SkillSelector onImportRequest={handleImportRequest} />` を接続
4. テストがすべて PASS することを確認

#### 成果物

- `SkillSelector.tsx`（更新）
- `ChatPanel.tsx`（更新）

#### 完了条件

- 全テストが PASS
- TypeScript strict チェック PASS
- ESLint / Prettier PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] SkillSelector Props に `onImportRequest` コールバックが追加されている
- [ ] 未インポートスキル選択時に `onImportRequest` が呼ばれる
- [ ] インポート済みスキル選択時は既存の選択フローが維持される
- [ ] ChatPanel から SkillSelector への `onImportRequest` 接続が動作する

### 品質要件

- [ ] 全テスト PASS（既存テスト含む回帰テスト）
- [ ] TypeScript strict PASS
- [ ] ESLint / Prettier PASS
- [ ] Line Coverage >= 80%, Function Coverage >= 80%

### ドキュメント要件

- [ ] 実装ガイド（Part 1 / Part 2）が作成されている
- [ ] システム仕様書が更新されている
- [ ] artifacts.json が更新されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                                       | 期待結果                               |
| ------ | ------------------------------------------------ | -------------------------------------- |
| TC-001 | 未インポートスキル選択時にコールバックが呼ばれる | `onImportRequest` が引数付きで呼ばれる |
| TC-002 | インポート済みスキル選択時は通常フロー           | `onImportRequest` は呼ばれない         |
| TC-003 | `onImportRequest` 未指定時は何も起こらない       | エラーなし、通常選択のみ               |
| TC-004 | ChatPanel 経由でインポートダイアログが表示される | SkillImportDialog が表示される         |

### 検証手順

1. `cd apps/desktop && npx vitest run --grep "SkillSelector"` でテスト実行
2. `cd apps/desktop && npx vitest run --grep "ChatPanel"` でテスト実行
3. `npx vitest run --coverage` でカバレッジ確認

---

## 7. リスクと対策

| リスク                               | 影響度 | 発生確率 | 対策                                               |
| ------------------------------------ | ------ | -------- | -------------------------------------------------- |
| 未インポート判定ロジックが複雑化する | 低     | 低       | Store の既存データを活用し、単純な判定に留める     |
| 既存 SkillSelector テストが壊れる    | 中     | 低       | オプショナル prop として追加、既存テストに影響なし |
| ref 経由フローとの競合               | 低     | 低       | 両方のフローを独立して機能させる                   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                     | パス                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------------- |
| TASK-7A SkillSelector 実装ガイド | `docs/30-workflows/TASK-7A-skill-selector/outputs/phase-12/implementation-guide.md`               |
| TASK-7D ChatPanel 統合実装ガイド | `docs/30-workflows/TASK-7D-chat-panel-integration/outputs/phase-12/implementation-guide-part2.md` |
| SkillStreamDisplay 仕様          | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-skill-stream.md`                 |
| UIコンポーネントパターン         | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                         |

### 参考資料

- WAI-ARIA Listbox パターン仕様（TASK-7A で準拠済み）
- React forwardRef / useImperativeHandle パターン（TASK-7D で採用）

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 3 設計レビュー MINOR 判定:
SkillSelector に onImportRequest prop が存在しないため、
未インポートスキルクリック時に ChatPanel の handleImportRequest が
自動トリガーされない。現状は ref 経由で親コンポーネントから呼出可能。
```

### 補足事項

- TASK-8 系列での対応を推奨
- ref 経由で同等機能は実現済みであるため、緊急度は低い
- 実装時は WAI-ARIA Listbox パターン（TASK-7A）との整合性を維持すること

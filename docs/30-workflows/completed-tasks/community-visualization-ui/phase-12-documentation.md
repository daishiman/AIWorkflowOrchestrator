# Phase 12: ドキュメント更新 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 12                         |
| Phase名    | ドキュメント更新           |
| 前提Phase  | Phase 11                   |
| 後続Phase  | Phase 13                   |
| ステータス | 未実施                     |
| 作成日     | 2026-01-13                 |
| 機能名     | community-visualization-ui |

---

## 目的

実装した内容を「概念的な説明」と「技術的な詳細」の両面からドキュメント化し、システム仕様への反映と未タスクの検出を行う。

## 背景

実装完了後、将来のメンテナンスや拡張のために、実装ガイドとシステムドキュメントを更新する。また、Phase 3, 9, 11で発見されたスコープ外の課題を未タスクとして記録する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 実装ガイド作成（Part 1: 概念的説明）

**目的**: 実装内容を概念的に説明するドキュメントを作成する

**実行手順**:

1. 実装ガイドファイルを作成: `outputs/phase-12/implementation-guide.md`
2. 以下のセクションを記述:

   **Part 1: 概念的な説明**

   ```markdown
   ## コミュニティ構造可視化とは

   ### 比喩で理解する

   コミュニティ構造は「地図」のようなものです。

   - エンティティ（人物、概念など）は「建物」
   - コミュニティは「地区」や「街区」
   - 階層レベルは「区 > 町 > 丁目」のような行政区分

   ### なぜ可視化が必要か

   データベースに保存されているコミュニティ情報は数値とIDの羅列です。
   これを人間が理解するには、視覚的な表現に変換する必要があります。
   グラフ表示により：

   - どのエンティティがどのコミュニティに属しているか
   - コミュニティ間の関係性
   - 階層構造
     が一目で分かるようになります。
   ```

**期待される成果物**:

- 実装ガイド Part 1

---

### タスク2: 実装ガイド作成（Part 2: 技術的詳細）

**目的**: 実装の技術的な詳細を記述する

**実行手順**:

1. 以下のセクションを追記:

   **Part 2: 技術的な詳細**

   ```markdown
   ## 全体アーキテクチャ
   ```

   ┌─────────────────────────────────────────────────────────┐
   │ Renderer Process │
   │ ┌─────────────────────────────────────────────────┐ │
   │ │ CommunityVisualization (統合ビュー) │ │
   │ │ ├── CommunityFilter │ │
   │ │ ├── CommunityGraph (react-flow) │ │
   │ │ └── CommunityDetailPanel │ │
   │ └─────────────────────────────────────────────────┘ │
   │ │ │
   │ useCommunities (Hook) │
   │ │ IPC │
   └─────────────────────────────────────────────────────────┘
   │
   ┌─────────────────────────────────────────────────────────┐
   │ Main Process │
   │ │ │
   │ CommunityDetector ← → CommunityRepository │
   │ │ │
   │ SQLite Database │
   └─────────────────────────────────────────────────────────┘

   ```

   ## コンポーネント設計

   ### なぜこの設計にしたか

   1. **責務分離**: 各コンポーネントが単一の責務を持つ
      - CommunityGraph: 描画のみ
      - CommunityDetailPanel: 詳細表示のみ
      - CommunityFilter: フィルタリングロジックのみ

   2. **react-flowを選んだ理由**:
      - React専用で統合が容易
      - TypeScript完全対応
      - 階層レイアウト（dagre）対応

   ## 用語集

   | 用語 | 読み方 | 意味 |
   | ---- | ------ | ---- |
   | Community | コミュニティ | 意味的に関連するエンティティの集まり |
   | Level | レベル | 階層の深さ（0が最下層） |
   | Modularity | モジュラリティ | クラスタリングの品質指標 |
   | dagre | ダグレ | 階層グラフレイアウトアルゴリズム |
   ```

**期待される成果物**:

- 実装ガイド Part 2

---

### タスク3: システムドキュメント更新

**目的**: 既存のシステム仕様に実装内容を反映する

**実行手順**:

1. 更新対象ファイルを確認:
   - `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`
2. コミュニティ可視化UIセクションを追加:

   ```markdown
   ## Community Visualization UI コンポーネント（CONV-08-05）

   ### コンポーネント階層

   - CommunityVisualization (templates)
   - CommunityGraph (organisms)
   - CommunityDetailPanel (organisms)
   - CommunityFilter (molecules)

   ### 使用ライブラリ

   - @xyflow/react: グラフ可視化
   - dagre: 階層レイアウト
   ```

3. ドキュメント更新記録を作成

**期待される成果物**:

- 更新されたシステム仕様
- ドキュメント更新記録

---

### タスク4: 未タスク検出

**目的**: スコープ外の発見事項を未タスクとして記録する

**実行手順**:

1. 以下のソースから未タスク候補を収集:
   - Phase 3 レビュー結果（MINOR判定の指摘事項）
   - Phase 9 レビュー結果（MINOR判定の指摘事項）
   - Phase 11 手動テスト結果（スコープ外の発見事項）
   - コードベースのTODO/FIXME/HACKコメント
     ```bash
     grep -rn "TODO\|FIXME\|HACK\|XXX" apps/desktop/src/renderer/components/community/
     ```
2. 未タスク検出レポートを作成
3. 該当する場合は未タスク指示書を作成:
   `docs/30-workflows/unassigned-task/` に配置

**期待される成果物**:

- 未タスク検出レポート
- 未タスク指示書（該当する場合）

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                    | 内容                 |
| ---------------------- | --------------------------------------------------------------------------------------- | -------------------- |
| 技術ドキュメントガイド | `.claude/skills/task-specification-creator/references/technical-documentation-guide.md` | ドキュメント作成基準 |
| 実装ガイドテンプレート | `.claude/skills/task-specification-creator/assets/implementation-guide-template.md`     | ガイド構造           |
| 未タスクガイドライン   | `.claude/skills/task-specification-creator/references/unassigned-task-guidelines.md`    | 未タスク作成基準     |
| コンポーネントUI仕様   | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                 | 更新対象             |

---

## 成果物

| 成果物               | パス                                           | 内容           |
| -------------------- | ---------------------------------------------- | -------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`     | 概念+技術詳細  |
| ドキュメント更新記録 | `outputs/phase-12/documentation-update-log.md` | 更新内容の記録 |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-report.md`   | 未タスク一覧   |
| 未タスク指示書       | `docs/30-workflows/unassigned-task/`（該当時） | 新規未タスク   |

---

## 完了条件

- [ ] 実装ガイド（Part 1: 概念的説明 + Part 2: 技術的詳細）が作成されている
- [ ] ドキュメント更新記録が出力されている
- [ ] 未タスク検出レポートが出力されている
- [ ] 検出された未タスクに対して指示書が作成されている（該当する場合）
- [ ] aiworkflow-requirementsが更新されている（該当する場合）

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 11（手動テスト）が完了していること
- **後続**: Phase 13（PR作成）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-visualization-ui/phase-13-pr-creation.md`

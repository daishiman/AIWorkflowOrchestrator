# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 1                          |
| Phase名    | 要件定義                   |
| 前提Phase  | -                          |
| 後続Phase  | Phase 2                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-13                 |
| 機能名     | community-visualization-ui |

---

## 目的

コミュニティ構造可視化UIの機能要件・非機能要件・受け入れ基準を明確化し、後続の設計・実装の基礎を確立する。

## 背景

CONV-08-02（Leidenコミュニティ検出）とCONV-08-03（コミュニティ要約生成）で作成されたデータをユーザーが視覚的に確認・探索できるUIが必要。現状ではコミュニティ構造がデータベースにのみ存在し、ユーザーが確認できない状態である。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 既存システム仕様の確認

**目的**: コミュニティ関連の既存インターフェース・型定義を把握する

**実行手順**:

1. `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` を確認
2. `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` を確認
3. 既存の型定義（Community, CommunitySummary, CommunityId等）を整理
4. ICommunityRepository, ICommunityDetector, ICommunitySummarizerのメソッドを確認

**期待される成果物**:

- 既存インターフェース整理ドキュメント

---

### タスク2: 機能要件の定義

**目的**: UIが提供すべき機能を明確に定義する

**実行手順**:

1. 以下の機能要件を文書化:
   - FR-001: コミュニティ構造のグラフ/ツリー表示
   - FR-002: コミュニティクリックによる詳細パネル表示
   - FR-003: コミュニティ要約の表示
   - FR-004: メンバーエンティティの表示
   - FR-005: 階層レベルによるフィルタリング
   - FR-006: コミュニティ検索
   - FR-007: ズーム・パン操作
   - FR-008: 空状態・エラー状態の表示
2. 各要件に優先度（必須/推奨）を設定
3. 受け入れ基準を定義

**期待される成果物**:

- 機能要件一覧
- 受け入れ基準一覧

---

### タスク3: 非機能要件の定義

**目的**: パフォーマンス・アクセシビリティ等の品質要件を定義する

**実行手順**:

1. パフォーマンス要件:
   - 100件以上のコミュニティでの描画性能
   - 初期表示時間
   - スクロール・ズームのフレームレート
2. アクセシビリティ要件:
   - WCAG 2.1 AA準拠
   - キーボードナビゲーション
   - スクリーンリーダー対応
3. 型安全性要件:
   - Branded Types使用（CommunityId）
   - Result型パターンの採用
4. テスト要件:
   - ユニットテストカバレッジ目標
   - 統合テスト範囲

**期待される成果物**:

- 非機能要件一覧

---

### タスク4: 接続要件（IPC/データフロー）の明記

**目的**: Electron IPC通信とデータフローを明確化する

**実行手順**:

1. 必要なIPCチャンネルを定義:
   - `community:getAll` - 全コミュニティ取得
   - `community:getByLevel` - レベル別取得
   - `community:getMembers` - メンバー取得
   - `community:search` - 検索
2. データフローを図示:
   ```
   Renderer (React)
       ↓ IPC invoke
   Main Process (Electron)
       ↓
   CommunityDetector / CommunityRepository
       ↓
   SQLite Database
   ```
3. エラーハンドリング方針を定義

**期待される成果物**:

- IPC通信仕様
- データフロー図

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                          | 内容                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------------------------------- |
| コミュニティ検出仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | Community型、ICommunityDetector          |
| コミュニティ要約仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | CommunitySummary型、ICommunitySummarizer |
| UI/UXデザインシステム  | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                    | デザイントークン、カラー、スペーシング   |
| コンポーネント設計原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                       | Atomic Design、命名規則                  |

---

## 成果物

| 成果物                   | パス                                             | 内容                           |
| ------------------------ | ------------------------------------------------ | ------------------------------ |
| 既存インターフェース整理 | `outputs/phase-1/existing-interfaces.md`         | 既存の型・インターフェース一覧 |
| 機能要件書               | `outputs/phase-1/functional-requirements.md`     | 機能要件一覧                   |
| 非機能要件書             | `outputs/phase-1/non-functional-requirements.md` | 非機能要件一覧                 |
| 接続要件書               | `outputs/phase-1/connection-requirements.md`     | IPC仕様・データフロー          |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 1の統合テスト連携アクション**: 接続要件（IPC/データフロー）を要件に明記

- Renderer Process ↔ Main Process間のIPC通信仕様を定義
- データ取得・エラーハンドリングのフローを明確化
- テスト時のモック戦略を検討

---

## 完了条件

- [ ] 既存のコミュニティ関連インターフェースを確認・整理した
- [ ] 機能要件8項目を定義し、優先度を設定した
- [ ] 非機能要件（パフォーマンス・アクセシビリティ・型安全性）を定義した
- [ ] IPC通信仕様・データフローを明確化した
- [ ] 全成果物が `outputs/phase-1/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: なし（最初のPhase）
- **後続**: Phase 2（設計）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-visualization-ui/phase-2-design.md`

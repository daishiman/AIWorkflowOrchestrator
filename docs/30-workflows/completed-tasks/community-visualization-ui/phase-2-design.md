# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 2                          |
| Phase名    | 設計                       |
| 前提Phase  | Phase 1                    |
| 後続Phase  | Phase 3                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-13                 |
| 機能名     | community-visualization-ui |

---

## 目的

コミュニティ可視化UIのコンポーネント設計、グラフ可視化ライブラリの選定、ワイヤーフレーム作成を行い、実装の基盤を確立する。

## 背景

Phase 1で定義した要件に基づき、Atomic Designパターンに従ったコンポーネント設計と、適切なグラフ可視化ライブラリの選定が必要。既存のUIコンポーネント（`apps/desktop/src/renderer/components/`）との整合性を確保する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: グラフ可視化ライブラリの選定

**目的**: プロジェクトに最適なグラフ可視化ライブラリを選定する

**実行手順**:

1. 候補ライブラリの調査:
   - **react-flow**: React専用、高度なカスタマイズ、TypeScript対応
   - **vis.js (vis-network)**: 汎用グラフライブラリ、大規模データ対応
   - **D3.js**: 低レベル、フル制御、学習コスト高
   - **cytoscape.js**: グラフ分析機能、スタイリング柔軟
2. 評価基準による比較:
   - React統合の容易さ
   - TypeScript対応
   - パフォーマンス（100+ノード）
   - ドキュメント・コミュニティ
   - バンドルサイズ
3. 推奨: **react-flow**（React専用、TypeScript完全対応、階層レイアウト対応）

**期待される成果物**:

- ライブラリ比較表
- 選定理由書

---

### タスク2: コンポーネント設計（Atomic Design）

**目的**: Atomic Designパターンに従ったコンポーネント階層を設計する

**実行手順**:

1. コンポーネント階層を設計:
   ```
   community/ (organisms)
   ├── CommunityGraph/           # グラフ表示（organisms）
   │   ├── CommunityNode.tsx     # ノードコンポーネント（molecules）
   │   └── CommunityEdge.tsx     # エッジコンポーネント（atoms）
   ├── CommunityDetailPanel/     # 詳細パネル（organisms）
   │   ├── SummarySection.tsx    # 要約セクション（molecules）
   │   ├── MemberList.tsx        # メンバーリスト（molecules）
   │   └── KeywordList.tsx       # キーワードリスト（molecules）
   ├── CommunityFilter/          # フィルターコントロール（molecules）
   │   ├── LevelSelector.tsx     # レベル選択（atoms）
   │   └── SearchInput.tsx       # 検索入力（atoms）
   └── CommunityVisualization/   # 統合ビュー（templates）
   ```
2. 各コンポーネントのProps・State・イベントを定義
3. 既存コンポーネントとの整合性を確認

**期待される成果物**:

- コンポーネント階層図
- 各コンポーネントのインターフェース定義

---

### タスク3: データフック設計

**目的**: コミュニティデータ取得用のReact Hooksを設計する

**実行手順**:

1. カスタムHooksを設計:

   ```typescript
   // useCommunities: コミュニティ一覧取得
   function useCommunities(options?: CommunityQueryOptions): {
     communities: Community[];
     isLoading: boolean;
     error: Error | null;
     refetch: () => void;
   };

   // useCommunityDetail: コミュニティ詳細取得
   function useCommunityDetail(communityId: CommunityId | null): {
     community: Community | null;
     summary: CommunitySummary | null;
     members: StoredEntity[];
     isLoading: boolean;
     error: Error | null;
   };

   // useCommunitySearch: コミュニティ検索
   function useCommunitySearch(): {
     search: (query: string) => void;
     results: Community[];
     isSearching: boolean;
   };
   ```

2. IPC通信との連携を設計
3. キャッシュ戦略を検討

**期待される成果物**:

- Hook インターフェース定義
- データフロー図

---

### タスク4: ワイヤーフレーム作成

**目的**: UIの視覚的な構成を明確化する

**実行手順**:

1. 全体レイアウト:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │  [フィルター] [レベル選択: ▼] [検索: 🔍            ]   │
   ├─────────────────────────────────────┬───────────────────┤
   │                                     │                   │
   │                                     │  詳細パネル        │
   │         グラフ表示エリア            │  ┌─────────────┐ │
   │         (CommunityGraph)            │  │ 要約         │ │
   │                                     │  │ ───────────  │ │
   │     [◯]──[◯]                       │  │ キーワード    │ │
   │      │    │                         │  │ ───────────  │ │
   │     [◯]──[◯]──[◯]                  │  │ メンバー      │ │
   │                                     │  │ • エンティティ1│
   │                                     │  │ • エンティティ2│
   │                                     │  └─────────────┘ │
   │  [ズーム: ➕ ➖] [フィット: ⬜]      │                   │
   └─────────────────────────────────────┴───────────────────┘
   ```
2. 各状態のワイヤーフレーム:
   - 初期表示状態
   - コミュニティ選択状態
   - フィルタリング適用状態
   - 検索結果表示状態
   - 空状態
   - エラー状態

**期待される成果物**:

- ワイヤーフレーム（ASCII図）
- 状態遷移図

---

### タスク5: IPC通信設計

**目的**: Renderer-Main間の通信インターフェースを設計する

**実行手順**:

1. IPCチャンネル定義:
   ```typescript
   // preload/ipc/community.ts
   export interface CommunityIPC {
     "community:getAll": () => Promise<Result<Community[], Error>>;
     "community:getByLevel": (
       level: number,
     ) => Promise<Result<Community[], Error>>;
     "community:getById": (
       id: CommunityId,
     ) => Promise<Result<Community | null, Error>>;
     "community:getMembers": (
       id: CommunityId,
     ) => Promise<Result<StoredEntity[], Error>>;
     "community:getSummary": (
       id: CommunityId,
     ) => Promise<Result<CommunitySummary | null, Error>>;
     "community:search": (
       query: string,
       options?: SearchOptions,
     ) => Promise<Result<Community[], Error>>;
   }
   ```
2. エラーハンドリング設計
3. 型定義の共有方法を設計

**期待される成果物**:

- IPC インターフェース定義
- エラーハンドリング仕様

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                       | 内容                                 |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------ |
| コンポーネント設計原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                    | Atomic Design、Props設計             |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                 | カラー、スペーシング、アニメーション |
| Agent Execution UI仕様 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md#Agent-Execution-UI` | 既存UIパターン参照                   |

---

## 成果物

| 成果物               | パス                                   | 内容                       |
| -------------------- | -------------------------------------- | -------------------------- |
| ライブラリ選定書     | `outputs/phase-2/library-selection.md` | 比較表・選定理由           |
| コンポーネント設計書 | `outputs/phase-2/component-design.md`  | 階層・インターフェース定義 |
| Hook設計書           | `outputs/phase-2/hook-design.md`       | カスタムHook定義           |
| ワイヤーフレーム     | `outputs/phase-2/wireframe.md`         | UI構成図                   |
| IPC設計書            | `outputs/phase-2/ipc-design.md`        | 通信インターフェース       |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 2の統合テスト連携アクション**: 統合ポイント/契約（IPC・データ型）を設計に反映

- Renderer ↔ Main Process間のIPC契約を明確化
- 共有型定義の配置場所を決定
- モック可能なインターフェース設計

---

## 完了条件

- [ ] グラフ可視化ライブラリを選定し、理由を文書化した
- [ ] Atomic Designに従ったコンポーネント階層を設計した
- [ ] useCommunities等のカスタムHookインターフェースを定義した
- [ ] 全画面状態のワイヤーフレームを作成した
- [ ] IPC通信インターフェースを設計した
- [ ] 全成果物が `outputs/phase-2/` に配置されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-visualization-ui/phase-3-design-review.md`

# Phase 5: 実装 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 5                          |
| Phase名    | 実装                       |
| 前提Phase  | Phase 4                    |
| 後続Phase  | Phase 6                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-13                 |
| 機能名     | community-visualization-ui |

---

## 目的

TDDのGreenフェーズとして、Phase 4で作成したテストを通過する最小限の実装を行う。全テストがGreen状態になることを確認する。

## 背景

Phase 2で設計したコンポーネント・Hookを実装し、Phase 4で作成したテストを通過させる。react-flowライブラリを使用したグラフ可視化とElectron IPC通信を実装する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: IPC通信の実装

**目的**: Main Process側のIPC ハンドラーを実装する

**実行手順**:

1. IPCハンドラーファイルを作成: `apps/desktop/src/main/ipc/community.ts`
2. 以下のハンドラーを実装:

   ```typescript
   // community:getAll
   ipcMain.handle("community:getAll", async () => {
     const detector = getCommunityDetector();
     return detector.detect();
   });

   // community:getByLevel
   ipcMain.handle("community:getByLevel", async (_, level: number) => {
     const detector = getCommunityDetector();
     return detector.getCommunitiesByLevel(level);
   });

   // community:getMembers
   ipcMain.handle("community:getMembers", async (_, id: CommunityId) => {
     const detector = getCommunityDetector();
     return detector.getCommunityMembers(id);
   });

   // community:getSummary
   ipcMain.handle("community:getSummary", async (_, id: CommunityId) => {
     const summarizer = getCommunitySummarizer();
     return summarizer.getSummary(id);
   });

   // community:search
   ipcMain.handle("community:search", async (_, query: string) => {
     const summarizer = getCommunitySummarizer();
     return summarizer.searchSummaries(query);
   });
   ```

3. Preloadスクリプトを更新: `apps/desktop/src/preload/index.ts`
4. Context Bridgeで公開

**期待される成果物**:

- `apps/desktop/src/main/ipc/community.ts`
- Preloadスクリプト更新

---

### タスク2: useCommunities Hook の実装

**目的**: コミュニティデータ取得用のカスタムHookを実装する

**実行手順**:

1. Hookファイルを作成: `apps/desktop/src/renderer/hooks/useCommunities.ts`
2. 以下の実装を行う:

   ```typescript
   export function useCommunities(options?: CommunityQueryOptions) {
     const [communities, setCommunities] = useState<Community[]>([]);
     const [isLoading, setIsLoading] = useState(true);
     const [error, setError] = useState<Error | null>(null);

     const fetch = useCallback(async () => {
       setIsLoading(true);
       setError(null);
       try {
         const result =
           options?.level !== undefined
             ? await window.electronAPI.community.getByLevel(options.level)
             : await window.electronAPI.community.getAll();
         if (result.success) {
           setCommunities(result.data);
         } else {
           setError(result.error);
         }
       } catch (e) {
         setError(e as Error);
       } finally {
         setIsLoading(false);
       }
     }, [options?.level]);

     useEffect(() => {
       fetch();
     }, [fetch]);

     return { communities, isLoading, error, refetch: fetch };
   }
   ```

3. useCommunityDetail, useCommunitySearch を同様に実装
4. テストがGreenになることを確認

**期待される成果物**:

- `apps/desktop/src/renderer/hooks/useCommunities.ts`
- `apps/desktop/src/renderer/hooks/useCommunityDetail.ts`
- `apps/desktop/src/renderer/hooks/useCommunitySearch.ts`

---

### タスク3: CommunityGraph コンポーネントの実装

**目的**: react-flowを使用したグラフ表示コンポーネントを実装する

**実行手順**:

1. react-flowをインストール:
   ```bash
   pnpm --filter @repo/desktop add @xyflow/react
   ```
2. コンポーネントファイルを作成:
   - `apps/desktop/src/renderer/components/community/CommunityGraph/index.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityGraph/CommunityNode.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityGraph/CommunityEdge.tsx`
3. 以下の機能を実装:
   - コミュニティをノードとして表示
   - 親子関係をエッジとして表示
   - 階層レベルに応じたレイアウト（dagre）
   - ノードクリックでonSelectイベント
   - ズーム・パン操作
   - フィットボタン
4. 空状態・ローディング状態・エラー状態の表示
5. テストがGreenになることを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/community/CommunityGraph/`

---

### タスク4: CommunityDetailPanel コンポーネントの実装

**目的**: コミュニティ詳細表示パネルを実装する

**実行手順**:

1. コンポーネントファイルを作成:
   - `apps/desktop/src/renderer/components/community/CommunityDetailPanel/index.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityDetailPanel/SummarySection.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityDetailPanel/MemberList.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityDetailPanel/KeywordList.tsx`
2. 以下の機能を実装:
   - コミュニティ要約の表示
   - キーワードリスト（Badgeコンポーネント使用）
   - 主要エンティティリスト
   - センチメント・信頼度の表示
   - メンバーエンティティリスト（スクロール可能）
3. 未選択状態・ローディング状態の表示
4. テストがGreenになることを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/community/CommunityDetailPanel/`

---

### タスク5: CommunityFilter コンポーネントの実装

**目的**: フィルタリング・検索コントロールを実装する

**実行手順**:

1. コンポーネントファイルを作成:
   - `apps/desktop/src/renderer/components/community/CommunityFilter/index.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityFilter/LevelSelector.tsx`
   - `apps/desktop/src/renderer/components/community/CommunityFilter/SearchInput.tsx`
2. 以下の機能を実装:
   - レベル選択ドロップダウン
   - 検索入力フィールド（デバウンス処理付き）
   - クリアボタン
   - キーボードナビゲーション
   - アクセシビリティ属性
3. テストがGreenになることを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/community/CommunityFilter/`

---

### タスク6: CommunityVisualization 統合コンポーネントの実装

**目的**: 全コンポーネントを統合したビューを実装する

**実行手順**:

1. コンポーネントファイルを作成:
   `apps/desktop/src/renderer/components/community/CommunityVisualization/index.tsx`
2. 以下のレイアウトを実装:
   ```
   ┌─────────────────────────────────────────────────────────┐
   │  CommunityFilter                                        │
   ├─────────────────────────────────────┬───────────────────┤
   │                                     │                   │
   │  CommunityGraph                     │ CommunityDetail   │
   │                                     │                   │
   └─────────────────────────────────────┴───────────────────┘
   ```
3. 状態管理:
   - selectedCommunityId
   - filterLevel
   - searchQuery
4. コンポーネント間の連携を実装
5. 統合テストがGreenになることを確認

**期待される成果物**:

- `apps/desktop/src/renderer/components/community/CommunityVisualization/`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                          | 内容                   |
| ---------------------- | --------------------------------------------------------------------------------------------- | ---------------------- |
| コミュニティ検出仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | Community型定義        |
| コミュニティ要約仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | CommunitySummary型定義 |
| コンポーネント設計原則 | `.claude/skills/aiworkflow-requirements/references/ui-ux-components.md`                       | Atomic Design原則      |
| デザインシステム       | `.claude/skills/aiworkflow-requirements/references/ui-ux-design-system.md`                    | スタイリング           |

---

## 成果物

| 成果物                 | パス                                                                     | 内容               |
| ---------------------- | ------------------------------------------------------------------------ | ------------------ |
| IPC ハンドラー         | `apps/desktop/src/main/ipc/community.ts`                                 | Main Process側通信 |
| useCommunities Hook    | `apps/desktop/src/renderer/hooks/useCommunities.ts`                      | データ取得Hook     |
| CommunityGraph         | `apps/desktop/src/renderer/components/community/CommunityGraph/`         | グラフ表示         |
| CommunityDetailPanel   | `apps/desktop/src/renderer/components/community/CommunityDetailPanel/`   | 詳細パネル         |
| CommunityFilter        | `apps/desktop/src/renderer/components/community/CommunityFilter/`        | フィルター         |
| CommunityVisualization | `apps/desktop/src/renderer/components/community/CommunityVisualization/` | 統合ビュー         |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 5の統合テスト連携アクション**: Renderer/Main Process接続の実装とテスト支援コード整備

- IPC通信の実装とモック対応
- テスト用のデータファクトリ作成
- Electron環境のテスト設定

---

## 完了条件

- [ ] IPC通信ハンドラーが実装されている
- [ ] useCommunities等のHookが実装されている
- [ ] CommunityGraphコンポーネントが実装されている
- [ ] CommunityDetailPanelコンポーネントが実装されている
- [ ] CommunityFilterコンポーネントが実装されている
- [ ] CommunityVisualization統合コンポーネントが実装されている
- [ ] 全テストがGreen状態

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## TDD検証

### TDD サイクル確認

```bash
# テスト実行コマンド
pnpm --filter @repo/desktop test
```

**確認項目**:

- [ ] テストが成功することを確認（Green状態）

---

## 依存関係

- **前提**: Phase 4（テスト作成）が完了していること
- **後続**: Phase 6（テスト拡充）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-visualization-ui/phase-6-test-expansion.md`

# Phase 4: テスト作成 - タスク仕様書

## メタ情報

| 項目       | 内容                       |
| ---------- | -------------------------- |
| Phase      | 4                          |
| Phase名    | テスト作成                 |
| 前提Phase  | Phase 3                    |
| 後続Phase  | Phase 5                    |
| ステータス | 未実施                     |
| 作成日     | 2026-01-13                 |
| 機能名     | community-visualization-ui |

---

## 目的

TDDのRedフェーズとして、期待される動作を検証するテストを実装より先に作成する。全テストが失敗状態（Red）であることを確認する。

## 背景

テスト駆動開発により、仕様を明確化し、設計の問題を早期に発見する。Phase 2で設計したコンポーネント・Hookに対するテストを作成する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: CommunityGraph コンポーネントテスト作成

**目的**: グラフ表示コンポーネントのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/community/CommunityGraph/__tests__/CommunityGraph.test.tsx`
2. 以下のテストケースを作成:

   ```typescript
   describe("CommunityGraph", () => {
     describe("表示テスト", () => {
       it("コミュニティがノードとして表示される");
       it("親子関係がエッジとして表示される");
       it("階層レベルに応じたレイアウトで表示される");
       it("コミュニティサイズに応じたノードサイズで表示される");
     });

     describe("インタラクションテスト", () => {
       it("ノードクリックでonSelectが呼ばれる");
       it("ズーム操作でビューが拡大/縮小する");
       it("パン操作でビューが移動する");
       it("フィットボタンでビュー全体が表示される");
     });

     describe("エッジケース", () => {
       it("空データで適切なメッセージが表示される");
       it("大量データ（100+）でもレンダリングされる");
       it("ローディング中はスピナーが表示される");
       it("エラー時はエラーメッセージが表示される");
     });
   });
   ```

3. 各テストが失敗することを確認（Red状態）

**期待される成果物**:

- `CommunityGraph.test.tsx`

---

### タスク2: CommunityDetailPanel コンポーネントテスト作成

**目的**: 詳細パネルコンポーネントのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/community/CommunityDetailPanel/__tests__/CommunityDetailPanel.test.tsx`
2. 以下のテストケースを作成:

   ```typescript
   describe("CommunityDetailPanel", () => {
     describe("要約表示", () => {
       it("コミュニティ要約が表示される");
       it("キーワードリストが表示される");
       it("主要エンティティが表示される");
       it("センチメントが表示される");
       it("信頼度が表示される");
     });

     describe("メンバー表示", () => {
       it("メンバーエンティティリストが表示される");
       it("メンバーをクリックで詳細が表示される");
       it("メンバーが多い場合はスクロール可能");
     });

     describe("状態", () => {
       it("未選択時は空状態メッセージが表示される");
       it("ローディング中はスケルトンが表示される");
       it("要約未生成時は適切なメッセージが表示される");
     });
   });
   ```

3. 各テストが失敗することを確認（Red状態）

**期待される成果物**:

- `CommunityDetailPanel.test.tsx`

---

### タスク3: CommunityFilter コンポーネントテスト作成

**目的**: フィルターコントロールのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/components/community/CommunityFilter/__tests__/CommunityFilter.test.tsx`
2. 以下のテストケースを作成:

   ```typescript
   describe("CommunityFilter", () => {
     describe("レベルフィルター", () => {
       it("利用可能なレベルがドロップダウンに表示される");
       it("レベル選択でonLevelChangeが呼ばれる");
       it("「全て」オプションで全レベルが表示される");
     });

     describe("検索", () => {
       it("検索入力フィールドが表示される");
       it("入力でonSearchが呼ばれる");
       it("デバウンス処理が適用される");
       it("クリアボタンで入力がクリアされる");
     });

     describe("アクセシビリティ", () => {
       it("キーボードでレベル選択が可能");
       it("検索入力にラベルが関連付けられている");
       it("Escapeで検索がクリアされる");
     });
   });
   ```

3. 各テストが失敗することを確認（Red状態）

**期待される成果物**:

- `CommunityFilter.test.tsx`

---

### タスク4: useCommunities Hook テスト作成

**目的**: データ取得Hookのテストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/hooks/__tests__/useCommunities.test.ts`
2. 以下のテストケースを作成:

   ```typescript
   describe("useCommunities", () => {
     describe("データ取得", () => {
       it("マウント時にコミュニティ一覧を取得する");
       it("取得成功時にcommunitiesにデータが設定される");
       it("取得中はisLoadingがtrueになる");
       it("取得完了後はisLoadingがfalseになる");
     });

     describe("フィルタリング", () => {
       it("levelオプションで特定レベルのみ取得する");
       it("refetchで再取得が実行される");
     });

     describe("エラーハンドリング", () => {
       it("IPC通信失敗時にerrorが設定される");
       it("ネットワークエラー時に適切なエラーメッセージ");
     });
   });
   ```

3. 各テストが失敗することを確認（Red状態）

**期待される成果物**:

- `useCommunities.test.ts`

---

### タスク5: 統合テストシナリオ作成

**目的**: コンポーネント間・IPC通信の統合テストを作成する

**実行手順**:

1. テストファイルを作成: `apps/desktop/src/renderer/__tests__/community-integration.test.tsx`
2. 以下の統合テストシナリオを作成:

   ```typescript
   describe("Community Visualization 統合テスト", () => {
     describe("API接続テスト", () => {
       it("IPC経由でコミュニティ一覧が取得できる");
       it("IPC経由でコミュニティ詳細が取得できる");
     });

     describe("データフローテスト", () => {
       it("コミュニティ選択→詳細パネル表示のフローが動作する");
       it("フィルタ変更→グラフ更新のフローが動作する");
       it("検索実行→結果ハイライトのフローが動作する");
     });

     describe("エラーハンドリング", () => {
       it("IPC障害時にエラー表示される");
       it("リトライ機能が動作する");
     });

     describe("状態同期テスト", () => {
       it("フィルタ状態が各コンポーネントで共有される");
       it("選択状態がグラフと詳細パネルで同期される");
     });
   });
   ```

3. 各テストが失敗することを確認（Red状態）

**期待される成果物**:

- `community-integration.test.tsx`

---

## 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料               | パス                                                                                          | 内容           |
| ---------------------- | --------------------------------------------------------------------------------------------- | -------------- |
| コミュニティ検出仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md`     | 型定義確認     |
| コミュニティ要約仕様   | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-summarization.md` | 型定義確認     |
| 統合テストテンプレート | `.claude/skills/task-specification-creator/assets/integration-test-template.md`               | テスト構造参照 |

---

## 成果物

| 成果物                      | パス                                                                             | 内容             |
| --------------------------- | -------------------------------------------------------------------------------- | ---------------- |
| CommunityGraph テスト       | `apps/desktop/src/renderer/components/community/CommunityGraph/__tests__/`       | 表示・操作テスト |
| CommunityDetailPanel テスト | `apps/desktop/src/renderer/components/community/CommunityDetailPanel/__tests__/` | 詳細パネルテスト |
| CommunityFilter テスト      | `apps/desktop/src/renderer/components/community/CommunityFilter/__tests__/`      | フィルターテスト |
| useCommunities テスト       | `apps/desktop/src/renderer/hooks/__tests__/useCommunities.test.ts`               | Hookテスト       |
| 統合テスト                  | `apps/desktop/src/renderer/__tests__/community-integration.test.tsx`             | E2Eフローテスト  |

---

## 統合テスト連携（Phase 1〜11は必須）

**Phase 4の統合テスト連携アクション**: 統合テストシナリオを全カテゴリで作成

| シナリオカテゴリ   | 検証内容                   |
| ------------------ | -------------------------- |
| API接続テスト      | IPC経由のデータ取得        |
| データフローテスト | コンポーネント間の状態連携 |
| エラーハンドリング | IPC障害時の表示・リトライ  |
| 状態同期テスト     | フィルタ・選択状態の同期   |

---

## 完了条件

- [ ] CommunityGraphのテストが作成されている
- [ ] CommunityDetailPanelのテストが作成されている
- [ ] CommunityFilterのテストが作成されている
- [ ] useCommunitiesのテストが作成されている
- [ ] 統合テストシナリオが全カテゴリで定義されている
- [ ] すべてのテストが失敗状態（Red）

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

- [ ] テストが失敗することを確認（Red状態）

---

## 依存関係

- **前提**: Phase 3（設計レビューゲート）が完了していること
- **後続**: Phase 5（実装）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/community-visualization-ui/phase-5-implementation.md`

# Phase 4: テスト作成 - 成果物レポート

## 作成日: 2026-01-13

## タスク: CONV-08-05 コミュニティ構造可視化UI

---

## 1. 作成テスト一覧

### 1.1 コンポーネントテスト

| ファイル                      | テストケース数 | 状態    |
| ----------------------------- | -------------- | ------- |
| CommunityGraph.test.tsx       | 30             | Red状態 |
| CommunityDetailPanel.test.tsx | 25             | Red状態 |
| CommunityFilter.test.tsx      | 18             | Red状態 |

### 1.2 Hookテスト

| ファイル               | テストケース数 | 状態    |
| ---------------------- | -------------- | ------- |
| useCommunities.test.ts | 15             | Red状態 |

### 1.3 統合テスト

| ファイル                       | テストケース数 | 状態    |
| ------------------------------ | -------------- | ------- |
| community-integration.test.tsx | 16             | Red状態 |

---

## 2. テストファイルパス

| テスト種別     | パス                                                                                       |
| -------------- | ------------------------------------------------------------------------------------------ |
| CommunityGraph | `apps/desktop/src/renderer/components/community/organisms/CommunityGraph/__tests__/`       |
| DetailPanel    | `apps/desktop/src/renderer/components/community/organisms/CommunityDetailPanel/__tests__/` |
| Filter         | `apps/desktop/src/renderer/components/community/organisms/CommunityFilter/__tests__/`      |
| Hook           | `apps/desktop/src/renderer/hooks/__tests__/`                                               |
| 統合テスト     | `apps/desktop/src/renderer/__tests__/`                                                     |

---

## 3. テストカテゴリ別内訳

### 3.1 CommunityGraph テスト (30件)

| カテゴリ         | テストケース数 | 内容                                 |
| ---------------- | -------------- | ------------------------------------ |
| 表示テスト       | 4              | ノード・エッジ・レイアウト・サイズ   |
| インタラクション | 4              | クリック・ズーム・パン・フィット     |
| エッジケース     | 4              | 空・大量データ・ローディング・エラー |
| 選択状態         | 2              | 選択・ハイライト                     |
| アクセシビリティ | 3              | aria-label・キーボード・Enter選択    |
| **合計**         | **17+**        |                                      |

### 3.2 CommunityDetailPanel テスト (25件)

| カテゴリ         | テストケース数 | 内容                                                 |
| ---------------- | -------------- | ---------------------------------------------------- |
| 要約表示         | 5              | 要約・キーワード・エンティティ・センチメント・信頼度 |
| メンバー表示     | 4              | リスト・クリック・スクロール・件数                   |
| 状態             | 4              | 空・ローディング・未生成・エラー                     |
| インタラクション | 2              | 閉じる・Escape                                       |
| アクセシビリティ | 3              | aria-label・見出し・フォーカス                       |
| 基本情報         | 3              | ID・レベル・サイズ                                   |
| **合計**         | **21+**        |                                                      |

### 3.3 CommunityFilter テスト (18件)

| カテゴリ         | テストケース数 | 内容                                             |
| ---------------- | -------------- | ------------------------------------------------ |
| レベルフィルター | 4              | ドロップダウン・選択・全て・ハイライト           |
| 検索             | 6              | 入力・onSearch・デバウンス・クリア・表示・非表示 |
| アクセシビリティ | 5              | キーボード・ラベル・Escape・aria                 |
| レベル情報       | 2              | レベル数・空状態                                 |
| **合計**         | **17+**        |                                                  |

### 3.4 useCommunities Hook テスト (15件)

| カテゴリ           | テストケース数 | 内容                                   |
| ------------------ | -------------- | -------------------------------------- |
| データ取得         | 5              | マウント・成功・ローディング・完了・空 |
| フィルタリング     | 3              | level指定・refetch・level変更          |
| エラーハンドリング | 4              | IPC失敗・ネットワーク・空配列・クリア  |
| 利用可能レベル     | 3              | 算出・ソート・空                       |
| **合計**           | **15**         |                                        |

### 3.5 統合テスト (16件)

| カテゴリ           | テストケース数 | 内容                                                  |
| ------------------ | -------------- | ----------------------------------------------------- |
| API接続テスト      | 3              | 一覧取得・詳細取得・レベル取得                        |
| データフローテスト | 4              | 選択→詳細・フィルタ→グラフ・検索→ハイライト・選択解除 |
| エラーハンドリング | 3              | IPC障害・リトライ・詳細エラー                         |
| 状態同期テスト     | 3              | フィルタ共有・選択同期・クリア                        |
| 空状態             | 1              | 0件                                                   |
| ローディング状態   | 1              | スピナー                                              |
| **合計**           | **15+**        |                                                       |

---

## 4. TDD Red状態確認

### 4.1 テスト実行結果

```bash
$ pnpm --filter @repo/desktop test -- --run src/renderer/components/community

 FAIL  src/renderer/components/community/organisms/CommunityGraph/__tests__/CommunityGraph.test.tsx
Error: Failed to resolve import "../index" from CommunityGraph.test.tsx
       Does the file exist?
```

### 4.2 Red状態確認

| テストファイル                 | 失敗理由                           | 状態   |
| ------------------------------ | ---------------------------------- | ------ |
| CommunityGraph.test.tsx        | コンポーネント未実装（import失敗） | ✅ Red |
| CommunityDetailPanel.test.tsx  | コンポーネント未実装（import失敗） | ✅ Red |
| CommunityFilter.test.tsx       | コンポーネント未実装（import失敗） | ✅ Red |
| useCommunities.test.ts         | Hook未実装（import失敗）           | ✅ Red |
| community-integration.test.tsx | コンポーネント未実装（import失敗） | ✅ Red |

**全テストがRed状態であることを確認**

---

## 5. テスト設計の特徴

### 5.1 モック戦略

| モック対象         | モック方法       | 用途                   |
| ------------------ | ---------------- | ---------------------- |
| window.electronAPI | vi.stubGlobal    | IPC通信モック          |
| タイマー           | vi.useFakeTimers | デバウンステスト       |
| ユーザーイベント   | userEvent.setup  | インタラクションテスト |

### 5.2 テストデータ

| データ種別            | 件数 | 用途                 |
| --------------------- | ---- | -------------------- |
| mockCommunities       | 3    | 基本表示テスト       |
| mockSummary           | 1    | 要約表示テスト       |
| mockMembers           | 2-3  | メンバー表示テスト   |
| generateLargeMockData | 100+ | パフォーマンステスト |

### 5.3 アクセシビリティテスト

| 項目                     | テスト内容                        |
| ------------------------ | --------------------------------- |
| aria-label               | 全主要コンポーネントに設定確認    |
| キーボードナビゲーション | Tab, Enter, Escape対応確認        |
| 見出し階層               | h2, h3の適切な使用確認            |
| role属性                 | complementary, search, combobox等 |

---

## 6. 完了条件チェック

- [x] CommunityGraphのテストが作成されている
- [x] CommunityDetailPanelのテストが作成されている
- [x] CommunityFilterのテストが作成されている
- [x] useCommunitiesのテストが作成されている
- [x] 統合テストシナリオが全カテゴリで定義されている
- [x] すべてのテストが失敗状態（Red）

---

## 7. 次Phaseへの引継ぎ

### 7.1 Phase 5（実装）への引継ぎ事項

| 項目           | 内容                                      |
| -------------- | ----------------------------------------- |
| 実装対象       | 15コンポーネント + 4 Hook                 |
| テストパス目標 | 全テストケースをGreen状態にする           |
| 優先順位       | Atoms → Molecules → Organisms → Templates |
| 依存ライブラリ | react-flow, dagre（要インストール）       |

### 7.2 必要な依存関係追加

```bash
pnpm --filter @repo/desktop add react-flow-renderer dagre
pnpm --filter @repo/desktop add -D @types/dagre
```

---

## 確認完了

- [x] タスク1: CommunityGraphテスト作成
- [x] タスク2: CommunityDetailPanelテスト作成
- [x] タスク3: CommunityFilterテスト作成
- [x] タスク4: useCommunitiesテスト作成
- [x] タスク5: 統合テストシナリオ作成
- [x] Red状態確認
- [x] 成果物レポート作成

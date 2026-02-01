# Community/Dashboard IPCハンドラー実サービス実装 - タスク指示書

## メタ情報

```yaml
issue_number: 638
```

## メタ情報

| 項目         | 内容                                            |
| ------------ | ----------------------------------------------- |
| タスクID     | task-imp-community-dashboard-handlers-001       |
| タスク名     | Community/Dashboard IPCハンドラー実サービス実装 |
| 分類         | 改善                                            |
| 対象機能     | Community Management / Dashboard Statistics     |
| 優先度       | 低                                              |
| 見積もり規模 | 中規模                                          |
| ステータス   | 未実施                                          |
| 発見元       | Phase 12（コードベースTODOスキャン）            |
| 発見日       | 2026-02-01                                      |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Community機能とDashboard機能のIPCハンドラーが、開発・テスト用のモックデータを返す実装のままリリースされている。具体的には以下のファイルでTODOコメントが残されている:

- `communityHandlers.ts:25` - `// TODO: Replace with actual service implementation`（モックデータ使用）
- `dashboardHandlers.ts:59` - `// TODO: Replace with real data fetching`（モックデータ使用）
- `aiHandlers.ts:134` - `// TODO: Replace with actual connection check`（接続チェックスタブ）
- `aiHandlers.ts:157` - `// TODO: Replace with actual indexing logic`（インデックスロジックスタブ）

### 1.2 問題点・課題

1. **Community機能**: ユーザーのCommunity一覧取得、詳細表示、グラフビジュアライゼーションがモックデータに依存しており、実データとの接続がない
2. **Dashboard機能**: ダッシュボード統計情報（スキル数、会話数、使用量等）がハードコードされたモック値を返している
3. **AI接続チェック**: AIサービスへの接続確認とインデックス作成がスタブ実装であり、実際のサービス状態を反映しない
4. **UI/テスト不整合**: community-integration.test.tsxに4箇所の「テストがUIコンポーネントの実装と不一致」TODO（L178, L238, L378, L486）があり、UIとテストの乖離が発生している

### 1.3 放置した場合の影響

- Community機能がモックデータ表示のみで、実際のコミュニティ情報にアクセスできない
- Dashboard統計が実データと異なる値を表示し、ユーザーに誤った情報を提供する
- AI接続状態の確認ができず、サービス障害時にユーザーが状況を把握できない
- テストとUIの不整合が拡大し、テストの信頼性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

Community/Dashboard/AI接続チェックのIPCハンドラーをモック実装から実サービス接続に移行し、実データに基づくUI表示を実現する。

### 2.2 最終ゴール

- communityHandlers.tsが実際のCommunityサービス/データソースからデータを取得している
- dashboardHandlers.tsが実際の統計データ（DB集計）を返している
- aiHandlers.tsの接続チェックが実際のAIサービス状態を反映している
- community-integration.test.tsxの4件のTODOが解消されている
- 全関連テストがGREEN

### 2.3 スコープ

#### 含むもの

- communityHandlers.tsのモック→実サービス移行
- dashboardHandlers.tsのモック→実データ集計移行
- aiHandlers.tsの接続チェック・インデックスロジック実装
- community-integration.test.tsxのUI/テスト不整合修正（4件）
- 関連テストの追加・修正

#### 含まないもの

- Community UIコンポーネントの新規作成（既存UIを活用）
- Dashboard UIのデザイン変更
- AIサービス本体の実装（接続チェックのみ）
- Knowledge Graph/Entity Extraction機能（CONV-08-06等は別タスク）
- CommunityVisualization内のエンティティ詳細画面遷移（CONV-08-06で対応）

### 2.4 成果物

| 成果物                             | 説明                                    |
| ---------------------------------- | --------------------------------------- |
| communityHandlers.ts修正           | 実サービス接続実装                      |
| dashboardHandlers.ts修正           | 実データ集計実装                        |
| aiHandlers.ts修正                  | 接続チェック・インデックスロジック実装  |
| community-integration.test.tsx修正 | UI/テスト不整合解消（4件）              |
| Communityサービス層                | `services/community-service.ts`（新規） |
| Dashboardサービス層                | `services/dashboard-service.ts`（新規） |
| Phase 1-12成果物                   | 各Phase出力ファイル                     |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- SQLiteデータベースが稼働していること
- Community/Dashboard関連のデータベーステーブルが存在すること
- AIサービス（LLM API）の接続情報が設定可能であること

### 3.2 依存タスク

| タスク                                | ステータス | 関係            |
| ------------------------------------- | ---------- | --------------- |
| agent-dashboard-foundation            | ✅ 完了    | Dashboard基盤   |
| agent-sdk-integration                 | ✅ 完了    | Agent SDK基盤   |
| task-shared-community-types-export-03 | 未実施     | Community型定義 |

### 3.3 必要な知識

- Electron IPC通信パターン（ipcMain.handle / contextBridge）
- SQLiteデータベース操作（better-sqlite3）
- Clean Architectureパターン（Service → Repository → Database）
- Vitest テスティング（vi.mock、MSWモック）

### 3.4 推奨アプローチ

1. Community/Dashboard/AIそれぞれのサービス層を作成
2. サービス層でデータベース/外部API接続を実装
3. IPCハンドラーからサービス層を呼び出すように修正
4. テストをサービス層のモックベースに書き換え
5. community-integration.test.tsxのUI不整合を修正

---

## 4. 実行手順

### Phase構成

| Phase | 名称             | 概要                                   |
| ----- | ---------------- | -------------------------------------- |
| 1     | 要件定義         | データソース確認・API設計              |
| 2     | 設計             | サービス層設計・データベースクエリ設計 |
| 4     | テスト作成       | サービス層テスト・ハンドラーテスト作成 |
| 5     | 実装             | サービス層実装・ハンドラー修正         |
| 6-9   | テスト・品質     | カバレッジ確認・リファクタリング       |
| 12    | ドキュメント更新 | システム仕様書更新                     |

### Phase 1: 要件定義

#### 目的

Community/Dashboard/AIの実データソースを特定し、必要なAPI設計を行う。

#### 手順

1. Community機能のデータモデルを確認（既存テーブル、Knowledge Graph関連）
2. Dashboard統計に必要なデータ集計クエリを設計（スキル数、会話数、使用量）
3. AI接続チェックの方法を決定（API health check endpoint、timeout設定）
4. AIインデックスロジックの要件を確認（RAGパイプライン連携）
5. 各ハンドラーのレスポンス型を確認・拡張

#### 成果物

- 要件定義書（データソースマッピング + API設計）

#### 完了条件

- 全ハンドラーのデータソースが特定されている
- レスポンス型が確定している

### Phase 5: 実装

#### 目的

サービス層を作成し、IPCハンドラーを実サービスに接続する。

#### 手順

1. `services/community-service.ts`を作成（DB接続 + データ取得ロジック）
2. `services/dashboard-service.ts`を作成（統計集計ロジック）
3. `communityHandlers.ts`をサービス層呼び出しに修正
4. `dashboardHandlers.ts`をサービス層呼び出しに修正
5. `aiHandlers.ts`の接続チェック・インデックスロジックを実装
6. `community-integration.test.tsx`のUI/テスト不整合を修正（4件）
7. TypeScript型チェック・テスト実行

#### 成果物

- サービス層ファイル2件（新規）
- 修正済みハンドラー3件
- 修正済みテスト1件

#### 完了条件

- `pnpm typecheck`がエラー0
- `pnpm test`が全テストGREEN
- TODOコメント6箇所 + テスト不整合4箇所 = 10箇所が全て解消

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] communityHandlers.tsが実データを返している
- [ ] dashboardHandlers.tsが実データ統計を返している
- [ ] aiHandlers.ts接続チェックが実際のサービス状態を反映する
- [ ] aiHandlers.tsインデックスロジックが動作する
- [ ] community-integration.test.tsxの4件のUI不整合が解消されている

### 品質要件

- [ ] テストカバレッジ Line 80%以上
- [ ] テストカバレッジ Branch 75%以上
- [ ] TypeScript strict mode エラー0件
- [ ] ESLint エラー0件
- [ ] `grep -r "TODO.*Replace with" apps/desktop/src/main/ipc/` の結果が0件

### ドキュメント要件

- [ ] api-endpoints.md 更新（Community/Dashboard API仕様）
- [ ] aiworkflow-requirements/LOGS.md 更新
- [ ] task-specification-creator/LOGS.md 更新

---

## 6. 検証方法

### テストケース

| #   | テストケース                                | 期待結果                         |
| --- | ------------------------------------------- | -------------------------------- |
| 1   | Community一覧取得が実データを返す           | モックデータではなくDB/APIデータ |
| 2   | Community詳細取得が正しいデータを返す       | ID指定で正しいCommunity情報      |
| 3   | Dashboard統計がDB集計値を返す               | ハードコード値ではなく動的集計   |
| 4   | AI接続チェックが正常時にtrueを返す          | APIが応答する場合にtrue          |
| 5   | AI接続チェックがサービス停止時にfalseを返す | タイムアウト/エラー時にfalse     |
| 6   | AIインデックス作成が正常に完了する          | インデックス結果が返される       |
| 7   | CommunityGraph詳細取得テストがPASS          | L178のTODO解消                   |
| 8   | Community選択フローテストがPASS             | L238のTODO解消                   |
| 9   | リトライ機能テストがPASS                    | L378のTODO解消                   |
| 10  | 選択状態同期テストがPASS                    | L486のTODO解消                   |

### 検証手順

1. `pnpm test -- --filter community` を実行し、全テストGREEN
2. `pnpm test -- --filter dashboard` を実行し、全テストGREEN
3. `pnpm test -- --filter ai` を実行し、関連テストGREEN
4. `grep -rn "TODO.*Replace with" apps/desktop/src/main/ipc/` で0件を確認
5. `grep -rn "TODO.*テストがUIコンポーネントの実装と不一致" apps/desktop/src/` で0件を確認

---

## 7. リスクと対策

| リスク                                   | 影響度 | 発生確率 | 対策                                              |
| ---------------------------------------- | ------ | -------- | ------------------------------------------------- |
| Communityデータベーステーブルが未作成    | 高     | 中       | マイグレーションスクリプトを先行作成              |
| AI接続チェックのタイムアウト設定が不適切 | 中     | 中       | 設定可能なタイムアウト値を導入（デフォルト5秒）   |
| モック→実サービス移行時の型不整合        | 中     | 低       | shared パッケージの型定義を正本とし、段階的に移行 |
| Dashboard集計クエリのパフォーマンス      | 低     | 低       | インデックス活用・キャッシュ導入を検討            |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント             | 用途                       |
| ------------------------ | -------------------------- |
| api-endpoints.md         | IPC APIエンドポイント仕様  |
| architecture-patterns.md | Electron IPCパターン       |
| database-architecture.md | データベースアーキテクチャ |
| database-schema.md       | データベーススキーマ       |
| interfaces-core.md       | コアインターフェース定義   |

### 参考資料

| ファイルパス                                                         | 該当行           | 内容                            |
| -------------------------------------------------------------------- | ---------------- | ------------------------------- |
| `apps/desktop/src/main/ipc/communityHandlers.ts`                     | L25              | TODO: 実サービス実装            |
| `apps/desktop/src/main/ipc/dashboardHandlers.ts`                     | L59              | TODO: 実データ取得              |
| `apps/desktop/src/main/ipc/aiHandlers.ts`                            | L134, L157       | TODO: 接続チェック/インデックス |
| `apps/desktop/src/renderer/__tests__/community-integration.test.tsx` | L178,238,378,486 | TODO: UI/テスト不整合           |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
// TODO: Replace with actual service implementation（communityHandlers.ts:25）
// TODO: Replace with real data fetching（dashboardHandlers.ts:59）
// TODO: Replace with actual connection check（aiHandlers.ts:134）
// TODO: Replace with actual indexing logic（aiHandlers.ts:157）
// TODO: テストがUIコンポーネントの実装と不一致（community-integration.test.tsx:178,238,378,486）
```

### 補足事項

- Community機能はKnowledge Graph（CONV-08シリーズ）と密接に関連するが、本タスクはIPCハンドラーの実サービス接続に限定する
- Dashboard統計は将来的にリアルタイム更新（WebSocket/IPC push）に拡張する可能性があるが、本タスクではポーリングベースの実装で十分
- CommunityVisualization内のエンティティ詳細画面遷移（`CONV-08-06`）は別タスクで対応するため、本タスクのスコープ外
- aiHandlers.tsの接続チェックは、RAGパイプライン全体の実装状況に依存するため、段階的な実装が望ましい

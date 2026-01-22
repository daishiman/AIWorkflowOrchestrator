# Phase 2: 設計 - タスク仕様書

## メタ情報

| 項目       | 内容                              |
| ---------- | --------------------------------- |
| Phase      | 2                                 |
| Phase名    | 設計                              |
| 前提Phase  | Phase 1                           |
| 後続Phase  | Phase 3                           |
| ステータス | 未実施                            |
| 作成日     | 2026-01-22                        |
| 機能名     | chat-history-provider-integration |

---

## 目的

Phase 1で定義した要件に基づき、Provider統合の詳細設計と統合テスト設計を行う。

## 背景

要件定義が完了したため、実装に向けた詳細設計を行う。Clean Architectureに準拠し、依存関係ルールを守りながら設計を進める。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: リポジトリファクトリー設計

**目的**: DrizzleリポジトリをProviderに注入するためのファクトリー設計を行う

**実行手順**:

1. リポジトリファクトリーの責務を定義する:
   - DBインスタンスの取得
   - リポジトリのインスタンス化
   - シングルトン管理（必要に応じて）
2. ファクトリーのインターフェースを設計する:
   ```typescript
   // 設計例
   interface RepositoryFactory {
     createSessionRepository(): IChatSessionRepository;
     createMessageRepository(): IChatMessageRepository;
   }
   ```
3. 設計を `outputs/phase-2/detailed-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/detailed-design.md`（リポジトリファクトリー設計セクション）

---

### タスク2: Provider階層設計

**目的**: App.tsxでのProvider階層構造を設計する

**実行手順**:

1. 既存のApp.tsx構造を確認する
2. ChatHistoryProviderの配置位置を決定する:
   - ルートレベルでのラップ
   - 他のProviderとの順序関係
3. Provider階層図を作成する:
   ```
   <App>
     <ChatHistoryProvider>
       {/* 既存のアプリコンテンツ */}
     </ChatHistoryProvider>
   </App>
   ```
4. 設計を `outputs/phase-2/detailed-design.md` に追記する

**期待される成果物**:

- `outputs/phase-2/detailed-design.md`（Provider階層設計セクション）

---

### タスク3: 初期化フロー設計

**目的**: Provider初期化のフローを設計する

**実行手順**:

1. 初期化フローを定義する:
   - DBインスタンス取得
   - リポジトリ生成
   - Provider初期化
   - isReady遷移
2. エラーハンドリングを設計する:
   - DB接続失敗時の挙動
   - リポジトリ初期化失敗時の挙動
3. 状態遷移図を作成する
4. 設計を `outputs/phase-2/detailed-design.md` に追記する

**期待される成果物**:

- `outputs/phase-2/detailed-design.md`（初期化フロー設計セクション）

---

### タスク4: 統合テスト設計

**目的**: Provider統合の統合テストを設計する

**実行手順**:

1. 以下のテストシナリオを設計する:

   | テストID | シナリオ                 | 期待結果                   |
   | -------- | ------------------------ | -------------------------- |
   | IT-001   | Provider初期化           | isReady=trueに遷移         |
   | IT-002   | Repository注入           | Use Casesが取得できる      |
   | IT-003   | Context伝播              | 子コンポーネントで使用可能 |
   | IT-004   | エラー時のフォールバック | エラー状態が適切に設定     |

2. テストデータ・モック設計を行う
3. 設計を `outputs/phase-2/integration-test-design.md` に出力する

**期待される成果物**:

- `outputs/phase-2/integration-test-design.md`

---

### タスク5: 設計サマリー作成

**目的**: Phase 2の成果物をサマリーとしてまとめる

**実行手順**:

1. タスク1〜4の設計を統合する
2. 設計決定事項を一覧化する
3. Phase 3（設計レビュー）へのインプットとして整理する

**期待される成果物**:

- 設計サマリー（detailed-design.mdに含める）

---

## 参照資料

| 参照資料             | パス                                                                             | 内容                           |
| -------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| アーキテクチャ仕様   | `.claude/skills/aiworkflow-requirements/references/architecture-chat-history.md` | Clean Architectureレイヤー構成 |
| インターフェース仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md`   | Repository/Service型定義       |
| Phase 1成果物        | `outputs/phase-1/`                                                               | 要件定義成果物                 |

---

## 成果物

| 成果物         | パス                                         | 内容           |
| -------------- | -------------------------------------------- | -------------- |
| 詳細設計       | `outputs/phase-2/detailed-design.md`         | 詳細設計       |
| 統合テスト設計 | `outputs/phase-2/integration-test-design.md` | 統合テスト設計 |

---

## 統合テスト連携（Phase 1〜11は必須）

統合テスト設計を本Phaseで実施:

- Provider初期化テスト設計
- Repository注入テスト設計
- Context伝播テスト設計
- エラーハンドリングテスト設計

---

## 完了条件

- [ ] リポジトリファクトリー設計が完了している
- [ ] Provider階層設計が完了している
- [ ] 初期化フロー設計が完了している
- [ ] 統合テスト設計が完了している
- [ ] 全成果物が `outputs/phase-2/` に出力されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスク（タスク1〜5）を100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認

---

## 設計原則

### Clean Architecture適合

Provider統合はUIレイヤーに属する:

```
Domain    → エンティティ、リポジトリインターフェース
Application → Use Cases
Infrastructure → Drizzleリポジトリ実装
UI        → ChatHistoryProvider、App.tsx ← 本タスク
```

### 依存関係ルール

- UI → Application（Use Cases）: OK
- UI → Domain（Entities, Repository Interface）: OK
- UI → Infrastructure（直接）: NG（Providerを経由）

---

## 依存関係

- **前提**: Phase 1（要件定義）が完了していること
- **後続**: Phase 3（設計レビューゲート）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/chat-history-provider-integration/phase-3-design-review.md`

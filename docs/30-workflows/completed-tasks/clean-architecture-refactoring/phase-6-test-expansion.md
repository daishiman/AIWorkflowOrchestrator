# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                           |
| ---------- | ------------------------------ |
| Phase      | 6                              |
| Phase名    | テスト拡充                     |
| 前提Phase  | Phase 5（実装）                |
| 後続Phase  | Phase 7（カバレッジ確認）      |
| ステータス | 未実施                         |
| 作成日     | 2026-01-18                     |
| 機能名     | clean-architecture-refactoring |
| タスクID   | ARCH-001                       |

---

## 目的

カバレッジ目標達成に向けた追加テストを作成し、統合テストを追加する。

## 背景

Phase 5で基本的な実装が完了したため、テストカバレッジを向上させ、アーキテクチャ準拠を検証するテストを追加する。

---

## 実行タスク

> 以下のタスクを順番に実行してください。

### タスク1: 境界値テストの追加

**目的**: 値オブジェクトの境界値テストを追加する

**実行手順**:

1. ChatSessionTitleの境界値テストを追加する:
   - 3文字（最小値）での作成テスト
   - 100文字（最大値）での作成テスト
   - 2文字（境界外）でのエラーテスト
   - 101文字（境界外）でのエラーテスト

2. MessageContentの境界値テストを追加する:
   - 1文字（最小値）での作成テスト
   - 100000文字（最大値）での作成テスト
   - 100001文字（境界外）でのエラーテスト

3. プレビュー生成の境界値テストを追加する:
   - 30文字ちょうどのプレビューテスト
   - 31文字でのプレビュー切り詰めテスト

**期待される成果物**:

- 各値オブジェクトテストファイルに境界値テストを追加

---

### タスク2: 異常系テストの追加

**目的**: エラーハンドリングのテストを追加する

**実行手順**:

1. Use Caseの異常系テストを追加する:
   - リポジトリ例外発生時のResult.Err返却テスト
   - 不正な入力値でのバリデーションエラーテスト
   - 存在しないエンティティへのアクセスエラーテスト

2. マッパーの異常系テストを追加する:
   - 不正なDBレコードからの変換エラーテスト
   - NULL値を含むレコードの処理テスト
   - 不正なJSONメタデータの処理テスト

3. ピン留め上限テストを追加する（ビジネスルール BR-SESSION-002）:
   - 10件ピン留め後の11件目でエラーテスト

**期待される成果物**:

- 各テストファイルに異常系テストを追加

---

### タスク3: 統合テストの作成

**目的**: レイヤー間の結合をテストする

**実行手順**:

1. ドメイン-リポジトリ統合テストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/__tests__/integration/domain-repository.test.ts
   describe("Domain-Repository Integration", () => {
     it("エンティティをリポジトリ経由で保存・取得できる", async () => {});
     it("マッパーが正しくDomain-Persistence変換する", async () => {});
     it("検索クエリが正しく動作する", async () => {});
   });
   ```

2. Use Case-リポジトリ統合テストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/__tests__/integration/usecase-repository.test.ts
   describe("UseCase-Repository Integration", () => {
     it("CreateChatSessionUseCaseがセッションをDBに保存する", async () => {});
     it("AddMessageUseCaseがメッセージをDBに保存し、セッションを更新する", async () => {});
     it("SearchSessionsUseCaseがFTS5検索を正しく実行する", async () => {});
   });
   ```

3. エンドツーエンド統合テストを作成する:
   ```typescript
   // packages/shared/src/features/chat-history/__tests__/integration/e2e.test.ts
   describe("Chat History E2E", () => {
     it("セッション作成→メッセージ追加→検索の一連フローが動作する", async () => {});
     it("エクスポートがMarkdown/JSON形式で正しく出力する", async () => {});
   });
   ```

**期待される成果物**:

- `packages/shared/src/features/chat-history/__tests__/integration/domain-repository.test.ts`
- `packages/shared/src/features/chat-history/__tests__/integration/usecase-repository.test.ts`
- `packages/shared/src/features/chat-history/__tests__/integration/e2e.test.ts`

---

### タスク4: アーキテクチャ準拠テストの作成

**目的**: Clean Architecture原則への準拠を自動検証するテストを作成する

**実行手順**:

1. 依存関係ルール違反検出テストを作成する:

   ```typescript
   // packages/shared/src/features/chat-history/__tests__/architecture/dependency-rules.test.ts
   describe("Clean Architecture Dependency Rules", () => {
     it("Domain層がInfrastructure層に依存していない", () => {
       // domain/配下のファイルがinfrastructure/からimportしていないことを検証
     });

     it("Domain層がApplication層に依存していない", () => {
       // domain/配下のファイルがapplication/からimportしていないことを検証
     });

     it("Application層がInfrastructure層に依存していない", () => {
       // application/配下のファイルがinfrastructure/からimportしていないことを検証
     });

     it("Domain層がDrizzle ORMに依存していない", () => {
       // domain/配下のファイルがdrizzle-ormからimportしていないことを検証
     });
   });
   ```

2. レイヤー境界テストを作成する:
   ```typescript
   // packages/shared/src/features/chat-history/__tests__/architecture/layer-boundaries.test.ts
   describe("Layer Boundaries", () => {
     it("リポジトリインターフェースがDomain層に配置されている", () => {});
     it("リポジトリ実装がInfrastructure層に配置されている", () => {});
     it("Use CaseがApplication層に配置されている", () => {});
     it("マッパーがInfrastructure層に配置されている", () => {});
   });
   ```

**期待される成果物**:

- `packages/shared/src/features/chat-history/__tests__/architecture/dependency-rules.test.ts`
- `packages/shared/src/features/chat-history/__tests__/architecture/layer-boundaries.test.ts`

---

### タスク5: React Context/Hookテストの追加

**目的**: UI層のDIパターンをテストする

**実行手順**:

1. ChatHistoryProviderのテストを作成する:

   ```typescript
   // apps/desktop/src/contexts/__tests__/ChatHistoryProvider.test.tsx
   describe("ChatHistoryProvider", () => {
     it("子コンポーネントにContextを提供する", () => {});
     it("Use Caseを正しくインスタンス化する", () => {});
     it("状態更新が正しく反映される", () => {});
   });
   ```

2. useChatHistoryフックのテストを作成する:
   ```typescript
   // apps/desktop/src/hooks/__tests__/useChatHistory.test.ts
   describe("useChatHistory", () => {
     it("Provider外で使用すると例外を投げる", () => {});
     it("createSessionがUse Caseを呼び出す", async () => {});
     it("エラー発生時にerror状態が更新される", async () => {});
   });
   ```

**期待される成果物**:

- `apps/desktop/src/contexts/__tests__/ChatHistoryProvider.test.tsx`
- `apps/desktop/src/hooks/__tests__/useChatHistory.test.ts`

---

### タスク6: テスト実行・カバレッジ確認

**目的**: 追加テストが正常に動作し、カバレッジが向上していることを確認する

**実行手順**:

1. 全テストを実行する:

   ```bash
   pnpm --filter @repo/shared test:run --coverage
   pnpm --filter @repo/desktop test:run --coverage
   ```

2. カバレッジレポートを確認する:
   - Line Coverage
   - Branch Coverage
   - Function Coverage

3. テスト拡充レポートを作成する

**期待される成果物**:

- `outputs/phase-6/test-expansion-report.md` - テスト拡充レポート
- `outputs/phase-6/coverage-snapshot.md` - カバレッジスナップショット

---

## 参照資料

| 参照資料       | パス                       | 内容                       |
| -------------- | -------------------------- | -------------------------- |
| Phase 5成果物  | 実装コード群               | 実装コード                 |
| ビジネスルール | interfaces-chat-history.md | BR-SESSION-_, BR-MESSAGE-_ |

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                     | パス                                                                           | 内容               |
| ---------------------------- | ------------------------------------------------------------------------------ | ------------------ |
| チャット履歴インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-chat-history.md` | ビジネスルール仕様 |

---

## 成果物

| 成果物                     | パス                                       | 内容               |
| -------------------------- | ------------------------------------------ | ------------------ |
| 境界値テスト               | 各value-objects/**tests**/                 | 境界値テスト追加   |
| 異常系テスト               | 各テストファイル                           | 異常系テスト追加   |
| 統合テスト                 | **tests**/integration/                     | 統合テスト         |
| アーキテクチャテスト       | **tests**/architecture/                    | 依存関係検証テスト |
| Context/Hookテスト         | apps/desktop/src/contexts/**tests**/       | UI層テスト         |
| テスト拡充レポート         | `outputs/phase-6/test-expansion-report.md` | テスト拡充レポート |
| カバレッジスナップショット | `outputs/phase-6/coverage-snapshot.md`     | カバレッジ状況     |

---

## 統合テスト連携

アーキテクチャ準拠テストの拡充を行うこと:

- 依存関係ルール違反検出テストで全違反が検出されないことを確認
- レイヤー境界テストで正しい配置を確認
- 統合テストでレイヤー間通信が正しく動作することを確認

---

## 完了条件

- [ ] 全値オブジェクトに境界値テストが追加されている
- [ ] 全Use Caseに異常系テストが追加されている
- [ ] 統合テストが作成されている
- [ ] アーキテクチャ準拠テストが作成されている
- [ ] React Context/Hookテストが作成されている
- [ ] 全テストが成功している
- [ ] カバレッジレポートが作成されている

---

## Phase末端アクション【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各タスクを100%完了し、完了を明記
- [ ] 成果物が全て生成されていることを確認
- [ ] `artifacts.json` のPhase 6ステータスを更新

---

## 依存関係

- **前提**: Phase 5（実装）が完了していること
- **後続**: Phase 7（カバレッジ確認）へ進む

---

## 次のPhase

完了後、以下のファイルを実行してください:

`docs/30-workflows/clean-architecture-refactoring/phase-7-coverage-check.md`

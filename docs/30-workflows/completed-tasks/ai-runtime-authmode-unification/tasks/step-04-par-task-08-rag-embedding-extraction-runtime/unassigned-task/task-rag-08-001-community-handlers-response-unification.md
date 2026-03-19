# communityHandlers IPC レスポンス形式統一 - タスク指示書

## メタ情報

```yaml
issue_number: 1367
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | UT-RAG-08-001                                  |
| タスク名     | communityHandlers IPC レスポンス形式統一       |
| 分類         | リファクタリング                               |
| 対象機能     | RAG / IPC ハンドラ統一                         |
| 優先度       | 中                                             |
| 見積もり規模 | 中規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | Phase 10 最終レビュー（TASK-08-RAG-EMBEDDING） |
| 発見日       | 2026-03-19                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-08-RAG-EMBEDDING 実装中、communityHandlers と aiHandlers で IPC レスポンス形式が統一されていないことが判明した。

- **aiHandlers**: `{ success: boolean, data?: T, error?: { code: string, message: string } }` 形式
- **communityHandlers**: `{ ok: boolean, value?: T, error?: string }` 形式（`CommunityResult<T>` 型に依存）

Phase 10 の最終レビューで MINOR 指摘となり、`CommunityResult<T>` 型制約により即時統一が不可能と判断されて本タスクに切り出された。

### 1.2 問題点・課題

**IPC レスポンス形式の不統一による影響**:

- Renderer 側で communityHandlers と aiHandlers のレスポンスを同一インターフェースで扱えない
- Preload 層で複数の型チェックパターンが混在し、コードの可読性が低下する
- 新規ハンドラ追加時にどちらの形式を採用すべきか判断コストが発生する
- テスト作成時にモックの構造が統一されず、P9（テスト間状態リーク）の温床になる

**既知の型制約**:

```typescript
// CommunityResult<T> が ok/value/error フィールドを要求する
type CommunityResult<T> = {
  ok: boolean;
  value?: T;
  error?: string;
};

// この型がサービス層全体に波及しているため、ハンドラだけ変更できない
```

### 1.3 放置した場合の影響

**短期的影響**:

- IPC レスポンス形式の二重管理コストが継続する
- 新規 RAG 機能追加時に形式選択の混乱が発生する

**中長期的影響**:

- P23（API 二重定義の型管理複雑性）パターンが RAG ドメインに波及する
- 統合テスト追加時のモック設計が複雑化する

**影響度**: 中（機能動作には影響しないが、保守性・拡張性に直接影響）

---

## 2. 何を達成するか（What）

### 2.1 目的

communityHandlers の IPC レスポンス形式を aiHandlers と統一し、RAG ドメイン全体で一貫した IPC 契約を実現する。

### 2.2 最終ゴール

- communityHandlers が `{ success: boolean, data?: T, error?: { code: string, message: string } }` 形式でレスポンスを返す
- `CommunityResult<T>` をサービス層内部型として維持しつつ、IPC 境界で形式変換を行う
- communityHandlers のユニットテストを新規作成する（現状テストファイルが不在）
- Preload 型定義が統一形式に対応する

### 2.3 スコープ

#### 含むもの

- communityHandlers.ts のレスポンス形式変換ロジック追加
- CommunityResult<T> → IPCResult<T> 変換ユーティリティの作成
- communityHandlers.test.ts の新規作成（L-RAG-05 対応）
- Preload 型定義の更新（communityHandlers 関連）

#### 含まないもの

- CommunityResult<T> 型自体の変更（サービス層への影響が大きいため別タスク）
- aiHandlers 以外の既存ハンドラへの影響
- Renderer 側の communityHandlers 呼び出し箇所の変更（Preload 型更新で自動対応）

### 2.4 成果物

1. 修正された `apps/desktop/src/main/handlers/communityHandlers.ts`
2. 新規作成 `apps/desktop/src/main/handlers/__tests__/communityHandlers.test.ts`
3. 更新された Preload 型定義（`apps/desktop/src/preload/types.ts`）
4. 変換ユーティリティ（communityHandlers.ts 内またはハンドラ共通ユーティリティとして配置）

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- [ ] `communityHandlers.ts` の現行実装を読み込んでから作業を開始する
- [ ] `aiHandlers.ts` のレスポンス形式を確認してから統一形式を決定する
- [ ] `CommunityResult<T>` の使用箇所を `grep -rn "CommunityResult" packages/shared/src/` で全件把握する
- [ ] 既存テストが全て通過していること

### 3.2 依存タスク

- TASK-08-RAG-EMBEDDING が完了していること（communityHandlers の実装基盤）
- UT-RAG-08-006（aiHandlers カバレッジ改善）とは独立して実行可能

### 3.3 必要な知識・スキル

- IPC ハンドラのレスポンス形式（P44, P45 参照）
- TypeScript ジェネリクスと型変換パターン
- Vitest によるユニットテスト作成
- P23（API 二重定義）, P32（型定義の二箇所同時更新）の理解

### 3.4 推奨アプローチ

1. **調査フェーズ**: communityHandlers.ts と aiHandlers.ts の現行実装を比較分析する
2. **変換設計**: `CommunityResult<T>` → `IPCResult<T>` 変換関数の設計（ユーティリティとして抽出推奨）
3. **テスト先行**: communityHandlers.test.ts を先に作成してから実装変更（TDD）
4. **型更新**: Preload 型と実装を同時更新（P32 準拠）
5. **型チェック**: `pnpm typecheck` で型整合性を確認

### 3.5 苦戦ポイント（過去の教訓）

**L-RAG-01: mock 削除は型制約の影響範囲を事前調査すべき**

`CommunityResult<T>` を返すサービスのモックを変更する場合、型制約の影響範囲を `grep -rn "CommunityResult"` で事前把握しないと、テスト修正が連鎖的に発生する。変換ユーティリティを IPC 境界に閉じ込めることで影響範囲を限定する。

**L-RAG-05: communityHandlers にテストファイルが不在**

現状 communityHandlers のテストファイルが存在しない（P9 の温床）。本タスクでテストを新規作成することが必須要件。テスト作成時は既存の `aiHandlers.test.ts` のインポートパスを参照してから記述すること（P63 対策）。

**P23 + P32 複合パターン**:

Preload 型の更新漏れが発生しやすい。変更後は以下2ファイルを必ず同時更新する：

- `packages/shared/src/agent/types.ts`（共有型定義）
- `apps/desktop/src/preload/types.ts`（Preload 層型定義）

---

## 4. Phase 構成

### Phase 1: 調査・設計

**目的**: 現行の差異を定量化し、変換アプローチを決定する

**実行手順**:

1. `communityHandlers.ts` と `aiHandlers.ts` の実装を読み込む
2. `grep -rn "CommunityResult" packages/shared/src/` で影響範囲を特定する
3. 変換ユーティリティの設計（インターフェースを定義する）

**成果物**:

- 変換ユーティリティの設計メモ（実装コメントとして記録）

**完了条件**:

- [ ] 差異が定量化されている（フィールド名、エラー形式）
- [ ] CommunityResult<T> の使用箇所が全件特定されている
- [ ] 変換アプローチが決定されている

### Phase 2: テスト作成（TDD）

**目的**: communityHandlers のユニットテストを先行作成する

**実行手順**:

1. `aiHandlers.test.ts` のインポートパスを参照してディレクトリ構造を確認する
2. `communityHandlers.test.ts` を `apps/desktop/src/main/handlers/__tests__/` に作成する
3. 現在の `{ ok, value, error }` 形式を期待するテストを作成する（RED状態）
4. 変更後の `{ success, data, error }` 形式を期待するテストに更新する

**成果物**:

- `apps/desktop/src/main/handlers/__tests__/communityHandlers.test.ts`

**完了条件**:

- [ ] テストファイルが作成されている
- [ ] 正常系・異常系・バリデーションエラーのテストが含まれている
- [ ] テストが RED 状態（実装変更前は失敗）であることを確認

### Phase 3: 実装変更

**目的**: communityHandlers のレスポンス形式を統一形式に変換する

**実行手順**:

1. 変換ユーティリティ関数を実装する
2. communityHandlers.ts の各ハンドラで変換処理を適用する
3. Preload 型定義を更新する（P32 準拠: 2ファイル同時更新）

**成果物**:

- 修正された `communityHandlers.ts`
- 更新された Preload 型定義

**完了条件**:

- [ ] 全ハンドラが統一形式でレスポンスを返す
- [ ] CommunityResult<T> はサービス層内部に限定されている
- [ ] Preload 型が更新されている

### Phase 4: 検証

**目的**: 全テスト通過・型整合性・既存機能への影響なしを確認する

**実行手順**:

1. `pnpm --filter @repo/desktop test communityHandlers` でテスト実行
2. `pnpm typecheck` で型チェック
3. `pnpm --filter @repo/desktop test` で全テスト実行

**完了条件**:

- [ ] communityHandlers.test.ts が全件 PASS
- [ ] 型チェックがエラーなし
- [ ] 既存テストへの影響がない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] communityHandlers が `{ success, data, error }` 形式でレスポンスを返す
- [ ] CommunityResult<T> はサービス層内部型として維持されている
- [ ] Preload 型定義が統一形式に対応している

### 品質要件

- [ ] communityHandlers.test.ts が新規作成されている
- [ ] 正常系・異常系・バリデーションエラーのテストが含まれている
- [ ] 全テストが PASS している
- [ ] 型チェックがエラーなし
- [ ] `pnpm lint` がエラーなし

### ドキュメント要件

- [ ] 変換ユーティリティに JSDoc コメントが記載されている
- [ ] LOGS.md が2ファイル（.claude/ と .agents/）更新されている
- [ ] documentation-changelog.md が更新されている

---

## 6. 検証方法

### テストケース例

| No  | ハンドラ         | シナリオ             | 期待レスポンス形式                                             |
| --- | ---------------- | -------------------- | -------------------------------------------------------------- |
| 1   | community:fetch  | 正常取得             | `{ success: true, data: {...} }`                               |
| 2   | community:fetch  | リソース未発見       | `{ success: false, error: { code, message } }`                 |
| 3   | community:create | バリデーションエラー | `{ success: false, error: { code: "VALIDATION_ERROR", ... } }` |
| 4   | community:delete | 正常削除             | `{ success: true }`                                            |

### 検証手順

```bash
# 1. communityHandlers のテスト実行
cd apps/desktop
pnpm vitest run src/main/handlers/__tests__/communityHandlers.test.ts

# 2. 型チェック
pnpm typecheck

# 3. 全ハンドラテスト
pnpm vitest run src/main/handlers/
```

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                              |
| ---------------------------------- | ------ | -------- | ------------------------------------------------- |
| CommunityResult<T> 変更の波及      | 高     | 中       | 型変換をIPC境界に閉じ込め、サービス層は変更しない |
| Preload 型更新漏れ（P32）          | 中     | 高       | P32 準拠で 2ファイル同時更新、typecheck で確認    |
| 既存テストへの影響                 | 中     | 低       | 変更前後で全テスト実行して確認                    |
| communityHandlers テスト不在（P9） | 中     | 高       | Phase 2 で TDD アプローチを採用し先行作成         |

---

## 8. 参照情報

### 関連 Pitfall

- P23: API 二重定義の型管理複雑性
- P32: 型定義の二箇所同時更新必須
- P9: モジュールスコープ変数のテスト間リーク
- P44: IPC ハンドラとPreloadのインターフェース不整合
- P60: IPC テスト応答形式の不一致

### 関連ドキュメント

- `.claude/rules/04-electron-security.md` — IPC セキュリティ原則
- `.claude/rules/02-code-quality.md` — エラーハンドリング原則

---

## 9. 備考

### 発見経緯

TASK-08-RAG-EMBEDDING の Phase 10 最終レビューで MINOR 指摘として検出。`CommunityResult<T>` 型制約により即時統一が困難と判断し、未タスクとして切り出した。

### 補足事項

- communityHandlers.test.ts が現状不在であることは、テスト品質の観点で独立した問題でもある
- 変換ユーティリティは将来的に他のハンドラ形式統一タスクでも再利用できる設計を推奨する
- Phase 12 完了後は `.claude/skills/` と `.agents/skills/` を rsync で同期すること（MEMORY.md の Mirror Sync 手順参照）

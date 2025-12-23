# チャット履歴エクスポートプレビュー機能実装 - タスク指示書

## メタ情報

| 項目             | 内容                                         |
| ---------------- | -------------------------------------------- |
| タスクID         | T-04-4-EXT-2                                 |
| タスク名         | チャット履歴エクスポートプレビュー機能実装   |
| 分類             | 改善                                         |
| 対象機能         | チャット履歴エクスポート機能                 |
| 優先度           | 低                                           |
| 見積もり規模     | 中規模                                       |
| ステータス       | 未実施                                       |
| 発見元           | Phase 7（最終レビューゲート）- E2Eテスト実行 |
| 発見日           | 2025-12-23                                   |
| 発見エージェント | @e2e-tester                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

T-04-4（チャット履歴エクスポート機能実装）のE2Eテスト実行時、以下のテストが失敗しました：

```
[chromium] › e2e/chat-history-export.spec.ts:354:3 › エクスポート前にプレビュー情報を表示できる
```

**失敗原因：**

- E2Eテストは「プレビュー」ボタンの存在を期待
- プレビューボタンクリック時に、エクスポート内容のサマリー情報を表示する仕様
- 現在の実装（`ChatHistoryExport.tsx`）には、プレビューボタンが存在しない

**期待される機能：**

1. エクスポートダイアログに「プレビュー」ボタンを追加
2. プレビューAPI（`/api/v1/sessions/${sessionId}/preview?format=${format}`）を呼び出し
3. 以下の情報を表示するプレビューモーダル/セクション：
   - メッセージ数
   - 総トークン数
   - 推定ファイルサイズ
   - 日付範囲（最初/最後のメッセージ）
   - モデル使用状況

### 1.2 問題点・課題

**現在の制約：**

1. ユーザーはエクスポート前に内容を確認できない
2. エクスポートファイルサイズの予測ができない
3. どのモデルが使用されたかの確認ができない

**ユーザー影響：**

- 大量のメッセージをエクスポートする際、ファイルサイズが予測できず不便
- エクスポート後にファイルを開いて確認する必要がある
- トークン使用量の把握が困難

### 1.3 放置した場合の影響

- E2Eテスト成功率が最大95%（21/22件）で止まる（プレビュー機能実装で100%達成）
- ユーザビリティの低下（事前確認ができない）
- 仕様と実装の乖離が継続する
- 将来的に追加実装する際、APIとフロントエンドの両方を実装する必要がある

---

## 2. 何を達成するか（What）

### 2.1 目的

エクスポートダイアログにプレビュー機能を追加し、ユーザーがエクスポート前に内容を確認できるようにする。

### 2.2 最終ゴール

- エクスポートダイアログに「プレビュー」ボタンを追加
- プレビューボタンクリック時にプレビュー情報を表示
- プレビューAPI実装（バックエンド）
- プレビューUIコンポーネント実装（フロントエンド）
- E2Eテスト1件が成功する
- E2Eテスト成功率が95% → 100%（22/22件）に到達

### 2.3 スコープ

#### 含むもの

- **バックエンド:**
  - プレビューAPIエンドポイント実装（`/api/v1/sessions/${sessionId}/preview`）
  - プレビュー情報計算ロジック（メッセージ数、トークン数、ファイルサイズ推定、モデル使用状況）
  - プレビューレスポンススキーマ定義

- **フロントエンド:**
  - `ChatHistoryExport.tsx` にプレビューボタン追加
  - プレビュー情報表示UI（モーダルまたはインライン展開）
  - プレビューAPI呼び出しロジック

- **テスト:**
  - プレビューAPIのユニットテスト
  - プレビューUIのユニットテスト
  - 既存E2Eテストの成功確認

#### 含まないもの

- エクスポート内容の詳細プレビュー（メッセージ本文の表示）
- プレビューのキャッシュ機能
- プレビュー情報のCSVエクスポート
- 他のセッションとの比較機能

### 2.4 成果物

| 種別     | 成果物                       | 配置先                                                                |
| -------- | ---------------------------- | --------------------------------------------------------------------- |
| API      | プレビューエンドポイント     | `packages/shared/src/features/chat-history/api/preview.ts`            |
| スキーマ | プレビューレスポンス型定義   | `packages/shared/src/types/chat-export-preview.ts`                    |
| UI       | プレビューボタン             | `apps/desktop/src/components/chat/ChatHistoryExport.tsx`              |
| UI       | プレビュー表示コンポーネント | `apps/desktop/src/components/chat/ExportPreview.tsx`                  |
| テスト   | APIユニットテスト            | `packages/shared/src/features/chat-history/__tests__/preview.test.ts` |
| テスト   | UIユニットテスト             | `apps/desktop/src/components/chat/__tests__/ExportPreview.test.tsx`   |
| 品質     | E2Eテスト成功確認レポート    | `docs/30-workflows/chat-history-persistence/test-results.md`          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- T-04-4（チャット履歴エクスポート機能実装）が完了していること
- ChatHistoryService が実装済みで、セッションとメッセージの取得が可能なこと
- E2Eテスト19件が成功していること（現状）
- TypeScript、Zod、Drizzle ORMが利用可能であること

### 3.2 依存タスク

| タスクID     | タスク名                             | 状態                        |
| ------------ | ------------------------------------ | --------------------------- |
| T-04-1       | チャット履歴サービス実装             | ✅ 完了                     |
| T-04-4       | ChatHistoryExport コンポーネント実装 | ✅ 完了                     |
| T-04-4-EXT-1 | メッセージ選択UI実装                 | ⏳ 未実施（推奨：先に実施） |

### 3.3 必要な知識・スキル

**バックエンド:**

- Drizzle ORM によるデータ取得
- Zod によるスキーマ定義
- TypeScript による型安全なAPI実装
- ファイルサイズ推定アルゴリズム

**フロントエンド:**

- React Hooks（useState, useEffect, useCallback）
- 非同期データフェッチ（fetch API）
- ローディング状態管理
- エラーハンドリング
- Tailwind CSS スタイリング

**テスト:**

- Vitest によるAPIロジックテスト
- React Testing Library によるUIテスト
- Playwright E2Eテスト

### 3.4 推奨アプローチ

**アーキテクチャ：**

1. **バックエンド優先実装** - API → フロントエンドの順
2. **段階的実装** - 基本情報 → 詳細情報の順で実装
3. **Controlled Components** - プレビュー表示状態を親で管理

**ファイルサイズ推定方法：**

- Markdown: `メッセージ本文長さ + メタデータ長さ * 1.2`（マークダウン記法のオーバーヘッド）
- JSON: `JSON.stringify(data).length * 1.1`（整形インデントのオーバーヘッド）

---

## 4. 実行手順

### Phase構成

```
Phase 1: 設計
  └─ T-01-1: プレビューAPI設計（スキーマ定義、エンドポイント仕様）
Phase 3: テスト作成（TDD: Red）
  ├─ T-03-1: プレビューAPIのユニットテスト作成
  └─ T-03-2: プレビューUIのユニットテスト作成
Phase 4: 実装（TDD: Green）
  ├─ T-04-1: プレビューAPI実装
  └─ T-04-2: プレビューUI実装
Phase 5: リファクタリング（TDD: Refactor）
  └─ T-05-1: コード品質改善
Phase 6: 品質保証
  └─ T-06-1: E2Eテスト成功確認
```

---

## Phase 1: 設計

### T-01-1: プレビューAPI設計（スキーマ定義、エンドポイント仕様）

#### 目的

プレビューAPIのインターフェース（リクエスト/レスポンス）を定義し、実装の基盤を作る。

#### 背景

明確なAPI設計があることで、バックエンドとフロントエンドの並行開発が可能になる。

#### 責務（単一責務）

API仕様の定義のみ。実装は行わない。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:design-api chat-export-preview
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @api-doc-writer
- **選定理由**: REST API設計、OpenAPI仕様書作成、エンドポイント定義の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                  | 活用方法                               |
| ------------------------- | -------------------------------------- |
| openapi-specification     | OpenAPI 3.x形式でエンドポイント定義    |
| request-response-examples | サンプルリクエスト/レスポンスの作成    |
| zod-validation            | リクエスト/レスポンスのZodスキーマ定義 |

- **参照**: `.claude/skills/skill_list.md`

#### 設計仕様

**エンドポイント:**

```
GET /api/v1/sessions/:sessionId/preview?format={format}&range={range}&messageIds={ids}
```

**クエリパラメータ:**

- `format`: エクスポート形式（markdown | json）
- `range`: エクスポート範囲（all | selected）
- `messageIds`: 選択メッセージID（カンマ区切り、rangeがselectedの場合のみ）

**レスポンススキーマ:**

```typescript
interface ExportPreviewResponse {
  sessionId: string;
  title: string;
  messageCount: number;
  totalTokens: number;
  estimatedFileSize: {
    markdown: number; // bytes
    json: number; // bytes
  };
  dateRange: {
    firstMessage: string; // ISO 8601
    lastMessage: string; // ISO 8601
  };
  modelUsage: Record<string, number>; // { "provider/model": count }
}
```

#### 成果物

| 成果物              | パス                                                               | 内容                                                 |
| ------------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| Zodスキーマ定義     | `packages/shared/src/types/chat-export-preview.ts`                 | ExportPreviewResponse, ExportPreviewRequest の型定義 |
| API設計ドキュメント | `docs/30-workflows/chat-history-persistence/api-preview-design.md` | エンドポイント仕様、サンプルリクエスト/レスポンス    |

#### 完了条件

- [ ] Zodスキーマが定義されている
- [ ] API設計ドキュメントが作成されている
- [ ] サンプルリクエスト/レスポンスが記載されている
- [ ] TypeScriptエラーなし

#### 依存関係

- **前提**: T-04-4完了
- **後続**: T-03-1, T-03-2（テスト作成）

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: プレビューAPIのユニットテスト作成

#### 目的

プレビューAPI（ビジネスロジック）の期待動作を定義するユニットテストを実装前に作成する。

#### 背景

TDD原則に基づき、実装前にテストを作成し、仕様を明確化する。

#### 責務（単一責務）

プレビューAPIロジックのテストケース定義のみ。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests packages/shared/src/features/chat-history/api/preview.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @unit-tester
- **選定理由**: TDD原則、境界値分析、等価分割によるテストケース設計の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                               |
| ----------------------- | -------------------------------------- |
| tdd-principles          | Red-Green-Refactorサイクルの実践       |
| boundary-value-analysis | メッセージ数、トークン数の境界値テスト |
| test-naming-conventions | Given-When-Then形式のテストケース命名  |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース一覧

**正常系:**

1. 全メッセージのプレビュー情報を取得できる
2. Markdown形式のファイルサイズが正しく推定される
3. JSON形式のファイルサイズが正しく推定される
4. モデル使用状況が集計される
5. 日付範囲が正しく計算される

**異常系:** 6. 存在しないセッションIDでエラーを返す7. 不正なメッセージIDでエラーを返す8. メッセージが0件の場合でも動作する

**境界値:** 9. メッセージ1件の場合10. メッセージ1000件以上の場合11. トークン数0の場合

#### 成果物

| 成果物            | パス                                                                  | 内容                                  |
| ----------------- | --------------------------------------------------------------------- | ------------------------------------- |
| APIユニットテスト | `packages/shared/src/features/chat-history/__tests__/preview.test.ts` | プレビューAPIロジックのテスト（11件） |

#### TDD検証: Red状態確認

```bash
pnpm --filter @repo/shared test:run src/features/chat-history/__tests__/preview.test.ts
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] 上記11件のテストケースが作成されている
- [ ] テスト実行時に「関数が存在しない」エラーで失敗する（Red状態）
- [ ] TypeScriptエラーなし

#### 依存関係

- **前提**: T-01-1（API設計完了）
- **後続**: T-04-1（API実装）

---

### T-03-2: プレビューUIのユニットテスト作成

#### 目的

プレビュー表示UIの期待動作を定義するユニットテストを実装前に作成する。

#### 背景

UI実装前にテストを作成し、期待される動作を明確化する。

#### 責務（単一責務）

プレビューUIコンポーネントのテストケース定義のみ。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/components/chat/ExportPreview.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @frontend-tester
- **選定理由**: フロントエンドコンポーネントテスト、React Testing Library、アクセシビリティテストの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                         |
| ----------------------- | -------------------------------- |
| tdd-principles          | テストファースト開発             |
| accessibility-wcag      | アクセシビリティテストケース設計 |
| test-naming-conventions | 明確なテストケース命名           |

- **参照**: `.claude/skills/skill_list.md`

#### テストケース一覧

**基本動作:**

1. プレビューボタンが表示される
2. プレビューボタンクリックでプレビュー情報が表示される
3. ローディング中はスピナーが表示される
4. エラー時はエラーメッセージが表示される

**プレビュー情報表示:** 5. メッセージ数が表示される 6. 総トークン数が表示される 7. 推定ファイルサイズが表示される 8. 日付範囲が表示される 9. モデル使用状況が表示される

**インタラクション:** 10. プレビューを閉じることができる 11. プレビュー表示中もエクスポートボタンが使用できる

**アクセシビリティ:** 12. プレビューボタンに適切な `aria-label` がある 13. プレビュー情報に適切な `role` がある

#### 成果物

| 成果物           | パス                                                                | 内容                                       |
| ---------------- | ------------------------------------------------------------------- | ------------------------------------------ |
| UIユニットテスト | `apps/desktop/src/components/chat/__tests__/ExportPreview.test.tsx` | プレビューUIコンポーネントのテスト（13件） |

#### TDD検証: Red状態確認

```bash
pnpm test:run src/components/chat/__tests__/ExportPreview.test.tsx
```

- [ ] テストが失敗することを確認（Red状態）

#### 完了条件

- [ ] 上記13件のテストケースが作成されている
- [ ] テスト実行時にコンポーネント未実装で失敗する（Red状態）
- [ ] TypeScriptエラーなし

#### 依存関係

- **前提**: T-01-1（API設計完了）
- **後続**: T-04-2（UI実装）

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: プレビューAPI実装

#### 目的

Phase 3で作成したAPIテストを成功させるため、プレビューAPIのビジネスロジックを実装する。

#### 背景

TDDサイクルのGreen段階。テストを通すための最小限の実装を行う。

#### 責務（単一責務）

プレビューAPI（データ集計・計算ロジック）の実装のみ。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:implement-business-logic chat-export-preview
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @logic-dev
- **選定理由**: ビジネスロジック実装、TDD準拠開発、Clean Code原則の専門家。プレビュー情報計算ロジックの実装に最適。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                         |
| ---------------------- | -------------------------------- |
| tdd-red-green-refactor | テストを通すための最小限実装     |
| clean-code-practices   | 意味のある命名、小さな関数       |
| zod-validation         | リクエストバリデーション         |
| query-optimization     | DBクエリ最適化（メッセージ取得） |

- **参照**: `.claude/skills/skill_list.md`

#### 実装詳細

**1. Zodスキーマ定義**

`packages/shared/src/types/chat-export-preview.ts`

```typescript
export const exportPreviewRequestSchema = z.object({
  format: z.enum(["markdown", "json"]),
  range: z.enum(["all", "selected"]),
  messageIds: z.array(z.string()).optional(),
});

export const exportPreviewResponseSchema = z.object({
  sessionId: z.string(),
  title: z.string(),
  messageCount: z.number(),
  totalTokens: z.number(),
  estimatedFileSize: z.object({
    markdown: z.number(),
    json: z.number(),
  }),
  dateRange: z.object({
    firstMessage: z.string(),
    lastMessage: z.string(),
  }),
  modelUsage: z.record(z.string(), z.number()),
});

export type ExportPreviewRequest = z.infer<typeof exportPreviewRequestSchema>;
export type ExportPreviewResponse = z.infer<typeof exportPreviewResponseSchema>;
```

**2. プレビューロジック実装**

`packages/shared/src/features/chat-history/api/preview.ts`

```typescript
export async function getExportPreview(
  sessionId: string,
  options: ExportPreviewRequest,
): Promise<ExportPreviewResponse> {
  // 1. セッション取得
  // 2. メッセージ取得（rangeに応じて）
  // 3. プレビュー情報計算
  //    - totalTokens: メッセージのtokenUsage合計
  //    - estimatedFileSize: 形式ごとに推定
  //    - dateRange: 最初/最後のメッセージtimestamp
  //    - modelUsage: モデルごとのメッセージ数集計
  // 4. レスポンス返却
}
```

#### 成果物

| 成果物  | パス                                                       | 内容                       |
| ------- | ---------------------------------------------------------- | -------------------------- |
| 型定義  | `packages/shared/src/types/chat-export-preview.ts`         | Zodスキーマと型定義        |
| API実装 | `packages/shared/src/features/chat-history/api/preview.ts` | プレビュー情報取得ロジック |

#### TDD検証: Green状態確認

```bash
pnpm --filter @repo/shared test:run src/features/chat-history/__tests__/preview.test.ts
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] プレビューAPI関数が実装されている
- [ ] Phase 3-1で作成したテスト11件が全て成功する
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし

#### 依存関係

- **前提**: T-03-1（APIテスト作成）
- **後続**: T-04-2（UI実装）

---

### T-04-2: プレビューUI実装

#### 目的

ChatHistoryExport コンポーネントにプレビューボタンとプレビュー表示UIを実装し、Phase 3-2で作成したテストを成功させる。

#### 背景

TDDサイクルのGreen段階。APIが完成したので、フロントエンドUIを実装する。

#### 責務（単一責務）

プレビューUIの実装のみ。API実装は別タスクで完了している。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-component ExportPreview molecule
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @ui-designer
- **選定理由**: モジュラー設計、非同期データ表示、ローディング状態管理、エラーハンドリングUIの専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                       | 活用方法                                        |
| ------------------------------ | ----------------------------------------------- |
| component-composition-patterns | Controlled Component パターン                   |
| accessibility-wcag             | aria-label、role、キーボード操作                |
| apple-hig-guidelines           | Apple HIG準拠のデザイン                         |
| error-boundary                 | エラー発生時のFallback UI                       |
| react-hooks-advanced           | useState, useEffect, useCallback による状態管理 |

- **参照**: `.claude/skills/skill_list.md`

#### 実装詳細

**1. ExportPreview コンポーネント作成**

`apps/desktop/src/components/chat/ExportPreview.tsx`

```typescript
interface ExportPreviewProps {
  sessionId: string;
  format: ExportFormat;
  range: ExportRange;
  selectedMessageIds?: string[];
  onClose: () => void;
}

export function ExportPreview({ ... }: ExportPreviewProps) {
  const [previewData, setPreviewData] = useState<ExportPreviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // プレビューAPI呼び出し
  }, [sessionId, format, range, selectedMessageIds]);

  return (
    // プレビュー情報表示UI
  );
}
```

**2. ChatHistoryExport への統合**

`apps/desktop/src/components/chat/ChatHistoryExport.tsx`

```typescript
const [showPreview, setShowPreview] = useState(false);

// プレビューボタン追加
<button
  type="button"
  onClick={() => setShowPreview(true)}
  aria-label="プレビュー"
  className="..."
>
  プレビュー
</button>

// プレビュー表示
{showPreview && (
  <ExportPreview
    sessionId={session.id}
    format={format}
    range={range}
    selectedMessageIds={selectedMessageIds}
    onClose={() => setShowPreview(false)}
  />
)}
```

#### 成果物

| 成果物           | パス                                                     | 内容                                |
| ---------------- | -------------------------------------------------------- | ----------------------------------- |
| UIコンポーネント | `apps/desktop/src/components/chat/ExportPreview.tsx`     | プレビュー情報表示コンポーネント    |
| 統合コード       | `apps/desktop/src/components/chat/ChatHistoryExport.tsx` | プレビューボタンと表示ロジック      |
| 型定義           | `apps/desktop/src/components/chat/types.ts`              | ExportPreviewProps インターフェース |
| Exportファイル   | `apps/desktop/src/components/chat/index.ts`              | ExportPreview のエクスポート追加    |

#### TDD検証: Green状態確認

```bash
pnpm test:run src/components/chat/__tests__/ExportPreview.test.tsx
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] `ExportPreview` コンポーネントが実装されている
- [ ] プレビューボタンが表示される
- [ ] プレビューボタンクリックでプレビュー情報が表示される
- [ ] Phase 3-2で作成したテスト13件が全て成功する
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし

#### 依存関係

- **前提**: T-04-1（API実装完了）、T-03-2（UIテスト作成）
- **後続**: T-05-1（リファクタリング）

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: コード品質改善

#### 目的

実装したコードを、保守性と再利用性の観点からリファクタリングする。

#### 背景

Green状態達成後、コードの可読性・パフォーマンス・型安全性を向上させる。

#### 責務（単一責務）

コード品質改善のみ。新機能追加は行わない。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/components/chat/ExportPreview.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @code-quality
- **選定理由**: リファクタリング、Clean Code原則、SOLID原則の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                       | 活用方法                                      |
| ------------------------------ | --------------------------------------------- |
| refactoring-techniques         | Extract Method、Simplify Conditional パターン |
| clean-code-practices           | 意味のある命名、小さな関数                    |
| type-safety-patterns           | 型推論最大化                                  |
| performance-optimization-react | React.memo、useCallback最適化                 |

- **参照**: `.claude/skills/skill_list.md`

#### リファクタリング観点

**コード可読性:**

- [ ] 関数名・変数名が意図を表現
- [ ] 1関数1責務
- [ ] 定数化（マジックナンバー排除）

**パフォーマンス:**

- [ ] 不要な再レンダリングがない
- [ ] useCallback/useMemo が適切に使用されている

**型安全性:**

- [ ] any型なし
- [ ] 型推論最大化
- [ ] 型ガード適切に実装

#### 成果物

| 成果物                   | パス                                                 | 内容             |
| ------------------------ | ---------------------------------------------------- | ---------------- |
| リファクタリング後コード | `apps/desktop/src/components/chat/ExportPreview.tsx` | 改善されたコード |

#### TDD検証: 継続Green確認

```bash
pnpm test:run src/components/chat/__tests__/ExportPreview.test.tsx
```

- [ ] リファクタリング後もテストが成功

#### 完了条件

- [ ] 全ユニットテスト継続成功（APIテスト11件 + UIテスト13件）
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし
- [ ] コード複雑度が基準値以下

#### 依存関係

- **前提**: T-04-2（UI実装完了）
- **後続**: T-06-1（品質保証）

---

## Phase 6: 品質保証

### T-06-1: E2Eテスト成功確認とカバレッジ検証

#### 目的

実装したプレビュー機能が、E2Eテストで期待通りに動作することを確認し、品質ゲートをクリアする。

#### 背景

ユニットテストは成功しているが、実際のブラウザ環境でのE2E動作を検証する必要がある。

#### 責務（単一責務）

E2Eテスト実行と結果検証のみ。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:run-all-tests --coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: @e2e-tester
- **選定理由**: Playwrightブラウザ自動化、E2Eシナリオ検証の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名              | 活用方法                            |
| --------------------- | ----------------------------------- |
| playwright-testing    | Playwrightセレクタ戦略、waitFor戦略 |
| flaky-test-prevention | 非決定性排除、明示的待機            |
| api-mocking           | プレビューAPIモック設定確認         |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物             | パス                                        | 内容                      |
| ------------------ | ------------------------------------------- | ------------------------- |
| テストレポート     | `apps/desktop/playwright-report/index.html` | E2Eテスト実行結果レポート |
| カバレッジレポート | `apps/desktop/coverage/index.html`          | コードカバレッジレポート  |

#### 品質ゲートチェックリスト

**機能検証:**

- [ ] 全ユニットテスト成功（APIテスト11件 + UIテスト13件 = 24件）
- [ ] 対象E2Eテスト成功（1件）
  - 「エクスポート前にプレビュー情報を表示できる」
- [ ] E2Eテスト成功率 100%（22/22件）達成

**コード品質:**

- [ ] Lintエラーなし
- [ ] TypeScript型エラーなし
- [ ] Prettierフォーマット適用済み

**カバレッジ:**

- [ ] Statement Coverage ≥ 80%
- [ ] Branch Coverage ≥ 75%
- [ ] Function Coverage ≥ 80%

**アクセシビリティ:**

- [ ] axe-core違反なし
- [ ] キーボード操作対応確認
- [ ] スクリーンリーダー対応確認

#### 完了条件

- [ ] 品質ゲートチェックリスト全項目がクリアされている
- [ ] E2Eテスト成功率が100%（22/22件）に到達

#### 依存関係

- **前提**: T-05-1（リファクタリング完了）
- **後続**: なし（タスク完了）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] プレビューボタンが表示される
- [ ] プレビューボタンクリックでプレビュー情報が表示される
- [ ] メッセージ数、総トークン数、推定ファイルサイズが表示される
- [ ] 日付範囲（最初/最後のメッセージ）が表示される
- [ ] モデル使用状況が表示される
- [ ] プレビューを閉じることができる

### 品質要件

- [ ] APIユニットテスト11件全て成功
- [ ] UIユニットテスト13件全て成功
- [ ] E2Eテスト1件が追加成功（合計22/22件成功 = 100%）
- [ ] コードカバレッジ80%以上
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし
- [ ] axe-core違反なし

### ドキュメント要件

- [ ] コンポーネントの JSDoc コメントが記述されている
- [ ] API関数の JSDoc コメントが記述されている
- [ ] Props の型定義にコメントがある

---

## 6. 検証方法

### テストケース

#### APIユニットテスト検証

```bash
pnpm --filter @repo/shared test:run src/features/chat-history/__tests__/preview.test.ts
```

**期待結果:** 11件全て成功

#### UIユニットテスト検証

```bash
pnpm test:run src/components/chat/__tests__/ExportPreview.test.tsx
```

**期待結果:** 13件全て成功

#### E2Eテスト検証

```bash
pnpm test:e2e e2e/chat-history-export.spec.ts --grep "プレビュー"
```

**期待結果:** 1件成功（「エクスポート前にプレビュー情報を表示できる」）

#### 全E2Eテスト検証

```bash
pnpm test:e2e e2e/chat-history-export.spec.ts
```

**期待結果:** 22/22件全て成功（100%）

### 手動検証手順

1. デスクトップアプリを起動: `pnpm --filter @repo/desktop dev`
2. チャット履歴詳細ページに遷移: `/chat/history/{sessionId}`
3. エクスポートボタンをクリック
4. エクスポートダイアログ内に「プレビュー」ボタンが表示されることを確認
5. プレビューボタンをクリック
6. プレビュー情報が表示されることを確認:
   - メッセージ数: XX件
   - 総トークン数: XXXX
   - 推定ファイルサイズ（Markdown）: XX,XXX bytes
   - 推定ファイルサイズ（JSON）: XX,XXX bytes
   - 日付範囲: YYYY/MM/DD HH:MM ~ YYYY/MM/DD HH:MM
   - モデル使用状況: provider/model: X件
7. プレビューを閉じることができる
8. プレビュー表示後もエクスポートが正常に動作することを確認

---

## 7. リスクと対策

| リスク                                    | 影響度 | 発生確率 | 対策                                           |
| ----------------------------------------- | ------ | -------- | ---------------------------------------------- |
| プレビューAPI呼び出しのパフォーマンス劣化 | 中     | 中       | メッセージ取得クエリを最適化、必要な列のみ取得 |
| 大量メッセージ時のファイルサイズ推定精度  | 低     | 中       | サンプリングによる推定（最初100件で平均算出）  |
| プレビュー表示UIの複雑化                  | 中     | 低       | ExportPreview コンポーネントとして分離         |
| プレビューAPIエラー時のUX低下             | 中     | 低       | エラー時もエクスポートは実行可能な設計         |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/chat-history-persistence/ui-ux-design.md` - UIデザイン仕様
- `apps/desktop/e2e/chat-history-export.spec.ts:354-403` - E2Eテストコード（プレビュー機能）
- `apps/desktop/src/components/chat/ChatHistoryExport.tsx` - エクスポートダイアログ実装
- `packages/shared/src/features/chat-history/service.ts` - ChatHistoryService実装

### 参考資料

- [Apple HIG - Modals](https://developer.apple.com/design/human-interface-guidelines/modals)
- [WCAG 2.1 - Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [React Hooks - useEffect](https://react.dev/reference/react/useEffect)

---

## 9. 備考

### E2Eテスト失敗の詳細

**テスト: エクスポート前にプレビュー情報を表示できる**

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /プレビュー/i })
```

プレビューボタンが存在しないため、タイムアウト。

### E2Eテストが期待するプレビューAPIレスポンス

```json
{
  "sessionId": "session-12345",
  "title": "React開発についての質問",
  "messageCount": 24,
  "totalTokens": 4520,
  "estimatedFileSize": {
    "markdown": 15234,
    "json": 28456
  },
  "dateRange": {
    "firstMessage": "2025-12-20T14:30:15.000Z",
    "lastMessage": "2025-12-20T15:45:00.000Z"
  },
  "modelUsage": {
    "anthropic/claude-3-5-sonnet-20241022": 12,
    "openai/gpt-4": 0
  }
}
```

### E2Eテストが期待するUI表示

E2Eテストは以下のテキストが表示されることを期待：

```
- "メッセージ数: 24件"
- "総トークン数: 4520"
- "推定ファイルサイズ: 15,234 bytes" (カンマ区切り)
- "anthropic/claude-3-5-sonnet-20241022: 12件"
```

### 実装時の注意点

1. **ファイルサイズ表示**: カンマ区切り（15,234）で表示
2. **モデル名**: provider/model形式（例: anthropic/claude-3-5-sonnet-20241022）
3. **日付表示**: ロケールに応じた表示（日本語環境では日本語形式）
4. **エラーハンドリング**: プレビュー失敗時もエクスポートは実行可能
5. **アクセシビリティ**: プレビュー情報に適切なセマンティックHTML（`<dl>`, `<dt>`, `<dd>`など）

### 補足事項

- プレビュー機能は「Nice to have」機能のため、優先度は低
- メッセージ選択UI実装（T-04-4-EXT-1）を先に実施することを推奨
- プレビューAPIは、将来的に他の機能（バッチエクスポート等）でも再利用可能

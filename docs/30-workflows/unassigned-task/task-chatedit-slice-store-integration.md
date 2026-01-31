# chatEditSlice Store統合 - タスク指示書

## メタ情報

```yaml
issue_number: 596
```

## メタ情報

| 項目         | 内容                                           |
| ------------ | ---------------------------------------------- |
| タスクID     | task-chatedit-store-integration-001            |
| タスク名     | chatEditSlice Store統合                        |
| 分類         | 改善                                           |
| 対象機能     | AppStore（Zustand状態管理）                    |
| 優先度       | 中                                             |
| 見積もり規模 | 小規模                                         |
| ステータス   | 未実施                                         |
| 発見元       | システム仕様書分析（arch-state-management.md） |
| 発見日       | 2026-01-31                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`chatEditSlice`（AIによるコード編集機能の状態管理Slice）は、workspace-chat-editタスク（2026-01-23完了）でコアロジックが実装済みである。しかし、`arch-state-management.md`に「Store統合（予定）」として明記されている通り、AppStore（`apps/desktop/src/renderer/store/index.ts`）への統合がまだ実施されていない。

現在は`apps/desktop/src/renderer/features/workspace-chat-edit/store/`に独立して存在しており、AppStoreの統一的な状態管理パターンに組み込まれていない状態である。

### 1.2 問題点・課題

1. `chatEditSlice`がAppStoreに統合されておらず、他のSlice（skillSlice、permissionSlice等）と異なるアクセスパターンを使用している
2. `useAppStore`フックを通じた統一的なセレクタアクセスができない
3. Store DevToolsでchatEditの状態がAppStoreと一緒に確認できない
4. 他のSliceとの状態間連携（例: skillSliceの実行結果をchatEditに反映）が困難

### 1.3 放置した場合の影響

- 状態管理パターンの一貫性が損なわれ、新規開発者の認知負荷が増大する
- Store全体の状態をスナップショットで取得する機能（将来的なデバッグ・永続化機能）に`chatEditSlice`が含まれない
- ただし、機能的には独立Storeで動作するため、即座のブロッカーにはならない

---

## 2. 何を達成するか（What）

### 2.1 目的

`chatEditSlice`をAppStoreに統合し、全Sliceが`useAppStore`フックから統一的にアクセスできるようにする。

### 2.2 最終ゴール

- `useAppStore((s) => s.fileContexts)` のようなセレクタパターンで chatEdit 状態にアクセスできる
- Store DevTools で chatEdit 状態が AppStore の一部として表示される
- 全122件の既存テスト（chatEditSlice）が引き続きPASSする
- 他のSliceとの状態連携パスが確保されている

### 2.3 スコープ

#### 含むもの

- `AppStore`インターフェースへの`ChatEditSlice` extends追加
- `create`関数内での`createChatEditSlice(set, get)`スプレッド展開
- 既存テストの移行・互換性確認
- Store統合後の動作確認

#### 含まないもの

- chatEditSliceの機能追加・変更
- 新規UIコンポーネントの作成
- chatEditSliceのリファクタリング（現行ロジックをそのまま統合）
- バックエンド側の変更

### 2.4 成果物

| 成果物                        | 説明                                |
| ----------------------------- | ----------------------------------- |
| store/index.ts（更新）        | AppStoreにchatEditSlice統合         |
| store/slices/types.ts（更新） | ChatEditSlice型をAppStoreに追加     |
| テスト（更新）                | 統合後のStore経由でのアクセステスト |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- workspace-chat-editタスクが完了していること（2026-01-23完了済み）
- `apps/desktop/src/renderer/features/workspace-chat-edit/store/` にchatEditSlice実装が存在すること
- AppStore（`apps/desktop/src/renderer/store/index.ts`）が正常に動作していること

### 3.2 依存タスク

| タスクID            | タスク名            | ステータス |
| ------------------- | ------------------- | ---------- |
| workspace-chat-edit | Workspace Chat Edit | 完了       |

### 3.3 必要な知識

- Zustand StateCreatorパターン（Slicedパターン）
- TypeScript のインターフェースextends構文
- スプレッド展開によるSlice統合パターン（`...createXxxSlice(set, get)`）
- `useAppStore` 個別セレクタパターン

### 3.4 推奨アプローチ

`arch-state-management.md`に記載されている統合手順に従う:

1. `createChatEditSlice`と`ChatEditSlice`をインポート
2. `AppStore`インターフェースに`ChatEditSlice`をextends
3. `create`関数内でスプレッド展開
4. 既存テストをAppStore経由に更新

---

## 4. 実行手順

### Phase構成

本タスクは小規模であり、実装 → テスト → 検証 の2段階で実施する。

### Phase 1-3: 要件定義・設計・設計レビュー

#### 目的

統合対象の型定義と影響範囲を確認する。

#### 手順

1. `apps/desktop/src/renderer/store/index.ts` の現在のAppStore構造を確認
2. `apps/desktop/src/renderer/features/workspace-chat-edit/store/` のエクスポート構造を確認
3. `ChatEditSlice`の型がAppStoreの既存Sliceと名前衝突しないか確認
4. 統合設計書を作成（影響ファイル一覧、型定義変更一覧）

#### 成果物

- 統合設計書（影響ファイル一覧）

#### 完了条件

- 名前衝突が無いことを確認
- 影響範囲が明確

### Phase 4-6: テスト作成・実装・テスト拡充

#### 目的

chatEditSliceをAppStoreに統合し、テストで動作を検証する。

#### 手順

1. `store/index.ts` にインポート追加:
   - `import { createChatEditSlice } from '@/renderer/features/workspace-chat-edit'`
   - `import type { ChatEditSlice } from '@/renderer/features/workspace-chat-edit'`
2. `AppStore`インターフェースに `ChatEditSlice` を extends 追加
3. `create<AppStore>` 内に `...createChatEditSlice(set, get)` を展開
4. テスト作成: `useAppStore((s) => s.fileContexts)` パターンでアクセスできることを検証
5. 既存テスト122件がPASSすることを確認

#### 成果物

- `store/index.ts`（更新）
- 統合テスト

#### 完了条件

- `pnpm --filter @repo/desktop test` 全テストPASS
- TypeScript strict PASS
- ESLint / Prettier PASS

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useAppStore((s) => s.fileContexts)` でchatEdit状態にアクセスできる
- [ ] `useAppStore((s) => s.addFileContext)` でchatEditアクションを呼び出せる
- [ ] Store DevToolsでchatEdit状態がAppStoreの一部として表示される
- [ ] 既存の独立Store使用箇所がAppStore経由に移行されている

### 品質要件

- [ ] 全テスト PASS（既存chatEditSlice 122件 + 統合テスト）
- [ ] TypeScript strict PASS
- [ ] ESLint / Prettier PASS
- [ ] テストカバレッジ: Line 80%以上

### ドキュメント要件

- [ ] 実装ガイド（Part 1 / Part 2）が作成されている
- [ ] `arch-state-management.md` の「Store統合（予定）」が「完了」に更新されている

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                       | 期待結果                         |
| ------ | -------------------------------- | -------------------------------- |
| TC-001 | AppStoreからfileContexts取得     | 空配列が返る（初期状態）         |
| TC-002 | addFileContextアクション実行     | fileContextsに要素が追加される   |
| TC-003 | clearAllContextsアクション実行   | fileContextsが空になる           |
| TC-004 | openDiffPreview/closeDiffPreview | isDiffPreviewOpenが切り替わる    |
| TC-005 | 既存skillSliceとの共存確認       | skillSliceの状態が影響を受けない |
| TC-006 | 既存chatEditSliceテスト122件PASS | 全テストが引き続き動作する       |

### 検証手順

1. `pnpm --filter @repo/desktop vitest run` で全テスト実行
2. `pnpm --filter @repo/desktop tsc --noEmit` で型チェック実行
3. Store DevToolsでchatEdit状態がAppStoreツリーに表示されることを手動確認

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                             |
| -------------------------------------------- | ------ | -------- | ------------------------------------------------ |
| chatEditSliceのプロパティ名が既存Sliceと衝突 | 高     | 低       | 事前に全Slice型定義を確認、衝突時はnamespace分離 |
| 独立Store使用箇所の移行漏れ                  | 中     | 中       | grep で独立Store参照箇所を網羅的に検索           |
| 統合後のStore初期化パフォーマンス低下        | 低     | 低       | Sliceのlazy初期化パターンを検討                  |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                    | パス                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| 状態管理アーキテクチャ仕様      | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`                      |
| UIコンポーネントアーキテクチャ  | `.claude/skills/aiworkflow-requirements/references/arch-ui-components.md`                         |
| TASK-7D ChatPanel統合実装ガイド | `docs/30-workflows/TASK-7D-chat-panel-integration/outputs/phase-12/implementation-guide-part2.md` |

### 参考資料

- Zustand Sliced パターン: StateCreator + Combine
- arch-state-management.md セクション「chatEditSlice」「Store統合（予定）」

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
arch-state-management.md (lines 167-192):
### Store統合（予定）
**統合先ファイル**: apps/desktop/src/renderer/store/index.ts
AppStoreインターフェースにChatEditSliceをextends追加
create関数内でスプレッド構文によりcreateChatEditSlice(set, get)を展開
```

### 補足事項

- chatEditSlice は workspace-chat-edit タスク（2026-01-23完了）でコアロジック実装済み
- テストカバレッジ: Line 69.23%, Branch 89.74%, Function 95%（122件の自動テスト）
- 統合パターンは skillSlice の統合実装を参考にすることを推奨

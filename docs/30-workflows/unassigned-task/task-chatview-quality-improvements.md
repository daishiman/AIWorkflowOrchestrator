# ChatView コード品質改善 - タスク指示書

## メタ情報

| 項目             | 内容                            |
| ---------------- | ------------------------------- |
| タスクID         | QUALITY-01                      |
| タスク名         | ChatView コード品質改善         |
| 分類             | リファクタリング/品質改善       |
| 対象機能         | チャット履歴ナビゲーション      |
| 優先度           | 中                              |
| 見積もり規模     | 小規模（約65分）                |
| ステータス       | 未実施                          |
| 発見元           | Phase 7 最終レビューゲート      |
| 発見日           | 2025-12-25                      |
| 発見エージェント | code-quality.md, arch-police.md |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Phase 7の最終レビューゲートにて、4つの専門エージェント（arch-police, code-quality, sec-auditor, logic-dev）による包括的なコードレビューを実施した結果、ChatView コンポーネントに以下の改善点が特定されました：

- **SOLID原則**: Single Responsibility Principle (SRP) と Interface Segregation Principle (ISP) の軽微な違反
- **コード品質スコア**: 8.5/10（優秀だが改善の余地あり）
- **ドキュメント**: JSDocコメントの不足
- **テストカバレッジ**: エッジケースの追加が推奨

### 1.2 問題点・課題

#### 問題1: SRP違反 - ChatViewの責務過多

ChatViewコンポーネントが以下の複数の責務を持っている：

- ナビゲーション状態管理 (`useState` for `selectedChatId`)
- ストア選択 (`useAppSelector`)
- ナビゲーションロジック (`handleChatSelect`)
- レンダリングロジック
- エラーハンドリング
- ローディング状態管理

**影響**: コンポーネントの肥大化、テスタビリティの低下、再利用性の低下

#### 問題2: ISP違反 - ブロードなセレクター使用

ChatViewが必要以上のストア状態に依存している：

```typescript
const chats = useAppSelector((state) => state.chat.chats);
const isLoading = useAppSelector((state) => state.chat.isLoading);
const error = useAppSelector((state) => state.chat.error);
```

**影響**: 不要な再レンダリング、コンポーネント間の結合度上昇

#### 問題3: ドキュメント不足

パブリックAPIやカスタムフック、主要関数にJSDocコメントが不足している。

**影響**: 開発者体験の低下、メンテナンス性の低下

#### 問題4: テストカバレッジのギャップ

ナビゲーション中のローディング状態など、特定のエッジケースのテストが不足している。

**影響**: 潜在的なバグリスク

### 1.3 放置した場合の影響

**短期的影響**:

- コンポーネントの理解・修正に時間がかかる
- 新機能追加時の影響範囲が不明確

**長期的影響**:

- 技術的負債の蓄積
- コードベース全体の品質低下への悪影響
- 新規開発者のオンボーディング困難

**注**: ただし、現状でも機能的には問題なく動作しており、リリースはブロックされていない（判定: MINOR）

---

## 2. 何を達成するか（What）

### 2.1 目的

ChatViewコンポーネントのSOLID原則準拠度を向上させ、コード品質スコアを9.0/10以上に引き上げる。

### 2.2 最終ゴール

- **SRP準拠**: ナビゲーションロジックをカスタムフックに分離
- **ISP準拠**: 専用セレクターによる最小限の依存関係
- **ドキュメント完備**: 全パブリックAPI・フックにJSDoc追加
- **テスト充実**: エッジケースを含む包括的なテストカバレッジ
- **コード品質スコア**: 9.0/10以上

### 2.3 スコープ

#### 含むもの

1. **Navigation Hook抽出** (優先度: MEDIUM, 30分)
   - `useChatNavigation.ts` の作成
   - `selectedChatId` 状態管理の移動
   - `handleChatSelect`, `clearSelection` の移動

2. **専用セレクター作成** (優先度: LOW, 20分)
   - `chatSelectors.ts` の作成
   - `selectChatListView` セレクター
   - `selectChatDetailView` セレクター

3. **JSDocコメント追加** (優先度: LOW, 15分)
   - ChatView コンポーネントのJSDoc
   - useChatNavigation フックのJSDoc
   - 主要な関数・型のJSDoc

4. **テスト強化** (優先度: OPTIONAL, 時間外)
   - ナビゲーション中のローディング状態テスト
   - 連続クリックのテスト
   - ブラウザバック動作のテスト

#### 含まないもの

- ステータスコンポーネントの抽出（優先度が低い）
- 他のビューコンポーネントへの適用
- パフォーマンス最適化（別タスク）

### 2.4 成果物

| 成果物             | パス                                                     | 内容                             |
| ------------------ | -------------------------------------------------------- | -------------------------------- |
| Navigation Hook    | `src/renderer/hooks/useChatNavigation.ts`                | ナビゲーション状態・ロジック管理 |
| Chat Selectors     | `src/renderer/store/selectors/chatSelectors.ts`          | 専用Redux セレクター             |
| 更新されたChatView | `src/renderer/views/ChatView/index.tsx`                  | 分離後のビューコンポーネント     |
| テストファイル     | `src/renderer/views/ChatView/ChatView.test.tsx`          | エッジケース追加                 |
| Hook テスト        | `src/renderer/hooks/__tests__/useChatNavigation.test.ts` | Hook単体テスト                   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Phase 6 品質保証が完了済み（テスト成功率99.96%、カバレッジ98.23%）
- Lint・型エラーがゼロの状態
- 既存のChatView実装が動作している

### 3.2 依存タスク

- なし（独立したリファクタリングタスク）

### 3.3 必要な知識・スキル

- React Hooks パターン
- Redux Toolkit (セレクターパターン)
- TypeScript
- JSDoc記法
- React Testing Library
- リファクタリング手法

### 3.4 推奨アプローチ

**アプローチ**: TDDサイクルを維持しながら段階的リファクタリング

1. **Red**: 現在のテストが全てパスすることを確認
2. **Green**: リファクタリング実施（内部構造変更、外部動作不変）
3. **Refactor**: テストが引き続きパスすることを確認
4. **Extend**: 新しいテストケースを追加

**注意点**:

- 各変更後に必ずテストを実行
- 外部インターフェースは変更しない（破壊的変更の回避）
- コミットは小さく頻繁に

---

## 4. 実行手順

### Phase構成

```
Phase 0: リファクタリング計画 → Phase 1: Navigation Hook抽出 →
Phase 2: セレクター作成 → Phase 3: JSDoc追加 →
Phase 4: テスト強化 → Phase 5: 品質検証 → Phase 6: コードレビュー
```

---

### Phase 0: リファクタリング計画

#### 目的

既存コードの理解を深め、リファクタリングの影響範囲を特定する。

#### 背景

安全なリファクタリングには、既存の依存関係・テストカバレッジの正確な把握が必須。

#### 責務（単一責務）

現状分析とリファクタリング計画の策定のみ。実装は含まない。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです
> ⚠️ Worktreeディレクトリ内で実行してください

```bash
# 既存のChatView実装を確認
cat src/renderer/views/ChatView/index.tsx

# 既存のテストを確認
cat src/renderer/views/ChatView/ChatView.test.tsx

# 既存のchatSliceを確認
cat src/renderer/store/slices/chatSlice.ts

# 依存関係を確認
grep -r "ChatView" src/renderer --include="*.tsx" --include="*.ts"
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 成果物

| 成果物         | パス   | 内容                 |
| -------------- | ------ | -------------------- |
| 影響範囲マップ | メモリ | ChatViewの依存関係図 |
| リスク評価     | メモリ | 各変更のリスクレベル |

#### 完了条件

- [ ] ChatViewの全依存関係が明確化されている
- [ ] 既存テストが全て理解されている
- [ ] リファクタリング手順が確定している

---

### Phase 1: Navigation Hook抽出（TDD Red→Green）

#### T-01-1: Navigation Hook作成

##### 目的

ナビゲーション状態管理をChatViewから分離し、SRP原則に準拠させる。

##### 背景

ChatViewコンポーネントが複数の責務を持っているため、ナビゲーション関連ロジックを独立したフックに抽出する。

##### 責務（単一責務）

ナビゲーション状態管理とロジックのカスタムフック化のみ。セレクターやドキュメントは含まない。

##### Claude Code スラッシュコマンド

```
# Step 1: テストファイル作成（TDD Red）
/ai:create-test src/renderer/hooks/useChatNavigation.ts --test-type=unit
```

```
# Step 2: Hook実装（TDD Green）
/ai:implement-business-logic --file=src/renderer/hooks/useChatNavigation.ts
```

```
# Step 3: ChatViewの更新
/ai:refactor --target=src/renderer/views/ChatView/index.tsx --pattern=extract-hook
```

```
# Step 4: テスト実行
pnpm --filter @repo/desktop test src/renderer/hooks/__tests__/useChatNavigation.test.ts
pnpm --filter @repo/desktop test src/renderer/views/ChatView/ChatView.test.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`, `.claude/agents/frontend-tester.md`
- **選定理由**: コード品質向上とフロントエンドテスト作成に特化
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                        | 活用方法                 | 選定理由                       |
| ----------------------------------------------- | ------------------------ | ------------------------------ |
| `.claude/skills/custom-hooks-patterns/SKILL.md` | フック設計パターンの適用 | React Hooks ベストプラクティス |
| `.claude/skills/solid-principles/SKILL.md`      | SRP原則の適用確認        | 単一責務の検証                 |

- **参照**: `.claude/skills/skill_list.md`

##### 実装方針

**新規ファイル**: `src/renderer/hooks/useChatNavigation.ts`

````typescript
/**
 * チャットナビゲーション状態管理フック
 *
 * ChatViewのナビゲーション関連ロジックを管理します。
 * selectedChatIdの状態とその更新ロジックを提供します。
 *
 * @example
 * ```tsx
 * const { selectedChatId, handleChatSelect, clearSelection } = useChatNavigation();
 * ```
 */
export function useChatNavigation() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedChatId(null);
  }, []);

  return {
    selectedChatId,
    handleChatSelect,
    clearSelection,
  };
}
````

**更新ファイル**: `src/renderer/views/ChatView/index.tsx`

```typescript
// Before
const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
const handleChatSelect = useCallback((chatId: string) => {
  setSelectedChatId(chatId);
}, []);

// After
const navigation = useChatNavigation();
// navigation.selectedChatId, navigation.handleChatSelect を使用
```

##### 成果物

| 成果物             | パス                                                     | 内容                     |
| ------------------ | -------------------------------------------------------- | ------------------------ |
| Navigation Hook    | `src/renderer/hooks/useChatNavigation.ts`                | ナビゲーション状態管理   |
| Hook テスト        | `src/renderer/hooks/__tests__/useChatNavigation.test.ts` | Hook単体テスト           |
| 更新されたChatView | `src/renderer/views/ChatView/index.tsx`                  | Hookを使用するように更新 |

##### 完了条件

- [ ] useChatNavigationフックが作成されている
- [ ] フックのユニットテストが全てパスしている
- [ ] ChatViewの既存テストが全てパスしている
- [ ] Lintエラーがない
- [ ] 型エラーがない

##### 依存関係

- **前提**: Phase 0（リファクタリング計画）
- **後続**: Phase 2（セレクター作成）

---

### Phase 2: 専用セレクター作成

#### T-02-1: Redux Selectorの作成

##### 目的

ISP原則に準拠し、コンポーネントが必要最小限の状態のみに依存するようにする。

##### 背景

ChatViewが全てのchat状態に依存しているため、必要な状態のみを取得する専用セレクターを作成する。

##### 責務（単一責務）

Redux セレクターの作成とChatViewへの適用のみ。

##### Claude Code スラッシュコマンド

```
# Step 1: セレクターファイル作成
/ai:create-schema src/renderer/store/selectors/chatSelectors.ts
```

```
# Step 2: ChatViewの更新
/ai:refactor --target=src/renderer/views/ChatView/index.tsx --pattern=use-selectors
```

```
# Step 3: テスト実行
pnpm --filter @repo/desktop test src/renderer/views/ChatView/ChatView.test.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/state-manager.md`
- **選定理由**: Redux状態管理パターンに特化
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                        | 活用方法      | 選定理由                 |
| ----------------------------------------------- | ------------- | ------------------------ |
| `.claude/skills/interface-segregation/SKILL.md` | ISP原則の適用 | 最小インターフェース設計 |

- **参照**: `.claude/skills/skill_list.md`

##### 実装方針

**新規ファイル**: `src/renderer/store/selectors/chatSelectors.ts`

```typescript
import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

/**
 * チャット一覧表示に必要な状態を選択
 */
export const selectChatListView = createSelector(
  [(state: RootState) => state.chat],
  (chat) => ({
    chats: chat.chats,
    isLoading: chat.isLoading,
  }),
);

/**
 * チャット詳細表示に必要な状態を選択
 */
export const selectChatDetailView = (chatId: string) =>
  createSelector([(state: RootState) => state.chat], (chat) => ({
    chat: chat.chats.find((c) => c.id === chatId),
    error: chat.error,
  }));
```

##### 成果物

| 成果物             | パス                                            | 内容           |
| ------------------ | ----------------------------------------------- | -------------- |
| Chat Selectors     | `src/renderer/store/selectors/chatSelectors.ts` | 専用セレクター |
| 更新されたChatView | `src/renderer/views/ChatView/index.tsx`         | セレクター使用 |

##### 完了条件

- [ ] chatSelectorsファイルが作成されている
- [ ] ChatViewが専用セレクターを使用している
- [ ] 既存テストが全てパスしている
- [ ] 不要な再レンダリングが削減されている（検証）

##### 依存関係

- **前提**: Phase 1（Navigation Hook抽出）
- **後続**: Phase 3（JSDoc追加）

---

### Phase 3: JSDocコメント追加

#### T-03-1: ドキュメント追加

##### 目的

コードの可読性・保守性を向上させるため、全パブリックAPIにJSDocを追加する。

##### 背景

Phase 7レビューでドキュメント不足が指摘されたため、JSDocコメントを追加する。

##### 責務（単一責務）

JSDocコメントの追加のみ。コードロジックは変更しない。

##### Claude Code スラッシュコマンド

```
# ChatView、useChatNavigation、selectorsにJSDoc追加
/ai:add-documentation --target=src/renderer/views/ChatView/index.tsx
/ai:add-documentation --target=src/renderer/hooks/useChatNavigation.ts
/ai:add-documentation --target=src/renderer/store/selectors/chatSelectors.ts
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/api-doc-writer.md`
- **選定理由**: APIドキュメント作成に特化
- **参照**: `.claude/agents/agent_list.md`

##### 成果物

| 成果物                       | パス         | 内容      |
| ---------------------------- | ------------ | --------- |
| ドキュメント化されたファイル | 既存ファイル | JSDoc追加 |

##### 完了条件

- [ ] 全パブリックAPIにJSDocが追加されている
- [ ] JSDocの文法エラーがない
- [ ] TypeDocで生成可能（オプション）

##### 依存関係

- **前提**: Phase 2（セレクター作成）
- **後続**: Phase 4（テスト強化）

---

### Phase 4: テスト強化（オプション）

#### T-04-1: エッジケーステスト追加

##### 目的

テストカバレッジのギャップを埋め、エッジケースをカバーする。

##### 背景

Phase 7レビューでエッジケースのテスト不足が指摘されたため、追加テストを作成する。

##### 責務（単一責務）

テストケースの追加のみ。実装コードは変更しない。

##### Claude Code スラッシュコマンド

```
# エッジケーステスト追加
/ai:create-test src/renderer/views/ChatView/index.tsx --focus=edge-cases
```

```
# テスト実行
pnpm --filter @repo/desktop test:coverage
```

- **参照**: `.claude/commands/ai/command_list.md`

##### 使用エージェント

- **エージェント**: `.claude/agents/frontend-tester.md`
- **選定理由**: フロントエンドテスト作成に特化
- **参照**: `.claude/agents/agent_list.md`

##### 活用スキル

| スキル名                                          | 活用方法         | 選定理由   |
| ------------------------------------------------- | ---------------- | ---------- |
| `.claude/skills/boundary-value-analysis/SKILL.md` | エッジケース特定 | 境界値分析 |

- **参照**: `.claude/skills/skill_list.md`

##### テストケース

1. ナビゲーション中のローディング状態
2. 連続クリック時の動作
3. ブラウザバック後の状態復元

##### 成果物

| 成果物     | パス                                            | 内容         |
| ---------- | ----------------------------------------------- | ------------ |
| 追加テスト | `src/renderer/views/ChatView/ChatView.test.tsx` | エッジケース |

##### 完了条件

- [ ] 3つのエッジケーステストが追加されている
- [ ] 全テストがパスしている
- [ ] カバレッジが維持または向上している

##### 依存関係

- **前提**: Phase 3（JSDoc追加）
- **後続**: Phase 5（品質検証）

---

### Phase 5: 品質検証

#### T-05-1: 品質メトリクス確認

##### 目的

リファクタリング後の品質が目標を達成していることを確認する。

##### Claude Code スラッシュコマンド

```
# 全テスト実行
pnpm --filter @repo/desktop test:coverage

# Lint実行
pnpm lint

# 型チェック
pnpm typecheck
```

##### 品質基準

| メトリクス       | 目標値  | 確認方法             |
| ---------------- | ------- | -------------------- |
| テスト成功率     | 100%    | `pnpm test`          |
| コードカバレッジ | ≥98%    | `pnpm test:coverage` |
| Lintエラー       | 0       | `pnpm lint`          |
| 型エラー         | 0       | `pnpm typecheck`     |
| コード品質スコア | ≥9.0/10 | Code-quality agent   |

##### 完了条件

- [ ] 全品質基準を満たしている
- [ ] 既存機能が正常動作している
- [ ] パフォーマンス劣化がない

---

### Phase 6: 最終コードレビュー

#### T-06-1: コードレビュー実施

##### 目的

リファクタリングの品質を専門エージェントで検証する。

##### Claude Code スラッシュコマンド

```
/ai:code-review-complete --phase=refactoring --severity=MINOR
```

##### 使用エージェント

- **エージェント**: `.claude/agents/code-quality.md`
- **選定理由**: SOLID原則準拠の再確認

##### 合格基準

- [ ] SRP原則: PASS
- [ ] ISP原則: PASS
- [ ] コード品質スコア: ≥9.0/10
- [ ] MAJOR/CRITICAL問題: 0件

---

## 5. 品質基準

### 5.1 機能要件

- [ ] ChatViewの既存機能が全て動作する
- [ ] ナビゲーションが正常に機能する
- [ ] RAGモード切替が正常に機能する

### 5.2 非機能要件

- [ ] パフォーマンス劣化なし（レンダリング時間±5%以内）
- [ ] バンドルサイズ増加なし（±1KB以内）
- [ ] メモリリーク なし

### 5.3 コード品質要件

- [ ] SOLID原則準拠（SRP, ISP）
- [ ] コード品質スコア ≥9.0/10
- [ ] Lintエラー 0
- [ ] 型エラー 0
- [ ] テストカバレッジ ≥98%

### 5.4 ドキュメント要件

- [ ] 全パブリックAPIにJSDocあり
- [ ] JSDoc文法エラーなし
- [ ] 使用例が記載されている

---

## 6. リスク管理

### 6.1 リスク一覧

| リスク                   | 発生確率 | 影響度 | 対策                    |
| ------------------------ | -------- | ------ | ----------------------- |
| 既存テストの失敗         | 低       | 高     | 各Phase後に全テスト実行 |
| パフォーマンス劣化       | 低       | 中     | 変更前後でベンチマーク  |
| 意図しない動作変更       | 低       | 高     | E2Eテスト実施           |
| 他コンポーネントへの影響 | 極低     | 中     | 依存関係事前確認        |

### 6.2 ロールバック計画

各Phaseで問題が発生した場合：

1. 即座にGit commitを revert
2. 問題の根本原因を分析
3. 修正後に再実行

---

## 7. 見積もり

| Phase    | 作業項目                 | 見積時間             |
| -------- | ------------------------ | -------------------- |
| Phase 0  | リファクタリング計画     | 10分                 |
| Phase 1  | Navigation Hook抽出      | 30分                 |
| Phase 2  | セレクター作成           | 20分                 |
| Phase 3  | JSDoc追加                | 15分                 |
| Phase 4  | テスト強化（オプション） | 20分                 |
| Phase 5  | 品質検証                 | 10分                 |
| Phase 6  | コードレビュー           | 10分                 |
| **合計** |                          | **115分（約2時間）** |

**コアタスク（Phase 1-3）**: 約65分

---

## 8. 参照

### 8.1 関連ドキュメント

- Phase 7 最終レビューゲート結果（本タスクの発見元）
- `.claude/skills/solid-principles/SKILL.md`
- `.claude/skills/custom-hooks-patterns/SKILL.md`
- `.claude/skills/interface-segregation/SKILL.md`

### 8.2 関連コード

- `src/renderer/views/ChatView/index.tsx`
- `src/renderer/store/slices/chatSlice.ts`
- `src/renderer/views/ChatView/ChatView.test.tsx`

---

## 9. 備考

### 9.1 Phase 7レビュー結果詳細

**Architecture Review (arch-police)**: OK

- Layer Violations: PASS
- Atomic Design: PASS
- Minor改善提案: 2件（非ブロッキング）

**Code Quality Review (code-quality)**: MINOR

- SRP: 7/10（本タスクで改善対象）
- ISP: 8/10（本タスクで改善対象）
- その他SOLID: 10/10
- Clean Code: 8.5/10 → 目標9.0/10

**Security Audit (sec-auditor)**: OK

- 脆弱性: 0件

**Business Logic Review (logic-dev)**: OK

- 全機能要件: PASS

### 9.2 優先順位の判断基準

このタスクは「中」優先度としている理由：

- 機能的には問題なく動作している（リリースブロックなし）
- コード品質向上によるメンテナンス性改善効果が中程度
- 実施工数が小規模（約2時間）で費用対効果が高い
- 他の新機能開発と並行実施可能

**推奨実施タイミング**: 次のスプリントまたは余裕があるタイミング

---

**タスク作成日**: 2025-12-25
**作成者**: Phase 7 Review Results (code-quality.md, arch-police.md)
**最終更新**: 2025-12-25

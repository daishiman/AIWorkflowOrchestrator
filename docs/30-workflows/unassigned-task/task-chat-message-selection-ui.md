# チャット履歴メッセージ選択UI実装 - タスク指示書

## メタ情報

| 項目             | 内容                                         |
| ---------------- | -------------------------------------------- |
| タスクID         | T-04-4-EXT-1                                 |
| タスク名         | チャット履歴メッセージ選択UI実装             |
| 分類             | 改善                                         |
| 対象機能         | チャット履歴エクスポート機能                 |
| 優先度           | 中                                           |
| 見積もり規模     | 小規模                                       |
| ステータス       | 未実施                                       |
| 発見元           | Phase 7（最終レビューゲート）- E2Eテスト実行 |
| 発見日           | 2025-12-23                                   |
| 発見エージェント | .claude/agents/e2e-tester.md                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

T-04-4（チャット履歴エクスポート機能実装）のE2Eテスト実行時、以下の2件のテストが失敗しました：

```
[chromium] › e2e/chat-history-export.spec.ts:303:3 › 選択したメッセージのみエクスポートできる
[chromium] › e2e/chat-history-export.spec.ts:468:3 › 選択メッセージが不正な場合、エラーメッセージを表示する
```

**失敗原因：**

- E2Eテストは `data-testid="message-checkbox-${msgId}"` という属性を持つチェックボックス要素を期待
- 現在の実装（`ChatHistoryView/index.tsx`）では、メッセージは表示のみでチェックボックスが存在しない
- エクスポートダイアログには「選択したメッセージ」ラジオボタンはあるが、実際にメッセージを選択するUIがない

### 1.2 問題点・課題

**現在の制約：**

1. ユーザーは「全メッセージ」のエクスポートしか選択できない
2. 特定のメッセージのみエクスポートしたいというユースケースに対応できない
3. E2Eテストで定義された仕様（メッセージ選択機能）が未実装

**ユーザー影響：**

- 長い会話履歴の一部だけをエクスポートしたい場合に不便
- 不要なメッセージを含むエクスポートファイルが生成される
- エクスポートファイルサイズが大きくなる

### 1.3 放置した場合の影響

- E2Eテスト成功率が86%（19/22件）のまま改善しない
- ユーザー体験の低下（柔軟なエクスポートができない）
- 仕様と実装の乖離が継続する
- 将来的に追加実装する際、既存コードの大幅な変更が必要になる可能性

---

## 2. 何を達成するか（What）

### 2.1 目的

チャット履歴詳細画面（`/chat/history/:sessionId`）に、個別メッセージを選択できるチェックボックスUIを実装し、選択したメッセージのみをエクスポートできるようにする。

### 2.2 最終ゴール

- チャット履歴詳細画面の各メッセージにチェックボックスを追加
- チェックボックスでメッセージを選択/解除できる
- 選択されたメッセージIDを状態管理し、エクスポートダイアログに渡す
- エクスポートダイアログの「選択したメッセージ」オプション選択時に、選択されたメッセージのみエクスポート
- E2Eテスト2件が成功する
- E2Eテスト成功率が86% → 95%（21/22件）に向上

### 2.3 スコープ

#### 含むもの

- `ChatHistoryView/index.tsx` へのチェックボックスUI追加
- 選択メッセージIDの状態管理（useState）
- `data-testid="message-checkbox-${msgId}"` 属性の付与
- エクスポートダイアログへの選択メッセージID渡し
- アクセシビリティ対応（WCAG 2.1 AA準拠）
- ユニットテストの追加（新規テストファイル作成）
- 既存E2Eテストの成功確認

#### 含まないもの

- 一括選択/解除ボタン（Nice to have、将来拡張）
- メッセージプレビュー機能（別タスクで対応）
- メッセージ検索・フィルター機能
- エクスポートファイル形式の変更

### 2.4 成果物

| 種別   | 成果物                                   | 配置先                                                                      |
| ------ | ---------------------------------------- | --------------------------------------------------------------------------- |
| 機能   | メッセージ選択チェックボックスUI         | `apps/desktop/src/renderer/views/ChatHistoryView/index.tsx`                 |
| 機能   | メッセージ選択コンポーネント（分離推奨） | `apps/desktop/src/components/chat/MessageSelectableList.tsx`                |
| テスト | ユニットテスト                           | `apps/desktop/src/components/chat/__tests__/MessageSelectableList.test.tsx` |
| 品質   | E2Eテスト成功確認レポート                | `docs/30-workflows/chat-history-persistence/test-results.md`                |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- T-04-4（チャット履歴エクスポート機能実装）が完了していること
- ユニットテスト37件が全て成功していること
- E2Eテスト19件が成功していること（現状）
- React Router導入済み
- ChatHistoryExport コンポーネントが `initialSelectedMessageIds` プロパティを受け付けること

### 3.2 依存タスク

| タスクID | タスク名                             | 状態    |
| -------- | ------------------------------------ | ------- |
| T-04-1   | チャット履歴サービス実装             | ✅ 完了 |
| T-04-2   | ChatHistoryList コンポーネント実装   | ✅ 完了 |
| T-04-3   | ChatHistorySearch コンポーネント実装 | ✅ 完了 |
| T-04-4   | ChatHistoryExport コンポーネント実装 | ✅ 完了 |

### 3.3 必要な知識・スキル

- React Hooks（useState, useCallback）による状態管理
- TypeScript による型安全な実装
- アクセシビリティ（WCAG 2.1 AA）対応
- Tailwind CSS によるスタイリング（Apple HIG準拠）
- Vitest + React Testing Library によるテスト作成
- Playwright E2Eテストの理解

### 3.4 推奨アプローチ

**実装パターン：Controlled Components**

1. **状態管理の一元化**
   - `ChatHistoryView` で `selectedMessageIds: string[]` を状態管理
   - 子コンポーネントに props として渡す

2. **コンポーネント分割**
   - `MessageSelectableList` コンポーネントを新規作成（推奨）
   - 責務：メッセージ表示 + チェックボックス制御
   - 再利用性を考慮した設計

3. **アクセシビリティ**
   - `aria-label` でメッセージ内容を説明
   - `role="checkbox"` の明示
   - キーボード操作対応（Space/Enterで選択切り替え）

4. **型安全性**
   - 選択メッセージIDの型定義
   - Props の interface 定義

---

## 4. 実行手順

### Phase構成

```
Phase 3: テスト作成（TDD: Red）
  └─ T-03-1: メッセージ選択UIのユニットテスト作成
Phase 4: 実装（TDD: Green）
  └─ T-04-1: メッセージ選択UI実装
Phase 5: リファクタリング（TDD: Refactor）
  └─ T-05-1: コンポーネント分離と型安全性向上
Phase 6: 品質保証
  └─ T-06-1: E2Eテスト成功確認
```

---

## Phase 3: テスト作成 (TDD: Red)

### T-03-1: メッセージ選択UIのユニットテスト作成

#### 目的

メッセージ選択チェックボックスの期待動作を定義するユニットテストを実装前に作成し、TDDのRed状態（テスト失敗）を確認する。

#### 背景

実装前にテストを書くことで、仕様を明確化し、テスト駆動で品質の高い実装を行う。

#### 責務（単一責務）

メッセージ選択チェックボックスUIのテストケース定義のみ。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:generate-unit-tests apps/desktop/src/components/chat/MessageSelectableList.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/unit-tester.md
- **選定理由**: ユニットテスト作成の専門家。TDD原則に基づいた境界値分析・等価分割によるテストケース設計に精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                | 活用方法                                                                 |
| ----------------------- | ------------------------------------------------------------------------ |
| .claude/skills/tdd-principles/SKILL.md          | Red-Green-Refactorサイクルの実践、テストファースト開発                   |
| .claude/skills/boundary-value-analysis/SKILL.md | チェックボックス選択パターンの境界値テスト（0件選択、1件選択、全件選択） |
| .claude/skills/test-naming-conventions/SKILL.md | Given-When-Then形式のテストケース命名                                    |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物                 | パス                                                                        | 内容                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| ユニットテストファイル | `apps/desktop/src/components/chat/__tests__/MessageSelectableList.test.tsx` | チェックボックス選択/解除、選択状態の保持、親コンポーネントへのコールバック、アクセシビリティのテスト |

#### TDD検証: Red状態確認

```bash
pnpm test:run src/components/chat/__tests__/MessageSelectableList.test.tsx
```

- [ ] テストが失敗することを確認（Red状態）- コンポーネント未実装のため

#### テストケース一覧

**基本動作:**

1. メッセージ一覧が正しく表示される
2. 各メッセージにチェックボックスが表示される
3. チェックボックスをクリックで選択/解除できる
4. 選択状態が視覚的に分かる

**状態管理:** 5. 初期選択メッセージIDが渡された場合、該当メッセージがチェック済み6. メッセージ選択時に `onSelectionChange` コールバックが呼ばれる 7. 選択解除時に `onSelectionChange` コールバックが呼ばれる 8. 複数メッセージを選択できる

**アクセシビリティ:** 9. チェックボックスに適切な `aria-label` がある 10. キーボードでチェックボックスを操作できる（Space/Enter）11. チェック状態が `aria-checked` で適切に反映される

**エッジケース:** 12. メッセージが0件の場合、チェックボックスが表示されない13. 存在しないメッセージIDが初期選択に含まれている場合、無視される

#### 完了条件

- [ ] 上記13件のテストケースが作成されている
- [ ] テスト実行時に「コンポーネントが存在しない」エラーで失敗する（Red状態）
- [ ] テストコードが TypeScript エラーなしでコンパイルされる
- [ ] テストファイルが `.claude/skills/test-naming-conventions/SKILL.md` の命名規則に従っている

#### 依存関係

- **前提**: T-04-4完了
- **後続**: T-04-1（実装フェーズ）

---

## Phase 4: 実装 (TDD: Green)

### T-04-1: メッセージ選択UI実装

#### 目的

メッセージ一覧に選択チェックボックスを追加し、Phase 3で作成したテストを成功させる（Green状態）。

#### 背景

TDDサイクルのGreen段階。テストを通すための最小限の実装を行う。

#### 責務（単一責務）

メッセージ選択チェックボックスUIの実装のみ。プレビュー機能や一括選択などの追加機能は含まない。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:create-component MessageSelectableList molecule
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/ui-designer.md
- **選定理由**: モジュラー設計、Composition パターン、アクセシビリティ（WCAG）、Apple HIG準拠のUI実装に精通。チェックボックスUIの適切な実装と状態管理を担当。
- **代替候補**: .claude/agents/frontend-tester.md（テスト観点からの実装）も検討したが、UI設計の専門性を優先
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名                       | 活用方法                                            | 選定理由                                   |
| ------------------------------ | --------------------------------------------------- | ------------------------------------------ |
| .claude/skills/component-composition-patterns/SKILL.md | Controlled Component パターンでチェックボックス実装 | 状態管理の責務を親に委譲し、再利用性を確保 |
| .claude/skills/accessibility-wcag/SKILL.md             | aria-label、role、キーボード操作対応                | WCAG 2.1 AA準拠のチェックボックス実装      |
| .claude/skills/apple-hig-guidelines/SKILL.md           | Apple HIG準拠のチェックボックスデザイン             | 既存デザインシステムとの整合性確保         |
| .claude/skills/state-lifting/SKILL.md                  | 選択状態を親コンポーネント（ChatHistoryView）で管理 | 単一情報源の原則を遵守                     |

- **参照**: `.claude/skills/skill_list.md`

#### 実装詳細

**1. 新規コンポーネント作成（推奨）**

`apps/desktop/src/components/chat/MessageSelectableList.tsx`

```typescript
interface MessageSelectableListProps {
  messages: ChatMessage[];
  selectedMessageIds: string[];
  onSelectionChange: (messageIds: string[]) => void;
}

export function MessageSelectableList({
  messages,
  selectedMessageIds,
  onSelectionChange,
}: MessageSelectableListProps) {
  // チェックボックスUI実装
}
```

**2. ChatHistoryView への統合**

`apps/desktop/src/renderer/views/ChatHistoryView/index.tsx`

```typescript
const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);

const handleSelectionChange = useCallback((messageIds: string[]) => {
  setSelectedMessageIds(messageIds);
}, []);

// エクスポートダイアログへ渡す
<ChatHistoryExport
  session={session}
  onExport={handleExport}
  onClose={() => setIsExportDialogOpen(false)}
  initialSelectedMessageIds={selectedMessageIds}  // 追加
/>
```

**3. 型定義の追加**

`apps/desktop/src/types/chat-message.ts` に必要に応じて型追加

#### 成果物

| 成果物           | パス                                                         | 内容                                         |
| ---------------- | ------------------------------------------------------------ | -------------------------------------------- |
| UIコンポーネント | `apps/desktop/src/components/chat/MessageSelectableList.tsx` | メッセージ選択チェックボックスコンポーネント |
| 型定義           | `apps/desktop/src/components/chat/types.ts`                  | MessageSelectableListProps インターフェース  |
| 統合コード       | `apps/desktop/src/renderer/views/ChatHistoryView/index.tsx`  | MessageSelectableList 使用コード             |
| Exportファイル   | `apps/desktop/src/components/chat/index.ts`                  | MessageSelectableList のエクスポート追加     |

#### TDD検証: Green状態確認

```bash
pnpm test:run src/components/chat/__tests__/MessageSelectableList.test.tsx
```

- [ ] テストが成功することを確認（Green状態）

#### 完了条件

- [ ] `MessageSelectableList` コンポーネントが実装されている
- [ ] 各メッセージに `data-testid="message-checkbox-${msgId}"` チェックボックスがある
- [ ] チェックボックスのチェック/解除で `onSelectionChange` が呼ばれる
- [ ] `ChatHistoryView` で選択メッセージIDが状態管理されている
- [ ] エクスポートダイアログに `initialSelectedMessageIds` が渡される
- [ ] Phase 3で作成したユニットテスト13件が全て成功する
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし

#### 依存関係

- **前提**: T-03-1（テスト作成）
- **後続**: T-05-1（リファクタリング）

---

## Phase 5: リファクタリング (TDD: Refactor)

### T-05-1: コンポーネント分離と型安全性向上

#### 目的

実装したコードを、保守性と再利用性の観点からリファクタリングする。動作を変えずにコード品質を改善。

#### 背景

Green状態達成後、コードの可読性・保守性・型安全性を向上させる。

#### 責務（単一責務）

コード品質改善のみ。新機能追加は行わない。

#### Claude Code スラッシュコマンド

> ⚠️ 以下はターミナルコマンドではなく、Claude Code内で実行するスラッシュコマンドです

```
/ai:refactor apps/desktop/src/components/chat/MessageSelectableList.tsx
```

- **参照**: `.claude/commands/ai/command_list.md`

#### 使用エージェント

- **エージェント**: .claude/agents/code-quality.md
- **選定理由**: Clean Code原則、SOLID原則、リファクタリングパターンの専門家。コードの可読性と保守性向上に精通。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名               | 活用方法                                                |
| ---------------------- | ------------------------------------------------------- |
| .claude/skills/refactoring-techniques/SKILL.md | Extract Method、Introduce Parameter Object パターン適用 |
| .claude/skills/clean-code-practices/SKILL.md   | 意味のある命名、小さな関数、DRY原則の適用               |
| .claude/skills/type-safety-patterns/SKILL.md   | TypeScript 型推論の最大化、型ガード実装                 |

- **参照**: `.claude/skills/skill_list.md`

#### リファクタリング観点

**コード可読性:**

- [ ] 関数名・変数名が意図を明確に表現している
- [ ] 1つの関数が1つの責務のみを持つ
- [ ] マジックナンバー・マジックストリングが定数化されている

**型安全性:**

- [ ] any型が使用されていない
- [ ] 型推論が最大限活用されている
- [ ] 型ガードが適切に実装されている

**DRY原則:**

- [ ] 重複コードが排除されている
- [ ] 共通ロジックが関数として抽出されている

#### 成果物

| 成果物                   | パス                                                         | 内容             |
| ------------------------ | ------------------------------------------------------------ | ---------------- |
| リファクタリング後コード | `apps/desktop/src/components/chat/MessageSelectableList.tsx` | 改善されたコード |

#### TDD検証: 継続Green確認

```bash
pnpm test:run src/components/chat/__tests__/MessageSelectableList.test.tsx
```

- [ ] リファクタリング後もテストが成功することを確認

#### 完了条件

- [ ] 全ユニットテストが継続成功（13件）
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし
- [ ] コード複雑度が基準値以下

#### 依存関係

- **前提**: T-04-1（実装完了、Green状態）
- **後続**: T-06-1（品質保証）

---

## Phase 6: 品質保証

### T-06-1: E2Eテスト成功確認とカバレッジ検証

#### 目的

実装したメッセージ選択UIが、E2Eテストで期待通りに動作することを確認し、品質ゲートをクリアする。

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

- **エージェント**: .claude/agents/e2e-tester.md
- **選定理由**: Playwrightブラウザ自動化、E2Eシナリオ検証、フレーキーテスト防止の専門家。
- **参照**: `.claude/agents/agent_list.md`

#### 活用スキル

| スキル名              | 活用方法                                     |
| --------------------- | -------------------------------------------- |
| .claude/skills/playwright-testing/SKILL.md    | Playwrightセレクタ戦略、waitFor戦略でE2E実行 |
| .claude/skills/flaky-test-prevention/SKILL.md | 非決定性排除、明示的待機でテスト安定化       |
| .claude/skills/test-data-management/SKILL.md  | テストデータの整合性確認                     |

- **参照**: `.claude/skills/skill_list.md`

#### 成果物

| 成果物             | パス                                        | 内容                      |
| ------------------ | ------------------------------------------- | ------------------------- |
| テストレポート     | `apps/desktop/playwright-report/index.html` | E2Eテスト実行結果レポート |
| カバレッジレポート | `apps/desktop/coverage/index.html`          | コードカバレッジレポート  |

#### 品質ゲートチェックリスト

**機能検証:**

- [ ] 全ユニットテスト成功（13件）
- [ ] 対象E2Eテスト成功（2件）
  - 「選択したメッセージのみエクスポートできる」
  - 「選択メッセージが不正な場合、エラーメッセージを表示する」
- [ ] E2Eテスト成功率 95%（21/22件）達成

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
- [ ] E2Eテスト成功率が95%（21/22件）に到達

#### 依存関係

- **前提**: T-05-1（リファクタリング完了）
- **後続**: なし（タスク完了）

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 各メッセージにチェックボックスが表示される
- [ ] チェックボックスでメッセージを選択/解除できる
- [ ] 選択されたメッセージIDが `ChatHistoryExport` に渡される
- [ ] 選択されたメッセージのみエクスポートできる
- [ ] 不正なメッセージID選択時にエラーメッセージが表示される

### 品質要件

- [ ] ユニットテスト13件全て成功
- [ ] E2Eテスト2件が追加成功（合計21/22件成功）
- [ ] コードカバレッジ80%以上
- [ ] TypeScriptエラーなし
- [ ] Lintエラーなし
- [ ] axe-core違反なし

### ドキュメント要件

- [ ] コンポーネントの JSDoc コメントが記述されている
- [ ] Props の型定義にコメントがある
- [ ] README.md の更新は不要（既存機能の拡張）

---

## 6. 検証方法

### テストケース

#### ユニットテスト検証

```bash
pnpm test:run src/components/chat/__tests__/MessageSelectableList.test.tsx
```

**期待結果:** 13件全て成功

#### E2Eテスト検証

```bash
pnpm test:e2e e2e/chat-history-export.spec.ts --grep "選択したメッセージ"
```

**期待結果:** 以下2件が成功

- 「選択したメッセージのみエクスポートできる」
- 「選択メッセージが不正な場合、エラーメッセージを表示する」

#### 手動検証手順

1. デスクトップアプリを起動: `pnpm --filter @repo/desktop dev`
2. チャット履歴詳細ページに遷移: `/chat/history/{sessionId}`
3. 各メッセージにチェックボックスが表示されることを確認
4. いくつかのメッセージをチェックボックスで選択
5. エクスポートボタンをクリック
6. エクスポートダイアログで「選択したメッセージ」ラジオボタンを選択
7. 選択件数が正しく表示されることを確認（例: (3件選択)）
8. ダウンロードボタンをクリック
9. エクスポートされたファイルに選択したメッセージのみが含まれることを確認

---

## 7. リスクと対策

| リスク                                 | 影響度 | 発生確率 | 対策                                                  |
| -------------------------------------- | ------ | -------- | ----------------------------------------------------- |
| チェックボックスの状態管理が複雑化     | 中     | 中       | Controlled Component パターンで親に状態を集約         |
| パフォーマンス劣化（大量メッセージ時） | 低     | 低       | 必要に応じて React.memo で最適化（Phase 5で対応）     |
| アクセシビリティ対応漏れ               | 中     | 低       | axe-core による自動検証を実施                         |
| E2Eテストのdata-testid要求との不整合   | 高     | 低       | 実装前にE2Eテストコードを確認し、期待される属性を把握 |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/chat-history-persistence/ui-ux-design.md` - UIデザイン仕様
- `apps/desktop/e2e/chat-history-export.spec.ts:303-365` - E2Eテストコード（選択機能）
- `apps/desktop/src/components/chat/ChatHistoryExport.tsx` - エクスポートダイアログ実装
- `apps/desktop/src/components/chat/types.ts` - 型定義

### 参考資料

- [WCAG 2.1 Checkbox Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)
- [Apple HIG - Selection Controls](https://developer.apple.com/design/human-interface-guidelines/selection-controls)
- [React Controlled Components](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)

---

## 9. 備考

### E2Eテスト失敗の詳細

**テスト1: 選択したメッセージのみエクスポートできる**

```
Error: locator.check: Error: Not a checkbox or radio button
Call log:
  - waiting for getByTestId('message-checkbox-msg1')
    - locator resolved to <div data-testid="message-checkbox-msg1" ...>
```

現在は `<div data-testid="message-checkbox-${msgId}">` となっているが、実際の `<input type="checkbox">` 要素が必要。

**テスト2: 選択メッセージが不正な場合、エラーメッセージを表示する**

```
Error: locator.check: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByTestId('message-checkbox-msg999')
```

同様にチェックボックス要素が存在しないため、タイムアウト。

### E2Eテストが期待する実装

```typescript
// 各メッセージ要素に以下が必要:
<div key={message.id}>
  <input
    type="checkbox"
    data-testid={`message-checkbox-${message.id}`}
    checked={selectedMessageIds.includes(message.id)}
    onChange={(e) => handleCheckboxChange(message.id, e.target.checked)}
    aria-label={`メッセージを選択: ${message.content.substring(0, 50)}`}
  />
  {/* メッセージ表示 */}
</div>
```

### 補足事項

- 既存のメッセージ表示UIを壊さないよう、チェックボックスは左端または右端に配置
- 選択されたメッセージは視覚的に分かるようハイライト表示（オプション）
- アクセシビリティのため、チェックボックスのラベルにメッセージ内容の一部を含める

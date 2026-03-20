# Phase 8: リファクタリング

## メタ情報

| 項目          | 値                                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Phase番号     | 8                                                                                                                       |
| 機能名        | WorkspaceChat ストリーミングエラーUX改善                                                                                |
| タスクID      | TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR                                                                                    |
| 作成日        | 2026-03-20                                                                                                              |
| 前Phase成果物 | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-7-coverage-check.md` |

## 目的

Phase 5で実装したコードのコード品質を改善する。重複ロジックの整理、型の明確化、読みやすさの向上を行う。リファクタリング後も全テストが Green であることを確認する。機能変更は一切行わない。

## 実行タスク

### Task 1: リファクタリング対象の特定

実装コードを確認して以下の観点でリファクタリング候補を洗い出す。

```bash
# 実装ファイルの確認
wc -l \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/mapLLMErrorToStreamingError.ts \
  apps/desktop/src/renderer/views/WorkspaceView/components/StreamingErrorDisplay.tsx \
  apps/desktop/src/renderer/views/WorkspaceView/hooks/useWorkspaceChatController.ts \
  apps/desktop/src/renderer/views/WorkspaceView/WorkspaceChatPanel.tsx

# 型の使用状況確認
grep -n "StreamingErrorState\|StreamingErrorAction" \
  apps/desktop/src/renderer/views/WorkspaceView/**/*.ts \
  apps/desktop/src/renderer/views/WorkspaceView/**/*.tsx 2>/dev/null
```

#### 確認観点

| 観点                     | チェック内容                                               |
| ------------------------ | ---------------------------------------------------------- |
| 重複コード               | `mapLLMErrorToStreamingError` の分岐に重複パターンがないか |
| 型の明確化               | `any` 型の使用がないか（P19対策）                          |
| non-null assertion       | `!` の使用がないか（P48対策）                              |
| useCallback依存配列      | P31対策が適切に実装されているか                            |
| CSS クラスの重複         | `StreamingErrorDisplay` のクラス文字列を共通化できるか     |
| コンポーネント分割妥当性 | `StreamingErrorDisplay` が単一責務か                       |

### Task 2: リファクタリングの実施

#### 2-A: mapLLMErrorToStreamingError の整理

- switch文のdefaultケースが適切に網羅しているか確認
- エラーメッセージ文字列を定数として抽出できる場合は抽出する（ただし3箇所以上で使用する場合のみ）

#### 2-B: StreamingErrorDisplay のクラス整理

P47（CSS変数ベーステスト）に従い、バリアントスタイルの記述を整理する（必要な場合のみ）。

#### 2-C: useWorkspaceChatController の整理

- `streamingError` 関連の state とコールバックが論理的にまとまっているか確認
- `lastUserMessageRef` の初期化・更新・参照が適切な位置にあるか確認

### Task 3: リファクタリング後のテスト実行

```bash
# 全テスト実行（全て Green であることを確認）
cd apps/desktop && pnpm vitest run src/renderer/views/WorkspaceView

# 型チェック
pnpm --filter @repo/desktop typecheck

# lint
pnpm --filter @repo/desktop lint
```

## 参照資料

| ドキュメント           | パス                                                                                                                    | 参照目的               |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Phase 5 実装           | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-5-implementation.md` | 実装ファイル一覧       |
| P19 型キャスト禁止     | `.claude/rules/06-known-pitfalls.md`                                                                                    | `as` キャスト禁止      |
| P31 useCallback対策    | `.claude/rules/06-known-pitfalls.md`                                                                                    | 依存配列確認           |
| P48 non-null assertion | `.claude/rules/06-known-pitfalls.md`                                                                                    | `!` 禁止               |
| コード品質ルール       | `.claude/rules/02-code-quality.md`                                                                                      | TypeScript型安全・規約 |

## 実行手順

1. **Task 1**: 実装ファイルを確認してリファクタリング候補を洗い出す
2. **Task 2**: 特定した候補に対してリファクタリングを実施する（機能変更なし）
3. **Task 3**: テスト・型チェック・lint を実行して全て Green であることを確認する

## 統合テスト連携

- 現行実装との差分、対象テスト、依存タスクとの接続点をこのPhaseで確認・更新する。
- 追加・変更したテスト観点は対応する `apps/desktop/src/` の実装ファイルと1対1で突合する。

## 成果物

| 成果物                             | パス                                                                                                                 | 形式       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------- |
| リファクタリング済み実装ファイル群 | `apps/desktop/src/renderer/views/WorkspaceView/`                                                                     | TypeScript |
| Phase 8 仕様書（本ファイル）       | `docs/30-workflows/ai-chat-llm-integration-fix/tasks/04-TASK-FIX-WORKSPACE-CHAT-STREAM-ERROR/phase-8-refactoring.md` | Markdown   |

## 完了条件

- [ ] Task 1: リファクタリング候補を洗い出し済み
- [ ] Task 2: 特定候補のリファクタリングを実施済み（機能変更なし）
- [ ] `any` 型が使用されていないこと（P19対策）
- [ ] non-null assertion（`!`）が使用されていないこと（P48対策）
- [ ] `useCallback` の依存配列が適切であること（P31対策）
- [ ] Task 3: 全テストが Green であること
- [ ] Task 3: `pnpm typecheck` が通ること
- [ ] Task 3: `pnpm lint` が通ること

## 次Phase

Phase 9: 品質検証 (`phase-9-quality-assurance.md`)

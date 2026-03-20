# [#1220] "[UT-IMP-LIVE-LLM-ADAPTER-MODEL-CONFIG-001] liveLLMAdapter のモデルID ハードコードを設定可能化"

## メタ情報

```yaml
task_id: UT-IMP-LIVE-LLM-ADAPTER-MODEL-CONFIG-001
task_name: liveLLMAdapter のモデルID ハードコードを設定可能化
category: 改善
target_feature: -
priority: 中
scale: 中規模
status: 未実施
source_phase: -
created_date: 2026-03-14
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-live-llm-adapter-model-config-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## メタ情報

| 項目         | 内容                                                 |
| ------------ | ---------------------------------------------------- |
| タスクID     | UT-IMP-LIVE-LLM-ADAPTER-MODEL-CONFIG-001             |
| タスク名     | liveLLMAdapter のモデルID ハードコードを設定可能化   |
| 分類         | 改善（imp）                                          |
| 対象機能     | Chat Edit / LLM Adapter（Main Process IPC層）        |
| 優先度       | 中                                                   |
| 見積もり規模 | 中規模                                               |
| ステータス   | 未実施                                               |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 実装wave |
| 発見日       | 2026-03-14                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装において、`ChatEditService` の `LLMAdapter` インターフェース（`sendMessage(prompt) -> {success, data?: {message}}`）と `ILLMAdapter` インターフェース（`sendChat(request) -> {content, model, usage}`）の型が異なり、直接接続できない問題が発生した。

解決策として `liveLLMAdapter` という Dynamic Adapter Bridge パターン（S32）を作成し、`sendMessage()` 内で request-time に provider を解決して型変換を行うようにした。しかし、この実装ではモデルID が `"claude-3-5-haiku-20241022"` としてハードコードされている。

```typescript
// ipc/index.ts 内の liveLLMAdapter
const response = await adapter.sendChat({
  messages: [{ role: "user", content: prompt }],
  modelId: "claude-3-5-haiku-20241022", // <- ハードコード
});
```

この問題は lessons-learned-current.md v1.29.89 の苦戦箇所4（Dynamic Adapter Bridge）として記録済みであり、architecture-implementation-patterns の S32 パターンとしても定義済みである。

### 1.2 問題点・課題

1. モデルID がハードコードされており、ユーザーが Settings で選択したモデルが Chat Edit に反映されない
2. `claude-3-5-haiku-20241022` は Anthropic に限定されており、他プロバイダー（OpenAI, Google, xAI）を選択しても Anthropic のモデルが使われる
3. モデルの更新・廃止時にコード変更が必要になる

### 1.3 放置した場合の影響

- ユーザーが Settings でモデルやプロバイダーを変更しても Chat Edit に反映されず、ユーザー体験の一貫性が損なわれる
- Anthropic 以外のプロバイダーを利用するユーザーにとって、Chat Edit 機能が事実上 Anthropic 専用になる
- `claude-3-5-haiku-20241022` モデルが廃止された場合、Chat Edit 機能が停止する

---

## 2. 何を達成するか（What）

### 2.1 目的

`liveLLMAdapter` のモデルID をユーザー設定または LLM Slice の選択状態から動的に取得するようにし、Chat Edit が Settings の設定に追随するようにする。

### 2.2 最終ゴール

- Settings で選択したモデルが Chat Edit で使用される
- プロバイダー変更時にモデルが自動的に切り替わる
- 設定未選択時にフォールバックモデルが使用される
- ハードコードされたモデルID がコードベースから除去される

### 2.3 スコープ

#### 含むもの

- `ipc/index.ts` の `liveLLMAdapter.sendMessage()` 内のモデルID 取得ロジック変更
- ユーザー設定（LLM Slice `selectedModel`）からモデルID を取得する仕組み
- プロバイダーとモデルの整合性チェック（選択されたプロバイダーに対応するモデルかの検証）
- フォールバックモデルの設定

#### 含まないもの

- モデル選択 UI の変更
- 新規プロバイダーの追加
- `ChatEditService` 本体の変更

### 2.4 成果物

| 成果物                                | 説明                                              |
| ------------------------------------- | ------------------------------------------------- |
| `ipc/index.ts`（更新）                | liveLLMAdapter のモデルID 動的取得ロジック        |
| モデル設定取得モジュール（新規/更新） | Main Process から選択モデルを取得する仕組み       |
| テスト（新規/更新）                   | モデルID 動的取得・フォールバックの検証テスト     |
| ドキュメント（更新）                  | llm-workspace-chat-edit.md の liveLLMAdapter 記述 |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 が完了し、`liveLLMAdapter` が `ipc/index.ts` に実装されていること
- LLM Slice に `selectedModel` / `selectedProvider` の状態が存在すること
- `LLMAdapterFactory` によるプロバイダー/モデルの組み合わせバリデーションが利用可能であること

### 3.2 依存タスク

| タスクID                                    | タスク名                       | ステータス |
| ------------------------------------------- | ------------------------------ | ---------- |
| TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 | Workspace Chat Edit AI Runtime | 完了       |

### 3.3 必要な知識

- Main Process と Renderer 間の状態共有パターン（IPC 経由 or electron-store 経由）
- `LLMAdapterFactory` のプロバイダー解決ロジック
- S32（Dynamic Adapter Bridge）パターン
- Zustand LLM Slice の状態構造

### 3.4 推奨アプローチ

Main Process から Renderer の LLM Slice 状態を直接参照することはアーキテクチャ上不可能であるため、以下のいずれかの方法でモデル設定を取得する:

1. **electron-store 経由（推奨）**: Zustand persist middleware により永続化された `selectedModel` / `selectedProvider` を electron-store から直接読み取る
2. **IPC チャンネル新設**: `llm:get-selected-model` チャンネルを新設し、Renderer から Main Process に設定を伝達する
3. **既存 IPC ハンドラ活用**: `LLMAdapterFactory` の既存メソッドを活用してプロバイダー/モデルの組み合わせバリデーションを実施する

---

## 4. 実行手順

### Phase構成

本タスクは中規模であり、設計 -> 実装 -> テスト -> ドキュメント同期の4段階で実施する。

### Phase A: 設計

#### 目的

モデルID 動的取得の方式を決定し、影響範囲を確認する。

#### 手順

1. LLM Slice の `selectedModel` / `selectedProvider` の取得方法を確認
2. Main Process から Store 状態を参照する方法を検討（electron-store 経由 or IPC 経由）
3. `LLMAdapterFactory` の既存メソッドでプロバイダー/モデル整合性チェックが可能か確認
4. フォールバック戦略を設計（API キーが存在するプロバイダーのデフォルトモデル）

#### 成果物

- 方式設計書（影響ファイル一覧、取得方式の決定）

#### 完了条件

- モデルID 取得方式が決定されている
- 影響範囲が明確

### Phase B: 実装

#### 目的

`liveLLMAdapter` の `sendMessage()` 内でモデルID を動的に取得するよう変更する。

#### 手順

1. モデルID 取得ロジックを実装（electron-store 読み取り or IPC 経由）
2. プロバイダーとモデルの整合性チェックを追加
3. フォールバックモデルの設定（API キーが存在するプロバイダーのデフォルトモデル）
4. ハードコードされた `"claude-3-5-haiku-20241022"` を除去

#### 成果物

- `ipc/index.ts`（更新）
- モデル設定取得モジュール（必要に応じて新規作成）

#### 完了条件

- `grep -rn "claude-3-5-haiku" apps/desktop/src/main/ipc/` でハードコードが存在しない
- `pnpm typecheck` PASS

### Phase C: テスト

#### 目的

モデルID 動的取得の正常系・異常系を検証する。

#### 手順

1. モデルID 動的取得のユニットテスト追加
2. プロバイダー切り替え時の統合テスト追加
3. フォールバック動作のテスト追加
4. `pnpm typecheck && pnpm test` で回帰なしを確認

#### 成果物

- ユニットテスト・統合テスト

#### 完了条件

- 全テスト PASS
- カバレッジ基準充足（Line 80%以上）

### Phase D: ドキュメント同期

#### 目的

仕様書を実装に同期する。

#### 手順

1. `llm-workspace-chat-edit.md` の liveLLMAdapter セクション更新
2. task-workflow に完了記録を追加

#### 成果物

- 更新されたドキュメント

#### 完了条件

- ドキュメントが実装と一致している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Settings で選択したモデルが Chat Edit に反映される
- [ ] プロバイダー変更時にモデルが自動的に切り替わる
- [ ] 設定未選択時にフォールバックモデルが使用される

### 品質要件

- [ ] `pnpm typecheck` PASS
- [ ] 既存テスト全 PASS
- [ ] ChatEdit 関連テスト PASS
- [ ] ハードコードされたモデルID が存在しない（`grep` で確認）

### ドキュメント要件

- [ ] `llm-workspace-chat-edit.md` 更新
- [ ] task-workflow に完了記録追加

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                              | 期待結果                                           |
| ------ | --------------------------------------- | -------------------------------------------------- |
| TC-001 | selectedModel が設定済みの場合          | 設定されたモデルID が sendChat に渡される          |
| TC-002 | selectedModel が未設定の場合            | フォールバックモデルが使用される                   |
| TC-003 | プロバイダーとモデルが不整合の場合      | プロバイダーのデフォルトモデルにフォールバックする |
| TC-004 | プロバイダー変更後に sendMessage を実行 | 新しいプロバイダーに対応するモデルが使用される     |
| TC-005 | 既存 ChatEdit テスト全件                | 回帰なし、全 PASS                                  |

### 検証手順

1. `grep -rn "claude-3-5-haiku" apps/desktop/src/main/ipc/` でハードコードが存在しないことを確認
2. Settings でモデルを変更後、Chat Edit でメッセージを送信し、使用されたモデルを確認
3. `pnpm typecheck && pnpm test` で回帰なしを確認

---

## 7. リスクと対策

| リスク                                         | 影響度 | 発生確率 | 対策                                                   |
| ---------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| Main Process から Store 状態を直接参照できない | 高     | 中       | electron-store 経由で永続化された設定を読み取る        |
| 選択モデルがプロバイダーと不整合               | 中     | 中       | プロバイダー変更時にデフォルトモデルにフォールバック   |
| フォールバックモデルが廃止される               | 低     | 低       | プロバイダーごとのデフォルトモデルリストをメンテナンス |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                        | パス                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| liveLLMAdapter 定義箇所             | `apps/desktop/src/main/ipc/index.ts`                                                                                          |
| LLM Workspace Chat Edit 仕様        | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                                |
| S32 Dynamic Adapter Bridge パターン | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-fallback-validation.md` |
| Lessons Learned（苦戦箇所4）        | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` v1.29.89                                       |
| LLM インターフェース仕様            | `.claude/skills/aiworkflow-requirements/references/interfaces-llm.md`                                                         |

### 参考資料

- S32（Dynamic Adapter Bridge）パターン: request-time にプロバイダーを解決する設計
- Zustand persist middleware: electron-store への状態永続化メカニズム
- `LLMAdapterFactory`: プロバイダー/モデルの組み合わせバリデーション

---

## 9. 備考

### 発見経緯

本タスクは TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装wave（2026-03-14）において、`ChatEditService` と `ILLMAdapter` の型不整合を解決する過程で `liveLLMAdapter`（Dynamic Adapter Bridge パターン S32）を作成した際に発見された。型変換ブリッジの実装を優先した結果、モデルID のハードコードが残存した。

### 補足事項

- 本タスクは S32（Dynamic Adapter Bridge）パターンの改善版に該当する
- provider / model の組み合わせバリデーションは `LLMAdapterFactory` の既存メソッドを活用可能
- Renderer の LLM Slice から Main Process への設定伝達には、IPC チャンネル `llm:get-selected-model` の新設、または `electron-store` の `selectedModel` キーの参照を検討する
- electron-store 経由の場合、Zustand persist middleware がストアに書き込む形式を正確に把握する必要がある（P19: 型キャストバイパス回避のため実行時バリデーション必須）

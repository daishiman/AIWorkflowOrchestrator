# [#1219] "[UT-IMP-CHAT-EDIT-CAPABILITY-RESOLVER-REPLACEMENT-001] ChatEditCapabilityResolver を AIAccessCapabilityResolver に置き換え"

## メタ情報

```yaml
task_id: UT-IMP-CHAT-EDIT-CAPABILITY-RESOLVER-REPLACEMENT-001
task_name: ChatEditCapabilityResolver を AIAccessCapabilityResolver に置き換え
category: 改善
target_feature: -
priority: 中
scale: 中規模
status: 未実施
source_phase: -
created_date: 2026-03-14
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-imp-chat-edit-capability-resolver-replacement-001.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 中     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## メタ情報

| 項目         | 内容                                                                |
| ------------ | ------------------------------------------------------------------- |
| タスクID     | UT-IMP-CHAT-EDIT-CAPABILITY-RESOLVER-REPLACEMENT-001                |
| タスク名     | ChatEditCapabilityResolver を AIAccessCapabilityResolver に置き換え |
| 分類         | 改善（imp）                                                         |
| 対象機能     | ChatEdit Capability 判定基盤                                        |
| 優先度       | 中                                                                  |
| 見積もり規模 | 中規模                                                              |
| ステータス   | 未実施（Task01 完了待ちでブロック中）                               |
| 発見元       | TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 実装wave（2026-03-14）  |
| 発見日       | 2026-03-14                                                          |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-IMP-WORKSPACE-CHAT-EDIT-AI-RUNTIME-001 の実装時に、設計で想定していた `AIAccessCapabilityResolver`（Task01: AI Runtime 基盤タスク）が未実装であることが判明した。`apps/desktop/src/main/services/ai/` ディレクトリ自体が存在しなかった。

Task01 の完了を待つと開発がブロックされるため、軽量代替として `ChatEditCapabilityResolver` を新規作成した。これは `LLMAdapterFactory.getAllProviderIds()` と `hasApiKey()` のみを使用し、Task01 の複雑なモード判定（OAuth/API Key/統合ランタイム）を省略した簡易版である。

この軽量代替パターンは lessons-learned-current.md v1.29.89 の苦戦箇所3（Lightweight Capability Substitute）として記録済み。architecture-implementation-patterns の S31 パターンとしても定義済み。

### 1.2 問題点・課題

1. `ChatEditCapabilityResolver` は暫定的な軽量代替であり、以下の機能が欠落している:
   - OAuth トークンベースの認証判定
   - プロバイダー優先順位のユーザー設定反映
   - 認証モード（`authMode`）との連携
   - リトライポリシーの統合
2. Task01 完了後も軽量代替が残ると、2つの capability resolver が共存して混乱する
3. capability states が `'integratedRuntime' | 'none'` に限定されており、Task01 の完全な状態セットに対応できない

### 1.3 放置した場合の影響

- 2つの capability resolver が共存し、新規開発者がどちらを使うべきか判断に迷う
- OAuth 認証モード使用時に ChatEdit 機能が正しく capability 判定できない
- プロバイダー優先順位のユーザー設定が ChatEdit に反映されない
- ただし、API Key モードのみでの基本的な ChatEdit 機能は `ChatEditCapabilityResolver` で動作するため、即座のブロッカーにはならない

---

## 2. 何を達成するか（What）

### 2.1 目的

Task01（AI Runtime 基盤）の `AIAccessCapabilityResolver` が利用可能になった時点で、`ChatEditCapabilityResolver` を置き換え、capability 判定を統一する。

### 2.2 最終ゴール

- `ChatEditCapabilityResolver` が完全に削除されている
- `AIAccessCapabilityResolver` 経由で capability 判定が統一的に機能する
- OAuth / API Key 両モードで正しく capability 判定される
- 既存の ChatEdit 関連テスト（38テスト以上）が引き続き PASS する

### 2.3 スコープ

#### 含むもの

- `ChatEditCapabilityResolver` から `AIAccessCapabilityResolver` への置き換え
- `ipc/index.ts` の `capabilityResolver` インスタンス生成箇所の更新
- `chatEditHandlers.ts` の型引数更新
- 関連テストの更新
- capability states の拡張（`'integratedRuntime' | 'none'` から Task01 の完全な状態セットへ）

#### 含まないもの

- `AIAccessCapabilityResolver` 自体の実装（Task01 のスコープ）
- LLM プロバイダーの追加
- Renderer 側の UI 変更（別タスク UT-IMP-WORKSPACE-CHAT-EDIT-RUNTIME-UI-STATE-ALIGNMENT-001 のスコープ）
- バックエンド側の変更

### 2.4 成果物

| 成果物                                  | 説明                                                                    |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `ipc/index.ts`（更新）                  | capabilityResolver インスタンス生成を AIAccessCapabilityResolver に変更 |
| `chatEditHandlers.ts`（更新）           | 型引数を AIAccessCapabilityResolver に更新                              |
| `ChatEditCapabilityResolver.ts`（削除） | 軽量代替ファイルの削除                                                  |
| テスト（更新）                          | モック・型引数の AIAccessCapabilityResolver 対応                        |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- Task01（AI Runtime 基盤）が完了し、`AIAccessCapabilityResolver` が利用可能であること
- `apps/desktop/src/main/services/ai/` ディレクトリに Task01 の成果物が存在すること
- 既存の ChatEdit 関連テストが PASS する状態であること

### 3.2 依存タスク

| タスクID                  | タスク名                          | ステータス           |
| ------------------------- | --------------------------------- | -------------------- |
| Task01（AI Runtime 基盤） | AIAccessCapabilityResolver の実装 | 未完了（ブロッカー） |

### 3.3 必要な知識

- `AIAccessCapabilityResolver` のインターフェース仕様（Task01 完了後に確認）
- ChatEdit IPC ハンドラのジェネリック型パラメータ設計
- S31 パターン（Lightweight Capability Substitute）の理解
- P21（DI テスト破壊）と S33（オプショナルパラメータパターン）の防止策

### 3.4 推奨アプローチ

1. Task01 完了後に `AIAccessCapabilityResolver` の API を確認
2. `ChatEditCapabilityResolver` との差分を整理し、移行計画を策定
3. インスタンス生成箇所 → 型引数 → テスト の順で段階的に置き換え
4. `ChatEditCapabilityResolver.ts` ファイルを削除

---

## 4. 実行手順

### Phase構成

本タスクは中規模であり、API 確認 → 置き換え実装 → テスト更新 → ドキュメント同期 の4段階で実施する。

### Phase A: Task01 API 確認

#### 目的

`AIAccessCapabilityResolver` のインターフェースを確認し、移行計画を策定する。

#### 手順

1. `AIAccessCapabilityResolver` のインターフェース（メソッド、引数、戻り値）を確認
2. `ChatEditCapabilityResolver` との差分を整理
3. capability states の型定義差分を確認
4. 移行計画を策定（影響ファイル一覧、変更順序）

#### 完了条件

- `AIAccessCapabilityResolver` の API が把握できている
- 移行計画が策定されている

### Phase B: 置き換え実装

#### 目的

`ChatEditCapabilityResolver` を `AIAccessCapabilityResolver` に置き換える。

#### 手順

1. `ChatEditCapabilityResolver` の import を `AIAccessCapabilityResolver` に変更
2. `ipc/index.ts` のインスタンス生成を更新
3. `chatEditHandlers.ts` の型パラメータを更新
4. capability states を拡張（`'integratedRuntime' | 'none'` から完全な状態セットへ）
5. `ChatEditCapabilityResolver.ts` ファイルを削除

#### 完了条件

- `pnpm typecheck` PASS
- `ChatEditCapabilityResolver` への参照が存在しない

### Phase C: テスト更新

#### 目的

既存テストのモックを更新し、新しい capability states のテストを追加する。

#### 手順

1. 既存テストのモックを `AIAccessCapabilityResolver` に更新
2. 新しい capability states（OAuth トークン、プロバイダー優先順位）のテストを追加
3. `pnpm typecheck && pnpm test` で回帰なしを確認

#### 完了条件

- ChatEdit 関連テスト（38テスト以上）全 PASS
- 新規 capability states のテストが追加されている
- `pnpm typecheck` PASS

### Phase D: ドキュメント同期

#### 目的

関連ドキュメントを更新し、完了記録を追加する。

#### 手順

1. `llm-workspace-chat-edit.md` の ChatEditCapabilityResolver セクションを更新
2. task-workflow に完了記録を追加
3. lessons-learned に置き換え教訓を追記

#### 完了条件

- 関連ドキュメントが最新状態に更新されている

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ChatEditCapabilityResolver` が完全に削除されている
- [ ] `AIAccessCapabilityResolver` 経由で capability 判定が機能する
- [ ] OAuth / API Key 両モードで正しく判定される
- [ ] capability states が Task01 の完全な状態セットに対応している

### 品質要件

- [ ] `pnpm typecheck` PASS
- [ ] 既存テスト全 PASS
- [ ] ChatEdit 関連テスト（38テスト以上）PASS
- [ ] 既存機能回帰なし
- [ ] ESLint / Prettier PASS

### ドキュメント要件

- [ ] `llm-workspace-chat-edit.md` 更新
- [ ] task-workflow に完了記録追加
- [ ] `ChatEditCapabilityResolver.ts` ファイル削除確認

---

## 6. 検証方法

### テストケース

| TC-ID  | テスト内容                                           | 期待結果                                                                 |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------ |
| TC-001 | ChatEditCapabilityResolver 関連ファイルの不在確認    | `find` コマンドで関連ファイルが存在しない                                |
| TC-002 | AIAccessCapabilityResolver 経由の API Key 判定       | API Key 設定済みプロバイダーが利用可能と判定される                       |
| TC-003 | AIAccessCapabilityResolver 経由の OAuth トークン判定 | OAuth トークン有効時にプロバイダーが利用可能と判定される                 |
| TC-004 | capability states の型互換性確認                     | 拡張された状態セットが型チェックを通過する                               |
| TC-005 | IPC レスポンスの capability フィールド確認           | `chat-edit:send-with-context` のレスポンスに正しい capability が含まれる |
| TC-006 | 既存 ChatEdit テスト38件以上 PASS                    | 全テストが引き続き動作する                                               |

### 検証手順

1. `find . -name "ChatEditCapabilityResolver*" -not -path "*/node_modules/*"` で関連ファイルが存在しないことを確認
2. `pnpm typecheck && pnpm test` で回帰なしを確認
3. DevTools で `chat-edit:send-with-context` IPC レスポンスの capability フィールドを確認

---

## 7. リスクと対策

| リスク                             | 影響度 | 発生確率 | 対策                                                                  |
| ---------------------------------- | ------ | -------- | --------------------------------------------------------------------- |
| Task01 の API が設計と異なる       | 高     | 中       | Phase A で API 確認後に移行計画を策定                                 |
| capability states の型が互換でない | 中     | 中       | ユニオン型の段階的拡張で対応                                          |
| P21（DI テスト破壊）の再発         | 中     | 高       | オプショナルパラメータパターン（S33）を適用                           |
| Task01 完了が大幅に遅延する        | 中     | 低       | ChatEditCapabilityResolver は暫定的に動作するため、機能的ブロックなし |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                 | パス                                                                                                                          |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 現在の軽量代替実装           | `apps/desktop/src/main/services/chat-edit/ChatEditCapabilityResolver.ts`                                                      |
| ChatEdit 仕様書              | `.claude/skills/aiworkflow-requirements/references/llm-workspace-chat-edit.md`                                                |
| S31 パターン定義             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns-reference-ipc-fallback-validation.md` |
| lessons-learned（苦戦箇所3） | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` v1.29.89                                       |

### 参考資料

- S31: Lightweight Capability Substitute パターン（architecture-implementation-patterns）
- S33: オプショナルパラメータパターン（P21 DI テスト破壊防止）
- P21: 既存テストへの DI 追加時の大規模修正（06-known-pitfalls.md）

---

## 9. 備考

### 補足事項

- Task01 完了まではブロック状態。Task01 の PR がマージされた時点で着手可能
- `ChatEditCapabilityResolver` は「Lightweight Capability Substitute」パターン（S31）の実例として残す価値があるため、削除ではなく architecture-implementation-patterns への移行ドキュメントとして保存を検討
- `ChatEditCapabilityResolver` は `LLMAdapterFactory.getAllProviderIds()` と `hasApiKey()` のみを使用した簡易版であり、API Key モードでの基本的な ChatEdit 機能は正常に動作する
- 置き換え実施時は P23（API 二重定義の型管理複雑性）と P32（型定義の二箇所同時更新必須）に注意すること

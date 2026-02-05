# packages/shared/ipc/channels.ts 整理 - タスク指示書

## メタ情報

```yaml
issue_number: 709
```

## メタ情報

| 項目         | 内容                                       |
| ------------ | ------------------------------------------ |
| タスクID     | TASK-IPC-SHARED-CHANNELS-REFACTORING       |
| タスク名     | packages/shared/ipc/channels.ts 整理       |
| 分類         | リファクタリング                           |
| 対象機能     | IPC チャンネル定義                         |
| 優先度       | 低                                         |
| 見積もり規模 | 小規模                                     |
| ステータス   | 未実施                                     |
| 発見元       | Phase 12（TASK-FIX-4-1-IPC-CONSOLIDATION） |
| 発見日       | 2026-02-05                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-4-1-IPC-CONSOLIDATION で IPCチャンネル定義を `apps/desktop/src/preload/channels.ts` に統合した。
しかし、`packages/shared/ipc/channels.ts` には古いチャンネル定義が残存しており、他パッケージ（web等）への影響調査が必要。

### 1.2 問題点・課題

| 問題               | 詳細                                                                         |
| ------------------ | ---------------------------------------------------------------------------- |
| 重複定義の残存     | `packages/shared` と `apps/desktop/src/preload` に同様のチャンネル定義が存在 |
| 依存関係の不明確さ | `packages/shared` を参照している他パッケージ（web等）の影響範囲が未調査      |
| メンテナンスコスト | 2箇所を同期する必要があり、変更時に不整合が発生するリスク                    |

### 1.3 放置した場合の影響

- 新規チャンネル追加時に2箇所の更新が必要となり、更新漏れのリスク
- 他パッケージが古い定義を参照し続ける可能性
- 型定義の不整合によるランタイムエラーの可能性（低）

**現時点での機能影響**: なし（apps/desktop は正常動作）

---

## 2. 何を達成するか（What）

### 2.1 目的

packages/shared/ipc/channels.ts を整理し、IPCチャンネル定義の Single Source of Truth を確立する。

### 2.2 最終ゴール

- IPCチャンネル定義が1箇所のみに存在
- 全パッケージが同一の定義を参照
- 型安全性が保証される

### 2.3 スコープ

#### 含むもの

- packages/shared/ipc/channels.ts の調査
- 他パッケージ（apps/web等）の依存関係調査
- 適切な配置場所の決定
- 必要に応じたマイグレーション

#### 含まないもの

- 新規チャンネルの追加
- ハンドラーロジックの変更
- 既存動作の変更

### 2.4 成果物

| 成果物                 | 説明                                           |
| ---------------------- | ---------------------------------------------- |
| 依存関係調査レポート   | packages/shared/ipc を参照しているファイル一覧 |
| マイグレーション計画   | 統合方法と影響範囲                             |
| 統合後のチャンネル定義 | Single Source of Truth                         |
| テスト結果             | 全パッケージのビルド・テスト成功               |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-FIX-4-1-IPC-CONSOLIDATION が完了していること
- apps/desktop の42テストが全てPASS

### 3.2 依存タスク

| タスクID                       | 状態 | 関連性                          |
| ------------------------------ | ---- | ------------------------------- |
| TASK-FIX-4-1-IPC-CONSOLIDATION | 完了 | preload/channels.ts への統合    |
| TASK-4-1                       | 完了 | スキルインポートIPCチャネル定義 |

### 3.3 必要な知識

| 知識領域                  | 参照先                                                                                                                                |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Electron IPC通信          | [security-skill-ipc.md](/.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md)                                     |
| IPCチャンネル統合パターン | [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) |
| モノレポ構成              | CLAUDE.md                                                                                                                             |

### 3.4 推奨アプローチ

1. **調査フェーズ**: packages/shared/ipc の依存関係を Grep で調査
2. **影響分析フェーズ**: 各パッケージでの使用箇所を特定
3. **設計フェーズ**: 最適な配置場所を決定
4. **実装フェーズ**: マイグレーション実施
5. **検証フェーズ**: 全パッケージのビルド・テスト確認

### 3.5 実装課題と解決策（TASK-FIX-4-1-IPC-CONSOLIDATION からの学び）

| 苦戦箇所               | 問題                                              | 解決策                                               |
| ---------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| ハードコード文字列発見 | `"channel:name" as string` で型チェックをバイパス | Grep で `as string` パターンを検索し、定数参照に置換 |
| 重複定義の整理         | 複数ファイルに同じチャンネル定義が存在            | Single Source of Truth パターンで1箇所に統合         |
| ホワイトリスト更新漏れ | 旧チャンネル名が ALLOWED_INVOKE_CHANNELS に残存   | テストで旧チャンネルが含まれないことを検証           |
| テスト独立性           | 既存テストがグローバル状態に依存                  | beforeEach で明示的にリセット                        |

**教訓**:

- `as string` を使った型キャストはセキュリティ上危険（ホワイトリスト検証をバイパス）
- IPC チャンネル定義は必ず Single Source of Truth パターンで管理
- ホワイトリストの更新は必ずテストで検証

---

## 4. 実行手順

### Phase構成

| Phase | 名称 | 目的                 |
| ----- | ---- | -------------------- |
| 1     | 調査 | 依存関係の把握       |
| 2     | 設計 | 統合方針の決定       |
| 3     | 実装 | マイグレーション実施 |
| 4     | 検証 | ビルド・テスト確認   |

### Phase 1: 調査

#### 目的

packages/shared/ipc/channels.ts の依存関係を把握する

#### 手順

1. packages/shared/ipc を参照しているファイルを Grep で検出
   ```bash
   grep -rn "packages/shared/ipc\|@repo/shared/ipc" apps/ packages/
   ```
2. 各参照箇所の使用目的を分類
3. 依存関係調査レポートを作成

#### 成果物

- `outputs/phase-1/dependency-report.md`

#### 完了条件

- 全参照箇所が特定されている
- 各パッケージの依存関係が明確

### Phase 2: 設計

#### 目的

最適な統合方針を決定する

#### 手順

1. 以下の選択肢を評価:
   - A: packages/shared に統合（全パッケージ共通）
   - B: apps/desktop/src/preload に統合（デスクトップ専用）
   - C: 両方に異なる責務で分離
2. 各パッケージへの影響を評価
3. マイグレーション計画を策定

#### 成果物

- `outputs/phase-2/migration-plan.md`

#### 完了条件

- 統合方針が決定されている
- 影響範囲が明確

### Phase 3: 実装

#### 目的

マイグレーションを実施する

#### 手順

1. 決定した方針に基づきファイルを更新
2. import 文を一括置換
3. 型定義の整合性を確認

#### 成果物

- 統合後のチャンネル定義ファイル
- 更新されたimport文

#### 完了条件

- Single Source of Truth が確立
- TypeScript コンパイルエラーなし

### Phase 4: 検証

#### 目的

全パッケージの動作を確認する

#### 手順

1. 全パッケージのビルド確認
   ```bash
   pnpm build
   ```
2. 全パッケージのテスト実行
   ```bash
   pnpm test
   ```
3. apps/desktop の起動確認

#### 成果物

- テスト結果レポート

#### 完了条件

- 全パッケージビルド成功
- 全テストPASS
- アプリケーション正常起動

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] IPCチャンネル定義が1箇所のみに存在
- [ ] 全パッケージが同一の定義を参照
- [ ] 既存機能に影響なし

### 品質要件

- [ ] TypeScript コンパイルエラーなし
- [ ] 全テストPASS
- [ ] ESLint エラーなし

### ドキュメント要件

- [ ] security-skill-ipc.md 更新
- [ ] architecture-implementation-patterns.md 更新（必要に応じて）
- [ ] LOGS.md×2 更新

---

## 6. 検証方法

### テストケース

| #   | テストケース      | 期待結果               |
| --- | ----------------- | ---------------------- |
| 1   | pnpm build        | 全パッケージビルド成功 |
| 2   | pnpm test         | 全テストPASS           |
| 3   | apps/desktop 起動 | 正常起動               |
| 4   | スキル一覧取得    | IPC通信成功            |

### 検証手順

1. ビルド確認: `pnpm build`
2. テスト実行: `pnpm test`
3. アプリケーション起動: `pnpm --filter @repo/desktop dev`
4. 手動確認: スキル管理画面でスキル一覧が表示される

---

## 7. リスクと対策

| リスク                   | 影響度 | 発生確率 | 対策                                 |
| ------------------------ | ------ | -------- | ------------------------------------ |
| 他パッケージのビルド失敗 | 高     | 中       | 事前に依存関係を調査し、段階的に移行 |
| ランタイムエラー         | 高     | 低       | 統合テストで全IPCチャンネルを検証    |
| import パス変更漏れ      | 中     | 中       | Grep で全参照箇所を網羅的に検出      |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                                                                                                                          | 参照内容                      |
| ------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| [security-skill-ipc.md](/.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md)                                     | IPCチャンネルセキュリティ仕様 |
| [architecture-implementation-patterns.md](/.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md) | IPCチャンネル統合パターン     |
| [TASK-FIX-4-1-IPC-CONSOLIDATION](../TASK-FIX-4-1-IPC-CONSOLIDATION/)                                                                  | 先行タスクの成果物            |

### 参考資料

- Electron IPC Best Practices
- TypeScript Handbook - Module Resolution

---

## 9. 備考

### 発見経緯

TASK-FIX-4-1-IPC-CONSOLIDATION の Phase 12 未タスク検出で「将来改善候補（バックログ）」として識別された。

### 補足事項

- 現時点で機能に影響はなく、緊急性は低い
- 他パッケージ（apps/web等）の開発が進む前に整理することが望ましい
- TASK-FIX-4-1-IPC-CONSOLIDATION で学んだ「Single Source of Truth」パターンを適用

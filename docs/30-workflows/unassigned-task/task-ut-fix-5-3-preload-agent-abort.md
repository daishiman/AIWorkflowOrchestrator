# Preload Agent Abort セキュリティ修正 - タスク指示書

## メタ情報

```yaml
issue_number: 756
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-FIX-5-3                                   |
| タスク名     | Preload Agent Abort セキュリティ修正         |
| 分類         | セキュリティ                                 |
| 対象機能     | Preload API - Agent SDK                      |
| 優先度       | 高                                           |
| 見積もり規模 | 極小                                         |
| ステータス   | 未着手                                       |
| 発見元       | TASK-FIX-5-1 Phase 10 アーキテクチャレビュー |
| 発見日       | 2026-02-09                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-5-1（Skill API統一）Phase 10のアーキテクチャレビューにおいて、preload/index.ts のAgent SDK API内でセキュリティ検証をバイパスするコードが発見された。`abort()`メソッドのみが`ipcRenderer.send()`を直接呼び出しており、`safeInvoke()`による**ホワイトリスト検証をバイパス**している。

### 1.2 問題点・課題

| 課題                           | 説明                                                                     |
| ------------------------------ | ------------------------------------------------------------------------ |
| **ホワイトリスト検証バイパス** | `ipcRenderer.send()`直接呼び出しにより、セキュリティ検証が完全にスキップ |
| IPCセキュリティ原則違反        | 04-electron-security.md「全ハンドラで送信元ウィンドウを検証」に違反      |
| 一貫性の欠如                   | 同一API内で`safeInvoke`と`ipcRenderer.send`が混在                        |

### 1.3 問題箇所

ファイル: `apps/desktop/src/preload/index.ts`

```typescript
// 行423-425（現状: セキュリティ検証バイパス）
abort: () => {
  ipcRenderer.send("agent:abort");
},
```

### 1.4 セキュリティ影響

- **影響度**: 高
- **理由**: `safeInvoke()`が提供するホワイトリスト検証を完全にバイパスしている。これにより:
  - チャネル名のホワイトリスト検証がスキップされる
  - エラーサニタイズ処理がスキップされる
  - 統一されたロギング/監視がスキップされる

### 1.5 放置した場合の影響

- Electronセキュリティモデルの穴となる
- セキュリティ監査での重大指摘事項
- 他の開発者が同様のパターンをコピーするリスク

---

## 2. 何を達成するか（What）

### 2.1 目的

`ipcRenderer.send()`の直接呼び出しを`safeInvoke()`に置き換え、ホワイトリスト検証を有効化する。

### 2.2 最終ゴール

- Agent SDK APIの全メソッドが`safeInvoke()`経由でIPCを呼び出す
- ホワイトリスト検証が適用される
- IPCセキュリティ原則に準拠

### 2.3 スコープ

#### 含むもの

| 項目                 | 説明                                           |
| -------------------- | ---------------------------------------------- |
| preload/index.ts修正 | `ipcRenderer.send()`を`safeInvoke()`に置き換え |

#### 含まないもの

| 項目                 | 説明                                     |
| -------------------- | ---------------------------------------- |
| Main側ハンドラー修正 | 既に`IPC_CHANNELS.AGENT_ABORT`を処理可能 |
| 新規テスト追加       | 既存のユニットテストで動作保証される     |

### 2.4 成果物

| 成果物               | パス                                |
| -------------------- | ----------------------------------- |
| preload/index.ts修正 | `apps/desktop/src/preload/index.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `IPC_CHANNELS.AGENT_ABORT` が定義済み（channels.ts:141）
- ホワイトリストに登録済み（channels.ts:370）
- Main側ハンドラーが存在

### 3.2 変更内容

```typescript
// 変更前（行423-425: セキュリティバイパス）
abort: () => {
  ipcRenderer.send("agent:abort");
},

// 変更後（セキュリティ検証有効化）
abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
```

### 3.3 注意点

- `ipcRenderer.send()`は一方向通信（fire-and-forget）
- `safeInvoke()`は`ipcRenderer.invoke()`を使用（双方向通信）
- Main側ハンドラーが適切に応答を返すか確認が必要

### 3.5 実装課題と解決策（TASK-FIX-5-1からの学び）

本タスクは TASK-FIX-5-1-SKILL-API-UNIFICATION から派生した未タスクです。
親タスクで苦戦した箇所と解決策を以下に記録します。

#### 関連する苦戦パターン

| パターンID | 内容                                               | 詳細参照                 |
| ---------- | -------------------------------------------------- | ------------------------ |
| P23        | API二重定義による型定義の二重管理                  | 06-known-pitfalls.md#P23 |
| P24        | 呼び出し元コードの参照先分散                       | 06-known-pitfalls.md#P24 |
| P25        | Store型定義の不統一による型アサーション発生        | 06-known-pitfalls.md#P25 |
| P26        | OperationResult廃止の波及範囲調査不足              | 06-known-pitfalls.md#P26 |
| P27        | contextIsolation + safeInvoke パターンの実装複雑性 | 06-known-pitfalls.md#P27 |
| P28        | 削除タイプのリファクタリングにおける手動確認忘れ   | 06-known-pitfalls.md#P28 |

#### 本タスクへの適用

本タスク（Preload Agent Abort セキュリティ修正）は、上記パターンのうち以下が特に関連する:

1. **P27（contextIsolation + safeInvoke パターンの実装複雑性）**: 本タスクの直接原因。`ipcRenderer.send()`から`safeInvoke()`への置き換えにより、一方向通信から双方向通信に変わる。Main側ハンドラーが`ipcMain.handle()`で登録されているか確認し、必要に応じて`void`演算子でPromiseを無視する実装を検討すること。

2. **P28（削除タイプのリファクタリングにおける手動確認忘れ）**: `ipcRenderer.send()`の直接呼び出しが他にも存在しないか、`grep -rn "ipcRenderer.send\|ipcRenderer.on" apps/desktop/src/preload/` で全件確認すること。セキュリティバイパスの見落としは重大インシデントにつながる。

3. **P24（呼び出し元コードの参照先分散）**: `abort()`メソッドの呼び出し元を特定し、戻り値の変化（`void` → `Promise<void>`）による影響がないか確認すること。非同期化により呼び出し元のエラーハンドリングが必要になる可能性がある。

#### 参照資料

- 成功/失敗パターン集: `.claude/skills/aiworkflow-requirements/references/patterns.md`
- 実装パターン詳細: `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- 苦戦パターン正本: `.claude/rules/06-known-pitfalls.md`

---

## 4. 実行手順

### Phase 1: Main側確認

1. `apps/desktop/src/main/ipc/` でAGENT_ABORTハンドラーを確認
2. `handle`（双方向）または`on`（一方向）のどちらで登録されているか確認
3. 必要に応じてMain側ハンドラーを調整

### Phase 2: Preload修正

1. `apps/desktop/src/preload/index.ts` を開く
2. 行423-425を以下に置換:
   ```typescript
   abort: () => safeInvoke(IPC_CHANNELS.AGENT_ABORT),
   ```

### Phase 3: 検証

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm --filter @repo/desktop test` で既存テストがパスすることを確認
3. 開発環境でエージェント中断動作を確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `ipcRenderer.send()`の直接呼び出しが削除されている
- [ ] `safeInvoke(IPC_CHANNELS.AGENT_ABORT)` が使用されている
- [ ] エージェント中断機能が正常に動作する

### 品質要件

- [ ] TypeScriptコンパイルエラーがない
- [ ] 既存テストが全てパス
- [ ] ESLintエラーがない

### セキュリティ要件

- [ ] ホワイトリスト検証が有効化されている
- [ ] IPCセキュリティ原則に準拠している

---

## 6. 検証方法

### テストケース

| #   | テストケース                   | 期待結果             |
| --- | ------------------------------ | -------------------- |
| 1   | エージェント実行中に中断ボタン | 正常に中断される     |
| 2   | 複数回連続で中断               | エラーなく処理される |
| 3   | TypeScriptコンパイル           | エラーなし           |

### 検証手順

1. `pnpm typecheck` でエラーがないこと
2. `pnpm --filter @repo/desktop test` で全テストパス
3. 開発環境でエージェント実行 → 中断の動作確認

---

## 7. リスクと対策

| リスク                     | 影響度 | 発生確率 | 対策                                             |
| -------------------------- | ------ | -------- | ------------------------------------------------ |
| 通信方式変更による動作変更 | 中     | 低       | Main側ハンドラーが`handle`で登録されているか確認 |
| 中断タイミングの微妙な変化 | 低     | 低       | 手動テストで動作確認                             |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                    |
| -------------------- | ------------------------------------------------------- |
| IPCチャネル定義      | `apps/desktop/src/preload/channels.ts`                  |
| Electronセキュリティ | `.claude/rules/04-electron-security.md`                 |
| 発見元タスク成果物   | `docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION/` |

### IPCセキュリティ原則（04-electron-security.md）

```markdown
## IPC セキュリティ原則

- DO: チャンネル名はホワイトリストで管理し、定数で参照
- DO: 全ハンドラで送信元ウィンドウを検証
- DO: 引数は Main 側でバリデーション
- DO: エラーはサニタイズしてから Renderer に送る
- DON'T: ハードコード文字列でチャンネル名を指定しない
```

### 関連タスク

| タスクID     | 関係   | 説明                        |
| ------------ | ------ | --------------------------- |
| TASK-FIX-5-1 | 発見元 | Skill API統一               |
| UT-FIX-5-2   | 関連   | Dialog API ハードコード削除 |

---

## 9. 備考

### 発見元の原文

```
Phase 10 アーキテクチャレビューにて検出:
- preload/index.ts:424 で ipcRenderer.send() を直接呼び出し
- safeInvoke() によるホワイトリスト検証をバイパスしている
- 対応: ipcRenderer.send("agent:abort") → safeInvoke(IPC_CHANNELS.AGENT_ABORT) に変更
- 優先度: 高（セキュリティ検証バイパス）
```

### 補足事項

- 修正自体は極めて軽微（1行の置換）
- ただしセキュリティ影響が高いため、優先的に対応すべき
- UT-FIX-5-2（Dialog API）と同時に対応することで効率化可能

### 技術的考慮事項

`ipcRenderer.send()`から`safeInvoke()`（`ipcRenderer.invoke()`ベース）への変更により、通信が一方向から双方向に変わる。これにより:

1. **戻り値**: `abort()`は現在`void`を返すが、`safeInvoke()`はPromiseを返す
2. **呼び出し元**: 呼び出し元が戻り値を期待していないか確認が必要
3. **Main側**: `ipcMain.handle()`で登録されている必要がある

実装時に呼び出し元のコードを確認し、必要に応じて`void`演算子でPromiseを無視することも検討:

```typescript
abort: () => void safeInvoke(IPC_CHANNELS.AGENT_ABORT),
```

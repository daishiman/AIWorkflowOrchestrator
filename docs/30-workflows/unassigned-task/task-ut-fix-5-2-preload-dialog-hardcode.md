# Preload Dialog API ハードコード削除 - タスク指示書

## メタ情報

```yaml
issue_number: 755
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | UT-FIX-5-2                                   |
| タスク名     | Preload Dialog API ハードコード削除          |
| 分類         | セキュリティ / リファクタリング              |
| 対象機能     | Preload API - Dialog                         |
| 優先度       | 中                                           |
| 見積もり規模 | 極小                                         |
| ステータス   | 未着手                                       |
| 発見元       | TASK-FIX-5-1 Phase 10 アーキテクチャレビュー |
| 発見日       | 2026-02-09                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-5-1（Skill API統一）Phase 10のアーキテクチャレビューにおいて、preload/index.ts のdialog APIに型安全性の問題が発見された。他のAPIは全て`IPC_CHANNELS`定数を使用しているのに対し、dialog APIのみハードコード文字列を使用している。

### 1.2 問題点・課題

| 課題                       | 説明                                                                |
| -------------------------- | ------------------------------------------------------------------- |
| 型安全性の欠如             | ハードコード文字列はコンパイル時にチャネル名の整合性を検証できない  |
| 一貫性の欠如               | 他のAPIは全て`IPC_CHANNELS`定数を使用しており、dialog APIのみが例外 |
| リファクタリング耐性の低下 | チャネル名変更時にハードコード箇所を見落とすリスク                  |

### 1.3 問題箇所

ファイル: `apps/desktop/src/preload/index.ts`

```typescript
// 行328（現状: ハードコード）
showOpenDialog: (options) => safeInvoke("dialog:showOpenDialog", options),

// 行333（現状: ハードコード）
showSaveDialog: (options) => safeInvoke("dialog:showSaveDialog", options),
```

### 1.4 セキュリティ影響

- **影響度**: 中
- **理由**: ホワイトリスト検証自体は正常に機能する（ハードコード値がホワイトリストに登録済み）。しかし、型安全性が失われており、将来的なチャネル名変更やタイポによるバグ混入リスクがある。

### 1.5 放置した場合の影響

- IPCセキュリティルール（04-electron-security.md）違反の継続
- チャネル名リファクタリング時の見落としリスク
- コードベース全体の一貫性低下

---

## 2. 何を達成するか（What）

### 2.1 目的

dialog APIのハードコード文字列を`IPC_CHANNELS`定数に置き換え、型安全性と一貫性を確保する。

### 2.2 最終ゴール

- dialog APIが他のAPIと同様に`IPC_CHANNELS`定数を使用
- TypeScriptコンパイラによるチャネル名検証が可能
- IPCセキュリティルール準拠

### 2.3 スコープ

#### 含むもの

| 項目                 | 説明                                             |
| -------------------- | ------------------------------------------------ |
| preload/index.ts修正 | ハードコード文字列を`IPC_CHANNELS`定数に置き換え |

#### 含まないもの

| 項目                 | 説明                             |
| -------------------- | -------------------------------- |
| Main側ハンドラー修正 | 既に`IPC_CHANNELS`定数を使用済み |
| 新規テスト追加       | 既存テストで動作保証されている   |

### 2.4 成果物

| 成果物               | パス                                |
| -------------------- | ----------------------------------- |
| preload/index.ts修正 | `apps/desktop/src/preload/index.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `IPC_CHANNELS.DIALOG_SHOW_OPEN` が定義済み（channels.ts:88）
- `IPC_CHANNELS.DIALOG_SHOW_SAVE` が定義済み（channels.ts:89）
- ホワイトリストに登録済み（channels.ts:331-332）

### 3.2 変更内容

```typescript
// 変更前（行328）
showOpenDialog: (options) => safeInvoke("dialog:showOpenDialog", options),

// 変更後
showOpenDialog: (options) => safeInvoke(IPC_CHANNELS.DIALOG_SHOW_OPEN, options),

// 変更前（行333）
showSaveDialog: (options) => safeInvoke("dialog:showSaveDialog", options),

// 変更後
showSaveDialog: (options) => safeInvoke(IPC_CHANNELS.DIALOG_SHOW_SAVE, options),
```

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

本タスク（Preload Dialog API ハードコード削除）は、上記パターンのうち以下が特に関連する:

1. **P23（API二重定義による型定義の二重管理）**: Dialog APIはMain側とPreload側の両方でチャンネル名を使用している。ハードコード文字列を`IPC_CHANNELS`定数に置き換えることで、チャンネル名の一元管理を実現し、二重管理によるタイポや不整合を防止する。

2. **P28（削除タイプのリファクタリングにおける手動確認忘れ）**: ハードコード文字列を定数に置き換える際、他の箇所にも同様のハードコードが残っていないか`grep -rn "dialog:"` で確認すること。TASK-FIX-5-1ではこの確認を怠り、本タスクが発生した。

3. **P24（呼び出し元コードの参照先分散）**: Dialog APIの呼び出し元が分散している可能性がある。置き換え後は呼び出し元の動作に影響がないか確認すること。

#### 参照資料

- 成功/失敗パターン集: `.claude/skills/aiworkflow-requirements/references/patterns.md`
- 実装パターン詳細: `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`
- 苦戦パターン正本: `.claude/rules/06-known-pitfalls.md`

---

## 4. 実行手順

### Phase 1: 修正

1. `apps/desktop/src/preload/index.ts` を開く
2. 行328の `"dialog:showOpenDialog"` を `IPC_CHANNELS.DIALOG_SHOW_OPEN` に置換
3. 行333の `"dialog:showSaveDialog"` を `IPC_CHANNELS.DIALOG_SHOW_SAVE` に置換

### Phase 2: 検証

1. `pnpm typecheck` でコンパイルエラーがないことを確認
2. `pnpm --filter @repo/desktop test` で既存テストがパスすることを確認

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `IPC_CHANNELS.DIALOG_SHOW_OPEN` が使用されている
- [ ] `IPC_CHANNELS.DIALOG_SHOW_SAVE` が使用されている
- [ ] ハードコード文字列が残っていない

### 品質要件

- [ ] TypeScriptコンパイルエラーがない
- [ ] 既存テストが全てパス
- [ ] ESLintエラーがない

---

## 6. 検証方法

### テストケース

| #   | テストケース             | 期待結果   |
| --- | ------------------------ | ---------- |
| 1   | ファイルダイアログを開く | 正常に動作 |
| 2   | 保存ダイアログを開く     | 正常に動作 |
| 3   | TypeScriptコンパイル     | エラーなし |

### 検証手順

1. `pnpm typecheck` でエラーがないこと
2. `pnpm --filter @repo/desktop test` で全テストパス
3. 開発環境でダイアログ操作の動作確認

---

## 7. リスクと対策

| リスク   | 影響度 | 発生確率 | 対策                                 |
| -------- | ------ | -------- | ------------------------------------ |
| 動作変更 | 低     | 極低     | 文字列値は同一、単なる参照方法の変更 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント         | パス                                                    |
| -------------------- | ------------------------------------------------------- |
| IPCチャネル定義      | `apps/desktop/src/preload/channels.ts`                  |
| Electronセキュリティ | `.claude/rules/04-electron-security.md`                 |
| 発見元タスク成果物   | `docs/30-workflows/TASK-FIX-5-1-SKILL-API-UNIFICATION/` |

### 関連タスク

| タスクID     | 関係   | 説明                         |
| ------------ | ------ | ---------------------------- |
| TASK-FIX-5-1 | 発見元 | Skill API統一                |
| UT-FIX-5-3   | 関連   | Agent Abort セキュリティ修正 |

---

## 9. 備考

### 発見元の原文

```
Phase 10 アーキテクチャレビューにて検出:
- preload/index.ts:328,333 で dialog チャネルがハードコード
- 他のAPIは全て IPC_CHANNELS 定数を使用
- 対応: ハードコード文字列を IPC_CHANNELS 定数に置き換え
```

### 補足事項

- 極めて軽微な修正であり、10分以内に完了可能
- セキュリティ機能への影響はなし（ホワイトリスト検証は機能している）
- コードベースの一貫性確保が主目的

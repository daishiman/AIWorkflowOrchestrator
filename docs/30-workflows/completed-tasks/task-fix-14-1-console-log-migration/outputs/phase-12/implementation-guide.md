# Phase 12: 実装ガイド

## メタ情報

| 項目     | 値                                  |
| -------- | ----------------------------------- |
| タスクID | TASK-FIX-14-1-CONSOLE-LOG-MIGRATION |
| フェーズ | Phase 12 - ドキュメント             |
| 作成日   | 2026-02-14                          |

---

# Part 1: 概念説明（中学生レベル）

## ログを整理して、問題を見つけやすくする話

### 日記帳のたとえ

アプリが動いている間に起きたことを記録する仕組みを「ログ」と呼びます。ログは、アプリの「日記帳」のようなものです。

**今までのやり方（console.log）= メモ用紙にバラバラに書く**

- 思いついたときに、その場のメモ用紙に書く
- 「重要なこと」も「ちょっとしたメモ」も同じ紙に書く
- 後から探そうとしても、どこに書いたか分からない
- 学校に持っていけない（ブラウザのコンソールにしか表示されない）

**新しいやり方（electron-log）= 整理されたノートに書く**

- 日付と時間が自動で記録される
- 重要度マークが付く（赤=エラー、黄=注意、青=お知らせ、灰=メモ）
- ファイルに保存されるので、後から見返せる
- 必要に応じて、特定の重要度以上だけ表示できる

### なぜこの変更が必要だったか

アプリが本番環境（ユーザーのパソコン）で動いているとき、問題が起きたら「いつ」「どこで」「何が」起きたかを素早く見つけたいです。

- `console.log` だと、開発者ツールを開かないと見えない
- `console.log` だと、アプリを閉じたらログが消える
- `electron-log` なら、ファイルに自動保存される
- `electron-log` なら、重要度でフィルタリングできる

### 何をしたか

- 4つのファイルで「メモ用紙」方式から「整理されたノート」方式に切り替えた
- 合計27箇所の変更
- テストも更新して、新しい方式で正しく動くことを確認した

---

# Part 2: 開発者向け技術詳細

## 1. 変更概要

### 対象ファイル（4ファイル、27箇所）

| ファイル                | 変更箇所数 | 主な変更内容                     |
| ----------------------- | ---------- | -------------------------------- |
| `SkillImportManager.ts` | 12箇所     | error/warn/info/debug の全面移行 |
| `PermissionStore.ts`    | 7箇所      | error/warn/info の移行           |
| `SkillScanner.ts`       | 7箇所      | error/warn/info の移行           |
| `SkillAnalyzer.ts`      | 1箇所      | error の移行                     |

### スコープ外

- `SkillExecutor.ts`: console.error x2、console.info x2（別タスクで対応予定）

## 2. ログレベルマッピング

| 元の API                    | 移行先      | 用途                                         |
| --------------------------- | ----------- | -------------------------------------------- |
| `console.error`             | `log.error` | 致命的エラー（ストア破損、永続化失敗）       |
| `console.warn`              | `log.warn`  | 非致命的問題（型不正、パストラバーサル検出） |
| `console.info`              | `log.info`  | 状態変化（ツール許可、ディレクトリ作成）     |
| `console.log`（デバッグ用） | `log.debug` | 開発用デバッグ（操作ログ、永続化確認）       |

### マッピング判断基準

- **error**: 操作が失敗し、ユーザーに影響がある場合
- **warn**: 操作は継続するが、想定外の状態が検出された場合
- **info**: 正常な操作の記録（状態遷移、初期化完了）
- **debug**: 開発・デバッグ時にのみ有用な詳細情報

## 3. コードパターン

### import 文の追加

```typescript
import log from "electron-log";
```

### ログ出力の統一パターン

```typescript
// プレフィックス: [ClassName] 形式
log.error("[SkillImportManager] スキルインポート失敗:", error);
log.warn("[PermissionStore] Invalid schema, resetting to defaults");
log.info("[SkillScanner] Created skills directory:", this.basePath);
log.debug("[SkillImportManager] Persist successful");
```

### エラーオブジェクトの配置

```typescript
// エラーオブジェクトは常に最終引数に配置
log.error("[SkillImportManager] インポート処理エラー:", skillId, error);
```

## 4. テストでのモックパターン

### electron-log モック定義

```typescript
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

### スパイによるログ出力検証

```typescript
import log from "electron-log";

// ログ出力の検証
expect(log.error).toHaveBeenCalledWith(
  expect.stringContaining("[SkillImportManager]"),
  expect.any(Error),
);
```

## 5. 削除されたパターン

### `process.env.NODE_ENV !== "test"` ガード

```typescript
// 削除前
if (process.env.NODE_ENV !== "test") {
  console.warn(
    "[SkillImportManager] Invalid stored data type, expected array:",
    typeof value,
  );
}

// 削除後（electron-log モックがテスト環境を処理）
log.warn(
  "[SkillImportManager] Invalid stored data type, expected array:",
  typeof value,
);
```

**理由**: electron-log のモックがテスト環境での出力を抑制するため、環境チェックガードは不要になった。

### `if (this.debug)` 条件付きラッパー

```typescript
// 削除前
if (this.debug) {
  console.log("[SkillImportManager] デバッグ情報:", data);
}

// 削除後（ログレベル制御は electron-log の transports 設定で行う）
log.debug("[SkillImportManager] デバッグ情報:", data);
```

**理由**: `log.debug` は常に呼び出され、表示レベルの制御は electron-log の transports 設定で行う。アプリケーションコードでの条件分岐は不要。

## 6. 影響範囲

- **プロダクションファイル**: 4ファイル変更
- **テストファイル**: 10ファイル変更（モック追加・スパイ更新）
- **インターフェース変更**: なし（外部API・IPCチャネルの変更なし）
- **パフォーマンス影響**: 軽微（electron-log は console と同等のオーバーヘッド）

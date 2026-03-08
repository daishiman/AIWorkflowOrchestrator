# ログ移行ガイド（console → electron-log）

> **相対パス**: `references/logging-migration-guide.md`
> **読み込み条件**: Main Process サービス層で console.* を electron-log に移行する際
> **発見タスク**: TASK-FIX-14-1-CONSOLE-LOG-MIGRATION

---

## メタ情報

| 項目 | 値 |
|------|---|
| 正本 | `.claude/skills/aiworkflow-requirements/references/logging-migration-guide.md` |
| 目的 | console.* → electron-log 移行の標準手順・パターン・テストテンプレートを一元管理 |
| スコープ | Electron Main Process のサービス層（`apps/desktop/src/main/`） |
| 対象読者 | AIWorkflowOrchestrator 開発者 |
| 関連規約 | [development-guidelines.md](./development-guidelines.md) - Skill系Main Processログ規約 |

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|----------|
| 2026-02-14 | 1.0.0 | 初版作成（TASK-FIX-14-1 実装パターンから体系化） |

---

## 目次

1. [ログレベルマッピング基準](#ログレベルマッピング基準)
2. [移行手順チェックリスト](#移行手順チェックリスト)
3. [コードパターン](#コードパターン)
4. [テストモックテンプレート](#テストモックテンプレート)
5. [条件ガード削除パターン](#条件ガード削除パターン)
6. [注意事項・ピットフォール](#注意事項ピットフォール)

---

## ログレベルマッピング基準

### 標準マッピング

| 移行元 | 移行先 | 判断基準 | 例 |
|--------|--------|----------|-----|
| `console.error` | `log.error` | 処理失敗・ユーザーに影響あり | DB接続失敗、ファイルI/Oエラー |
| `console.warn` | `log.warn` | 想定外の状態検出・操作は継続可能 | データ不整合検出、非推奨API使用 |
| `console.info` | `log.info` | 正常な状態遷移・初期化完了 | サービス起動完了、設定読み込み |
| `console.log` | `log.debug` | 開発・デバッグ時にのみ有用 | 変数値確認、処理フロー追跡 |

### マッピング判断フローチャート

```
console.* 呼び出しを発見
  ├→ エラーオブジェクトを含む？ → log.error
  ├→ 異常検出だが処理続行？ → log.warn
  ├→ 状態変化の通知？ → log.info
  └→ デバッグ情報？ → log.debug
```

---

## 移行手順チェックリスト

### 本番コード修正

- [ ] `import log from "electron-log"` を追加
- [ ] 全 `console.*` 呼び出しをログレベルマッピングに従い置換
- [ ] ログメッセージに `[ClassName]` プレフィックスを追加
- [ ] エラーオブジェクトは最終引数に配置
- [ ] `if (this.debug)` ガードを削除し、`log.debug` に置換
- [ ] `process.env.NODE_ENV !== "test"` ガードを削除
- [ ] 機密情報（APIキー、パスワード）がログに含まれていないか確認

### テストコード修正

- [ ] テストファイルに `vi.mock("electron-log")` を追加
- [ ] `console.log` スパイを `log.debug` アサーションに置換
- [ ] `console.error` スパイを `log.error` アサーションに置換
- [ ] `consoleSpy.mockRestore()` 呼び出しを削除
- [ ] テスト実行時に stdout にログが漏れていないか確認

### 検証

- [ ] `grep -rn "console\.\(log\|error\|warn\|info\)" <target-files>` で残留0件確認
- [ ] 全テスト PASS
- [ ] カバレッジ基準充足（Lines≥80%, Branches≥60%, Functions≥80%）

---

## コードパターン

### パターン1: 基本的な置換

```typescript
// ❌ Before
console.error("エラーが発生しました:", error);
console.warn("データが不正です:", data);
console.info("初期化完了");
console.log("デバッグ:", value);

// ✅ After
import log from "electron-log";

log.error("[ClassName] エラーが発生しました:", error);
log.warn("[ClassName] データが不正です:", data);
log.info("[ClassName] 初期化完了");
log.debug("[ClassName] デバッグ:", value);
```

### パターン2: ログプレフィックスの統一

```typescript
// ✅ [ClassName] 形式で統一
log.error("[SkillImportManager] スキルの読み込みに失敗:", error);
log.warn("[PermissionStore] 無効なエントリを検出:", entry);
log.info("[SkillScanner] スキャン完了: %d 件", count);
log.debug("[SkillAnalyzer] 分析データ:", data);
```

### パターン3: エラーオブジェクトの配置

```typescript
// ✅ エラーオブジェクトは常に最終引数
log.error("[ClassName] 処理失敗:", contextInfo, error);

// ❌ エラーオブジェクトが中間引数
log.error("[ClassName]", error, "処理失敗");
```

---

## テストモックテンプレート

### 標準モックパターン（全Main Processサービステストで必須）

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// electron-log モック（import直後、describe直前に配置）
vi.mock("electron-log", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));
```

### ログ呼び出し検証パターン

```typescript
import log from "electron-log";

it("エラー時に log.error が呼ばれる", async () => {
  // Arrange
  const mockError = new Error("Test error");

  // Act
  await service.doSomething();

  // Assert
  expect(vi.mocked(log.error)).toHaveBeenCalledWith(
    expect.stringContaining("[ClassName]"),
    expect.any(Error)
  );
});
```

### ログモッククリアパターン

```typescript
beforeEach(() => {
  vi.clearAllMocks(); // 全テスト間でモック状態をリセット
});

// 特定テストでのみクリアする場合
vi.mocked(log.debug).mockClear();
```

---

## 条件ガード削除パターン

### パターンA: 環境チェックガード削除

```typescript
// ❌ Before: テスト環境除外ガード
if (process.env.NODE_ENV !== "test") {
  console.warn("[ClassName] 警告メッセージ:", data);
}

// ✅ After: ガード不要（テストではモックが自動処理）
log.warn("[ClassName] 警告メッセージ:", data);
```

**根拠**: `vi.mock("electron-log")` によりテスト環境ではモック関数が使用され、stdout汚染が自動的に防止される。

### パターンB: デバッグフラグガード削除

```typescript
// ❌ Before: this.debug フラグによるガード
if (this.debug) {
  console.log("[ClassName] デバッグ情報:", data);
}

// ✅ After: ログレベル制御に委譲
log.debug("[ClassName] デバッグ情報:", data);
```

**根拠**: electron-log のトランスポート設定でログレベルを制御できるため、アプリケーションコード側の条件分岐は不要。本番環境では `log.transports.console.level = "info"` 等で debug 出力を抑制可能。

### パターンC: debug プロパティの後方互換維持

```typescript
// debug プロパティは設定のみ（読み取り不要に）
// 25件のテスト参照があるため、削除ではなく維持を選択
this.debug = options?.debug ?? process.env.NODE_ENV === "development";

// ⚠️ 後続タスクで段階的削除を検討
// TASK-FIX-14-2 で SkillExecutor.ts の残存 console も移行後に統一的に削除
```

---

## 注意事項・ピットフォール

### 1. テストファイルへのモック追加漏れ

| 項目 | 内容 |
|------|------|
| **症状** | テスト実行時に electron-log の出力が stdout に流れ、テスト結果の可読性が低下 |
| **原因** | electron-log はデフォルトで stdout 出力するため、モック定義がないテストファイルでは出力される |
| **対策** | Main Process サービス層のテストファイルには必ず `vi.mock("electron-log")` を追加 |
| **検出方法** | テスト実行時に `[ClassName]` プレフィックスの出力が見えたらモック漏れ |
| **関連** | P20（テスト環境でのログ出力汚染）、TASK-FIX-14-1 |

### 2. 大量テストファイルへのモック追加

| 項目 | 内容 |
|------|------|
| **症状** | 本番コード1ファイルの移行で、関連テスト9ファイル以上にモック追加が必要 |
| **原因** | electron-log を import したモジュールを使うテストは全て影響を受ける |
| **対策** | `grep -rn "from.*ClassName" __tests__/` で影響テストファイルを事前に特定し、一括でモック追加 |
| **実績** | TASK-FIX-14-1 では 9 ファイルに同一パターンのモックを追加（バックグラウンドエージェントで並列処理） |
| **関連** | P21（既存テストへの DI 追加時の大規模修正） |

### 3. カバレッジ計測のファイルパス指定

| 項目 | 内容 |
|------|------|
| **症状** | `vitest run --coverage <source-file-path>` でカバレッジが 0% になる |
| **原因** | vitest は引数にテストファイルパスを期待するが、ソースファイルパスを渡してしまう |
| **対策** | `vitest run --coverage src/main/services/skill/` のようにテストが含まれるディレクトリを指定 |
| **関連** | P40（テスト実行ディレクトリ依存） |

### 4. スコープ外ファイルの管理

| 項目 | 内容 |
|------|------|
| **症状** | 移行対象ディレクトリ内に、意図的にスコープ外とすべきファイルが存在 |
| **例** | SkillExecutor.ts は SDK依存が大きく、別タスク（TASK-FIX-14-2）で対応 |
| **対策** | Phase 1（スコープ定義）で明示的にスコープ外を記述し、Phase 12（未タスク検出）で後続タスク化 |

---

## 関連ドキュメント

| ドキュメント | 目的 | パス |
|--------------|------|------|
| development-guidelines.md | Skill系Main Processログ規約 | [./development-guidelines.md](./development-guidelines.md) |
| patterns.md | ログ関連の成功/失敗パターン | [./patterns.md](./patterns.md) |
| lessons-learned.md | TASK-FIX-14-1 苦戦箇所 | [./lessons-learned.md](./lessons-learned.md) |
| 06-known-pitfalls.md | P20: テスト環境でのログ出力汚染 | [../../../rules/06-known-pitfalls.md](../../../rules/06-known-pitfalls.md) |

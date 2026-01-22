# Community型エクスポート追加（Part 3: 検証） - タスク指示書

## メタ情報

```yaml
issue_number: 373
```

## メタ情報

| 項目         | 内容                                         |
| ------------ | -------------------------------------------- |
| タスクID     | SHARED-TYPE-EXPORT-03                        |
| タスク名     | @repo/shared Community型エクスポート（検証） |
| 分類         | リファクタリング                             |
| 対象機能     | @repo/shared, @repo/desktop                  |
| 優先度       | 高                                           |
| 見積もり規模 | 小規模                                       |
| ステータス   | 未実施                                       |
| 発見元       | Phase 12 (CONV-08-05)                        |
| 発見日       | 2026-01-13                                   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

Part 1（型整理）とPart 2（メインエクスポート）の完了後、実際にデスクトップアプリからの型インポートが正常に動作することを検証する必要がある。

### 1.2 問題点・課題

型エクスポートを追加しても、以下の問題が残る可能性がある:

- デスクトップアプリのインポートパスが不正
- モジュール解決の設定問題
- ビルド時の型解決エラー

### 1.3 放置した場合の影響

- Part 1, 2の作業が無駄になる可能性
- 別の問題が潜んでいた場合に発見が遅れる

---

## 2. 何を達成するか（What）

### 2.1 目的

型エクスポートの追加が正しく機能し、デスクトップアプリのビルドが成功することを検証する。

### 2.2 最終ゴール

以下のコマンドが全てエラーなく完了する:

```bash
pnpm typecheck
pnpm build
git push  # pre-push hookが通過
```

### 2.3 スコープ

#### 含むもの

- `@repo/shared` の型チェック
- `@repo/desktop` の型チェック
- ビルドの検証
- 必要に応じたインポートパス修正

#### 含まないもの

- 機能の追加・変更
- テストの追加

### 2.4 成果物

| 成果物         | 内容                 |
| -------------- | -------------------- |
| 検証レポート   | 型チェック結果の記録 |
| 修正（必要時） | インポートパス修正   |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- SHARED-TYPE-EXPORT-01（Part 1）が完了している
- SHARED-TYPE-EXPORT-02（Part 2）が完了している

### 3.2 依存タスク

| タスクID              | 内容               |
| --------------------- | ------------------ |
| SHARED-TYPE-EXPORT-01 | 型整理（Part 1）   |
| SHARED-TYPE-EXPORT-02 | メインエクスポート |

### 3.3 必要な知識

- pnpmモノレポの依存関係
- TypeScriptモジュール解決

### 3.4 推奨アプローチ

1. 段階的に型チェックを実行
2. エラーがあれば原因を特定・修正
3. 最終的にpushが通ることを確認

---

## 4. 実行手順

### Phase 1: 型チェック実行

#### 目的

型エクスポートが正しく機能していることを確認する。

#### 手順

1. `@repo/shared` の型チェック:

   ```bash
   cd packages/shared
   pnpm typecheck
   ```

2. `@repo/desktop` の型チェック:

   ```bash
   cd apps/desktop
   pnpm typecheck
   ```

3. エラーがある場合は内容を確認

#### 成果物

型チェックの実行結果

#### 完了条件

- [ ] `@repo/shared` の型チェックが通過
- [ ] `@repo/desktop` の型チェックが通過

### Phase 2: ビルド検証

#### 目的

実際のビルドが成功することを確認する。

#### 手順

1. `@repo/shared` のビルド:

   ```bash
   cd packages/shared
   pnpm build
   ```

2. `@repo/desktop` のビルド:
   ```bash
   cd apps/desktop
   pnpm build
   ```

#### 成果物

ビルド成功のログ

#### 完了条件

- [ ] `@repo/shared` のビルドが成功
- [ ] `@repo/desktop` のビルドが成功（既存のRenderer問題を除く）

### Phase 3: Push検証

#### 目的

pre-push hookを含めた全体の検証。

#### 手順

1. 変更をコミット
2. プッシュを実行:

   ```bash
   git push
   ```

3. pre-push hookが通過することを確認

#### 成果物

プッシュ成功のログ

#### 完了条件

- [ ] pre-push hookが通過
- [ ] リモートリポジトリにプッシュ成功

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 型チェックがエラーなく通過
- [ ] ビルドが成功
- [ ] git pushが成功

### 品質要件

- [ ] 既存の機能が壊れていない
- [ ] 循環参照がない
- [ ] モジュール解決が正常

---

## 6. 検証方法

### 最終検証コマンド

```bash
# ルートディレクトリから
pnpm typecheck
pnpm build
git push
```

### トラブルシューティング

| エラー                          | 対処法                        |
| ------------------------------- | ----------------------------- |
| `Module has no exported member` | Part 1, 2のエクスポートを確認 |
| `Cannot find module`            | パッケージのビルド順序を確認  |
| `Circular dependency`           | インポート構造を見直し        |

---

## 7. 参照情報

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                                                                                      | 内容                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | 型エクスポートパターン |
| Community検出インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | Community型定義        |

### 関連コマンド

```bash
# 型チェック
pnpm --filter @repo/shared typecheck
pnpm --filter @repo/desktop typecheck

# ビルド
pnpm --filter @repo/shared build
pnpm --filter @repo/desktop build

# 全体
pnpm typecheck
pnpm build
```

### 関連タスク

| タスクID              | 内容               | ステータス |
| --------------------- | ------------------ | ---------- |
| SHARED-TYPE-EXPORT-01 | 型整理（Part 1）   | 完了       |
| SHARED-TYPE-EXPORT-02 | メインエクスポート | 未実施     |
| CONV-08-05            | 元タスク           | -          |

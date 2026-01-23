# Phase 1: 検証要件定義

## メタ情報

| 項目       | 内容                             |
| ---------- | -------------------------------- |
| Phase番号  | 1                                |
| Phase名    | 検証要件定義                     |
| 目的       | 検証対象・基準・前提条件の明確化 |
| 前提Phase  | なし                             |
| 推定作業量 | 小                               |

---

## 1. 目的

Part 1（型整理）とPart 2（メインエクスポート）で追加された型エクスポートが正しく機能することを検証するための要件を定義する。

---

## 2. 実行タスク

### Task 1-1: 検証対象の明確化

#### 目的

検証すべき対象パッケージとファイルを特定する。

#### 手順

1. `@repo/shared` の型エクスポート対象を確認

   ```bash
   ls packages/shared/src/services/graph/
   ```

2. `@repo/desktop` のインポート箇所を特定

   ```bash
   grep -r "from.*@repo/shared.*graph" apps/desktop/src/
   ```

3. 検証対象ファイルをリストアップ

#### 成果物

| 成果物         | 配置先                                  |
| -------------- | --------------------------------------- |
| 検証対象リスト | `outputs/phase-1/verification-scope.md` |

#### 完了条件

- [ ] `@repo/shared` の型エクスポート対象が明確になっている
- [ ] `@repo/desktop` のインポート箇所が特定されている
- [ ] 検証対象ファイルがリストアップされている

---

### Task 1-2: 検証基準の定義

#### 目的

検証をPASSとするための基準を明確に定義する。

#### 検証基準

| 検証項目          | コマンド                                | 期待結果  | 必須 |
| ----------------- | --------------------------------------- | --------- | ---- |
| shared型チェック  | `pnpm --filter @repo/shared typecheck`  | エラー0件 | ✅   |
| desktop型チェック | `pnpm --filter @repo/desktop typecheck` | エラー0件 | ✅   |
| 全体型チェック    | `pnpm typecheck`                        | エラー0件 | ✅   |
| sharedビルド      | `pnpm --filter @repo/shared build`      | 成功      | ✅   |
| desktopビルド     | `pnpm --filter @repo/desktop build`     | 成功※     | ✅   |
| 全体ビルド        | `pnpm build`                            | 成功      | ✅   |
| pre-push hook     | `git push`                              | hook通過  | ✅   |

※ desktopビルドは既存のRenderer関連問題を除く

#### 成果物

| 成果物         | 配置先                                     |
| -------------- | ------------------------------------------ |
| 検証基準定義書 | `outputs/phase-1/verification-criteria.md` |

#### 完了条件

- [ ] 各検証項目の期待結果が定義されている
- [ ] 必須/任意の区分が明確になっている
- [ ] 例外ケース（既存問題）が明記されている

---

### Task 1-3: 前提条件の確認

#### 目的

本検証タスクを実行するための前提条件を確認する。

#### 前提条件チェックリスト

| 前提条件                    | 確認方法               | 期待状態 |
| --------------------------- | ---------------------- | -------- |
| SHARED-TYPE-EXPORT-01完了   | タスクステータス確認   | 完了     |
| SHARED-TYPE-EXPORT-02完了   | タスクステータス確認   | 完了     |
| services/graph/index.ts存在 | ファイル存在確認       | 存在する |
| Community型エクスポート済み | index.tsのexport文確認 | 存在する |

#### 確認コマンド

```bash
# Part 2成果物確認
cat packages/shared/src/services/graph/index.ts | grep -E "export.*Community"

# エクスポートの存在確認
grep -E "^export" packages/shared/src/services/graph/index.ts
```

#### 成果物

| 成果物         | 配置先                                       |
| -------------- | -------------------------------------------- |
| 前提条件確認書 | `outputs/phase-1/prerequisites-checklist.md` |

#### 完了条件

- [ ] 全ての前提条件が確認されている
- [ ] 前提条件を満たさない場合の対応方針が明記されている

---

## 3. 参照資料

### システム仕様（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料                      | パス                                                                                      | 内容                   |
| ----------------------------- | ----------------------------------------------------------------------------------------- | ---------------------- |
| モノレポアーキテクチャ        | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md`              | 型エクスポートパターン |
| Community検出インターフェース | `.claude/skills/aiworkflow-requirements/references/interfaces-rag-community-detection.md` | Community型定義        |

### 関連タスク

| タスクID              | 内容               | 参照目的     |
| --------------------- | ------------------ | ------------ |
| SHARED-TYPE-EXPORT-01 | 型整理（Part 1）   | 完了状態確認 |
| SHARED-TYPE-EXPORT-02 | メインエクスポート | 完了状態確認 |

---

## 4. 成果物一覧

| 成果物         | ファイル名                   | 必須 |
| -------------- | ---------------------------- | ---- |
| 検証対象リスト | `verification-scope.md`      | ✅   |
| 検証基準定義書 | `verification-criteria.md`   | ✅   |
| 前提条件確認書 | `prerequisites-checklist.md` | ✅   |

---

## 5. 完了条件

### 機能要件

- [ ] 検証対象ファイルが全て特定されている
- [ ] 検証基準が明確に定義されている
- [ ] 前提条件が全て確認されている

### 品質要件

- [ ] 検証基準に曖昧な表現がない
- [ ] 100人中100人が同じ理解で検証を実行できる
- [ ] 例外ケースが明記されている

### Phase完了時の必須アクション

1. 上記成果物を `outputs/phase-1/` に出力
2. artifacts.json の phase-1 ステータスを更新
3. 各タスクを100%実行し、完遂した旨を明記

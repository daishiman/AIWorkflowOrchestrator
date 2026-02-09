# TASK-FIX-5-1: 移行計画

## タスク情報

| 項目         | 値                                 |
| ------------ | ---------------------------------- |
| タスクID     | TASK-FIX-5-1-SKILL-API-UNIFICATION |
| Phase        | 2 - 設計                           |
| ドキュメント | 移行計画                           |
| 作成日       | 2026-02-09                         |

## 概要

本ドキュメントでは、SkillAPI の二重定義を解消するための移行計画を示す。変更は型定義ファイルのみ（2行削除）であり、段階的移行は不要。

## 移行戦略

### 基本方針

```
段階的移行: 不要 ← 使用コード 0件のため即座に削除可能
    ↓
即座削除戦略: 実施
```

**理由:**

1. **使用コード 0件:** `window.skillAPI` を使用しているコードが存在しない
2. **幽霊型定義:** 実装されていない型定義であるため、安全に削除可能
3. **後方互換性:** 全呼び出し元が既に `window.electronAPI.skill` を使用しているため、影響なし

### 実装スケジュール

| Phase | 内容               | タイミング     |
| ----- | ------------------ | -------------- |
| 2     | 移行計画立案       | 完了済み       |
| 3     | 設計レビュー       | 次フェーズ     |
| 4     | テスト設計（TDD）  | その次フェーズ |
| 5     | 実装（型定義削除） | Phase 5        |
| 6     | テスト拡充         | Phase 6        |
| 7     | カバレッジ確認     | Phase 7        |
| 8     | リファクタリング   | Phase 8        |
| 9     | 品質検証           | Phase 9        |
| 10    | 最終レビュー       | Phase 10       |
| 11    | 手動テスト         | Phase 11       |
| 12    | ドキュメント       | Phase 12       |
| 13    | PR作成             | Phase 13       |

## 変更内容の詳細

### 変更対象ファイル

#### ファイル 1: `apps/desktop/src/preload/types.d.ts`

**変更内容:**

- **削除:** `skillAPI: SkillAPI;` （1行）

**変更量:**

- 削除行: 1
- 追加行: 0
- 合計変更行: 1行

**差分:**

```diff
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
    conversationAPI: ConversationAPI;
-   skillAPI: SkillAPI;
  }
}

export {};
```

#### ファイル 2: `apps/desktop/src/preload/types.ts`

**変更内容:**

- **削除:** `skillAPI: SkillAPI;` （グローバル宣言内、1行）

**変更量:**

- 削除行: 1
- 追加行: 0
- 合計変更行: 1行

**差分:**

```diff
declare global {
  interface Window {
    electronAPI: ElectronAPI;
-   skillAPI: SkillAPI;
  }
}
```

### 変更のポイント

1. **最小限の変更:** 2行のみ削除
2. **実装コード無影響:** 型宣言のみの削除
3. **後方互換性:** 既に `electronAPI.skill` を使用しているため、影響なし

## 動作確認計画

### Phase 5（実装）での確認項目

#### 1. ビルド確認

```bash
# TypeScript 型チェック
pnpm typecheck

# 期待結果:
# ✅ 型チェック成功
# ✅ エラー: 0
# ✅ 警告: 0
```

#### 2. テスト実行

```bash
# 既存テスト全実行
pnpm test

# 期待結果:
# ✅ 全テスト PASS
# ✅ スキール実行テスト: PASS
# ✅ IPC テスト: PASS
# ✅ 権限管理テスト: PASS
```

#### 3. 参照確認

```bash
# window.skillAPI への参照を検索
grep -r "window\.skillAPI" apps/

# 期待結果:
# ⚠️ マッチなし（使用コードなし）
```

#### 4. Linting 確認

```bash
# ESLint + Prettier
pnpm lint
pnpm format

# 期待結果:
# ✅ Lint エラー: 0
# ✅ Format 警告: 0
```

#### 5. IDE 型補完確認

| 操作                             | 期待結果                        |
| -------------------------------- | ------------------------------- |
| `window.skill` 入力              | 補完候補なし（削除後）          |
| `window.electronAPI.skill.` 入力 | 13メソッドが補完表示 ✅         |
| `window.electronAPI` 入力        | `skill` プロパティが補完表示 ✅ |

### Phase 9（品質検証）での確認項目

#### 1. 型安全性検証

```typescript
// ✅ 正しい（型チェック通過）
const api = window.electronAPI.skill;
await api.execute({ skillName: "test", args: [] });

// ❌ 誤用検出（型チェック失敗）
const api2 = window.skillAPI; // Type Error!
```

#### 2. リント・フォーマット確認

```bash
pnpm lint --max-warnings 0
pnpm format --check

# 期待結果:
# ✅ 0個の警告
# ✅ フォーマット済み
```

### Phase 11（手動テスト）での確認項目

| テストケース       | 手順                             | 期待結果              |
| ------------------ | -------------------------------- | --------------------- |
| スキール一覧表示   | メニューから「スキール」選択     | スキール一覧表示 ✅   |
| スキール実行       | スキール実行ボタン押下           | スキール実行成功 ✅   |
| ストリーム出力取得 | 実行中のログ表示                 | ログ正常表示 ✅       |
| 権限リクエスト処理 | 権限拒否/許可ボタン操作          | 適切に反応 ✅         |
| エディタ補完       | IDE で `electronAPI.skill.` 入力 | 13メソッド補完表示 ✅ |

## リスク評価と対策

### リスク1: 型定義漏れ

**リスク:** 削除後に型チェック失敗

**対策:**

- Phase 5 で `pnpm typecheck` を必ず実行
- CI/CD で型チェック成功を確認

**リスク度:** 🟢 極めて低い

### リスク2: テスト失敗

**リスク:** 既存テストが失敗する可能性

**対策:**

- 既存テストはモック経由のため、型定義削除に影響されない
- Phase 5 で `pnpm test` を必ず実行

**リスク度:** 🟢 極めて低い

### リスク3: 使用コードの見落とし

**リスク:** `window.skillAPI` を使用しているコードが存在する可能性

**対策:**

- Phase 1 で全プロジェクト検索済み（使用コード 0件を確認）
- Phase 5 で再度検索確認（grep で確認）

**リスク度:** 🟢 極めて低い

### リスク4: IDE 補完不正

**リスク:** IDE が古い型定義を参照し続ける可能性

**対策:**

- IDE キャッシュ削除（VS Code では Reload Window）
- `tsconfig.json` の再読み込み確認

**リスク度:** 🟡 低い

## 変更の自動化

### 変更スクリプト（手動実行用）

#### Option A: 手動編集（推奨）

```bash
# 1. types.d.ts を開く
code apps/desktop/src/preload/types.d.ts

# 2. skillAPI: SkillAPI; を削除

# 3. types.ts を開く
code apps/desktop/src/preload/types.ts

# 4. グローバル宣言内の skillAPI: SkillAPI; を削除

# 5. 保存
```

#### Option B: sed による自動削除（参考）

```bash
# types.d.ts から削除
sed -i '' '/skillAPI: SkillAPI;/d' apps/desktop/src/preload/types.d.ts

# types.ts から削除（グローバル宣言内）
sed -i '' '/skillAPI: SkillAPI;/d' apps/desktop/src/preload/types.ts

# 確認
git diff apps/desktop/src/preload/types.*
```

**注意:** sed 実行後は `git diff` で差分確認を推奨

## コミットメッセージ例

### Conventional Commits 準拠

```
fix(preload): SkillAPI 二重型定義を解消

- types.d.ts から window.skillAPI 型宣言を削除
- types.ts のグローバル宣言から skillAPI を削除
- window.electronAPI.skill への統一完了

Closes TASK-FIX-5-1-SKILL-API-UNIFICATION
```

### 簡潔版

```
fix: SkillAPI 二重型定義を削除（types.d.ts, types.ts）
```

## ロールバック計画

### ロールバック条件

| 条件                     | アクション        |
| ------------------------ | ----------------- |
| ビルド失敗               | git revert を実行 |
| テスト失敗（予期しない） | git revert を実行 |
| 実行時エラー検出         | git revert を実行 |
| その他重大な問題         | git revert を実行 |

### ロールバック手順

```bash
# コミット前の場合
git restore apps/desktop/src/preload/types.*

# コミット後の場合
git revert <commit-hash>
```

## Phase別の実行項目

### Phase 4（テスト作成）

#### 目的

型定義削除後のテストケース設計

#### テストケース例

**テストケース 1: 削除された型へのアクセス拒否**

```typescript
test("window.skillAPI is not defined", () => {
  // @ts-expect-error - intentionally testing removed type
  expect(() => {
    const api = window.skillAPI;
  }).toThrow();
});
```

**テストケース 2: 正しい型へのアクセス**

```typescript
test("window.electronAPI.skill is accessible", () => {
  expect(window.electronAPI.skill).toBeDefined();
  expect(typeof window.electronAPI.skill.execute).toBe("function");
});
```

**テストケース 3: 全 13 メソッドが存在**

```typescript
test("SkillAPI has all 13 methods", () => {
  const methods = [
    "list",
    "getImported",
    "import",
    "remove",
    "rescan",
    "execute",
    "abort",
    "getExecutionStatus",
    "onStream",
    "onComplete",
    "onError",
    "onPermissionRequest",
    "sendPermissionResponse",
  ];

  methods.forEach((method) => {
    expect(window.electronAPI.skill[method]).toBeDefined();
  });
});
```

### Phase 5（実装）

#### 実装タスク

- [ ] `apps/desktop/src/preload/types.d.ts` を開く
- [ ] `skillAPI: SkillAPI;` を削除
- [ ] `apps/desktop/src/preload/types.ts` を開く
- [ ] グローバル宣言内の `skillAPI: SkillAPI;` を削除
- [ ] ファイルを保存
- [ ] `pnpm typecheck` でビルド確認
- [ ] `pnpm test` でテスト実行
- [ ] `grep -r "window\.skillAPI" apps/` で参照確認

#### 完了条件

- [ ] 型チェック成功
- [ ] テスト全て PASS
- [ ] 使用コード 0件を確認
- [ ] IDE 補完が正常に動作

### Phase 6-9（テスト・品質確認）

#### 実行内容

- Phase 6: テスト拡充（必要に応じて追加）
- Phase 7: カバレッジ確認（既存コードで対応）
- Phase 8: リファクタリング（対象外）
- Phase 9: 品質検証（Lint, TypeCheck, Test）

### Phase 10（最終レビュー）

#### レビュー観点

| 観点         | 確認項目                         | 期待結果 |
| ------------ | -------------------------------- | -------- |
| API設計      | `electronAPI.skill` への統一確認 | ✅ PASS  |
| IPC通信      | チャンネル変更なし確認           | ✅ PASS  |
| セキュリティ | 幽霊型定義削除による改善         | ✅ PASS  |
| 型安全性     | 型チェック成功、誤用検出確認     | ✅ PASS  |
| 互換性       | 既存コード動作確認               | ✅ PASS  |

### Phase 11（手動テスト）

#### テスト実施

| テストシーン | 実施項目                                 |
| ------------ | ---------------------------------------- |
| スキール管理 | 一覧表示、インポート、削除、再スキャン   |
| スキール実行 | 実行、中止、ステータス取得               |
| イベント受信 | ストリーム、完了、エラー、権限リクエスト |

### Phase 12（ドキュメント）

#### 更新対象

- [ ] `implementation-guide.md` 更新（API統一について記述）
- [ ] `api-documentation.md` 更新（削除された型について記述）
- [ ] `LOGS.md` 更新（タスク完了記録）

### Phase 13（PR作成）

#### PR 準備

- [ ] コミット完了
- [ ] GitHub PR 作成
- [ ] CI/CD チェック通過
- [ ] レビュー依頼

## チェックリスト

### 実装前チェック

- [ ] 変更対象ファイルを確認（types.d.ts, types.ts）
- [ ] 削除内容を確認（2行、skillAPI 型宣言）
- [ ] バックアップ確認（git で管理されている）

### 実装後チェック

- [ ] 変更ファイルが 2 個であることを確認
- [ ] 削除行が 2 行であることを確認
- [ ] `pnpm typecheck` が成功することを確認
- [ ] `pnpm test` が全て PASS することを確認
- [ ] `pnpm lint` エラーがないことを確認
- [ ] `grep -r "window\.skillAPI"` でマッチなしを確認
- [ ] IDE で `window.electronAPI.skill.*` 補完が正常に動作することを確認

### コミット前チェック

- [ ] `git status` で変更内容を確認
- [ ] `git diff` で差分を確認
- [ ] `git diff --stat` で変更統計を確認
- [ ] Lint/TypeCheck が通ることを確認
- [ ] テストが全て PASS することを確認

## トラブルシューティング

### 問題 1: 型チェック失敗

**症状:** `pnpm typecheck` でエラー

**対策:**

1. `types.d.ts` と `types.ts` の変更を確認
2. 削除行が正しいことを確認
3. ファイルを保存し直す
4. IDE キャッシュをクリア（VS Code では Cmd+K Cmd+I）
5. `pnpm install` を実行

### 問題 2: テスト失敗

**症状:** `pnpm test` でテスト失敗

**対策:**

1. テスト失敗内容を確認
2. モック設定を確認
3. テストファイルで `window.skillAPI` 参照がないことを確認
4. テストを個別実行して確認

### 問題 3: IDE 補完不正

**症状:** IDE で `window.electronAPI.skill` の補完が表示されない

**対策:**

1. IDE キャッシュをクリア
2. `tsconfig.json` を再読み込み
3. IDE を再起動
4. `.eslintcache` を削除し、lint を再実行

### 問題 4: grep で skillAPI が検出される

**症状:** `grep -r "skillAPI"` で不要なマッチが検出される

**対策:**

1. grep 結果を確認（コメント、型定義の`skillAPI`プロパティ参照など）
2. `window.skillAPI` の直接参照がないことを確認
3. `electronAPI.skill` はマッチしてもOK（これは正しい使用）

## 参考資料

### ドキュメント

| 資料               | パス                                         |
| ------------------ | -------------------------------------------- |
| 統一API設計        | `outputs/phase-2/unified-api-design.md`      |
| 型変更設計         | `outputs/phase-2/type-change-design.md`      |
| アーキテクチャ設計 | `outputs/phase-2/architecture-design.md`     |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md`    |
| 要件定義           | `outputs/phase-1/requirements-definition.md` |

### 実装コード

| ファイル                                | 説明               |
| --------------------------------------- | ------------------ |
| `apps/desktop/src/preload/types.d.ts`   | 削除対象ファイル   |
| `apps/desktop/src/preload/types.ts`     | 削除対象ファイル   |
| `apps/desktop/src/preload/skill-api.ts` | 参考用（変更なし） |
| `apps/desktop/src/preload/index.ts`     | 参考用（変更なし） |

---

**作成日:** 2026-02-09
**ステータス:** Phase 2 成果物
**参照:** Phase 2 設計ドキュメント

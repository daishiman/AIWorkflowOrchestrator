# Phase 5: 実装順序

## メタ情報

| 項目       | 値                                          |
| ---------- | ------------------------------------------- |
| タスク ID  | TASK-FIX-SETTINGS-APIKEY-CONTRACT-GUARD-001 |
| Phase      | 5 - 実装                                    |
| 作成日     | 2026-03-07                                  |
| 更新日     | 2026-03-08                                  |
| ステータス | 実装完了（全59テスト PASS）                 |

## 実装ステップ

### Step 1: Main 側バリデーション（GAP-05）

**対象ファイル**: `apps/desktop/src/main/ipc/apiKeyHandlers.ts`

**変更内容**:

- `apiKey:list` ハンドラのレスポンスに `Array.isArray()` バリデーションを追加
- providers が配列でない場合は空配列にフォールバック
- `registeredCount` を providers 配列から再計算（status === "active" のカウント）

**理由**:

- Main Process 側で不正なデータが Renderer に到達する前にサニタイズする（多層防御原則）
- contextBridge 経由の structured clone で予期しない型変換が発生しても安全

**依存関係**: なし（独立して実装可能）

**実装ステータス**: 完了（7テスト PASS）

---

### Step 2: Renderer 側 type predicate フィルタ追加（GAP-01, GAP-03）

**対象ファイル**: `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx`

**変更内容**:

- `Array.isArray(result?.data?.providers)` による安全な配列取得
- 各要素に対する type predicate で `provider` と `status` フィールドの存在を検証（P49 準拠: `in` 演算子使用）
  - `typeof element === "object"` かつ `element !== null`
  - `"provider" in element` かつ `typeof element.provider === "string"`
  - `"status" in element` かつ `typeof element.status === "string"`
- null, undefined, 非オブジェクト型の要素をフィルタで除外
- try-catch で `apiKey.list()` の rejection をハンドリング（GAP-04）

**理由**:

- P48 準拠: non-null assertion (`!`) を使用せず、実行時型検証で安全性を担保
- P49 準拠: `as` キャストではなく `in` 演算子で実行時にプロパティ存在を検証
- Preload 経由のレスポンスは structured clone の制約により型定義と実際の shape が乖離する可能性がある

**依存関係**: なし（独立して実装可能）

**実装ステータス**: 完了（46テスト中 GAP 関連7テスト含む PASS）

---

### Step 3: 空配列 UI フォールバック確認（GAP-02）

**対象ファイル**: `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx`

**変更内容**: なし（確認のみ）

**確認結果**:

- 既存の `ALL_PROVIDERS.map()` により、providers が空配列の場合でも全4プロバイダー（OpenAI, Anthropic, Google, Azure）が「未登録」状態で表示される
- 空配列は正常なケースとして既存ロジックで対応済み

**依存関係**: Step 2 完了後に確認

**実装ステータス**: 確認完了（GAP-TEST-02 PASS）

---

### Step 4: try-catch ハンドリング確認（GAP-04）

**対象ファイル**: `apps/desktop/src/renderer/components/settings/ApiKeysSection/index.tsx`

**変更内容**: なし（確認のみ）

**確認結果**:

- 既存の catch 節で `apiKey.list()` の reject を捕捉し、エラー状態を表示する
- クラッシュせずにユーザーにエラーメッセージを表示できることを確認

**依存関係**: Step 2 完了後に確認

**実装ステータス**: 確認完了（GAP-TEST-04 PASS）

---

### Step 5: profileHandlers パターン統一（GAP-06）

**対象ファイル**: `apps/desktop/src/main/ipc/profileHandlers.ts`

**変更内容**:

- 3箇所の `identities ?? []` を `Array.isArray(identities) ? identities : []` に統一
- apiKeyHandlers.ts と同じバリデーションパターンを適用

**対象箇所**:

1. `profile:list` ハンドラ内の identities フォールバック
2. `profile:get` ハンドラ内の identities フォールバック
3. `profile:update` ハンドラ内の identities フォールバック

**理由**:

- `?? []` は null/undefined のみ対応し、非配列値（数値、文字列等）を通過させる
- `Array.isArray()` による型検証で全ての異常値を安全に処理

**依存関係**: なし（独立して実装可能）

**実装ステータス**: 完了（6テスト PASS）

## 並列実行可能性

```
Step 1 (apiKeyHandlers.ts)  ─────────────────────────>  完了
Step 2-4 (ApiKeysSection/index.tsx) ─────────────────>  完了
Step 5 (profileHandlers.ts) ─────────────────────────>  完了
```

- **Step 1**, **Step 2-4**, **Step 5** は異なるファイルを対象としており、相互依存がないため並列実行可能
- Step 3, Step 4 は Step 2 の変更を前提とした確認作業のため、Step 2 完了後に実施

## リスク評価

| Step   | リスク                             | 軽減策                                                                    | 結果     |
| ------ | ---------------------------------- | ------------------------------------------------------------------------- | -------- |
| Step 1 | 既存のレスポンス形式との互換性     | 既存テスト28件で回帰確認                                                  | 問題なし |
| Step 2 | フィルタ条件の過剰/不足            | GAP-TEST-03c（混在テスト）で網羅的に検証                                  | 問題なし |
| Step 5 | profileHandlers の既存動作への影響 | `?? []` と `Array.isArray` の動作差分は null/undefined 以外の非配列値のみ | 問題なし |

## 実装完了後の検証結果

| テストファイル                     | テスト数 | 結果         |
| ---------------------------------- | -------- | ------------ |
| ApiKeysSection.test.tsx            | 46       | ALL PASS     |
| apiKeyHandlers.list.test.ts        | 7        | ALL PASS     |
| profileHandlers.identities.test.ts | 6        | ALL PASS     |
| **合計**                           | **59**   | **ALL PASS** |

# 教訓記録 — TASK-TRACE-SKILL-AUTH-001

作成日: 2026-04-01

---

## バグ概要

| 項目       | 内容                                                                    |
| ---------- | ----------------------------------------------------------------------- |
| バグの種類 | スキル生成フローからの意図しない `auth:login` IPC 呼び出し（疑惑）      |
| 影響       | `auth:login` IPC の 5000ms タイムアウトによりスキル生成が失敗する可能性 |
| 最終結論   | **現行コードでは不要な呼び出し経路は確認できなかった**                  |

---

## 調査結果

### 根本原因

調査の結果、**現在のコードには** スキル生成ボタン押下 → `auth:login` の直接経路は存在しない。

`auth.login()` を呼ぶ箇所は 2つのみ:

- `AccountSection/index.tsx:230` — `handleLogin()` 経由（ユーザークリックのみ）
- `AuthView/index.tsx:82` — `handleLogin()` 経由（ユーザークリックのみ）

`SkillLifecyclePanel.handlePrepare → detectMode → planSkill` は `auth.login` を呼ばない。

### 潜在的なシナリオ（過去に発生した可能性）

1. **過去バージョンのコード**: 別タスクで既に修正済みの可能性
2. **`initializeAuth()` 無限ループ**: `App.tsx` の `useEffect` 依存配列変更時に発生する可能性（現在は非発生）
3. **認証セッション期限切れ**: ネットワーク切断などで `isAuthenticated` が false になり `AuthView` が表示され、ユーザーが誤操作するケース

### 追加の観測点

- 回帰テストは `SkillLifecyclePanel.auth-regression.test.tsx` で `window.electronAPI.auth.login` を直接モックし、
  `SkillLifecyclePanel` の作成フローが認証ログインを呼ばないことを確認している
- UI/UX の追加変更がないため、Phase 12 の実装ガイドではスクリーンショット参照を N/A とした

---

## 対策

### 実施した修正

1. **`authSlice.ts`**: `[TEMP DEBUG]` console.trace 2行を除去（Phase 3 ゲートで合意済み）
2. **テストファイル**: TC-01〜TC-08 による回帰テストを追加（TC-01/TC-03 が主要なガード）

### 主要なガードテスト

- **TC-03**: `mockAuthLogin` を never-resolving にした状態でスキル生成タイムアウトが発生しないことを確認するテスト。最も強力なリグレッション防止になる。

---

## 再発防止策

### テスト設計

1. **never-resolving mock パターン**: IPC 呼び出しが発生すれば必ずタイムアウトするテストで、呼び出し経路の有無を検証できる。`auth:login` のように副作用が大きい IPC に有効。

2. **data-testid を使ったクエリ**: 複数の同一ロールを持つ要素がある場合（複数テキストエリアなど）、`queryByRole()` は複数マッチで失敗する。`data-testid` を要素に付与することで安定したクエリが可能。

### デバッグコード管理

1. `[TEMP DEBUG]` タグを使ってデバッグコードを明示的にマーク
2. タスク仕様書に「Phase X 完了後に必ず削除すること」を明記
3. TC-04 のようなテストでデバッグコードの痕跡がないことを検証

### IPC タイムアウト問題の調査手順

```bash
# 1. login 関数の先頭に console.trace を挿入
#    [TEMP DEBUG] タグを付けて後で削除しやすくする
# 2. アプリを起動して問題の操作を実行
# 3. DevTools の Console でスタックトレースを確認
# 4. static analysis でコード上の呼び出し元を grep 確認
grep -r "auth\.login\|auth:login" apps/desktop/src/ --include="*.ts" --include="*.tsx"
```

### Vitest + ESM の注意点

- `require()` は Vitest の ESM 環境で使用不可。`await import()` を使うこと
- dynamic import を使う場合はテスト関数を `async` にすること
- `vi.mock()` はモジュールファクトリが `import` 前に評価される（hoisting）

### 親 lane canonical path 修正手順

1. `docs/30-workflows/skill-creator-agent-sdk-lane/index.md` の task 参照を更新対象にする
2. 移設先の canonical root を `../fix-step1-par-investigate-skill-auth-trigger/` に統一する
3. `phase-12-documentation.md` と `documentation-changelog.md` を same-wave で更新し、更新理由を残す
4. `rg -n "skill-creator-agent-sdk-lane/fix-step1-par-investigate-skill-auth-trigger"` で旧参照が残っていないことを確認する
5. ただし、完成済みタスクや履歴文書に残る旧 path は歴史的参照としてそのまま保持する

### UI 変更がない場合の screenshot 判定

- このタスクは renderer surface の見た目変更を伴わないため、Phase 12 の `implementation-guide.md` では screenshot 判定を `N/A` とした
- 手動テストは `outputs/phase-11/manual-test-result.md` の auto-test 等価記録で十分と判断した

---

## 調査ノウハウ

### `console.trace()` による Redux/Zustand thunk の追跡

```typescript
// Zustand action の先頭に挿入
actionName: async (...args) => {
  // [TEMP DEBUG] タスクID — 調査完了後に必ず削除すること
  console.trace("[TASK-ID] actionName が呼び出されました");
  // ... 本来のロジック
};
```

### useEffect 連鎖による副作用の検出

```typescript
// TC-07 パターン: 再レンダリング後に副作用が起きないことを確認
const { rerender } = render(<Component {...props} />);
await act(async () => {
  rerender(<Component {...props} newProp="changed" />);
});
await new Promise((resolve) => setTimeout(resolve, 300));
expect(mockSideEffect).not.toHaveBeenCalled();
```

---

_Phase 12 完了: 2026-04-01_

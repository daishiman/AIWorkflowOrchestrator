# UT-AUTH-MODE-UI-001: AuthModeSelector SettingsView組み込み

## メタ情報

```yaml
issue_number: 763
```

## メタ情報

| 項目             | 内容                                                   |
| ---------------- | ------------------------------------------------------ |
| タスクID         | UT-AUTH-MODE-UI-001                                    |
| タスク名         | AuthModeSelector SettingsView組み込み                  |
| 分類             | 機能追加                                               |
| 対象機能         | 認証モード選択UI                                       |
| 優先度           | 高                                                     |
| 見積もり規模     | 小（30分以内）                                         |
| ステータス       | **実装済み（バグ発見）**                               |
| 発見元           | TASK-AUTH-MODE-SELECTION-001 Phase 11 手動テスト準備時 |
| 発見日           | 2026-02-09                                             |
| セキュリティ影響 | なし                                                   |
| 関連タスク       | TASK-AUTH-MODE-SELECTION-001                           |

## 1. Why（なぜこのタスクが必要か）

### 問題

`AuthModeSelector` コンポーネントは作成済みだが、`SettingsView` に組み込まれておらず、ユーザーが認証方式を選択できない。

### 影響

- ユーザーがUIから認証方式（サブスクリプション/APIキー）を切り替えできない
- TASK-AUTH-MODE-SELECTION-001の完了条件「設定画面で認証方式を選択できる」が未達成
- 実装済みの認証基盤が利用不可能な状態

### 現状

```
AuthModeSelector.tsx ✅ 作成済み
authModeSlice.ts    ✅ 作成済み
IPC handlers        ✅ 作成済み
SettingsView組み込み ❌ 未実装
```

## 2. What（何を達成するか）

### ゴール

- `SettingsView` に `AuthModeSelector` コンポーネントを追加
- Zustand `authModeSlice` との連携
- 認証方式選択がUI上で動作する状態

### 変更箇所

```typescript
// apps/desktop/src/renderer/views/SettingsView/index.tsx
import { AuthModeSelector } from "../../components/settings/AuthModeSelector";

// SettingsCard内に追加
<SettingsCard
  title="認証方式"
  description="Claude Agent SDKの認証方式を選択します"
>
  <AuthModeSelector
    currentMode={authMode}
    onModeChange={setAuthMode}
  />
</SettingsCard>
```

## 3. How（どのように実装するか）

### Step 1: SettingsViewにAuthModeSelectorをimport

```typescript
import { AuthModeSelector } from "../../components/settings/AuthModeSelector";
```

### Step 2: authModeSliceからステートを取得

```typescript
const authMode = useAppStore((state) => state.authMode);
const setAuthMode = useAppStore((state) => state.setAuthMode);
```

### Step 3: UIセクションを追加

API Keys Settingsセクションの前に認証方式選択セクションを追加

### Step 4: 動作確認

- 設定画面を開く
- 認証方式セクションが表示される
- サブスクリプション/APIキーを切り替えできる

## 4. 完了条件

- [ ] `AuthModeSelector` が `SettingsView` にimportされている
- [ ] `authModeSlice` のステートと連携している
- [ ] 設定画面に「認証方式」セクションが表示される
- [ ] サブスクリプション/APIキーの切り替えがUI上で動作する
- [ ] `pnpm typecheck` がパス
- [ ] `pnpm lint` がパス
- [ ] 既存テストがPASS

## 5. リスクと対策

| リスク                   | 対策                               |
| ------------------------ | ---------------------------------- |
| authModeSliceの未export  | store/index.tsでの再exportを確認   |
| コンポーネントProp不一致 | 型定義を確認して正しいPropsを渡す  |
| スタイル崩れ             | 他のSettingsCardと同様の構造を使用 |

## 6. 検証方法

| テスト種別 | 検証内容                     | 実行コマンド            |
| ---------- | ---------------------------- | ----------------------- |
| 型チェック | TypeScript型エラーなし       | `pnpm typecheck`        |
| Lint       | ESLintエラーなし             | `pnpm lint`             |
| 単体テスト | 既存テストがPASS             | `pnpm test -- --run`    |
| 手動テスト | 認証方式切り替えがUI上で動作 | アプリ起動→設定画面確認 |

## 7. 参照

- 親タスク: `docs/30-workflows/completed-tasks/task-auth-mode-selection.md`
- AuthModeSelector: `apps/desktop/src/renderer/components/settings/AuthModeSelector/index.tsx`
- authModeSlice: `apps/desktop/src/renderer/store/slices/authModeSlice.ts`
- SettingsView: `apps/desktop/src/renderer/views/SettingsView/index.tsx`

## 8. 発見されたバグ

手動テスト（Phase 11）実施時に、設定画面で無限ループが発生するバグを発見。

### 関連タスク

- **UT-FIX-STORE-HOOKS-INFINITE-LOOP-001**: Zustand Store Hooks無限ループ修正
  - 場所: `docs/30-workflows/auth-mode-store-fix/task-ut-fix-store-hooks-infinite-loop.md`
  - 原因: useAuthModeStore()が毎回新しいオブジェクトを返すため、useEffectの依存配列に含めると無限ループ
  - 優先度: 緊急

### 実装確認（2026-02-10）

SettingsViewへのAuthModeSelector組み込みは以下のコミットで完了済み：

- `ca110f39` - fix(settings): AuthModeSelectorをSettingsViewに組み込み
- `f4df5ce3` - fix(auth): アプリ起動時のAuthModeハンドラー登録を追加

場所: **設定画面（SettingsView）** の「Claude Agent SDK 認証方式」セクション

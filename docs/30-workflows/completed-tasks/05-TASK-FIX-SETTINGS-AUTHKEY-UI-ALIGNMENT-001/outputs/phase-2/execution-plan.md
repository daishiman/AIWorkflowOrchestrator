# Phase 2: 実装計画

## タスク ID

TASK-FIX-SETTINGS-AUTHKEY-UI-ALIGNMENT-001

---

## 1. 実装順序

### Step 1: AuthKeySection コンポーネント作成

**目的**: authKey 入力・保存・削除・4状態表示の専用セクションを新規作成する

**対象ファイル**:

- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` (新規)

**作業内容**:

1. コンポーネントの骨格作成(Props なし、関数コンポーネント)
2. ローカル state 定義 (`inputValue`, `isSubmitting`, `showPassword`, `keyStatus`, `operationResult`)
3. 状態判定関数 `refreshStatus()` の実装
   - `useAuthModeStatus()` と `authKeyAPI.exists()` の結果から4状態を判定
4. 入力フォーム UI 実装
   - `type="password"` + マスクトグルボタン
   - `autoComplete="off"`
5. 保存ハンドラ `handleSave()` の実装
   - Renderer 側バリデーション(空文字列チェック)
   - `authKeyAPI.set()` 呼び出し
   - 成功/失敗後の inputValue クリアと状態リフレッシュ
6. 削除ハンドラ `handleDelete()` の実装
   - 確認ダイアログ(`window.confirm`)
   - `authKeyAPI.delete()` 呼び出し
   - 状態リフレッシュ
7. 4状態バッジ UI 実装(色・テキスト・アイコン)
8. 操作結果メッセージ表示
9. a11y 属性付与(`aria-label`, `aria-describedby`, `role="status"`)

**完了条件**:

- [ ] AuthKeySection が単独でレンダリングできること
- [ ] 4状態が正しく表示切替されること
- [ ] 保存・削除操作が正しくハンドリングされること

**想定工数**: 中

---

### Step 2: SettingsView への統合

**目的**: AuthKeySection を SettingsView に条件付きで組み込む

**対象ファイル**:

- `apps/desktop/src/renderer/components/settings/SettingsView/index.tsx` (既存・修正)

**作業内容**:

1. `AuthKeySection` の import 追加
2. AuthModeSelector セクション直下に条件付きレンダリングを追加:
   ```tsx
   {
     authMode === "api-key" && <AuthKeySection />;
   }
   ```
3. `useAuthMode()` セレクタが既に使われていることを確認(追加が必要なら追加)

**完了条件**:

- [ ] `authMode === 'api-key'` 時に AuthKeySection が表示されること
- [ ] `authMode !== 'api-key'` 時に AuthKeySection が非表示であること
- [ ] 既存の SettingsView レイアウトに影響がないこと

**想定工数**: 小

---

### Step 3: 4状態表示ロジック実装

**目的**: `auth-mode:status` と `auth-key:exists` の組み合わせで4状態を正しく判定する

**対象ファイル**:

- `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx` (Step 1 で作成済み)

**作業内容**:

1. `useEffect` でコンポーネントマウント時に `refreshStatus()` を呼び出し
2. `authModeStatus` 変更時の再判定トリガー設定
3. 各状態のバッジスタイル適用(Apple systemColors):
   - stored: `systemGreen` (ライト: #34C759 / ダーク: #30D158)
   - env-fallback: `systemOrange` (ライト: #FF9500 / ダーク: #FF9F0A)
   - not-set: `systemRed` (ライト: #FF3B30 / ダーク: #FF453A)
   - error: `secondaryLabel` (ライト: rgba(60,60,67,0.6) / ダーク: rgba(235,235,245,0.6))
4. 操作後(保存/削除)の状態再取得フロー確認

**完了条件**:

- [ ] 4状態が正しい条件で切り替わること
- [ ] 保存/削除操作後に状態が即座に更新されること
- [ ] IPC エラー時に error 状態になること

**想定工数**: 小 (Step 1 の一部として実装可能)

**備考**: Step 1 と Step 3 は実装上密結合のため、実際には Step 1 の中で同時に実装する。分離しているのは設計上の論理的な分割。

---

### Step 4: テスト作成

**目的**: AuthKeySection の単体テストと SettingsView の統合テスト拡充

**対象ファイル**:

- `apps/desktop/src/renderer/components/settings/AuthKeySection/__tests__/AuthKeySection.test.tsx` (新規)
- `apps/desktop/src/renderer/components/settings/SettingsView/__tests__/SettingsView.test.tsx` (既存・修正)

**作業内容**:

#### 4-1: AuthKeySection 単体テスト

1. テストセットアップ
   - `window.electronAPI.authKey` のモック定義
   - Zustand セレクタ(`useAuthMode`, `useAuthModeStatus`)のモック定義
   - `beforeEach` でモックリセット
2. テストケース実装(ownership-matrix.md 4.1 参照):
   - レンダリングテスト (1件)
   - 4状態表示テスト (4件)
   - 保存操作テスト (4件)
   - 削除操作テスト (3件)
   - セキュリティテスト (2件)
   - a11y テスト (1件)
   - エラーテスト (1件)
   - ローディングテスト (1件)

#### 4-2: SettingsView 統合テスト追加

1. `authMode === 'api-key'` 時の AuthKeySection 表示テスト
2. `authMode !== 'api-key'` 時の AuthKeySection 非表示テスト

**テスト環境の注意事項**:

- happy-dom 環境: `fireEvent` を使用(P39)
- 非同期ハンドラ: `await act(async () => { ... })` で包む
- テスト間リーク防止: `beforeEach` でモックリセット(P9)
- テスト実行: `cd apps/desktop && pnpm vitest run` で実行(P40)

**完了条件**:

- [ ] AuthKeySection の全テストケースが PASS すること
- [ ] SettingsView の追加テストケースが PASS すること
- [ ] 既存テストに影響がないこと

**想定工数**: 中

---

## 2. 実装順序の依存関係

```
Step 1 (AuthKeySection 作成)
  |
  +---> Step 2 (SettingsView 統合) -- Step 1 完了後に実行
  |
  +---> Step 3 (4状態ロジック) -- Step 1 と同時実装可能
          |
          +---> Step 4 (テスト作成) -- Step 1-3 完了後に実行
```

実際の実装では Step 1 + Step 3 を同時に進め、その後 Step 2、最後に Step 4 の順序で実行する。

---

## 3. Phase マッピング

| 実装 Step                 | Phase 4 (テスト作成) | Phase 5 (実装)     | Phase 6 (テスト拡充) |
| ------------------------- | -------------------- | ------------------ | -------------------- |
| Step 1: AuthKeySection    | テストケース設計     | コンポーネント実装 | -                    |
| Step 2: SettingsView 統合 | 統合テスト設計       | JSX 修正           | -                    |
| Step 3: 4状態ロジック     | 状態判定テスト設計   | ロジック実装       | エッジケース追加     |
| Step 4: テスト作成        | -                    | -                  | カバレッジ不足補完   |

---

## 4. リスク分析

| リスク                                                                  | 影響度 | 発生確率 | 対策                                                              |
| ----------------------------------------------------------------------- | ------ | -------- | ----------------------------------------------------------------- |
| `useAuthModeStatus` と `authKeyAPI.exists()` の呼び出しタイミング不整合 | 中     | 低       | refreshStatus 内で sequential に呼び出し、両方完了後に判定        |
| 既存 SettingsView テストへの影響                                        | 低     | 低       | AuthKeySection のモックを追加するのみ                             |
| happy-dom での fireEvent 挙動差異                                       | 中     | 低       | P39 対策済み。act() で非同期処理を包む                            |
| authModeStatus の初期値が未確定な状態でのレンダリング                   | 低     | 中       | 初期状態は "not-set" をデフォルトとし、refreshStatus 完了後に更新 |

---

## 5. 変更ファイル一覧(最終)

| ファイル                                                                                         | 操作 | 変更量                |
| ------------------------------------------------------------------------------------------------ | ---- | --------------------- |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/index.tsx`                         | 新規 | 約150-200行           |
| `apps/desktop/src/renderer/components/settings/SettingsView/index.tsx`                           | 修正 | 約5行(import + JSX)   |
| `apps/desktop/src/renderer/components/settings/AuthKeySection/__tests__/AuthKeySection.test.tsx` | 新規 | 約200-300行           |
| `apps/desktop/src/renderer/components/settings/SettingsView/__tests__/SettingsView.test.tsx`     | 修正 | 約20-30行(テスト追加) |

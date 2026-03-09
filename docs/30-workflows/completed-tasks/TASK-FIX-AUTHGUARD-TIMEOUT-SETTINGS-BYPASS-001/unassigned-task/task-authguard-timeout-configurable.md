# UT-AUTHGUARD-TIMEOUT-CONFIGURABLE-001 AuthGuard タイムアウト時間の設定可能化 - タスク指示書

## メタ情報

```yaml
issue_number: 1121
```

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | UT-AUTHGUARD-TIMEOUT-CONFIGURABLE-001                   |
| タスク名     | AuthGuard タイムアウト時間の設定可能化                  |
| 分類         | 改善                                                    |
| 対象機能     | AuthGuard タイムアウト設定                              |
| 優先度       | 低（P4）                                                |
| 見積もり規模 | 小規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 Phase 12 |
| 発見日       | 2026-03-10                                              |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 で AuthGuard に 10 秒タイムアウト（`AUTH_TIMEOUT_MS = 10_000`）とフォールバック UI を実装した。現在このタイムアウト値はソースコード内にハードコードされており、ユーザーが変更する手段がない。ネットワーク環境やサーバー応答時間によって最適なタイムアウト値は異なるため、設定可能にすることでユーザー体験を改善できる。

### 1.2 問題点・課題

- 低速ネットワーク環境（衛星回線、モバイルテザリング等）では 10 秒で誤ってタイムアウトし、認証が完了していないにもかかわらずフォールバック UI に遷移してしまう
- 高速ネットワーク環境（ローカル開発、高速光回線等）では 10 秒の待ちが不要に長く、認証失敗の検出が遅れる
- ユーザーごとの環境差異に対応できない

### 1.3 放置した場合の影響

ユーザー体験の最適化ができない。ただし、現状の 10 秒タイムアウトで基本的なユースケース（一般的な家庭・オフィスのネットワーク環境）は十分に機能するため、緊急性は低い。

## 2. 何を達成するか（What）

### 2.1 目的

`AUTH_TIMEOUT_MS` を Settings 画面から設定可能にし、ユーザーが自身のネットワーク環境に合わせてタイムアウト値を調整できるようにする。

### 2.2 最終ゴール

Settings 画面にタイムアウト設定フィールドが存在し、変更した値が永続化され、AuthGuard のタイムアウト判定に動的に反映される。

### 2.3 スコープ

#### 含むもの

- Settings UI にタイムアウト設定フィールド（数値入力）を追加する
- authModeSlice に `authTimeoutMs` フィールドを追加し、Zustand persist で永続化する
- `useAuthState` フックで Store から `authTimeoutMs` を動的に読み取り、タイムアウト判定に使用する
- `getAuthState` 関数の `AUTH_TIMEOUT_MS` 定数をストア値に置換する
- 入力バリデーション（最小値 3000ms、最大値 60000ms）
- デフォルト値 10000ms の設定

#### 含まないもの

- サーバー側のタイムアウト調整
- safeInvoke のタイムアウト設定（TASK-FIX-SAFEINVOKE-TIMEOUT-001 のスコープ）
- ネットワーク速度の自動検出による動的調整

### 2.4 成果物

- `apps/desktop/src/renderer/store/slices/authModeSlice.ts` — `authTimeoutMs` フィールド追加
- `apps/desktop/src/renderer/views/SettingsView/index.tsx` — タイムアウト設定 UI フィールド追加
- `apps/desktop/src/renderer/hooks/useAuthState.ts` — 動的タイムアウト読み取り対応
- `apps/desktop/src/renderer/components/AuthGuard/getAuthState.ts` — Store 値への切り替え
- 各変更に対応するテストファイル

## 3. どのように実行するか（How）

### 3.1 前提条件

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 が完了済みであること（AuthGuard タイムアウト + フォールバック UI + Settings バイパスが実装済み）。

### 3.2 依存タスク

なし（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 完了済み）。

### 3.3 必要な知識

- Zustand persist ミドルウェア（migrate 関数によるスキーマバージョニング）
- React フォーム（数値入力、バリデーション）
- Apple HIG（Settings UI のレイアウト・間隔・ラベル設計）
- P13 準拠のタイマーテスト手法

### 3.4 推奨アプローチ

1. `authModeSlice` に `authTimeoutMs: number` フィールド（デフォルト 10000）を追加する
2. Zustand persist の `migrate` 関数でバージョンアップし、既存ユーザーにデフォルト値を設定する
3. 個別セレクタ `useAuthTimeoutMs()` と `useSetAuthTimeoutMs()` を作成する
4. Settings UI に数値入力フィールドを追加する（最小 3000ms、最大 60000ms、ステップ 1000ms）
5. `useAuthState` フックで `useAuthTimeoutMs()` から値を読み取り、`setTimeout` のタイムアウト値に使用する
6. `getAuthState` の `AUTH_TIMEOUT_MS` 定数参照を動的値に置換する

## 4. 実行手順

### Phase 1: 要件定義

authModeSlice の現在の persist スキーマバージョンを確認し、`authTimeoutMs` フィールドの追加に伴うマイグレーション要件を整理する。Settings UI の配置位置（認証セクション内）を決定する。

### Phase 2: 設計

authModeSlice のフィールド追加、個別セレクタの設計、Settings UI コンポーネントの配置設計、useAuthState のタイムアウト値動的化に伴う useEffect 依存配列の設計を行う。

### Phase 3: 設計レビュー

設計の妥当性を検証する。特に useEffect 依存配列にタイムアウト値を含めた場合のタイマーリセットロジックの正当性を確認する。

### Phase 4: テスト作成

authModeSlice の `authTimeoutMs` フィールドのテスト、Settings UI の入力バリデーションテスト、useAuthState の動的タイムアウトテストを作成する。

### Phase 5: 実装

authModeSlice、個別セレクタ、Settings UI フィールド、useAuthState の動的タイムアウト対応を実装する。

### Phase 6-7: テスト拡充・カバレッジ確認

カバレッジ不足箇所のテスト追加。Branch Coverage 80% 以上を確認する。

### Phase 8: リファクタリング

コード品質改善。定数 `AUTH_TIMEOUT_MS` の残存参照がないことを確認する。

### Phase 9: 品質検証

`pnpm lint`、`pnpm typecheck`、全テスト実行で品質基準を満たすことを確認する。

### Phase 10: 最終レビュー

多角的品質・整合性検証を実施する。

### Phase 11: 手動テスト

Settings 画面でタイムアウト値を変更し、AuthGuard のタイムアウト挙動が変わることを確認する。

### Phase 12: ドキュメント

実装ガイド・システム仕様更新・未タスク検出を実施する。

### Phase 13: 完了

成果物最終確認・PR 準備を行う。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] Settings UI にタイムアウト設定フィールドが表示される
- [ ] 入力値が 3000ms 未満または 60000ms 超過の場合にバリデーションエラーが表示される
- [ ] 設定値がアプリ再起動後も永続化される（Zustand persist）
- [ ] AuthGuard のタイムアウト判定が設定値を使用する
- [ ] デフォルト値（10000ms）が既存ユーザーに自動設定される（migrate 関数）

### 品質要件

- [ ] Branch Coverage 80% 以上を達成する
- [ ] `pnpm lint` が PASS する
- [ ] `pnpm typecheck` が PASS する
- [ ] 全テストが PASS する

### ドキュメント要件

- [ ] architecture-auth-security.md の AuthGuard タイムアウトフォールバック セクションを更新する
- [ ] 変更履歴へ記録を追記する

## 6. 検証方法

### テストケース

- authModeSlice: `authTimeoutMs` のデフォルト値、セッター、persist/migrate のテスト
- Settings UI: 数値入力フィールドの表示、バリデーション（範囲外、非数値）、値変更の Store 反映テスト
- useAuthState: 動的タイムアウト値でのタイムアウト発火テスト、値変更時のタイマーリセットテスト

### 検証手順

1. `cd apps/desktop && pnpm vitest run` で全テスト PASS を確認する
2. Settings 画面でタイムアウト値を 5000ms に変更し、認証ハングシナリオで 5 秒後にフォールバック UI に遷移することを確認する
3. タイムアウト値を 30000ms に変更し、同シナリオで 30 秒後にフォールバック UI に遷移することを確認する
4. アプリを再起動し、設定値が維持されていることを確認する

## 7. リスクと対策

| リスク                                                               | 影響度 | 発生確率 | 対策                                                                                                       |
| -------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------- |
| useEffect 依存配列にタイムアウト値を含めた際のタイマーリセット複雑化 | 中     | 高       | タイムアウト値変更時に既存タイマーを clearTimeout し、新しい値で再設定するクリーンアップロジックを実装する |
| Zustand persist の migrate 関数でのデフォルト値設定漏れ              | 中     | 中       | migrate 関数のテストで既存状態からの移行を明示的に検証する                                                 |
| P13 タイマーテスト無限ループ                                         | 低     | 中       | `vi.advanceTimersByTime()` のみ使用し、`vi.runAllTimers()` を使用禁止とする                                |
| 極端な値（3000ms）での誤タイムアウト頻発                             | 低     | 低       | UI に推奨値の説明テキスト（「推奨: 10000ms」）を表示する                                                   |

## 8. 参照情報

### 関連ドキュメント

- TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 の実装成果物
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` — AuthGuard タイムアウトフォールバック セクション
- `.claude/rules/06-known-pitfalls.md` — P13（タイマーテスト無限ループ）、P31（Zustand Store Hooks 無限ループ）、P48（useShallow 未適用）

### 参考資料

- `apps/desktop/src/renderer/hooks/useAuthState.ts` — 現在のタイムアウト実装
- `apps/desktop/src/renderer/components/AuthGuard/getAuthState.ts` — `AUTH_TIMEOUT_MS` 定数定義
- `apps/desktop/src/renderer/store/slices/authModeSlice.ts` — persist 設定・migrate 関数
- `apps/desktop/src/renderer/views/SettingsView/index.tsx` — Settings UI

## 9. 備考

### 実装で苦戦が予想される箇所

本タスクの親タスク（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001）の実装で得られた教訓を以下に記載する。同種課題の簡潔な解決のために、必ず事前に確認すること。

#### 9.1 P13 準拠のタイマーテスト

AuthGuard のタイムアウトは `setTimeout` + Promise の組み合わせで実装されている。テストで `vi.runAllTimers()` を使用すると、Promise の再スケジュールにより無限ループが発生する。必ず `vi.advanceTimersByTime(ms)` で 1 ステップずつ時間を進めること。

```typescript
// 使用禁止: 無限ループの原因
vi.runAllTimers();
vi.runAllTimersAsync();

// 正しい方法: 指定時間だけ進める
vi.useFakeTimers();
vi.advanceTimersByTime(10_000); // 10秒進める
await vi.advanceTimersByTimeAsync(10_000); // 非同期版
```

#### 9.2 getAuthState の判定優先順位

`getAuthState` 関数内の条件分岐では、`isTimedOut && isLoading` を最優先で判定する必要がある。この優先順位を下げると、タイムアウト後に `isLoading: true` が継続している状態で「ローディング中」と判定され、フォールバック UI への自動遷移が壊れる。

```typescript
// 正しい優先順位
if (isTimedOut && isLoading) return "timedOut"; // 最優先
if (isLoading) return "loading";
if (isAuthenticated) return "authenticated";
return "unauthenticated";
```

#### 9.3 動的値の useEffect 依存配列

タイムアウト値が Store から動的に読み取られるようになると、`useEffect` の依存配列に `authTimeoutMs` を含める必要がある。値が変更されるたびにタイマーがリセットされるため、以下の点に注意する。

1. `clearTimeout` によるクリーンアップ関数を `useEffect` の return で返す
2. タイムアウト値変更時に `isTimedOut` 状態をリセットする
3. 値変更が頻繁に発生する場合（スライダー UI 等）は debounce を検討する

```typescript
const authTimeoutMs = useAuthTimeoutMs();

useEffect(() => {
  if (!isLoading) return;

  setIsTimedOut(false); // 値変更時にリセット
  const timer = setTimeout(() => {
    setIsTimedOut(true);
  }, authTimeoutMs);

  return () => clearTimeout(timer); // クリーンアップ
}, [isLoading, authTimeoutMs]);
```

#### 9.4 Zustand persist との統合

`authTimeoutMs` を persist 対象にする場合、既存ユーザーの Store には `authTimeoutMs` フィールドが存在しない。`migrate` 関数でバージョンを上げ、デフォルト値を設定する必要がある。

```typescript
persist(
  (set, get) => ({
    // ...既存フィールド
    authTimeoutMs: 10_000, // デフォルト値
  }),
  {
    name: "auth-mode-store",
    version: 2, // バージョンアップ
    migrate: (persistedState, version) => {
      if (version < 2) {
        return {
          ...persistedState,
          authTimeoutMs: 10_000, // 既存ユーザーにデフォルト値を設定
        };
      }
      return persistedState;
    },
  },
);
```

migrate 関数のテストでは、旧バージョンの状態オブジェクトを入力として、`authTimeoutMs` が正しく追加されることを検証する。

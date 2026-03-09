# UT-BLOCKING-TIMEOUT-PATTERN-001 ブロッキングコンポーネント・タイムアウトパターンのカスタムHook抽出 - タスク指示書

## メタ情報

```yaml
issue_number: 1122
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-BLOCKING-TIMEOUT-PATTERN-001                                      |
| タスク名     | ブロッキングコンポーネント・タイムアウトパターンのカスタムHook抽出   |
| 分類         | リファクタリング                                                     |
| 対象機能     | AuthGuard タイムアウトロジック / 汎用カスタムHook                    |
| 優先度       | 中（P3）                                                             |
| 見積もり規模 | 小規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 Phase 12 未タスク検出 |
| 発見日       | 2026-03-10                                                           |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 で AuthGuard にタイムアウト機構を実装した。確立したパターン（useState + useEffect + setTimeout + 純粋関数判定）は、他のブロッキングコンポーネント（データローディング画面、外部サービス接続待機等）にも適用可能である。現在このロジックは useAuthState にハードコードされている。

### 1.2 問題点・課題

同じタイムアウトパターンを別のコンポーネントに実装する際、useAuthState からコピペする必要がある。DRY 原則に反し、タイマークリーンアップ漏れや状態遷移優先順位の誤りといったバグの温床になる。

### 1.3 放置した場合の影響

類似パターンの実装時に毎回同じ設計判断（タイムアウトロジック、状態遷移優先順位、タイマークリーンアップ）をゼロから行う必要がある。特に useEffect クリーンアップの確実性や isBlocking の高速トグル対策（false→true→false）は、経験がなければ見落としやすい。

## 2. 何を達成するか（What）

### 2.1 目的

`useTimeout` カスタムHookとして汎用タイムアウトパターンを抽出し、useAuthState をリファクタリングする。

### 2.2 最終ゴール

useTimeout Hook が独立したモジュールとして存在し、useAuthState がそれを利用する形にリファクタリングされ、既存テスト104件が全 PASS する。

### 2.3 スコープ

#### 含むもの

- `useTimeout(isBlocking: boolean, timeoutMs: number): boolean` カスタムHook作成
- useAuthState を useTimeout を使うようにリファクタリング
- useTimeout Hook 単体テスト
- useAuthState 回帰テスト確認
- JSDoc/TSDoc ドキュメント

#### 含まないもの

- 他のコンポーネントへの useTimeout 適用（後続タスクで個別対応）
- getAuthState の汎用化（判定ロジックはドメイン固有のため対象外）

### 2.4 成果物

- `apps/desktop/src/renderer/hooks/useTimeout.ts`（新規カスタムHook）
- `apps/desktop/src/renderer/hooks/__tests__/useTimeout.test.ts`（Hook単体テスト）
- `apps/desktop/src/renderer/components/AuthGuard/useAuthState.ts`（useTimeout を使うようにリファクタリング）

## 3. どのように実行するか（How）

### 3.1 前提条件

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 が完了済みであること。

### 3.2 依存タスク

なし（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 完了済み）。

### 3.3 必要な知識

- React カスタムHook設計パターン
- useEffect + setTimeout のクリーンアップパターン
- P5: React StrictMode の二重実行でのリスナー/タイマー管理
- P13: タイマーテストで `vi.advanceTimersByTime()` 必須（`vi.runAllTimers()` は無限ループリスク）
- P31: Zustand 個別セレクタパターン（useTimeout 自体は Store に依存しない）
- P39: happy-dom 環境では fireEvent を使用（userEvent 禁止）

### 3.4 推奨アプローチ

1. useAuthState のタイムアウトロジック（L50-61 付近）を `useTimeout` Hook として抽出する
2. useTimeout の API: `const isTimedOut = useTimeout(isLoading, AUTH_TIMEOUT_MS)`
3. useAuthState を `useTimeout` を呼び出す形にリファクタリングする
4. 既存テスト104件が全 PASS することを確認する（回帰テスト）

## 4. 実行手順

### Phase構成

テスト設計（TDD） → 実装 → リファクタリング → カバレッジ確認。

### Phase 1: 要件定義

#### 目的

useTimeout の API 設計と受け入れ基準を定義する。

#### 手順

1. useAuthState の現在のタイムアウトロジックを分析する。
2. useTimeout の引数・戻り値・副作用を定義する。
3. 受け入れ基準をチェックリスト形式で明確にする。

#### 成果物

useTimeout の API 仕様（引数: `isBlocking: boolean`, `timeoutMs: number` / 戻り値: `isTimedOut: boolean`）。

#### 完了条件

API 仕様が明確に定義されている。

### Phase 2: 設計

#### 目的

Hook のインターフェース設計と useAuthState のリファクタリング計画を策定する。

#### 手順

1. useTimeout の内部状態遷移を設計する（isBlocking の変化に対する isTimedOut の遷移）。
2. useAuthState から抽出するロジックと残すロジックの境界を明確にする。
3. getAuthState との責務分離を維持する設計を確認する。

#### 成果物

Hook のインターフェース設計書と useAuthState リファクタリング計画。

#### 完了条件

useTimeout と useAuthState/getAuthState の責務分離が明確になっている。

### Phase 3: 設計レビュー

### Phase 4: テスト作成（TDD）

#### 目的

useTimeout Hook の単体テストを先に作成する。

#### 手順

1. タイムアウト発動テスト: isBlocking=true の状態で timeoutMs 経過後に isTimedOut=true になる。
2. isBlocking=false でリセットテスト: isBlocking が false になると isTimedOut が false にリセットされる。
3. タイマークリーンアップテスト: コンポーネントアンマウント時にタイマーがクリアされる。
4. isBlocking 高速トグルテスト: false→true→false の高速切替で誤発動しない。
5. 境界値テスト: timeoutMs=0 の場合の挙動。
6. React StrictMode 二重実行テスト: P5 準拠でクリーンアップが正しく動作する。

#### 成果物

`apps/desktop/src/renderer/hooks/__tests__/useTimeout.test.ts`。

#### 完了条件

テストファイルが作成され、Red 状態（実装前のため失敗）を確認できる。

### Phase 5: 実装

#### 目的

useTimeout Hook を作成し、useAuthState をリファクタリングする。

#### 手順

1. `apps/desktop/src/renderer/hooks/useTimeout.ts` を作成する。
2. useState + useEffect + setTimeout パターンを実装する。
3. useEffect のクリーンアップで clearTimeout を返す。
4. useAuthState からタイムアウトロジックを削除し、useTimeout を呼び出す形に変更する。
5. 全テストが Green になることを確認する。

#### 成果物

useTimeout.ts（新規）、useAuthState.ts（リファクタリング済み）。

#### 完了条件

useTimeout 単体テストと既存 AuthGuard テスト104件が全 PASS する。

### Phase 6-7: テスト拡充・カバレッジ確認

#### 目的

カバレッジ基準（Line 80%、Branch 60%、Function 80%）の充足を確認する。

### Phase 8: リファクタリング

### Phase 9: 品質検証

#### 手順

1. `pnpm lint` で Lint チェック。
2. `pnpm typecheck` で型チェック。
3. 関連テスト全 PASS 確認。

### Phase 10-13: 最終レビュー～完了

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `useTimeout(isBlocking, timeoutMs)` カスタムHookが作成されている
- [ ] useAuthState が useTimeout を使用する形にリファクタリングされている
- [ ] isBlocking=true で timeoutMs 経過後に isTimedOut=true が返される
- [ ] isBlocking=false で isTimedOut が false にリセットされる
- [ ] コンポーネントアンマウント時にタイマーがクリアされる

### 品質要件

- [ ] useTimeout 単体テストが10件以上 PASS する
- [ ] 既存 AuthGuard テスト104件が全 PASS する（回帰テスト）
- [ ] `pnpm typecheck` が PASS する
- [ ] `pnpm lint` が PASS する
- [ ] P5/P13/P31/P39 準拠である

### ドキュメント要件

- [ ] JSDoc/TSDoc が useTimeout に記載されている
- [ ] 変更履歴にリファクタリング内容を追記している

## 6. 検証方法

### テストケース

- `cd apps/desktop && pnpm vitest run src/renderer/hooks/__tests__/useTimeout.test.ts`
- `cd apps/desktop && pnpm vitest run src/renderer/components/AuthGuard/`

### 検証手順

1. useTimeout 単体テストを実行して全 PASS を確認する。
2. AuthGuard 関連テスト（6ファイル104テスト）を実行して全 PASS を確認する（回帰テスト）。
3. `pnpm typecheck` で型整合性を確認する。
4. タイマーテストは `vi.useFakeTimers()` + `vi.advanceTimersByTime()` で検証する（P13 準拠）。

## 7. リスクと対策

| リスク                                                                | 影響度 | 発生確率 | 対策                                                                                           |
| --------------------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------------------------------- |
| useTimeout の汎用化により useAuthState のロジックが分散して可読性低下 | 低     | 中       | useAuthState のコメントで useTimeout の役割を明記する                                          |
| useTimeout の API が将来の要件に適合しない                            | 低     | 低       | 最小限の API から始め、必要に応じて拡張する（YAGNI 原則）                                      |
| isBlocking の高速トグルでタイマークリーンアップ漏れ                   | 中     | 中       | useEffect の依存配列に isBlocking を含め、変更時に前タイマーをクリアする設計をテストで検証する |
| React StrictMode の二重実行でタイマー二重登録                         | 中     | 中       | P5 準拠で useEffect クリーンアップが正しく動作することをテストで検証する                       |

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`: AuthGuard タイムアウトフォールバック セクション
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`: TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 教訓セクション
- `.claude/skills/skill-creator/references/patterns.md`: ブロッキングコンポーネント・タイムアウトパターン

### 参考資料

- `apps/desktop/src/renderer/components/AuthGuard/useAuthState.ts`: タイムアウトロジック抽出元（L50-61 付近）
- `apps/desktop/src/renderer/components/AuthGuard/getAuthState.ts`: 判定ロジック（汎用化対象外）
- `.claude/rules/06-known-pitfalls.md`: P5, P13, P31, P39

## 9. 備考

### TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 で得た教訓

- **教訓1（useEffect クリーンアップの確実性）**: setTimeout のクリーンアップが漏れるとメモリリーク。useTimeout では `return () => clearTimeout(timer)` を必ず返す。React StrictMode の二重実行（P5）でもクリーンアップが正しく動作することをテストで検証する
- **教訓2（isBlocking の高速トグル対策）**: isBlocking が短時間に false→true→false と切り替わった場合、前のタイマーがクリアされないとタイムアウトが誤発動する。useEffect の依存配列に isBlocking を含め、変更時に前タイマーをクリアする設計が必須
- **教訓3（P13 タイマーテストの注意点）**: `vi.runAllTimers()` は setTimeout が再スケジュールされる場合に無限ループする。必ず `vi.advanceTimersByTime(ms)` で制御すること
- **教訓4（getAuthState との責務分離）**: useTimeout は「タイムアウト検知」のみ。「タイムアウト状態と他の状態の組み合わせ判定」はドメイン固有（getAuthState）に留める。この責務分離を崩すと汎用性が失われる
- **教訓5（テストでの act() ラッピング）**: renderHook でタイマーを進める場合、`act(() => { vi.advanceTimersByTime(ms) })` で包まないと React state 更新の warning が出る

### 同種課題の5分解決カード

```
症状: 複数コンポーネントで同じタイムアウトパターンを実装している
根本原因: タイムアウトロジックがドメインコンポーネントにハードコード
5手順:
  1. useTimeout(isBlocking, timeoutMs) Hook を作成
  2. useState(false) + useEffect + setTimeout パターンを抽出
  3. クリーンアップ（clearTimeout）を確実に返す
  4. 既存コンポーネントを useTimeout に置換
  5. P13準拠テスト: advanceTimersByTime で検証
検証ゲート: Hook単体テスト + 既存テスト全PASS
```

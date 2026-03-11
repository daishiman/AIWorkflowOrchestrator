# [#1120] "[UT-AUTHGUARD-FALLBACK-UX-001] AuthTimeoutFallback UX改善（アニメーション・進捗表示）"

## メタ情報

```yaml
task_id: UT-AUTHGUARD-FALLBACK-UX-001
task_name: AuthTimeoutFallback UX改善（アニメーション・進捗表示）
category: 改善
target_feature: AuthGuard / LoadingScreen / AuthTimeoutFallback
priority: 低（P4）
scale: 小規模
status: 未実施
source_phase: TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 Phase 12
created_date: 2026-03-10
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-authguard-fallback-ux-enhancement.md
```

| 項目       | 内容     |
| ---------- | -------- |
| 優先度     | 低（P4） |
| 規模       | 小規模   |
| ステータス | 未実施   |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 で AuthGuard に10秒タイムアウトとフォールバックUIを実装した。現在の AuthTimeoutFallback は静的なUIであり、タイムアウト発生時にユーザーに「何が起きているか」「どのくらい待てばいいか」の情報が不足している。

### 1.2 問題点・課題

10秒間のローディング表示から突然フォールバック表示に遷移する現在の挙動は、ユーザーに不安を与える。プログレスバーやカウントダウンがないため、待ち時間の見通しが立たない。また、フォールバック画面への遷移にアニメーションがないため、画面切り替えが唐突に感じられる。

### 1.3 放置した場合の影響

機能的には問題ない。ただし、ユーザー体験が最適でなく、Apple HIG の「フィードバック原則」（すべての操作にフィードバックを提供する）に完全準拠していない状態が継続する。

## 2. 何を達成するか（What）

### 2.1 目的

タイムアウトまでのカウントダウン表示、フォールバック表示時のフェードインアニメーション、リトライ中のスピナー表示を追加し、AuthGuard 周辺のUX品質を Apple HIG 水準に引き上げる。

### 2.2 最終ゴール

認証タイムアウト発生時にユーザーが「現在の状態」と「残り待ち時間」を把握でき、フォールバック画面へのスムーズな遷移を体験できる状態。

### 2.3 スコープ

#### 含むもの

- LoadingScreen にプログレスバー（10秒カウントダウン）を追加する
- AuthTimeoutFallback のフェードインアニメーション（200-300ms、Apple HIG推奨範囲）を追加する
- リトライボタン押下時のローディングスピナーを追加する
- アニメーションの `prefers-reduced-motion` 対応（WCAG 2.1 AA）を実装する
- ダーク/ライト両モードでの表示確認と調整を行う

#### 含まないもの

- タイムアウト時間の変更（UT-AUTHGUARD-TIMEOUT-CONFIGURABLE-001 で対応）
- AuthGuard のロジック変更（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 で完了済み）
- 認証フロー自体の改善

### 2.4 成果物

- 更新された LoadingScreen コンポーネント（プログレスバー追加）
- 更新された AuthTimeoutFallback コンポーネント（フェードインアニメーション追加）
- CSSアニメーション定義（Tailwind カスタムアニメーション）
- 対応するユニットテスト

## 3. どのように実行するか（How）

### 3.1 前提条件

TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 が完了済みであること。AuthGuard のタイムアウト機構と AuthTimeoutFallback コンポーネントが実装済みであること。

### 3.2 依存タスク

なし（TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 完了済み）。

### 3.3 必要な知識

- CSS transitions/animations（Tailwind カスタムアニメーション定義）
- React state 管理（useState / useEffect でのプログレス制御）
- Apple HIG Motion guidelines（200-300ms、目的を持ったアニメーション）
- WCAG 2.1 AA（prefers-reduced-motion 対応）
- P13（タイマーテストでは `advanceTimersByTime` を使用）
- P39（happy-dom 環境では `fireEvent` を使用、`userEvent` 禁止）
- P47（CSS変数ベースのスタイルテストアサーション戦略）

### 3.4 推奨アプローチ

1. LoadingScreen に `useAuthState` からの経過時間を表示するプログレスバーを追加する
2. AuthTimeoutFallback に Tailwind CSS のカスタムアニメーション（`animate-fadeIn`）を追加する
3. `onRetry` コールバックにローディング状態管理を追加する
4. `@media (prefers-reduced-motion: reduce)` でアニメーション無効化を実装する
5. アニメーション関連の色・時間を CSS 変数で管理し、テスト時は定数を import して期待値を生成する（P47準拠）

## 4. 実行手順

### Phase構成

Phase 1（要件定義）→ Phase 2（設計）→ Phase 3（設計レビュー）→ Phase 4（テスト作成）→ Phase 5（実装）→ Phase 6-7（テスト拡充・カバレッジ確認）→ Phase 8-9（リファクタリング・品質検証）→ Phase 10（最終レビュー）→ Phase 11（手動テスト）→ Phase 12（ドキュメント）→ Phase 13（完了）

### Phase 1: 要件定義

#### 目的

プログレスバー・アニメーションの詳細要件を定義する。

#### 手順

1. 現在の AuthTimeoutFallback と LoadingScreen の実装を確認する。
2. Apple HIG Motion guidelines に基づくアニメーション仕様を定義する。
3. prefers-reduced-motion 対応の要件を明確化する。
4. ダーク/ライト両モードのカラー仕様を定義する。

#### 成果物

アニメーション仕様書（タイミング・イージング・カラー定義）。

#### 完了条件

全アニメーション要素のタイミング・イージング・色がダーク/ライト両モードで定義されている。

### Phase 2: 設計

#### 目的

コンポーネント構造とアニメーション実装方針を設計する。

#### 手順

1. プログレスバーコンポーネントの設計（LoadingScreen への統合方針）。
2. フェードインアニメーションの Tailwind カスタム定義を設計する。
3. リトライスピナーの状態管理設計を行う。
4. CSS変数によるスタイル管理方針を定義する（P47準拠）。

#### 成果物

コンポーネント設計書。

#### 完了条件

プログレスバー・フェードイン・スピナーの実装方針が確定している。

### Phase 4-5: テスト作成・実装

#### 目的

テストファーストで各UIコンポーネントを実装する。

#### 手順

1. プログレスバーの進行テストを作成する（`vi.advanceTimersByTime` 使用、P13準拠）。
2. フェードインアニメーションの最終状態テストを作成する（happy-dom では `fireEvent` 使用、P39準拠）。
3. リトライスピナーの表示/非表示テストを作成する。
4. prefers-reduced-motion テストを作成する。
5. 各コンポーネントを実装する。

#### 成果物

テストファイル・更新されたコンポーネントファイル。

#### 完了条件

全テストが PASS し、既存テスト104件に影響がない。

## 5. 完了条件チェックリスト

### 機能要件

- [ ] プログレスバーが10秒間で0%から100%に進行する
- [ ] フォールバック画面がフェードインで表示される（200-300ms）
- [ ] リトライボタン押下中にスピナーが表示される
- [ ] `prefers-reduced-motion: reduce` でアニメーションが無効化される
- [ ] ダーク/ライト両モードで正常に表示される

### 品質要件

- [ ] 既存テスト104件が全て PASS する
- [ ] 新規テストが全て PASS する
- [ ] アニメーション時間が Apple HIG 推奨範囲（200-300ms）に収まっている
- [ ] WCAG 2.1 AA コントラスト比を満たしている

### ドキュメント要件

- [ ] 変更履歴へUX改善の記録を追記する

## 6. 検証方法

### テストケース

- プログレスバーテスト: `vi.useFakeTimers()` + `vi.advanceTimersByTime(1000)` で1秒ごとの進行を検証する
- フェードインテスト: アニメーション完了後の最終状態（opacity: 1）をアサートする
- リトライスピナーテスト: `fireEvent.click(retryButton)` 後にスピナー要素の存在を検証する
- prefers-reduced-motion テスト: メディアクエリをモックしてアニメーション無効化を検証する

### 検証手順

1. `cd apps/desktop && pnpm vitest run src/renderer/components/AuthGuard/` で関連テストを実行する。
2. ダークモード/ライトモードの両方で視覚的な表示を確認する。
3. macOS のアクセシビリティ設定「視差効果を減らす」有効時の挙動を確認する。

## 7. リスクと対策

| リスク                                                    | 影響度 | 発生確率 | 対策                                                                                    |
| --------------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------- |
| happy-dom でCSSアニメーションが動作しない（P39）          | 中     | 高       | アニメーション完了後の最終状態をアサートする。CSSアニメーション自体のテストは行わない   |
| `requestAnimationFrame` のタイミング問題                  | 低     | 中       | `vi.advanceTimersByTime` で制御し、フレーム依存のテストは避ける（P13準拠）              |
| CSS変数ベースのスタイルテスト可読性低下（P47）            | 低     | 中       | `variantStyles` を Record 型でコンポーネント外部に抽出し、テスト側から import する      |
| LoadingScreen と AuthTimeoutFallback の遷移タイミング競合 | 中     | 中       | `requestAnimationFrame` でフレームを1つ遅延させ、状態遷移とアニメーション開始を分離する |

## 8. 参照情報

### 関連ドキュメント

- `apps/desktop/src/renderer/components/AuthGuard/AuthTimeoutFallback.tsx`: 現在のフォールバック実装
- `apps/desktop/src/renderer/components/AuthGuard/LoadingScreen.tsx`: 現在のローディング画面実装
- `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md`: 認証アーキテクチャ仕様
- `.claude/rules/01-architecture.md`: Apple HIG カラーパレット・アニメーション原則

### 参考資料

- Apple Human Interface Guidelines - Motion: アニメーション200-300ms推奨
- WCAG 2.1 AA - 2.3.3 Animation from Interactions: prefers-reduced-motion 対応
- `.claude/rules/06-known-pitfalls.md`: P13（タイマーテスト）、P39（happy-dom）、P47（CSS変数テスト）

## 9. 備考

### TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 の実装で得た教訓

- **教訓1: LoadingScreen と AuthTimeoutFallback の遷移タイミング**: `useAuthState` の状態遷移が即座に起きるため、CSSトランジションのタイミング調整が必要になる。`requestAnimationFrame` でフレームを1つ遅延させるテクニックが有用である
- **教訓2: Apple HIG のアニメーション原則**: アニメーションは「目的を持ったもの」に限定する（200-300ms）。装飾的アニメーションは禁止。ホバー/アクティブの opacity 変化（現在実装済み: `hover:opacity-90`, `active:opacity-80`）は良い例である
- **教訓3: テストでのアニメーション検証**: happy-dom 環境では CSS アニメーションが動作しない（P39）。テストではアニメーション完了後の最終状態をアサートする。`vi.advanceTimersByTime()` でアニメーション時間を進める（P13準拠）
- **教訓4: CSS変数ベースのスタイル管理（P47）**: アニメーション関連の色・時間も CSS 変数で管理し、テスト時は定数を import して期待値を生成する。これによりトークン名変更がRecord定義1箇所で完結する

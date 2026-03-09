# Phase 3: 設計レビュー - タスク仕様書

## メタ情報

| 項目       | 内容                                           |
| ---------- | ---------------------------------------------- |
| タスクID   | TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001 |
| Phase      | 3                                              |
| Phase名    | 設計レビュー                                   |
| カテゴリ   | fix                                            |
| ステータス | pending                                        |
| 前提Phase  | Phase 2                                        |
| 後続Phase  | Phase 4                                        |

## 目的

Phase 2 で策定した設計の妥当性を検証し、実装前に問題点を洗い出す。特に Settings state-based bypass のセキュリティ影響を重点的にレビューする。

## 実行タスク

### タスク1: 要件-設計整合性レビュー

**目的**: Phase 1 の要件と Phase 2 の設計が整合していることを確認する

**手順**:

1. 各受け入れ基準（AC-1〜AC-8）に対応する設計要素が存在するか確認

| AC ID | 設計要素                                                                           | 対応状況確認 |
| ----- | ---------------------------------------------------------------------------------- | ------------ |
| AC-1  | `useAuthState` のタイムアウトロジック + `getAuthState` の `isTimedOut` パラメータ  | □            |
| AC-2  | `AuthTimeoutFallback` コンポーネントのリトライボタン + `initializeAuth()` 呼び出し | □            |
| AC-3  | `AuthTimeoutFallback` コンポーネントの Settings 遷移ボタン                         | □            |
| AC-4  | App.tsx の `currentView === "settings"` bypass 設計                                | □            |
| AC-5  | 既存の `"authenticated"` ケース変更なし                                            | □            |
| AC-6  | `getAuthState` の `isTimedOut && isLoading` 条件（isLoading=false で自動遷移）     | □            |
| AC-7  | Apple HIG 準拠の CSS 変数使用（ライト/ダーク対応）                                 | □            |
| AC-8  | 既存テスト影響調査（getAuthState の引数変更）                                      | □            |

2. 設計に漏れがないか確認

**期待される成果物**:

- 整合性レビュー結果

### タスク2: セキュリティレビュー（重点項目）

**目的**: Settings 画面の state-based bypass によるセキュリティリスクを評価する

**手順**:

1. Settings 画面で扱うデータの機密性レベルを評価
   - APIキー管理: Main Process 側で暗号化保存されているか確認
   - LLM プロバイダー設定: 機密情報を含むか確認
   - テーマ設定: 機密情報なし
   - 言語設定: 機密情報なし
2. AuthGuard bypass からアクセス可能な機能を列挙
3. 認証なしでのアクセスが許容されるか判定
4. Settings 画面内の認証依存セクションに追加保護が必要と判定した場合は、未タスク候補として切り出す

**レビュー観点**:

| 観点             | 確認内容                                                                     | チェック |
| ---------------- | ---------------------------------------------------------------------------- | -------- |
| 最小権限原則     | AuthGuard 外に出す shell が `currentView === "settings"` のみであること      | □        |
| 多層防御         | Settings 内の機密操作が IPC 経由で Main Process に委任されていること         | □        |
| フェイルセキュア | タイムアウト後の遷移先が限定されていること                                   | □        |
| 完全仲介         | Settings からの IPC 呼び出しが Main Process 側でバリデーションされていること | □        |

**期待される成果物**:

- セキュリティレビューレポート

### タスク3: 状態遷移ロジックレビュー

**目的**: タイムアウト状態遷移にバグや無限ループの可能性がないか確認する

**手順**:

1. `useAuthState` のタイマーライフサイクル確認
   - `isLoading` が `true` → タイマー開始
   - `isLoading` が `false` → タイマークリア + `isTimedOut` リセット
   - タイマー発火 → `isTimedOut = true`
   - リトライ → `initializeAuth()` → `isLoading = true` → タイマーリセット（`isTimedOut = false` は `isLoading` が `false` になった時点で発生）

2. エッジケース確認
   - タイムアウト発火直前に `isLoading` が `false` になった場合
   - リトライ中に再度タイムアウトした場合
   - コンポーネントアンマウント時のタイマークリーンアップ

3. P31 準拠確認
   - `useAppStore` の個別セレクタ使用
   - `useEffect` の依存配列の正確性
   - 合成 Hook 不使用

**期待される成果物**:

- 状態遷移レビュー結果

### タスク4: UIコンポーネント設計レビュー

**目的**: AuthTimeoutFallback のUI設計がプロジェクト規約に準拠しているか確認する

**レビュー観点**:

| 観点                | 基準                                         | チェック |
| ------------------- | -------------------------------------------- | -------- |
| Apple HIG           | CSS 変数（`--bg-primary` 等）を使用          | □        |
| Atomic Design       | atoms/molecules の既存コンポーネントを再利用 | □        |
| アクセシビリティ    | ARIA ラベル、キーボード操作対応              | □        |
| ダーク/ライトモード | `var()` CSS 変数による自動切替               | □        |
| レスポンシブ        | モバイル表示への対応                         | □        |

**期待される成果物**:

- UIレビュー結果

## 参照資料

| 参照資料             | パス                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Phase 1 成果物       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-1-requirements.md` |
| Phase 2 成果物       | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-2-design.md`       |
| セキュリティルール   | `.claude/rules/04-electron-security.md`                                                                    |
| 状態管理ルール       | `.claude/rules/03-state-management.md`                                                                     |
| アーキテクチャルール | `.claude/rules/01-architecture.md`                                                                         |

### システム仕様（aiworkflow-requirements）

> 設計レビュー時に以下のシステム仕様との整合性を確認してください。

| 参照資料               | パス                                                                              | 内容                                                  |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 状態管理アーキテクチャ | `.claude/skills/aiworkflow-requirements/references/arch-state-management.md`      | P31対策の個別セレクタパターンとの整合確認             |
| セキュリティ設計原則   | `.claude/skills/aiworkflow-requirements/references/security-principles.md`        | 最小権限・多層防御・フェイルセキュア・完全仲介の4原則 |
| 認証セキュリティ設計   | `.claude/skills/aiworkflow-requirements/references/architecture-auth-security.md` | セッション待機設計・リスナー管理との整合確認          |
| 認証インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-auth.md`            | AuthModeStatus型・AuthSession型の型定義確認           |
| ナビゲーション UI仕様  | `.claude/skills/aiworkflow-requirements/references/ui-ux-navigation.md`           | `settings` ViewType / AppDock / shortcut 導線確認     |

## 統合テスト連携

- レビュー結果に基づき、Phase 4 のテスト設計に反映すべき項目を整理

## レビューゲート判定

| 判定              | 対応                  |
| ----------------- | --------------------- |
| PASS              | Phase 4 へ            |
| MINOR             | 指摘対応後 Phase 4 へ |
| MAJOR（要件問題） | Phase 1 へ戻る        |
| MAJOR（設計問題） | Phase 2 へ戻る        |

## 成果物

| 成果物           | パス                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| 設計レビュー結果 | `docs/30-workflows/completed-tasks/TASK-FIX-AUTHGUARD-TIMEOUT-SETTINGS-BYPASS-001/phase-3-design-review.md` |

## 完了条件

- [ ] 要件-設計整合性レビューが完了し、全AC対応が確認されていること
- [ ] セキュリティレビューが完了し、Settings bypass のリスクが許容範囲であること
- [ ] 状態遷移ロジックにバグや無限ループの可能性がないことが確認されていること
- [ ] UIコンポーネント設計がプロジェクト規約に準拠していること
- [ ] レビューゲート判定が PASS または MINOR であること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 4: テスト作成へ進む。テストケースを設計し、テストコードを作成する。

# Phase 9: 品質チェックリスト

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. RG-01〜RG-06 個別判定

| RG-ID | 観点                                  | 判定 | 根拠                                                                                           |
| ----- | ------------------------------------- | ---- | ---------------------------------------------------------------------------------------------- |
| RG-01 | P31 Store Hook 無限ループ防止         | PASS | 設計で個別セレクタパターンを指定。合成 Hook を useEffect 依存配列に含める設計箇所なし          |
| RG-02 | P48 useShallow 未適用防止             | N/A  | 本設計タスクでは .filter()/.map() を使う派生セレクタの設計箇所なし。後続実装時に適用確認       |
| RG-03 | P5 リスナー二重登録防止               | PASS | health subscription 設計で useEffect cleanup を明示。StrictMode 対策を設計指示に含む           |
| RG-04 | P62 DEFAULT_CONFIG 暗黙 fallback 防止 | PASS | contract-matrix.md で provider 未選択時の振る舞いが「ガイダンス表示」と明記。fallback パスなし |
| RG-05 | Settings bypass 不変                  | PASS | PUBLIC_UNAUTHENTICATED_VIEWS = ["settings"] の変更なし。設計上の変更指示なし                   |
| RG-06 | CTA 契約 Task01 準拠                  | PASS | contract-matrix.md 全5パターンで primary 1 + secondary 1 の上限維持                            |

## 2. 横断品質チェック

| 観点                                    | 判定 | 根拠                                                                     |
| --------------------------------------- | ---- | ------------------------------------------------------------------------ |
| UX: 4 capability 状態の視認性           | PASS | 各状態に固有の icon / label / CTA を定義。Apple HIG 準拠のカラー指定     |
| Architecture: 3 Concern 間の依存方向    | PASS | C-1 / C-2 / C-3 が相互に独立。C-3 は C-1 の isAuthenticated props で制御 |
| Security: 未認証時 guidance-only の境界 | PASS | isAuthenticated=false で全操作 CTA 非表示。TerminalLauncher disabled     |
| 既存契約整合                            | PASS | Settings bypass / Reset exclusion / Public shell / CTA 契約の全項目整合  |

## 3. implementation_ready 判定

| 条件                        | ステータス           |
| --------------------------- | -------------------- |
| RG-01〜RG-06 全て PASS      | 充足（RG-02 は N/A） |
| CRITICAL/HIGH リスクなし    | 充足                 |
| AC-1〜AC-4 対応成果物が存在 | 充足                 |
| **implementation_ready**    | **YES**              |

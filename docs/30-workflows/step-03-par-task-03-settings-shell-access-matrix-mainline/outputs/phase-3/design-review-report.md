# Phase 3: 設計レビュー報告

## タスクID: TASK-IMP-SETTINGS-SHELL-ACCESS-MATRIX-MAINLINE-001

## 1. レビュー概要

- レビュー対象: Phase 2 設計成果物（design-summary.md / contract-matrix.md / validation-matrix.md）
- レビュー観点: 未認証 shell、health 契約、launcher discoverability の矛盾確認

## 2. 個別レビュー結果

### R-01: PUBLIC_UNAUTHENTICATED_VIEWS 不変

- **判定: PASS**
- 根拠: 設計ドキュメントに「PUBLIC_UNAUTHENTICATED_VIEWS = ["settings"] は変更しない」が不変契約として明記。Concern 3 は条件分岐方式で既存ユーティリティを変更せず、isAuthenticated props による表示制御のみ。

### R-02: CTA 上限（primary 1 + secondary 1）

- **判定: PASS**
- 根拠: contract-matrix.md の全組合せ（5パターン）において primary は最大1個、secondary は最大1個。未認証時は CTA 自体を非表示にするため上限を超過しない。

### R-03: P62 暗黙 fallback 禁止

- **判定: PASS**
- 根拠: ProviderSummaryCard 設計で「未選択時はガイダンスを表示する（P62: DEFAULT_CONFIG への暗黙 fallback 禁止）」が明記。contract-matrix.md の none/blocked 行で CTA が "設定を開く" となり、暗黙 fallback パスは存在しない。

### R-04: P31 個別セレクタ使用

- **判定: PASS**
- 根拠: 既存 SettingsView が既に個別セレクタ（useAuthMode() 等）を使用しており、新規コンポーネントも Props ベース設計のため合成 Hook の依存は不要。

### R-05: review harness 非依存

- **判定: PASS**
- 根拠: design-summary.md に「review harness 依存箇所: 0 箇所」と明記。全コンポーネントが Props ベースで設計されている。

### R-06: TerminalLauncher 配置整合

- **判定: PASS**
- 根拠: header 右側（NotificationCenter の左隣）に配置する設計。AppLayout の既存グリッド構造（grid-cols-[auto_1fr_auto]）の3列目に追加する形式で、既存レイアウトへの影響は最小限。

## 3. 既存契約整合チェック

| 契約              | 判定 | 根拠                                                   |
| ----------------- | ---- | ------------------------------------------------------ |
| Settings bypass   | PASS | PUBLIC_UNAUTHENTICATED_VIEWS 不変                      |
| Reset exclusion   | PASS | shouldResetUnauthenticatedView 変更なし                |
| Public shell      | PASS | guidance-only は表示制御のみ、アクセス制御は変更しない |
| CTA 契約 (Task01) | PASS | primary 1 + secondary 1 の上限維持                     |
| P31 Store Hook    | PASS | 個別セレクタ + Props ベース                            |
| P48 useShallow    | N/A  | 派生セレクタの設計時に適用（後続実装タスクで確認）     |

## 4. Simpler Alternative 再評価

Phase 2 で検討された3つの代替案を再評価:

1. **Access Matrix 独立画面**: 不採用維持。既存 IA への影響が大きく、PUBLIC_UNAUTHENTICATED_VIEWS の変更が必要になるリスクがある。
2. **TerminalLauncher Settings 限定**: 不採用維持。terminal handoff の発見性が「全画面で見える」という要件に反する。
3. **guidance-only 専用コンポーネント**: 不採用維持。DRY 原則違反で同一 Props interface のコンポーネントが重複する。

## 5. 総合判定

**判定: PASS**

全 Review-ID（R-01〜R-06）が PASS。既存契約との整合も全項目 PASS。CRITICAL / HIGH リスクなし。Phase 4 への進行を承認する。

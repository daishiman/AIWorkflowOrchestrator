# Phase 3: 設計レビューゲート

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 3                             |
| 機能名 | ut-w3-analytics-dashboard-001 |
| 作成日 | 2026-04-13                    |

## 目的

Phase 2 で確定した `SettingsView` への統合設計と renderer-local 直接参照方針をレビューし、
PASS / MINOR / MAJOR を判定して Phase 4 への進行可否を決定する。

---

## 実行タスク

- **タスク1**: 設計一貫性チェック（`AnalyticsDashboardPanel` の Props と責務境界）
- **タスク2**: AC 整合チェック（AC-1〜AC-5 が設計で充足されるかの確認）
- **タスク3**: セキュリティチェック（XSS防止・PII非表示・開発モード限定の保証）
- **タスク4**: Renderer/Main 境界チェック（renderer-local で閉じているかの確認）
- **タスク5**: MINOR 追跡テーブルの作成（発見された指摘がある場合）

---

## 参照資料

| 資料名                                 | パス                                                  | 説明                 |
| -------------------------------------- | ----------------------------------------------------- | -------------------- |
| Phase 1 受入基準                       | `outputs/phase-1/acceptance-criteria.md`              | AC-1〜AC-5 との照合  |
| Phase 2 設計決定記録                   | `outputs/phase-2/design-decisions.md`                 | レビュー対象設計     |
| Phase 2 コンポーネントインターフェース | `outputs/phase-2/component-interface.md`              | Props 型・モック境界 |
| analyticsAdapter 実装                  | `apps/desktop/src/renderer/utils/analyticsAdapter.ts` | 公開 API 確認        |
| P50チェック結果                        | `outputs/phase-1/p50-check-result.md`                 | Phase 1 成果物       |
| スコープ定義                           | `outputs/phase-1/scope-definition.md`                 | Phase 1 成果物       |

---

## 実行手順

### ステップ1: 設計一貫性チェック

```bash
# AnalyticsDashboardPanel と analyticsAdapter の公開 API の整合確認
grep -n "getQueueSize\|isOptedOut" \
  apps/desktop/src/renderer/utils/analyticsAdapter.ts

# SettingsView 統合箇所の確認
grep -n "AnalyticsDashboardPanel\|settings-view" \
  apps/desktop/src/renderer/views/SettingsView/index.tsx \
  apps/desktop/src/renderer/views/SettingsView/SettingsView.test.tsx
```

**設計一貫性チェックテーブル**:

| チェック項目                                      | 期待値                                       | 判定 |
| ------------------------------------------------- | -------------------------------------------- | ---- |
| `AnalyticsDashboardPanel` の Props が最小限である | `className` 程度に収まっている               | TBD  |
| dev-only 診断ブロックの条件分岐がある             | `NODE_ENV !== 'production'` が明記されている | TBD  |
| コンポーネント Props が状態管理方針と整合         | `analyticsAdapter` 直呼びの設計になっている  | TBD  |
| 設定画面統合が設計に明記                          | 親コンポーネントへの追加箇所が特定されている | TBD  |

### ステップ2: AC 整合チェック

| AC番号 | 受入基準                                                    | 設計での充足方法                                         | 充足判定 |
| ------ | ----------------------------------------------------------- | -------------------------------------------------------- | -------- |
| AC-1   | 設定画面に analytics ダッシュボードが統合されていること     | `AnalyticsDashboardPanel` を設定画面に追加する設計が確定 | TBD      |
| AC-2   | オプトアウト状態の現在値（ON/OFF）がUIで確認できること      | `analyticsAdapter.isOptedOut()` を直接表示する設計       | TBD      |
| AC-3   | 開発モードで dev-only 診断ブロックが表示されること          | `NODE_ENV !== 'production'` の条件分岐が確定             | TBD      |
| AC-4   | Playwright E2E テストが PASS すること                       | E2E テスト対象シナリオが設計に含まれている               | TBD      |
| AC-5   | `pnpm typecheck && pnpm lint && pnpm test` が PASS すること | 型定義・ESLint 対応が設計に含まれている                  | TBD      |

### ステップ3: セキュリティチェック

**XSS 防止**:

| チェック項目                                         | 判定 | 備考                                   |
| ---------------------------------------------------- | ---- | -------------------------------------- |
| 状態文言を DOM に直接挿入しない（React の JSX 使用） | TBD  | `dangerouslySetInnerHTML` 不使用を確認 |
| テキスト表示は React のデフォルトエスケープに任せる  | TBD  | 追加エスケープが不要か確認             |

**PII 非表示**:

| チェック項目                                                 | 判定 | 備考                         |
| ------------------------------------------------------------ | ---- | ---------------------------- |
| 新しい診断ブロックに PII が含まれないこと                    | TBD  | 表示文言が状態名だけかを確認 |
| PII が含まれる可能性がある場合、マスキング設計が存在すること | TBD  | 本タスクでは原則不要         |

**開発モード限定の保証**:

| チェック項目                                                | 判定 | 備考                                            |
| ----------------------------------------------------------- | ---- | ----------------------------------------------- |
| 診断ブロックが `NODE_ENV === 'production'` 時に表示されない | TBD  | 条件分岐の記載確認                              |
| 本番ビルドで診断ブロックの分岐が残らない可能性確認          | TBD  | `process.env.NODE_ENV` 静的チェックで除去可能か |

### ステップ4: Renderer/Main 境界チェック

| チェック項目                                              | 判定 | 備考                             |
| --------------------------------------------------------- | ---- | -------------------------------- |
| `analyticsAdapter.ts` の公開 API が Renderer 側に存在する | TBD  | P50チェック結果と照合            |
| Main Process 側データへの直接アクセスが発生しない         | TBD  | Renderer 内完結であれば IPC 不要 |

---

## レビュー判定

### PASS / MINOR / MAJOR 判定基準

| 判定  | 条件                                                 |
| ----- | ---------------------------------------------------- |
| PASS  | 全チェック項目が ✅。Phase 4 へ進める                |
| MINOR | 軽微な指摘あり。Phase 5-8 で解決予定。Phase 4 継続可 |
| MAJOR | 設計の根本的問題。Phase 2（または Phase 1）へ戻る    |

### MAJOR 判定となる条件（例）

- `AnalyticsDashboardPanel` が production でも dev-only 診断ブロックを表示する
- `analyticsAdapter` の同期 API だけで完結せず、IPC/Preload 依存が増える
- AC-1〜AC-5 のいずれかに対応する設計が存在しない
- PII を含む診断表示になっている

### MINOR 追跡テーブル

| MINOR ID | 指摘内容                 | 解決予定Phase | 解決確認Phase | 備考 |
| -------- | ------------------------ | ------------- | ------------- | ---- |
| UI-M-01  | （指摘がある場合に記入） | -             | Phase 9/10    | -    |

---

## 統合テスト連携

- 設計一貫性・AC 整合・セキュリティのレビューゲートを実施済み
- Phase 4 のテストマトリクスが設計と整合していることを確認
- MINOR 指摘がある場合は Phase 8 リファクタリングまたは Phase 9 品質保証での解決を確認

---

## 多角的チェック観点（AIが判断）

### simpler alternative の検討

| 代替案                                 | 検討結果                                                              |
| -------------------------------------- | --------------------------------------------------------------------- |
| `AnalyticsDashboardPanel` をさらに分割 | 否定: 1ファイルの方が責務が明確で変更点が少ない                       |
| 診断表示を別ページに配置               | 否定: Issue #2098 の要件「設定画面内」に反する                        |
| `NODE_ENV` を `window.__DEV__` で代替  | 否定: Electron/Next.js の標準的な `process.env.NODE_ENV` を使用すべき |

### 後方互換性の確認

- 設定画面に `AnalyticsDashboardPanel` を追加しても、既存の設定項目のレイアウトが崩れないか
- `analyticsAdapter.ts` の既存 API をそのまま使っても、読みやすさが損なわれないか
- dev-only 診断ブロックが production に漏れないか

---

## サブタスク管理

| ID     | タスク名                   | ステータス |
| ------ | -------------------------- | ---------- |
| T-03-1 | 設計一貫性チェック         | 未実施     |
| T-03-2 | AC 整合チェック            | 未実施     |
| T-03-3 | セキュリティチェック       | 未実施     |
| T-03-4 | Renderer/Main 境界チェック | 未実施     |
| T-03-5 | MINOR 追跡テーブル作成     | 未実施     |

---

## 成果物

| 成果物             | 配置先                                    | 形式     |
| ------------------ | ----------------------------------------- | -------- |
| 設計レビュー結果   | `outputs/phase-3/design-review-result.md` | Markdown |
| MINOR 追跡テーブル | `outputs/phase-3/minor-tracking.md`       | Markdown |

---

## 完了条件

- [ ] 設計一貫性チェックテーブルが全行に PASS/FAIL が記入済みであること
- [ ] AC-1〜AC-5 の充足チェックが完了し、全 AC に設計が存在することが確認済みであること
- [ ] セキュリティチェック（XSS防止・PII非表示・開発モード限定）が完了していること
- [ ] Renderer/Main 境界チェックが完了していること
- [ ] レビュー判定（PASS/MINOR/MAJOR）が確定していること
- [ ] Phase 4 開始条件（「PASS」または「MINOR のみで PASS」）が満たされていること
- [ ] `outputs/phase-3/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-03-1: 設計一貫性チェックを実行し `outputs/phase-3/design-review-result.md` に記録済み
- [ ] T-03-2: AC 整合チェックを実行し `outputs/phase-3/design-review-result.md` に記録済み
- [ ] T-03-3: セキュリティチェック結果を `outputs/phase-3/design-review-result.md` に記録済み
- [ ] T-03-4: Renderer/Main 境界チェック結果を記録済み
- [ ] T-03-5: MINOR 追跡テーブルを `outputs/phase-3/minor-tracking.md` に記録済み（指摘なしの場合は「なし」と記録）

---

## 次Phase

**Phase 4: テスト作成（Red段階）** — `AnalyticsDashboardPanel` のユニットテストと Playwright E2E テストを作成し、Red 状態を確認する。

**Phase 4 開始条件**: 本 Phase のレビュー判定が「PASS」または「MINOR のみ」であること。
**Phase 13 blocked 条件**: MAJOR 判定が残存している場合は PR 作成不可。

# Phase 2: 設計

## メタ情報

| 項目   | 値                            |
| ------ | ----------------------------- |
| Phase  | 2                             |
| 機能名 | ut-w3-analytics-dashboard-001 |
| 作成日 | 2026-04-13                    |

## 目的

`AnalyticsDashboardPanel` コンポーネントの設計を確定し、
Renderer-local の `analyticsAdapter` を直接参照する方針に固定する。
診断表示は独立コンポーネントにせず、`AnalyticsDashboardPanel` 内の dev-only 診断ブロックとして扱う。
追加の IPC や状態ストアは導入しない。

---

## 実行タスク

- **タスク1**: コンポーネント設計（階層構造・プロパティ・責務分担）
- **タスク2**: 状態管理設計（Renderer 直接参照で完結させる）
- **タスク3**: 開発/本番分岐設計（`NODE_ENV` チェックの実装箇所）
- **タスク4**: テスト可能性設計（DI・モック境界の明確化）

---

## 参照資料

| 資料名                  | パス                                                    | 説明                                   |
| ----------------------- | ------------------------------------------------------- | -------------------------------------- |
| Phase 1 受入基準        | `outputs/phase-1/acceptance-criteria.md`                | AC-1〜AC-5                             |
| Phase 1 P50チェック結果 | `outputs/phase-1/p50-check-result.md`                   | analyticsAdapter 公開 API の有無       |
| Phase 1 スコープ定義    | `outputs/phase-1/scope-definition.md`                   | 変更ファイル一覧                       |
| analyticsAdapter 実装   | `apps/desktop/src/renderer/utils/analyticsAdapter.ts`   | キュー管理・オプトアウト制御・同期 API |
| trackEvent 実装         | `apps/desktop/src/renderer/utils/trackEvent.ts`         | dev/prod 分岐の確認                    |
| 設定画面コンポーネント  | P50チェックで特定したパス                               | 統合先コンポーネント                   |
| DI境界設計ガイド        | `.claude/skills/task-specification-creator/references/` | コンポーネント DI 境界判断フロー       |

---

## 実行手順

### ステップ1: コンポーネント設計

SettingsView に 1 つの新規セクションを追加し、内部に `AnalyticsDashboardPanel` を置く。
`AnalyticsDashboardPanel` は `analyticsAdapter` を直接呼び、キュー件数とオプトアウト状態をその場で描画する。
診断表示は別ファイルにせず、同コンポーネント内の dev-only 診断ブロックとして扱う。

```typescript
interface AnalyticsDashboardPanelProps {
  className?: string;
}
```

```bash
# 既存コンポーネントの Props パターン確認
grep -rn "interface.*Props" \
  apps/desktop/src/renderer/views/SettingsView/ 2>/dev/null | head -20

# analyticsAdapter の型エクスポート確認
grep -n "export type\|export interface" \
  apps/desktop/src/renderer/utils/analyticsAdapter.ts
```

### ステップ2: 状態管理設計

**採用方針**: Renderer 直接参照のみ。

| 方針                               | 採用   | 理由                      |
| ---------------------------------- | ------ | ------------------------- |
| `getAnalyticsAdapter()` を直接呼ぶ | 採用   | 既存の同期 API で完結する |
| IPC / Preload 経由                 | 不採用 | 追加コストのみ増える      |
| Store に複製する                   | 不採用 | 状態の二重管理になる      |

**設計決定の記録**:

`outputs/phase-2/design-decisions.md` に「renderer-local direct read」を明記する。

```bash
# analyticsAdapter の公開 API 詳細確認
grep -n "export function\|export const\|export class\|export default" \
  apps/desktop/src/renderer/utils/analyticsAdapter.ts
```

### ステップ3: 開発/本番分岐設計

`NODE_ENV !== 'production'` の判定は `AnalyticsDashboardPanel` 内に閉じる。
Props 注入やカスタムフックは導入しない。テストは `vi.stubEnv()` で制御する。

```typescript
interface AnalyticsDashboardPanelProps {
  className?: string;
}
```

### ステップ4: テスト可能性設計

**モック境界の確定**:

| 境界                          | モック方法                              | テスト対象                         |
| ----------------------------- | --------------------------------------- | ---------------------------------- |
| `analyticsAdapter` の取得 API | `vi.mock("../utils/analyticsAdapter")`  | `AnalyticsDashboardPanel` ユニット |
| `process.env.NODE_ENV`        | `vi.stubEnv("NODE_ENV", "development")` | dev-only ブロックの表示分岐        |
| Playwright E2E                | Electron 起動・実アプリでの動作確認     | AC-4 E2E テスト                    |

---

## 設計判断記録

| 決定事項                    | 選択                         | 理由                                      |
| --------------------------- | ---------------------------- | ----------------------------------------- |
| 状態管理アプローチ          | renderer-local direct read   | 既存の同期 API で完結するため             |
| `NODE_ENV` チェック実装箇所 | `AnalyticsDashboardPanel` 内 | 最小複雑性で dev-only を閉じ込めるため    |
| 診断表示の扱い              | 内部 dev-only 診断ブロック   | 実ログ保存先を増やさず AC-3 を満たすため  |
| IPC チャンネル追加要否      | 追加しない                   | `analyticsAdapter` だけで要件を満たすため |

---

## 統合テスト連携

- コンポーネントインターフェースを Phase 4 テスト作成に引き継ぐ
- `NODE_ENV` 分岐のテスト方法を Phase 4 テストマトリクスに反映
- `AnalyticsDashboardPanel` が settings view に収まることを Phase 4/5 で確認する

---

## 多角的チェック観点（AIが判断）

### コンポーネント設計

- **単一責務**: `AnalyticsDashboardPanel` は統合表示に専念し、診断ブロックは内部に閉じているか
- **テスト可能性**: `NODE_ENV` を `vi.stubEnv` で切り替えられるか
- **再利用性**: 本タスクでは再利用性よりも、SettingsView 内での読みやすさを優先する

### Renderer/Main 境界

- **IPC 不要**: 追加の Preload / Main 通信を増やしていないか
- **責務境界**: renderer-local の状態だけで表示責務を完結できているか

### セキュリティ

- **PII 非表示**: 新しい診断ブロックに個人識別情報を載せない
- **開発モード限定**: 診断ブロックが production ではレンダリングされない

---

## サブタスク管理

| ID     | タスク名                           | ステータス |
| ------ | ---------------------------------- | ---------- |
| T-02-1 | コンポーネント設計                 | 未実施     |
| T-02-2 | 状態管理アプローチ選定             | 未実施     |
| T-02-3 | 開発/本番分岐設計                  | 未実施     |
| T-02-4 | テスト可能性設計（モック境界確定） | 未実施     |

---

## 成果物

| 成果物                         | 配置先                                   | 形式     |
| ------------------------------ | ---------------------------------------- | -------- |
| 設計決定記録                   | `outputs/phase-2/design-decisions.md`    | Markdown |
| コンポーネントインターフェース | `outputs/phase-2/component-interface.md` | Markdown |
| 開発/本番分岐設計              | `outputs/phase-2/design-decisions.md`    | Markdown |

---

## 完了条件

- [ ] コンポーネント階層（`SettingsView` / `AnalyticsDashboardPanel`）の設計が確定していること
- [ ] 状態管理アプローチが renderer-local direct read に固定されていること
- [ ] `NODE_ENV` チェックの実装箇所が確定していること
- [ ] モック境界（`analyticsAdapter` / `process.env`）が定義済みであること
- [ ] `outputs/phase-2/` に全成果物が生成されていること

---

## タスク100%実行確認【必須】

- [ ] T-02-1: コンポーネント階層と Props 型を `outputs/phase-2/component-interface.md` に記録済み
- [ ] T-02-2: 状態管理アプローチの選択と理由を `outputs/phase-2/design-decisions.md` に記録済み
- [ ] T-02-3: `NODE_ENV` 分岐の実装箇所を `outputs/phase-2/design-decisions.md` に記録済み
- [ ] T-02-4: モック境界テーブルを `outputs/phase-2/component-interface.md` に記録済み

---

## 次Phase

**Phase 3: 設計レビューゲート** — Phase 2 で確定した direct-read 設計の整合性・セキュリティ・AC整合をレビューし、PASS/MINOR/MAJOR を判定して Phase 4 への進行可否を決定する。

**ゲート条件**: Phase 1-2 の全完了条件を満たさない場合、Phase 3 へ進まないこと。

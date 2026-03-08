# SettingsView Playwright E2E テスト導入 - タスク指示書

## メタ情報

```yaml
issue_number: 1079
```

## メタ情報

| 項目         | 内容                                                                 |
| ------------ | -------------------------------------------------------------------- |
| タスクID     | UT-08-002-SETTINGS-E2E-PLAYWRIGHT-INTRODUCTION                       |
| タスク名     | SettingsView Playwright E2E テスト導入                               |
| 分類         | テスト基盤拡充                                                       |
| 対象機能     | SettingsView の E2E レベル回帰保証                                   |
| 優先度       | 中                                                                   |
| 見積もり規模 | 中規模                                                               |
| ステータス   | 未実施                                                               |
| 発見元       | Phase 12（08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001） |
| 発見日       | 2026-03-08                                                           |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 で SettingsView の統合テスト（18テスト）を happy-dom 環境で実装した。これにより DOM レベルのコンポーネント統合は検証できるが、以下の検証層が未カバーのまま残っている:

- 実際の Electron ウィンドウ + Chromium レンダリング
- contextBridge 経由の IPC 通信（実 Preload 環境）
- CSS/スタイリングの実際の適用（happy-dom は CSS を解釈しない）
- ユーザー操作のリアルなインタラクション（キーボード、マウスイベントの伝播）

Phase 11（手動テスト）で UI 確認を実施したが、手動テストは再現性が低く回帰保証として不十分。

### 1.2 問題点・課題

1. **happy-dom の限界**: CSS 解釈なし、Web API の部分的サポートのみ、`userEvent` が使用不可（P39）
2. **手動テストの再現性**: Phase 11 の手動テストは毎リリースで再実行が必要だが、自動化されていない
3. **IPC 統合の未検証**: contextBridge + sandbox 環境での実際の通信は統合テストではモックされている
4. **回帰検出の遅延**: UI の視覚的な崩れやインタラクション不具合は、手動テストでしか検出できない

### 1.3 放置した場合の影響

- CSS 変更による視覚的リグレッションが検出されず、ユーザーに到達する
- Electron アップデート時の contextBridge 動作変更を検出できない
- 手動テストの工数が増加し続ける

---

## 2. 何を達成するか（What）

### 2.1 目的

Playwright for Electron を導入し、SettingsView の主要シナリオを E2E テストとして自動化する。Phase 11 手動テストの一部を自動化し、回帰保証を強化する。

### 2.2 最終ゴール

- Playwright for Electron の環境構築が完了している
- SettingsView の主要5-8シナリオが E2E テストとして自動実行される
- CI パイプラインに headless モードで組み込まれている

### 2.3 スコープ

#### 含むもの

- Playwright for Electron の環境構築・設定
- SettingsView E2E テストシナリオ:
  1. 設定画面の表示と全セクション描画確認
  2. auth-mode 切替操作（subscription → api-key）
  3. APIキープロバイダー一覧表示
  4. テーマ切替と視覚的変更確認
  5. APIキー保存操作フロー
- CI 統合（GitHub Actions workflow への追加）

#### 含まないもの

- 他の View（AgentView, ChatView 等）の E2E テスト
- パフォーマンス計測
- スクリーンショットベースの視覚回帰テスト（将来検討）

### 2.4 成果物

- `playwright.config.ts`（Electron 用設定）
- `e2e/settings/` ディレクトリ配下のテストファイル群
- CI workflow 更新（`.github/workflows/e2e.yml` 等）

---

## 3. どのように実行するか（How）

### 3.1 実装手順

#### Step 1: Playwright for Electron の環境構築

```bash
pnpm add -D @playwright/test playwright
pnpm exec playwright install chromium
```

#### Step 2: Electron 起動設定

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    // Electron アプリとして起動
  },
});
```

#### Step 3: SettingsView E2E テスト作成

```typescript
// e2e/settings/settings-view.spec.ts
test("設定画面が正常に表示される", async ({ electronApp }) => {
  const window = await electronApp.firstWindow();
  // SettingsView に遷移
  // 全セクション（Account, AuthMode, ApiKeys, Theme）の表示を確認
});
```

#### Step 4: CI 統合

GitHub Actions で headless モードでの E2E テスト実行を設定。

### 3.2 実装時の苦戦箇所と解決策（08-TASK 知見）

#### 苦戦箇所1: happy-dom と実ブラウザ環境の差異

**問題**: 08-TASK の統合テストでは happy-dom を使用したが、`userEvent` が使用不可（P39: happy-dom環境でのuserEvent非互換）であり、`fireEvent` でのテストを強いられた。これにより、実際のユーザー操作とのギャップが生じている。

**解決策**: Playwright E2E テストでは実際の Chromium ブラウザ環境を使用するため、`userEvent` の制約がない。`page.click()`, `page.fill()` 等のリアルな操作 API を使用できる。

#### 苦戦箇所2: electronAPI モックの設計複雑性

**問題**: 08-TASK で `settings-test-harness.ts` を作成し、`window.electronAPI` を `Object.defineProperty` で設定するパターンを確立した。このモック設計には store mock + electronAPI mock の統合が必要で、17以上のセレクタのデフォルト値設定が必要だった（M-01 対応）。

**解決策**: E2E テストでは実際の Electron 環境（Main Process + Preload + Renderer）を使用するため、ハーネスの代わりに実際の IPC 通信をテストする。ただし、外部サービス（Supabase 等）のモックは依然として必要。

#### 苦戦箇所3: P31 Zustand Store Hooks 無限ループのリスク

**問題**: 合成 Store Hook（`useAuthModeStore()`）が毎回新しいオブジェクトを返すため、`useEffect` の依存配列に含めると無限ループが発生する。統合テストではモックで回避したが、E2E では実際の Store が使用される。

**解決策**: 個別セレクタ移行（UT-STORE-HOOKS-COMPONENT-MIGRATION-001）が完了しているため、E2E テストでは無限ループリスクは低い。ただし、新規コンポーネント追加時は個別セレクタの使用を徹底する。

---

## 4. 受け入れ基準

- [ ] Playwright for Electron の環境構築が完了し、テストランナーが起動する
- [ ] 5つ以上の SettingsView E2E テストシナリオが PASS する
- [ ] CI パイプラインで headless E2E テストが自動実行される
- [ ] E2E テスト実行結果が CI レポートに表示される

---

## 5. 参照資料

| 資料                    | パス                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| 統合テスト本体          | `apps/desktop/src/renderer/views/SettingsView/__tests__/SettingsView.integration.test.tsx`                          |
| テストハーネス          | `apps/desktop/src/renderer/views/SettingsView/__tests__/settings-test-harness.ts`                                   |
| Phase 11 手動テスト結果 | `docs/30-workflows/08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001/outputs/phase-11/manual-test-result.md` |
| P39 pitfall             | `.claude/rules/06-known-pitfalls.md#P39`                                                                            |
| P31 pitfall             | `.claude/rules/06-known-pitfalls.md#P31`                                                                            |

---

## 6. 関連タスク

| タスクID                                                 | 関係                        |
| -------------------------------------------------------- | --------------------------- |
| 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001 | 親タスク（発見元）          |
| UT-08-003                                                | 統合テスト拡充（INT-11~13） |

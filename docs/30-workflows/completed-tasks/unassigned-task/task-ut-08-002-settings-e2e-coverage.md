# UT-08-002 SettingsView E2E 回帰自動化 - タスク指示書

## メタ情報

| 項目         | 内容                        |
| ------------ | --------------------------- |
| タスクID     | UT-08-002                   |
| タスク名     | SettingsView E2E 回帰自動化 |
| 分類         | 改善                        |
| 対象機能     | SettingsView                |
| 優先度       | 中                          |
| 見積もり規模 | 中規模                      |
| ステータス   | 未実施                      |
| 発見元       | 08-TASK Phase 11/12         |
| 発見日       | 2026-03-08                  |

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

現状は統合テスト（happy-dom）中心で、Electron実行環境での設定画面回帰が継続監視されていない。

### 1.2 問題点・課題

本番に近いレンダリング経路の退行を検知しにくい。

### 1.3 放置した場合の影響

設定画面の遷移・認証・APIキー導線の回帰検知が手動依存になる。

## 2. 何を達成するか（What）

### 2.1 目的

SettingsView の主要導線を Playwright で継続自動検証する。

### 2.2 最終ゴール

CIで SettingsView の shell表示、auth-mode切替、apiKey表示を自動判定できる。

### 2.3 スコープ

#### 含むもの

- `apps/desktop/e2e/` への Settings 回帰 spec 追加
- スクリーンショット証跡 2~4件の自動生成

#### 含まないもの

- 全機能E2E網羅
- visual diff基盤の導入

### 2.4 成果物

- 新規 E2E spec
- `outputs/phase-11/screenshots/` 自動生成手順

## 3. どのように実行するか（How）

### 3.1 前提条件

- Playwright 実行基盤が動作する

### 3.2 依存タスク

- 08-TASK-IMP-SETTINGS-INTEGRATION-REGRESSION-COVERAGE-001

### 3.3 必要な知識

- Playwright
- e2e global-setup

### 3.4 推奨アプローチ

既存 `auth.spec.ts` の遷移ロジックを再利用し、対象導線だけを抽出する。

## 4. 実行手順

1. Settings専用 spec を追加
2. 設定画面表示と auth-mode 切替を検証
3. screenshot を workflow 配下に保存
4. CIジョブへ組み込み（必要最小限）

## 5. 完了条件チェックリスト

- [ ] Settings E2Eが安定実行できる
- [ ] screenshot 生成が自動化される
- [ ] 失敗時ログから原因が追跡できる

## 6. 検証方法

- `cd apps/desktop && pnpm test:e2e -- e2e/<settings-spec>.ts`

## 7. リスクと対策

| リスク        | 影響度 | 発生確率 | 対策                         |
| ------------- | ------ | -------- | ---------------------------- |
| E2Eの不安定化 | 中     | 中       | selector固定と待機条件最小化 |
| 実行時間増加  | 低     | 中       | Settings導線のみ対象化       |

## 8. 参照情報

- `apps/desktop/e2e/auth.spec.ts`
- `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`

## 9. 備考

- 手動検証の代替ではなく、回帰検知の自動化が目的。

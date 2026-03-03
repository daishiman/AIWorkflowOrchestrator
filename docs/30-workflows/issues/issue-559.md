# [#559] "[TASK-3-2-F] SkillStreamDisplay テスト環境改善"

## メタ情報

```yaml
task_id: TASK-3-2-F
task_name: SkillStreamDisplay テスト環境改善
category: 改善
target_feature: SkillStreamDisplay コンポーネントテスト
priority: 高
scale: 中規模
status: 未実施
source_phase: Phase 10（TASK-3-2-B最終レビュー）
created_date: 2026-01-28
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-skill-stream-test-environment-improvements.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 高     |
| 規模       | 中規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-3-2-B（SkillStreamDisplay i18n対応）の実装中、統合テストにおいてhappy-dom環境特有の問題が発生した。React concurrent modeの互換性問題とClipboard APIのモック制限により、一部のテストがスキップされている状態である。

### 1.2 問題点・課題

| 問題                            | 影響                                                      |
| ------------------------------- | --------------------------------------------------------- |
| happy-dom concurrent mode非対応 | `SkillStreamDisplay.i18n.integration.test.tsx` がスキップ |
| Clipboard API モック制限        | コピー機能の統合テストがスキップ                          |
| `act()` 警告                    | テスト実行時の非同期処理で警告が発生                      |

**現在のテスト状況**:

- 74テスト中 4テストがスキップ（`describe.skip`で一時回避）
- カバレッジ: 100%（スキップテスト除外での計測）

### 1.3 放置した場合の影響

| 影響                          | 深刻度 |
| ----------------------------- | ------ |
| 統合テストのカバレッジ漏れ    | 中     |
| 回帰バグ検出の遅延リスク      | 中     |
| CI/CDパイプラインの信頼性低下 | 低     |

---

## 2. 何を達成するか（What）

### 2.1 目的

SkillStreamDisplayコンポーネントの全テストを安定して実行可能な状態にし、統合テストのスキップを解消する。

### 2.2 最終ゴール

| ゴール                           | 検証方法                   |
| -------------------------------- | -------------------------- |
| 全74テストがPASSする             | `pnpm test` 実行結果       |
| `describe.skip` がゼロ           | grep検索                   |
| Clipboard API テストが正常に動作 | コピー機能テストのPASS確認 |
| `act()` 警告がゼロ               | テスト実行ログ確認         |

### 2.3 スコープ

#### 含むもの

- happy-dom → jsdom への切り替え検討・実装
- Clipboard API モックの改善
- `act()` 警告の解消
- 既存テストの互換性維持

#### 含まないもの

- 新規テストケースの追加
- テスト対象コンポーネントの機能変更
- Playwright/Cypress等のE2Eテスト導入

### 2.4 成果物

| 成果物                   | ファイルパス                                   |
| ------------------------ | ---------------------------------------------- |
| Vitest設定更新           | `apps/desktop/vitest.config.ts`                |
| テストユーティリティ更新 | `apps/desktop/src/renderer/test-utils/`        |
| 統合テスト修正           | `SkillStreamDisplay.i18n.integration.test.tsx` |
| テスト結果レポート       | `outputs/phase-12/test-environment-report.md`  |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

| 条件                                    | 確認方法           |
| --------------------------------------- | ------------------ |
| TASK-3-2-Bが完了している                | artifacts.json確認 |
| 現在のテストが74テスト中70テストPASS    | `pnpm test` 実行   |
| happy-dom v17.xがインストールされている | package.json確認   |

### 3.2 依存タスク

| タスクID   | ステータス |
| ---------- | ---------- |
| TASK-3-2-A | 完了       |
| TASK-3-2-B | 完了       |
| TASK-3-2-C | 完了       |

### 3.3 必要な知識

| 知識領域                               | 重要度 |
| -------------------------------------- | ------ |
| Vitest テスト設定                      | 高     |
| React Testing Library                  | 高     |
| DOM環境エミュレータ（jsdom/happy-dom） | 高     |
| Clipboard API                          | 中     |
| React concurrent mode                  | 中     |

### 3.4 推奨アプローチ

**アプローチA: happy-dom → jsdom 切り替え（推奨）**

| 利点                          | 欠点                     |
| ----------------------------- | ------------------------ |
| React concurrent mode完全対応 | 若干のパフォーマンス低下 |
| Clipboard API標準対応         | 設定変更が必要           |
| 広いエコシステムサポート      | -                        |

**アプローチB: happy-dom環境でのモック強化**

| 利点         | 欠点                     |
| ------------ | ------------------------ |
| 現設定の維持 | 根本解決にならない可能性 |
| 最小限の変更 | 追加モック実装コスト     |

---

## 4. 実行手順

### Phase構成

| Phase | 名称         | 主要タスク                         |
| ----- | ------------ | ---------------------------------- |
| 1     | 調査・設計   | 問題の詳細調査、解決アプローチ選定 |
| 2     | 環境切り替え | jsdom導入またはモック実装          |
| 3     | テスト修正   | スキップテストの有効化・修正       |
| 4     | 検証・文書化 | 全テストPASS確認、ドキュメント更新 |

### Phase 1: 調査・設計

#### 目的

問題の根本原因を特定し、最適な解決アプローチを選定する。

#### 手順

1. happy-dom GitHubリポジトリで concurrent mode 対応状況を確認
2. jsdom の Clipboard API サポート状況を調査
3. 現テストの失敗パターンを詳細分析
4. 解決アプローチの技術検証（PoC）

#### 成果物

| 成果物           | 説明                     |
| ---------------- | ------------------------ |
| 調査レポート     | 問題の詳細分析結果       |
| アプローチ選定書 | 採用するアプローチと理由 |

#### 完了条件

- [ ] 問題の根本原因が特定されている
- [ ] 解決アプローチが選定されている
- [ ] PoCで動作確認ができている

### Phase 2: 環境切り替え

#### 目的

選定したアプローチに基づき、テスト環境を改善する。

#### 手順（jsdom切り替えの場合）

1. `vitest.config.ts` で環境を `happy-dom` → `jsdom` に変更
2. jsdom用のセットアップファイルを更新
3. Clipboard APIモックを実装（navigator.clipboard）
4. 既存テストの互換性を確認

#### 成果物

| 成果物            | 説明                   |
| ----------------- | ---------------------- |
| vitest.config.ts  | 更新された設定ファイル |
| test-setup.ts     | テストセットアップ更新 |
| clipboard-mock.ts | Clipboard APIモック    |

#### 完了条件

- [ ] 環境切り替えが完了している
- [ ] 既存の70テストが引き続きPASSする
- [ ] `act()` 警告が発生しない

### Phase 3: テスト修正

#### 目的

スキップされているテストを有効化し、全テストをPASSさせる。

#### 手順

1. `describe.skip` を `describe` に変更
2. 必要に応じてテストコードを調整
3. 全74テストの実行確認
4. カバレッジレポート確認

#### 成果物

| 成果物                                       | 説明                 |
| -------------------------------------------- | -------------------- |
| SkillStreamDisplay.i18n.integration.test.tsx | 修正された統合テスト |
| カバレッジレポート                           | 100%カバレッジの証明 |

#### 完了条件

- [ ] 全74テストがPASSする
- [ ] `describe.skip` がゼロ
- [ ] カバレッジ100%維持

### Phase 4: 検証・文書化

#### 目的

変更の影響を確認し、ドキュメントを更新する。

#### 手順

1. CI/CDパイプラインでの動作確認
2. 他コンポーネントへの影響確認
3. テスト環境変更に関するドキュメント更新
4. TASK-3-2-Fの完了記録

#### 成果物

| 成果物           | 説明                         |
| ---------------- | ---------------------------- |
| テスト環境ガイド | テスト設定の説明ドキュメント |
| 完了レポート     | タスク完了の記録             |

#### 完了条件

- [ ] CI/CDでテストが正常に動作する
- [ ] ドキュメントが更新されている
- [ ] LOGS.mdに完了記録がある

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 全74テストがPASSする
- [ ] `describe.skip` がコードベースに存在しない
- [ ] Clipboard APIテストが正常に動作する
- [ ] `act()` 警告がゼロ

### 品質要件

- [ ] テストカバレッジ100%維持
- [ ] 既存テストの実行時間が大幅に増加しない（+20%以内）
- [ ] CI/CDパイプラインでのテスト成功

### ドキュメント要件

- [ ] テスト環境設定がドキュメント化されている
- [ ] 変更理由と経緯が記録されている
- [ ] LOGS.mdに完了エントリがある

---

## 6. 検証方法

### テストケース

| テストケース         | 期待結果               |
| -------------------- | ---------------------- |
| 全ユニットテスト実行 | 74テストPASS           |
| 統合テスト実行       | 全件PASS               |
| コピー機能テスト     | クリップボード連携確認 |
| CI/CDでのテスト実行  | 成功                   |

### 検証手順

```bash
# 1. 全テスト実行
pnpm --filter @repo/desktop test

# 2. skipなしの確認
grep -r "describe.skip" apps/desktop/src/renderer/

# 3. カバレッジ確認
pnpm --filter @repo/desktop test:coverage

# 4. CI/CDでの確認
# GitHub Actions ワークフロー実行
```

---

## 7. リスクと対策

| リスク                            | 影響度 | 発生確率 | 対策                                     |
| --------------------------------- | ------ | -------- | ---------------------------------------- |
| jsdom切り替えによる既存テスト破損 | 高     | 低       | 段階的な移行、ロールバック計画準備       |
| パフォーマンス低下                | 低     | 中       | ベンチマーク測定、許容範囲の設定         |
| 他コンポーネントへの影響          | 中     | 低       | 影響範囲の事前調査、分離されたテスト実行 |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント                   | パス                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| TASK-3-2-B未タスク検出レポート | `docs/30-workflows/TASK-3-2-B-skill-stream-i18n/outputs/phase-12/unassigned-task-detection.md` |
| TASK-3-2-B最終レビュー結果     | `docs/30-workflows/TASK-3-2-B-skill-stream-i18n/outputs/phase-10/final-review-result.md`       |
| SkillStreamDisplay仕様         | `.claude/skills/aiworkflow-requirements/references/ui-ux-feature-components.md`                |

### 参考資料

| 資料                  | URL/パス                                                      |
| --------------------- | ------------------------------------------------------------- |
| Vitest 環境設定       | https://vitest.dev/guide/environment.html                     |
| jsdom ドキュメント    | https://github.com/jsdom/jsdom                                |
| happy-dom Issues      | https://github.com/capricorn86/happy-dom                      |
| React Testing Library | https://testing-library.com/docs/react-testing-library/intro/ |

---

## 9. 備考

### レビュー指摘の原文（Phase 10）

```
MINOR判定事項:
- 統合テスト（SkillStreamDisplay.i18n.integration.test.tsx）がdescribe.skipでスキップされている
- 理由: happy-dom環境でのReact concurrent mode非互換性
- 対応: TASK-3-2-Fとして別途対応を推奨
```

### 補足事項

- このタスクはSkillStreamDisplayシリーズ（TASK-3-2-A/B/C）の技術的負債解消を目的とする
- 解決後は他コンポーネントのテストにも同様の改善を適用可能
- jsdomへの切り替えはモノレポ全体への影響を考慮して検討する必要がある

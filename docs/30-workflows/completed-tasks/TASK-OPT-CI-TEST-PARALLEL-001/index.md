# TASK-OPT-CI-TEST-PARALLEL-001: GitHub Actions CI テスト並列実行最適化

## メタ情報

| 項目         | 値                                     |
| ------------ | -------------------------------------- |
| タスクID     | TASK-OPT-CI-TEST-PARALLEL-001          |
| タスク名     | GitHub Actions CI テスト並列実行最適化 |
| 作成日       | 2026-02-02                             |
| ステータス   | 未着手                                 |
| 優先度       | 高                                     |
| 見積もり工数 | 中                                     |
| 担当         | 未割当                                 |
| ブランチ     | task-opt-ci-test-parallel-001          |
| 関連Issue    | -                                      |
| 前提タスク   | なし                                   |

## 目的

GitHub Actions CI パイプラインのテスト実行時間を短縮し、開発者のフィードバックループを高速化する。

現在の状況:

- **test-desktop**: 8シャード並列で各19-20分（テスト実行17分 + セットアップ2分）
- **全体CI時間**: 約22分（並列実行により最長ジョブに依存）
- **テスト数**: 399ファイル、約12,000テストケース
- **待機時間が長すぎる**: PRごとに20分以上の待機が発生
- **カバレッジ**: 78.68%（しきい値80%を下回っている）
- **ローカル環境問題**: better-sqlite3のアーキテクチャ不一致（x86_64 vs arm64）

目標:

- **各シャードの実行時間**: 19-20分 → 10分以下
- **全体CI時間**: 22分 → 12分以下
- **開発者体験の向上**: 迅速なフィードバックによる開発効率改善
- **カバレッジ改善**: 78.68% → 80%以上
- **ローカル環境安定化**: ネイティブモジュールのリビルド手順整備

## 背景・経緯

### 現状分析（2026-02-02時点）

**CI実行時間分析（直近10回の平均）**:

| ジョブ            | 実行時間   | 備考                     |
| ----------------- | ---------- | ------------------------ |
| Lint              | 1m57s      | 問題なし                 |
| Type Check        | 2m17s      | 問題なし                 |
| Test (shared)     | 2m36s      | 問題なし                 |
| Test (desktop) x8 | 18-20分/各 | **ボトルネック**         |
| Security Audit    | 1m37s      | 問題なし                 |
| Build Check       | 2m09s      | test-desktop完了後に実行 |
| Upload Coverage   | 0m05s      | test-desktop完了後に実行 |

**test-desktop 1シャードの内訳**:

| ステップ                 | 時間    | 最適化ポテンシャル   |
| ------------------------ | ------- | -------------------- |
| Checkout                 | 2s      | 低                   |
| Setup pnpm               | 1s      | 低                   |
| Setup Node.js            | 9s      | 低                   |
| Install dependencies     | 1m22s   | 中（キャッシュ改善） |
| Build shared package     | 20s     | 高（キャッシュ導入） |
| Run tests (shard N/8)    | **17m** | **高（並列化改善）** |
| Upload coverage artifact | 1s      | 低                   |

**Vitest設定（現状）**:

| 設定項目          | 現在値 | 問題点                  |
| ----------------- | ------ | ----------------------- |
| pool              | forks  | 適切                    |
| maxForks          | 2      | 各シャード内で2並列のみ |
| fileParallelism   | false  | ファイル間並列化が無効  |
| testTimeout       | 10000  | 適切                    |
| coverage.provider | v8     | 適切                    |

## スコープ

### 実装対象

1. **シャード数最適化**
   - 8分割 → 16分割への変更
   - マトリクス戦略の調整

2. **shared packageビルドキャッシュ**
   - actions/cache によるビルド成果物キャッシュ
   - キャッシュキー設計（pnpm-lock.yaml + packages/shared/src/\*\*）

3. **Vitest並列化設定最適化**
   - maxForks の増加（2 → 4）
   - fileParallelism の条件付き有効化

4. **カバレッジ計測の条件分岐**
   - PR時: カバレッジなしの高速モード
   - main マージ時: フルカバレッジ計測

5. **pnpm store キャッシュ改善**
   - キャッシュキー設計の最適化
   - restore-keys によるフォールバック

6. **カバレッジ改善（78.68% → 80%以上）**
   - 未カバーファイルへのテスト追加
   - しきい値達成の確認

7. **ローカル環境安定化**
   - better-sqlite3ネイティブモジュールのリビルド手順
   - postinstallスクリプトによる自動リビルド設定

### スコープ外

- テストケースの削減・削除
- テストコードのリファクタリング
- E2Eテストの追加・変更
- 新規ワークフローファイルの作成（ci.yml修正のみ）

## 技術的アプローチ

### 1. シャード数の増加（8 → 16）

**変更前**:

```yaml
matrix:
  shard: [1, 2, 3, 4, 5, 6, 7, 8]
```

**変更後**:

```yaml
matrix:
  shard: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
```

**期待効果**: 各シャードのテスト数が半減し、実行時間が約50%短縮

### 2. shared パッケージビルドキャッシュ

**キャッシュ戦略**:

| キー構成要素              | 説明                       |
| ------------------------- | -------------------------- |
| runner.os                 | OS依存のバイナリ対応       |
| pnpm-lock.yaml hash       | 依存関係変更時に無効化     |
| packages/shared/\*\* hash | sharedソース変更時に無効化 |

**restore-keys**: `shared-build-${{ runner.os }}-` でフォールバック

### 3. Vitest設定最適化

**変更内容**:

| 設定項目        | 変更前 | 変更後 | 理由                                                  |
| --------------- | ------ | ------ | ----------------------------------------------------- |
| maxForks        | 2      | 4      | GitHub Actions ランナーは2コアだが、I/O待ち時間を活用 |
| fileParallelism | false  | true   | メモリ8GB割り当てで安定動作を確認後に有効化           |

### 4. カバレッジ計測の条件分岐

**条件分岐ロジック**:

| 条件                             | カバレッジ | 理由                   |
| -------------------------------- | ---------- | ---------------------- |
| PR（draft以外）                  | なし       | 高速フィードバック優先 |
| main ブランチ push               | あり       | 品質メトリクス維持     |
| 手動dispatch（カバレッジ要求時） | あり       | オプション対応         |

**カバレッジ戦略の詳細（品質担保の仕組み）**:

PR時のカバレッジ計測スキップは以下の理由で安全です：

1. **ローカルのしきい値チェック**（vitest.config.ts）:

   ```typescript
   thresholds: {
     lines: 80,
     functions: 80,
     branches: 60,
     statements: 80,
   }
   ```

   - `pnpm test:run --coverage` 実行時にしきい値をチェック
   - しきい値を下回るとテストが**失敗**する
   - 開発者はPR作成前にローカルでカバレッジを確認可能

2. **mainマージ時のCodecovチェック**（codecov.yml）:

   ```yaml
   coverage:
     status:
       project:
         default:
           target: 80%
           threshold: 1%
       patch:
         default:
           target: 80%
           threshold: 1%
   ```

   - mainブランチで80%を維持（1%の変動許容）
   - patchカバレッジも80%以上が必要

3. **品質フロー**:
   ```
   ローカル開発 → カバレッジ確認 → PR作成（高速CI） → mainマージ（フルカバレッジ） → Codecov検証
   ```

**注意**: 品質を最優先する場合は、PR時もカバレッジ計測を維持するオプションも選択可能。ただし、主なボトルネックはカバレッジ計測ではなくテスト実行時間そのものであるため、提案する最適化（シャード16、maxForks 4）でCI時間を大幅に短縮可能。

### 5. カバレッジ改善（78.68% → 80%以上）

**現在のカバレッジ状況**:

| 項目       | 現在値 | しきい値 | 差分   |
| ---------- | ------ | -------- | ------ |
| lines      | 78.68% | 80%      | -1.32% |
| statements | 78.68% | 80%      | -1.32% |
| branches   | -      | 60%      | 達成済 |
| functions  | -      | 80%      | 要確認 |

**未カバーの主要ファイル（優先度順）**:

| ファイル                                       | カバレッジ | 対応方針                 |
| ---------------------------------------------- | ---------- | ------------------------ |
| `src/renderer/utils/devMockAuth.ts`            | 0%         | 開発用モック、除外検討   |
| `src/renderer/views/ChatHistoryView/index.tsx` | 0%         | コンポーネントテスト追加 |
| `src/renderer/slide/SlidePhasePanel.tsx`       | 0%         | コンポーネントテスト追加 |
| `src/renderer/slide/SlideWorkspace.tsx`        | 0%         | コンポーネントテスト追加 |
| `src/renderer/utils/styles.ts`                 | 0%         | ユーティリティ、除外検討 |

**改善戦略**:

1. 開発用・スタイル系ファイルをカバレッジ除外に追加
2. 主要コンポーネントにテストを追加
3. 80%達成を確認

### 6. ローカル環境安定化（better-sqlite3）

**問題**: pnpmグローバルストア内のbetter-sqlite3がx86_64でビルドされ、arm64のNode.jsで読み込めない

**解決策**:

```bash
# グローバルストア内で直接リビルド
cd /Users/dm/Library/pnpm/global/5/.pnpm/better-sqlite3@12.6.2/node_modules/better-sqlite3
npm rebuild
```

**恒久対策（package.jsonに追加）**:

```json
{
  "scripts": {
    "postinstall": "pnpm rebuild better-sqlite3 || true"
  }
}
```

## システム仕様参照（aiworkflow-requirements）

> 実装前に必ず以下のシステム仕様を確認し、既存設計との整合性を確保してください。

| 参照資料           | パス                                                                         | 内容                            |
| ------------------ | ---------------------------------------------------------------------------- | ------------------------------- |
| DevOps技術スタック | `.claude/skills/aiworkflow-requirements/references/technology-devops.md`     | CI/CDツール選定、Vitest設定基準 |
| モノレポ構成       | `.claude/skills/aiworkflow-requirements/references/architecture-monorepo.md` | pnpm workspace構成、依存関係    |
| テスト戦略         | `.claude/skills/aiworkflow-requirements/references/testing-strategy.md`      | カバレッジ基準、テスト分類      |

## 受け入れ基準

### 機能要件

| AC-ID | 基準                                                 | 検証方法                   |
| ----- | ---------------------------------------------------- | -------------------------- |
| AC-1  | 各test-desktopシャードの実行時間が10分以下になること | CI実行ログで確認           |
| AC-2  | 全体CI時間が12分以下になること                       | GitHub Actions Summary確認 |
| AC-3  | 既存テストが全てPASSすること                         | CI実行結果                 |
| AC-4  | main ブランチマージ時にカバレッジが計測されること    | Codecovレポート確認        |
| AC-5  | PR時はカバレッジ計測がスキップされること             | CI実行ログで確認           |
| AC-6  | shared packageビルドがキャッシュされること           | "Cache hit"ログ確認        |
| AC-7  | カバレッジが80%以上になること                        | ローカル・CIで確認         |
| AC-8  | better-sqlite3がローカルで正常動作すること           | テスト実行で確認           |

### 非機能要件

| NFR-ID | 基準                                                      | 検証方法         |
| ------ | --------------------------------------------------------- | ---------------- |
| NFR-1  | 既存のカバレッジ閾値（Line 80%+）が維持されること         | Codecovレポート  |
| NFR-2  | CI実行の信頼性が維持されること（Flaky testの増加なし）    | 複数回実行で確認 |
| NFR-3  | キャッシュヒット率が80%以上になること（依存関係未変更時） | CI実行ログ分析   |

## Phase構成

| Phase | 名称                 | 目的                               |
| ----- | -------------------- | ---------------------------------- |
| 1     | 要件定義             | 最適化要件の明確化                 |
| 2     | 設計                 | CI構成変更の設計                   |
| 3     | 設計レビューゲート   | 設計の妥当性検証                   |
| 4     | テスト作成           | CI変更のテストシナリオ作成         |
| 5     | 実装                 | ci.yml、vitest.config.ts の変更    |
| 6     | テスト拡充           | 追加検証シナリオ                   |
| 7     | テストカバレッジ確認 | カバレッジ維持確認                 |
| 8     | リファクタリング     | CI設定の整理                       |
| 9     | 品質保証             | 品質ゲートクリア確認               |
| 10    | 最終レビューゲート   | 全体的な品質検証                   |
| 11    | 手動テスト検証       | 実環境でのCI動作確認               |
| 12    | ドキュメント更新     | 技術ドキュメント・システム仕様更新 |
| 13    | PR作成               | 変更のマージ                       |

## リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                             |
| ------------------------------ | ------ | -------- | -------------------------------- |
| シャード増加によるランナー不足 | 中     | 低       | concurrencyで同時実行数を制限    |
| maxForks増加によるメモリ不足   | 高     | 中       | 段階的に増加、メモリ監視         |
| キャッシュ無効化による遅延     | 中     | 低       | restore-keysでフォールバック設定 |
| Flaky testの増加               | 中     | 低       | 複数回テスト実行で検証           |

## 成果物一覧

| Phase | 成果物               | パス                                            |
| ----- | -------------------- | ----------------------------------------------- |
| 1     | 要件定義書           | `outputs/phase-1/requirements-definition.md`    |
| 2     | 設計書               | `outputs/phase-2/architecture-design.md`        |
| 3     | 設計レビュー結果     | `outputs/phase-3/design-review-result.md`       |
| 4     | テスト仕様書         | `outputs/phase-4/test-specification.md`         |
| 5     | 変更後CI設定         | `.github/workflows/ci.yml`                      |
| 5     | 変更後Vitest設定     | `apps/desktop/vitest.config.ts`                 |
| 9     | 品質レポート         | `outputs/phase-9/quality-report.md`             |
| 11    | 手動テスト結果       | `outputs/phase-11/manual-test-result.md`        |
| 12    | 実装ガイド           | `outputs/phase-12/implementation-guide.md`      |
| 12    | ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`   |
| 12    | 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md` |
| 13    | PR情報               | `outputs/phase-13/pr-info.md`                   |

## 変更履歴

| 日付       | 変更内容                                                         |
| ---------- | ---------------------------------------------------------------- |
| 2026-02-02 | 初版作成                                                         |
| 2026-02-02 | カバレッジ改善（78.68%→80%）をスコープに追加                     |
| 2026-02-02 | better-sqlite3ネイティブモジュールのリビルド手順をスコープに追加 |

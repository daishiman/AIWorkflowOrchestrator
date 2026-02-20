# Vitest 非同期エラーハンドリングパターンの標準化・共通ユーティリティ化

## メタ情報

```yaml
issue_number: 838
```

## メタ情報

| 項目         | 内容                                                                  |
| ------------ | --------------------------------------------------------------------- |
| タスクID     | task-ref-vitest-async-error-pattern-001                               |
| タスク名     | Vitest 非同期エラーハンドリングパターンの標準化・共通ユーティリティ化 |
| 分類         | リファクタリング                                                      |
| 対象機能     | テスト基盤（Vitest / 非同期テストパターン）                           |
| 優先度       | 中                                                                    |
| 見積もり規模 | 中規模                                                                |
| ステータス   | 未実施                                                                |
| 発見元       | TASK-FIX-10-1-VITEST-ERROR-HANDLING Phase 5（実装パターン発見）       |
| 発見日       | 2026-02-19                                                            |

## 1. なぜこのタスクが必要か（Why）

### 背景

TASK-FIX-10-1-VITEST-ERROR-HANDLING で `dangerouslyIgnoreUnhandledErrors: true` を Vitest 設定から削除し、未ハンドルの Promise 拒否やエラーがテストを正しく失敗させるよう修正した。この過程で、テストの修正にあたり5つの非同期エラーハンドリングパターンが発見・適用された:

1. **Promise 拒否キャッチ**: `expect(asyncFn()).rejects.toThrow()` による明示的な拒否アサーション
2. **Mock リジェクション値**: `mockRejectedValue` / `mockRejectedValueOnce` による非同期エラーシミュレーション
3. **afterEach クリーンアップ**: `vi.restoreAllMocks()` によるモック状態の完全リセット
4. **タイマー管理**: `fakeTimers` + `clearTimeout`/`clearInterval` による確定的タイマーテスト
5. **エラーバウンダリ**: try/catch による非同期エラーのハンドリングとアサーション

これらのパターンは `apps/desktop/src/test/async-error-handling.test.ts` にリファレンス実装として存在するが、プロジェクト全体の約10,000件のテストでは統一されていない。

### 問題点・課題

- 非同期エラーハンドリングパターンがテストファイルごとに異なる実装で散在している
- `vi.clearAllMocks()` / `vi.resetAllMocks()` / `vi.restoreAllMocks()` が混在し、各テストで異なるリセット戦略を使用している
- `dangerouslyIgnoreUnhandledErrors` を削除した状態で、新規テスト作成時に非同期エラーを正しくハンドルしないテストが追加されるリスクがある
- リファレンス実装（`async-error-handling.test.ts`）は存在するが、共通ユーティリティとして再利用可能な形に整理されていない

### 放置した場合の影響

| 影響領域     | 影響                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| テスト安定性 | 新規テスト追加時に未ハンドル Promise 拒否による偽陽性テスト失敗が再発する      |
| 開発速度     | テスト作成者が非同期エラーパターンを毎回調査する必要があり、学習コストが高い   |
| コード品質   | モックリセット戦略の不統一がテスト間の状態リーク（P9）の原因となる             |
| 保守性       | パターンが散在しているため、ベストプラクティスの変更時に全テストへの反映が困難 |

## 2. 何を達成するか（What）

### 目的

5つの非同期エラーハンドリングパターンを共通テストユーティリティとして標準化し、プロジェクト全体のテストで一貫した非同期エラーハンドリングを実現する。

### 最終ゴール

- 共通テストユーティリティが作成され、非同期エラーハンドリングのヘルパー関数が提供されている
- 既存テストのモックリセット戦略が統一されている（`vi.restoreAllMocks()` に標準化）
- テスト作成ガイドラインが更新され、非同期テストのベストプラクティスが明文化されている
- ESLint ルールまたはカスタムルールで非推奨パターンを検知できる

### スコープ

**含むもの**:

- 共通テストユーティリティの設計・実装（`apps/desktop/src/test/utils/` 配下）
- モックリセット戦略の統一（`vi.restoreAllMocks()` への標準化）
- タイマーテスト用ヘルパーの作成（`advanceTimersByTime` ベース）
- テスト作成ガイドラインの更新
- 既存テストの段階的リファクタリング計画の策定

**含まないもの**:

- 全既存テストの一括リファクタリング（段階的移行計画の策定まで）
- happy-dom / jsdom 環境切り替えの自動化
- テストフレームワーク自体の変更

### 成果物

| 種別   | 成果物                     | 配置先                                                                            |
| ------ | -------------------------- | --------------------------------------------------------------------------------- |
| 実装   | 共通テストユーティリティ   | `apps/desktop/src/test/utils/async-error-helpers.ts`                              |
| 実装   | タイマーテスト用ヘルパー   | `apps/desktop/src/test/utils/timer-helpers.ts`                                    |
| 実装   | 共通 setup ファイル更新    | `apps/desktop/src/test/setup.ts`                                                  |
| テスト | ユーティリティ自体のテスト | `apps/desktop/src/test/utils/__tests__/`                                          |
| 文書   | テスト作成ガイドライン更新 | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` |
| 文書   | リファクタリング計画       | `docs/30-workflows/` 配下                                                         |

## 3. どのように実行するか（How）

### 前提条件

- TASK-FIX-10-1-VITEST-ERROR-HANDLING が完了していること（`dangerouslyIgnoreUnhandledErrors` が削除済み）
- `apps/desktop/src/test/async-error-handling.test.ts` がリファレンス実装として存在すること

### 3.4 推奨アプローチ

1. **現状調査**: プロジェクト全体のモックリセットパターンと非同期エラーハンドリングの使用状況を `grep` で網羅的に調査する
2. **共通ユーティリティ設計**: 5つのパターンを再利用可能なヘルパー関数として抽象化する
3. **setup.ts 統一**: `vi.restoreAllMocks()` を共通 `afterEach` に組み込み、個別テストでの記述を不要にする
4. **タイマーヘルパー作成**: `advanceTimersByTime` ベースの安全なタイマー操作ヘルパーを実装する（`runAllTimers` の使用を非推奨化）
5. **段階的移行計画**: 既存テストの優先度別リファクタリングロードマップを策定する
6. **ガイドライン更新**: テスト作成時の非同期エラーハンドリングのベストプラクティスを明文化する

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                                                                          | 発見経緯                                                                                                                          | 解決策                                                                                                                                                          | 教訓                                                                                                                   |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `dangerouslyIgnoreUnhandledErrors` 削除時の影響テスト特定困難                 | 全テスト実行（10,189件）で初めて問題パターンが判明した。事前にどのテストが影響を受けるか特定するのが困難だった                    | 非同期エラーパターンのLint検出ルールを導入し、`dangerouslyIgnoreUnhandledErrors` に依存するテストを事前検知可能にする                                           | 設定変更の影響範囲は全テスト実行で確認する。部分実行では検出漏れが発生する                                             |
| `vi.clearAllMocks()` vs `vi.resetAllMocks()` vs `vi.restoreAllMocks()` の混在 | 各テストで異なるリセット戦略を使用しており、テスト間の状態リーク（P9）の原因が切り分けにくかった                                  | `vi.restoreAllMocks()` に統一する。`clearAllMocks` はモック実装を保持するため状態リークの原因になりうる。`restoreAllMocks` は元の実装に完全復元するため最も安全 | モックリセットは「最も厳密なリセット」をデフォルトにする。緩いリセットが必要な場合のみ明示的に使い分ける               |
| タイマーテストで `runAllTimers` 使用時の無限ループ（P13）                     | setTimeout + Promise + 再スケジュールのパターンで `vi.runAllTimers()` が無限ループした                                            | `vi.advanceTimersByTime()` で1ステップずつ進める安全なヘルパーを提供する。`runAllTimers` の使用をガイドラインで非推奨化する                                     | 再帰的タイマースケジューリングがあるコードでは `runAllTimers` は危険。`advanceTimersByTime` で制御可能な進行を選択する |
| happy-dom 環境での `userEvent` 非互換（P39）                                  | `@testing-library/user-event` の `userEvent.setup()` が happy-dom 環境で `Symbol` 操作エラーを起こし、49/53テストが一斉に失敗した | happy-dom 環境では `fireEvent` を使用する。非同期ハンドラは `await act(async () => { fireEvent.click(el) })` で包む。テスト環境の判定ヘルパーを提供する         | テストライブラリの互換性はDOM実装に依存する。環境に応じたイベント発火ヘルパーを共通化することで、環境差異を吸収する    |

## 4. 実行手順

### Phase 構成

| Phase    | 名称             | 目的                                     |
| -------- | ---------------- | ---------------------------------------- |
| Phase 1  | 要件定義         | 現状調査・パターン分類・統一方針の決定   |
| Phase 2  | 設計             | 共通ユーティリティのインターフェース設計 |
| Phase 3  | 設計レビュー     | 設計の妥当性検証                         |
| Phase 4  | テスト作成       | ユーティリティ自体のテストケース設計     |
| Phase 5  | 実装             | 共通ユーティリティの実装・setup.ts 更新  |
| Phase 6  | テスト拡充       | エッジケース・環境差異テストの追加       |
| Phase 7  | カバレッジ確認   | ユーティリティのカバレッジ基準充足確認   |
| Phase 8  | リファクタリング | コード品質改善・不要パターンの整理       |
| Phase 9  | 品質検証         | Lint・型チェック・全テスト実行           |
| Phase 10 | 最終レビュー     | 多角的品質・整合性検証                   |
| Phase 11 | 手動テスト       | 既存テストとの互換性確認                 |
| Phase 12 | ドキュメント     | ガイドライン更新・仕様書更新             |
| Phase 13 | 完了             | 成果物最終確認・PR準備                   |

### 主要タスク詳細

#### Phase 1: 現状調査

1. `grep -rn "vi.clearAllMocks\|vi.resetAllMocks\|vi.restoreAllMocks" apps/desktop/src/` でリセット戦略の分布を調査
2. `grep -rn "rejects.toThrow\|mockRejectedValue\|mockRejectedValueOnce" apps/desktop/src/` で非同期エラーパターンの使用状況を調査
3. `grep -rn "runAllTimers\|advanceTimersByTime\|fakeTimers" apps/desktop/src/` でタイマーパターンを調査
4. 調査結果を分類し、統一方針を決定

#### Phase 5: 実装

1. `async-error-helpers.ts` に Promise 拒否アサーション・Mock リジェクションのヘルパーを実装
2. `timer-helpers.ts` に安全なタイマー操作ヘルパーを実装
3. `setup.ts` の `afterEach` に `vi.restoreAllMocks()` を追加
4. 既存テストとの互換性を確認

## 5. 完了条件チェックリスト

- [ ] 共通テストユーティリティ（`async-error-helpers.ts`）が作成されている
- [ ] タイマーテスト用ヘルパー（`timer-helpers.ts`）が作成されている
- [ ] `setup.ts` に `vi.restoreAllMocks()` が共通 `afterEach` として組み込まれている
- [ ] ユーティリティ自体のテストがすべて PASS している
- [ ] 既存テスト（10,000件以上）が全て PASS している（リグレッションなし）
- [ ] `dangerouslyIgnoreUnhandledErrors` が設定されていないことが確認されている
- [ ] テスト作成ガイドライン（`testing-component-patterns.md`）が更新されている
- [ ] 段階的リファクタリング計画が文書化されている
- [ ] `pnpm lint` / `pnpm typecheck` が通ること

## 6. 検証方法

### 自動検証

```bash
# 共通ユーティリティのテスト実行
cd apps/desktop && pnpm vitest run src/test/utils/

# 全テスト実行（リグレッション確認）
cd apps/desktop && pnpm vitest run

# dangerouslyIgnoreUnhandledErrors が存在しないことを確認
grep -rn "dangerouslyIgnoreUnhandledErrors" apps/desktop/vitest.config.ts

# モックリセット戦略の統一確認
grep -rn "vi.clearAllMocks\|vi.resetAllMocks" apps/desktop/src/ --include="*.test.ts" | wc -l
# → 段階的移行のため、件数が減少していることを確認

# 型チェック
pnpm --filter @repo/desktop exec tsc --noEmit
```

### 手動検証

1. 新規テストファイルを作成し、共通ユーティリティを import して非同期エラーテストが記述できることを確認
2. `runAllTimers` を含むテストを `advanceTimersByTime` ヘルパーに置き換えて動作確認
3. happy-dom 環境で `fireEvent` ヘルパーが正しく動作することを確認

## 7. リスクと対策

| リスク                                                          | 影響度 | 発生確率 | 対策                                                                                                                                   |
| --------------------------------------------------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `setup.ts` への `vi.restoreAllMocks()` 追加で既存テストが壊れる | 高     | 中       | 段階的に導入し、影響を受けるテストを事前特定する。`vi.spyOn` で実装を保持する必要があるテストは個別に `afterEach` をオーバーライドする |
| 共通ヘルパーの過度な抽象化                                      | 中     | 低       | リファレンス実装の5パターンに限定し、不要な汎用化を避ける                                                                              |
| 既存テストのリファクタリング量が想定以上                        | 中     | 中       | 段階的移行計画を策定し、優先度の高いテストから順次対応する。全テスト一括変更は行わない                                                 |
| タイマーヘルパーが特定のタイマーパターンに対応できない          | 低     | 低       | `advanceTimersByTime` のラッパーとして実装し、低レベルAPIへのフォールバックを可能にする                                                |

## 8. 参照情報

### システム仕様書

- `.claude/skills/aiworkflow-requirements/references/quality-requirements.md` - テスト品質要件、`dangerouslyIgnoreUnhandledErrors` 未設定ルール
- `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` - Vitest + RTL + happy-dom パターン集
- `.claude/skills/aiworkflow-requirements/references/lessons-learned.md` - テスト環境教訓、モックリセット戦略
- `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` - `fireEvent` vs `userEvent` 使い分けパターン

### 既知の落とし穴

- `.claude/rules/06-known-pitfalls.md` P9 - モジュールスコープ変数のテスト間リーク
- `.claude/rules/06-known-pitfalls.md` P13 - タイマーテストの無限ループ（`runAllTimers` 禁止）
- `.claude/rules/06-known-pitfalls.md` P22 - Vitest Worker の予期しない終了
- `.claude/rules/06-known-pitfalls.md` P39 - happy-dom 環境での `userEvent` 非互換
- `.claude/rules/06-known-pitfalls.md` P40 - テスト実行ディレクトリ依存（モノレポ）

### リファレンス実装

- `apps/desktop/src/test/async-error-handling.test.ts` - 5パターンのリファレンス実装
- `apps/desktop/src/test/vitest-config.test.ts` - Vitest 設定の検証テスト

### 親タスク

- `docs/30-workflows/TASK-FIX-10-1-VITEST-ERROR-HANDLING/` - 親タスクの全成果物

## 9. 備考

### 補足事項

- 本タスクは共通ユーティリティの作成と段階的移行計画の策定が主目的であり、全既存テストの一括リファクタリングはスコープ外とする
- `vi.restoreAllMocks()` の `setup.ts` 統合は、既存テストへの影響が大きいため、Phase 5 で互換性テストを十分に実施してから本番適用する
- `runAllTimers` → `advanceTimersByTime` の移行は、P13（タイマー無限ループ）の再発防止として優先度が高い
- happy-dom 環境での `fireEvent` ヘルパーは、P39（`userEvent` 非互換）の恒久対策として位置づける
- テスト実行は必ず `cd apps/desktop` から行うこと（P40 対策）

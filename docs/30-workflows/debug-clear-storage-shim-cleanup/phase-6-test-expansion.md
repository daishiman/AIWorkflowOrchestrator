# Phase 6: テスト拡充 - タスク仕様書

## メタ情報

| 項目       | 内容                                        |
| ---------- | ------------------------------------------- |
| タスクID   | UT-FIX-DEBUG-CLEAR-STORAGE-SHIM-CLEANUP-001 |
| Phase      | 6                                           |
| Phase名    | テスト拡充                                  |
| カテゴリ   | 改善                                        |
| ステータス | not_started                                 |
| 前提Phase  | Phase 5                                     |
| 後続Phase  | Phase 7                                     |

## 目的

Phase 5 の実装完了後、カバレッジ不足箇所を特定し、追加テストを作成する。特に e2e / screenshot script の統合テストを拡充し、`skipAuth` / `VITE_E2E_MODE` 経由の認証バイパスが引き続き正常動作することを確認する。

## 実行タスク

- タスク1: Phase 5 実装後のカバレッジ計測を実施する
- タスク2: e2e preflight の統合テストを拡充する
- タスク3: screenshot script の統合テストを拡充する
- タスク4: 認証バイパス機構の回帰テストを作成する

### タスク1: カバレッジ計測

**目的**: Phase 4-5 のテスト・実装後のカバレッジ状況を把握し、不足箇所を特定する

**手順**:

1. `pnpm --filter @repo/desktop exec vitest run --coverage` でカバレッジレポートを取得する
2. Phase 5 で変更した各ファイルのカバレッジを確認する
3. Line Coverage 80%未満 / Branch Coverage 60%未満 / Function Coverage 80%未満の箇所をリスト化する
4. リストを元にタスク2〜4 の追加テスト範囲を決定する

**カバレッジ基準**:

| 指標              | 最低基準 | 推奨基準 |
| ----------------- | -------- | -------- |
| Line Coverage     | 80%      | 90%      |
| Branch Coverage   | 60%      | 70%      |
| Function Coverage | 80%      | 90%      |

### タスク2: e2e preflight 統合テスト拡充

**目的**: `debug-clear-storage` 除去後の e2e preflight が正常に動作することを統合テストで検証する

**テストファイル**: `apps/desktop/src/__tests__/e2e-preflight-integration.test.ts`

**テストケース設計**:

| #   | テストケース                                                            | 期待結果                                        | 対応AC |
| --- | ----------------------------------------------------------------------- | ----------------------------------------------- | ------ |
| 6-1 | `VITE_E2E_MODE=true` 時に認証バイパスが有効になる                       | 認証画面をスキップしてメイン画面に到達する      | AC-3   |
| 6-2 | `skipAuth=true` 時に認証バイパスが有効になる                            | 認証画面をスキップしてメイン画面に到達する      | AC-3   |
| 6-3 | preflight 処理が `sessionStorage` の `debug-clear-storage` に依存しない | `sessionStorage` に該当キーが存在しなくても正常 | AC-3   |
| 6-4 | preflight 処理が `localStorage.clear()` を呼び出さない                  | Zustand persist データが破壊されない            | AC-7   |

**実装方針**:

- e2e global-setup の関数を import してユニットテストレベルで検証する
- `sessionStorage` / `localStorage` のモックを使用して副作用を検証する
- happy-dom 環境では `fireEvent` を使用する（P39 準拠）
- テスト間で状態を共有しない（`beforeEach` でモックをリセット）（P9 準拠）

### タスク3: screenshot script 統合テスト拡充

**目的**: screenshot script が `debug-clear-storage` / `localStorage.clear()` に依存せず正常動作することを検証する

**テストファイル**: `apps/desktop/src/__tests__/screenshot-no-storage-clear.test.ts`

**テストケース設計**:

| #   | テストケース                                                | 期待結果                                         | 対応AC |
| --- | ----------------------------------------------------------- | ------------------------------------------------ | ------ |
| 6-5 | screenshot script が `localStorage.clear()` を呼び出さない  | storage clear なしでスクリーンショット取得が可能 | AC-3   |
| 6-6 | screenshot script が `debug-clear-storage` キーを参照しない | 該当キーへのアクセスが存在しない                 | AC-2   |
| 6-7 | screenshot harness が bug path metadata から分離されている  | 苦戦1の教訓が適用されていること                  | AC-2   |

**実装方針**:

- screenshot script のソースコードを静的解析で検証する
- 可能であれば screenshot 取得関数を import して動作テストを行う
- CI/CD 環境でも実行可能なテスト設計にする

### タスク4: 認証バイパス機構の回帰テスト

**目的**: `debug-clear-storage` 除去によって既存の認証バイパス機構が壊れていないことを検証する

**テストファイル**: `apps/desktop/src/__tests__/auth-bypass-regression.test.ts`

**テストケース設計**:

| #    | テストケース                                                               | 期待結果                                           | 対応AC |
| ---- | -------------------------------------------------------------------------- | -------------------------------------------------- | ------ |
| 6-8  | `VITE_E2E_MODE` 環境変数が設定されていない場合、認証が通常フローで動作する | AuthGuard が通常の認証チェックを実行する           | AC-7   |
| 6-9  | `skipAuth=true` が URL パラメータに含まれる場合、認証をスキップする        | 認証チェックがバイパスされる                       | AC-7   |
| 6-10 | `dev-skip-auth` が設定されている場合の動作が正常である                     | 開発モードでの認証スキップが機能する               | AC-7   |
| 6-11 | 認証バイパスが `debug-clear-storage` に一切依存していないこと              | `debug-clear-storage` キーの有無に関わらず動作する | AC-3   |

**実装方針**:

- AuthGuard コンポーネントの認証判定ロジックをテストする
- `sessionStorage` / `localStorage` のモックを使用する
- `debug-clear-storage` キーが存在する場合と存在しない場合の両方をテストし、結果が同一であることを検証する
- happy-dom 環境では `fireEvent` を使用する（P39 準拠）

## 参照資料

| 参照資料       | パス                                                                  | 説明       |
| -------------- | --------------------------------------------------------------------- | ---------- |
| Phase 4 成果物 | Phase 4 のテストファイル群                                            | 基本テスト |
| Phase 5 成果物 | Phase 5 で変更されたファイル群                                        | 実装結果   |
| Phase 2 成果物 | `docs/30-workflows/debug-clear-storage-shim-cleanup/outputs/phase-2/` | 副作用分析 |

### システム仕様（aiworkflow-requirements）

> テスト拡充時に以下のシステム仕様を参照し、テストパターンとカバレッジ基準に準拠してください。

| 参照資料             | パス                                                                              | 内容                                           |
| -------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------- |
| コンポーネントテスト | `.claude/skills/aiworkflow-requirements/references/testing-component-patterns.md` | happy-dom / localStorage polyfill / テスト設計 |
| 品質要件             | `.claude/skills/aiworkflow-requirements/references/quality-requirements.md`       | テストカバレッジ基準・TDD 方針                 |
| E2Eテスト            | `.claude/skills/aiworkflow-requirements/references/quality-e2e-testing.md`        | E2E テスト設計方針・preflight 設計             |
| カバレッジ基準       | `.claude/skills/task-specification-creator/references/coverage-standards.md`      | カバレッジ最低基準・推奨基準                   |
| 教訓集               | `.claude/skills/aiworkflow-requirements/references/lessons-learned.md`            | P9/P13/P39/P40 テスト関連の教訓                |

## 統合テスト連携

- タスク1 のカバレッジ計測結果を元にテスト追加範囲を決定する
- タスク2〜4 の追加テスト完了後、再度カバレッジを計測する
- Phase 7 でカバレッジ基準の充足を最終確認する
- カバレッジ基準未達の場合、本 Phase に戻って追加テストを作成する

## 成果物

| 成果物                   | パス                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| カバレッジ計測結果       | `pnpm --filter @repo/desktop exec vitest run --coverage` の実行結果 |
| e2e preflight 統合テスト | `apps/desktop/src/__tests__/e2e-preflight-integration.test.ts`      |
| screenshot 統合テスト    | `apps/desktop/src/__tests__/screenshot-no-storage-clear.test.ts`    |
| 認証バイパス回帰テスト   | `apps/desktop/src/__tests__/auth-bypass-regression.test.ts`         |

## 完了条件

- [ ] Phase 5 で変更した全ファイルのカバレッジが計測されていること
- [ ] タスク2〜4 の追加テストファイルが作成されていること
- [ ] 全テストが独立して実行可能であること（P9 準拠）
- [ ] happy-dom 環境で `userEvent` を使用していないこと（P39 準拠）
- [ ] `skipAuth` / `VITE_E2E_MODE` / `dev-skip-auth` による認証バイパスが正常動作することが検証済みであること
- [ ] `pnpm --filter @repo/desktop exec vitest run` で全テスト PASS すること（P40 準拠）
- [ ] Phase 4 + Phase 6 の全テストが GREEN であること
- [ ] 本Phase内の全タスクを100%実行完了

## 次Phase

Phase 7: カバレッジ確認へ進む。カバレッジ基準の充足を最終確認する。

# Phase 9: 品質保証

## メタ情報

| 項目      | 内容                                   |
| --------- | -------------------------------------- |
| Phase     | 9                                      |
| 名称      | 品質保証                               |
| 前提Phase | Phase 8                                |
| 成果物    | lint / typecheck / test 全 PASS の証跡 |

## 目的

修正済みコードに対して lint、TypeScript 型チェック、テストの3つの品質ゲートを全て PASS させ、マージ可能な状態であることを保証する。

## 実行タスク

### タスク 9-1: ESLint を実行する

```bash
pnpm --filter @repo/desktop lint
```

**期待結果**: エラー 0件、ワーニング 0件（新規ワーニングの追加がないこと）

ESLint エラーが発生した場合の対応：

- `no-unused-vars`: `PermissionApi` 型を削除した際に、import が残っていないか確認する
- `@typescript-eslint/no-unnecessary-type-assertion`: `mode as AgentPermissionMode` のキャストを削除した場合に発生する可能性がある
- その他のエラー: Phase 5 に戻って修正する

### タスク 9-2: TypeScript 型チェックを実行する

```bash
pnpm --filter @repo/desktop exec tsc --noEmit
```

**期待結果**: エラー 0件

型エラーが発生した場合の対応：

- `window.permissionAPI` の型解決エラー: `preload/types.ts` の `declare global` ブロックが正しく読み込まれているか確認する
- `getAllowedTools` / `clearAll` の型エラー: `PermissionAPI` interface の定義と実際の呼び出しが一致しているか確認する

### タスク 9-3: テストを実行する

```bash
pnpm --filter @repo/desktop exec vitest run
```

**期待結果**: 全テストスイートが PASS

テスト失敗が発生した場合の対応：

- AgentView 関連テストの失敗: Phase 4 / Phase 6 で作成したモック定義を確認する
- 他のテストの失敗: 本タスクの変更が原因でないことを確認する（`git stash` して再実行し、修正前でも失敗するなら既存の問題）

### タスク 9-4: Prettier フォーマットを確認する

```bash
pnpm --filter @repo/desktop exec prettier --check "src/renderer/views/AgentView/index.tsx"
```

**期待結果**: フォーマット済み（All files are formatted）

フォーマットエラーが発生した場合：

```bash
pnpm --filter @repo/desktop exec prettier --write "src/renderer/views/AgentView/index.tsx"
```

### タスク 9-5: 品質ゲート結果を記録する

| ゲート     | コマンド                           | 結果        |
| ---------- | ---------------------------------- | ----------- |
| ESLint     | `pnpm --filter @repo/desktop lint` | PASS / FAIL |
| TypeScript | `tsc --noEmit`                     | PASS / FAIL |
| Vitest     | `vitest run`                       | PASS / FAIL |
| Prettier   | `prettier --check`                 | PASS / FAIL |

## 参照資料

### システム仕様（aiworkflow-requirements）

| 資料名         | パス                                                                       |
| -------------- | -------------------------------------------------------------------------- |
| Phase 5 実装   | `docs/30-workflows/agentview-permission-api-fix/phase-5-implementation.md` |
| Phase 8 リファ | `docs/30-workflows/agentview-permission-api-fix/phase-8-refactoring.md`    |

## 成果物

| 成果物         | 配置先                                         |
| -------------- | ---------------------------------------------- |
| 品質ゲート結果 | `artifacts.json` の `phase-9` セクションに記録 |

## 完了条件

- [ ] ESLint がエラー 0件で PASS した
- [ ] TypeScript 型チェックがエラー 0件で PASS した
- [ ] Vitest が全テスト PASS した
- [ ] Prettier フォーマットが正しいことを確認した
- [ ] 品質ゲート結果をタスク 9-5 のテーブルに記録した

## 実行手順

### ステップ1: 自動品質ゲートを実行する

lint、typecheck、テストを今回差分に即した単位で実行する。

### ステップ2: 結果を AC と結び付ける

機械結果を AC-01〜AC-06 のどこを支える根拠か明文化する。

### ステップ3: blocker を分離する

今回差分起因と、既存 baseline 問題を切り分けて記録する。

## 統合テスト連携

- Phase 4-7 の結果を束ねて quality gate 判定を行う。
- Phase 10 ではここで整理した結果だけを参照して最終判定できるようにする。

## 多角的チェック観点

| 観点       | 本Phaseでの確認内容                                   |
| ---------- | ----------------------------------------------------- |
| 品質ゲート | lint / typecheck / test が揃っているか                |
| 仕様整合   | 仕様書に書いた確認方法と実コマンドが一致しているか    |
| 依存分離   | baseline failure を current diff の責任にしていないか |

## サブタスク管理

1. lint 実行
2. typecheck 実行
3. test 実行
4. 結果整理
5. 完了条件の確認

## タスク100%実行確認【必須】

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各品質結果の根拠を記録した
- [ ] 最終レビューへ進めるか判断した

## 次のPhase

Phase 10: 最終レビュー

## 統合テスト連携

| 観点         | 内容                                                          |
| ------------ | ------------------------------------------------------------- |
| 静的検証     | lint / typecheck / test の3系統で renderer 契約整合を確認する |
| 実行時安全性 | `permissionAPI` 不在時でも例外にしないことを再確認する        |
| 品質ゲート   | Phase 10 は Phase 9 の PASS 結果を前提に進む                  |

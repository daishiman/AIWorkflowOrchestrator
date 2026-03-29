# UT-RT-06-ESBUILD-ARCH-MISMATCH-001

## メタ情報

| 項目       | 値                                                     |
| ---------- | ------------------------------------------------------ |
| ステータス | 未着手                                                 |
| 優先度     | High                                                   |
| 起票日     | 2026-03-29                                             |
| 起票元     | TASK-RT-06 Phase 10 / Phase 11 / Phase 12              |
| 関連タスク | TASK-RT-06 (claude-sdk-message-contract-normalization) |

## 1. なぜこのタスクが必要か（Why）

RT-06 の vitest 実行において `@esbuild/darwin-arm64` と `@esbuild/darwin-x64` のアーキテクチャ不整合が発生し、`pnpm vitest` が完走できない状態になった。
Rosetta 経由（x64）で動作する Node と native arm64 Node が混在する環境で再現し、RT-06 の品質保証（自動テスト）が確定できないため、CI 信頼性に支障が生じる。

## 2. 何を達成するか（What）

RT-06 対象テストが 1 回実行（non-watch モード）で完了でき、同様の環境不整合が再発しないよう再発防止手順を標準化する。

## 3. どのように実行するか（How）

1. Node/npm 実行アーキテクチャ（Rosetta 有無）を統一する
2. `node_modules` を削除して依存を再インストールする
3. `pnpm vitest run` が通ることを確認する
4. 再発防止手順を `docs/` に文書化する

## 3.5 苦戦箇所と解決策

| 苦戦箇所                       | 原因                                                                                                                                             | 解決策                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| esbuild バイナリの arch 不整合 | Rosetta 経由の Node（x64）で `pnpm install` した後、native arm64 Node で vitest を実行すると `@esbuild/darwin-arm64` が不足する                  | arm64 環境で `node_modules` を削除し `pnpm install` し直す。またはシェル設定で `arch -arm64` を明示 |
| テスト結果の不確定             | RT-06 の `RuntimeSkillCreatorFacade.sdk-normalization.test.ts` がアーキ不整合により実行できず、P4-01〜P4-07 の正常動作を機械的に検証できなかった | 環境修正後にテストを再実行して品質証跡を確定させる                                                  |
| 再現条件の特定が困難           | Rosetta による透過的なアーキ切替で「どのプロセスが x64 か」が分かりにくい                                                                        | `node -e "process.arch"` と `file $(which node)` で明示的に確認する手順を文書化                     |

## 4. 実行手順

1. 現在の Node アーキテクチャを確認する
   ```bash
   node -e "process.arch"
   file $(which node)
   ```
2. arm64 Native Node を使用しているか確認し、必要であれば切替
3. `node_modules` を削除して再インストール
   ```bash
   rm -rf node_modules
   pnpm install
   ```
4. RT-06 対象テストを実行して完走を確認
   ```bash
   pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
   ```
5. 再発防止手順を `docs/` に文書化する

## 5. 完了条件チェックリスト

- [ ] RT-06 対象テストが watch ではなく 1 回実行で完了できる
- [ ] esbuild arch 不整合エラーが発生しない
- [ ] 同様の環境で再現手順が文書化されている

## 6. 検証方法

```bash
node -e "process.arch"  # arm64 であること
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

## 7. リスクと対策

- リスク: arm64 と x64 の Node が混在する CI 環境で再発する
- 対策: CI の Node バージョン設定に `arch` 明示を追加し、`.nvmrc` / `.node-version` で固定する

## 8. 参照情報

- `docs/30-workflows/skill-creator-agent-sdk-lane/step-08-par-task-rt-06-claude-sdk-message-contract-normalization/outputs/phase-12/unassigned-task-detection.md`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts`

## 9. 備考

本タスクは環境修正系（High）。RT-06 の品質証跡を確定させるために優先度高で対応が必要。
`aiworkflow-requirements` の `task-workflow-backlog.md` にも登録すること。

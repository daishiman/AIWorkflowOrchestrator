# Phase 2: 設計 — 成果物

## メタ情報

| 項目       | 値                                      |
| ---------- | --------------------------------------- |
| Phase      | 2                                       |
| 機能名     | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日     | 2026-03-29                              |
| ステータス | 完了                                    |

## 設計概要

diagnose → recover → verify → document の最短フローを current arch 基準で再現可能に設計。

## 診断フロー

| ステップ | コマンド                                             | 期待結果                    | 失敗時の対応          |
| -------- | ---------------------------------------------------- | --------------------------- | --------------------- |
| 1        | `node -p "process.arch"`                             | `arm64` または `x64`        | Node 実行経路を見直す |
| 2        | `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"` | `darwin-arm64` etc.         | shell 設定を見直す    |
| 3        | `ls node_modules/@esbuild/`                          | `$EXPECTED_PLATFORM` が存在 | 再インストールへ進む  |

## 復旧フロー

```bash
rm -rf node_modules
pnpm store prune
pnpm install --force
```

## 検証フロー

```bash
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
ls node_modules/@esbuild/ | grep "$EXPECTED_PLATFORM"
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

## Close-out フロー

- target test が通れば Phase 10 は PASS 判定候補
- 環境 blocker が残れば Phase 10/11/12 で同一未タスク ID に統合
- guide には `process.arch` と `pnpm install --force` を必ず残す

## 設計要点

| 項目         | 設計方針                                    |
| ------------ | ------------------------------------------- |
| 判定基準     | `arm64 固定` ではなく current arch 起点     |
| 主復旧経路   | `pnpm install --force`                      |
| fallback     | full wipe と追加調査                        |
| blocker 管理 | `UT-RT-06-ESBUILD-ARCH-MISMATCH-001` に統合 |

## 完了条件

- [x] 診断フローを設計
- [x] 復旧フローを設計
- [x] blocker 分離ルールを設計
- [x] guide 必須要素を固定
- [x] 本Phase内の全タスクを100%実行完了

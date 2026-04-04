# Phase 2: 設計

## メタ情報

| 項目   | 値                                      |
| ------ | --------------------------------------- |
| Phase  | 2                                       |
| 機能名 | step-ut-rt-06-esbuild-arch-mismatch-001 |
| 作成日 | 2026-03-29                              |

## 目的

diagnose -> recover -> verify -> document の最短フローを、current arch 基準で再現できる形に設計する。

## 実行タスク

- 修正手順設計: current arch から expected platform を算出する
- 復旧手順設計: `pnpm install --force` を主経路にする
- close-out 設計: blocker を Phase 10/11/12 で分離記録する

## 参照資料

| 資料名   | パス                                                                           | 説明             |
| -------- | ------------------------------------------------------------------------------ | ---------------- |
| Phase 1  | `phase-1-requirements.md`                                                      | 要件定義         |
| 未タスク | `docs/30-workflows/unassigned-task/UT-RT-06-ESBUILD-ARCH-MISMATCH-001.md`      | 実行手順の原案   |
| 教訓     | `.claude/skills/aiworkflow-requirements/references/lessons-learned-current.md` | preflight ルール |

## 実行手順

### Step 1: 診断フロー

| ステップ | コマンド                                                                        | 期待結果                           | 失敗時の対応          |
| -------- | ------------------------------------------------------------------------------- | ---------------------------------- | --------------------- |
| 1        | `node -p "process.arch"`                                                        | `arm64` または `x64`               | Node 実行経路を見直す |
| 2        | `EXPECTED_PLATFORM="darwin-$(node -p process.arch)"; echo "$EXPECTED_PLATFORM"` | `darwin-arm64` または `darwin-x64` | shell 設定を見直す    |
| 3        | `ls node_modules/@esbuild/`                                                     | `$EXPECTED_PLATFORM` が存在        | 再インストールへ進む  |

### Step 2: 復旧フロー

```bash
rm -rf node_modules
pnpm store prune
pnpm install --force
```

### Step 3: 検証フロー

```bash
EXPECTED_PLATFORM="darwin-$(node -p process.arch)"
echo "$EXPECTED_PLATFORM"
ls node_modules/@esbuild/ | grep "$EXPECTED_PLATFORM"
pnpm --filter @repo/desktop test:run -- src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.sdk-normalization.test.ts
```

### Step 4: close-out フロー

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

## 統合テスト連携

- 統合ポイント: expected platform 算出 -> esbuild package 整合 -> vitest 実行
- 契約: `node_modules/@esbuild/$EXPECTED_PLATFORM` が存在し target test が起動可能であること

## 成果物

| 成果物 | パス                        | 説明           |
| ------ | --------------------------- | -------------- |
| 設計書 | `outputs/phase-2/design.md` | 本ドキュメント |

## 完了条件

- [x] 診断フローを設計
- [x] 復旧フローを設計
- [x] blocker 分離ルールを設計
- [x] guide 必須要素を固定
- [x] **本Phase内の全タスクを100%実行完了**

## 次のPhase

Phase 3: 設計レビューゲート

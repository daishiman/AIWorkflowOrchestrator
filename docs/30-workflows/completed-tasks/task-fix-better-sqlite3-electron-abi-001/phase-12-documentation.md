# Phase 12: ドキュメント close-out

## メタ情報

| 項目   | 値                                       |
| ------ | ---------------------------------------- |
| Phase  | 12                                       |
| 機能名 | TASK-FIX-BETTER-SQLITE3-ELECTRON-ABI-001 |
| 作成日 | 2026-03-31                               |

## 目的

`better-sqlite3` の再構築フローと `postinstall` 追加の知見を 5成果物に整理し、Phase 13 を blocked のまま扱えるようにする。

## 実行タスク

- Task 12-1: 実装ガイド作成（Part 1/Part 2）
- Task 12-2: システム仕様更新（Step 1: 完了記録は必須、Step 2: domain spec sync は条件付き）
- Task 12-3: ドキュメント更新履歴作成
- Task 12-4: 未タスク検出（0件でも出力必須）
- Task 12-5: スキルフィードバックレポート作成（改善点なしでも出力必須）

## 参照資料

| 資料名                  | パス                                                                           | 説明                                   |
| ----------------------- | ------------------------------------------------------------------------------ | -------------------------------------- |
| 変更対象                | `apps/desktop/package.json`                                                    | `rebuild:native` と `postinstall`      |
| ルート postinstall 正本 | `scripts/setup-native-modules.sh`                                              | Node 側の native module 検証と rebuild |
| Phase 12 close-out 正本 | `.claude/skills/task-specification-creator/references/spec-update-workflow.md` | Step 1/Step 2 と validation            |
| 正本仕様参照            | `.claude/skills/aiworkflow-requirements/indexes/resource-map.md`               | spec sync の入口                       |

## Phase 12 必須成果物

| 成果物               | パス                                             | 役割                      |
| -------------------- | ------------------------------------------------ | ------------------------- |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`       | Part 1/2 の説明と検証手順 |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` | 変更対象と N/A 範囲の整理 |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`    | 変更理由と同期結果の記録  |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`  | 残課題の正式化            |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`      | 再発防止の学び            |

## Task 12-1: 実装ガイド作成

### Part 1: 中学生レベルの説明

- 引っ越しで机を新しい部屋に置いたのに、古い部屋のカギをそのまま使うと入れない。
- `postinstall` は、引っ越しのたびに「カギを今の部屋用に直す」係に相当する。
- これで `better-sqlite3` が Electron の部屋でも開けるように、毎回自動で整える。

### Part 2: 技術者レベルの説明

- 変更対象は `apps/desktop/package.json` の `scripts` セクション。
- 追加するのは `postinstall: "pnpm rebuild:native"` の 1 行だけ。
- `rebuild:native` は既存の `better-sqlite3` / `esbuild` 再構築をまとめた薄いラッパーとして扱う。
- 既存の `scripts/setup-native-modules.sh` は root 側の環境検証・再構築手段として残し、desktop 側の自動化は workspace-local の不足を埋める位置づけにする。
- 検証コマンドは次の 4 つを最低限記録する。
  - `pnpm --filter @repo/desktop rebuild:native`
  - `pnpm install`
  - `pnpm --filter @repo/desktop test:run`
  - `pnpm --filter @repo/desktop dev`

#### TypeScript 型定義（Part 2 必須要件）

（仕様説明用。実装に直接は不要だが、再発時のログ解析や手順の明確化に役立つ。）

```ts
export type AbiNumber = number;

export interface NativeAddonAbiMismatch {
  modulePath: string;
  installedAbi: AbiNumber;
  requiredAbi: AbiNumber;
  message: string;
}

export interface NativeRebuildPlan {
  commands: string[];
  verification: string[];
  rollback: string[];
}
```

#### API シグネチャと使用例（Part 2 必須要件）

IPC 側の使用例（Renderer からの呼び出し）:

```ts
const channel = "conversation:list" as const;
await window.electronAPI.invoke(channel);
```

#### エラーハンドリング/エッジケース（Part 2 必須要件）

- `postinstall` がビルドツール未導入で失敗する場合がある（macOS: Xcode CLT、Windows: VS Build Tools、Linux: build-essential）。
- `pnpm install --ignore-scripts` では `postinstall` が走らないため、手動で `pnpm --filter @repo/desktop rebuild:native` を実行する必要がある。
- worktree / Rosetta / pnpm store の影響で、古い `.node` が残る場合がある（`scripts/setup-native-modules.sh` の存在理由）。

#### 設定可能なパラメータ/定数（Part 2 必須要件）

| 項目            | 例                                                                        | 役割                      |
| --------------- | ------------------------------------------------------------------------- | ------------------------- |
| `NODE_ABI`      | `node -p "process.versions.modules"`                                      | Node 実行時 ABI           |
| `ELECTRON_ABI`  | `pnpm --filter @repo/desktop exec electron -p "process.versions.modules"` | Electron 実行時 ABI       |
| `NEEDS_REBUILD` | `true/false`                                                              | 再構築の判定（script 内） |

## Task 12-2: 仕様更新サマリー

- `system-spec-update-summary.md` には Step 1/Step 2 の実施結果と判断根拠を記録する。
- Step 1（必須）: 完了記録
  - `.claude/skills/aiworkflow-requirements/LOGS.md` 更新
  - `.claude/skills/task-specification-creator/LOGS.md` 更新
  - `aiworkflow-requirements` の台帳（task-workflow / lessons learned / backlog）更新要否を判断し、判断根拠を残す
- Step 2（条件付き）: domain spec sync
  - 今回は新規インターフェース/IPC 契約の追加はない想定のため、基本は `N/A`
  - ただし「install/rebuild の運用契約が仕様として重要になる」と判断した場合は、該当 spec に反映する
- もし後続で root の native セットアップと desktop の `postinstall` を統合するなら、その時点で別タスクとして formalize する。

## Task 12-3: ドキュメント更新履歴

- `CHANGELOG.md` は root canonical のみを更新先として扱う。
- `better-sqlite3` の再構築フローと `postinstall` 追加の関係を、実測ログと合わせて記録する。
- `pnpm install` 後に手動 rebuild を要求しないことを、再現手順とセットで残す。

## Task 12-4: 未タスク検出

- 次のソースを確認し、0件でも `unassigned-task-detection.md` は必ず出力する。
  - Phase 3/10 のレビュー結果（MINOR 指摘）
  - Phase 11 手動テストでの scope 外発見
  - `scripts/setup-native-modules.sh` の限界（Electron 側検証が必要か等）
- 0件の場合も「なぜ 0 件と言えるか」を短く書く。

## Task 12-5: スキルフィードバック

- `pnpm lint` は root のコマンドを使う方が実態に合う。
- Phase 4 の smoke test は Node/Vitest の確認に限定し、Electron ABI の実確認は Phase 11 に寄せた方が分かりやすい。
- Phase 13 は blocked / readiness を成果物にして、PR URL を先に作らない方が運用と一致する。

## 統合テスト連携

Phase 11 の手動テスト結果（Electron 起動ログ + `conversation:list` 応答）を Phase 12 の成果物へ反映し、Phase 10 のゲート判定根拠として残す。

## 多角的チェック観点（AIが判断）

| 観点     | チェック項目                                                                   |
| -------- | ------------------------------------------------------------------------------ |
| 整合性   | AC 番号（AC-1..AC-4）が Phase 1/7/10/11/13 でドリフトしていない                |
| 依存関係 | root `postinstall` と desktop `postinstall` が二重実行になり得る点の扱いが明確 |
| 運用性   | toolchain 不足時の失敗モードと復旧手順が Part 2 に書かれている                 |

## 成果物

| 成果物               | パス                                             |
| -------------------- | ------------------------------------------------ |
| 実装ガイド           | `outputs/phase-12/implementation-guide.md`       |
| 仕様更新サマリー     | `outputs/phase-12/system-spec-update-summary.md` |
| ドキュメント更新履歴 | `outputs/phase-12/documentation-changelog.md`    |
| 未タスク検出レポート | `outputs/phase-12/unassigned-task-detection.md`  |
| スキルフィードバック | `outputs/phase-12/skill-feedback-report.md`      |

## 完了条件

- [ ] `implementation-guide.md` に Part 1/2 の両方がある
- [ ] `system-spec-update-summary.md` に更新対象と N/A 判定がある
- [ ] `documentation-changelog.md` に変更内容と根拠がある
- [ ] `unassigned-task-detection.md` に 0件または follow-up が記録されている
- [ ] `skill-feedback-report.md` に再発防止の学びが記録されている

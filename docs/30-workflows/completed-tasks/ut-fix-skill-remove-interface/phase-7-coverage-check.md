# Phase 7: カバレッジ確認 — skill:remove IPCハンドラ・Preloadインターフェース不整合修正

## メタ情報

| 項目        | 値                                           |
| ----------- | -------------------------------------------- |
| タスクID    | UT-FIX-SKILL-REMOVE-INTERFACE-001            |
| Phase       | 7（カバレッジ確認）                          |
| 前Phase依存 | Phase 6 テスト拡充完了（`outputs/phase-6/`） |
| 担当        | Claude Code                                  |
| 作成日      | 2026-02-20                                   |

## 目的

Phase 6 で拡充したテストケースが、プロジェクトのカバレッジ基準を満たしているかを計測・検証する。未達の場合は Phase 6 に戻り追加テストを作成する。

## 実行タスク

- 参照仕様確認: aiworkflow-requirements と既存実装差分を確認する
- 実装/検証手順定義: 本Phaseで実施する作業を具体化する
- 成果物反映: outputs 配下に結果を記録する

1. カバレッジ計測の実行
2. skill:remove ハンドラ部分のカバレッジ数値確認
3. 基準判定（PASS → Phase 8 / 未達 → Phase 6）

## 参照資料

> 依存Phase成果物参照: Phase 5, Phase 6

| 資料                                | 用途                                            |
| ----------------------------------- | ----------------------------------------------- |
| `02-code-quality.md#カバレッジ基準` | 最低基準・推奨基準の定義                        |
| `06-known-pitfalls.md#P41`          | v8 カバレッジプロバイダのインライン関数カウント |
| `06-known-pitfalls.md#P40`          | テスト実行ディレクトリ依存                      |

## 実行手順

### Step 1: カバレッジ計測実行

実行コマンド（P40準拠: `apps/desktop` ディレクトリから実行）:

```bash
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts --coverage
```

計測対象ファイル: `apps/desktop/src/main/ipc/skillHandlers.ts`

### Step 2: カバレッジ数値の確認

以下のカバレッジ数値を `skillHandlers.ts` のカバレッジレポートから抽出する。

#### カバレッジ基準テーブル

| 指標              | 最低基準 | 推奨基準 | 実測値（記入欄） | 判定（記入欄） |
| ----------------- | -------- | -------- | ---------------- | -------------- |
| Line Coverage     | 80%      | 90%      |                  |                |
| Branch Coverage   | 60%      | 70%      |                  |                |
| Function Coverage | 80%      | 90%      |                  |                |

### Step 3: skill:remove ハンドラの分岐カバレッジ確認

skill:remove ハンドラ（修正後、行140-155相当）には以下の分岐が存在する:

| 分岐                                            | テストカバー状況（記入欄） |
| ----------------------------------------------- | -------------------------- |
| `validation.valid === false`（sender 検証失敗） |                            |
| `validation.valid === true`（sender 検証成功）  |                            |
| `typeof skillName !== "string"`（型不正）       |                            |
| `skillName.trim() === ""`（空/スペースのみ）    |                            |
| 正常パス（全バリデーション通過）                |                            |

期待: 全分岐がテストでカバーされていること。

### Step 4: P41 対策確認

v8 カバレッジプロバイダのインライン関数カウント（P41）を考慮し、以下を確認する:

- `getAllowedWindows: () => [mainWindow]` のインラインアロー関数が SH-RM-07 で明示的に呼ばれていること
- Function Coverage にこのインライン関数が含まれる場合、カバレッジ低下要因にならないことを確認

### Step 5: 判定

#### PASS 条件（Phase 8 へ進行）

3つの指標全てが**最低基準**を満たす:

- Line Coverage ≥ 80%
- Branch Coverage ≥ 60%
- Function Coverage ≥ 80%

#### 未達条件（Phase 6 に戻る）

いずれかの指標が最低基準を下回る場合:

1. 未カバーの行・分岐・関数を特定する
2. カバレッジレポートに未カバー箇所と追加すべきテストケースを記録する
3. Phase 6 に戻りテストを追加する

## 統合テスト連携

| 連携観点             | 本Phaseでの確認内容                                                          |
| -------------------- | ---------------------------------------------------------------------------- |
| Preload→Main IPC契約 | `skill-api.ts` の引数形式と `skillHandlers.ts` の受け口を照合する            |
| バリデーション連携   | sender検証・入力バリデーション・エラーコードの整合を確認する                 |
| テスト連携           | `skillHandlers.test.ts` / `skill-api.test.ts` の期待値と実装契約を一致させる |

## 多角的チェック観点（aiworkflow-requirements）

| 観点               | 参照仕様                                                                                    | 本タスクでの確認ポイント                   |
| ------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| API設計            | `.claude/skills/aiworkflow-requirements/references/api-endpoints.md`                        | `skill:import/remove` チャンネル定義の整合 |
| インターフェース   | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`           | Skill管理API契約（引数・戻り値）整合       |
| アーキテクチャ     | `.claude/skills/aiworkflow-requirements/references/arch-electron-services.md`               | Main/Preload間の責務境界と引数契約         |
| セキュリティ       | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                   | `validateIpcSender` と入力検証の必須要件   |
| Electron IPC       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                | `safeInvoke` とホワイトリスト制約          |
| 実装パターン       | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md` | P23/P42に基づく実装整合                    |
| エラーハンドリング | `.claude/skills/aiworkflow-requirements/references/error-handling.md`                       | `VALIDATION_ERROR` 等の扱い統一            |

## 成果物

| 成果物                 | パス                                 |
| ---------------------- | ------------------------------------ |
| カバレッジ確認レポート | `outputs/phase-7/coverage-report.md` |

### カバレッジ確認レポートの必須記載事項

1. 計測日時
2. 計測コマンド（実行したコマンド全文）
3. `skillHandlers.ts` の Line / Branch / Function Coverage 数値
4. 各分岐のカバー状況テーブル（Step 3 のテーブルを埋めたもの）
5. P41 インライン関数の影響有無
6. 判定結果（PASS / 未達）
7. 未達の場合: 未カバー箇所の一覧と追加すべきテスト案

## 完了条件

- [ ] `pnpm vitest run ... --coverage` を `apps/desktop` ディレクトリから実行している
- [ ] `skillHandlers.ts` のカバレッジ3指標（Line/Branch/Function）を記録している
- [ ] skill:remove ハンドラの全5分岐のカバー状況を確認している
- [ ] P41（インライン関数カウント）の影響を確認している
- [ ] 判定結果を明記している（PASS → Phase 8 / 未達 → Phase 6 へ差し戻し理由を記録）
- [ ] `outputs/phase-7/coverage-report.md` が作成されている

## 次Phase

- **PASS の場合**: Phase 8（リファクタリング）へ進む
- **未達の場合**: Phase 6（テスト拡充）に戻り、未カバー箇所のテストを追加する

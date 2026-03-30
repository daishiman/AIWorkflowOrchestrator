# Phase 2: 設計

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| Phase    | 2                                      |
| 機能名   | workflow-manifest-production-placement |
| 作成日   | 2026-03-29                             |
| タスクID | TASK-P0-03                             |

## 目的

workflow-manifest.json の具体的な構造を設計する。manifest の phase 定義、resource descriptor マッピング、entry/exit hook 定義を確定し、Phase 5 実装で迷いなくファイルを作成できる状態にする。

## 実行タスク

- manifest 構造設計: workflowId、phases、resources、entry/exit の全体構造を決める
- resource descriptor マッピング: skill-creator のディレクトリ構造を resource kind と path へ変換する
- phase 定義: requirements-gathering、plan、execute、verify、improve の 5 phase を設計する
- hook 定義: 各 phase の entryHookId / exitHookId と対応する command を設計する

## 参照資料

| 資料名               | パス                                                                                                 | 説明                    |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------- |
| phase-1 requirements | `phase-1-requirements.md`                                                                            | FR / NFR / 制約         |
| 検証ルール抽出表     | `outputs/phase-1/manifest-validation-rules.md`                                                       | ManifestLoader 検証項目 |
| ディレクトリ棚卸し表 | `outputs/phase-1/directory-inventory.md`                                                             | skill-creator 構造      |
| テストフィクスチャ   | `apps/desktop/src/main/services/runtime/__tests__/fixtures/workflow-manifest/workflow-manifest.json` | 構造リファレンス        |
| ManifestLoader       | `apps/desktop/src/main/services/runtime/ManifestLoader.ts`                                           | 検証ルール              |

## 設計方針

### manifest 全体構造

```json
{
  "schemaVersion": 1,
  "workflowId": "skill-creator",
  "phases": [...],
  "resources": [...],
  "entry": [...],
  "exit": [...]
}
```

### phase 定義設計

| phase ID               | title    | dependsOn              | 説明                           |
| ---------------------- | -------- | ---------------------- | ------------------------------ |
| requirements-gathering | 要件収集 | なし                   | ユーザー要件のヒアリングと整理 |
| plan                   | 計画策定 | requirements-gathering | スキル構造と生成計画の確定     |
| execute                | 実行     | plan                   | スキルファイルの生成           |
| verify                 | 検証     | execute                | 生成結果の品質チェック         |
| improve                | 改善     | verify                 | フィードバックに基づく改善     |

### resource descriptor マッピング設計

| ディレクトリ | resource kind | マッピング方針                                     |
| ------------ | ------------- | -------------------------------------------------- |
| agents/      | agent         | 代表的なエージェント定義ファイルを resource 化する |
| references/  | reference     | 主要リファレンスファイルを resource 化する         |
| schemas/     | schema        | JSON Schema ファイルを resource 化する             |

### hook 定義設計

- entry hook: 各 phase 開始時の validation command（minimal）
- exit hook: 各 phase 完了時の handoff command（minimal）
- hook command は ManifestLoader の string 検証を通過する最小限の記述とする

## 実行手順

### ステップ1: manifest JSON 構造を確定する

schemaVersion、workflowId を固定し、全体の JSON skeleton を作成する。

### ステップ2: phase 定義を確定する

5 phase の id、title、dependsOn、resourceIds、entryHookId、exitHookId を決定する。

### ステップ3: resource descriptor を確定する

skill-creator の代表的ファイルから resource の id、kind、path、phaseIds を決定する。

### ステップ4: hook を確定する

entry/exit hooks の id と command を決定する。

## 統合テスト連携

| 観点                | 実施内容                                             |
| ------------------- | ---------------------------------------------------- |
| schema 互換性       | テストフィクスチャと同一の JSON 構造であること       |
| ManifestLoader 検証 | 設計した構造が全検証項目を通過すること               |
| path 実在性         | resource descriptor の path が実在ファイルを指すこと |

## 多角的チェック観点

| 観点                | この Phase で確認する内容                                          |
| ------------------- | ------------------------------------------------------------------ |
| 構造設計            | manifest の phase と resource の関係が矛盾なく成立しているか       |
| 拡張性              | skill-creator にファイルが追加された際に manifest の変更が最小限か |
| ManifestLoader 準拠 | 設計した構造が検証ルールの全項目を満たすか                         |

## サブタスク管理

1. manifest JSON skeleton 作成
2. phase 定義確定
3. resource descriptor 確定
4. hook 定義確定
5. Phase 3 レビュー input 整理

## 成果物

| 成果物              | パス                                           | 説明                           |
| ------------------- | ---------------------------------------------- | ------------------------------ |
| manifest 構造設計書 | `outputs/phase-2/manifest-structure-design.md` | JSON 全体構造                  |
| resource mapping 表 | `outputs/phase-2/resource-mapping.md`          | ディレクトリ → resource 変換表 |
| phase-hook 対応表   | `outputs/phase-2/phase-hook-mapping.md`        | phase と hook の対応関係       |

## 完了条件

- [ ] manifest の JSON 全体構造が確定している
- [ ] 5 phase の定義が確定している
- [ ] resource descriptor のマッピングが確定している
- [ ] entry/exit hooks が定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

## タスク100%実行確認【必須】

- [ ] Phase 1 を参照した
- [ ] テストフィクスチャの構造を確認した
- [ ] ManifestLoader の検証ルールと照合した
- [ ] skill-creator ディレクトリの実在ファイルを確認した

## 次のPhase

Phase 3: 設計レビュー

# スキルフィードバックレポート（TASK-9E-skill-fork）

## 主な改善点

- Phase 12 成果物で残っていた「未実施」表記を解消し、実施実体と台帳を一致させた。
- `skill:fork` と `skill-creator:fork` の責務混在を検出し、正本仕様へ境界を明記した。
- `SkillForker.validatePath` の prefix一致すり抜けリスクを修正し、境界検証を強化した。

## 苦戦箇所と解決策

| 苦戦箇所              | 症状                                              | 原因                                 | 解決策                                       | 教訓                                     |
| --------------------- | ------------------------------------------------- | ------------------------------------ | -------------------------------------------- | ---------------------------------------- |
| 件数ドリフト（57/59） | Phase成果物と正本仕様で件数が不一致               | 追加テスト後の転記同期漏れ           | TASK-9E文脈を横断抽出し `59（34+25）` に統一 | 件数は正本を1つ決めて転記する            |
| fork契約の責務混同    | `skill:fork` と `skill-creator:fork` の用途が曖昧 | 名前が近く、仕様書間で境界記述が不足 | API/Interface/Architectureへ責務境界を明文化 | 近似チャネルは対比表で記録する           |
| path境界判定の抜け穴  | `/skills-evil` を許す可能性                       | `startsWith` 判定に依存              | `path.relative` 判定へ変更しテスト追加       | 境界検証は prefix ではなく相対パスで行う |

## 同種課題の簡潔解決手順（4ステップ）

1. 正本仕様（`task-workflow.md`）に実測値を固定する。
2. `rg` で関連成果物の旧値を抽出し、対象文脈のみ同期する。
3. `verify-all-specs` / `validate-phase-output` / `verify-unassigned-links` / `audit --diff-from HEAD` を実行する。
4. 未解決の再発要因は `docs/30-workflows/unassigned-task/` に9セクション形式で起票する。

## スキル改善提案

### task-specification-creator

- Phase 12 に「TASK文脈の件数ドリフト検出（正本値との差分抽出）」を追加する。
- `unassigned-task-detection.md` に「raw検出件数」と「精査後件数」を併記するテンプレートを追加する。

### skill-creator

- `references/patterns.md` に「Phase 12 テスト件数再同期」の成功パターンを追加し、再監査時の標準手順化を進める。

# Phase 2 実行結果: 設計

## メタ情報

| 項目     | 値                                                     |
| -------- | ------------------------------------------------------ |
| タスクID | TASK-SKILL-LIFECYCLE-03                                |
| 設計方針 | 単一表導線 + 内部 role 分離 + 既存 store/action 再利用 |

## 設計決定

### 1. `skillCreatorAPI` の位置づけ

- `detectMode` と `improveSkill` は内部 planner/improver として使う。
- create 本体は既存 `window.electronAPI.skill.create` を経由する store action を正本にする。
- これにより `skillCreatorAPI` と wizard/store の二重 create 競合を避ける。

### 2. UI 導線

| 入口                               | 役割              | 方針                                                 |
| ---------------------------------- | ----------------- | ---------------------------------------------------- |
| `SkillManagementPanel` primary CTA | 新しい標準導線    | `ライフサイクルを開始` に変更                        |
| `SkillLifecyclePanel`              | 単一会話フロー UI | request / create / execute / improve を 1 画面で提供 |
| `SkillCreateWizard`                | 補助導線          | `詳細ウィザード` として残す                          |

### 3. 状態遷移

| 現在状態                | ユーザー操作     | 内部処理                                | 次状態              |
| ----------------------- | ---------------- | --------------------------------------- | ------------------- |
| idle                    | request 入力     | なし                                    | request-ready       |
| request-ready           | 方針を決める     | `skillCreator.detectMode`               | planned             |
| request-ready / planned | スキルを生成する | `createSkill()` + `selectSkillByName()` | created             |
| created                 | 実行する         | `executeSkill()`                        | executing           |
| created / executing     | 改善提案を取得   | `skillCreator.improveSkill()`           | improvement-planned |
| improvement-planned     | 詳細分析を開く   | `SkillAnalysisView`                     | detailed-analysis   |

### 4. 内部オーケストレーション境界

| Role     | 実装面                                            | 権限境界                                  |
| -------- | ------------------------------------------------- | ----------------------------------------- |
| Planner  | `skillCreator.detectMode` + session log           | mode 判定のみ。ファイル変更しない         |
| Executor | `useExecuteSkill`                                 | 既存 skill execute 権限・preflight に従う |
| Improver | `skillCreator.improveSkill` + `SkillAnalysisView` | 提案生成と詳細改善を分離する              |

### 5. Task02 との整合

- 会話の入口は 1 つに保ち、内部 role は sidebar 説明に限定する。
- `SkillLifecyclePanel` は standalone route でも動くが、Task02 の共通会話基盤へ移植できるよう state を局所化した。
- UI が未接続でも fallback で `create` と `analysis` へ戻れる。

## 設計判断メモ

| 検討項目                                           | 採用 | 却下理由                                           |
| -------------------------------------------------- | ---- | -------------------------------------------------- |
| `skillCreatorAPI.createSkill` を表導線の正本にする | 却下 | store/create と二重化し、既存権限/再取得導線を壊す |
| lifecycle を list view から別 route に完全分離する | 却下 | Task02 の会話統合前提と逆行する                    |
| wizard を削除する                                  | 却下 | 詳細設定確認 UI としての価値が残る                 |
| internal role を UI タブ化する                     | 却下 | ユーザー導線が増え、AC-4 に反する                  |

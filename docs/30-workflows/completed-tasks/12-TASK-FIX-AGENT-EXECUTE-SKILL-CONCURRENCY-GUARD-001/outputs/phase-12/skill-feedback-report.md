# スキル改善報告

## 使用したスキル

| スキル                     | 役割                                               |
| -------------------------- | -------------------------------------------------- |
| aiworkflow-requirements    | system spec 正本の再監査と同期                     |
| task-specification-creator | workflow / Phase 11-12 / template drift の是正     |
| skill-creator              | 今回の再監査知見を次回以降のテンプレート運用へ戻す |

## 今回見つかったズレ

### 1. `validate-phase-output` の CLI 例が実装と不一致

- 問題: 複数のテンプレートと `task-workflow.md` が `--phase 12` を案内していた
- 実態: スクリプトは workflow path の位置引数のみ受け付ける
- 対応: template / guide / pattern / system spec を一括修正

### 2. Phase 11 harness の Router 入れ子リスク

- 問題: BrowserRouter 配下の review harness で `MemoryRouter` を重ねると描画前にクラッシュする
- 対応: ガイドに「既存 Router 配下では直描画か descendant route を使う」ルールを追記

### 3. completed 扱いと本文 stale の分離

- 問題: `artifacts.json` は completed でも、`phase-10/11/12` 本文と `index.md` が未同期になっていた
- 対応: workflow 本文、artifact registry、index 再生成を同一ターンで実施する方針に更新

## 今回適用した改善

- `task-specification-creator` のコマンド例を修正
- `phase-11-12-guide.md` に harness ルールを追記
- `aiworkflow-requirements/task-workflow.md` の workflow12 判定を現行状態へ更新
- `skill-creator/patterns.md` に current workflow 再監査時の同時同期パターンを追加
- `task-specification-creator/unassigned-task-guidelines.md` に未タスク差分監査タイミングを追加

## 残改善

- `abortExecution` 系の並行ガードは別タスクで扱う

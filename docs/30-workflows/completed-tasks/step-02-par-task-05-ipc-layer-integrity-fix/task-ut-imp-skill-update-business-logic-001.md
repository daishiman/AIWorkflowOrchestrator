# UT-IMP-SKILL-UPDATE-BUSINESS-LOGIC-001: SkillService.updateSkill ビジネスロジック実装

## メタ情報

| 項目         | 内容                                                       |
| ------------ | ---------------------------------------------------------- |
| タスクID     | UT-IMP-SKILL-UPDATE-BUSINESS-LOGIC-001                     |
| タスク名     | SkillService.updateSkill ビジネスロジック実装              |
| 分類         | 改善                                                       |
| 対象機能     | skill:update / SkillService                                |
| 優先度       | 中                                                         |
| 見積もり規模 | 中規模                                                     |
| ステータス   | 未実施                                                     |
| 発見元       | TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 Phase 12 未タスク検出 |
| 発見日       | 2026-03-19                                                 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001` で `skill:update` の dead channel は解消され、Main / Preload / system spec の契約は復旧した。一方で `apps/desktop/src/main/services/skill/SkillService.ts` の `updateSkill()` はログ出力のみのスタブであり、公開済み IPC 契約の先にある実更新処理が未実装のまま残っている。

### 1.2 問題点・課題

| 問題                   | 詳細                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| 実更新が行われない     | `skill:update` を呼んでも Skill の永続データが変化しない                                 |
| 契約と実体の距離がある | Preload / Main は「更新API」として公開済みだが、Service 層はスタブのまま                 |
| キャッシュ整合が未定義 | 更新後に `getDetail()` / `list()` / `getImported()` へどのタイミングで反映するかが未固定 |

### 1.3 放置した場合の影響

- Renderer からは成功に見えても実体が更新されず、障害調査が難しくなる
- `skill:update` の利用開始時に仕様誤認が発生する
- 後続実装で更新対象フィールド・永続化方式・キャッシュ無効化が場当たりになる

---

## 2. 何を達成するか（What）

### 2.1 目的

`skill:update` が「契約だけ存在する状態」から、「安全にスキル情報を更新できる状態」へ進むための実装方針と本体処理を確立する。

### 2.2 最終ゴール

- `SkillService.updateSkill()` が明示的な更新対象だけを受け付ける
- 更新結果がスキル実体へ永続化される
- 更新後に `SkillService` のキャッシュ整合が保たれる
- 正常系 / 失敗系 / セキュリティ境界のテストが追加される

### 2.3 スコープ

#### 含むもの

- `updateSkill()` の実データソース確定
- 更新対象フィールドの明文化
- 永続化処理とキャッシュ更新
- Main / Service / test の整合確認

#### 含まないもの

- Skill Center UI の新規導線追加
- スキル編集画面のUX設計
- 任意フィールドの無制限更新

### 2.4 成果物

- `SkillService.updateSkill()` の本実装
- 追加テスト（正常系 / 失敗系 / キャッシュ整合）
- 実装結果を反映した task workflow / lessons / completed record の同期

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001` の current contract を正本とする
- `skill:update` の payload は `{ skillName, updates }` を維持する
- `P42` / `P44` / `P45` / `P5` を継続遵守する

### 3.2 依存タスク

- TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001

### 3.3 必要な知識

- Skill metadata の保存形式
- `SkillService` / `SkillParser` / `SkillScanner` の責務境界
- 既存の Skill file operations (`skill:readFile` / `writeFile`) の設計

### 3.4 推奨アプローチ

1. まず「何を更新してよいか」を列挙し、`Record<string, unknown>` のまま Service 内で無制限更新しない。
2. 更新元データ（例: `SKILL.md` / 付随メタデータ）の正本を1つに固定する。
3. 永続化後に cache invalidation または再scan 方針を明示し、`getDetail()` と結果が一致することを保証する。
4. もし本実装が大きすぎる場合は、`NOT_IMPLEMENTED` を返す暫定対応よりも、対象フィールドを絞った小さな実装を優先する。

---

## 4. 実行手順

### Phase構成

1. データソースと更新対象フィールドを確定する
2. `updateSkill()` を実装する
3. テストを追加し、キャッシュ整合を検証する
4. 仕様と未タスク台帳を同期する

### Phase 1: 設計

#### 目的

更新対象フィールド、永続化先、エラー条件を固定する。

#### 手順

1. `SkillService` と file operation 系の責務境界を確認する
2. 更新対象フィールドを whitelist 化する
3. 更新失敗時の error contract を決める

#### 完了条件

- 更新対象と対象外が文書化されている
- 永続化先が1つに決まっている

### Phase 2: 実装

#### 目的

`updateSkill()` のスタブを実処理へ置き換える。

#### 手順

1. 対象 skill を `skillName` から解決する
2. metadata を読み込み、許可フィールドだけ反映する
3. 永続化後に cache を更新または無効化する

#### 完了条件

- `updateSkill()` がログ出力のみのスタブではなくなっている
- 更新後に `getDetail()` と整合する

### Phase 3: テスト

#### 目的

正常系・失敗系・境界条件を回帰可能にする。

#### 手順

1. 正常更新テストを追加する
2. 不正キー / 未存在 skill / 永続化失敗テストを追加する
3. 更新後に cache が古い値を返さないことを確認する

#### 完了条件

- 追加テストが PASS
- 既存 `skill:update` 契約テストが回帰しない

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `SkillService.updateSkill()` が実更新を行う
- [ ] 更新対象フィールドが明示的に制限されている
- [ ] 更新後に `getDetail()` が新値を返す

### 品質要件

- [ ] 永続化失敗時に誤成功しない
- [ ] cache の stale data が残らない
- [ ] P42 / P44 / P45 / P5 に反しない

### ドキュメント要件

- [ ] 必要なら `aiworkflow-requirements` の current contract 補足を更新する
- [ ] 関連 completed record / backlog / lessons を同期する

---

## 6. 検証方法

### テストケース

- 存在する skill の metadata 更新が成功する
- 存在しない skill を指定した場合に business error になる
- 許可されていない更新キーを拒否する
- 永続化失敗時に success を返さない
- 更新後に `getDetail()` / `list()` の整合が崩れない

### 検証手順

1. `skill:update` 契約テストを実行する
2. `SkillService.updateSkill()` の単体/統合テストを実行する
3. 仕様同期差分と未タスク台帳を再確認する

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                 |
| ------------------------------ | ------ | -------- | ---------------------------------------------------- |
| metadata の正本を誤る          | 高     | 中       | 更新元を 1 ファイル/1 方式に固定してから実装する     |
| 任意キー更新で契約が肥大化する | 中     | 中       | whitelist 更新に限定する                             |
| cache 更新漏れ                 | 中     | 中       | 更新後の `getDetail()` / `list()` テストを必須化する |

---

## 8. 参照情報

### 関連ドキュメント

- `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-details.md`
- `.claude/skills/aiworkflow-requirements/references/task-workflow-completed-ipc-contract-preload-alignment.md`
- `docs/30-workflows/skill-lifecycle-routing/tasks/step-02-par-task-05-ipc-layer-integrity-fix/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `apps/desktop/src/main/services/skill/SkillService.ts`
- `apps/desktop/src/main/services/skill/SkillFileManager.ts`

---

## 9. 備考

### 補足事項

- このタスクは `skill:update` 契約そのものの復旧ではなく、その先の business logic completion を扱う。
- 現行 contract (`{ skillName, updates }`) は維持し、payload 形式の再設計は行わない。

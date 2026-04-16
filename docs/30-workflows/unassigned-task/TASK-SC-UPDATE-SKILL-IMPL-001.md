# SkillService.updateSkill() 実装 - タスク指示書

```yaml
issue_number: 2203
```

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | TASK-SC-UPDATE-SKILL-IMPL-001                                    |
| タスク名     | SkillService.updateSkill() スキルメタデータ更新ロジック実装      |
| 分類         | 機能実装                                                         |
| 対象機能     | SkillCreator / スキルメタデータ管理                              |
| 優先度       | 中                                                               |
| 見積もり規模 | 小規模                                                           |
| ステータス   | 未実施                                                           |
| 発見元       | TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 Phase 12 未タスク検出 |
| 発見日       | 2026-04-16                                                       |
| Issue番号    | #2203                                                            |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`SkillCreatorService` の `runUpdateWorkflow` メソッドが `SkillService.updateSkill()` を呼び出すコードパスが存在するが、
`updateSkill` の本体は `log.info` のみで実際の更新処理が実装されていない。
スキル名・説明・対象ツール等のメタデータ変更がユーザーから要求された場合、変更が永続化されないバグが潜在している。

### 1.2 問題点・課題

- `SkillService.updateSkill()` がスタブ実装のまま残っている（`apps/desktop/src/main/services/skill/SkillService.ts` line 136付近）
- スキルのメタデータ更新（skill.name、description、allowedTools 等）が機能しない
- IPC 層を通じたスキル更新要求がサイレントに無視される

### 1.3 発見時の状況（苦戦箇所）

TASK-SC-PLAN-CONNECT-GENERATE-SKILL-MD-001 の実装中（runCreateWorkflow の structurePlan 接続作業）に、
`SkillCreatorService` のコードフローを追ったところ updateSkill のスタブを発見した。
当時は create モードの structurePlan 接続がスコープであり、update モードのロジックへの手を入れは
スコープ外と判断してスキップした。

**今後の実装者へのヒント**:

- `SkillCreatorService.runUpdateWorkflow()` から `updateSkill` がどのように呼ばれるかをまず確認すること
- `updateSkill` の `updates: Record<string, unknown>` パラメータの型を `Partial<SkillMetadata>` など具体的な型に変更することを検討すること
- ファイルシステムへの書き込みは `ensureSkillMdExists` パターンを参考にすること

---

## 2. 何を達成するか（What）

### 2.1 目的

`SkillService.updateSkill()` にスキルメタデータの実際の永続化ロジックを実装し、
スキルの更新操作が正常に機能する状態にする。

### 2.2 最終ゴール

- `updateSkill(skillName, updates)` が呼ばれると、対応する `SKILL.md` の該当フィールドが更新される
- IPC 経由でスキル更新要求が正常に処理される

### 2.3 スコープ

#### 含むもの

- `SkillService.updateSkill()` の実装
- 対応するユニットテストの追加
- `SkillCreatorService` との統合テスト

#### 含まないもの

- IPC 層の再設計（`TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001` スコープ）
- UI 側の更新フォームの変更

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `apps/desktop/src/main/services/skill/SkillService.ts` を読んで既存実装を理解していること
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` の `runUpdateWorkflow` を確認していること

### 3.2 依存タスク

なし（単独実行可能）

### 3.3 推奨アプローチ

1. `updates` パラメータの型を `Partial<SkillMetadata>` に強化
2. 対象 SKILL.md を読み込み、updates をマージして書き戻す
3. 変更後に `validateSkillMd` で整合性確認

---

## 4. 実行手順

### Phase構成

| Phase | 内容                 | 目安 |
| ----- | -------------------- | ---- |
| 1     | 既存コード調査・設計 | 0.5h |
| 2     | 実装                 | 1h   |
| 3     | テスト追加・確認     | 0.5h |

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `updateSkill(skillName, updates)` がスキルメタデータを永続化する
- [ ] 存在しないスキル名を指定した場合にエラーが返る

### 品質要件

- [ ] ユニットテストが追加されている
- [ ] `pnpm --filter @repo/desktop test` がすべて PASS する

### ドキュメント要件

- [ ] Phase 12 close-out 時に `unassigned-task-detection.md` の formalized 欄を更新する

---

## 6. 検証方法

```bash
pnpm --filter @repo/desktop test --run src/main/services/skill/SkillService
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                            |
| ------------------------------ | ------ | -------- | ----------------------------------------------- |
| SKILL.md パース失敗            | 中     | 低       | 既存の `readSkillMd` ユーティリティを再利用する |
| 並行書き込みによるファイル競合 | 中     | 低       | 楽観的ロックまたは書き込みキューで対処          |

---

## 8. 参照情報

### 関連ファイル

- `apps/desktop/src/main/services/skill/SkillService.ts` （line 136付近の TODO）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` （runUpdateWorkflow）
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts`

---

## 9. 備考

元タスクIDとして `TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001` がコメントに記載されていたが、
該当仕様書が未作成のため本タスク（TASK-SC-UPDATE-SKILL-IMPL-001）として新規作成した。
IPC 層の整合性全体については別途 `TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001` を作成することを推奨する。

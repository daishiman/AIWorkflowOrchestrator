# SkillCreatorService update mode を差分更新契約へ是正 - タスク指示書

## メタ情報

```yaml
issue_number: 2374
```

## メタ情報

| 項目         | 内容                                                    |
| ------------ | ------------------------------------------------------- |
| タスクID     | TASK-SC-UPDATE-MODE-DIFF-SEMANTICS-001                  |
| タスク名     | SkillCreatorService update mode を差分更新契約へ是正    |
| 分類         | 改善                                                    |
| 対象機能     | SkillCreatorService - runUpdateWorkflow / update モード |
| 優先度       | 高                                                      |
| 見積もり規模 | 中規模                                                  |
| ステータス   | 未実施                                                  |
| 発見元       | Phase 12                                                |
| 発見日       | 2026-04-21                                              |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`TASK-SC-CREATOR-UPDATE-IMPL-001` により `runUpdateWorkflow()` 自体は実装されたが、`update` モード全体は `init_skill.js` / `generate_skill_md.js` ベースの新規生成寄りフローを共有している。既存スキルを安全に差分更新する契約としては未閉鎖の状態である。

### 1.2 問題点・課題

- `update` で既存 SKILL.md を読んでも、後続処理は create と同じ再初期化・再生成フローに寄る
- 既存 anchors / references / agents / body を保持した差分更新契約が未定義
- update 専用テストが「既存内容を保持して更新したか」を十分に検証していない
- `skill-creator` スキルの update-process 仕様と app runtime 実装に乖離がある

### 1.3 放置した場合の影響

- `update` モードで既存スキルを呼び出すと、anchors / references / agents が意図せず消去される可能性がある
- スキル更新の安全性への信頼が低下し、ユーザーが `update` を使いづらくなる
- 将来の機能拡張時に、差分更新の契約が未定義なまま追加実装が積み重なる技術的負債になる

---

## 2. 何を達成するか（What）

### 2.1 目的

`update` モードを「既存スキルの差分更新」として明確に機能させ、既存内容を保持しながら指定箇所だけを変更する実装・テスト・ドキュメントを整備する。

### 2.2 最終ゴール

- `update` 実行後も既存 SKILL.md の anchors / references / agents / body が保持される
- 差分更新契約（保持ルール・更新ルール）が実装コードとテストで明確に定義される
- `skill-creator` の update-process 仕様と app runtime 実装の乖離が解消される

### 2.3 スコープ

#### 含むもの

- `runUpdateWorkflow()` の差分更新ロジック実装
- 既存 SKILL.md 内容（anchors / references / agents / body）の保持ルール定義
- `init_skill.js` / `generate_skill_md.js` からの update 経路分離または merge 更新追加
- 差分更新に関する回帰テスト追加（既存内容保持・差分反映・Abort 時 reject）
- 保持ルールのドキュメント化

#### 含まないもの

- `runImprovePromptWorkflow()` の本体実装
- `SkillService.updateSkill()` の内部永続化ロジック再設計
- スキル定義そのものの改訂
- UI/UX 変更

### 2.4 成果物

- 更新された `SkillCreatorService.ts`（差分更新ロジック実装済み）
- 追加されたテストケース（既存内容保持・差分反映・Abort 処理）
- 保持ルールのインラインドキュメントまたは JSDoc

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- `TASK-SC-CREATOR-UPDATE-IMPL-001` が完了済み（`runUpdateWorkflow()` の基本実装）
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` が存在する
- 既存テスト（update-TC-01〜06）が全パスしている

### 3.2 依存タスク

- `TASK-SC-CREATOR-UPDATE-IMPL-001`（完了済み）

### 3.3 必要な知識

- TypeScript / Node.js の非同期処理パターン
- SKILL.md の frontmatter 構造と body 構造
- `SkillCreatorService` の `runCreateWorkflow()` と `runUpdateWorkflow()` の実装
- Vitest によるユニットテストの書き方

### 3.4 推奨アプローチ

既存の `runUpdateWorkflow()` に対して、以下の順で差分更新ロジックを追加する：

1. 既存 SKILL.md から frontmatter（anchors / references / agents）と body をパースして保持
2. ユーザー指定の変更箇所（purpose / description 等）のみを新しい値で上書き
3. 保持した部分と更新した部分をマージして新しい SKILL.md を生成
4. Abort シグナル検出時は変更を適用しない（reject パス）

---

## 4. 実行手順

### Phase構成

| Phase | フェーズ名 | 概要                                           |
| ----- | ---------- | ---------------------------------------------- |
| 1     | 契約定義   | 差分更新のルールを文書化・設計                 |
| 2     | 実装       | `runUpdateWorkflow()` に差分更新ロジックを追加 |
| 3     | テスト追加 | 回帰テストケースを追加                         |
| 4     | 検証       | 既存テスト全パス確認・統合検証                 |

### Phase 1: 契約定義

#### 目的

差分更新の保持ルールと更新ルールを明文化する。

#### 手順

1. `skill-creator` スキルの update-process 仕様を読み込み、設計意図を確認する
2. 保持すべきフィールド（anchors / references / agents / body sections）を列挙する
3. 上書きすべきフィールド（purpose / description / バージョン等）を列挙する
4. Abort 時の挙動（ロールバックなし・変更不適用）を定義する

#### 成果物

差分更新ルールの設計メモ（または JSDoc コメント）

#### 完了条件

保持ルールと更新ルールが明確に定義されていること

---

### Phase 2: 実装

#### 目的

`runUpdateWorkflow()` を差分更新契約に沿った実装にする。

#### 手順

1. `extractPurposeFromSkillMd()` を拡張し、frontmatter 全体（anchors / references / agents）をパースできるようにする
2. `runUpdateWorkflow()` 内で既存内容を保持しながら指定箇所のみ更新するロジックを追加する
3. `init_skill.js` / `generate_skill_md.js` の呼び出しを update 経路から分離するか、merge モードを追加する

#### 成果物

更新された `SkillCreatorService.ts`

#### 完了条件

- `update` 実行後も既存 anchors / references / agents が保持されること
- 指定した purpose / description のみが更新されること

---

### Phase 3: テスト追加

#### 目的

差分更新の回帰テストを追加する。

#### 手順

1. 「既存内容（anchors / references / agents）が保持される」テストケースを追加する
2. 「差分（purpose のみ）が正しく反映される」テストケースを追加する
3. 「Abort シグナル検出時に変更が適用されない」テストケースを追加する

#### 成果物

追加されたテストケース（`SkillCreatorService.test.ts` 内）

#### 完了条件

全テストケースがパスすること

---

### Phase 4: 検証

#### 目的

既存テストへの回帰がないことを確認する。

#### 手順

1. `pnpm --filter @repo/desktop test` を実行し全テストがパスすることを確認する
2. `pnpm --filter @repo/desktop typecheck` を実行し型エラーがないことを確認する

#### 成果物

テスト実行レポート

#### 完了条件

全テストパス・型エラーなし

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] `update` 実行後も既存 SKILL.md の anchors / references / agents が保持される
- [ ] 指定した purpose / description のみが更新される
- [ ] Abort シグナル検出時に変更が適用されない

### 品質要件

- [ ] 全既存テスト（update-TC-01〜06）がパスする
- [ ] 新規テストケース（既存内容保持・差分反映・Abort）が追加されパスする
- [ ] TypeScript 型エラーがない
- [ ] `pnpm lint` がエラーなく通過する

### ドキュメント要件

- [ ] 保持ルールが JSDoc またはインラインコメントで明文化されている
- [ ] `skill-creator` の update-process 仕様との乖離が解消されたことが確認できる

---

## 6. 検証方法

### テストケース

| テストID     | 内容                                        | 期待結果                             |
| ------------ | ------------------------------------------- | ------------------------------------ |
| update-TC-07 | 既存 anchors を持つ SKILL.md で update 実行 | anchors が保持される                 |
| update-TC-08 | purpose のみ変更して update 実行            | purpose のみ更新、他フィールドは保持 |
| update-TC-09 | Abort シグナルを送って update 実行          | reject され変更なし                  |

### 検証手順

1. `pnpm --filter @repo/desktop test` で全テストパスを確認
2. 手動で update モードを実行し、既存スキルの anchors が消えていないことを確認

---

## 7. リスクと対策

| リスク                                                                    | 影響度 | 発生確率 | 対策                                                   |
| ------------------------------------------------------------------------- | ------ | -------- | ------------------------------------------------------ |
| `init_skill.js` / `generate_skill_md.js` の変更が create フローに影響する | 高     | 中       | update 経路を別ブランチに分離するか、フラグで制御する  |
| frontmatter パース失敗で既存内容が消える                                  | 高     | 低       | パース失敗時はフォールバックして既存ファイルを維持する |
| テスト追加が既存テストと競合する                                          | 中     | 低       | テストの独立性を確保し、モックを適切に設定する         |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/` - 親タスクの仕様書
- `apps/desktop/src/main/services/skill/SkillCreatorService.ts` - 対象実装ファイル
- `apps/desktop/src/main/services/skill/__tests__/SkillCreatorService.test.ts` - テストファイル
- `.claude/skills/task-specification-creator/references/unassigned-task-detection-guide.md`

### 参考資料

- `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/outputs/phase-12/skill-feedback-report.md` - 苦戦箇所記録
- `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/outputs/phase-12/unassigned-task-detection.md` - 未タスク検出記録

---

## 9. 備考

### 苦戦箇所【記入必須】

> 発見元: `docs/30-workflows/TASK-SC-CREATOR-UPDATE-IMPL-001/outputs/phase-12/unassigned-task-detection.md`

| 項目     | 内容                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `update` モードで既存 SKILL.md を読み込んでも、後続の generate 処理が create と同じ再初期化フローを使うため、既存内容が保持されない |
| 原因     | `runUpdateWorkflow()` が purpose の抽出のみを行い、anchors / references / agents の保持ロジックを持っていない                       |
| 対応     | 本タスクで差分更新契約を明確化し、保持ロジックを追加する（フォローアップタスク化）                                                  |
| 再発防止 | update モードの設計時に「保持するフィールド」「更新するフィールド」を最初に定義してから実装する                                     |

### 補足事項

- 本タスクは `TASK-SC-CREATOR-UPDATE-IMPL-001` の Phase 12 で「契約未閉鎖」として検出された
- 優先度「高」のため、次 wave での実装を推奨する
- `skill-creator` スキルの update-process 仕様との整合性確認を必ず実施すること

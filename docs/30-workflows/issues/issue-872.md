# [#872] "[UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001] skill:get-detail引数名ドリフト修正（P45パターン）"

## メタ情報

```yaml
task_id: UT-FIX-SKILL-GETDETAIL-NAMING-DRIFT-001
task_name: skill:get-detail引数名ドリフト修正（P45パターン）
category: リファクタリング
target_feature: skill:get-detail IPCハンドラ
priority: 低
scale: 小規模
status: 未実施
source_phase: Phase 12（UT-FIX-SKILL-IMPORT-RETURN-TYPE-001 コード調査）
created_date: 2026-02-21
dependencies: []
spec_path: docs/30-workflows/unassigned-task/task-skill-getdetail-naming-drift.md
```

| 項目       | 内容   |
| ---------- | ------ |
| 優先度     | 低     |
| 規模       | 小規模 |
| ステータス | 未実施 |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

UT-FIX-SKILL-REMOVE-INTERFACE-001でP45（IPC引数命名の契約ドリフト）パターンが発見・修正された。skill:removeハンドラの引数名`skillId`が実際にはスキル名（skillName）を受け取っていたため、全レイヤーで`skillName`に統一された。しかし、同様のドリフトパターンがskill:get-detailハンドラにも存在する。

### 1.2 問題点・課題

skillHandlers.ts L183-210のskill:get-detailハンドラでは以下の状態：

- 引数型: `args: { skillId: string }` -- 「ID」を受け取る命名
- 内部呼び出し: `skillService.getSkillById(args.skillId)` -- IDベースの検索メソッド
- 実際に渡される値: スキルの「名前」（例: "my-skill"）の可能性

SkillService.getSkillById()の内部実装が名前ベースの検索を行っている場合、P45パターン（命名と実態の乖離）が発生している。コードレビューで「IDを渡しているのか名前を渡しているのか」が不明確になる。

### 1.3 放置した場合の影響

- 将来、スキルにUUID形式のIDを導入した場合、`getSkillById`が名前検索のまま残り、IDベースの検索に移行できない
- 新規開発者がskillIdという引数名を見て、UUID形式のIDを渡すコードを書く可能性がある
- skill:importとskill:removeが`skillName`に統一されたのに、skill:get-detailだけ`skillId`が残り、API一貫性が損なわれる

## 2. 何を達成するか（What）

### 2.1 目的

skill:get-detailハンドラの引数名をセマンティクスに合致する名称に修正し、P45パターンを解消する。

### 2.2 最終ゴール

- skill:get-detailの引数が`skillName: string`または適切な名称に修正されている
- SkillService.getSkillById()のメソッド名が実態に合致している（またはIDベースの検索が正しく機能している）
- Preload側の型定義と引数名が一致している
- 全テストPASS

### 2.3 スコープ

#### 含むもの

- skill:get-detailハンドラの引数名修正（skillHandlers.ts）
- SkillService.getSkillById()のメソッド名・引数名修正（実態に合わせる）
- Preload側skill-api.tsの引数名修正
- preload/types.tsの型定義更新
- 既存テストの引数名更新

#### 含まないもの

- 他のIPCハンドラの引数名修正（UT-FIX-SKILL-IPC-RESPONSE-CONSISTENCY-001で対応）
- UUIDベースのスキルID導入
- UIコンポーネントの変更

### 2.4 成果物

| 成果物                   | パス                                                      |
| ------------------------ | --------------------------------------------------------- |
| 修正済みskillHandlers.ts | apps/desktop/src/main/ipc/skillHandlers.ts                |
| 修正済みSkillService.ts  | apps/desktop/src/main/services/skill/SkillService.ts      |
| 修正済みskill-api.ts     | apps/desktop/src/preload/skill-api.ts                     |
| 修正済みpreload/types.ts | apps/desktop/src/preload/types.ts                         |
| 更新済みテストファイル   | apps/desktop/src/main/ipc/**tests**/skillHandlers.test.ts |

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-FIX-SKILL-IMPORT-RETURN-TYPE-001が完了していること
- UT-FIX-SKILL-REMOVE-INTERFACE-001が完了していること（P45修正の先例）

### 3.2 依存タスク

| タスクID                          | 状態 | 依存内容              |
| --------------------------------- | ---- | --------------------- |
| UT-FIX-SKILL-REMOVE-INTERFACE-001 | 完了 | P45パターン修正の先例 |

### 3.3 必要な知識

- P45（IPC引数命名の契約ドリフト）パターン
- P23/P32（3箇所同時更新）
- Electron IPC通信（ipcMain.handle）

### 3.4 推奨アプローチ

1. まずSkillService.getSkillById()の内部実装を確認し、ID検索か名前検索かを判定する
2. 名前検索の場合: 全レイヤーで`skillId`→`skillName`に統一（UT-FIX-SKILL-REMOVE-INTERFACE-001と同パターン）
3. ID検索の場合: 引数名は正しいため、Preload側の呼び出し元が正しいIDを渡しているか確認
4. P23/P32準拠で3箇所（ハンドラ・Preload API・テスト）を同時更新

### 3.5 実装課題と解決策（親タスクからの教訓）

| 課題                        | 発見経緯                                                                                          | 解決策                                                  | 教訓                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------ |
| 引数命名と実態の乖離（P45） | UT-FIX-SKILL-REMOVE-INTERFACE-001でskillId→skillNameドリフトを修正した際に同パターンの存在を確認  | 全レイヤーで引数名を実際のセマンティクスに合致させる    | IPCハンドラの引数名はPreload側で渡す値のセマンティクスと一致させる |
| 3層同時更新の必要性         | UT-FIX-SKILL-IMPORT-RETURN-TYPE-001でMain/Preload/テストの3箇所を同時更新しないと不整合が発生した | P23/P32準拠で変更前に全レイヤーの該当箇所をリストアップ | 1箇所だけの修正は不整合を生む                                      |

**参照**:

- [06-known-pitfalls.md P45](../../.claude/rules/06-known-pitfalls.md)
- [architecture-implementation-patterns.md S13](../../.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md)

## 4. 実行手順

### Phase構成

本タスクは小規模のため、Phase 1-13の簡略版で実行する。

| Phase | 名称                           | 概要                                   |
| ----- | ------------------------------ | -------------------------------------- |
| 1-3   | 要件定義・設計・レビュー       | getSkillById()の実態調査、修正方針決定 |
| 4-5   | テスト作成・実装               | 引数名修正、テスト更新                 |
| 6-10  | テスト拡充・品質検証           | カバレッジ確認、Lint/型チェック        |
| 11-13 | 手動テスト・ドキュメント・完了 | 検証・文書化・PR                       |

### Phase 1: 要件定義

#### 手順

1. SkillService.getSkillById()の実装を確認（IDベースか名前ベースか判定）
2. Preload側skill-api.tsのgetDetail()呼び出し箇所を確認
3. Renderer側でgetDetail()に渡される値のセマンティクスを確認

### Phase 5: 実装

#### 手順

1. SkillService.getSkillById()のメソッド名を修正（必要に応じて）
2. skillHandlers.ts L183-210の引数名を修正
3. skill-api.tsの引数名を修正
4. preload/types.tsの型定義を更新
5. テストの引数名を更新

## 5. 完了条件チェックリスト

### 機能要件

- [ ] skill:get-detailの引数名がセマンティクスと一致している
- [ ] SkillServiceのメソッド名が実態に合致している
- [ ] Preload側の型定義と引数名が一致している
- [ ] Renderer側の呼び出し箇所が正しく動作している

### 品質要件

- [ ] TypeCheck 0エラー
- [ ] ESLint 0エラー
- [ ] 全テストPASS

### ドキュメント要件

- [ ] Phase 12 実装ガイド作成
- [ ] システム仕様書更新

## 6. 検証方法

### テストケース

1. skill:get-detailハンドラに正しい引数名で値を渡し、期待通りの結果が返ることを検証
2. 不正な引数（空文字列、null等）に対してバリデーションエラーが返ることを検証
3. 型チェックで引数名の不整合がないことを検証

### 検証手順

```bash
pnpm typecheck
cd apps/desktop && pnpm vitest run src/main/ipc/__tests__/skillHandlers.test.ts
pnpm lint
```

## 7. リスクと対策

| リスク                                                   | 影響度 | 発生確率 | 対策                                                                   |
| -------------------------------------------------------- | ------ | -------- | ---------------------------------------------------------------------- |
| getSkillById()がID検索の場合、修正不要と判断されるリスク | 低     | 中       | Phase 1で実装を必ず確認してから方針決定                                |
| Renderer側の呼び出し箇所での引数名変更漏れ               | 中     | 低       | `grep -rn "getDetail\|skillId" apps/desktop/src/renderer/`で全箇所調査 |
| テストモックの引数名更新漏れ                             | 低     | 中       | テストファイル内の`skillId`を一括検索・置換                            |

## 8. 参照情報

### 関連ドキュメント

- [06-known-pitfalls.md P45](../../.claude/rules/06-known-pitfalls.md) - IPC引数命名の契約ドリフト
- [interfaces-agent-sdk-skill.md](../../.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md) - スキルAPI仕様
- [ipc-type-resolution-guide.md](../../.claude/skills/aiworkflow-requirements/references/ipc-type-resolution-guide.md) - IPC型不整合診断ガイド

### 関連完了タスク

- UT-FIX-SKILL-REMOVE-INTERFACE-001（P45パターン修正の先例）
- UT-FIX-SKILL-IMPORT-INTERFACE-001（skill:import引数形式修正）

## 9. 備考

### P45パターンの修正実績

UT-FIX-SKILL-REMOVE-INTERFACE-001では以下の修正を実施した（本タスクの参考）：

- ハンドラ引数: `{ skillId: string }` → `skillName: string`
- 内部メソッド: `removeSkill(skillId)` → `removeSkill(skillName)`
- 全レイヤーで統一し、テスト全PASS

### 補足事項

skill:get-detailのgetSkillById()が本当にID検索を行っている場合は、引数名の修正は不要です。Phase 1で実装を確認し、方針を決定してください。

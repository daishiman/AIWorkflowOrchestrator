# UT-RT-02-TYPE-EXPANSION-TEST-001 - タスク指示書

## メタ情報

| 項目         | 内容                                                           |
| ------------ | -------------------------------------------------------------- |
| タスクID     | UT-RT-02-TYPE-EXPANSION-TEST-001                               |
| タスク名     | union型拡張時の回帰確認テスト手順文書化                        |
| 分類         | 品質／回帰テスト                                               |
| 対象機能     | RuntimeSkillCreatorFacade.executeAsync() exhaustive check 維持 |
| 優先度       | 低                                                             |
| 見積もり規模 | 小規模                                                         |
| ステータス   | 未実施                                                         |
| 発見元       | UT-RT-02-EXHAUSTIVE-CHECK-001 Phase 12 未タスク検出            |
| 発見日       | 2026-04-07                                                     |
| 親タスク     | UT-RT-02-EXHAUSTIVE-CHECK-001                                  |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

`RuntimeSkillCreatorFacade.executeAsync()` は現在の `RuntimeSkillCreatorExecuteResponse` union に対して exhaustive check を満たしている。
ただし、将来 union に新しいバリアントが追加されたとき、型変更と回帰確認テストを同時に再実行できる検証手順が文書化されていない。

### 1.2 問題点・課題

- union 型拡張時の回帰確認テスト手順が未文書化であり、開発者が手順を独自に組み立てる必要がある
- `assertNever()` パターンへの新バリアント追加時の確認手順が曖昧で、漏れが発生しやすい
- `classifyExecuteResult()` 分岐とテスト期待値の同期ルールが明示されていない

### 1.3 放置した場合の影響

- union に新しいバリアントが追加されても回帰確認が行われず、`assertNever()` の網羅性が崩れる
- 型変更だけ先行し、テスト・実装との乖離が発生する
- 発見が遅れるほど修正コストが増大する

---

## 2. 何を達成するか（What）

### 2.1 目的

union 型に新バリアントが追加された際に、`assertNever()` の網羅性と回帰テストの整合を `typecheck` と `vitest` で同時に確認できる手順を確立し、文書化する。

### 2.2 最終ゴール

- 新バリアント追加時に回帰テストが失敗として検出される状態
- `assertNever()` の網羅性が型レベルで保証されている状態
- 既存の T-01〜T-08 と TC-T4-01〜TC-T4-04 がすべて regression なしで通過する状態

### 2.3 スコープ

#### 含むもの

- `RuntimeSkillCreatorFacade.executeAsync.test.ts` への新バリアント追加時の確認ケース追加
- `assertNever()` パターンへの新バリアント追加手順の文書化
- `classifyExecuteResult()` 分岐とテスト期待値の同期ルール明示

#### 含まないもの

- `RuntimeSkillCreatorExecuteResponse` 以外の union 型拡張対応
- 新バリアントの実装（拡張は別タスク）
- CI/CD パイプラインの変更

### 2.4 成果物

| 種別 | ファイル                                                                                          |
| ---- | ------------------------------------------------------------------------------------------------- |
| 修正 | `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- UT-RT-02-EXHAUSTIVE-CHECK-001 が完了していること
- `RuntimeSkillCreatorFacade.executeAsync()` の実装と既存テストが PASS していること

### 3.2 依存タスク

| タスクID                      | 状態 | 内容                              |
| ----------------------------- | ---- | --------------------------------- |
| UT-RT-02-EXHAUSTIVE-CHECK-001 | 完了 | exhaustive check 実装（親タスク） |

### 3.3 必要な知識

- TypeScript の discriminated union と `assertNever()` パターン
- Vitest のモックと型アサーション
- `classifyExecuteResult()` の内部分岐ロジック

### 3.4 推奨アプローチ

1. `RuntimeSkillCreatorExecuteResponse` に新しい union バリアントを仮定した回帰ケースをテストに追加する
2. `classifyExecuteResult()` の分岐が新バリアントに対応していなければ TypeScript コンパイラエラーが出ることを確認する
3. `pnpm --filter @repo/desktop typecheck` と `vitest` を同じ波で実行し、型レベルの網羅性と動作を確認する

---

## 4. 実行手順

### Phase 構成

このタスクは小規模な follow-up タスクであり、フルの 13 Phase ではなく要点フェーズで実施する。

### Phase 1: 要件確認・インベントリ

#### 目的

既存のテストファイルと `RuntimeSkillCreatorExecuteResponse` の union 定義を確認する。

#### 手順

1. `packages/shared/src/types/skillCreator.ts` で `RuntimeSkillCreatorExecuteResponse` の全バリアントを確認する
2. `RuntimeSkillCreatorFacade.executeAsync.test.ts` の既存テストケース T-01〜T-08、TC-T4-01〜TC-T4-04 を確認する
3. `classifyExecuteResult()` の全分岐を確認する

#### 成果物

- 確認済みの union バリアント一覧
- 既存テストケースのインベントリ

#### 完了条件

全バリアントと全テストケースが対応表として整理されている。

---

### Phase 2: 回帰テストケース追加

#### 目的

新バリアント追加時に検出できる回帰ケースをテストファイルに追加する。

#### 手順

1. `RuntimeSkillCreatorFacade.executeAsync.test.ts` に新バリアント追加時の確認ケースを追加する
2. `assertNever()` が新バリアントで型エラーを出すことを確認する（型レベルでの失敗）
3. `classifyExecuteResult()` の期待分岐をテストで固定する

#### 成果物

- 更新済み `RuntimeSkillCreatorFacade.executeAsync.test.ts`

#### 完了条件

- 新バリアントを追加したとき `pnpm --filter @repo/desktop typecheck` がエラーを報告する
- 既存テストケースが全件 PASS する

---

### Phase 3: 検証・完了

#### 目的

型レベルと動作レベルの両方で回帰保護が機能していることを確認する。

#### 手順

1. `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` を実行する
2. `pnpm --filter @repo/desktop typecheck` を実行し、型レベルの網羅性を確認する
3. 既存テストが regression なしで通過することを確認する

#### 成果物

- PASS した vitest 実行ログ
- PASS した typecheck ログ

#### 完了条件

- vitest・typecheck 両方が PASS している

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 新バリアント追加時に回帰テストが失敗として検出される
- [ ] `assertNever()` の網羅性が保たれている

### 品質要件

- [ ] `pnpm --filter @repo/desktop typecheck` が PASS
- [ ] `pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts` が PASS
- [ ] 既存の runtime テストが regression なしで通過する

### ドキュメント要件

- [ ] `docs/30-workflows/ut-rt-02-exhaustive-check/` の成果物と整合する
- [ ] outputs/phase-12/unassigned-task-detection.md が本タスクを参照している

---

## 6. 検証方法

### テストケース

| TC   | 内容                                                           | 期待結果                 |
| ---- | -------------------------------------------------------------- | ------------------------ |
| TC-1 | 既存 T-01〜T-08 が全件 PASS                                    | vitest PASS              |
| TC-2 | 既存 TC-T4-01〜TC-T4-04 が全件 PASS                            | vitest PASS              |
| TC-3 | `assertNever()` が新バリアント追加時に TypeScript エラーを出す | typecheck FAIL（意図的） |

### 検証手順

```bash
# 対象テストファイルのみ実行
pnpm --filter @repo/desktop exec vitest run src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts

# 型レベルの網羅性確認
pnpm --filter @repo/desktop typecheck

# 親タスク workflow のバリデーション
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/ut-rt-02-exhaustive-check --phase 12

# 未タスクリンクの整合確認
node .claude/skills/task-specification-creator/scripts/verify-unassigned-links.js --source docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/unassigned-task-detection.md
```

---

## 7. リスクと対策

| リスク                         | 影響度 | 発生確率 | 対策                                                             |
| ------------------------------ | ------ | -------- | ---------------------------------------------------------------- |
| 仕様追加時にテストが追従しない | 高     | 中       | union 変更時にこのタスクを必ず再評価する                         |
| 型変更だけ先行する             | 中     | 中       | `typecheck` と `vitest` を同じ波で実行するルールを手順に明記する |
| 参照先の更新漏れ               | 低     | 低       | path 更新後に `verify-unassigned-links.js` を再実行する          |

---

## 8. 参照情報

### 関連ドキュメント

- `docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-4/test-design.md`
- `docs/30-workflows/ut-rt-02-exhaustive-check/outputs/phase-12/unassigned-task-detection.md`

### 参考資料

- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`
- `apps/desktop/src/main/services/runtime/__tests__/RuntimeSkillCreatorFacade.executeAsync.test.ts`
- `packages/shared/src/types/skillCreator.ts`

---

## 9. 備考

### 苦戦箇所【記入必須】

> 実行中に迷った点、判断に時間がかかった点、再利用したい回避策を具体的に記録してください。
> Phase 12 の skill-feedback-report へ転記できる粒度で書くこと。

| 項目     | 内容                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | union 型拡張時の回帰確認テスト手順が未文書化であり、新バリアント追加時にどのファイルを変更・確認すべきかが不明確だった              |
| 原因     | UT-RT-02-EXHAUSTIVE-CHECK-001 の Phase 12 close-out で未タスクとして記録されたが、具体的な再現手順が仕様書に残っていなかった        |
| 対応     | このタスク仕様書で「新バリアント追加時の確認手順」「typecheck と vitest の同時実行ルール」を明文化した                              |
| 再発防止 | union 型定義を変更するタスクでは Phase 1 のインベントリに「assertNever パターンの対象バリアント一覧」を必須記載するルールを追加する |

| 項目     | 内容                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 症状     | `assertNever()` パターンへの新バリアント追加時の確認手順が曖昧で、型エラーの意図的な発生確認と実際のエラー修正の区別が不明確だった |
| 原因     | テスト設計（Phase 4）で「型エラーを意図的に起こす確認ケース」と「正常系テスト」の境界が定義されていなかった                        |
| 対応     | TC-3 として「新バリアント追加時に typecheck FAIL が出ることを確認（意図的な失敗）」を明示的に分離した                              |
| 再発防止 | assertNever 系テストでは「意図的な typecheck FAIL 確認」と「vitest PASS 確認」を別手順に分離して記述する                           |

### 補足事項

- 現時点では予防的な follow-up タスク
- 新バリアントが実際に追加されるまで open のまま維持する
- UT-RT-02-EXHAUSTIVE-CHECK-001 の完了状態を前提とする

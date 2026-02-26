# Phase 1 契約差分サマリ

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 1
- ステータス: 完了（implementation_and_spec_sync）

## 差分一覧

| ID     | レイヤー              | 現状の実装                                                                                    | 理想状態                                                                              | 影響・リスク                                                                      |
| ------ | --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| GAP-01 | Main Handler 引数型   | ユニオン型 `SkillExecutionRequest \| { skillId: string; params? }` を受け入れ                 | 正規契約を `SkillExecutionRequest` に一本化するか、ユニオン型を意図的設計として文書化 | どちらが正規かが不明確で、将来のメンテナンス時に混乱を招く                        |
| GAP-02 | 名前解決ロジック      | `scanAvailableSkills()` で全スキャン後 `find(name === skillName)` で検索（L259-263）          | `getSkillByName()` 等の専用メソッドで効率的に検索                                     | 毎回全スキャンの性能コスト、SkillService に `getSkillByName` が存在するのに未使用 |
| GAP-03 | 型ガード実装          | `isSkillNameRequest`: `typeof === "object" && !== null && "skillName" in payload`（L231-236） | `prompt` フィールドの存在もチェックに含めることで誤判定リスク低減                     | `{ skillName: "x" }` のみ（prompt無し）でもskillNameパスに分岐してしまう          |
| GAP-04 | prompt バリデーション | skillNameパスで prompt の型チェック・空文字列チェックが未実施（L265-266で直接使用）           | P42準拠3段バリデーションを prompt にも適用                                            | 不正な prompt がService層まで到達する可能性                                       |
| GAP-05 | skillId パスの命名    | `{ skillId: string }` の引数名がP45規約どおりか未検証                                         | 内部利用パスであることを文書化し、命名の妥当性を明記                                  | P45再発リスクの評価が不完全                                                       |

## 根本原因分析

1. **契約正本の不在**: `skill:execute` に対する単一の正規入力契約が定義されておらず、ユニオン型で複数パスを暗黙的に許容
2. **名前解決の二重実装**: `SkillService.getSkillByName()` メソッドが存在するにも関わらず、Handler内で `scanAvailableSkills()` + `find()` による独自の名前解決を実装（`skillHandlers.ts:259-263`）
3. **型ガードの不完全性**: `isSkillNameRequest` が `skillName` の存在のみを判定し、`SkillExecutionRequest` の全必須フィールド（`prompt`）を検証していない
4. **prompt バリデーションの非対称性**: skillNameパスではpromptのバリデーションが省略されている（`{ prompt: args.prompt }` で直接渡し: L265-266）

## 修正方針（要件レベル）

| 方針                        | 内容                                                                          | 関連GAP | 関連要件 |
| --------------------------- | ----------------------------------------------------------------------------- | ------- | -------- |
| 方針A: 契約明文化           | ユニオン型を意図的設計として文書化し、各パスの使用条件・呼び出し元を明記      | GAP-01  | FR-01    |
| 方針B: 名前解決統一         | `scanAvailableSkills()` + `find()` を `getSkillByName()` に置換する計画を策定 | GAP-02  | FR-02    |
| 方針C: 型ガード強化         | `isSkillNameRequest` に `prompt` チェックを追加するか、追加しない理由を文書化 | GAP-03  | FR-04    |
| 方針D: バリデーション対称化 | skillNameパスのpromptにもP42準拠バリデーションを適用する計画を策定            | GAP-04  | FR-03    |
| 方針E: 命名規約確認         | skillIdパスのP45準拠性を検証し文書化                                          | GAP-05  | NFR-03   |

## GAP-01 詳細分析: ユニオン型の二重契約

### skillNameパスの呼び出しフロー（正規）

```
Renderer -> skillAPI.execute({ skillName, prompt })
  -> safeInvokeUnwrap("skill:execute", request)
    -> Main Handler: isSkillNameRequest -> true
      -> scanAvailableSkills() -> find(name) -> executeSkill(id, {prompt})
```

### skillIdパスの呼び出しフロー（内部/テスト用）

```
テストコード/直接呼び出し -> ipcMain.handle("skill:execute", { skillId, params })
  -> Main Handler: isSkillNameRequest -> false (no "skillName" key)
    -> executeSkill(skillId, params)
```

### 結論

skillIdパスはテストファイル（`skillHandlers.execute.test.ts`, `skillHandlers.delegate.test.ts`）からの直接呼び出しで使用されており、Preload層からは呼び出されない。このパスの存在を「テスト・内部利用のための意図的設計」として文書化することでGAP-01を解消する。

## GAP-02 詳細分析: 名前解決の非効率

### 現状（`skillHandlers.ts:259-263`）

```typescript
const { skills } = await skillService.scanAvailableSkills();
const skill = skills.find((item) => item.name === args.skillName);
```

### 改善案

```typescript
const skill = await skillService.getSkillByName(args.skillName);
```

### 影響評価

- `getSkillByName` はインポート済みスキルのみを検索（`SkillService`に実装済み）
- `scanAvailableSkills` はファイルシステムスキャンを含む全スキル取得
- 意味論的な差異: `scanAvailableSkills` は未インポートスキルも含む
- 改善時はこの差異を考慮し、テストの期待値も調整が必要

## 完了記録

- [x] 契約差分5件を実コードの行番号付きで抽出
- [x] 根本原因を分析
- [x] 修正方針を要件レベルで定義
- [x] GAP-01/GAP-02 の詳細分析を実施
- [x] Phase 2設計への入力情報（GAP-01〜05）を確定

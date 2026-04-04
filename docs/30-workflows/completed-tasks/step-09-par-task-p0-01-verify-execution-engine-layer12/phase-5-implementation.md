# Phase 5: 実装

## メタ情報

| 項目   | 値                              |
| ------ | ------------------------------- |
| Phase  | 5                               |
| 機能名 | verify-execution-engine-layer12 |
| 作成日 | 2026-03-29                      |

## 目的

`SkillCreatorVerificationEngine`、Layer1Validator、Layer2Validator を実装し、型拡張と Facade injection point を追加する。

## 想定変更ポイント

- `packages/shared/src/types/skillCreator.ts` — `layer` union type に `"layer1"` / `"layer2"` を追加
- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` — 新規作成
- `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` — injection point 追加
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — 新規作成

## 実装しないこと

- Layer 3/4 の検証ロジック
- `recordVerifyPass()` の実装（TASK-P0-02 の責務）
- verify→improve→re-verify 閉ループ
- workflow-manifest.json の配置
- UI / renderer 側の変更

## 実行タスク

- shared type の `layer` フィールドを拡張する
- `SkillCreatorVerificationEngine` を新規作成する
- Layer1Validator / Layer2Validator を内部モジュールとして実装する
- Facade に injection point と `verifySkill()` メソッドを追加する
- ユニットテストを作成する

## 参照資料

| 資料名              | パス                                        | 説明                    |
| ------------------- | ------------------------------------------- | ----------------------- |
| Phase 2 設計        | `phase-2-design.md`                         | engine / validator 設計 |
| layer check catalog | `outputs/phase-2/layer-check-catalog.md`    | L1/L2 チェック ID       |
| Phase 4 test matrix | `outputs/phase-4/test-matrix.md`            | test case 一覧          |
| 型定義              | `packages/shared/src/types/skillCreator.ts` | 現行型定義              |

## 実行手順

### ステップ1: shared type を拡張する

`packages/shared/src/types/skillCreator.ts` の `RuntimeSkillCreatorVerifyCheck` 型:

```typescript
// Before
layer: "layer3" | "layer4";

// After
layer: "layer1" | "layer2" | "layer3" | "layer4";
```

既存の Layer 3/4 コードに影響がないことを確認する。

### ステップ2: SkillCreatorVerificationEngine を作成する

`apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`:

- `Layer1Validator` と `Layer2Validator` を内部クラスまたは private メソッドとして保持する。
- `verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>` を public メソッドとする。
- Layer 1 の結果で critical error がある場合でも Layer 2 は実行する（全結果を返す方針）。
- file system 操作は `fs/promises` を使用する。

### ステップ3: Layer1Validator を実装する

- `fs.stat()` / `fs.access()` でファイル・ディレクトリの存在を確認する。
- `fs.readdir()` で agents/ 配下のファイル数を確認する。
- 各チェックを `RuntimeSkillCreatorVerifyCheck` オブジェクトとして生成する。

### ステップ4: Layer2Validator を実装する

- `fs.readFile()` で SKILL.md を読み込み、正規表現で必須 heading / セクションを検出する。
- agents/ 配下の `.md` ファイルを列挙し、各ファイルの heading 構造を検証する。
- `output-schema.json` が存在する場合は `JSON.parse()` で構文妥当性を確認する。

### ステップ5: Facade injection を追加する

- `RuntimeSkillCreatorFacade` の constructor に `verificationEngine?: SkillCreatorVerificationEngine` を追加する。
- `verifySkill(skillDir: string)` メソッドを追加し、engine に委譲する。
- engine が未 inject の場合は空配列を返すか、明示的エラーを throw する（Phase 3 review の方針に従う）。

### ステップ6: ユニットテストを作成する

- Phase 4 の test matrix に従い、テスト用の fixture ディレクトリを作成する。
- `vitest` で `SkillCreatorVerificationEngine.test.ts` を作成する。
- mock file system または実際の tmp ディレクトリを使用する。

## 統合テスト連携

- Phase 6 で edge case（破損ファイル、権限不足、深いネスト）を追加する。
- Phase 7 で L1/L2 全チェック ID の coverage を確認する。

## 実装完了の判断

- `verify(skillDir)` が `RuntimeSkillCreatorVerifyCheck[]` を返せる
- Layer 1 チェックがファイル・ディレクトリ存在を検証できる
- Layer 2 チェックが SKILL.md の必須フィールドを検証できる
- 全テストケースが pass する
- Facade から engine を inject して呼び出せる

## 成果物

| 成果物              | パス                        | 説明                         |
| ------------------- | --------------------------- | ---------------------------- |
| implementation plan | `phase-5-implementation.md` | 実装対象、責務、変更ポイント |

## 完了条件

- [ ] `layer` union type が `"layer1"` / `"layer2"` を含む
- [ ] `SkillCreatorVerificationEngine` が存在する
- [ ] Layer1Validator / Layer2Validator が L1/L2 チェックを実行する
- [ ] Facade injection point が追加されている
- [ ] ユニットテストが pass/fail シナリオを網羅する
- [ ] **本Phase内の全タスクを100%実行完了**

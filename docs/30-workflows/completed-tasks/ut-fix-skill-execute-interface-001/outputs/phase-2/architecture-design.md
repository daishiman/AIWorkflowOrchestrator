# Phase 2 アーキテクチャ設計

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- フェーズ: 2
- 入力: Phase 1成果物（GAP-01〜05, FR-01〜05, NFR-01〜05）
- ステータス: 完了（implementation_and_spec_sync）

## 設計方針

1. **ユニオン型の意図的設計として文書化**: `SkillExecutionRequest | { skillId: string; params? }` は内部利用パス（テスト・デバッグ・直接ID指定）を許容するための意図的設計として位置付ける
2. **正規入力契約**: Preload/Renderer からの正規入力は `SkillExecutionRequest`（skillName ベース）とする
3. **名前解決の最適化計画**: 現在の `scanAvailableSkills()` + `find()` を `getSkillByName()` に置換する方針を策定（ただし意味論的差異に注意）
4. **バリデーションの対称化**: skillNameパス・skillIdパス両方で全入力フィールドにP42準拠バリデーションを適用

## 現状のレイヤー責務（実コード準拠）

| レイヤー                     | コンポーネント                | 入力                    | 主要責務                                                                | 出力                      |
| ---------------------------- | ----------------------------- | ----------------------- | ----------------------------------------------------------------------- | ------------------------- |
| Shared                       | `@repo/shared` types/skill.ts | -                       | `SkillExecutionRequest` 型定義（skillName, prompt, workingDirectory?）  | 型エクスポート            |
| Preload                      | `skill-api.ts`                | `SkillExecutionRequest` | `safeInvokeUnwrap(SKILL_EXECUTE, request)` でIPC呼び出し                | `SkillExecutionResponse`  |
| Main Handler                 | `skillHandlers.ts` L217-283   | ユニオン型              | sender検証 -> `isSkillNameRequest` 型ガード -> 分岐処理                 | `{ success, data/error }` |
| Main Handler (skillNameパス) | 同上 L257-268                 | `SkillExecutionRequest` | `scanAvailableSkills()` -> `find(name)` -> `executeSkill(id, {prompt})` | 実行結果                  |
| Main Handler (skillIdパス)   | 同上 L270-275                 | `{ skillId, params? }`  | `executeSkill(skillId, params)` 直接呼び出し                            | 実行結果                  |
| Service                      | `SkillService`                | `skillId`, `params`     | スキル存在確認、Executor委譲                                            | `SkillExecutionResponse`  |
| Executor                     | `SkillExecutor`               | `skillId`, `prompt` 等  | 実行管理、状態遷移、結果返却                                            | `SkillExecutionResponse`  |

## 型ガード設計（`isSkillNameRequest`）

### 現状の実装（L231-236）

```typescript
const isSkillNameRequest = (
  payload: SkillExecutionRequest | { skillId: string },
): payload is SkillExecutionRequest =>
  typeof payload === "object" && payload !== null && "skillName" in payload;
```

### 設計方針

- **現状維持の理由**: `skillName` フィールドの存在チェックのみで判定する設計は、ユニオン型の判別子として十分。`prompt` の存在チェックを追加すると、バリデーションと型ガードの責務が混在する
- **バリデーションとの分離**: 型ガードは「どちらのパスか」の判定のみを担当し、入力値の妥当性検証は後続のバリデーションステップが担当する
- **GAP-03への回答**: 型ガードには `prompt` チェックを追加しない。代わりにskillNameパスの後続バリデーションで prompt を検証する計画を策定（GAP-04対応）

### 型ガードの安全性検証

| 入力パターン                      | `isSkillNameRequest` 結果 | 分岐先        | バリデーション結果                  |
| --------------------------------- | ------------------------- | ------------- | ----------------------------------- |
| `{ skillName: "X", prompt: "Y" }` | `true`                    | skillNameパス | PASS                                |
| `{ skillName: "", prompt: "Y" }`  | `true`                    | skillNameパス | FAIL (skillName 3段バリデーション)  |
| `{ skillName: "X" }` (prompt無し) | `true`                    | skillNameパス | 後続でpromptが`undefined`として渡る |
| `{ skillId: "abc" }`              | `false`                   | skillIdパス   | PASS                                |
| `{ skillId: "" }`                 | `false`                   | skillIdパス   | FAIL (skillId 3段バリデーション)    |
| `undefined`                       | `false` (typeof !== obj)  | skillIdパス   | FAIL (skillId undefined)            |
| `null`                            | `false` (=== null)        | skillIdパス   | FAIL (skillId null)                 |

## 変換点の設計（GAP-02対応）

### 現状

- **変換点**: Main Handler内（L259-263）
- **変換方法**: `skillService.scanAvailableSkills()` -> `skills.find(item => item.name === args.skillName)` -> `skill.id`
- **問題**: 毎回全スキャンを実行するため、スキル数増加時に性能劣化のリスク

### 改善計画

- **推奨変換方法**: `skillService.getSkillByName(skillName)` -> `skill.id`（既にSkillServiceに実装済み）
- **変換境界**: Main Handler直後（Service呼び出し前）で確定
- **失敗時**: skillName未検出 -> `{ success: false, error: "スキルが見つかりません" }` を返却
- **注意事項**: `scanAvailableSkills()` は全スキル（未インポート含む）を返すが、`getSkillByName()` はインポート済みスキルのみ。改善時はこのスコープ差異を検討する

## バリデーション設計（P42準拠、GAP-04対応）

### skillNameパス（現状 + 改善計画）

| ステップ | チェック対象                         | 現状       | 改善計画                                       |
| -------- | ------------------------------------ | ---------- | ---------------------------------------------- |
| 1        | `typeof args.skillName === "string"` | 実装済み   | 維持                                           |
| 2        | `args.skillName.trim() !== ""`       | 実装済み   | 維持                                           |
| 3        | `typeof args.prompt === "string"`    | **未実装** | **追加予定**（未タスク化の対象）               |
| 4        | `args.prompt.trim() !== ""`          | **未実装** | **検討予定**（空promptを許容するか仕様決定要） |

### skillIdパス（現状）

| ステップ | チェック対象                       | 現状     |
| -------- | ---------------------------------- | -------- |
| 1        | `typeof args.skillId === "string"` | 実装済み |
| 2        | `args.skillId.trim() !== ""`       | 実装済み |

### エラーレスポンス形式

全バリデーションエラーは `throw` 形式で統一:

```typescript
throw {
  code: "VALIDATION_ERROR",
  message: "<parameter> must be a non-empty string",
};
```

## 依存方向

```
Renderer -> Preload (SkillExecutionRequest) -> Main Handler (型ガード分岐)
  -> skillNameパス: scanAvailableSkills -> find -> executeSkill(id, {prompt})
  -> skillIdパス: executeSkill(skillId, params)
    -> SkillService -> SkillExecutor
```

## テスト観点への接続

| 設計ポイント   | Phase 4テスト観点                                             | 対応テストID                  |
| -------------- | ------------------------------------------------------------- | ----------------------------- |
| 型ガード分岐   | skillName入力とskillId入力で適切なパスに分岐するか            | SH-EXE-V00, SH-EXE-V01        |
| 名前解決       | 存在するskillName -> 正しいskillIdへの解決 / 未存在 -> エラー | TC-4-005                      |
| バリデーション | P42準拠の各段階（型/空文字/trim）でVALIDATION_ERROR           | SH-EXE-V02〜V06, SH-BV-04〜05 |
| prompt検証     | skillNameパスでpromptが不正な場合の挙動                       | （未タスク化の対象: GAP-04）  |
| sender検証     | 不正sender / DevToolsからの呼び出し拒否                       | TC-4-007, TC-6-008, TC-6-009  |
| 回帰           | skill:import / skill:remove の既存契約を壊さないこと          | （既存テスト群で担保）        |

## 完了記録

- [x] 引数契約の統一方針（ユニオン型の意図的設計 + 正規入力契約の定義）を定義
- [x] 変換境界（Main Handler内の名前解決）を明記
- [x] 型ガードの安全性検証テーブルを作成
- [x] テスト観点への接続をテストIDレベルで明記
- [x] 実コードの行番号とロジック構造を正確に反映
- [x] 本Phase内の全タスク（Task 2-1〜2-3）を100%実行完了

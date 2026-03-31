# Phase 2: 設計

## メタ情報

| 項目   | 値                                |
| ------ | --------------------------------- |
| Phase  | 2                                 |
| 機能名 | ut-sdk06-layer34-verify-expansion |
| 作成日 | 2026-03-31                        |

## 目的

Layer3/4 テストケースの設計方針、fixture 拡張設計、結合テストのアーキテクチャを設計する。

## 実行タスク

- Layer3 テスト用の fixture 拡張要件を設計する
- Layer4 テスト用の fixture 拡張要件を設計する
- verify→improve→reverify 結合テストの mock 戦略を設計する
- `SkillCreatorVerificationEngine` への Layer3/4 メソッド追加設計を定義する

## 参照資料

| 資料名                    | パス                                                                                      | 説明                            |
| ------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------- |
| Phase 1 要件              | `phase-1-requirements.md`                                                                 | Layer3/4 チェック項目一覧       |
| 既存テスト                | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` | テスト構造と fixture 設計の参考 |
| 既存実装                  | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                | チェック実装パターンの参考      |
| RuntimeSkillCreatorFacade | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`                     | 結合テストの接続先              |

## Layer3/4 テスト用 fixture 拡張設計

### fixture ヘルパー拡張

既存の `createSkillFixture` に以下のオプションを追加する:

```typescript
interface SkillFixtureOptions {
  // 既存フィールド（変更なし）
  skillMd?: string | false;
  agents?: Record<string, string> | false;
  references?: boolean;
  outputSchema?: string | false;

  // Layer3/4 テスト用追加フィールド
  /** references/ 配下のファイル群 */
  referenceFiles?: Record<string, string>;
  /** SKILL.md 内に参照として記載する references/ パス一覧 */
  skillMdReferenceLinks?: string[];
}
```

### Layer3 テスト用 fixture パターン

| パターン名                         | fixture 内容                                       |
| ---------------------------------- | -------------------------------------------------- |
| `jsonSchema_withDraftField`        | `output-schema.json` に `$schema` フィールドあり   |
| `jsonSchema_withoutDraftField`     | `output-schema.json` に `$schema` フィールドなし   |
| `jsonSchema_withValidType`         | `output-schema.json` の `type` が `"object"`       |
| `jsonSchema_withInvalidType`       | `output-schema.json` の `type` が `"invalid_type"` |
| `agent_withSubstantialDescription` | `## 責務` セクションに 30 文字以上の記述           |
| `agent_withMinimalDescription`     | `## 責務` セクションに 5 文字以下の記述            |
| `trigger_withSubstantialContent`   | `## Trigger` に 20 文字以上の記述                  |
| `trigger_withMinimalContent`       | `## Trigger` に 5 文字以下の記述                   |

### Layer4 テスト用 fixture パターン

| パターン名                      | fixture 内容                                             |
| ------------------------------- | -------------------------------------------------------- |
| `anchors_withListItems`         | `## Anchors` に `- anchor1` 等のリスト項目あり           |
| `anchors_withoutListItems`      | `## Anchors` はあるがリスト項目なし（テキストのみ）      |
| `anchors_missing`               | `## Anchors` セクション自体なし                          |
| `references_fileExists`         | `references/spec.md` が実在し、`SKILL.md` に参照記述あり |
| `references_fileMissing`        | `SKILL.md` で参照されているが `references/` に実在しない |
| `agents_referencedInSkillMd`    | agent ファイル名が `SKILL.md` 本文で言及されている       |
| `agents_notReferencedInSkillMd` | agent ファイル名が `SKILL.md` 本文で言及されていない     |

### 並列実行メモ

- `createSkillFixture` の拡張は最初に 1 回だけ行う。
- その後の `Layer 3 checks` と `Layer 4 checks` は独立しているため、別 SubAgent で並列実装できる。
- `verify→improve→reverify` 結合テストは Layer3 / Layer4 の両方が揃ってから実装する。

## Contract Matrix（Layer3/Layer4）

Layer3/4 は「入力となるファイル断片」と「出力チェックDTO（`RuntimeSkillCreatorVerifyCheck`）」の対応がズレると、テストと実装の両方が崩れる。Phase 5 では下表を正本として実装を進める。

| check ID | layer  | 入力（検証対象）                                           | fixture で作るもの                        | 出力（最低限確認する field） | 並列化境界                        |
| -------- | ------ | ---------------------------------------------------------- | ----------------------------------------- | ---------------------------- | --------------------------------- |
| L3-001   | layer3 | `output-schema.json` の `$schema`                          | `outputSchema`                            | `id`, `layer`, `severity`    | Layer3 ブロック内で完結           |
| L3-002   | layer3 | `output-schema.json` の `type`                             | `outputSchema`                            | `id`, `layer`, `severity`    | Layer3 ブロック内で完結           |
| L3-003   | layer3 | `agents/*.md` の `## 責務` 内容長                          | `agents`                                  | `id`, `layer`, `severity`    | Layer3 ブロック内で完結           |
| L3-004   | layer3 | `SKILL.md` の `## Trigger` 内容長                          | `skillMd`                                 | `id`, `layer`, `severity`    | Layer3 ブロック内で完結           |
| L4-001   | layer4 | `SKILL.md` の `## Anchors` のリスト項目有無                | `skillMd`                                 | `id`, `layer`, `severity`    | Layer4 ブロック内で完結           |
| L4-002   | layer4 | `SKILL.md` 記載の `references/` 参照と実在ファイル整合     | `referenceFiles`, `skillMdReferenceLinks` | `id`, `layer`, `severity`    | fixture 拡張が前提、Layer4 は独立 |
| L4-003   | layer4 | `agents/*.md` の filename が `SKILL.md` で言及されているか | `agents`, `skillMd`                       | `id`, `layer`, `severity`    | Layer4 ブロック内で完結           |

## Boundary Decision（非対象の固定）

本タスクは「Layer3/4 verify のテスト拡張」をゴールにし、責務境界を曖昧にしない。

| 領域                     | このタスクで扱う                                                                       | このタスクで扱わない                              |
| ------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------- |
| verify engine            | Layer3/4 の最小実装（テストを green にする範囲）                                       | 既存 Layer1/2 の意味変更、verify 戻り値の互換破壊 |
| shared types             | `RuntimeSkillCreatorVerifyCheck.layer` に `"layer3"` / `"layer4"` を通す（必要な場合） | IPC DTO 全面改定、renderer 表示用の追加 field 群  |
| facade / workflow        | 「Layer3/4 を含む checks が返る」事実の確認（結合テスト）                              | governance / session semantics（別 owner）        |
| IPC / preload / renderer | なし                                                                                   | 仕様追加・UI 変更・導線変更                       |

## Shared Type Decision（型の固定）

- `RuntimeSkillCreatorVerifyCheck.layer` は `"layer1" | "layer2"` しか受けない場合があるため、必要なら `"layer3"` / `"layer4"` を追加する（既存 consumer を壊さないことが最優先）。
- `severity` は既存 Layer1/2 の語彙（`info` / `warning` / `error`）に揃え、Layer3/4 だけ別語彙へ分岐させない。
- テストは `vi.spyOn` で内部実装を固定せず、fixture ベースで観測可能な出力（`id` / `layer` / `severity`）だけを見る。

## verify→improve→reverify 結合テストの設計

### アーキテクチャ方針

- `RuntimeSkillCreatorFacade` を使用して実際の `verifySkill()` → `improveSkill()` → `verifySkill()` を呼び出す
- `SkillCreatorVerificationEngine` はインスタンスをそのまま inject する（mock なし）
- `improveSkill()` は fixture ディレクトリを直接書き換えることで「改善済み」状態を作る

### 結合テストシナリオ

```
シナリオ: Anchors 不足スキルを改善して再検証する
1. L4-001 が fail する fixture を作成する（Anchors セクションにリスト項目なし）
2. engine.verify() を呼び出して L4-001 が error であることを確認する
3. fixture の SKILL.md を書き換えて Anchors にリスト項目を追加する（improve 相当）
4. 再度 engine.verify() を呼び出して L4-001 が info であることを確認する
```

### WorkflowEngine との連携設計

```typescript
// 結合テストの接続パターン
const engine = new SkillCreatorVerificationEngine();
const facade = new RuntimeSkillCreatorFacade({
  skillExecutor: {} as any,
  verificationEngine: engine,
});
// facade.verifySkill() が Layer3/4 を含む全チェック結果を返すことを確認する
```

## `SkillCreatorVerificationEngine` への Layer3/4 追加設計

現在の `verify()` メソッドは Layer1/2 のみを実行する。Layer3/4 を追加する際の設計:

```typescript
class SkillCreatorVerificationEngine {
  async verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]> {
    const layer1Checks = await validateLayer1(skillDir);
    const layer2Checks = await validateLayer2(skillDir);
    const layer3Checks = await validateLayer3(skillDir); // 追加予定
    const layer4Checks = await validateLayer4(skillDir); // 追加予定
    return [...layer1Checks, ...layer2Checks, ...layer3Checks, ...layer4Checks];
  }
}
```

- テストは `layer3Checks` / `layer4Checks` が返ってくることを `vi.spyOn` ではなく fixture ベースで確認する
- Phase 5 で実装する際は上記インターフェースに従う

## 統合テスト連携

- Phase 4 で上記 fixture パターンをもとに test case を定義する
- Phase 6 で JSON Schema の追加バリデーション edge case を拡充する
- Phase 9 で Layer1/2 との型整合性を確認する

## 成果物

| 成果物 | パス                | 説明                         |
| ------ | ------------------- | ---------------------------- |
| 設計書 | `phase-2-design.md` | fixture 拡張と結合テスト設計 |

## 完了条件

- [ ] Layer3 テスト用 fixture 拡張が設計されている
- [ ] Layer4 テスト用 fixture 拡張が設計されている
- [ ] 結合テストの mock 戦略と接続パターンが定義されている
- [ ] `SkillCreatorVerificationEngine` への Layer3/4 追加インターフェースが定義されている
- [ ] **本Phase内の全タスクを100%実行完了**

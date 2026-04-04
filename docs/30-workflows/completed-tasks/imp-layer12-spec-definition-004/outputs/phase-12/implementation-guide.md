# 実装ガイド: task-imp-layer12-spec-definition-004

## Part 1: 概念的説明（中学生レベル）

### check ID とは何か

#### なぜ必要か

ソフトウェアの品質を確かめるときは、「どこを見たか」をきちんと記録しておく必要があります。記録がないと、あとから「この確認はもう終わったっけ？」と分からなくなります。

check ID は、この混乱を防ぐための「番号つきチェックリスト」です。番号があると、確認した場所と結果をすぐに見つけられます。

#### 日常生活での例え

たとえば、学校の提出物を順番に整理する場面を考えてください。宿題には「国語」「算数」「理科」のように名前がありますが、さらに「1番」「2番」「3番」と番号があると、何を確認したかがすぐ分かります。

check ID も同じで、`L1-001` は「Layer 1 の 1 番目のチェック」という意味です。Layer は確認の段階で、外から順に見ていきます。

#### この機能でできること

| 何が分かるか   | 説明                     | 例                                   |
| -------------- | ------------------------ | ------------------------------------ |
| 何を確認したか | チェックの名前が分かる   | `L2-003` は Trigger セクションの確認 |
| どこまで見たか | 段階ごとの確認順が分かる | Layer 1 → 2 → 3 → 4                  |
| 何が足りないか | 抜けやすい場所が分かる   | `agents/` が空なら `L1-003` で分かる |

### この機能で何を守るか

- 番号の重複を防ぐ
- 確認漏れを見つけやすくする
- 仕様書と実装の見方をそろえる

---

## Part 2: 技術的詳細（開発者向け）

### current contract

- 実装: `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`
- 仕様: `.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md`
- runtime の `RuntimeSkillCreatorVerifyCheckSeverity` は `info | warning | error`
- この仕様書の表では、各 check の失敗時に使う `error` / `warning` を明示する

### Layer 構成

| Layer | 役割               | 主な確認内容                                                             |
| ----- | ------------------ | ------------------------------------------------------------------------ |
| 1     | 構造検証           | `SKILL.md` / `agents/` / `references/` / `output-schema.json` の存在確認 |
| 2     | コンテンツ検証     | 見出し、概要、Trigger、Anchors、JSON 妥当性                              |
| 3     | 詳細コンテンツ検証 | JSON Schema の型、責務説明の長さ、Trigger の実質量                       |
| 4     | 参照整合性検証     | Anchors のリスト、`references/` 参照の実在、agent ファイル名言及         |

### TypeScript 型定義

```ts
export type RuntimeSkillCreatorVerifyCheckSeverity =
  | "info"
  | "warning"
  | "error";

export interface RuntimeSkillCreatorVerifyCheck {
  id:
    | "L1-001"
    | "L1-002"
    | "L1-003"
    | "L1-004"
    | "L1-005"
    | "L2-001"
    | "L2-002"
    | "L2-003"
    | "L2-004"
    | "L2-005"
    | "L2-006"
    | "L2-007"
    | "L3-001"
    | "L3-002"
    | "L3-003"
    | "L3-004"
    | "L4-001"
    | "L4-002"
    | "L4-003";
  layer: "layer1" | "layer2" | "layer3" | "layer4";
  severity: RuntimeSkillCreatorVerifyCheckSeverity;
  summary: string;
  evidenceSummary?: string;
}

export interface SkillVerifyCheckDefinition {
  id: string;
  layer: 1 | 2 | 3 | 4;
  severity: "error" | "warning";
  summary: string;
  判定基準: string;
}
```

### APIシグネチャ

```ts
class SkillCreatorVerificationEngine {
  verify(skillDir: string): Promise<RuntimeSkillCreatorVerifyCheck[]>;
}
```

### 使用例

```ts
const engine = new SkillCreatorVerificationEngine();
const checks = await engine.verify(skillDir);

const failedChecks = checks.filter((check) => check.severity !== "info");
const blockingChecks = failedChecks.filter(
  (check) => check.severity === "error",
);

if (blockingChecks.length > 0) {
  throw new Error("Skill verification failed");
}
```

### エラーハンドリング

| ケース                            | 実装上の扱い          | 理由                               |
| --------------------------------- | --------------------- | ---------------------------------- |
| `SKILL.md` が存在しない           | `L1-001` を `error`   | スキル本体がないため               |
| `agents/` が存在しない            | `L1-002` を `error`   | 分割責務の入口がないため           |
| `output-schema.json` が壊れている | `L2-007` を `error`   | JSON 解析に失敗するため            |
| `references/` が存在しない        | `L1-004` を `warning` | 参照情報は推奨だが必須ではないため |
| `L3` / `L4` の一部が足りない      | `warning` で継続      | 参照整合性の改善余地として扱うため |

### エッジケース

- `agents/` に `.md` が 0 件のときは `L1-003` が `error`
- `output-schema.json` が無い場合は `L3-001` / `L3-002` を emit しない
- `references/` への言及が `SKILL.md` に 0 件でも、ディレクトリ存在自体は `L1-004` で確認する
- `Trigger` や `責務` の節が短すぎる場合は、実質的内容不足として warning を返す

### 設定可能なパラメータと定数

| 定数 / 閾値               | 値                                                                  | 役割                                |
| ------------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| Layer 数                  | 4                                                                   | `L1` 〜 `L4` で段階検証する         |
| Check ID 総数             | 19                                                                  | `5 + 7 + 4 + 3` の合計              |
| `VALID_JSON_SCHEMA_TYPES` | `object`, `array`, `string`, `number`, `integer`, `boolean`, `null` | `output-schema.json` の `type` 判定 |
| Trigger 最小文字数        | 10                                                                  | `L3-004` の実質性判定               |
| 責務説明最小文字数        | 20                                                                  | `L3-003` の実質性判定               |

### 拡張手順

1. 追加したい check の Layer を決める
2. 該当 Layer の次の連番を割り当てる
3. `interfaces-skill-verify-contract.md` に行を追加する
4. `SkillCreatorVerificationEngine.ts` に実装を追加する
5. `implementation-guide.md` の表と総数を更新する

### 同期確認コマンド

```bash
diff <(grep -oE "L[1-4]-[0-9]{3}" apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts | sort -u) \
     <(grep -E "^\| L[1-4]-[0-9]{3}" .claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md | grep -oE "L[1-4]-[0-9]{3}" | sort -u)
```

差分が 0 件であれば、実装と仕様書は同期している。

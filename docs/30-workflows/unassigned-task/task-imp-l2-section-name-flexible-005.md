# L2 SKILL.md セクション名柔軟化（多言語・別名対応）

## メタ情報

```yaml
issue_number: 1737
```

## メタ情報

| 項目         | 内容                                               |
| ------------ | -------------------------------------------------- |
| タスクID     | task-imp-l2-section-name-flexible-005              |
| タスク名     | L2 SKILL.md セクション名柔軟化（多言語・別名対応） |
| 分類         | 改善（imp）                                        |
| 対象機能     | SkillCreatorVerificationEngine / Layer 2 検証      |
| 優先度       | 低（P2）                                           |
| 見積もり規模 | 小                                                 |
| ステータス   | 未実施                                             |
| 発見元       | Phase 12                                           |
| 発見日       | 2026-03-29                                         |

---

## 1. なぜこのタスクが必要か（Why）

### 背景

`SkillCreatorVerificationEngine` の L2-002（概要セクション検証）および L2-003（Trigger セクション検証）は、
SKILL.md 内のセクション見出しを固定文字列で検索している。

- L2-002: `## 概要` のみを検索
- L2-003: `## Trigger` のみを検索

実スキルのひとつである `task-specification-creator` の SKILL.md では `## Overview` という英語見出しが
使用されており、TASK-P0-01 の manual-test-result.md における TC-11-01 の手動テストで
false negative（存在するのに「なし」と判定される）が発生することが確認された。

### 問題点・課題

- 既存スキルの SKILL.md のセクション名が `## 概要` 以外（例: `## Overview`, `## Summary`）の場合、
  L2-002 が false negative となり、実際には存在する概要セクションを「欠落している」と誤判定する
- `## Trigger` 以外の別名（例: `## 発動条件`, `## トリガー`）を使用したスキルも同様に誤判定される
- false negative が続くと、検証レポートに不必要な error が混入し、信頼性が低下する

### 放置した場合の影響

| 影響領域             | 影響                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------ |
| 既存スキルの検証     | `## Overview` 等を使用するスキルが常に L2-002 error を出し続け、誤った検証結果になる |
| 新規スキルの作成     | スキル作成者が `## 概要` という特定の見出しを使うことを強制され、自由度が低下する    |
| 検証エンジンの信頼性 | false negative が混在し、真の問題との区別が困難になる                                |
| manual-test の記録   | TC-11-01 の N-01/N-02 として記録された既知の不整合が解消されないまま残り続ける       |

---

## 2. 何を達成するか（What）

### 目的

`SkillCreatorVerificationEngine` の L2-002 および L2-003 において、セクション名の別名マッピングを導入し、
`## 概要`・`## Trigger` 以外の同義見出し（`## Overview`、`## Summary` 等）も正しく検出できるようにする。

### 最終ゴール

- L2-002 が `## 概要`・`## Overview`・`## Summary` 等の複数の見出しを等価に扱い、
  いずれかが存在すれば info を返す
- L2-003 が `## Trigger`・`## 発動条件`・`## トリガー` 等の複数の見出しを等価に扱い、
  いずれかが存在すれば info を返す
- `task-specification-creator` の SKILL.md に対して L2-002 が false negative を出さなくなる
- 別名マッピングは設定・拡張可能な構造で実装されており、将来の追加が容易である

### スコープ

**含むもの:**

- `SkillCreatorVerificationEngine.ts` の `hasMarkdownSection` 呼び出し箇所（L2-002、L2-003）の修正
- 別名マッピングテーブル（`SECTION_ALIASES` 等）の定義
- L2-002 / L2-003 の既存テストの更新と、別名検出ケースのテスト追加

**含まないもの:**

- L2-004 以降のセクション（`## Anchors`、`## 責務` 等）の別名対応（別タスクとして対処）
- Layer 1 の変更
- スキル本体の SKILL.md の書き換え

### 成果物

| 種別 | 成果物                                   | 配置先                                                                                    |
| ---- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| 修正 | `SkillCreatorVerificationEngine.ts`      | `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts`                |
| 更新 | `SkillCreatorVerificationEngine.test.ts` | `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` |

---

## 3. どのように実行するか（How）

### 前提条件

- `SkillCreatorVerificationEngine.ts` の L2-002（行 193）と L2-003（行 207）の実装を把握している
- `task-specification-creator` の SKILL.md が `## Overview` を使用していることを確認している

### 推奨アプローチ

**別名マッピングテーブルの導入:**

```typescript
const SECTION_ALIASES: Record<string, string[]> = {
  overview: ["概要", "Overview", "Summary", "はじめに"],
  trigger: ["Trigger", "発動条件", "トリガー", "Triggers"],
};
```

**ヘルパー関数の拡張:**

`hasMarkdownSection` をそのまま利用するか、複数見出しに対応した
`hasMarkdownSectionAny(content: string, headings: string[]): boolean` を追加し、
マッピングテーブルを経由して呼び出す設計とする。

**警告レベルの設計決定:**

- いずれの別名も存在しない場合: `error`（現行通り）
- 推奨見出し（`## 概要`）以外の別名で検出された場合: `info` または `warning`（設計判断が必要）

推奨: 別名でも `info` とする（false negative 解消を優先）。
厳格なスキル標準化を目的とする場合は `warning` を選択する。

### 注意点

- 正規化アプローチ（全見出しを小文字化して比較）はロケール依存の問題を生じるため、
  明示的な別名リストの方が安全
- `escapeRegex` はすでに実装されているため、別名リスト内の文字列を個別にエスケープして正規表現に渡す

---

## 4. 実行手順（Phase 構成）

### Phase 1: 現状把握と設計決定

- `SkillCreatorVerificationEngine.ts` の L2-002 / L2-003 の実装を精読する
- `task-specification-creator` の SKILL.md を確認し、実際に使用されているセクション見出しを列挙する
- 別名リストに含めるべき見出し名を確定する
- 別名検出時の severity（`info` または `warning`）を設計決定する

### Phase 2: 別名マッピングの実装

- `SECTION_ALIASES` テーブルを `SkillCreatorVerificationEngine.ts` に追加する
- `hasMarkdownSectionAny` ヘルパー（または相当のロジック）を実装する
- L2-002 の検索対象を別名マッピング経由に変更する
- L2-003 の検索対象を別名マッピング経由に変更する

### Phase 3: テストの更新・追加

- 既存の L2-002 / L2-003 テストが引き続き通ることを確認する
- `## Overview` を使用した SKILL.md で L2-002 が `info` を返すテストを追加する
- `## 発動条件` を使用した SKILL.md で L2-003 が `info` を返すテストを追加する
- いずれの別名も含まない SKILL.md で `error` が返ることを確認するテストを追加する

### Phase 4: 検証・コミット

- `pnpm --filter @repo/desktop test` を実行し、全テストが通ることを確認する
- 型チェック（`pnpm typecheck`）を実行する
- 変更をコミットする

---

## 5. 完了条件チェックリスト

- [ ] `## Overview` を持つ SKILL.md に対して L2-002 が `info` を返す
- [ ] `## Summary` を持つ SKILL.md に対して L2-002 が `info` を返す
- [ ] `## 発動条件` を持つ SKILL.md に対して L2-003 が `info` を返す
- [ ] 従来通り `## 概要` を持つ SKILL.md に対して L2-002 が `info` を返す
- [ ] 従来通り `## Trigger` を持つ SKILL.md に対して L2-003 が `info` を返す
- [ ] 概要セクションを一切含まない SKILL.md に対して L2-002 が `error` を返す
- [ ] Trigger セクションを一切含まない SKILL.md に対して L2-003 が `error` を返す
- [ ] 別名マッピングテーブルが拡張可能な構造で定義されている
- [ ] 全テストが通る（`pnpm --filter @repo/desktop test`）
- [ ] 型チェックが通る（`pnpm typecheck`）

---

## 6. 検証方法

### 確認手順

```bash
# L2-002 / L2-003 の実装箇所を確認
grep -n "L2-002\|L2-003\|概要\|Trigger" \
  apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts

# task-specification-creator の SKILL.md のセクション見出しを確認
grep -n "^## " .claude/skills/task-specification-creator/SKILL.md

# テスト実行
pnpm --filter @repo/desktop test -- --reporter=verbose SkillCreatorVerificationEngine
```

### テストケース

| #   | テストケース               | 入力 SKILL.md の見出し   | 対象チェック | 期待 severity |
| --- | -------------------------- | ------------------------ | ------------ | ------------- |
| 1   | 日本語見出し（既存）       | `## 概要`                | L2-002       | `info`        |
| 2   | 英語別名                   | `## Overview`            | L2-002       | `info`        |
| 3   | Summary 別名               | `## Summary`             | L2-002       | `info`        |
| 4   | 概要セクションなし         | （概要系見出しなし）     | L2-002       | `error`       |
| 5   | Trigger 英語見出し（既存） | `## Trigger`             | L2-003       | `info`        |
| 6   | Trigger 日本語別名         | `## 発動条件`            | L2-003       | `info`        |
| 7   | トリガー別名               | `## トリガー`            | L2-003       | `info`        |
| 8   | Trigger セクションなし     | （Trigger 系見出しなし） | L2-003       | `error`       |

---

## 7. リスクと対策

| リスク                                  | 影響度 | 発生確率 | 対策                                                                            |
| --------------------------------------- | ------ | -------- | ------------------------------------------------------------------------------- |
| 別名リストの過剰な拡張                  | 低     | 中       | 初期リストは実際に使用されている別名のみに絞り、YAGNI 原則を適用する            |
| 別名マッピングの保守コスト              | 低     | 低       | テーブルを定数として一元管理し、変更箇所を最小化する                            |
| severity の設計変更で既存テストが壊れる | 中     | 中       | Phase 1 で severity の設計決定を確定してから実装に入る                          |
| 正規表現の誤マッチ（部分一致）          | 中     | 低       | `hasMarkdownSection` は行頭 `^##\s+` で検索しているため、部分一致のリスクは低い |
| L2-006（`## 責務`）等への波及           | 低     | 低       | 本タスクのスコープを L2-002 / L2-003 のみに明示的に限定する                     |

---

## 8. 参照情報

### ソースコード

- `apps/desktop/src/main/services/runtime/SkillCreatorVerificationEngine.ts` — L2-002（行 193）・L2-003（行 207）が対象箇所
- `apps/desktop/src/main/services/runtime/__tests__/SkillCreatorVerificationEngine.test.ts` — 更新対象のテストファイル
- `.claude/skills/task-specification-creator/SKILL.md` — false negative が発生する実スキルの例

### 仕様書・記録

- `docs/30-workflows/step-09-par-task-p0-01-verify-execution-engine-layer12/` — TASK-P0-01 の成果物（本タスク発見の根拠）
- `docs/30-workflows/unassigned-task/task-imp-layer12-spec-definition-004.md` — Layer 1/2 check ID 体系追記タスク（関連）

### 関連タスク

- TASK-P0-01: `SkillCreatorVerificationEngine` Layer 1/2 実装（本タスクの前提）
- task-imp-layer12-spec-definition-004: FR-04 verify 契約への check ID 体系追記（並行実施可能）

---

## 9. 備考

### 補足事項

- TASK-P0-01 の手動テスト（TC-11-01）で発見された N-01 / N-02 の不整合（`task-specification-creator` の
  `## Overview` による false negative）が本タスクの直接の発端である。
- 別名対応の設計判断として「別名でも `info`」「別名では `warning`」の二択がある。
  「検証の正確性を最大化する」観点では `info`、「スキル標準化を促進する」観点では `warning` が適切。
  実装者はチームの方針に従って決定すること。
- L2-004（`## Anchors`）・L2-006（`## 責務`）の別名対応は本タスクのスコープ外であり、
  問題が確認された時点で別タスクとして対処すること。
- `hasMarkdownSection` ヘルパーは現在 `escapeRegex` を使用しているため、
  別名リストに `\`（バックスラッシュ）等の正規表現特殊文字を含む見出しが追加された場合でも
  安全に動作する設計になっている。

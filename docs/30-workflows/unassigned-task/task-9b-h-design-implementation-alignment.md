# SkillCreator 設計書-実装整合性修正 - タスク指示書

## メタ情報

```yaml
issue_number: 794
```

## メタ情報

| 項目         | 内容                                                             |
| ------------ | ---------------------------------------------------------------- |
| タスクID     | UT-9B-H-004                                                      |
| タスク名     | SkillCreator設計書-実装整合性修正（Zod/型/メソッド名の乖離対応） |
| 分類         | リファクタリング                                                 |
| 対象機能     | Skill Creator IPC                                                |
| 優先度       | 中                                                               |
| 見積もり規模 | 小規模                                                           |
| ステータス   | 未実施                                                           |
| 発見元       | TASK-9B-H-SKILL-CREATOR-IPC 最終品質レビュー（2026-02-12）       |
| 発見日       | 2026-02-12                                                       |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-H-SKILL-CREATOR-IPCの最終品質レビューにおいて、Phase 2設計書（architecture-design.md, api-specification.md）と実装の間に複数の乖離が発見された。

### 1.2 問題点・課題

Phase 2設計書と実装の間に以下の乖離がある:

1. **Zodスキーマ**: 設計書で詳細に定義されたZodスキーマが未実装（typeof手動チェック）
2. **SkillCreatorProgress型**: 設計書は5フィールド、実装は3フィールド
3. **メソッド名**: 設計書は `create`/`validate`、実装は `createSkill`/`validateSkill`
4. **handleWithErrorBoundary**: 設計書で定義されたエラーバウンダリラッパーが未実装

### 1.3 放置した場合の影響

- 設計書が実装と乖離したまま残り、次回この機能を拡張する際に誤った前提で作業するリスク
- 新規開発者が設計書を参照した際に混乱する
- 仕様書と実装の信頼性が低下する

---

## 2. 何を達成するか（What）

### 2.1 目的

Phase 2設計書と実装の間の乖離を解消し、両者の一致を保証する。

### 2.2 最終ゴール

- 設計書と実装の間に矛盾がないこと
- 選択したOptionの理由が記録されていること
- 変更した設計書のバージョンが更新されていること

### 2.3 スコープ

#### 含むもの

- **Option A（実装を設計書に合わせる）**: Zodスキーマ実装、SkillCreatorProgress型拡張、handleWithErrorBoundary実装
- **Option B（設計書を実装に合わせる - 推奨）**: Phase 2設計書のZodスキーマ記載更新、SkillCreatorProgress型修正、メソッド名更新、handleWithErrorBoundary記載削除
- **Option C（混合アプローチ）**: Zodスキーマは将来実装（UT-9B-H-002で対応中）、その他の乖離は設計書を更新

#### 含まないもの

- 他の設計書と実装の整合性確認（本タスクはskillCreator IPC限定）
- 新機能の追加

### 2.4 成果物

| 成果物                      | パス                                                                         |
| --------------------------- | ---------------------------------------------------------------------------- |
| 設計書更新（Option B/C）    | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/architecture-design.md` |
| API仕様書更新（Option B/C） | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/api-specification.md`   |
| ハンドラー更新（Option A）  | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`                          |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-H-SKILL-CREATOR-IPCが完了していること（完了済み）
- 設計書と実装の両方にアクセスできること

### 3.2 依存タスク

| タスクID                    | 関係   | 説明                                                  |
| --------------------------- | ------ | ----------------------------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 完了済 | 設計書-実装乖離が発見された元タスク                   |
| UT-9B-H-002                 | 関連   | Zodスキーマ移行タスク（Option Cの場合はこちらで対応） |

### 3.3 必要な知識

- Phase 2設計書の構造と記載内容
- skillCreatorHandlers.tsの実装詳細
- 設計書バージョニングのルール

### 3.4 推奨アプローチ

Option B（設計書を実装に合わせる）を推奨する。理由:

- 実装はテスト済み（85テスト全PASS）で正しく動作している
- 設計書の修正は実装変更よりリスクが低い
- Zodスキーマ移行はUT-9B-H-002で別途対応可能

### 3.5 実装課題と解決策（TASK-9B-Hからの学び）

#### 課題1: 並列Phase実行でのレビュータイミング

- **問題**: Phase 8-9（リファクタリング+品質保証）とPhase 10（最終レビュー）を並列実行した結果、Phase 10がPhase 8-9の修正を反映していない状態でレビューを完了してしまった
- **根本原因**: 並列実行の依存関係管理が不十分。Phase 10はPhase 8-9の成果物に依存するにもかかわらず、並列起動した
- **解決策**: 並列実行可能なPhase組み合わせを明確化:
  - 並列OK: Phase 1-3 / Phase 4-7 / Phase 11 / Phase 12
  - 並列NG: Phase 8-9 と Phase 10（依存関係あり）
  - 注意: Phase 10は必ずPhase 8-9完了後に開始する
- **参照**: [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) Lesson 2: 並列Phase実行でのレビュータイミング

#### 課題2: 設計書フォーマットと実装の乖離検出の遅れ

- **問題**: Phase 2設計で定義した型フィールド（SkillCreatorProgress 5フィールド）が実装では3フィールドに簡略化されていたが、Phase 10まで検出されなかった
- **根本原因**: Phase 5実装中の設計変更記録フローが未確立
- **解決策**: Phase 5テンプレートに「設計変更記録」セクションを追加済み（`outputs/phase-5/design-changes.md`）。実装中に設計からの乖離が発生した場合は即座に記録し、Phase 10で乖離の妥当性を検証する
- **参照**: [phase-templates.md](../../.claude/skills/task-specification-creator/references/phase-templates.md) Phase 5 設計変更記録セクション

#### 課題3: Multi-agent並列実行での仕様書更新ギャップ

- **問題**: 複数のエージェントが並列で同じ仕様書を更新しようとした結果、一部の更新が上書きされるリスクが発生した
- **解決策**: 仕様書更新は直列実行に制限するか、エージェントごとに更新対象ファイルを明確に分離する。同一ファイルへの並列書き込みは禁止

---

## 4. 実行手順

### Phase構成

Option B: Phase 12（ドキュメント更新のみ）の構成で実施。

### Option A: 実装を設計書に合わせる

#### 手順

1. Zodスキーマを実装して引数バリデーションを強化
2. SkillCreatorProgress型を5フィールドに拡張
3. handleWithErrorBoundary共通ラッパーを実装
4. テスト更新と全テストPASS確認

### Option B: 設計書を実装に合わせる（推奨）

#### 手順

1. Phase 2設計書のZodスキーマ記載をtypeof手動チェックに更新
2. SkillCreatorProgress型を3フィールドに修正
3. メソッド名をcreateSkill/validateSkillに更新
4. handleWithErrorBoundary記載を削除し、既存パターン準拠を明記
5. 設計書のバージョンを更新

### Option C: 混合アプローチ

#### 手順

1. Zodスキーマは「UT-9B-H-002で将来対応」と設計書に注記
2. その他の乖離（型フィールド数、メソッド名、handleWithErrorBoundary）は設計書を更新
3. 設計書のバージョンを更新

---

## 5. 完了条件チェックリスト

### 機能要件

- [ ] 設計書と実装の間に矛盾がないこと
- [ ] 選択したOptionの理由が記録されていること（PR説明文またはコミットメッセージに記載）

### 品質要件

- [ ] `pnpm typecheck` がPASS（Option A選択時）
- [ ] 全テストPASS（Option A選択時）

### ドキュメント要件

- [ ] 変更した設計書のバージョンが更新されていること
- [ ] 乖離項目ごとに対応結果が明記されていること

---

## 6. 検証方法

### テストケース

- Option A: 実装変更に対応するテストが全てPASS
- Option B/C: 設計書の記述と実装コードを目視比較し、全項目で一致を確認

### 検証手順

1. 乖離項目4点それぞれについて、設計書の記述と実装を比較
2. 全項目で一致していることを確認
3. Option A選択時は `pnpm typecheck && pnpm vitest run` を実行

---

## 7. リスクと対策

| リスク                                       | 影響度 | 発生確率 | 対策                                                       |
| -------------------------------------------- | ------ | -------- | ---------------------------------------------------------- |
| 設計書更新により他の参照箇所に不整合が生じる | 中     | 低       | `grep -rn "architecture-design.md" docs/` で参照箇所を確認 |
| Option A選択時の実装変更によるリグレッション | 高     | 中       | TDDアプローチで先にテストを作成してから実装を変更          |
| UT-9B-H-002との方向性不一致                  | 低     | 中       | 両タスクのOption選択を事前にすり合わせる                   |

---

## 8. 参照情報

### 関連ドキュメント

| ドキュメント           | パス                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- |
| architecture-design.md | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/architecture-design.md` |
| api-specification.md   | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/api-specification.md`   |

### システム仕様書参照

| 仕様書                                    | 関連セクション                    |
| ----------------------------------------- | --------------------------------- |
| `security-electron-ipc.md`                | skillCreatorAPIセキュリティ実装例 |
| `architecture-implementation-patterns.md` | IPC 3層セキュリティパターン       |
| `error-handling.md`                       | エラーサニタイズ仕様              |
| `lessons-learned.md`                      | Lesson 1, 7                       |
| `api-ipc-agent.md`                        | Skill Creator IPCチャンネル定義   |

### 関連タスク

| タスクID                    | 関係   | 説明                              |
| --------------------------- | ------ | --------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 発見元 | SkillCreatorService IPC実装タスク |
| UT-9B-H-002                 | 関連   | Zodスキーマ移行タスク             |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
最終品質レビュー: Phase 2設計書と実装の間に4点の乖離あり（Zodスキーマ、SkillCreatorProgress型フィールド数、メソッド名、handleWithErrorBoundary）。設計書または実装のいずれかを修正して一致させる必要がある。
```

### 補足事項

- UT-9B-H-002（Zodスキーマ移行）と方向性を合わせてOptionを選択すべき
- Option B/Cの場合はドキュメント更新のみで完了するため、コード変更なし
- 設計書の変更はバージョン履歴に理由を含めて記録すること

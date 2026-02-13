# IPCハンドラー引数検証のZodスキーマ移行 - タスク指示書

## フロントマター

```yaml
issue_number: 797
```

## メタ情報

| 項目         | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| タスクID     | UT-9B-H-002                                              |
| タスク名     | SkillCreator IPCハンドラーの引数検証をZodスキーマに移行  |
| 分類         | リファクタリング                                         |
| 対象機能     | Skill Creator IPC                                        |
| 優先度       | 低                                                       |
| 見積もり規模 | 小規模                                                   |
| ステータス   | 未実施                                                   |
| 発見元       | TASK-9B-H-SKILL-CREATOR-IPC Phase 10 m-02 / Phase 11 D-2 |
| 発見日       | 2026-02-12                                               |
| ブロック対象 | なし                                                     |

---

## 1. なぜこのタスクが必要か（Why）

### 1.1 背景

TASK-9B-H-SKILL-CREATOR-IPCの設計フェーズ（Phase 2）のAC-06では、Zodスキーマによる引数検証が要求されていた。実装ではtypeof手動チェックで同等の検証を実現しているが、仕様との文言上の不一致がある。

### 1.2 問題点

- `skillCreatorHandlers.ts` の5つのハンドラーで `typeof args?.request !== "string"` 等の手動バリデーションが使用されている
- AC-06の仕様文言「Zodスキーマによる引数検証」と実装が不一致
- 手動バリデーションは機能的に同等だが、複雑な構造の検証ではZodの方が保守性に優れる

### 1.3 放置した場合の影響

- 仕様書と実装の乖離が残存
- 将来的に複雑な引数構造が追加された場合、手動チェックの保守コストが増大
- 他のIPCハンドラーとのバリデーション方式の不統一

---

## 2. 何を達成するか（What）

### 2.1 目的

以下のいずれかを実施する:

1. **Option A**: `skillCreatorHandlers.ts` の引数検証をZodスキーマに移行する（AC-06の記述を正とする場合）
2. **Option B**: AC-06の記述を「型チェックによる引数バリデーション」に更新する（現行実装を正とする場合）

### 2.2 最終ゴール

- 仕様書（AC-06）と実装が一致している
- 全テストがPASSする

### 2.3 スコープ

#### 含むもの（Option Aの場合）

- `skillCreatorHandlers.ts` 全5ハンドラーのZodスキーマ定義
- 手動typeofチェックのZod `.parse()` / `.safeParse()` への置換
- テストケースの更新（Zodバリデーションエラーの検証）

#### 含むもの（Option Bの場合）

- Phase 2設計仕様書のAC-06記述更新
- interfaces-agent-sdk-skill.md のバリデーション方式記載更新

#### 含まないもの

- 他のIPCハンドラーのZod移行（別タスク）
- 新しいバリデーションルールの追加

### 2.4 成果物

| 成果物                     | パス                                                   |
| -------------------------- | ------------------------------------------------------ |
| ハンドラー更新（Option A） | `apps/desktop/src/main/ipc/skillCreatorHandlers.ts`    |
| 仕様書更新（Option B）     | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/` |

---

## 3. どのように実行するか（How）

### 3.1 前提条件

- TASK-9B-H-SKILL-CREATOR-IPCが完了していること（完了済み）
- Zodライブラリが `@repo/desktop` の依存に含まれていること（Option A選択時）

### 3.2 依存タスク

| タスクID                    | 関係   | 説明                                          |
| --------------------------- | ------ | --------------------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 完了済 | Zodスキーマ未使用が発見された元タスク         |
| UT-9B-H-004                 | 関連   | 設計書-実装整合性修正（Optionの方向性を共有） |

### 3.3 必要な知識

- Zodスキーマバリデーションライブラリの使用方法（Option A選択時）
- Electron IPC ハンドラーの引数バリデーションパターン
- AC-06の仕様文言と実装の対応関係

### 3.4 推奨アプローチ

Option AまたはBのいずれかを選択する。判断基準:

- 他のIPCハンドラーで既にZodを使用している場合はOption A（統一性）
- Zodが未使用の場合はOption B（不要な依存追加を避ける）

### 3.5 実装課題と解決策（TASK-9B-Hからの学び）

#### 課題1: 設計-実装乖離の管理

- **問題**: Phase 2設計ではZodスキーマによる引数検証を定義していたが、Phase 5実装時にtypeof手動チェックに変更。この乖離がPhase 10レビューまで検出されなかった
- **根本原因**: Phase 5実装中に設計変更が発生した際の記録・承認フローが不明確だった
- **解決策**: Phase 5実装中に設計からの乖離が発生した場合は、`outputs/phase-5/design-changes.md`に即座に記録し、Phase 10レビューで検証できるようにする
- **参照**: [lessons-learned.md](../../.claude/skills/aiworkflow-requirements/references/lessons-learned.md) Lesson 7: 設計-実装乖離管理

#### 課題2: 既存ハンドラーパターンとの整合性

- **問題**: 既存のIPCハンドラー（authHandlers, skillHandlers等）がtypeof手動チェックを使用していたため、新規ハンドラーだけZodに切り替えるとコードベースの一貫性が崩れるリスクがあった
- **解決策**:
  - Option A: 全ハンドラーを一括でZodに移行（推奨だが高コスト）
  - Option B: 新規ハンドラーのみZod化し、既存は段階的に移行
  - 判断基準: 既存テストが全PASSしている場合、Option Bが低リスク

#### 課題3: セキュリティバリデーションとZodの共存設計

- **問題**: UT-9B-H-003でtypeof手動チェックに加えてL3セキュリティバリデーション（パストラバーサル検出、NULLバイトチェック等）を追加した。Zodスキーマに移行する場合、これらのセキュリティチェックをZodの`.refine()`や`.transform()`で表現する必要がある
- **解決策**: Zodスキーマ移行時のセキュリティバリデーション統合パターン: (1) 基本型チェックはZod.string()等で代替 (2) セキュリティチェック（パストラバーサル等）は`.refine(val => !containsTraversal(val))`で統合 (3) sanitizeErrorMessageはZodエラーハンドリング外に維持（ZodErrorはセキュリティ情報を含まないため）
- **参照**: security-electron-ipc.md v1.3.1, architecture-implementation-patterns.md v1.21.0

---

## 4. 実行手順

### Phase構成

Option A: Phase 4-9（テスト作成→実装→品質検証）
Option B: Phase 12（ドキュメント更新のみ）

### Option A（Zodスキーマ移行）

#### 手順

1. 各ハンドラーの引数構造に対応するZodスキーマを定義
2. typeof手動チェックを `schema.safeParse(args)` に置換
3. バリデーションエラー時のレスポンスを既存形式（`{ success: false, error: "..." }`）に維持
4. テスト更新: Zodバリデーションエラーのメッセージ形式に合わせる
5. `pnpm typecheck` と全テストPASSを確認

### Option B（仕様書更新）

#### 手順

1. Phase 2設計仕様書のAC-06を「typeof手動チェックによる引数バリデーション」に更新
2. interfaces-agent-sdk-skill.md のバリデーション方式を更新

---

## 5. 完了条件チェックリスト

- [ ] AC-06の記述と実装が一致している
- [ ] 全5ハンドラーの引数検証が仕様通りに動作
- [ ] `pnpm typecheck` がPASS
- [ ] 関連テスト全PASS

---

## 6. 検証方法

### テストケース

- Option A: 全5ハンドラーでZod `.safeParse()` が呼ばれていることを検証するテスト
- Option A: 不正な引数型でZodバリデーションエラーが返ることを検証するテスト
- Option B: 仕様書のAC-06記述と実装の一致を目視確認
- 共通: `pnpm typecheck` がPASS、関連テスト全PASS

### 検証手順

1. Option選択理由を記録
2. 実装/仕様書変更後に `pnpm typecheck` を実行
3. `pnpm vitest run apps/desktop/src/main/ipc/__tests__/skillCreator` で関連テスト実行
4. AC-06の記述と実装の一致を確認

---

## 7. リスクと対策

| リスク                                            | 影響度 | 発生確率 | 対策                                                                                                                              |
| ------------------------------------------------- | ------ | -------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Zod依存追加によるバンドルサイズ増加（Option A）   | 低     | 高       | Main Process専用のため影響は限定的                                                                                                |
| Zodエラーメッセージ形式の変更による既存テスト破損 | 中     | 中       | `safeParse` のエラーをカスタムメッセージに変換して形式維持                                                                        |
| 仕様書と実装の乖離が他にも存在する可能性          | 低     | 中       | UT-9B-H-004と連携して全体的な乖離を解消                                                                                           |
| Zodスキーマとセキュリティバリデーションの重複     | 中     | 中       | L3セキュリティチェック（validatePath等）はZod.refine()に統合するか、Zodバリデーション後の別レイヤーとして維持するか事前に設計する |

---

## 8. 参照情報

| ドキュメント                                      | パス                                                                          |
| ------------------------------------------------- | ----------------------------------------------------------------------------- |
| Phase 2 設計仕様                                  | `docs/30-workflows/skill-creator-ipc/outputs/phase-2/api-specification.md`    |
| Phase 10 最終レビュー                             | `docs/30-workflows/skill-creator-ipc/outputs/phase-10/final-review-result.md` |
| Phase 11 発見課題                                 | `docs/30-workflows/skill-creator-ipc/outputs/phase-11/discovered-issues.md`   |
| `architecture-implementation-patterns.md`         | IPC型定義配置戦略                                                             |
| `api-ipc-agent.md`                                | Skill Creator IPCチャンネル定義                                               |
| `lessons-learned.md`                              | Lesson 3: IPC型定義の配置戦略 / Lesson 7: 設計-実装乖離管理                   |
| `security-electron-ipc.md` v1.3.1                 | L3ドメイン検証パターン完了記録                                                |
| `architecture-implementation-patterns.md` v1.21.0 | IPC L3ドメイン検証パターン                                                    |
| `lessons-learned.md` v1.6.0                       | UT-9B-H-003苦戦箇所（TDDセキュリティテスト分類体系、YAGNI判断記録）           |

### 関連タスク

| タスクID                    | 関係   | 説明                              |
| --------------------------- | ------ | --------------------------------- |
| TASK-9B-H-SKILL-CREATOR-IPC | 発見元 | SkillCreatorService IPC実装タスク |

### 現行の手動バリデーション箇所

| ハンドラー      | 行番号   | チェック内容                                           |
| --------------- | -------- | ------------------------------------------------------ |
| detect-mode     | L61      | `typeof args?.request !== "string"` + 空文字チェック   |
| create          | L100-103 | name, description, mode の型チェック                   |
| execute-tasks   | L143     | `typeof args?.tasksDir !== "string"` + trimチェック    |
| validate        | L182     | `typeof args?.skillDir !== "string"` + trimチェック    |
| validate-schema | L221-224 | schemaName型チェック + trimチェック + data定義チェック |

---

## 9. 備考

### レビュー指摘の原文（該当する場合）

```
Phase 10 m-02: AC-06の仕様文言「Zodスキーマによる引数検証」と実装（typeof手動チェック）が不一致。
Phase 11 D-2: 手動バリデーションは機能的に同等だが、仕様書との乖離がある。
```

### 補足事項

- 現時点の手動バリデーションは機能的に正常に動作しており、緊急度は低い
- UT-9B-H-004（設計書-実装整合性修正）と方向性を合わせてOptionを選択すべき
- 他のIPCハンドラー（authModeHandlers.ts, skillHandlers.ts等）のバリデーション方式も参考にすること

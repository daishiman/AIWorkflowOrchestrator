# Phase 1: 要件抽出マップ

## P50チェック結果

### 1-1. SkillCreatorService.ts 現状調査

| 確認項目                   | 結果                                                                                                             |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `void structurePlan;` 箇所 | **line 126**: `void structurePlan; // 将来 generateSkillMd へ渡す（タスクA完了後に接続）`                        |
| `runCreateWorkflow` の実装 | **line 630**: `private async runCreateWorkflow(options: CreateSkillOptions): Promise<StructurePlanJson \| null>` |
| `create` ケース全体        | **line 114-117**: `case "create": structurePlan = await this.runCreateWorkflow(options); break;`                 |
| `generateSkillMd` メソッド | **存在しない**（未実装）                                                                                         |
| `ensureSkillMdExists`      | **line 872**: `private async ensureSkillMdExists(skillDir, skillName, description)`                              |
| SKILL.md 生成ブロック      | **line 173-218**: 汎用 plan 形式を使用し `generate_skill_md.js --plan --output` を呼ぶ                           |
| logger フィールド          | **存在しない**（未実装）                                                                                         |

### 1-2. generate_skill_md.js の --plan オプション状態

| 確認項目                                   | 結果                                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| スクリプトファイルの有無                   | `apps/desktop/src/main/services/skill/scripts/` ディレクトリ自体が存在しない（空）                   |
| テストでのモック状況                       | `ScriptExecutor` 経由でモック済。既存テスト TC-01〜TC-07 が `--plan` / `--output` 呼び出しを検証済み |
| TASK-SC-FIX-GENERATE-SKILL-MD-001 完了状態 | テストにて `--plan`/`--output` パターンが検証されており、先行タスク完了と判定                        |

### 1-3. generateSkillMd メソッドの確認

- `generateSkillMd`: **未実装**
- `ensureSkillMdExists`: **line 872 に実装済み**（フォールバック用テンプレート生成）

### 1-4. 既存テストファイルの確認

| ファイル                      | 存在                                             |
| ----------------------------- | ------------------------------------------------ |
| `SkillCreatorService.test.ts` | あり（`__tests__/` 配下）                        |
| `runCreateWorkflow` テスト    | あり（TC-01, TC-B01〜TC-B06 で間接的に確認済み） |
| `generateSkillMd` テスト      | **なし**（本タスクで追加対象）                   |

---

## 受け入れ条件（AC）定義

| ID   | 受け入れ条件                                                                                              | 検証方法                                                                               |
| ---- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| AC-1 | create モードで `runCreateWorkflow` が `StructurePlanJson` を返した場合、`generateSkillMd` が呼ばれること | UT: `generateSkillMd` が1回 call されることをspyで確認                                 |
| AC-2 | `structurePlan` が `null` の場合は `generateSkillMd` をスキップし、`ensureSkillMdExists` を呼ぶこと       | UT: `generateSkillMd` が call されないこと・`ensureSkillMdExists` が呼ばれることを確認 |
| AC-3 | `generate_skill_md.js` が `--plan` オプションで `structurePlan` データを受け取り正常動作すること          | IT: `--plan <tmpFile> --output <skillMdPath>` で実行した場合に正しく呼ばれること       |
| AC-4 | 既存のテストが全て PASS すること                                                                          | `pnpm --filter @repo/desktop exec vitest run` が全件 PASS                              |
| AC-5 | 接続後の統合テストが追加されていること                                                                    | create モードの統合テストが新規追加されており PASS すること                            |

---

## スコープ定義

### In Scope

| 対象                                            | 内容                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `SkillCreatorService.ts` の `create` フロー修正 | `void structurePlan;` を削除し、`if (structurePlan)` で `generateSkillMd` へ接続            |
| `generateSkillMd` メソッドの新規実装            | `skillDir` と `StructurePlanJson` を受け取り `generate_skill_md.js` を呼ぶ private メソッド |
| SKILL.md 生成ブロックの置換                     | 既存汎用プランブロック（lines 173-218）を新しい条件分岐に置換                               |
| UT の追加（AC-1〜AC-2 の検証）                  | TC-CONNECT-1〜4                                                                             |
| IT の追加（AC-3・AC-5 の検証）                  | IT-CONNECT-1〜2                                                                             |
| logger フィールドの追加                         | null ケース用の console wrapper ロガー                                                      |

### Out of Scope

| 対象                                              | 理由                                                               |
| ------------------------------------------------- | ------------------------------------------------------------------ |
| `generate_skill_md.js` の `--plan` オプション実装 | `TASK-SC-FIX-GENERATE-SKILL-MD-001` の責務（先行タスクで対応済み） |
| `runCreateWorkflow` 自体のロジック変更            | 本タスクは戻り値の接続のみ                                         |
| UI/レンダラー側の変更                             | バックエンドサービス層のみ対象                                     |

---

## 統合ポイント・データフロー

| 統合ポイント                                        | 要件                                                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `generateSkillMd(skillDir, structurePlan)` 呼び出し | `structurePlan` が非 null の場合のみ呼ばれること（AC-1）                                          |
| `generate_skill_md.js` への `--plan` 渡し           | tmpFile に plan データをシリアライズして書き込み、パスを渡す                                      |
| `structurePlan` が null の場合のフロー              | `ensureSkillMdExists` 直接呼び出し（AC-2）                                                        |
| データフロー                                        | `runCreateWorkflow` → `StructurePlanJson` → `generateSkillMd` → `generate_skill_md.js` → SKILL.md |

---

## 重要な発見事項

1. **logger 未実装**: サービスに logger フィールドがない。`private readonly logger` を追加する必要がある
2. **SKILL.md 生成ブロックは全モード共通**: 現在の lines 173-218 は create/collaborative/orchestrate 全てで実行される。新実装では条件分岐が必要
3. **既存テスト TC-01〜TC-07 との互換性**: `generateSkillMd` が structurePlan を workflow 形式に変換して書き込む場合、既存テストは PASS する
4. **structurePlan が null 以外でも undefined フィールドを持つ場合がある**: `loadAgent` が undefined を返すと structurePlan のフィールドが undefined になるが、オブジェクト自体は non-null

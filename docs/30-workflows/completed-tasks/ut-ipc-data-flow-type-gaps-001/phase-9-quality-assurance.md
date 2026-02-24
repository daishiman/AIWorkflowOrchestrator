# Phase 9: 品質保証

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase番号  | 9                                  |
| Phase名    | 品質保証                           |
| 目的       | 仕様書の型一貫性・完全性・品質検証 |
| 前提Phase  | Phase 8（仕様書品質改善）          |
| 後続Phase  | Phase 10（最終レビューゲート）     |
| ステータス | 未実施                             |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001     |
| 機能名     | データフロー型ギャップ解消         |
| 作成日     | 2026-02-24                         |
| タスク種別 | 仕様書修正のみ（実コード変更なし） |

---

## 目的

Phase 5-8で修正した仕様書全体の品質を検証する。型定義の一貫性、IPCデータフローの完全性、既知の落とし穴（P44/P45/P5）対策が全チェックリスト項目を満たしていることを確認し、後続の最終レビューに備える。

---

## 実行タスク

- 品質横断検証: 型整合・IPC フロー・Pitfall 対策を横断検証する
- 品質基準検証: 曖昧表現とフォーマット規約を検証する
- ゲート判定: 品質ゲート5項目の合否を判定する

| #   | タスク名                    | 概要                                                                |
| --- | --------------------------- | ------------------------------------------------------------------- |
| 1   | 型定義の一貫性検証          | 全6 Gap間で型定義（フィールド名・値セット）に矛盾がないことを検証   |
| 2   | IPCデータフローの完全性検証 | 各Gapの5ポイント（送信・橋渡し・処理・復路・受信）全てで型を検証    |
| 3   | P44/P45対策の検証           | 全IPCハンドラコード例でインターフェース一致・命名一致を検証         |
| 4   | P5対策の検証                | Gap 5のsafeOn購読で二重登録防止・クリーンアップの記載を検証         |
| 5   | 曖昧表現の検出・排除        | 禁止対象の曖昧語（条件未定義語・任意判断語・列挙省略語）を0件にする |
| 6   | フォーマット一貫性チェック  | 型注記・テーブル・見出し・インデントの統一性を検証                  |
| 7   | 成果物の作成・配置          | 型一貫性・データフロー・品質チェックの3レポートを作成               |
| 8   | 品質ゲート判定              | 全5ゲート項目のクリア確認                                           |

---

## 参照資料

| 資料名                     | パス・参照先                                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 8 品質改善レポート   | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-8/spec-quality-improvement.md`           |
| Phase 1 抽出成果物         | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| Phase 5 仕様書修正結果     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md`                             |
| P44 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md#P44`                                                                                 |
| P45 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md#P45`                                                                                 |
| P5 既知の落とし穴          | `.claude/rules/06-known-pitfalls.md#P5`                                                                                  |
| P42 既知の落とし穴         | `.claude/rules/06-known-pitfalls.md#P42`                                                                                 |
| コード品質ルール           | `.claude/rules/02-code-quality.md`                                                                                       |
| 修正対象仕様書群           | `docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence/`                             |
| IPC API 仕様               | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     |
| Skill IF 仕様              | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |
| IPC セキュリティ仕様       | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| Skill IPC セキュリティ仕様 | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                |
| 実装パターン仕様           | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |

---

## 実行手順

### Step 1: 型定義の一貫性検証

全6 Gap間で型定義に矛盾がないことを検証する。

**検証マトリクス**:

| 型名               | 定義元   | 参照先 | 検証内容                                |
| ------------------ | -------- | ------ | --------------------------------------- |
| DebugSession       | task-9h  | 05B    | status 値セット・Date型フィールドの一致 |
| DebugEventPayload  | task-9h  | 05B    | safeOn コールバック引数型の一致         |
| DocPreviewResult   | task-9j  | 05B    | onExport 引数型の一致                   |
| ExportResult       | task-9j  | 05B    | UI コールバック変換ロジックの型整合     |
| SkillCreateArgs    | task-9a  | -      | オブジェクト形式への統一済み確認        |
| Date型フィールド群 | 全task-9 | -      | ISO 8601 string 注記の統一済み確認      |

**検証コマンド**:

```bash
# 型名の出現箇所を全仕様書で検索し、定義の一致を確認
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"
grep -rn "DebugSession" "${TASK_BASE}"/task-0*.md
grep -rn "DocPreview\|ExportResult" "${TASK_BASE}"/task-0*.md
grep -rn "DebugEventPayload\|DebugEvent" "${TASK_BASE}"/task-0*.md
```

**判定基準**:

- 同一型名の定義が複数箇所にある場合、フィールド・値セットが完全一致すること
- 一致しない場合は Phase 8 で統一漏れがあるため、差し戻しを検討する

### Step 2: IPCデータフローの完全性検証

各Gapについて、Renderer → Preload → Main → Preload → Renderer の全ポイントで型が明確に定義されているか検証する。

**データフロー検証テンプレート**:

各GapのIPCデータフローを以下の5ポイントで検証する:

| ポイント             | 検証内容                         | Gap 1 | Gap 2 | Gap 3 | Gap 4 | Gap 5 | Gap 6 |
| -------------------- | -------------------------------- | ----- | ----- | ----- | ----- | ----- | ----- |
| ① Renderer（送信側） | 呼び出し元コンポーネントの引数型 | TBD   | TBD   | TBD   | TBD   | TBD   | TBD   |
| ② Preload（橋渡し）  | safeInvoke/safeOn の引数型       | TBD   | TBD   | TBD   | TBD   | TBD   | TBD   |
| ③ Main（処理側）     | ipcMain.handle の引数型          | TBD   | TBD   | TBD   | TBD   | TBD   | TBD   |
| ④ Preload（復路）    | 戻り値型 / イベントペイロード型  | TBD   | TBD   | TBD   | TBD   | TBD   | TBD   |
| ⑤ Renderer（受信側） | UIコンポーネントが受け取る型     | TBD   | TBD   | TBD   | TBD   | TBD   | TBD   |

**Gap別の注意点**:

| Gap | 特に注意するポイント                                              |
| --- | ----------------------------------------------------------------- |
| 1   | ③→④でDate→string変換が明記されているか                            |
| 2   | ①と③で status の値セットが一致しているか（idle 含む）             |
| 3   | ①の onExport 引数型と③の ExportResult 型が整合しているか          |
| 4   | ④→⑤の ExportResult → UIコールバック変換ロジックが明記されているか |
| 5   | ②の safeOn 購読パターンと④のイベント送信パターンが対応しているか  |
| 6   | ①→②→③の引数がオブジェクト形式で統一されているか                   |

### Step 3: 既知の落とし穴（Pitfall）対策の網羅性検証

P44/P45/P5 の対策が仕様書に全チェックリスト項目を満たす形で記載されているか検証する。

**P44（IPCインターフェース不整合）対策チェック**:

- [ ] 全IPCハンドラのコード例で、Preload側の呼び出し形式とMain側のハンドラ引数が一致している
- [ ] P42準拠の3段バリデーション（型チェック → 空文字列 → トリム空文字列）がコード例に含まれている
- [ ] ハンドラとPreloadのインターフェース契約が明示的にテーブルで記載されている

**P45（引数命名の契約ドリフト）対策チェック**:

- [ ] IPC引数名が実際に渡される値のセマンティクスと一致している
- [ ] `skillId` vs `skillName` のような命名不一致がない
- [ ] 全レイヤー（ハンドラ・サービス・マネージャー）で引数名が統一されている

**P5（リスナー二重登録）対策チェック**:

- [ ] Gap 5（safeOn購読）で二重登録防止パターンが記載されている
- [ ] React StrictMode での useEffect 二重実行への対策が記載されている
- [ ] クリーンアップ関数（リスナー解除）パターンが記載されている
- [ ] Main Process側の `unregisterAllIpcHandlers()` パターンへの言及がある

### Step 4: 仕様書品質基準の検証

02-code-quality.md のコーディング規約に準拠しているか検証する。

**曖昧表現の検出**:

```bash
# 曖昧語を検出（仕様書・コメントでは禁止）
TASK_BASE="docs/30-workflows/skill-import-agent-system/tasks/task-00-unified-implementation-sequence"
grep -rn "条件未定義語\|任意判断語\|列挙省略語" "${TASK_BASE}"/task-0*.md
```

**禁止表現一覧**:

| 禁止表現     | 代替表現の例                             |
| ------------ | ---------------------------------------- |
| 条件未定義語 | 条件を明示（「X が Y の場合に Z する」） |
| 任意判断語   | トリガー条件を明示                       |
| 列挙省略語   | 全列挙するか、範囲を明示                 |
| 「正しく」   | 検証条件を明示                           |

**フォーマット一貫性チェック**:

- [ ] 型注記（TypeScript コード例）のフォーマットが統一されている
- [ ] テーブルの列幅・アライメントが統一されている
- [ ] 見出しレベル（H1-H4）の使い方が統一されている
- [ ] コード例のインデント（2スペース）が統一されている

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物               | 説明                        | 配置先                                |
| -------------------- | --------------------------- | ------------------------------------- |
| 型一貫性検証レポート | 全Gap間の型矛盾チェック結果 | `outputs/phase-9/type-consistency.md` |
| データフロー検証結果 | 5ポイント検証の結果         | `outputs/phase-9/data-flow-verify.md` |
| 品質チェックレポート | 曖昧表現・フォーマット結果  | `outputs/phase-9/quality-check.md`    |

---

## 完了条件

- [ ] 全6 Gap間で型定義に矛盾がない
- [ ] IPCデータフローの5ポイント全てで型が明確に定義されている
- [ ] P44/P45/P5 対策の全チェックリスト項目（Step 3の10項目）が満たされている
- [ ] 曖昧語（条件未定義語・任意判断語・列挙省略語）が排除されている
- [ ] フォーマットが仕様書品質基準に準拠している
- [ ] 全成果物が作成・配置されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## 品質ゲート

以下の品質ゲートを全てクリアすること:

| ゲート項目         | 確認内容                    | 結果 |
| ------------------ | --------------------------- | ---- |
| 型一貫性           | 全Gap間で型定義に矛盾がない | TBD  |
| データフロー完全性 | 5ポイント全てで型が明確     | TBD  |
| Pitfall対策        | P44/P45/P5 全10項目クリア   | TBD  |
| 曖昧表現排除       | 禁止表現が0件               | TBD  |
| フォーマット統一   | コード例・テーブルの統一性  | TBD  |

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 型定義の一貫性検証（Step 1）
2. IPCデータフローの完全性検証（Step 2）
3. P44/P45対策の網羅性検証（Step 3-a）
4. P5対策の網羅性検証（Step 3-b）
5. 曖昧表現の検出・排除（Step 4-a）
6. フォーマット一貫性チェック（Step 4-b）
7. 成果物の作成・配置
8. 品質ゲート判定の実施
9. 完了条件の検証

**重要**: 各サブタスクは実行完了後すぐにcompletedに更新すること。

---

## スキル100%実行確認【必須】

Phase完了前に以下を確認:

- [ ] 本Phase内の全タスクを100%実行完了
- [ ] 各成果物が生成されている
- [ ] artifacts.jsonが更新されている
- [ ] Phase末端で各タスクを100%完了し、完了を明記している

```bash
# Phase完了時の検証コマンド
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001 --phase 9
```

---

## 次のPhase

Phase 10: 最終レビューゲート

---

## 備考

- 本タスクは仕様書修正のみのため、セキュリティ検査・パフォーマンス検証は対象外
- 品質保証の焦点は「仕様書としての品質」であり、「実装コードの品質」ではない
- 曖昧表現の検出で問題が見つかった場合は、Phase 8 に差し戻さず本Phase内で修正する
- P44/P45/P5 対策のチェックリスト項目に未達がある場合は、該当Gap の仕様書を本Phase内で補強する

# Phase 10: 最終レビューゲート

## メタ情報

| 項目       | 内容                               |
| ---------- | ---------------------------------- |
| Phase番号  | 10                                 |
| Phase名    | 最終レビューゲート                 |
| 目的       | 全体品質・整合性の最終検証と判定   |
| 前提Phase  | Phase 9（品質保証）                |
| 後続Phase  | Phase 11（手動検証）               |
| ステータス | 未実施                             |
| タスクID   | UT-IPC-DATA-FLOW-TYPE-GAPS-001     |
| 機能名     | データフロー型ギャップ解消         |
| 作成日     | 2026-02-24                         |
| タスク種別 | 仕様書修正のみ（実コード変更なし） |

---

## 目的

全Phaseの成果物を7つの観点（Gap完全性・型整合性・データフロー正確性・P44/P45対策・P5対策・仕様書品質・影響評価）でレビューし、手動検証フェーズへの移行可否を判定する。6つのGapが全て解消され、仕様書としての品質基準を満たしていることを最終確認する。

---

## 実行タスク

- 成果物レビュー: Phase 1〜9 の成果物と検証結果を収集・確認する
- 観点別レビュー: 7観点で整合性・再発防止・品質を判定する
- 最終判定: PASS/MINOR/MAJOR/CRITICAL を決定し記録する

| #   | タスク名                        | 概要                                                                   |
| --- | ------------------------------- | ---------------------------------------------------------------------- |
| 1   | 成果物収集                      | Phase 1-9の全成果物の存在確認                                          |
| 2   | Gap修正の完全性レビュー         | 6 Gap全てが仕様書上で解消されていることを確認                          |
| 3   | 型定義の整合性レビュー          | バックエンド型とフロントエンドUI Props間の型一致を確認                 |
| 4   | IPCデータフローの正確性レビュー | 5ポイント全てで型変換・バリデーション・エラーハンドリングを確認        |
| 5   | P44/P45再発リスク排除レビュー   | 全IPCハンドラのインターフェース一致・命名一致・3段バリデーションを確認 |
| 6   | P5対策レビュー                  | safeOn購読の二重登録防止・クリーンアップ記載を確認                     |
| 7   | 仕様書品質レビュー              | 曖昧表現0件・フォーマット統一・相互参照リンク正確性を確認              |
| 8   | 後続実装への影響評価            | 各Gapの仕様変更が将来の実装に与える影響度（低・中・高）を評価          |
| 9   | 判定会議・結果記録              | 全7観点の結果を集約しPASS/MINOR/MAJOR/CRITICALを判定                   |

---

## 参照資料

| 資料名                       | パス・参照先                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Phase 9 品質保証レポート     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-9/quality-report.md`                     |
| Phase 8 品質改善レポート     | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-8/spec-quality-improvement.md`           |
| Phase 5 仕様書修正結果       | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-5-implementation.md`                             |
| Phase 2 設計書               | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-2-design.md`                                     |
| Phase 1 要件定義書           | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/phase-1-requirements.md`                               |
| Phase 1 抽出成果物           | `docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001/outputs/phase-1/aiworkflow-requirements-extraction.md` |
| IPC API 仕様                 | `.claude/skills/aiworkflow-requirements/references/api-ipc-agent.md`                                                     |
| Skill IF 仕様                | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill.md`                                        |
| IPC セキュリティ仕様         | `.claude/skills/aiworkflow-requirements/references/security-electron-ipc.md`                                             |
| Skill IPC セキュリティ仕様   | `.claude/skills/aiworkflow-requirements/references/security-skill-ipc.md`                                                |
| 実装パターン仕様             | `.claude/skills/aiworkflow-requirements/references/architecture-implementation-patterns.md`                              |
| タスク実行ワークフロールール | `.claude/rules/05-task-execution.md`                                                                                     |
| P44 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P44`                                                                                 |
| P45 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P45`                                                                                 |
| P5 既知の落とし穴            | `.claude/rules/06-known-pitfalls.md#P5`                                                                                  |
| P42 既知の落とし穴           | `.claude/rules/06-known-pitfalls.md#P42`                                                                                 |

---

## レビュー観点

### 観点 1: Gap修正の完全性

6 Gap全てが仕様書上で解消されているか確認する。

| Gap ID | 概要                                     | 修正状態 | 検証方法                         |
| ------ | ---------------------------------------- | -------- | -------------------------------- |
| Gap 1  | Date型のIPCシリアライズ問題              | TBD      | ISO 8601 string注記の存在確認    |
| Gap 2  | DebugSession.status に idle がない       | TBD      | idle を含む値セットの定義確認    |
| Gap 3  | DocPreview onExport 引数不整合           | TBD      | 引数型の一致確認                 |
| Gap 4  | ExportResult → UI コールバック変換未記載 | TBD      | 変換ロジックの記載確認           |
| Gap 5  | skill:debug:event の safeOn 購読未記載   | TBD      | safeOn パターンの記載確認        |
| Gap 6  | task-9a IPC引数形式 positional → object  | TBD      | 全コード例のオブジェクト形式確認 |

### 観点 2: 型定義の整合性

バックエンド型定義とフロントエンドUI Props間で型が一致するか確認する。

| 型ペア                                   | 定義元   | 使用先 | 整合性 |
| ---------------------------------------- | -------- | ------ | ------ |
| DebugSession ↔ DebugControlsProps        | task-9h  | 05B    | TBD    |
| ExportResult ↔ onExport コールバック引数 | task-9j  | 05B    | TBD    |
| DebugEventPayload ↔ safeOn コールバック  | task-9h  | 05B    | TBD    |
| Date型フィールド ↔ string型（IPC後）     | 全task-9 | 05B    | TBD    |

### 観点 3: IPCデータフローの正確性

Renderer → Preload → Main → Preload → Renderer の各ポイントで型変換が正確に記載されているか確認する。

**確認項目**:

- [ ] 各Gapで5ポイント（送信→橋渡し→処理→復路→受信）が全て記載されている
- [ ] 型変換が発生するポイント（Date→string等）が明示されている
- [ ] バリデーションが実行されるポイントが明示されている
- [ ] エラーハンドリングパスが記載されている

### 観点 4: P44/P45 再発リスクの排除

IPCインターフェース不整合（P44）と引数命名ドリフト（P45）の再発リスクがないか確認する。

**チェックリスト**:

- [ ] 全IPCハンドラで Preload 側の呼び出し形式と Main 側の引数形式が一致している
- [ ] 引数名が実際に渡される値のセマンティクスと一致している（例: skillName ≠ skillId）
- [ ] P42準拠3段バリデーション（型チェック → 空文字列 → トリム空文字列）が全ハンドラのコード例に含まれている
- [ ] インターフェース契約テーブル（Preload ↔ Main の引数マッピング）が明記されている

### 観点 5: P5（リスナー二重登録）対策の網羅性

safeOn 購読パターン（Gap 5）でリスナー二重登録が防止されているか確認する。

**チェックリスト**:

- [ ] React StrictMode 対応（useEffect 二重実行への対策）が記載されている
- [ ] クリーンアップ関数（コンポーネント unmount 時のリスナー解除）が記載されている
- [ ] Main Process 側の二重登録防止パターン（unregisterAllIpcHandlers）への言及がある
- [ ] モジュールレベルでのガードパターンが記載されている

### 観点 6: 仕様書品質

仕様書としての品質基準を満たしているか確認する。

**チェックリスト**:

- [ ] 曖昧語（条件未定義語・任意判断語・列挙省略語）が排除されている
- [ ] 型注記のフォーマットが統一されている
- [ ] コード例のインデント（2スペース）が統一されている
- [ ] テーブルのフォーマットが統一されている
- [ ] 仕様書間の相互参照リンクが正しい
- [ ] 各Gapの修正内容が明確に記載されている（何をどう変えたか）

### 観点 7: 後続実装への影響評価

仕様書修正が後続の実装タスクに与える影響を評価する。

**影響評価テーブル**:

| Gap | 仕様変更内容                  | 影響を受ける実装ファイル（将来）      | 影響度 |
| --- | ----------------------------- | ------------------------------------- | ------ |
| 1   | Date型 → ISO 8601 string化    | IPC ハンドラ・Renderer コンポーネント | TBD    |
| 2   | status に idle 追加           | DebugControls コンポーネント          | TBD    |
| 3   | onExport 引数型修正           | DocPreview コンポーネント             | TBD    |
| 4   | ExportResult 変換ロジック追加 | エクスポート関連コンポーネント        | TBD    |
| 5   | safeOn 購読パターン追加       | Preload API・Renderer リスナー        | TBD    |
| 6   | positional → object形式統一   | task-9a 関連 IPC ハンドラ             | TBD    |

**評価基準**:

| 影響度 | 定義                                             |
| ------ | ------------------------------------------------ |
| 低     | 仕様追記のみ。既存実装への変更不要               |
| 中     | 型定義の追加・変更が必要だが、ロジック変更は不要 |
| 高     | ロジック変更を伴う（バリデーション追加等）       |

---

## 判定基準

| 判定     | 条件                                                           | 対応                                              |
| -------- | -------------------------------------------------------------- | ------------------------------------------------- |
| PASS     | 全7観点のチェックリストを全て満たす                            | Phase 11へ進む                                    |
| MINOR    | 軽微な指摘のみ（誤字脱字、フォーマットの微調整）               | 未タスク仕様書に変換後 Phase 11へ進む（省略不可） |
| MAJOR    | 型定義の不整合、Pitfall対策の不足、データフローの記載漏れ      | 影響範囲に応じて Phase 5-8 へ戻る                 |
| CRITICAL | Gap未解消、仕様書間の重大な矛盾、IPCインターフェース契約の破綻 | Phase 1 へ戻り要件再確認                          |

**MINOR判定時の必須対応**:

- 指摘事項を全て未タスク仕様書に変換する（「機能影響なし」でも省略不可）
- 未タスク仕様書は3ステップ（①指示書作成 → ②残課題テーブル登録 → ③関連仕様書リンク追加）を完了する

---

## レビュー結果テンプレート

```markdown
## 最終レビュー結果

### 判定: [PASS / MINOR / MAJOR / CRITICAL]

### 観点別結果

| #   | レビュー観点             | 判定 | 指摘事項 |
| --- | ------------------------ | ---- | -------- |
| 1   | Gap修正の完全性          | TBD  |          |
| 2   | 型定義の整合性           | TBD  |          |
| 3   | IPCデータフローの正確性  | TBD  |          |
| 4   | P44/P45 再発リスクの排除 | TBD  |          |
| 5   | P5 対策の網羅性          | TBD  |          |
| 6   | 仕様書品質               | TBD  |          |
| 7   | 後続実装への影響評価     | TBD  |          |

### 総合評価

[レビュー全体の所見を2-3文で記載]

### 指摘事項一覧

| #   | 重要度 | 対象Gap | 観点 | 指摘内容 | 推奨対応 |
| --- | ------ | ------- | ---- | -------- | -------- |
| 1   | TBD    | TBD     | TBD  | TBD      | TBD      |

### MINOR指摘の未タスク変換（該当する場合）

| #   | 指摘内容 | 未タスクID | 指示書パス | 残課題テーブル登録 | 関連仕様書リンク |
| --- | -------- | ---------- | ---------- | ------------------ | ---------------- |
| 1   | TBD      | TBD        | TBD        | TBD                | TBD              |

### 差し戻し先（MAJOR/CRITICAL の場合）

| 差し戻し先Phase | 理由 | 修正対象 |
| --------------- | ---- | -------- |
| TBD             | TBD  | TBD      |
```

---

## 実行手順

### Step 1: 成果物収集

全Phaseの成果物を収集し、レビュー対象を確認する。

**レビュー対象成果物**:

| Phase | 成果物             | パス                                          | 存在確認 |
| ----- | ------------------ | --------------------------------------------- | -------- |
| 1     | 要件定義書         | `phase-1-requirements.md`                     | TBD      |
| 2     | 設計書             | `phase-2-design.md`                           | TBD      |
| 3     | 設計レビュー結果   | `phase-3-design-review.md`                    | TBD      |
| 4     | 検証基準定義       | `phase-4-test-creation.md`                    | TBD      |
| 5     | 仕様書修正結果     | `phase-5-implementation.md`                   | TBD      |
| 6     | 整合性拡充結果     | `phase-6-test-expansion.md`                   | TBD      |
| 7     | カバレッジ確認結果 | `phase-7-coverage-check.md`                   | TBD      |
| 8     | 品質改善レポート   | `outputs/phase-8/spec-quality-improvement.md` | TBD      |
| 9     | 品質保証レポート群 | `outputs/phase-9/*.md`                        | TBD      |

### Step 2: 観点別レビュー実施

7つの観点それぞれについてレビューを実施する。

**レビュー順序**: 観点 1 → 2 → 3 → 4 → 5 → 6 → 7（依存関係順）

### Step 3: 判定会議

レビュー結果を集約し、PASS/MINOR/MAJOR/CRITICAL の判定を行う。

**判定フロー**:

```
1. 全7観点のチェックリストを確認
   ├─ 全て満たす → PASS
   ├─ 軽微な指摘のみ → MINOR（未タスク変換必須）
   ├─ 型不整合/対策不足/記載漏れ → MAJOR（Phase 5-8 差し戻し）
   └─ Gap未解消/重大矛盾 → CRITICAL（Phase 1 差し戻し）
```

### Step 4: 結果記録

レビュー結果テンプレートを使用して結果を記録する。

---

## 統合テスト連携

| 連携観点           | 実施内容                                                                    | 検証先                          |
| ------------------ | --------------------------------------------------------------------------- | ------------------------------- |
| IPC 契約整合       | Renderer → Preload → Main の引数型/戻り値型を突合し、契約ドリフトを防止する | Phase 4〜7 の検証コマンドと結果 |
| 型変換整合         | Date/ISO 8601・ExportResult 変換・DebugEvent ペイロードの境界変換を確認する | 修正対象 7 仕様書 + Phase 6/7   |
| イベント購読安全性 | safeOn + cleanup による二重登録防止（P5）を確認する                         | 05B 仕様書 + Phase 6/9          |

## 成果物

| 成果物           | 説明             | 配置先                                |
| ---------------- | ---------------- | ------------------------------------- |
| 最終レビュー結果 | 総合レビュー判定 | `outputs/phase-10/final-review.md`    |
| 品質サマリー     | 各Phase品質状況  | `outputs/phase-10/quality-summary.md` |

---

## 完了条件

- [ ] 全7観点のレビューが完了している
- [ ] 判定結果が記録されている
- [ ] MINOR指摘がある場合、全て未タスク仕様書に変換されている
- [ ] MAJOR/CRITICAL の場合、差し戻し先Phaseが特定されている
- [ ] レビュー結果テンプレートが全項目記入されている
- [ ] 本Phase内の全タスクを100%実行完了

---

## サブタスク管理

Phase実行開始時に、以下のサブタスクを作成すること:

1. 成果物収集（Step 1）
2. 観点1: Gap修正の完全性レビュー
3. 観点2: 型定義の整合性レビュー
4. 観点3: IPCデータフローの正確性レビュー
5. 観点4: P44/P45 再発リスクの排除レビュー
6. 観点5: P5 対策の網羅性レビュー
7. 観点6: 仕様書品質レビュー
8. 観点7: 後続実装への影響評価
9. 判定会議・結果記録（Step 3-4）
10. 成果物の作成・配置
11. 完了条件の検証

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
node .claude/skills/task-specification-creator/scripts/validate-phase-output.js docs/30-workflows/completed-tasks/ut-ipc-data-flow-type-gaps-001 --phase 10
```

---

## 次のPhase

Phase 11: 手動検証

---

## 備考

- MAJOR/CRITICAL判定の場合は該当Phaseへの差し戻しを行い、問題の根本原因を特定してから修正する
- MINOR指摘は**全て**未タスク仕様書に変換する（「機能影響なし」でも省略不可 — 05-task-execution.md 準拠）
- 本タスクは仕様書修正のみのため、「統合テスト結果」の代わりに「仕様書整合性検証結果」をレビュー対象とする
- 後続実装への影響評価（観点7）は、将来の実装タスク作成時の参考情報として記録する

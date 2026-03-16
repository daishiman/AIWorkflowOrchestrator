# UT-06-003-METADATA-PROVIDER-IMPL: SkillMetadataProvider 実装

## メタ情報

| 項目       | 値                                       |
| ---------- | ---------------------------------------- |
| タスクID   | UT-06-003-METADATA-PROVIDER-IMPL         |
| タスク名   | stub metadataProvider を実際の実装に置換 |
| 発見元     | UT-06-003 Phase 12                       |
| 優先度     | 中（priority:medium）                    |
| 分類       | 実装                                     |
| ステータス | 未実施                                   |
| 作成日     | 2026-03-16                               |

## 関連タスク

| タスクID                | 関係性                                     | ステータス |
| ----------------------- | ------------------------------------------ | ---------- |
| UT-06-003               | 親タスク（DefaultSafetyGate 実装）         | 完了       |
| TASK-SKILL-LIFECYCLE-08 | 後続（評価精度が PermissionDialog に影響） | 未実施     |

## 目的

現在の DefaultSafetyGate は stub の `metadataProvider` を使用しており、スキルの実際のツール情報やアクセスパスを取得できていない。本タスクでは SKILL.md からメタデータを解析し、`SkillMetadataProvider` インターフェースの実装を完成させる。

## スコープ

### スコープ内

- `SkillMetadataProvider` インターフェースの具象クラス実装
- スキルの SKILL.md からツール情報（使用ツール名、リスクレベル）を取得するロジック
- スキルの SKILL.md からアクセスパス情報を取得するロジック
- 空メタデータ時（SKILL.md が見つからない、パース失敗）の UNKNOWN グレードフォールバック
- 単体テスト

### スコープ外

- SKILL.md フォーマットの変更
- SafetyGate の評価ロジック変更（UT-06-003 で完了済み）
- TOOL_RISK_CONFIG 定数の定義（UT-06-001）

## 受入基準

- [ ] `SkillMetadataProvider.getMetadata(skillName)` がスキルのツール情報を返却する
- [ ] SKILL.md が存在しない場合に空メタデータを返却する
- [ ] SKILL.md のパースエラー時にエラーを握りつぶさず、安全なデフォルト値を返却する
- [ ] DefaultSafetyGate の DI で stub を実装に置換可能
- [ ] 単体テストが全て PASS すること
- [ ] 型チェックが通ること

## 参照資料

| 資料名                 | パス                                                                           |
| ---------------------- | ------------------------------------------------------------------------------ |
| DefaultSafetyGate 実装 | `apps/desktop/src/main/permissions/default-safety-gate.ts`                     |
| クラス設計書           | `docs/30-workflows/safety-gate-implementation/outputs/phase-2/class-design.md` |

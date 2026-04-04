# Phase 2: 設計書

## 1. 追記先ファイルの決定

### 判断

**方針 B: 新規ファイル `interfaces-skill-verify-contract.md` を作成する**

### 判断根拠

| 方針                                              | メリット                                            | デメリット                          | 推奨度 |
| ------------------------------------------------- | --------------------------------------------------- | ----------------------------------- | ------ |
| A: `interfaces-agent-sdk-skill.md` に追記         | 既存ファイルに統合、参照容易                        | 227行 → 約340行で肥大化気味         | 中     |
| B: 新規 `interfaces-skill-verify-contract.md`     | 独立した関心事として明確。拡張容易。grep 検索性高い | 新規ファイル作成                    | **高** |
| C: `arch-execution-capability-contract.md` に追記 | execution-capability 契約と近い                     | 103行 → 約210行。責務が広がりすぎる | 低     |

**選択理由**:

1. verify 契約は FR-04 として独立した機能要件であり、専用ファイルが Single Source of Truth 原則に合致
2. 19 check ID × 4 Layer は今後の拡張で増加する見込み（Layer 5 以降）
3. 実装側も `SkillCreatorVerificationEngine.ts` として独立しており、仕様書も対称にすべき
4. 追記量は約 110 行であり、単独ファイルとして適切なサイズ

### 追記先ファイルパス

```
.claude/skills/aiworkflow-requirements/references/interfaces-skill-verify-contract.md
```

## 2. ドキュメント構成設計

```markdown
# FR-04 verify 契約 — Check ID 体系

## 概要

- verify の目的と Layer 構成の概説
- SkillCreatorVerificationEngine との関係

## Layer 命名規則

- L{N}-{NNN} 形式の定義
- Layer 番号の意味（1=構造, 2=コンテンツ, 3=詳細コンテンツ, 4=参照整合性）
- 連番の採番ルール
- severity の割り当て方針（error / warning）

## Layer 1: 構造検証（Structural Validation）

- check ID テーブル（5 checks: L1-001〜L1-005）

## Layer 2: コンテンツ検証（Content Validation）

- check ID テーブル（7 checks: L2-001〜L2-007）

## Layer 3: 詳細コンテンツ検証（Detailed Content Validation）

- check ID テーブル（4 checks: L3-001〜L3-004）

## Layer 4: 参照整合性・結合検証（Reference Integrity Validation）

- check ID テーブル（3 checks: L4-001〜L4-003）

## Layer 拡張ガイドライン

- 新規 Layer 追加時の手順
- check ID 追加時の採番ルール
- 仕様書と実装の同期ルール
```

## 3. Check ID テーブルのカラム定義

| カラム名         | 内容                                      | 備考                     |
| ---------------- | ----------------------------------------- | ------------------------ |
| Check ID         | `L{N}-{NNN}` 形式の識別子                 | 必須                     |
| 検証内容         | 何を検証するかの日本語説明                | 必須                     |
| Severity         | `error`（hard gate）/ `warning`（通過可） | 必須。バッククォート囲み |
| 判定基準         | 合格となる条件                            | 必須                     |
| エラーメッセージ | fail 時の出力メッセージ（英語）           | 必須。実装と完全一致     |

カラム順序: Check ID → 検証内容 → Severity → 判定基準 → エラーメッセージ

## 4. 追記量の見積もり

| セクション             | 見積もり行数  |
| ---------------------- | ------------- |
| H1 + 概要              | 15 行         |
| Layer 命名規則         | 20 行         |
| Layer 1 テーブル       | 10 行         |
| Layer 2 テーブル       | 12 行         |
| Layer 3 テーブル       | 9 行          |
| Layer 4 テーブル       | 8 行          |
| Layer 拡張ガイドライン | 20 行         |
| 余白・区切り           | 16 行         |
| **合計**               | **約 110 行** |

新規ファイルのため既存ファイルへの影響なし。110 行は独立ファイルとして適切なサイズ（500 行以下の目安を大幅にクリア）。

## 5. resource-map・topic-map との統合

- `resource-map.md` に `interfaces-skill-verify-contract.md` のエントリを追加（Phase 12 で実施）
- `topic-map.md` は Phase 12 の `generate-index.js` 実行で自動再生成

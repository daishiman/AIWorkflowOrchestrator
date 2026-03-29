# Phase 1: 要件定義 - タスク仕様書

## メタ情報

| 項目      | 内容     |
| --------- | -------- |
| Phase     | 1        |
| Phase名   | 要件定義 |
| カテゴリ  | 要件     |
| 前提Phase | なし     |
| 後続Phase | Phase 2  |

## 目的

SDK メッセージ変換ロジックのうち、前処理として本当に重複している箇所だけを特定し、最小 shared helper で解消する方針・スコープ・受け入れ基準を確定する。

## P50チェック（Phase 1 開始前 必須）

```bash
# 対象ファイルの実装状態を確認
git log --oneline -10 -- apps/desktop/src/main/services/skill/SkillExecutor.ts
git log --oneline -10 -- apps/desktop/src/main/services/runtime/sdkMessageNormalizer.ts

# sdkMessageUtils.ts が既に存在しないか確認
find apps/desktop/src/main/services -name "*sdkMessage*" -type f

# unknown -> object/type 判定の重複箇所を全検索
grep -rn "typeof .*=== .*object\|typeof .*=== \"object\"\|rawMessage == null\|message === null" apps/ packages/
```

## 実行タスク

### タスク1: 重複ロジックのインベントリ作成

**目的**: 2つの変換関数の重複箇所を網羅的に特定する

**手順**:

1. `SkillExecutor.ts` の `isValidSDKMessage()` と `convertToStreamMessage()` を読み込む
2. `sdkMessageNormalizer.ts` の `normalizeSdkMessage()` (L29-55) を読み込む
3. 重複している具体的なロジックをテーブルに整理する

**重複ロジック比較テーブル（期待される成果物）**:

| ロジック                     | SkillExecutor.ts          | sdkMessageNormalizer.ts     | 共通化可否                  |
| ---------------------------- | ------------------------- | --------------------------- | --------------------------- |
| null/undefined チェック      | `isValidSDKMessage`       | L34-43 インライン           | ✅ 共通化可能               |
| plain object / record 判定   | `isValidSDKMessage`       | L34-43 インライン           | ✅ 共通化可能               |
| `type` フィールドの読取り    | `msg.type === ...` 判定群 | `const msgType = ...`       | ✅ 共通 helper 化可能       |
| lane 固有の分岐・出力変換    | `convertToStreamMessage`  | `normalize*Message` 群      | ❌ 共通化しない             |
| `content` / `error` の解釈差 | `SkillStreamMessage` 向け | `SkillCreatorSdkEvent` 向け | ❌ 出力契約が異なるため除外 |

### タスク2: 型ガード集約先の方針決定

**目的**: shared helper を配置するファイルと export 方針を決定する

**手順**:

1. DI 境界の型配置判断フローに従い配置先を決定する
   - 前処理 helper は `SkillExecutor` と `sdkMessageNormalizer` の2モジュールで使用 → 共有ファイルに配置
   - 両モジュールは同一パッケージ（`apps/desktop`）→ パッケージ内の共通ファイルに配置
2. 配置先候補: `apps/desktop/src/main/services/runtime/sdkMessageUtils.ts`
3. export する関数・型の一覧を確定する

**方針決定テーブル（期待される成果物）**:

| 関数/型                   | 現在の定義箇所     | 移動先             | export 方針  |
| ------------------------- | ------------------ | ------------------ | ------------ |
| `SdkMessageRecord` 型別名 | なし（新規）       | sdkMessageUtils.ts | named export |
| `asSdkMessageRecord()`    | なし（新規）       | sdkMessageUtils.ts | named export |
| `getSdkMessageType()`     | 各モジュールに分散 | sdkMessageUtils.ts | named export |

### タスク3: 受け入れ基準の確定

**目的**: 検証可能な完了条件を定義する

**受け入れ基準**:

- AC-1: `unknown -> record` 判定と `type` 抽出が `sdkMessageUtils.ts` の1箇所に集約されていること
- AC-2: `sdkMessageNormalizer.test.ts` が全件 PASS すること
- AC-3: `SkillExecutor.sdk-types.test.ts` が全件 PASS すること
- AC-4: `pnpm typecheck` が PASS すること
- AC-5: `pnpm lint` が PASS すること
- AC-6: 共通ユーティリティに JSDoc が記述されていること
- AC-7: lane 固有の変換責務が shared helper に流出していないこと

## 参照資料

| 参照資料         | パス                                                                                        | 内容                       |
| ---------------- | ------------------------------------------------------------------------------------------- | -------------------------- |
| SDK Executor仕様 | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-executor-core.md`   | SkillExecutor 型定義・契約 |
| SDK Skill仕様    | `.claude/skills/aiworkflow-requirements/references/interfaces-agent-sdk-skill-reference.md` | SkillCreatorService・SDK型 |
| 未タスク指示書   | `docs/30-workflows/unassigned-task/UT-RT-06-SKILL-EXECUTOR-NORMALIZER-CONSOLIDATION-001.md` | 元タスク仕様               |

## 統合テスト連携

本タスクはリファクタリング（インターフェース不変）のため、統合テストの新規追加は不要。既存テストの回帰確認で十分。

| テストファイル                    | 確認内容                                    |
| --------------------------------- | ------------------------------------------- |
| `sdkMessageNormalizer.test.ts`    | normalizeSdkMessage の全テストケースが PASS |
| `SkillExecutor.sdk-types.test.ts` | SDK 型契約テストが PASS                     |

## 成果物

| 成果物         | パス                                     |
| -------------- | ---------------------------------------- |
| 要件定義書     | `outputs/phase-1/requirements.md`        |
| 仕様抽出マップ | `outputs/phase-1/spec-extraction-map.md` |

## 完了条件

- [ ] 重複ロジックのインベントリテーブルが完成していること
- [ ] 型ガード集約先の方針が決定していること
- [ ] 受け入れ基準 AC-1〜AC-6 が確定していること
- [ ] P50チェックで既存の shared helper と責務重複しないことを確認済み
- [ ] 本Phase内の全タスクを100%実行完了

## タスク100%実行確認【必須】

- [ ] タスク1: 重複ロジックのインベントリ作成 → 完了
- [ ] タスク2: 型ガード集約先の方針決定 → 完了
- [ ] タスク3: 受け入れ基準の確定 → 完了

## 次Phase

Phase 2（設計）へ進む。Phase 1 完了まで Phase 2 に着手しないこと。

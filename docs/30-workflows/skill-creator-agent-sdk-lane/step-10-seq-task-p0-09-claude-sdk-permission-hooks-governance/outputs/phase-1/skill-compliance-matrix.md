# Phase 1: Skill 準拠マトリクス (Skill Compliance Matrix)

## メタ情報

| 項目     | 値                                     |
| -------- | -------------------------------------- |
| タスクID | TASK-P0-09                             |
| Phase    | 1                                      |
| 機能名   | claude-sdk-permission-hooks-governance |
| 作成日   | 2026-03-31                             |

## 1. AC (Acceptance Criteria) マッピング

### AC-1: phase 別 permissionMode と tool 境界の定義

| 実装項目                               | 対象ファイル                                                             | 実装内容                                                       | 検証方法                                  |
| -------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------- | ----------------------------------------- |
| SkillCreatorPhase 型定義               | `packages/shared/src/types/skillCreator.ts`                              | `"plan" \| "execute" \| "verify" \| "improve"` 型追加          | 型チェック                                |
| SkillCreatorSdkPolicy インターフェース | `packages/shared/src/types/skillCreator.ts`                              | phase / permissionMode / allowedTools / disallowedTools の定義 | 型チェック + UT                           |
| Phase 別 policy テーブル               | `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts` | 4 phase 分の policy 定数マップ                                 | UT: 各 phase の policy が正しく解決される |
| Facade への policy 注入                | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts`    | `plan()` / `execute()` / `improve()` に policy option 注入     | UT + 統合テスト                           |

### AC-2: allowedTools / disallowedTools / canUseTool の lane 契約実装

| 実装項目                         | 対象ファイル                                                             | 実装内容                                                    | 検証方法                                      |
| -------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------- |
| canUseTool コールバック          | `apps/desktop/src/main/services/runtime/SkillCreatorGovernancePolicy.ts` | phase + tool_name + tool_input を受け取り allow/deny を返す | UT: phase ごとに allowed/denied を確認        |
| パス制約チェック (execute)       | 同上                                                                     | tool_input のパスが skill dir 内かを検証                    | UT: skill dir 内/外のパスで allow/deny を確認 |
| パス制約チェック (improve)       | 同上                                                                     | Edit 対象が改善対象ファイルに限定されるかを検証             | UT: 対象/非対象ファイルで allow/deny を確認   |
| bypassPermissions 使用禁止ガード | 同上                                                                     | `bypassPermissions` 指定時にエラーを返す                    | UT: bypassPermissions 指定時のエラー確認      |

### AC-3: Hook による監査イベント記録

| 実装項目                | 対象ファイル                                                          | 実装内容                                                       | 検証方法                                       |
| ----------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------- |
| GovernanceAuditEvent 型 | `packages/shared/src/types/skillCreator.ts`                           | audit event の共通型定義                                       | 型チェック                                     |
| HooksFactory            | `apps/desktop/src/main/services/runtime/SkillCreatorHooksFactory.ts`  | SessionStart/PreToolUse/PostToolUse/SessionEnd 生成            | UT: 各 hook が正しい audit event を emit する  |
| AuditSink               | `apps/desktop/src/main/services/runtime/SkillCreatorAuditSink.ts`     | audit event の一元記録・蓄積                                   | UT: event 記録・取得・フィルタが正しく動作する |
| Facade hooks 接続       | `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | HooksFactory を Facade に接続し、SDK 呼び出し時に hooks を渡す | 統合テスト                                     |

### AC-4: permission denial と hook 判断結果の UI / audit log 反映

| 実装項目                | 対象ファイル                                    | 実装内容                                      | 検証方法                                |
| ----------------------- | ----------------------------------------------- | --------------------------------------------- | --------------------------------------- |
| denial payload 型       | `packages/shared/src/types/skillCreator.ts`     | denial 理由 + phase + toolName を含む構造型   | 型チェック                              |
| IPC denial push channel | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | denial 発生時に renderer へ push する channel | UT: denial 発生時の push を mock で確認 |
| Preload denial 読取 API | `apps/desktop/src/preload/skill-creator-api.ts` | governance audit / denial を read-only で公開 | UT: preload API からの取得確認          |
| UI 表示用 payload 変換  | renderer 側（scope 外だが型は shared）          | denial reason を human-readable に変換        | UI 手動テスト (Phase 11)                |

### AC-5: 動的読込結果と provenance の hook / audit への包含

| 実装項目                     | 対象ファイル                                                         | 実装内容                                                          | 検証方法                                          |
| ---------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------- |
| SessionStart provenance 記録 | `apps/desktop/src/main/services/runtime/SkillCreatorHooksFactory.ts` | session 開始時に sourceProvenance を audit event に含める         | UT: SessionStart event に provenance が含まれる   |
| PreToolUse provenance 参照   | 同上                                                                 | tool 判定時に provenance を参照し、execute phase のパス制約に利用 | UT: provenance.resolvedSkillCreatorRoot との照合  |
| AuditSink provenance 永続化  | `apps/desktop/src/main/services/runtime/SkillCreatorAuditSink.ts`    | 全 audit event に provenance を付与して記録                       | UT: 蓄積された event から provenance を取得できる |

### AC-6: skill-creator の固定化・hardcoded prompt 置換を行わない

| 検証項目                                         | 検証方法                                                       | 期待結果                                                |
| ------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------- |
| `.claude/skills/skill-creator/` の静的コピーなし | Glob / Grep でコピー先の存在を確認                             | 新規の静的コピーが存在しない                            |
| hardcoded prompt の不在                          | Grep で `SKILL.md` / agent prompt の直接埋め込みを検索         | 動的読込以外で skill-creator の内容が埋め込まれていない |
| ResourceLoader / SourceResolver の維持           | `RuntimeSkillCreatorFacade` の plan() / improve() の実装を確認 | 引き続き動的読込パイプラインを使用している              |
| ManifestLoader のコア変更なし                    | diff で ManifestLoader の変更を確認                            | コア読込ロジックに破壊的変更がない                      |

## 2. IPC 4 層整合マトリクス

| 層  | 対象                                            | AC 関連  | 確認内容                                                                     |
| --- | ----------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| L1  | `packages/shared/src/types/skillCreator.ts`     | AC-1,3,4 | governance 型（SkillCreatorSdkPolicy, GovernanceAuditEvent）が定義されている |
| L2  | `apps/desktop/src/main/ipc/creatorHandlers.ts`  | AC-3,4   | audit event / denial を renderer に安全に公開している                        |
| L3  | `apps/desktop/src/preload/skill-creator-api.ts` | AC-4     | governance audit / denial の read-only API が存在する                        |
| L4  | renderer UI                                     | AC-4     | denial reason が human-readable で表示される                                 |

## 3. Canonical Path 整合マトリクス

| Canonical Path                                                        | 実在確認 | 現行 HEAD との差分 | drift |
| --------------------------------------------------------------------- | -------- | ------------------ | ----- |
| `apps/desktop/src/main/services/runtime/RuntimeSkillCreatorFacade.ts` | 存在     | なし               | 0     |
| `apps/desktop/src/main/ipc/creatorHandlers.ts`                        | 存在     | なし               | 0     |
| `apps/desktop/src/preload/skill-creator-api.ts`                       | 存在     | なし               | 0     |
| `packages/shared/src/types/skillCreator.ts`                           | 存在     | なし               | 0     |
| `.claude/skills/skill-creator/`                                       | 存在     | なし               | 0     |

**drift 合計: 0 件** -- canonical path は全て現行 HEAD に実在し、旧パスへの参照は検出されない。

## 4. 依存タスク準拠確認

| 依存タスク | 要求される前提                   | 本タスクでの利用箇所                                                     | 準拠状態 |
| ---------- | -------------------------------- | ------------------------------------------------------------------------ | -------- |
| TASK-RT-06 | SDK message / session_id 正規化  | `normalizeSdkMessage()` を audit event の session_id 取得に使用          | 準拠     |
| TASK-P0-03 | 動的 skill-creator manifest 配置 | `ManifestLoader` / `SkillCreatorSourceResolver` を provenance 取得に使用 | 準拠     |
| TASK-P0-04 | dynamic pipeline 有効化          | `PhaseResourcePlanner` による resource 解決結果を provenance に包含      | 準拠     |

## 5. task-specification-creator 準拠確認

| 項目           | 要件                                   | 本タスクの対応                              |
| -------------- | -------------------------------------- | ------------------------------------------- |
| Phase 構造     | Phase 1-13 の骨格に沿う                | 全 13 Phase の仕様書が作成済み              |
| 必須成果物     | Phase ごとに成果物パスが定義されている | outputs/phase-{1,2,3}/ に成果物を配置       |
| 完了条件       | チェックリスト形式で明記されている     | 各 Phase に完了条件チェックリストが存在     |
| artifacts.json | 更新が必要                             | 成果物作成後に更新                          |
| 用語統一       | ユビキタス言語に沿う                   | phase / policy / hooks / audit の用語を統一 |

## 6. aiworkflow-requirements 準拠確認

| 項目              | 要件                                 | 本タスクの対応                                  |
| ----------------- | ------------------------------------ | ----------------------------------------------- |
| canonical path    | 正本のパスが最新の実体と一致している | 5 ファイル全て実在確認済み (drift: 0)           |
| spec sync         | 仕様と実装の乖離がない               | 既存実装の破棄なし。拡張のみ                    |
| quality standards | テスト / lint / typecheck が通過する | Phase 4 以降で UT / 統合テスト作成予定          |
| security boundary | renderer に API key を渡さない       | audit / denial payload に機密情報を含めない設計 |

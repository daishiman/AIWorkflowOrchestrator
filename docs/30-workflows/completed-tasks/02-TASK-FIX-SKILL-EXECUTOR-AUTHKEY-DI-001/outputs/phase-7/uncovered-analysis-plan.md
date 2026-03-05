# Phase 7 未到達分析計画

## 未到達サマリー

- `src/main/ipc/skillHandlers.ts`: 未到達 933 lines
- `src/preload/skill-api.ts`: 未到達 115 lines
- `src/renderer/hooks/useSkillExecution.ts`: 未到達 11 lines
- 根拠: `outputs/phase-7/lcov-uncovered-lines.txt`

## SubAgent別分析

### SubAgent-A（Main/IPC）

- 根因:
  - `skillHandlers.ts` が多数チャネルを1ファイルで管理し、今回修正対象外の経路が多い。
  - 認証注入に直接関係しないハンドラの未到達がline/function低下を主導。
- 補完方針:
  - `skill:validate-*`、`skill:load-*`、`skill:chain-*` の登録・異常系を分割テスト。
  - 既存の`ipc-double-registration.test.ts`を補助し、チャネル群単位のサブスイートを追加。

### SubAgent-B（Preload/API）

- 根因:
  - `skill-api.ts` の公開API面が広く、今回のAuthKey修正で使わないAPIが未到達。
- 補完方針:
  - `skill-api.contract.test.ts`へ未到達API（イベント購読・補助API）の戻り値契約検証を追加。
  - `errorCode` 付与経路の重複ケースを整理して関数網羅率を改善。

### SubAgent-C（Renderer/UX契約）

- 根因:
  - hook内部のレア分岐（キャンセル・境界状態）未通過。
- 補完方針:
  - preflight失敗直後の再試行、二重送信抑止、unknown errorCode のUI遷移を追加。

### SubAgent-D（統合監査）

- 優先度:
  1. Main/IPC line/function補完（影響範囲最大）
  2. Preload function補完
  3. Renderer branch補完
- 受け入れ条件:
  - AuthKey DI経路の契約回帰が0件
  - `AUTHENTICATION_ERROR`伝搬の回帰が0件
  - 追加テストで既存5テスト群が安定PASS

## 実行チケット案

- COV-A1: `skillHandlers.ts` 登録系未到達補完
- COV-A2: `skillHandlers.ts` 異常系未到達補完
- COV-B1: `skill-api.ts` 未到達公開API補完
- COV-C1: `useSkillExecution.ts` 境界分岐補完

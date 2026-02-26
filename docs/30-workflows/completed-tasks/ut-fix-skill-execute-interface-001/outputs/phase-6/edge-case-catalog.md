# Phase 6 エッジケースカタログ

## メタ情報

- タスクID: UT-FIX-SKILL-EXECUTE-INTERFACE-001
- Phase: 6（テスト拡充）
- 作成日: 2026-02-25
- 前提: Phase 4 異常系マトリクス / 実コード skillHandlers.ts

## skill:execute エッジケース

### skillName パス（isSkillNameRequest = true）

| ID             | 種別           | ケース                           | 入力例                                      | 想定結果                                                 | 優先度 | テストID対応               |
| -------------- | -------------- | -------------------------------- | ------------------------------------------- | -------------------------------------------------------- | ------ | -------------------------- |
| EDGE-EXE-SN-01 | バリデーション | skillName 空文字                 | `{ skillName: "", prompt: "" }`             | VALIDATION_ERROR: "skillName must be a non-empty string" | High   | SH-EXE-V00-2               |
| EDGE-EXE-SN-02 | バリデーション | skillName スペースのみ           | `{ skillName: "   ", prompt: "" }`          | VALIDATION_ERROR（P42 trim）                             | High   | 該当テスト追加候補         |
| EDGE-EXE-SN-03 | バリデーション | skillName タブ/改行のみ          | `{ skillName: "\t\n", prompt: "" }`         | VALIDATION_ERROR（P42 trim）                             | High   | SH-BV-\*系列               |
| EDGE-EXE-SN-04 | 解決失敗       | 存在しない skillName             | `{ skillName: "nonexistent", prompt: "" }`  | `{ success: false, error: "スキルが見つかりません" }`    | High   | execute.test.ts 該当テスト |
| EDGE-EXE-SN-05 | 正常境界       | prompt 空文字                    | `{ skillName: "Test Skill", prompt: "" }`   | 正常実行（空文字は許容される）                           | High   | SH-EXE-V00                 |
| EDGE-EXE-SN-06 | 正常境界       | skillName 前後空白（有効値あり） | `{ skillName: " Test Skill ", prompt: "" }` | isSkillNameRequest=true、名前検索は原文のまま            | Medium | 追加候補                   |

### skillId パス（isSkillNameRequest = false）

| ID             | 種別           | ケース                        | 入力例                | 想定結果                                               | 優先度 | テストID対応 |
| -------------- | -------------- | ----------------------------- | --------------------- | ------------------------------------------------------ | ------ | ------------ |
| EDGE-EXE-ID-01 | バリデーション | skillId 空文字                | `{ skillId: "" }`     | VALIDATION_ERROR: "skillId must be a non-empty string" | High   | SH-EXE-V02   |
| EDGE-EXE-ID-02 | バリデーション | skillId スペースのみ          | `{ skillId: "   " }`  | VALIDATION_ERROR（P42 trim）                           | High   | SH-EXE-V03   |
| EDGE-EXE-ID-03 | バリデーション | skillId タブのみ              | `{ skillId: "\t" }`   | VALIDATION_ERROR（P42 trim）                           | High   | SH-BV-04     |
| EDGE-EXE-ID-04 | バリデーション | skillId CR+LF                 | `{ skillId: "\n\r" }` | VALIDATION_ERROR（P42 trim）                           | High   | SH-BV-05     |
| EDGE-EXE-ID-05 | バリデーション | skillId null                  | `{ skillId: null }`   | VALIDATION_ERROR（typeof check）                       | High   | SH-EXE-V04   |
| EDGE-EXE-ID-06 | バリデーション | skillId undefined（argsなし） | `undefined`           | VALIDATION_ERROR                                       | High   | SH-EXE-V05   |
| EDGE-EXE-ID-07 | バリデーション | skillId 数値型                | `{ skillId: 123 }`    | VALIDATION_ERROR（typeof check）                       | High   | SH-EXE-V06   |

### isSkillNameRequest 型ガード境界

| ID             | 種別     | ケース                        | 入力例                                               | 想定結果                                                                | 優先度 |
| -------------- | -------- | ----------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| EDGE-EXE-TG-01 | 型ガード | skillName と skillId 両方存在 | `{ skillName: "test", skillId: "id-1", prompt: "" }` | isSkillNameRequest=true（skillName パスが優先）                         | Medium |
| EDGE-EXE-TG-02 | 型ガード | args が null                  | `null`                                               | TypeError（typeof null === "object" だが "skillName" in null はエラー） | Low    |

## skill:import / skill:remove 回帰エッジケース

| ID          | 種別 | ケース                      | 想定結果         | 優先度 |
| ----------- | ---- | --------------------------- | ---------------- | ------ |
| EDGE-IMP-01 | 回帰 | import: skillName 空白のみ  | VALIDATION_ERROR | High   |
| EDGE-IMP-02 | 回帰 | import: skillName タブ/改行 | VALIDATION_ERROR | High   |
| EDGE-REM-01 | 回帰 | remove: skillName 空白のみ  | VALIDATION_ERROR | High   |
| EDGE-REM-02 | 回帰 | remove: skillName タブ/改行 | VALIDATION_ERROR | High   |

## セキュリティ境界ケース

| ID          | 種別       | ケース                  | 想定結果                             | 優先度 |
| ----------- | ---------- | ----------------------- | ------------------------------------ | ------ |
| EDGE-SEC-01 | sender検証 | validateIpcSender 失敗  | toIPCValidationError が throw される | High   |
| EDGE-SEC-02 | sender検証 | DevTools からの呼び出し | IPC_FORBIDDEN                        | High   |
| EDGE-SEC-03 | sender検証 | 無効な BrowserWindow    | IPC_UNAUTHORIZED                     | High   |

## 備考

- EDGE-EXE-SN-05: 実コードの SH-EXE-V00 テストにより、prompt 空文字は許容されることが確認済み。ハンドラは prompt のバリデーションを行わず、サービス層に委譲する設計
- EDGE-EXE-SN-06: 実コードでは skillName の trim は args.skillName に直接適用されず、バリデーションの `args.skillName.trim() === ""` チェックのみ。検索は `skills.find((item) => item.name === args.skillName)` で原文一致
- EDGE-EXE-TG-02: 実コードの isSkillNameRequest は `typeof payload === "object" && payload !== null` で null を除外している

## 完了条件

- [x] skillName パスの境界値ケースを列挙（EDGE-EXE-SN-01〜06）
- [x] skillId パスの境界値ケースを列挙（EDGE-EXE-ID-01〜07）
- [x] isSkillNameRequest 型ガード境界を列挙（EDGE-EXE-TG-01〜02）
- [x] 回帰ケースを含めた（EDGE-IMP/REM）
- [x] セキュリティ境界ケースを列挙（EDGE-SEC-01〜03）
- [x] 優先度を付与
- [x] 既存テストIDとの対応関係を記載

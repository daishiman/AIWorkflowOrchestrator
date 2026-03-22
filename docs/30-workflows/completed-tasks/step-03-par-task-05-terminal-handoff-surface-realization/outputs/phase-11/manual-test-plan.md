# Phase 11 成果物: 手動テスト計画

## メタ情報

| 項目       | 内容                                              |
| ---------- | ------------------------------------------------- |
| タスクID   | TASK-IMP-TERMINAL-HANDOFF-SURFACE-REALIZATION-001 |
| Phase      | 11                                                |
| 成果物種別 | 手動テスト計画                                    |
| 作成日     | 2026-03-22                                        |

---

## 重要注記: 設計タスクにおける Phase 11 の位置付け

本タスクは設計タスク（プロダクションコードの実装なし）である。したがって、Phase 11 での実際の手動テスト実行は後続実装タスクで行う。本フェーズでは以下を成果物とする:

1. 後続実装タスクで実行するための walkthrough シナリオ手順書（TC-MAN-1〜TC-MAN-9）
2. Manual Boundary 検証チェックリスト（MB-1〜MB-5）
3. スクリーンショット取得計画（P53 対策含む）
4. 各シナリオの期待結果と判定基準

---

## 1. Walkthrough シナリオ

### TC-MAN-1: TerminalHandoffCard 表示確認

**前提条件**:

- handoff 発生: integrated runtime 実行中に `IRuntimePolicyResolver.resolve()` が `terminal_handoff` を返す
- `HandoffGuidance { terminalCommand, contextSummary, reason }` が IPC 経由で Renderer に到達済み

**手順**:

1. アプリを起動し、任意の surface（Chat Edit / Runtime / Skill Docs）で handoff を発生させる
2. `TerminalHandoffCard` が表示されることを確認する
3. 以下の 3 フィールドが全て表示されていることを確認する:
   - `terminalCommand` フィールド（コードブロック形式）
   - `contextSummary` フィールド（説明テキスト）
   - `reason` フィールド（理由テキスト）
4. copy ボタン（primary CTA）が表示されていることを確認する
5. dismiss ボタン（secondary CTA）が表示されていることを確認する

**期待結果**: 3 フィールド全てが表示され、CTA が 2 つ（copy / dismiss）表示される

**判定基準**: PASS = 3 フィールド全表示 かつ CTA が 2 つ以下 / FAIL = いずれかのフィールドが欠落

---

### TC-MAN-2: copy command 操作確認

**前提条件**: TC-MAN-1 の状態（TerminalHandoffCard 表示中）

**手順**:

1. copy ボタンをクリックする
2. クリップボードの内容を確認し、`terminalCommand` と一致することを検証する（例: テキストエディタに貼り付け）
3. フィードバック表示（Toast / アイコン変化）が出現することを確認する
4. フィードバック表示が 2〜3 秒後に自動消去されることを確認する

**期待結果**: クリップボードに `terminalCommand` が正確にコピーされ、フィードバックが表示後に自動消去される

**判定基準**: PASS = コピー内容が `terminalCommand` と完全一致 かつ フィードバック表示あり / FAIL = コピー内容が相違 または フィードバックなし

---

### TC-MAN-3: dismiss 操作確認

**前提条件**: TC-MAN-1 の状態（TerminalHandoffCard 表示中）

**手順**:

1. dismiss ボタンをクリックする
2. `TerminalHandoffCard` が非表示になることを確認する
3. Zustand Store の `handoffGuidance` が `null` になっていることを確認する（DevTools で検証）
4. surface（Chat Edit / Runtime）が通常表示に戻ることを確認する

**期待結果**: card が非表示になり、Zustand の state が `null` になり、surface が通常表示に戻る

**判定基準**: PASS = card 非表示 かつ `handoffGuidance === null` / FAIL = card が残存 または state が null 未到達

---

### TC-MAN-4: Persistent Launcher 表示確認

**前提条件**: アプリが起動済み

**手順**:

1. App Shell Header 右上に terminal launcher ボタンが表示されていることを確認する
2. ラベルが「terminal を開く」（i18n key: `cta.openTerminal`）で統一されていることを確認する
3. Chat Edit surface / Runtime surface / Skill Docs surface に遷移し、各 surface でもボタンが表示されることを確認する（全 surface 共通表示）
4. ボタンのアクセシビリティ属性（`aria-label`）が存在することを確認する（DevTools で DOM 確認）

**期待結果**: 全 surface で統一ラベル「terminal を開く」のボタンが表示され、`aria-label` が付与されている

**判定基準**: PASS = 全 3 surface でボタン表示 かつ ラベル統一 かつ `aria-label` 存在 / FAIL = いずれかで非表示 または ラベル不一致

---

### TC-MAN-5: Terminal Dock open 時の auto-send 非発生確認

**前提条件**: TC-MAN-4 でランチャーが確認済み

**手順**:

1. launcher ボタンをクリックし、Terminal Dock（bottom sheet）が開くことを確認する
2. Terminal Dock の input フィールドが **空** であることを確認する（コマンドが事前入力されていないこと）
3. 何もせず 5 秒待ち、コマンドが自動的に実行されないことを確認する（transcript に変化なし）
4. ユーザーが手動でコマンドを入力して Enter を押した場合のみ実行されることを確認する

**期待結果**: input が空、5 秒待機中に transcript に変化なし、手動 Enter のみで実行

**判定基準**: PASS = input 空 かつ 5 秒間 auto-send ゼロ / FAIL = input に事前入力あり または 自動実行発生（MB-1 直結）

---

### TC-MAN-6: Terminal Dock close / reopen での transcript 保持確認

**前提条件**: TC-MAN-5 でいくつかのコマンドを実行済み

**手順**:

1. Terminal Dock を閉じる（dismiss / swipe down）
2. App Shell Header の launcher ボタンを再度クリックして Terminal Dock を開く
3. 前回実行したコマンドの transcript が保持されていることを確認する
4. 新規コマンドを実行できることを確認する

**期待結果**: transcript が保持されており、セッションが継続する

**判定基準**: PASS = 前回コマンドが transcript に残存 かつ 新規コマンド実行可 / FAIL = transcript が消去されている

---

### TC-MAN-7: guidance-only 状態の表示確認

**前提条件**: API key が未設定の状態でアプリを起動

**手順**:

1. capability 判定で `guidance-only` 状態になることを確認する（DevTools で `capabilityState` を確認）
2. `GuidanceBlock` が表示されることを確認する（`TerminalHandoffCard` ではないこと）
3. GuidanceBlock に設定画面への導線（リンクまたはボタン）が表示されることを確認する
4. API key を設定後に `integrated` 状態に遷移することを確認する

**期待結果**: `guidance-only` 時に GuidanceBlock が表示され、設定導線がある。API key 設定後に状態遷移する

**判定基準**: PASS = GuidanceBlock 表示 かつ 設定導線あり かつ API key 設定後に状態遷移 / FAIL = TerminalHandoffCard が誤表示 または 導線なし

---

### TC-MAN-8: blocked 状態の表示確認

**前提条件**: 解決不可能な状態（例: ネットワーク接続なし + API key 未設定）

**手順**:

1. capability 判定で `blocked` 状態になることを確認する
2. `capability === "none"` かつ `resolvable === false` が成立していることを DevTools で確認する
3. 設定画面への導線が表示されていることを確認する
4. retry ボタンが表示されていないことを確認する（blocked では retry 不可）
5. `assertNoSilentFallback` により `DEFAULT_CONFIG` への暗黙 fallback が発生しないことを確認する（Network タブで確認）

**期待結果**: blocked 状態で retry ボタン非表示、fallback による API リクエスト発生なし

**判定基準**: PASS = retry 非表示 かつ API リクエスト 0 件 / FAIL = retry 表示 または API リクエスト発生（P62 違反）

---

### TC-MAN-9: unavailable 状態の表示確認

**前提条件**: CLI ツール（claude コマンド）が存在しない、または PATH 未設定の環境

**手順**:

1. PATH から `claude` コマンドを除外した状態でアプリを起動する（`sudo mv /usr/local/bin/claude /tmp/claude_bak` 等で一時除外）
2. capability 判定で `unavailable` 状態になることを確認する
3. launcher button が `disabled` 表示になっていることを確認する
4. `disabled` ボタンにマウスオーバーし、tooltip が表示されることを確認する
5. ボタンが `hidden` ではなく `disabled` で表示されていることを確認する（`aria-disabled="true"` を DOM で確認）
6. テスト終了後に `sudo mv /tmp/claude_bak /usr/local/bin/claude` でコマンドを元に戻す

**期待結果**: launcher button が `disabled`（非表示ではない）、tooltip 表示あり、状態が隠蔽されない

**判定基準**: PASS = button が disabled 表示 かつ tooltip あり かつ `aria-disabled="true"` / FAIL = button が hidden または エラーなく enabled 表示（契約-unavailable 違反）

---

## 2. Manual Boundary 確認手順（MB-1〜MB-5）

### 概要表

| MB ID | 検証項目                   | 期待値                                                 | 検証方法                                                                        | 合格条件                                                         |
| ----- | -------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| MB-1  | auto-send 非発生           | Terminal Dock 起動後 input が空、5 秒間 auto-send なし | Terminal Dock open 直後の input DOM 値と transcript を DevTools で確認          | input が空文字 かつ 5 秒間 transcript 変化なし                   |
| MB-2  | API key 非含有             | `terminalCommand` に API key パターンが 0 件           | DevTools Console で IPC payload を確認し、`/sk-[A-Za-z0-9]{20,}/` を検索        | パターンマッチ 0 件                                              |
| MB-3  | hidden injection 非発生    | 表示内容が `HandoffGuidance` の 3 フィールドのみ       | DevTools Network タブで IPC response payload を確認する                         | `terminalCommand` / `contextSummary` / `reason` 以外なし         |
| MB-4  | headless execution 非発生  | ユーザー操作なしでコマンド実行なし                     | Activity Monitor / `ps aux` で Terminal Dock open 後 5 秒間 claude プロセス確認 | `claude` プロセスが新規起動しない                                |
| MB-5  | guidance-only 判定の正確性 | API key 未設定時に必ず GuidanceBlock が表示される      | API key を削除後にアプリを再起動し、各 surface で表示コンポーネントを確認       | 全 surface で GuidanceBlock 表示 かつ TerminalHandoffCard 非表示 |

---

### MB-1: auto-send 非発生 詳細手順

1. Terminal Dock を launcher ボタンで開く
2. DevTools → Elements タブで Terminal Dock の input 要素を特定する
3. input 要素の `value` 属性が空文字であることを確認する
4. DevTools → Console タブで以下を実行し、5 秒間 transcript 要素の textContent が変化しないことを確認する:

```javascript
const transcript = document.querySelector(
  '[data-testid="terminal-transcript"]',
);
const initial = transcript?.textContent;
setTimeout(() => {
  console.assert(
    transcript?.textContent === initial,
    "auto-send が検出されました",
  );
  console.log(
    "MB-1 チェック完了:",
    transcript?.textContent === initial ? "PASS" : "FAIL",
  );
}, 5000);
```

---

### MB-2: API key 非含有 詳細手順

1. handoff を発生させ、`TerminalHandoffCard` が表示されている状態にする
2. DevTools → Console タブで以下を実行する:

```javascript
// Zustand Store から handoffGuidance を取得
const state = window.__zustandStore?.getState?.();
const cmd = state?.handoffGuidance?.terminalCommand ?? "";
const apiKeyPattern = /sk-[A-Za-z0-9]{20,}/;
const hasPII = /ANTHROPIC_API_KEY|Bearer\s+[A-Za-z0-9]/;
console.log("terminalCommand:", cmd);
console.log(
  "API key 含有:",
  apiKeyPattern.test(cmd) ? "FAIL (含有)" : "PASS (非含有)",
);
console.log("PII 含有:", hasPII.test(cmd) ? "FAIL (含有)" : "PASS (非含有)");
```

3. 両方とも `PASS (非含有)` であることを確認する

---

### MB-3: hidden injection 非発生 詳細手順

1. DevTools → Network タブを開き、Filter を `WS` または `IPC` に絞る
2. handoff を発生させ、IPC response payload を確認する
3. `HandoffGuidance` の response body が以下の 3 フィールドのみで構成されていることを確認する:
   - `terminalCommand`
   - `contextSummary`
   - `reason`
4. 上記以外のフィールド（`prompt`, `systemPrompt`, `instructions`, `hiddenContext` 等）が含まれていないことを確認する

---

### MB-4: headless execution 非発生 詳細手順

1. macOS Activity Monitor を開き、プロセスリストを表示する
2. Terminal Dock を launcher ボタンで開く
3. 5 秒間操作せず待機する
4. `claude` プロセスが新規に起動していないことを Activity Monitor で確認する
5. 追加確認として DevTools → Console で以下を実行する:

```javascript
// MB-4 補助: 5 秒間 network request が発生しないことを確認
const reqs = [];
const origFetch = window.fetch;
window.fetch = (...args) => {
  reqs.push(args[0]);
  return origFetch(...args);
};
setTimeout(() => {
  console.log("MB-4 fetch 件数:", reqs.length);
  window.fetch = origFetch;
}, 5000);
```

---

### MB-5: guidance-only 判定の正確性 詳細手順

1. アプリの設定から API key を削除する
2. アプリを再起動する
3. Chat Edit surface / Runtime surface / Skill Docs surface の各 surface に遷移する
4. 各 surface で `GuidanceBlock` が表示されていることを確認する（`TerminalHandoffCard` ではないこと）
5. DevTools で以下を実行し、capability 判定が `guidance-only` になっていることを確認する:

```javascript
const state = window.__zustandStore?.getState?.();
console.log("capabilityState:", state?.capabilityState);
// 期待値: "guidance-only"
```

6. 設定画面への導線が表示されていることを確認する

---

## 3. 各シナリオの期待結果と判定基準まとめ

| TC / MB ID | シナリオ名                 | 期待結果（概要）                                         | 判定基準                                             |
| ---------- | -------------------------- | -------------------------------------------------------- | ---------------------------------------------------- |
| TC-MAN-1   | TerminalHandoffCard 表示   | 3 フィールド + 2 CTA が全て表示                          | 全フィールド表示 かつ CTA 2 つ                       |
| TC-MAN-2   | copy command               | クリップボードに terminalCommand が正確にコピー          | コピー内容一致 かつ フィードバック表示               |
| TC-MAN-3   | dismiss                    | card 非表示 かつ handoffGuidance が null                 | card 非表示 かつ state null                          |
| TC-MAN-4   | Persistent Launcher        | 全 surface で統一ラベルのボタン表示 かつ aria-label 付与 | 全 3 surface 表示 かつ ラベル統一 かつ a11y 属性     |
| TC-MAN-5   | auto-send 非発生           | input 空 かつ 5 秒間 transcript 変化なし                 | input 空文字 かつ auto-send ゼロ                     |
| TC-MAN-6   | transcript 保持            | close / reopen 後も transcript が継続                    | 前回コマンドが残存 かつ 新規実行可                   |
| TC-MAN-7   | guidance-only              | GuidanceBlock 表示 かつ 設定導線あり                     | GuidanceBlock 表示 かつ API key 設定後に遷移         |
| TC-MAN-8   | blocked                    | retry 非表示 かつ fallback API リクエストなし            | retry 非表示 かつ Network 0 件                       |
| TC-MAN-9   | unavailable                | launcher が disabled 表示 かつ tooltip あり              | disabled 表示 かつ aria-disabled かつ tooltip        |
| MB-1       | auto-send 非発生           | input 空 かつ 5 秒間 transcript 変化なし                 | Console チェック PASS                                |
| MB-2       | API key 非含有             | terminalCommand に API key パターン 0 件                 | regex テスト PASS                                    |
| MB-3       | hidden injection 非発生    | IPC payload が 3 フィールドのみ                          | 余分フィールド 0 件                                  |
| MB-4       | headless execution 非発生  | 5 秒間で claude プロセス新規起動なし                     | Activity Monitor で claude プロセス増加なし          |
| MB-5       | guidance-only 判定の正確性 | API key 削除後に全 surface で GuidanceBlock 表示         | 全 surface GuidanceBlock 表示 かつ capability 値確認 |

---

## 4. Fallback 証跡方針（P53: CLI 環境での代替手段）

### 背景

P53 の教訓に基づき、CLI 環境では Electron アプリの実画面キャプチャが直接取得できない。本設計タスクでは以下の代替証跡方針を定義する。

### 推奨方式 A: Playwright page.screenshot()

```typescript
// e2e/terminal-handoff.screenshot.spec.ts（後続実装タスクで作成）
import { test } from "@playwright/test";
import path from "path";

test("TC-MAN-1: TerminalHandoffCard スクリーンショット取得", async ({
  page,
}) => {
  await page.goto("app://./index.html");
  await page.evaluate(() => {
    window.__testHelpers?.triggerHandoff({
      terminalCommand: "claude --dangerously-skip-permissions run task.md",
      contextSummary: "スキル実行のためターミナルが必要",
      reason: "terminal_required",
    });
  });
  await page.screenshot({
    path: path.join(__dirname, "screenshots/TC-MAN-1-handoff-card.png"),
    fullPage: false,
  });
});
```

### 推奨方式 B: Electron webContents.capturePage()

```typescript
// apps/desktop/src/main/test-helpers/capture-page.ts（後続実装タスクで作成）
import { BrowserWindow } from "electron";

export async function captureWindow(
  window: BrowserWindow,
  outputPath: string,
): Promise<void> {
  const image = await window.webContents.capturePage();
  const fs = await import("fs/promises");
  await fs.writeFile(outputPath, image.toPNG());
}
```

### 代替証跡（CLI 環境で即時取得可能）

後続実装タスクで Playwright 等が未整備の段階では、以下を代替証跡とする:

| 証跡種別               | 取得方法                                         | 対象 TC                               |
| ---------------------- | ------------------------------------------------ | ------------------------------------- | ----------------------------- |
| DevTools Console ログ  | DevTools → Console に実行結果をコピー            | MB-1〜MB-5 全て                       |
| Zustand Store ダンプ   | `window.__zustandStore?.getState()` の JSON 出力 | TC-MAN-3 / TC-MAN-7 / TC-MAN-8        |
| Network リクエストログ | DevTools → Network タブの HAR エクスポート       | TC-MAN-8（fallback 検証）/ MB-4       |
| DOM スナップショット   | DevTools → Elements → Copy → Copy outerHTML      | TC-MAN-4（aria-label 確認）/ TC-MAN-9 |
| テスト実行結果ログ     | `pnpm --filter @repo/desktop test 2>&1           | tee test.log`                         | 全 TC（自動テストが代替証跡） |

---

## 5. テスト実行環境要件

| 要件               | 必須/推奨 | 備考                                                       |
| ------------------ | --------- | ---------------------------------------------------------- |
| Electron アプリ    | 必須      | 後続実装タスクで実装後に実行可能                           |
| macOS 環境         | 推奨      | bottom sheet は macOS HIG sheet パターンに依存             |
| DevTools 有効      | 必須      | Zustand Store の state 確認・MB-1〜5 の Console 検証に使用 |
| Playwright         | 推奨      | P53 対策スクリーンショット自動化に使用                     |
| Activity Monitor   | 推奨      | MB-4（headless execution 非発生）の確認に使用              |
| CLI ツール除外環境 | 推奨      | TC-MAN-9（unavailable 状態）の検証に必要                   |

---

## 6. 設計タスク時点の未解決事項

| ID   | 内容                                                          | 追跡先         |
| ---- | ------------------------------------------------------------- | -------------- |
| MN-1 | `toHandoffGuidance()` adapter の配置先が未定義                | 後続実装タスク |
| MN-2 | Terminal Dock の `aborted` state 遷移条件・表示・CTA が未定義 | 後続実装タスク |
| MN-3 | GuidanceBlock vs TerminalHandoffCard の使い分けルールが曖昧   | 後続実装タスク |

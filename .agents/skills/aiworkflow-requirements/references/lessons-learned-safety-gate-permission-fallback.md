# Lessons Learned（教訓集） / SafetyGate・Permission・Fallback 実装

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: SafetyGate / PermissionStore / Fallback 実装 domain lessons

## メタ情報

| 項目     | 値                                                                     |
| -------- | ---------------------------------------------------------------------- |
| 対象タスク | UT-06-005（abort/skip/retry/timeout フォールバック）, UT-06-005-A（PreToolUse Hook 統合）, TASK-SKILL-LIFECYCLE-08 仕様作成 |
| 作成日   | 2026-03-17 |
| 関連PitfallID | P62, P63 |

---

## TASK-SKILL-LIFECYCLE-08 / UT-06-005 実装知見（2026-03-17）

### 苦戦箇所1: PermissionStore の DI スコープ問題（P62）

| 項目 | 内容 |
| --- | --- |
| 課題 | `apps/desktop/src/main/ipc/index.ts` で PermissionStore が `track("registerPermissionStoreHandlers")` のクロージャ内部でインスタンス化されていたため、SafetyGate がそのインスタンスにアクセスできなかった。SafetyGate の evaluate() が PermissionStore のデータを参照できず、常にデフォルト判定になる |
| 再発条件 | Graceful Degradation パターン（P54）で `track()` クロージャを使う場合に、クロージャ間で共有が必要なインスタンスをスコープ内でインスタンス化する |
| 解決策 | PermissionStore を `track()` クロージャの外（上位スコープ）に抽出し、PermissionStoreHandlers と SafetyGate の両方から共有参照可能にした |
| 標準ルール | `track()` クロージャを使う場合、複数クロージャ間で共有が必要なインスタンスはスコープ外に抽出する。P34（遅延初期化 DI）と同じく、依存オブジェクトのライフサイクルを事前に設計する |
| 関連パターン | P34（遅延初期化 DI パターン選択）、P54（safeRegister パターン不適合）、P60（createAuthModeService のスコープ制限）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

```typescript
// ❌ クロージャ内でインスタンス化 → SafetyGate から参照不能
registerAllIpcHandlers() {
  track("registerPermissionStoreHandlers", () => {
    const permissionStore = new PermissionStore(); // ← スコープ内でインスタンス化
    registerPermissionStoreHandlers(permissionStore);
  });
  // SafetyGate はこの permissionStore にアクセスできない
  const safetyGate = new DefaultSafetyGate(permissionStore); // ← 参照不能
}

// ✅ 上位スコープに抽出 → 複数クロージャから共有参照
registerAllIpcHandlers() {
  const permissionStore = new PermissionStore(); // ← 上位スコープ
  track("registerPermissionStoreHandlers", () => {
    registerPermissionStoreHandlers(permissionStore);
  });
  track("registerSafetyGateHandlers", () => {
    const safetyGate = new DefaultSafetyGate(permissionStore); // ← 共有参照
    registerSafetyGateHandlers(safetyGate);
  });
}
```

---

### 苦戦箇所2: SafetyGate metadataProvider の抽象化境界（P63）

| 項目 | 内容 |
| --- | --- |
| 課題 | DefaultSafetyGate のコンストラクタに `metadataProvider: { getRequiredTools, getAccessPaths }` を渡す設計にしたが、実行時にスキルのメタデータをどこから取得するかが未定義だった。暫定的に空配列を返すスタブ実装（`async () => []`）を入れたが、実スキル実行時にはスキルマニフェストからの動的取得が必要 |
| 再発条件 | インターフェース設計時にデータフローの「ソース（どのモジュールがデータを持つか）」を設計ドキュメントに明示しない場合 |
| 解決策 | 現時点ではスタブ実装を維持し、TASK-SKILL-LIFECYCLE-08 実装フェーズでスキルマニフェストとの統合を行う設計とした。スタブ判断の根拠を Phase 2 設計ドキュメントに明記し、未タスク化した |
| 標準ルール | インターフェースの設計時に「このメソッドのデータソースはどのモジュールか」をデータフロー図またはコメントで明記する。実装時にスタブが残る場合は設計ドキュメントに判断根拠を記録して未タスク化する |
| 関連パターン | P34（遅延初期化 DI）、S-PF-2（revokeSessionEntries スタブ実装の設計判断）|
| 関連タスク | TASK-SKILL-LIFECYCLE-08 |

```typescript
// ❌ metadataProvider の実装が未定義のまま設計進行
interface MetadataProvider {
  getRequiredTools(skillName: string): Promise<string[]>; // ← どこから取得？未定義
  getAccessPaths(skillName: string): Promise<string[]>;
}

// ✅ 設計時にデータソースを明記
// TODO(TASK-SKILL-LIFECYCLE-08-実装): SkillManifestService.getManifest() から取得
// スタブ実装（空配列返却）を一時的に使用。本格実装は未タスク化済み
const metadataProvider: MetadataProvider = {
  getRequiredTools: async (_skillName) => [], // スタブ: SkillManifest統合で置換予定
  getAccessPaths: async (_skillName) => [],   // スタブ: SkillManifest統合で置換予定
};
```

---

### 苦戦箇所3: フォールバック制御の境界条件テスト設計

| 項目 | 内容 |
| --- | --- |
| 課題 | abort/skip/retry/timeout の4パターン × 正常/異常の組み合わせが多く、テストケースの網羅性確保が困難だった。23テストに絞り込む判断基準が明確でなかった |
| 再発条件 | フォールバック戦略が4種類以上ある場合に、全組み合わせを網羅しようとして最初からテスト数が膨張する |
| 解決策 | 各フォールバック戦略の代表的なケース（成功/失敗/タイムアウト）に限定。revokeSessionEntries は独立したテストグループとして分離することで、テスト間の依存を排除した |
| 標準ルール | フォールバック戦略のテストは「各戦略の最重要パス（成功/失敗）」+「共通インフラ（revokeSessionEntries等）の独立テスト」の2層構造で設計する。全組み合わせは Phase 6（テスト拡充）で対応する |
| 関連パターン | S-PF-1（既実装コードの4ステップ abort フロー発見遅延）、S-PF-2（revokeSessionEntries スタブ実装）|
| 関連タスク | UT-06-005 |

---

### 苦戦箇所4: timeout 契約値の認識ズレ（UT-06-005-A）

| 項目 | 内容 |
| --- | --- |
| 課題 | 仕様側は `PermissionResolver` の 5分 timeout 前提で記述されていたが、実装は `SkillExecutor.sendPermissionRequestWithTimeout()` で 30秒 timeout を先に適用していた |
| 再発条件 | timeout 値を「下位コンポーネント既定値」で固定的に解釈し、呼び出し側のガード値を確認しない |
| 解決策 | timeout 契約を「実行時に最初に評価される値（SkillExecutor=30000ms）」で統一し、`PermissionTimeoutError`→`executeAbortFlow(\"timeout\")` の経路を仕様へ明示 |
| 標準ルール | timeout 系仕様は「誰が最終的な閾値を決めるか」をクラス名・メソッド名付きで記述する |
| 関連タスク | UT-06-005-A |

---

### 同種課題の5分解決カード（DI スコープ + 抽象化境界 + フォールバックテスト）

| 症状 | 原因 | 最短手順 |
| --- | --- | --- |
| SafetyGate が PermissionStore のデータを参照できない | DI スコープがクロージャ内に閉じている（P62） | クロージャ外の上位スコープでインスタンス化し、複数クロージャに渡す |
| metadataProvider の実装先が不明で設計が止まる | データフローの「ソース」を設計時に定義していない（P63） | スタブ実装を選択し、判断根拠を Phase 2 に記録して未タスク化する |
| フォールバックテストが膨張して管理不能 | 全組み合わせ網羅を Phase 4 で試みる | 「代表パス × 戦略数」+ 独立インフラテストの2層構造で分割する |
| revokeSessionEntries がセッション別フィルタリングに対応していない | 型定義（AllowedToolEntry）の拡張がスコープ外 | スタブ実装（全クリア）を選択し、本格実装を未タスク化する（S-PF-2 準拠）|
| `track()` クロージャで依存関係が複数になる | ライフサイクル設計なしでクロージャを使用 | 依存オブジェクトのライフサイクルを事前に設計し、共有インスタンスは最も外側のスコープに置く |

---

---

### 苦戦箇所 S-PF-1: 既実装コードの4ステップ abort フロー発見遅延

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 4 でテストを書き始めた段階で、abort 4ステップ（cancelAll→revokeSessionEntries→log→IPC通知）が既に SkillExecutor.ts に実装済みだった |
| 再発条件 | 大規模ファイル（SkillExecutor.ts 1500行超）のコード調査が不十分なまま Phase 1 に入る場合 |
| 解決策 | Phase 1 で `git log --oneline -- <target-file>` と `grep -n "abort\|fallback\|retry" <target-file>` を実行し、既存実装の有無を確認してから要件を策定する |
| 関連パターン | P50（既実装防御の発見による Phase 転換）|
| 関連タスク | UT-06-005 |

### 苦戦箇所 S-PF-2: revokeSessionEntries スタブ実装の設計判断

| 項目 | 内容 |
| --- | --- |
| 課題 | abort フローの Step 2（revokeSessionEntries）がスタブ実装（全エントリクリア）のまま。セッション別フィルタリングには AllowedToolEntry に sessionId 追加が必要で、スコープ外と判断した |
| 再発条件 | 既存の型定義（AllowedToolEntry）を拡張すると、関連テスト・仕様書への影響範囲が広すぎる場合 |
| 解決策 | スタブ実装を選択し、本格実装を UT-06-005-B として未タスク化。スタブ判断の根拠を Phase 2 設計ドキュメントに明記する |
| 関連タスク | UT-06-005, UT-06-005-B |

### 苦戦箇所 S-PF-3: PERMISSION_MAX_RETRIES デッドコード化と abortedExecutions メモリリーク

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 10 最終レビューで2件の品質問題を検出: (1) `PERMISSION_MAX_RETRIES=3` がデッドコード化 (2) `abortedExecutions: Set<string>` にクリア機構がなくメモリリーク |
| 再発条件 | 定数を定義しても使用箇所で参照せず直値を使うパターン、Set/Map のクリーンアップ忘れ |
| 解決策 | (1) retryCounters の条件を `PERMISSION_MAX_RETRIES` 参照に変更 (2) abortedExecutions にセッション単位のクリア機構を追加 |
| 関連タスク | UT-06-005 |

### 同種課題の5分解決カード（S-PF-1〜3）

1. `grep -n "abort\|fallback\|retry\|skip" <target-file>` で既存実装を確認
2. 既実装の場合は Phase 4-5 を「検証・補完」モードに切り替え（P50 準拠）
3. スタブ実装が必要な場合は Phase 2 に判断根拠を記録し、未タスク化を Phase 12 Task 4 に組み込む
4. 定数定義は `grep -rn "CONST_NAME" <file>` で使用箇所を確認、未使用は即修正
5. Set/Map を使う場合は cleanup 機構（セッション終了時の clear/delete）を設計段階で明記

---

### 関連PitfallID（06-known-pitfalls.md に追記済み）

| ID | タイトル | 追記先 |
| --- | --- | --- |
| P62 | PermissionStore の DI スコープ問題（track クロージャ間共有インスタンス） | `06-known-pitfalls.md` |
| P63 | SafetyGate metadataProvider のデータソース未定義による抽象化境界失敗 | `06-known-pitfalls.md` |

---

## UT-06-005-A 実装知見（2026-03-17）

### 苦戦箇所5: P42 3段バリデーション欠如（handlePermissionCheck 内部引数）

| 項目 | 内容 |
| --- | --- |
| 課題 | `handlePermissionCheck(executionId, toolName, args, signal?)` の `executionId` / `toolName` 引数に型チェック・空文字列・トリム空文字列の3段バリデーションが実装されていない。内部 private メソッドのため IPC 境界バリデーションの必須対象ではないが、防御的プログラミング観点で改善余地がある。`PreToolUse` Hook から呼び出されるため、SDK が渡す値が空文字列や undefined になった場合の挙動が未保護 |
| 再発条件 | private メソッドを「内部だから安全」と判断してバリデーションを省略する場合 |
| 解決策（暫定） | 内部メソッドのため現時点では省略。ただし `executionId.trim() === ""` の場合は `executeAbortFlow("unknown")` に即座に遷移するガードを検討すべき |
| 標準ルール | P42 の3段バリデーションは IPC 境界だけでなく、外部 Hook コールバックから呼び出される private メソッドにも適用することを検討する |
| 具体的なコード位置 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` の `handlePermissionCheck` メソッド |
| 関連パターン | P42（文字列引数の .trim() バリデーション漏れ） |
| 関連タスク | UT-06-005-A |

---

### 苦戦箇所6: P61 DIP 違反（PermissionResolver 具象クラス直接生成）

| 項目 | 内容 |
| --- | --- |
| 課題 | `SkillExecutor` コンストラクタ内で `new PermissionResolver()` を直接生成している。P61（IPC ハンドラの DIP 違反）と同パターンで、`PermissionResolver` に対するインターフェース（`IPermissionResolver`）が抽出されていないため、テストでモック差し替えが困難。`PermissionStore` は `IPermissionStore` 経由の DI 済みだが、`PermissionResolver` は未対応の非対称状態になっている |
| 再発条件 | 新しい依存オブジェクトを追加する際に「既存の依存オブジェクトが DI 化されているから安全」と思い込み、インターフェース抽出の判断を省略する場合 |
| 解決策 | `IPermissionResolver` インターフェースを抽出し、コンストラクタ DI 化する。既存の `IPermissionStore` の DI パターンを参考にする |
| 未タスク化要否 | 要（コードは動作するが設計負債として記録し、後続タスクで解消する） |
| 具体的なコード位置 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` コンストラクタ（`new PermissionResolver()` の行） |
| 関連パターン | P61（IPC ハンドラの DIP 違反）、P34（遅延初期化 DI パターン選択） |
| 関連タスク | UT-06-005-A |

```typescript
// ❌ 現状: 具象クラス直接生成（DIP 違反）
constructor(deps: SkillExecutorDeps) {
  this.permissionResolver = new PermissionResolver(); // ← 具象クラス依存
  this.permissionStore = deps.permissionStore;        // ← IPermissionStore 経由（DI 済み）
}

// ✅ 目標: インターフェース経由の DI
constructor(deps: SkillExecutorDeps) {
  this.permissionResolver = deps.permissionResolver ?? new PermissionResolver(); // ← IPermissionResolver
  this.permissionStore = deps.permissionStore;
}
```

---

### 苦戦箇所7: P49 as キャスト多用（sanitizeArgs 周辺）

| 項目 | 内容 |
| --- | --- |
| 課題 | `sanitizeArgs` ヘルパー周辺で `as string` キャストが10箇所以上使用されている。`typeof` チェック後の安全なキャストも含まれるが、P49 準拠には `in` 演算子でプロパティ存在を検証してから `typeof` チェックする形式が推奨される。特に `args` が `Record<string, unknown>` 型として渡された後のプロパティアクセスで、`as string` キャストを多用している箇所がある |
| 再発条件 | `typeof value === "string"` チェック後の即 `as string` キャストで、P49 の `in` 演算子チェックを省略した場合 |
| 解決策（現状） | `typeof` チェック後のキャストは実行時安全性があるため、現時点では重大度低として許容。ただし `as unknown as SomeType` のような二重キャストは P49 違反として修正対象 |
| 具体的なコード位置 | `apps/desktop/src/main/services/skill/SkillExecutor.ts` の `sanitizeArgs` 関数付近 |
| 関連パターン | P49（type predicate 内での `as` キャスト vs `in` 演算子）、P19（型キャストバイパス） |
| 関連タスク | UT-06-005-A |

---

### 苦戦箇所8: Phase 11 ダミースクリーンショット問題

| 項目 | 内容 |
| --- | --- |
| 課題 | Phase 11（手動テスト）フェーズで生成されたスクリーンショットが 1×1 ピクセルのダミー画像であり、証跡として無効だった。CLI 環境では Electron アプリの実画面キャプチャができないため、自動生成スクリプトが最小ダミー画像を生成した |
| 再発条件 | Phase 11 でスクリーンショット取得を要求するタスク仕様書に対して、CLI 環境でキャプチャスクリプトを実行した場合 |
| 解決策 | P53（CLI 環境でのスクリーンショット取得制約）に準拠し、Playwright `page.screenshot()` または `Electron.webContents.capturePage()` をスクリプト化して取得する。ダミー画像は視覚的証跡として無効であることを Phase 11 仕様書に明記する |
| 標準ルール | Phase 11 の「スクリーンショット撮影」タスクでは、(1) Playwright 自動取得、(2) CLI 環境不可の場合は「手動確認必要」と明記して証跡欄を空にする、のいずれかを選択する。ダミー画像の生成は不可 |
| 関連パターン | P53（CLI 環境でのスクリーンショット取得制約） |
| 関連タスク | UT-06-005-A |

---

### 苦戦箇所9: Promise.race + AbortSignal クリーンアップパターンの有効性

| 項目 | 内容 |
| --- | --- |
| 発見 | `sendPermissionRequestWithTimeout` で `Promise.race([requestPromise, timeoutPromise])` を使用し、タイムアウト時に `PermissionTimeoutError` をスローするパターンが、timeout 契約の明示化において有効だった |
| 有効性 | `PermissionTimeoutError` という専用エラー型を作成することで、`handlePermissionCheck` 内の `catch` ブロックで `instanceof PermissionTimeoutError` による分岐が可能になり、timeout と unknown エラーの経路を明確に分離できた |
| 注意点 | `Promise.race` でタイムアウトした場合でも、負けた `requestPromise` は内部的に pending 状態のまま残る可能性がある。`PermissionResolver.cancelRequest()` を timeout 検知後に呼び出してリソースをクリーンアップすることを確認する |
| 標準ルール | timeout guard として `Promise.race` を使う場合は、負けた Promise のクリーンアップ（AbortController.abort() または cancelRequest()）を必ずセットで実装する |
| 関連タスク | UT-06-005-A |

---

### 同種課題の5分解決カード（UT-06-005-A 追加分）

| 症状 | 原因 | 最短手順 |
| --- | --- | --- |
| Hook コールバックの private メソッドで空引数が来てクラッシュ | P42 バリデーション省略（「internal だから安全」の思い込み） | `executionId.trim() === ""` チェックを追加し、fail-closed で `executeAbortFlow("unknown")` に遷移 |
| テストで PermissionResolver のモック差し替えができない | P61 DIP 違反（具象クラス直接生成） | `IPermissionResolver` インターフェースを抽出し、コンストラクタ DI 化する |
| Phase 11 証跡ファイルが 1×1 ダミー画像になっている | P53 CLI 環境制約でキャプチャスクリプトが最小画像を生成 | Playwright `page.screenshot()` で実画像を取得するか、「手動確認必要」として欄を空にする |
| timeout 後に Permission request が pending 状態でリソースリークする | `Promise.race` の負け側 Promise のクリーンアップ漏れ | `cancelRequest(requestId)` を timeout 検知直後に呼び出す |

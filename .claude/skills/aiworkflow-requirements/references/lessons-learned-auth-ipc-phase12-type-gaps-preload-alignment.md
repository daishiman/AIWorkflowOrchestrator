# Lessons Learned（教訓集） / auth / ipc lessons

> 親仕様書: [lessons-learned.md](lessons-learned.md)
> 役割: auth / ipc lessons

## UT-IPC-DATA-FLOW-TYPE-GAPS-001: Phase 12再監査（仕様書修正タスク）

### タスク概要

| 項目        | 内容                                                                                  |
| ----------- | ------------------------------------------------------------------------------------- |
| タスクID    | UT-IPC-DATA-FLOW-TYPE-GAPS-001                                                        |
| 目的        | IPCデータフロー型ギャップ修正タスクの Phase 12 成果物・システム仕様反映を完全同期する |
| 完了日      | 2026-02-24                                                                            |
| ステータス  | **完了**                                                                              |
| 関連Pitfall | P1, P2, P3, P4, P29                                                                   |

### 苦戦箇所1: Phase 12成果物の不足

| 項目 | 内容                                                                                     |
| ---- | ---------------------------------------------------------------------------------------- |
| 課題 | `phase-12-documentation.md` で必須の `spec-update-summary.md` が未生成のまま進行していた |
| 原因 | `documentation-changelog.md` 更新時に成果物一覧との突合が後手になった                    |
| 対処 | `outputs/phase-12/` 実体と成果物表を1対1で突合し、不足成果物を即時作成した               |
| 教訓 | Phase 12 は「文書更新完了」ではなく「成果物セット完了」で判定する                        |

### 苦戦箇所2: artifactsjson 二重管理の非同期

| 項目 | 内容                                                                          |
| ---- | ----------------------------------------------------------------------------- |
| 課題 | `artifacts.json` と `outputs/artifacts.json` の状態・成果物パスが分岐していた |
| 原因 | 片方のみ更新され、Phase 6/11/12 の成果物名が旧状態で残存した                  |
| 対処 | 2ファイルを同一内容へ同期し、completed成果物の実在チェックを実施した          |
| 教訓 | 進捗台帳は同期手順を完了条件に組み込まないと再発する                          |

### 苦戦箇所3: 未タスク指示書フォーマット不一致

| 項目 | 内容                                                                       |
| ---- | -------------------------------------------------------------------------- |
| 課題 | 未タスク指示書が旧テンプレート見出し（`## 1. メタ情報`）で監査違反になった |
| 原因 | Why/What/How 必須見出しへの追従不足                                        |
| 対処 | 指示書を最新テンプレート（`## メタ情報` + 1〜9セクション）へ全面整形した   |
| 教訓 | 未タスク作成直後に `audit-unassigned-tasks.js` 単体監査を実行する          |

### 同種課題の簡潔解決手順（4ステップ）

1. `phase-12-documentation.md` の成果物一覧と `outputs/phase-12/` 実体を突合する
2. `artifacts.json` と `outputs/artifacts.json` を同時更新し、completed成果物の参照切れをゼロ化する
3. `generate-index.js` 実行結果を `documentation-changelog.md` と `spec-update-summary.md` に記録する
4. 未タスク指示書は `audit-unassigned-tasks.js` で単体監査し、必須見出し不足を解消してから完了扱いにする

### 苦戦箇所4: 仕様書修正タスクのPhaseテンプレート適用困難

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: タスク管理・ワークフロー
- **症状**: コード変更なしの仕様書修正タスクでは、Phase 4（テスト作成）、Phase 7（カバレッジ確認）、Phase 11（手動テスト）が本来の意味（ユニットテスト、カバレッジ率、UI操作確認）と合致しない
- **原因**: Phase 1-13テンプレートはコード実装タスクを前提としており、仕様書修正のみタスクに対する簡略化Phaseガイドが存在しなかった
- **解決策**:
  - Phase 4 = grep検証基準設計（49検証項目を正規表現パターンとして定義）
  - Phase 5 = 仕様書修正実行（7ファイル、28修正項目）
  - Phase 6-7 = grepベース整合性検証（24項目）+ 網羅性確認（49項目）
  - Phase 11 = 実装者視点レビュー（3視点×3ケース = 9テスト）
- **教訓**: 仕様書修正タスクでは、各Phaseの「N/A」判定ではなく、同等の品質保証を別手段で実現する代替アプローチを設計すべき

### 苦戦箇所5: 6ギャップの横断的分析の複雑性

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 分析・設計
- **症状**: 7ファイル×6ギャップ = 42交差ポイントの検証で、Gap別に修正すると1ファイル内の整合性が崩れ、ファイル別に修正するとGap間の一貫性が失われる
- **原因**: 型ギャップは複数ファイルに跨る横断的な問題であり、単一ファイルのスコープでは完全な検証ができない
- **解決策**:
  1. Phase 1でGap別に問題を分類し、影響範囲マトリクス（Gap×ファイル）を作成
  2. Phase 5ではGap別に修正を実行し、各Gap完了時にファイル間整合性を確認
  3. Phase 6で横断的整合性検証（24項目）、Phase 7で網羅性確認（49項目）を分離
- **教訓**: 横断的な型ギャップ修正では「Gap別修正→ファイル間検証」のサイクルが効果的。ファイル別に修正すると、後から別Gapの修正で先の修正と矛盾するリスクがある

### 苦戦箇所6: Date型シリアライズ方針の統一判断

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 設計判断
- **症状**: 4ファイル（task-9f, 9g, 9h, 9j）に散在する14個のDate型フィールドに対し、IPC境界でのシリアライズ方針が未定義だった。`Date`型のままIPCで送信するとJSONシリアライズでタイムゾーン情報が失われるリスクがあった
- **原因**: 仕様書作成時にIPC境界での型変換を考慮していなかった。バックエンド側の`Date`型とフロントエンド側の`string`型の間のギャップが暗黙的だった
- **解決策**:
  - ISO 8601文字列（`string; // ISO 8601`）を統一基準として採用
  - Main Processハンドラの戻り値で`.toISOString()`に変換するパターンを標準化
  - Renderer側では`new Date(isoString)`で復元するパターンを明記
  - 14フィールド全てに型注記を一括追加

```typescript
// ❌ IPC境界でDate型を直接使用（シリアライズで情報欠落リスク）
interface SkillSchedule {
  nextRun: Date; // JSONシリアライズで文字列化されるが形式が不定
  lastRun: Date | null;
}

// ✅ ISO 8601文字列で統一
interface SkillSchedule {
  nextRun: string; // ISO 8601
  lastRun: string | null; // ISO 8601
}

// Main Process側の変換
return {
  nextRun: schedule.nextRun.toISOString(),
  lastRun: schedule.lastRun?.toISOString() ?? null,
};

// Renderer側の復元
const nextRun = new Date(schedule.nextRun);
```

- **教訓**: IPC境界を越えるDate型は必ずISO 8601文字列に変換する方針を仕様書段階で定義すべき。後からの一括修正は14フィールド×4ファイルと影響範囲が大きい

### 苦戦箇所7: positional→object形式のIPC引数移行設計

- **タスクID**: UT-IPC-DATA-FLOW-TYPE-GAPS-001
- **カテゴリ**: 設計判断・IPC
- **症状**: task-9a（Skill Editor）の6ハンドラがpositional形式（`safeInvoke(channel, arg1, arg2)`）で定義されていたが、P44/P45の教訓からobject形式（`safeInvoke(channel, { key1: val1, key2: val2 })`）への統一が必要だった
- **原因**: task-9aの仕様書はP44発見前に作成されており、旧パターンのpositional引数が使用されていた
- **解決策**:
  1. 6ハンドラ分のArgs型定義を新規追加（`SkillEditorReadArgs`, `SkillEditorWriteArgs`等）
  2. P42準拠の3段バリデーション（型チェック→空文字列→trim空文字列）をobject内の各フィールドに適用
  3. Before/Afterコード例を仕様書に記載し、後続実装者が迷わないようにする
  4. 既存のpositional形式のsafeInvoke呼び出しも、Preload側でobjectに変換する中間層パターンを設計

```typescript
// ❌ positional形式（旧パターン、P44リスク）
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, skillName, relativePath);

// ✅ object形式（P44/P45準拠）
safeInvoke(IPC_CHANNELS.SKILL_EDITOR_READ, { skillName, relativePath });

// Args型定義
interface SkillEditorReadArgs {
  skillName: string;
  relativePath: string;
}

// ハンドラ側バリデーション（P42準拠）
ipcMain.handle(
  "skill:editor:read",
  async (event, args: SkillEditorReadArgs) => {
    if (typeof args?.skillName !== "string" || args.skillName.trim() === "") {
      throw {
        code: "VALIDATION_ERROR",
        message: "skillName must be a non-empty string",
      };
    }
    if (
      typeof args?.relativePath !== "string" ||
      args.relativePath.trim() === ""
    ) {
      throw {
        code: "VALIDATION_ERROR",
        message: "relativePath must be a non-empty string",
      };
    }
    // ...
  },
);
```

- **教訓**: 仕様書段階でIPC引数形式を統一しておくことで、実装時のP44/P45再発リスクを完全に排除できる。6ハンドラ分のArgs型定義は手間だが、型安全性と保守性の向上に大きく寄与する

### 同種課題の簡潔解決手順（5ステップ）- 仕様書修正タスク向け

仕様書間のデータフロー型ギャップを検出・解消するタスクに遭遇した場合：

1. **ギャップマトリクス作成**: 全対象ファイルを横軸、全ギャップを縦軸とした影響範囲マトリクスを作成し、各セルに「修正要/不要/該当なし」を記入
2. **grepベースの検証基準設計**: 各ギャップの修正完了を判定する正規表現パターンを事前定義（例: `grep -c "string; // ISO 8601" task-9*.md` で Date型フィールド数を検証）
3. **Gap別修正→ファイル間検証のサイクル**: Gap単位で全ファイルを修正し、修正完了後にファイル間の整合性をgrepで横断検証
4. **Phase対応表の事前定義**: コード変更なしタスクの場合、各Phaseで何を代替実施するかを Phase 1 で事前定義（Phase 4=検証基準設計、Phase 6-7=grep検証 等）
5. **Phase 12の成果物を先に定義**: spec-update-summary.md、documentation-changelog.md、unassigned-task-report.md の3成果物を Phase 12 開始時に空ファイルで作成し、完了時に内容を埋める

---

## UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001: task-9D〜9J 仕様差分の統合是正

### タスク概要

| 項目        | 内容                                                                              |
| ----------- | --------------------------------------------------------------------------------- |
| タスクID    | UT-IMP-IPC-PRELOAD-EXTENSION-SPEC-ALIGNMENT-001                                   |
| 目的        | task-9D〜9J の参照差分・artifacts差分を統合是正し、実装前の契約ドリフトを防止する |
| 完了日      | 2026-02-25                                                                        |
| ステータス  | **完了**                                                                          |
| 関連Pitfall | P32, P44, P45                                                                     |

### 苦戦箇所1: 旧パスが文書内で混在し正本が不明瞭化

| 項目 | 内容                                                                                                            |
| ---- | --------------------------------------------------------------------------------------------------------------- |
| 課題 | `preload/skillAPI.ts` と `preload/skill-api.ts`、`main/ipc/channels.ts` と `preload/channels.ts` が混在していた |
| 原因 | 移行前後の記述が task ごとに異なる時期で更新され、統一ルールが未適用だった                                      |
| 対処 | 旧パス検出条件を固定し、対象7仕様書で0件になるまで一括是正                                                      |
| 教訓 | 参照差分はファイル単位ではなく「対象群一括」で潰すほうが再発しにくい                                            |

### 苦戦箇所2: artifacts必須項目の漏れがtaskごとに発生

| 項目 | 内容                                                                                                        |
| ---- | ----------------------------------------------------------------------------------------------------------- |
| 課題 | `modifies` / `creates` の記載粒度が task ごとにズレ、実装時の変更対象が不明瞭だった                         |
| 原因 | task-9D〜9J で共通必須項目のテンプレート化がされていなかった                                                |
| 対処 | 必須4項目（`channels.ts`, `skill-api.ts`, `types.ts`, `skill/index.ts`）を共通化し、domain型を task別に補完 |
| 教訓 | artifacts は「共通セット + domain差分」の2層で設計すると漏れを抑制できる                                    |

### 苦戦箇所3: Date型方針がtask-9Iのみドリフト

| 項目 | 内容                                                                                |
| ---- | ----------------------------------------------------------------------------------- |
| 課題 | task-9I の `GeneratedDoc.generatedAt` のみ `Date` 記述が残り、IPC境界方針と矛盾した |
| 原因 | Dateシリアライズ方針の追記が一部タスクへ未展開だった                                |
| 対処 | `string (ISO 8601)` へ統一し、IPCシリアライズ方針セクションを追記                   |
| 教訓 | Date型を含む仕様は「型定義修正」と「方針文章追記」をセットで実施する                |

### 同種課題の簡潔解決手順（5ステップ）

1. 監査対象を task 群へ限定し、全体ベースライン違反と分離する。
2. 参照差分（oldPaths）と台帳差分（missingArtifacts）を別指標で収集する。
3. 旧参照パスを一括置換し、再監査で0件化する。
4. artifacts を共通セット + domain差分で補完し、7/7一致を確認する。
5. `task-workflow.md` 完了記録・残課題状態・`LOGS.md` を同一タイミングで同期する。

### TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 への再利用メモ

| 項目 | 内容 |
| ---- | ---- |
| current canonical set | `interfaces-agent-sdk-skill-core.md`, `interfaces-agent-sdk-skill-details.md`, `security-skill-ipc-core.md`, `security-electron-ipc-core.md`, `architecture-overview-core.md`, `task-workflow-completed-ipc-contract-preload-alignment.md` |
| object payload standard | `skill:get-detail` は `{ skillId }`、`skill:update` は `{ skillName, updates }` |
| same-wave 更新 | `interfaces` / `security` / `task-workflow` / `lessons` を同一ターンで更新する |
| Phase 12 再監査 | `artifacts.json` / `outputs/artifacts.json` / phase docs / `index.md` を突合する |

---

## UT-FIX-SKILL-IMPORT-ID-MISMATCH-001: SkillImportDialog の id/name 契約不整合修正

### タスク概要

| 項目        | 内容                                                                   |
| ----------- | ---------------------------------------------------------------------- |
| タスクID    | UT-FIX-SKILL-IMPORT-ID-MISMATCH-001                                    |
| 目的        | Renderer層で `skill.id` を渡していた誤りを `skill.name` 契約へ修正する |
| 完了日      | 2026-02-22                                                             |
| ステータス  | **完了**                                                               |
| 関連Pitfall | P44, P45                                                               |
| テスト      | SkillImportDialog 49件 + AgentView統合3件 PASS                         |

### 苦戦箇所と解決策

#### 1. 同名コンポーネントの誤調査

| 項目       | 内容                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| **課題**   | `SkillImportDialog` が複数配置されており、修正対象コンポーネントの特定に時間を要した                 |
| **原因**   | ファイル名検索だけで作業を開始し、実際の import 経路を先に固定しなかった                             |
| **解決策** | `AgentView` 側の import 文から逆引きし、`organisms/SkillImportDialog/index.tsx` を対象として固定した |
| **教訓**   | UI不具合は「利用箇所 → import 先 → 実装本体」の順で特定すると迷走しにくい                            |

#### 2. `skill.id`/`skill.name` の文字列型混同

| 項目       | 内容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| **課題**   | `skill.id` と `skill.name` がどちらも `string` のため、コンパイル時に契約違反が検出されない |
| **原因**   | 型では区別できない識別子を、変数名と実装規約で分離していなかった                            |
| **解決策** | `onImport` を `skillNames` 命名に統一し、`selectedIds` から `name` へ明示変換を追加した     |
| **教訓**   | 文字列識別子は「名前」「変換点」「否定条件テスト」の3点セットで守る                         |

#### 3. インポート処理の偽成功ログの誤読

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| **課題**   | `importSkills` の成功ログに引きずられ、障害点を見誤りやすかった          |
| **原因**   | 関数単位のログだけ確認し、IPCハンドラの最終戻り値まで追跡しなかった      |
| **解決策** | Renderer入力値 → IPC引数 → `getSkillByName()` の照合結果を一連で確認した |
| **教訓**   | IPC系は「途中成功ログ」より「最終レスポンス契約」を真実源として扱う      |

### 同種課題の簡潔解決手順（4ステップ）

1. 呼び出し元コンポーネントから import 先を逆引きして、修正対象を1ファイルに固定する。
2. IPCで期待する識別子（`name` か `id` か）を先に宣言し、実装境界に変換処理を1箇所だけ置く。
3. 変数名を `skillNames` のように契約準拠へ統一し、曖昧な `skills` 命名を避ける。
4. テストで「期待値（nameが渡る）」と「否定条件（idが渡らない）」を同時に検証する。

---

## TASK-IMP-IPC-LAYER-INTEGRITY-FIX-001 型ギャップ教訓（2026-03-19）

- `types.ts` L1203 の `skill: import("./skill-api").SkillAPI` パターンにより、skill-api.tsのインターフェース更新が自動反映される
- P32準拠の二箇所同時更新は types.ts 側の明示的更新が不要だった（import型参照の恩恵）
- getDetail戻り値型は `Skill` を正本として揃えるべきで、Preload 側の `ImportedSkill` 記述はドリフト源になる
- `packages/shared/src/ipc/channels.ts` に `SKILL_UPDATE` / `SKILL_GET_DETAIL` を定義し、shared / desktop parity をテストで固定した

---

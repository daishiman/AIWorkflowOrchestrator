# TASK-SKILL-LIFECYCLE-08 実装ガイド

## メタ情報

| 項目       | 内容                                                          |
| ---------- | ------------------------------------------------------------- |
| 文書       | Phase 12 - Task 1 成果物（実装ガイド）                        |
| タスクID   | TASK-SKILL-LIFECYCLE-08                                       |
| 作成日     | 2026-03-17                                                    |
| 依存成果物 | `outputs/phase-2/` 全5設計書、`outputs/phase-5/` 全実装成果物 |
| 対象読者   | Part 1: 非エンジニア / Part 2: TypeScript 開発者              |

---

## Part 1: 中学生レベル向け説明

### なぜ必要か

自分で作ったレシピを考えてみよう。

1. **手書きレシピ（local）**: 自分だけが見る。殴り書きでもOK。失敗しても自分だけの問題。
2. **家族の共有ノート（team）**: 家族も見るから、分量や手順をきちんと書く。でも家族が「ここ分かりにくい」と言ったら直せばいい。
3. **料理本として出版（public）**: 世界中の人が読む。誤字脱字チェック、アレルギー表示、写真の差し替えに何ヶ月もかかる。途中で「大さじ1を大さじ2に変えたい」と思っても、既に本を買った人が困るから簡単には変えられない。

スキル（AIへの指示書）も同じ。自分だけで使うなら自由に変えられるが、チームや世界に公開するなら「安全か」「前のバージョンと動きが変わらないか」を機械的に確認するルールが必要になる。

### 何をするか

このタスクでは3つの仕組みを設計した。

#### 1. 公開レベル: 鍵付きメモ帳 / クラス共有ノート / 図書館の本

| レベル     | 例え               | 意味                                           |
| ---------- | ------------------ | ---------------------------------------------- |
| **local**  | 鍵付きメモ帳       | 自分だけが使える。誰にも見せない               |
| **team**   | クラスの共有ノート | チームメンバーだけが見える。外の人は見られない |
| **public** | 図書館に置いた本   | 誰でも検索して使える。世界中の人が読める       |

公開レベルは **local → team → public** の順番でしか上がれない。local から直接 public にはできない。まず team で試して、問題がなければ public にする。

#### 2. バージョン管理: 本の版数（大改訂 = 版数増加）

本の改訂と同じルール。

| 変更の種類           | 版数の上がり方 | 例                                       |
| -------------------- | -------------- | ---------------------------------------- |
| 誤字を直した         | 1.2.3 → 1.2.4  | 内容は変わらない（patch）                |
| 新しい章を追加した   | 1.2.3 → 1.3.0  | 前の章はそのまま使える（minor）          |
| 章の順番を入れ替えた | 1.2.3 → 2.0.0  | 前の読み方が通用しない（major = 大改訂） |

大改訂（major）をするときは「前の版を使っている人」に通知が届く。

#### 3. 安全性チェック: 出版前の審査

本を出版する前に編集者がチェックするように、スキルも「どれくらい危険な操作をするか」「テストにどれくらい合格しているか」「ユーザーの評価はどうか」を機械が自動でチェックする。

| チェック結果   | 意味                                       |
| -------------- | ------------------------------------------ |
| 自動承認       | 問題なし。すぐに公開できる                 |
| レビュー必要   | 小さな心配がある。担当者が確認してから公開 |
| 管理者承認必須 | リスクが高い。管理者の許可が必要           |
| 公開不可       | 危険すぎる。スキルを修正してからやり直し   |

---

## Part 2: 開発者向け実装仕様

### 型定義一覧

本タスクで設計した型定義は以下の3ファイルに分散配置する。

#### ファイル1: `packages/shared/src/skill/publishing-types.ts`

公開レベルとメタデータの型定義。

```typescript
// 公開レベル
type SkillVisibility = "local" | "team" | "public";

// 識別ユニオン型（visibility フィールドで型を絞り込む）
type SkillPublishingMetadata = LocalMetadata | TeamMetadata | PublicMetadata;

// VisibilityFilter（Skill Center 一覧のフィルタ条件）
type VisibilityFilter = SkillVisibility | "all";
const DEFAULT_VISIBILITY_FILTER: VisibilityFilter = "all";

// バッジスタイル定数（P47 準拠: テスト側が import して期待値を生成する）
const visibilityBadgeStyles: Record<
  SkillVisibility,
  { label: string; className: string }
>;
```

LocalMetadata / TeamMetadata / PublicMetadata は SkillPublishingMetadataBase を継承し、各レベルで必須フィールドが増加する設計。

| レベル | 追加必須フィールド                               |
| ------ | ------------------------------------------------ |
| local  | name, description, version のみ                  |
| team   | local + author, tags, teamId                     |
| public | team + license, readme, changelog, minAppVersion |

#### ファイル2: `packages/shared/src/types/publish-eligibility.ts`

互換性チェック結果と公開可否判定の型定義。

```typescript
// 互換性チェック結果
interface CompatibilityCheckResult {
  level: "compatible" | "minor-incompatible" | "breaking";
  breakingChanges: BreakingChange[];
  warnings: CompatibilityWarning[];
  suggestedBump: "major" | "minor" | "patch";
}

// 公開可否判定結果（4ステータスの識別ユニオン型）
type PublishReadiness =
  | { status: "auto-approved" }
  | { status: "review-required"; reasons: string[] }
  | { status: "manual-approval-required"; reasons: string[] }
  | { status: "blocked"; reasons: string[] };

// 公開可否判定ロジックのインターフェース（Port）
interface PublishReadinessChecker {
  check(
    safetyGate: SafetyGateInput,
    metrics: ObservabilityMetrics,
  ): PublishReadiness;
}
```

#### ファイル3: `packages/shared/src/types/skill-distribution.ts`

配布操作（import / export / fork / share）の型定義。

```typescript
// 配布サービスインターフェース（P61 準拠: 具象クラスを引数に取らない）
interface SkillDistributionService {
  importSkill(sourceUrl: string, options: ImportOptions): Promise<ImportResult>;
  exportSkill(skillId: string, options: ExportOptions): Promise<ExportPackage>;
  forkSkill(skillId: string, newName: string): Promise<ForkResult>;
  shareSkill(
    skillId: string,
    teamId: string,
    options: ShareOptions,
  ): Promise<ShareLink>;
}

// 登録・更新・停止を管理するサービスインターフェース
interface SkillRegistryService {
  register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;
  update(skillId: string, newVersion: SkillVersion): Promise<UpdateResult>;
  deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;
  remove(skillId: string, options?: RemoveOptions): Promise<void>;
  getDependents(skillId: string): Promise<string[]>;
}
```

### 配置先ファイル一覧

| ファイルパス                                                | 配置内容                                                         |
| ----------------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/shared/src/skill/publishing-types.ts`             | SkillVisibility, SkillPublishingMetadata, バッジ定数             |
| `packages/shared/src/types/publish-eligibility.ts`          | PublishReadiness, SafetyGateInput, ObservabilityMetrics, Checker |
| `packages/shared/src/types/skill-distribution.ts`           | SkillDistributionService, import/export/fork/share の型          |
| `packages/shared/src/constants/ipc-channels.ts`             | SKILL_PUBLISHING_CHANNELS, SKILL_DISTRIBUTION_CHANNELS           |
| `apps/desktop/src/main/domain/compatibility-checker.ts`     | CompatibilityChecker, SchemaCompatibilityChecker（Port）         |
| `apps/desktop/src/main/domain/dependency-resolver.ts`       | DependencyResolver, DependencyConstraint（Port）                 |
| `apps/desktop/src/renderer/store/slices/publishingSlice.ts` | PublishingSlice（Zustand スライス）                              |

### 使用例

### APIシグネチャ

```typescript
interface CompatibilityChecker {
  checkVersion(
    currentVersion: string,
    nextVersion: string,
    schemaDiff: unknown,
  ): Promise<CompatibilityCheckResult>;
}

interface PublishReadinessChecker {
  check(
    safetyGate: SafetyGateInput,
    metrics: ObservabilityMetrics,
  ): PublishReadiness;
}

interface SkillRegistryService {
  register(metadata: SkillPublishingMetadata): Promise<RegisterResult>;
  update(skillId: string, newVersion: SkillVersion): Promise<UpdateResult>;
  deprecate(skillId: string, notice: DeprecationNotice): Promise<void>;
  remove(skillId: string, options?: RemoveOptions): Promise<void>;
  getDependents(skillId: string): Promise<string[]>;
}
```

#### 互換性チェック

```typescript
import type { CompatibilityCheckResult } from "@repo/shared";

const result: CompatibilityCheckResult =
  await compatibilityChecker.checkVersion("1.0.0", "2.0.0", schemaDiff);

if (result.level === "breaking") {
  // major バンプが必要。breakingChanges に破壊的変更の詳細が含まれる
  console.error(
    `破壊的変更が ${result.breakingChanges.length} 件検出されました`,
  );
  console.error(`推奨バンプ: ${result.suggestedBump}`); // "major"
  // 各 breakingChange には field, type, description, severity が含まれる
  for (const change of result.breakingChanges) {
    console.error(`  ${change.field}: ${change.description}`);
  }
}

if (result.level === "minor-incompatible") {
  // minor バンプが推奨される。warnings に後方互換だが注意が必要な変更が含まれる
  console.warn(`${result.warnings.length} 件の警告があります`);
}

if (result.level === "compatible") {
  // patch バンプで十分。breakingChanges と warnings は空配列
  console.log("変更なし。patch バージョンを増加してください");
}
```

#### 公開可否判定

```typescript
import type {
  PublishReadiness,
  SafetyGateInput,
  ObservabilityMetrics,
} from "@repo/shared";

const safetyGate: SafetyGateInput = {
  riskLevel: "low",
  gateStatus: "approved",
  securityScan: { passed: true, criticalFindings: 0, warnings: 0 },
};

const metrics: ObservabilityMetrics = {
  successRate: 95,
  qualityTrend: "improving",
  feedbackScore: 4.2,
};

const readiness: PublishReadiness = checker.check(safetyGate, metrics);

switch (readiness.status) {
  case "auto-approved":
    // 全条件を満たしている。手動操作なしで公開処理に進める
    await registryService.register(metadata);
    break;
  case "review-required":
    // 品質・安全性の懸念あり。担当者による確認後に公開可
    showReviewDialog(readiness.reasons);
    break;
  case "manual-approval-required":
    // 管理者の明示的な承認が必要
    requestAdminApproval(readiness.reasons);
    break;
  case "blocked":
    // 公開不可。スキル修正後に再評価が必要
    showBlockedError(readiness.reasons);
    break;
}
```

#### 配布操作（fork）

```typescript
import type { ForkResult } from "@repo/shared";

// fork 操作: 既存スキルから独立した派生スキルを作成する
const forkResult: ForkResult = await distributionService.forkSkill(
  "skill-abc-123", // fork 元スキル ID
  "my-custom-analyzer", // 新スキル名
);

console.log(`新スキル ID: ${forkResult.newSkillId}`);
console.log(`fork 元: ${forkResult.parentRef}`);
console.log(`fork 日時: ${forkResult.forkedAt}`);
// fork 後のスキルは visibility="local", version="0.1.0" で開始する
// SkillSafetyContract は引き継がない（新規に安全性評価が必要）
```

### エラーハンドリング

#### level: "breaking" 検出時

互換性チェックで `level === "breaking"` が返された場合、公開操作はブロックされる。

1. UI に `breakingChanges` 配列の内容を表示する
2. ユーザーに major バージョンへの変更を促す
3. major バンプ済み（`newVersion.major > currentVersion.major`）であれば手動承認キューへ登録する
4. 旧バージョンユーザーへ in-app 通知を送信する（`getDependents` で依存先を取得）

#### status: "blocked" 判定時

PublishReadiness が `"blocked"` を返した場合、公開 API を即座に fail-fast で終了する。

1. `reasons` 配列をそのまま UI に返す
2. 「クリティカルリスクのツールを使用しています」または「安全性ゲートが公開を拒否しています」のメッセージを表示する
3. スキルの修正後に再度 `checkReadiness` を呼び出して再評価する

### エッジケース

| ケース                                  | 入力                                      | 期待挙動                                          |
| --------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| local から public へ直接昇格要求        | `visibility: "public"` かつ team 経由なし | `review-required` を返し、直接昇格を拒否          |
| 互換性が breaking だが version が patch | `level: "breaking"` かつ `1.2.3 -> 1.2.4` | `blocked` を返し、major バンプを要求              |
| riskLevel=high かつ gateStatus=approved | high-risk + approved                      | `manual-approval-required` へ降格し自動公開しない |
| metrics 欠損（feedbackScore null）      | score 欠損                                | `review-required` として reasons に欠損情報を追加 |

### 設定パラメータ一覧

| パラメータ名                         | 値   | 用途                                                  |
| ------------------------------------ | ---- | ----------------------------------------------------- |
| `PUBLISH_MIN_TEST_PASS_RATE`         | 0.80 | public 昇格時の最低テスト合格率                       |
| `PUBLISH_RECOMMENDED_TEST_PASS_RATE` | 0.95 | auto-approved 判定の推奨テスト合格率                  |
| `PUBLISH_RECOMMENDED_AVG_SCORE`      | 4.0  | auto-approved 判定の推奨フィードバックスコア          |
| `DEPRECATION_GRACE_DAYS`             | 30   | 公開停止（deprecation）から削除までの猶予日数         |
| `PUBLIC_BACKWARD_COMPAT_GENERATIONS` | 2    | public スキルの後方互換保持世代数（N-2 世代まで保持） |
| `TEAM_BACKWARD_COMPAT_GENERATIONS`   | 1    | team スキルの後方互換保持世代数（N-1 世代まで保持）   |
| `LOW_RISK_SUCCESS_THRESHOLD`         | 80   | low リスクスキルの successRate 閾値（%）              |
| `MEDIUM_RISK_SUCCESS_THRESHOLD`      | 90   | medium リスクスキルの successRate 閾値（%）           |
| `LOW_RISK_FEEDBACK_THRESHOLD`        | 3.0  | low リスクスキルの feedbackScore 閾値                 |
| `MEDIUM_RISK_FEEDBACK_THRESHOLD`     | 3.5  | medium リスクスキルの feedbackScore 閾値              |

### IPC チャンネル一覧（全11チャンネル）

| チャンネル名                           | 方向      | 処理                 |
| -------------------------------------- | --------- | -------------------- |
| `skill:publishing:register`            | UI → Main | スキル登録リクエスト |
| `skill:publishing:confirm`             | UI → Main | 公開確定             |
| `skill:publishing:update`              | UI → Main | バージョン更新       |
| `skill:publishing:deprecate`           | UI → Main | 公開停止申請         |
| `skill:publishing:remove`              | UI → Main | カタログ削除         |
| `skill:publishing:get-dependents`      | UI → Main | 依存スキル一覧取得   |
| `skill:publishing:check-compatibility` | UI → Main | 互換性チェック       |
| `skill:distribution:import`            | UI → Main | スキルインポート     |
| `skill:distribution:export`            | UI → Main | スキルエクスポート   |
| `skill:distribution:fork`              | UI → Main | スキル fork          |
| `skill:distribution:share`             | UI → Main | スキル共有           |

全チャンネルは P27（ホワイトリスト管理）、P42（3段バリデーション）、P60（IpcResponse wrapper）、P61（インターフェース依存）に準拠する。

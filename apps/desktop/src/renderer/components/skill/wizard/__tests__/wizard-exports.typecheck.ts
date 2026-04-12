/**
 * @file wizard-exports.typecheck.ts
 * @description wizard barrel contract の compile-time guard
 * @task UT-SKILL-WIZARD-DESCRIBE-STEP-DELETION-001
 *
 * DescribeStepProps が wizard/index.ts から再び型 export された場合に、
 * `@ts-expect-error` が未使用になって typecheck が失敗するようにする。
 */

// @ts-expect-error DescribeStepProps は wizard barrel から再露出しない
import type { DescribeStepProps as _DescribeStepProps } from "../index";

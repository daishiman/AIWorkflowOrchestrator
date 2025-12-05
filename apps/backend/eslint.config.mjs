// Simplified ESLint config for Next.js 15 backend
export default [
  {
    ignores: [
      "**/__tests__/**",
      "**/*.test.ts",
      "**/*.test.tsx",
      ".next/**",
      "out/**",
      "node_modules/**",
      "next-env.d.ts", // Next.js auto-generated file
    ],
  },
];

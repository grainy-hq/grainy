import nextConfig from "eslint-config-next"

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".open-next/**",
      ".wrangler/**",
      "node_modules/**",
      "cloudflare-env.d.ts",
      "next-env.d.ts",
    ],
  },
  ...nextConfig,
]

export default eslintConfig

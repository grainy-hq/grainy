import type { Config } from "prettier"
import type { PluginOptions as TailwindPluginOptions } from "prettier-plugin-tailwindcss"

const config: Config & TailwindPluginOptions = {
  semi: false,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
}

export default config

import type { Severity } from "./types";

export interface RulePattern {
  re: RegExp;
  desc: string;
  templateOnly?: boolean;
}

export interface Rule {
  id: string;
  category: string;
  severity: Severity;
  label: string;
  patterns: RulePattern[];
  docs: string;
}

export const rules: Rule[] = [
  // ── Vue 2 廃止API（severity: error）──
  {
    id: "filters",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "filters / パイプ構文",
    patterns: [
      { re: /filters\s*:\s*\{/gmu, desc: "filters オプション" },
      {
        re: /\|\s*\w+/gmu,
        desc: "テンプレート内パイプ構文",
        templateOnly: true,
      },
      { re: /Vue\.filter\s*\(/gmu, desc: "Vue.filter()" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/filters.html",
  },
  {
    id: "listeners",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "$listeners",
    patterns: [{ re: /\$listeners/gmu, desc: "$listeners の使用" }],
    docs: "https://v3-migration.vuejs.org/breaking-changes/listeners-removed.html",
  },
  {
    id: "event_bus_methods",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "$on/$off/$once",
    patterns: [
      { re: /\$on\s*\(/gmu, desc: "$on() の使用" },
      { re: /\$off\s*\(/gmu, desc: "$off() の使用" },
      { re: /\$once\s*\(/gmu, desc: "$once() の使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/events-api.html",
  },
  {
    id: "vue_set",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "$set / Vue.set",
    patterns: [
      { re: /this\.\$set\s*\(/gmu, desc: "this.$set() の使用" },
      { re: /Vue\.set\s*\(/gmu, desc: "Vue.set() の使用" },
      { re: /\$delete\s*\(/gmu, desc: "$delete() の使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/",
  },
  {
    id: "scoped_slots",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "slot-scope / $scopedSlots",
    patterns: [
      { re: /slot-scope\s*=/gmu, desc: "slot-scope 属性" },
      { re: /\bslot\s*=/gmu, desc: "slot 属性" },
      { re: /\$scopedSlots/gmu, desc: "$scopedSlots の使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/slots-unification.html",
  },
  {
    id: "event_bus_pattern",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "イベントバスパターン",
    patterns: [
      { re: /new Vue\s*\(\s*\)/gmu, desc: "new Vue() イベントバス" },
      {
        re: /export\s+default\s+new Vue\s*\(/gmu,
        desc: "export default new Vue() パターン",
      },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/events-api.html",
  },
  {
    id: "v_bind_sync",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "v-bind.sync",
    patterns: [
      { re: /v-bind.*\.sync/gmu, desc: "v-bind.sync 修飾子" },
      { re: /\.sync["'\s>]/gmu, desc: ".sync 修飾子" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/v-model.html",
  },
  {
    id: "v_on_native",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "v-on.native",
    patterns: [
      { re: /@\w+.*\.native/gmu, desc: "@event.native 修飾子" },
      { re: /v-on.*\.native/gmu, desc: "v-on.native 修飾子" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/v-on-native-modifier-removed.html",
  },

  // ── Vue 2 廃止API（severity: warning）──
  {
    id: "children",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "$children",
    patterns: [{ re: /\$children/gmu, desc: "$children の使用" }],
    docs: "https://v3-migration.vuejs.org/breaking-changes/children.html",
  },
  {
    id: "lifecycle_hooks",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "beforeDestroy/destroyed",
    patterns: [
      { re: /\bbeforeDestroy\s*[(:]/gmu, desc: "beforeDestroy フック" },
      { re: /\bdestroyed\s*[(:]/gmu, desc: "destroyed フック" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/",
  },
  {
    id: "async_component_old",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "旧非同期コンポーネント",
    patterns: [
      {
        re: /:\s*\(\)\s*=>\s*import\s*\(/gmu,
        desc: "旧非同期コンポーネント構文",
      },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/async-components.html",
  },

  // ── グローバルAPI変更（severity: warning）──
  {
    id: "global_vue_api",
    category: "グローバルAPI変更",
    severity: "warning",
    label: "Vue.*グローバルAPI",
    patterns: [
      { re: /Vue\.component\s*\(/gmu, desc: "Vue.component()" },
      { re: /Vue\.directive\s*\(/gmu, desc: "Vue.directive()" },
      { re: /Vue\.mixin\s*\(/gmu, desc: "Vue.mixin()" },
      { re: /Vue\.prototype/gmu, desc: "Vue.prototype" },
      { re: /Vue\.use\s*\(/gmu, desc: "Vue.use()" },
      { re: /new Vue\s*\(\s*\{/gmu, desc: "new Vue({ ... })" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/global-api.html",
  },
  {
    id: "functional_component",
    category: "グローバルAPI変更",
    severity: "warning",
    label: "functional",
    patterns: [
      { re: /functional:\s*true/gmu, desc: "functional: true オプション" },
      {
        re: /<template\s+functional>/gmu,
        desc: "<template functional> 構文",
      },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/functional-components.html",
  },

  // ── Nuxt 2 固有（severity: error）──
  {
    id: "nuxt_fetch",
    category: "Nuxt 2 固有",
    severity: "error",
    label: "fetch/asyncData",
    patterns: [
      { re: /\basync\s+fetch\s*\(/gmu, desc: "async fetch() フック" },
      { re: /\basyncData\s*\(/gmu, desc: "asyncData() フック" },
    ],
    docs: "https://nuxt.com/docs/migration/pages-and-layouts",
  },
  {
    id: "nuxt_context",
    category: "Nuxt 2 固有",
    severity: "error",
    label: "Nuxt Context",
    patterns: [
      { re: /\$nuxt\b/gmu, desc: "$nuxt の使用" },
      {
        re: /context\.(app|store|redirect|params|query|route|env|isDev)\b/gmu,
        desc: "context.* アクセス",
      },
      { re: /\bapp\.\$\w+/gmu, desc: "app.$* アクセス" },
    ],
    docs: "https://nuxt.com/docs/migration/plugins-and-middleware",
  },

  // ── Nuxt 2 固有（severity: warning）──
  {
    id: "nuxt_store",
    category: "Nuxt 2 固有",
    severity: "warning",
    label: "Vuex Store",
    patterns: [
      { re: /this\.\$store\./gmu, desc: "this.$store アクセス" },
      { re: /\bmapState\s*\(/gmu, desc: "mapState()" },
      { re: /\bmapGetters\s*\(/gmu, desc: "mapGetters()" },
      { re: /\bmapActions\s*\(/gmu, desc: "mapActions()" },
      { re: /\bmapMutations\s*\(/gmu, desc: "mapMutations()" },
    ],
    docs: "https://nuxt.com/docs/migration/configuration#vuex",
  },
  {
    id: "nuxt_plugin_inject",
    category: "Nuxt 2 固有",
    severity: "warning",
    label: "inject パターン",
    patterns: [
      { re: /inject\s*\(\s*['"`]\w+/gmu, desc: "inject() パターン" },
      {
        re: /export\s+default.*ctx.*inject/gmu,
        desc: "export default ctx inject パターン",
      },
    ],
    docs: "https://nuxt.com/docs/migration/plugins-and-middleware",
  },

  // ── Nuxt 2 固有（severity: info）──
  {
    id: "nuxt_layout",
    category: "Nuxt 2 固有",
    severity: "info",
    label: "layout オプション",
    patterns: [
      { re: /layout\s*:\s*['"`]\w+/gmu, desc: "layout オプション" },
    ],
    docs: "https://nuxt.com/docs/migration/pages-and-layouts",
  },
  {
    id: "nuxt_middleware",
    category: "Nuxt 2 固有",
    severity: "info",
    label: "middleware",
    patterns: [
      { re: /middleware\s*:\s*['"`[\w]/gmu, desc: "middleware オプション" },
    ],
    docs: "https://nuxt.com/docs/migration/plugins-and-middleware",
  },
  {
    id: "nuxt_head",
    category: "Nuxt 2 固有",
    severity: "info",
    label: "head()",
    patterns: [
      { re: /\bhead\s*\(\s*\)\s*\{/gmu, desc: "head() メソッド" },
      { re: /\bhead\s*:\s*\{/gmu, desc: "head オプション" },
    ],
    docs: "https://nuxt.com/docs/migration/meta",
  },

  // ── Nuxt Config（severity: warning）──
  {
    id: "nuxt_config_build_modules",
    category: "Nuxt Config",
    severity: "warning",
    label: "buildModules",
    patterns: [
      { re: /\bbuildModules\b/gmu, desc: "buildModules 設定" },
    ],
    docs: "https://nuxt.com/docs/migration/configuration",
  },
  {
    id: "nuxt_config_runtime",
    category: "Nuxt Config",
    severity: "warning",
    label: "RuntimeConfig (v2)",
    patterns: [
      {
        re: /\bpublicRuntimeConfig\b/gmu,
        desc: "publicRuntimeConfig 設定",
      },
      {
        re: /\bprivateRuntimeConfig\b/gmu,
        desc: "privateRuntimeConfig 設定",
      },
    ],
    docs: "https://nuxt.com/docs/migration/configuration#runtime-config",
  },
  {
    id: "nuxt_config_mode",
    category: "Nuxt Config",
    severity: "warning",
    label: "mode/target (v2)",
    patterns: [
      { re: /\bmode\s*:\s*['"`]spa/gmu, desc: "mode: 'spa' 設定" },
      {
        re: /\btarget\s*:\s*['"`]static/gmu,
        desc: "target: 'static' 設定",
      },
    ],
    docs: "https://nuxt.com/docs/migration/configuration",
  },
  {
    id: "nuxt_config_webpack",
    category: "Nuxt Config",
    severity: "warning",
    label: "webpack 設定",
    patterns: [
      {
        re: /\bwebpack\s*\([^)]*\)\s*\{/gmu,
        desc: "webpack カスタム設定",
      },
    ],
    docs: "https://nuxt.com/docs/migration/configuration#webpack",
  },
];

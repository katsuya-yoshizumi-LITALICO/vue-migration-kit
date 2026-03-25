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
  {
    id: "deep_selector",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "/deep/ / >>> セレクタ",
    patterns: [
      { re: /\/deep\//gmu, desc: "/deep/ セレクタ" },
      { re: />>>/gmu, desc: ">>> セレクタ" },
      { re: /::v-deep(?!\()/gmu, desc: "::v-deep（引数なし）" },
    ],
    docs: "https://vuejs.org/api/sfc-css-features.html#deep-selectors",
  },
  {
    id: "transition_classes",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "transition クラス名変更",
    patterns: [
      { re: /\.v-enter\b(?!-)/gmu, desc: ".v-enter → .v-enter-from に変更" },
      { re: /\.v-leave\b(?!-)/gmu, desc: ".v-leave → .v-leave-from に変更" },
      { re: /enter-class\s*=/gmu, desc: "enter-class → enter-from-class に変更" },
      { re: /leave-class\s*=/gmu, desc: "leave-class → leave-from-class に変更" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/transition.html",
  },
  {
    id: "keycode_modifiers",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "keyCode 修飾子",
    patterns: [
      { re: /@keyup\.\d+/gmu, desc: "数値 keyCode 修飾子の使用" },
      { re: /@keydown\.\d+/gmu, desc: "数値 keyCode 修飾子の使用" },
      { re: /@keypress\.\d+/gmu, desc: "数値 keyCode 修飾子の使用" },
      { re: /Vue\.config\.keyCodes/gmu, desc: "Vue.config.keyCodes の使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/keycode-modifiers.html",
  },
  {
    id: "inline_template",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "inline-template",
    patterns: [
      { re: /\binline-template\b/gmu, desc: "inline-template 属性の使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/inline-template-attribute.html",
  },
  {
    id: "destroy_method",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "$destroy",
    patterns: [
      { re: /\.\$destroy\s*\(/gmu, desc: "$destroy() の使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/",
  },
  {
    id: "hook_events",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "$on('hook:') パターン",
    patterns: [
      { re: /\$on\s*\(\s*['"`]hook:/gmu, desc: "$on('hook:...') パターン" },
      { re: /\$once\s*\(\s*['"`]hook:/gmu, desc: "$once('hook:...') パターン" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/vnode-lifecycle-events.html",
  },
  {
    id: "render_function",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "render(h) 旧API",
    patterns: [
      { re: /render\s*\(\s*h\b/gmu, desc: "render(h) — h は import { h } from 'vue' に変更" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/render-function-api.html",
  },
  {
    id: "props_data",
    category: "Vue 2 廃止API",
    severity: "error",
    label: "propsData 廃止",
    patterns: [
      { re: /propsData\s*:/gmu, desc: "propsData オプションの使用" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/props-data.html",
  },

  // ── Vue 2 廃止API（severity: warning）──
  {
    id: "custom_directive_hooks",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "カスタムディレクティブ hooks",
    patterns: [
      { re: /\bbind\s*\(\s*el/gmu, desc: "bind() → beforeMount() に変更" },
      { re: /\binserted\s*\(\s*el/gmu, desc: "inserted() → mounted() に変更" },
      { re: /\bcomponentUpdated\s*\(\s*el/gmu, desc: "componentUpdated() → updated() に変更" },
      { re: /\bunbind\s*\(\s*el/gmu, desc: "unbind() → unmounted() に変更" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/custom-directives.html",
  },
  {
    id: "v_if_v_for",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "v-if / v-for 同一要素",
    patterns: [
      { re: /v-for\s*=.*v-if\s*=/gmu, desc: "v-for と v-if が同一要素（優先順位が変更）" },
      { re: /v-if\s*=.*v-for\s*=/gmu, desc: "v-if と v-for が同一要素（優先順位が変更）" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/v-if-v-for.html",
  },
  {
    id: "tree_shakable_api",
    category: "グローバルAPI変更",
    severity: "warning",
    label: "Vue.nextTick 等",
    patterns: [
      { re: /Vue\.nextTick/gmu, desc: "Vue.nextTick → import { nextTick } from 'vue'" },
      { re: /Vue\.observable/gmu, desc: "Vue.observable → import { reactive } from 'vue'" },
      { re: /Vue\.version/gmu, desc: "Vue.version → import { version } from 'vue'" },
      { re: /Vue\.compile/gmu, desc: "Vue.compile は削除" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/global-api-treeshaking.html",
  },
  {
    id: "data_object",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "data オブジェクト直書き",
    patterns: [
      { re: /\bdata\s*:\s*\{/gmu, desc: "data はオブジェクトではなく関数で返す必要がある" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/data-option.html",
  },
  {
    id: "transition_group_root",
    category: "Vue 2 廃止API",
    severity: "warning",
    label: "TransitionGroup ラッパー",
    patterns: [
      { re: /<transition-group(?![^>]*\btag\b)/gmu, desc: "transition-group に tag 属性が必要（デフォルトラッパーが廃止）" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/transition-group.html",
  },
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

  {
    id: "nuxt_component",
    category: "Nuxt 2 固有",
    severity: "error",
    label: "<Nuxt> / <NuxtChild>",
    patterns: [
      { re: /<Nuxt\s*\/?>/gmu, desc: "<Nuxt /> → <slot /> に変更（layouts内）" },
      { re: /<NuxtChild/gmu, desc: "<NuxtChild /> → <NuxtPage /> に変更" },
      { re: /<nuxt-child/gmu, desc: "<nuxt-child /> → <NuxtPage /> に変更" },
      { re: /<nuxt\s*\/?>/gmu, desc: "<nuxt /> → <slot /> に変更（layouts内）" },
    ],
    docs: "https://nuxt.com/docs/migration/pages-and-layouts",
  },
  {
    id: "watch_query",
    category: "Nuxt 2 固有",
    severity: "error",
    label: "watchQuery",
    patterns: [
      { re: /watchQuery\s*:/gmu, desc: "watchQuery は Nuxt 3 で廃止" },
      { re: /watchQuery\s*\(/gmu, desc: "watchQuery は Nuxt 3 で廃止" },
    ],
    docs: "https://nuxt.com/docs/migration/pages-and-layouts",
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
  {
    id: "this_router_route",
    category: "Nuxt 2 固有",
    severity: "warning",
    label: "this.$router / this.$route",
    patterns: [
      { re: /this\.\$router/gmu, desc: "this.$router → useRouter() に変更" },
      { re: /this\.\$route/gmu, desc: "this.$route → useRoute() に変更" },
    ],
    docs: "https://nuxt.com/docs/migration/plugins-and-middleware",
  },
  {
    id: "process_env",
    category: "Nuxt 2 固有",
    severity: "warning",
    label: "process.env",
    patterns: [
      { re: /process\.env\./gmu, desc: "process.env → useRuntimeConfig() に変更" },
    ],
    docs: "https://nuxt.com/docs/migration/configuration#runtime-config",
  },
  {
    id: "server_middleware",
    category: "Nuxt Config",
    severity: "warning",
    label: "serverMiddleware",
    patterns: [
      { re: /serverMiddleware\s*:/gmu, desc: "serverMiddleware → server/api/ ディレクトリに移行" },
    ],
    docs: "https://nuxt.com/docs/migration/server",
  },

  // ── Vue 2 変更（severity: info）──
  {
    id: "v_model_breaking",
    category: "Vue 2 廃止API",
    severity: "info",
    label: "v-model 変更",
    patterns: [
      { re: /v-model\.trim/gmu, desc: "v-model 修飾子の動作確認が必要" },
      { re: /:value\s*=.*@input\s*=/gmu, desc: "value/input パターン → v-model に統一可能" },
      { re: /model\s*:\s*\{\s*prop\s*:/gmu, desc: "model オプション → defineModel() に変更" },
    ],
    docs: "https://v3-migration.vuejs.org/breaking-changes/v-model.html",
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

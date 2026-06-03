exportqwfvcads  default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        $: "readonly",
        jQuery: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        MediaRecorder: "readonly",
        Blob: "readonly",
        URL: "readonly",
        requestAnimationFrame: "readonly",
      }
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": "warn",
      "no-var": "warn"
    }
  }
];

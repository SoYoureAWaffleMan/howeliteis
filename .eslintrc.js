
module.exports = {
  // parser: "babel-eslint",
  parserOptions: {
    "ecmaVersion": 6
  },
  extends: ["plugin:vue/base"],
  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'off',
    'no-prototype-builtins' : 'off',
  }
}



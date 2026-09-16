/** Generates typed RTK Query endpoints and hooks from the OpenAPI contract (ADR-5). */
module.exports = {
  schemaFile: '../api/openapi.yaml',
  apiFile: './src/api/baseApi.ts',
  apiImport: 'baseApi',
  outputFile: './src/api/generated.ts',
  exportName: 'generatedApi',
  hooks: true,
  tag: true,
};

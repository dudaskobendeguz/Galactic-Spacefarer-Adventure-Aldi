### useful commands(reminders)

- [init project](https://cap.cloud.sap/docs/get-started/#cds-init):
    ```bash
    cds init
    ```
- [init nodejs on project](https://cap.cloud.sap/docs/get-started/#cds-add):
    ```bash
    cds add nodejs
    ```
- [add typescript support](https://cap.cloud.sap/docs/node.js/typescript#enable-typescript-support) dev dependency:
    ```bash
    cds add typescript
    ```
- [add cds types](https://cap.cloud.sap/docs/node.js/typescript#cds-watch) dev dependency:
    ```bash
    npm add @cap-js/cds-types
    ```
- [run in dev mode](https://cap.cloud.sap/docs/node.js/typescript#cds-watch) (auto reload):
    ```bash
    npm run watch
    ```
- [compile](https://cap.cloud.sap/docs/guides/databases/cdl-to-ddl#using-cds-compile-):
    ```bash
    cds compile '*'
    ```
- [add data](https://cap.cloud.sap/docs/guides/databases/initial-data#using-cds-add-data):
    ```bash
    cds add data
    ```
- [querying data](https://cap.cloud.sap/docs/get-started/bookshop#querying-data):
    ```bash
    cds repl ./
    await SELECT `ROWS` .from `TABLE_NAME`
    ```

### Notes:
 
 - [] [generating-model-types-automatically](https://cap.cloud.sap/docs/node.js/typescript#generating-model-types-automatically)
 
## useful commands(reminders)

### Task-1 (db)
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
    npm run dev # runs cds watch locally; development profile config is applied by default ( --profile developement)
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
- [namespaces](https://cap.cloud.sap/docs/cds/cdl#namespaces)

### Task-2 (serivce\auth)

#### services:
- [services](https://cap.cloud.sap/docs/cds/cdl#services)
- [serving-crud](https://cap.cloud.sap/docs/guides/services/served-ootb#serving-crud)
- [CDS-Query-Language-(CQL)](https://cap.cloud.sap/docs/cds/cql)

#### auth:
- [auth-@restrict](https://cap.cloud.sap/docs/guides/security/authorization?impl-variant=node#restrict-annotation)
- [mock-users](https://cap.cloud.sap/docs/node.js/authentication#mock-users)

### Task-3 (service event handlers)

- [init()](https://cap.cloud.sap/docs/node.js/core-services#srv-init)
- [srv._on,_before,_after()](https://cap.cloud.sap/docs/node.js/core-services#srv-on-before-after)
### Notes:
 
 - [] [generating-model-types-automatically](https://cap.cloud.sap/docs/node.js/typescript#generating-model-types-automatically)
 - [inner-loop-development](https://cap.cloud.sap/docs/guides/integration/inner-loops#inner-loop-development) 
    - [in-memory-local-config](https://community.sap.com/t5/technology-blog-posts-by-members/sap-cap-lessons-learned-run-a-cap-app-using-sqlite-on-sap-btp-cloud-foundry/ba-p/13972594):
- [logger](https://cap.cloud.sap/docs/node.js/cds-log)
    - [debug-log](https://cap.cloud.sap/docs/node.js/cds-log#debug-env-variable)

 
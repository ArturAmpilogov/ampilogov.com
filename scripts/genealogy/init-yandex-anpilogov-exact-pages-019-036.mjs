#!/usr/bin/env node

import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "data/genealogy/searches/yandex-archive-anpilogov-exact-2026-09-12-pages-019-036.json");
const searchUrl = "https://yandex.ru/archive/search?text=%D0%90%D0%BD%D0%BF%D0%B8%D0%BB%D0%BE%D0%B3%D0%BE%D0%B2&dateFrom=1899&is_digitized=0&updateDate=0&searchZone=name%3Bsheet&rankMode=by_date&sortOrder=ascending&index=archive&excludeSeen=0";

const inventory = `
19|16538453-b3ee-4303-8afc-720ee7095712/56/ad29c7e5-0feb-4eee-9d64-f049300ded89,27be085a-fd36-49b6-b15b-c42ace31ef42/290/42c7b232-2324-4667-b40a-f97c0c25dc74,4ea045bc-8a32-4a9e-8e5b-f722cf38cb30/76/4e1f5f5a-6bcb-4e14-8fc0-1473a2d100fc,42cf3901-6956-423d-8e4b-18ee4aed8a29/70/aeec1e61-8c38-4b45-ba4d-aed8dcc86247,0da322c9-b95d-460a-af7d-edd3c7588ab3/52/ef69547b-cc64-43b5-aa54-d4df48ddcb39,4ce8e38d-d631-41c1-a61b-c1414a589b60/111/40d8d9ab-30b3-430c-b432-3f806a133d04,27be085a-fd36-49b6-b15b-c42ace31ef42/296/d263369c-df52-4331-9bf5-96a81806b5d5,8dc70350-9264-4091-b0a5-3a70d2fc574b/40/a5cd774f-efa4-4182-8e8e-a0a107d27279,9a70323f-9e29-4932-8cfa-8d5f450ea369/170/e1acb28b-5dfe-4951-bd43-fdc60f9f77f5,82e30e21-6e1c-4d70-9941-5e5fba9d44e5/261/06afabe7-8ed2-4eec-a1ea-e0cdbc7a148a
20|f393ef5a-b62b-41a7-b450-81bde893077d/4/dd3078f7-c1ab-47f4-a4f0-90b319a25084,22cbdc59-478e-47a3-ae72-f0f8067bacf0/171/62358375-1a3d-4790-9426-ae87fd0a5470,4752dfa4-92ef-44ef-b8ec-c2818aaba024/187/0c603ada-7313-4cc7-8c53-455b47062709,8dc70350-9264-4091-b0a5-3a70d2fc574b/40/a5cd774f-efa4-4182-8e8e-a0a107d27279,82e30e21-6e1c-4d70-9941-5e5fba9d44e5/303/53c3f9e5-72ad-408d-b62e-977598cfa630,9a70323f-9e29-4932-8cfa-8d5f450ea369/170/e1acb28b-5dfe-4951-bd43-fdc60f9f77f5,f393ef5a-b62b-41a7-b450-81bde893077d/5/5e457a3a-fa27-4b59-b44f-0915f1e30e52,20843122-e220-4a68-a4ca-477a06516b25/239/a44410ff-4873-4021-a566-3f1bb225a406,7a8e1f42-da53-48c5-86fb-08aec685c430/75/67fca485-1131-4306-86f8-debf14f1c2bf,757687da-690d-4d18-bb50-f2cfa736d20d/180/989043bf-c4ed-479c-bf4c-d944e4f3c0a7
21|f5d6d85e-0616-4e86-a4ed-d109d9400b3d/102/7554f03a-56f1-4daa-8ec8-ce3cc6f10dbe,7e87273c-d94d-439f-af68-63e228fdf585/74/0d5c9e69-8827-4a41-b131-02a63b023e9e,842f4aac-a383-422b-b432-171d2bf6faa2/8/0a266c72-65a1-450c-9a15-d808179c5613,f5d6d85e-0616-4e86-a4ed-d109d9400b3d/108/56460728-7c5e-4853-b301-cec87ace229a,c38ca73d-6f25-4dfa-bab0-80ee5dec1b40/175/d306a300-967a-4a48-bd0a-c732c60bc398,757687da-690d-4d18-bb50-f2cfa736d20d/70/e5058b97-13ad-487c-8c51-d6deeb0d7e60,0a9083cd-7a1b-46a2-b008-b4b5989962d8/185/cfd00d09-4565-4f55-a08a-21cc81217125,0a9083cd-7a1b-46a2-b008-b4b5989962d8/200/94038d65-53ba-4f00-98cc-1727da4460a3,7e87273c-d94d-439f-af68-63e228fdf585/196/72469e01-6b98-46a9-b025-a6c6a6adfb9a,0a9083cd-7a1b-46a2-b008-b4b5989962d8/19/01c3fbda-dce0-4914-8d55-7af0ed746b13
22|0a9083cd-7a1b-46a2-b008-b4b5989962d8/200/94038d65-53ba-4f00-98cc-1727da4460a3,0a9083cd-7a1b-46a2-b008-b4b5989962d8/185/cfd00d09-4565-4f55-a08a-21cc81217125,cea3d65f-8beb-480b-8206-936a3662e27a/211/5905a81a-d7a9-4d3b-bd39-9e8701bb235c,cea3d65f-8beb-480b-8206-936a3662e27a/263/9baf1349-4783-459e-bbe0-b1d42c5fad7a,5711fd8b-e180-4177-83a1-030d45742212/60/92e11267-1de4-41dd-af7c-1b02c8f0c026,0a9083cd-7a1b-46a2-b008-b4b5989962d8/28/a3bc8762-0feb-42a6-a49e-7f698f4845d8,5e81fddb-5d34-443e-9a39-3cd232bbf720/249/992676da-9486-4d43-a9af-2f692767df2c,9a705c7e-5bc3-4c21-ab2e-f74f18bdc88a/10/c11f11d8-52a1-4538-9a63-5232b9a867e1,9c59b6fb-ce56-4e99-88fc-e59e72a735e6/237/18c53a9d-116d-47f0-b9bb-1a46bb847157,0a9083cd-7a1b-46a2-b008-b4b5989962d8/174/5e009cdf-52c9-4f65-b7e6-2024811a8912
23|ad7634e2-b7eb-4191-bb63-b121a89ed00a/31/7ab3d29a-0dc4-46a8-a4b3-2211da8d6889,5ad6b506-d14e-44f6-a274-86155f0c7dd2/171/0bf8f2d2-f3c2-4952-8319-63e5f64e4ba8,9c59b6fb-ce56-4e99-88fc-e59e72a735e6/237/18c53a9d-116d-47f0-b9bb-1a46bb847157,978c224b-60ea-4c06-a2c1-e293969416bf/17/63489fc1-1ce1-4c21-b520-cca68f5ee16d,9a705c7e-5bc3-4c21-ab2e-f74f18bdc88a/91/a8a336f4-b93e-4634-bb8e-6b19ee524e19,74de0cd6-a28e-42f6-b572-dbc433ad47d3/229/4bcd1800-f73f-4fe5-acbe-a203b5d642d8,cb36f7f0-ba71-42b5-a9aa-94c41b455802/50/3b819737-74a5-483c-9954-f54d68702cc2,7e87273c-d94d-439f-af68-63e228fdf585/104/25759cd4-6e09-4b63-8444-3c51fa06d746,f5d6d85e-0616-4e86-a4ed-d109d9400b3d/105/9a01ba09-5ad2-4970-9d15-e0cef3e81be7,ad7634e2-b7eb-4191-bb63-b121a89ed00a/98/70b76ddd-6fbe-4c92-8f29-d0d0776d0890
24|bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/44/76f88816-852c-46c2-9047-f4508277dcd3,f163ed23-6885-4186-b0f8-1476d8ad9d91/157/b2081196-572a-4b97-9e00-29f70e194060,091e98a8-aace-48f5-8f6f-59270ca1264c/386/76c702ff-bb7d-4473-902e-c1b3e645ea18,3eab61d2-c260-4bb5-978f-bb49cb49e5c6/84/6a819eb3-51b4-4814-8145-4b5a3335a227,f163ed23-6885-4186-b0f8-1476d8ad9d91/125/6d767af3-20c1-4e08-91e6-5eb25a13842c,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/120/912f4f7e-0bb1-434f-af9a-bad016ca5a35,538d23ef-8154-4f58-8e59-27f172fb767f/36/273515ff-b08c-43b4-89e4-2c3bdc40772d,d7e022fa-e1de-4d65-b335-cec99be8a04b/334/92120dd1-9e6d-43ba-88a8-a573f0f92c51,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/111/c39ed8be-b5d8-4d7a-81b0-ddb063113855,b7cd23b2-3be0-4dff-81d3-9d53a0108ac9/123/780f2fb9-52a7-4f89-90a9-584261ce4f61
25|c7d63f79-f2e7-4aa0-9409-3ec0a07f2ba2/401/e8b08735-0303-4df9-b776-c5367f79c345,89cb51e6-aaae-492d-87d3-47061c611ea1/72/588932b2-7f5d-4262-a12c-81efe9aeafac,ba5775fd-49d9-4f98-88d8-7c79ee3995d5/180/5dbb8905-0ef2-4eb4-9e9b-14f37f128436,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/111/c39ed8be-b5d8-4d7a-81b0-ddb063113855,b7cd23b2-3be0-4dff-81d3-9d53a0108ac9/123/780f2fb9-52a7-4f89-90a9-584261ce4f61,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/143/cb4a751b-3e94-4ed6-ac58-2970651aac93,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/32/2dd2586b-b9b4-4851-b189-f9fbb9934d2b,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/23/bd39e0c9-ffb6-4570-ba09-17766dc393a6,4fa82a03-ce4e-46e6-a568-a52b0fded31f/61/e1640a45-96bb-495c-b1dd-cf67812ba27d,d7e022fa-e1de-4d65-b335-cec99be8a04b/337/cbea4dea-9a43-46f4-bbd3-ba453b65e68f
26|cf74185f-61dd-4e78-afa3-fa2e5b2e3a6b/116/ca7fa43f-64e3-4d43-8649-907d126f0c6a,f163ed23-6885-4186-b0f8-1476d8ad9d91/169/a9ca06e1-3157-489c-85e2-ab30dc4f7e20,0ad1de53-a3db-44b3-a28b-0e019ef1662c/9/9837fcab-442c-43cc-872b-10e54403bd93,7818f833-5654-40a7-a2eb-9d2431756d3e/36/78e56aaa-c7d3-4483-a86b-113c8ddd08c7,538d23ef-8154-4f58-8e59-27f172fb767f/16/2ddbe697-b616-4236-8fed-900229549fa9,bdcdaf6f-2f88-4fa1-8658-65cf185ddde1/91/0329a8e0-ce2d-4b6a-9351-7184bc7c7301,091e98a8-aace-48f5-8f6f-59270ca1264c/10/9a5dfdec-2b61-496d-a830-e61355014dbf,2d145d14-dc90-4ce1-a9ce-2e44ce85d517/202/90124e0a-82a9-4e53-99d0-2bf505c42501,1297ad9d-66c9-4954-ae06-979e26fc7499/65/c603bf84-20b5-4d3f-b5ab-d104311e7772,91a3175c-6586-408f-9a88-975208c4c753/97/982539ca-2209-4482-b3ae-f649f896ab69
27|091f31ab-78de-4aba-9a9e-4352ea6adacd/99/ea2d71e2-67f7-44cd-89f5-65dbc415b5d2,e6f7046a-7427-436d-b859-2439261a3434/202/c1142fe7-277f-4d91-96d4-c39e6b6ce38d,995932b6-f11b-4015-ad5d-5c842468512c/258/bdfd0b6e-98a6-4df5-92ad-2e9fe9923167,e6f7046a-7427-436d-b859-2439261a3434/210/ba1d2789-1635-497e-8577-5c431861a482,555b18b5-0fe8-4819-b2b6-427537fbf34d/65/82269826-6ef9-43a0-8704-b52121a15efc,c50fe6e6-7620-46b9-b3a4-553cce357c92/12/97407cf8-ee45-4f13-bf3f-4ce37d5fbb52,4dfceb9d-dad7-4006-b1be-c4f9b8bbe012/188/aff24370-5f58-4ee2-931e-f8ac9b57ce9e,c73f3f58-8bec-4129-a336-fbfd7c881f52/123/e0e4e3fe-7de9-43c3-ba2b-d26151bdaabe,e6f7046a-7427-436d-b859-2439261a3434/225/ffd9ce4f-3674-4d20-89ed-f8166bf74c31,1f82e4f4-3815-47d6-88f8-0eb4e20267dc/113/e4cd934a-8bc6-4574-83e5-9835aad46736
28|0822f5a2-cac0-40d2-a2f7-8d00e8c02f34/80/394c5b44-00f4-4b3c-a982-5ff6848641eb,e6f7046a-7427-436d-b859-2439261a3434/225/ffd9ce4f-3674-4d20-89ed-f8166bf74c31,4eb4df62-d520-40ff-bebe-86dd7806f9d5/80/99ca30c7-899e-4750-b58c-8c50cc04f2ed,e6f7046a-7427-436d-b859-2439261a3434/211/54f97c51-f09a-44e1-b9fb-75ec2c115803,1f82e4f4-3815-47d6-88f8-0eb4e20267dc/125/249da1a7-78d2-457b-b6d9-0c25c33f455a,555b18b5-0fe8-4819-b2b6-427537fbf34d/84/ab32a7ea-77f6-4fdc-8a08-8d4ac898a226,cc7aa759-2830-4410-af37-632f220b628a/64/ab2cd73f-e210-4e8e-b86f-b5253f9e9325,555b18b5-0fe8-4819-b2b6-427537fbf34d/210/7267628a-9f90-49db-b1fa-afc63824b629,1f82e4f4-3815-47d6-88f8-0eb4e20267dc/108/06e95574-416b-42ab-ae63-d6b2515409e7,1f82e4f4-3815-47d6-88f8-0eb4e20267dc/116/0e7aacd5-7b29-4082-858a-f652c30fef23
29|1f82e4f4-3815-47d6-88f8-0eb4e20267dc/108/06e95574-416b-42ab-ae63-d6b2515409e7,1f82e4f4-3815-47d6-88f8-0eb4e20267dc/116/0e7aacd5-7b29-4082-858a-f652c30fef23,46bda67c-d853-410f-915c-b0127503f89a/164/aa5a59fd-dc81-49d5-98a4-cddb61c0da57,e6f7046a-7427-436d-b859-2439261a3434/251/14eb9e85-df54-4a13-ab13-d7f6dfa453cb,555b18b5-0fe8-4819-b2b6-427537fbf34d/84/ab32a7ea-77f6-4fdc-8a08-8d4ac898a226,c73f3f58-8bec-4129-a336-fbfd7c881f52/157/1287f0a4-50bb-4b5f-b206-42b53bf69d9f,091f31ab-78de-4aba-9a9e-4352ea6adacd/85/e32febc8-f98c-415a-8f5e-feb0b7fbd98c,15efd518-9fc1-4118-a49f-88b47787a5df/224/a51d7a46-1359-46d2-8642-639562caa831,4eb4df62-d520-40ff-bebe-86dd7806f9d5/237/5b43b1fc-3eb8-465c-867a-933a4a4ccb78,4dfceb9d-dad7-4006-b1be-c4f9b8bbe012/245/c8acc7a0-019d-44be-a4a2-3ecfca1d0c93
30|4dfceb9d-dad7-4006-b1be-c4f9b8bbe012/245/c8acc7a0-019d-44be-a4a2-3ecfca1d0c93,555b18b5-0fe8-4819-b2b6-427537fbf34d/82/3776fff9-a8c0-49f3-af0b-854b81619b5c,995932b6-f11b-4015-ad5d-5c842468512c/127/257a36f9-f96d-4a89-a530-7d78162ae5f5,1f82e4f4-3815-47d6-88f8-0eb4e20267dc/117/7abd6d9d-bc64-4434-823c-94e059259226,f57e2871-756c-4ce5-8962-442ec58f0618/3/526de1b4-5566-4725-8b61-ded3b340d083,273b4447-d340-4ac9-aea1-6f6c684e862c/82/ac0fa12e-82b0-435c-a279-87e83f3e1a5d,5d2e0d26-f022-400b-a756-3f6952b2b80d/22/a39af387-9ecd-4f4f-b409-3d70b1cc2493,eed820e5-4f96-4566-882d-8e00cee351c2/311/0739409e-6dff-4ca2-a4f8-96d5c13c9f5b,339a739b-6a10-49a1-a510-69ce33ceb58c/194/14e6e071-ebf2-45b3-ac74-48a1da3f63ea,5da0a436-2b04-4dfb-8e49-8a7e04a98c87/321/9b54a3d0-98ac-4aeb-a1ec-485b30fb048d
31|eed820e5-4f96-4566-882d-8e00cee351c2/311/0739409e-6dff-4ca2-a4f8-96d5c13c9f5b,5da0a436-2b04-4dfb-8e49-8a7e04a98c87/368/dc7700a3-3e16-475f-919a-0caad472a04e,9325e442-89ed-4ab1-9856-7e9bf80059fa/160/f64786c7-0b0d-46c7-a8db-6549e5de9a84,43f3a50f-0f92-4f04-86f8-9cfdacc42eca/43/4ff719d0-0570-4d4e-9cff-a74c13cd8d31,9325e442-89ed-4ab1-9856-7e9bf80059fa/161/77aa943b-a96e-45fc-b21e-2ac7a5159ab2,9325e442-89ed-4ab1-9856-7e9bf80059fa/164/f9bcc0c9-556b-4098-8312-43908b642403,0ac8fa5d-78ec-4fbb-bd07-8f4e4642af40/78/8ddd56ff-0d1f-40be-8287-326411b2ca91,9325e442-89ed-4ab1-9856-7e9bf80059fa/147/127d4af0-7f81-4ca8-9546-ba58819a83b5,0ac8fa5d-78ec-4fbb-bd07-8f4e4642af40/117/8b33bd3e-952b-449b-ae1f-d04d4ef545ad,9325e442-89ed-4ab1-9856-7e9bf80059fa/152/8b7b929e-f008-4824-aa77-1d6c2bf6caca
32|9325e442-89ed-4ab1-9856-7e9bf80059fa/152/8b7b929e-f008-4824-aa77-1d6c2bf6caca,4335b03b-0013-4472-9bfc-cc3187bf58d2/41/ddc6a865-9fc7-462b-b60f-4ddbb2e3c031,50b37903-7c41-4f22-bb1c-3a8e80a11033/94/ad666365-8b7d-4f09-9199-4c5ef373605f,8c9c8c55-db32-4c81-900d-100ef01bc069/52/ddbf4458-8521-4751-8efd-426c15f770d1,eed820e5-4f96-4566-882d-8e00cee351c2/313/f92a3396-2eeb-436a-b7c4-91f9eb7db05a,eed820e5-4f96-4566-882d-8e00cee351c2/316/82825a0b-ab39-4484-8238-0cc64f7e15bc,27ba0f4c-e51b-4554-a26f-71709eb21a42/150/6386eb18-7824-4f68-869b-993c67cb03dc,ffb42c27-03ae-48c6-9b36-12ec72f48321/159/e7c012b7-b8ba-4cc0-8fd6-4ae35590e03a,27ba0f4c-e51b-4554-a26f-71709eb21a42/149/66a6de35-4573-4747-b0fb-7fb38370450a,c220a0fa-1a67-49f7-9665-24a9f7e46b37/116/c7f94fd2-4de8-4400-b003-1de1ae3d70c9
33|27ba0f4c-e51b-4554-a26f-71709eb21a42/150/6386eb18-7824-4f68-869b-993c67cb03dc,0c2ebc03-f4b2-4e98-b50b-c859b86ac6d5/221/59b13ce4-0c5b-4790-b289-55abf6cfcb57,c220a0fa-1a67-49f7-9665-24a9f7e46b37/116/c7f94fd2-4de8-4400-b003-1de1ae3d70c9,7f224ff9-f7ee-4530-b254-4bb9995498d8/215/79276cff-7176-45a5-9943-bb4d6c9d99d5,df4bcf8a-0b04-456e-a40e-0b56e433abf6/139/83bb84c9-2e27-4383-8ad4-5dc4cc8a845a,df4bcf8a-0b04-456e-a40e-0b56e433abf6/137/352c30b3-2215-4a51-b649-2700d029d6c2,df4bcf8a-0b04-456e-a40e-0b56e433abf6/143/fd777eeb-19b6-43d5-96b2-c30fffd5d508,df4bcf8a-0b04-456e-a40e-0b56e433abf6/128/9f270de9-69bb-4f34-83ab-a02973c4fa78,8bd1f854-2e09-4e5a-94c4-2090480b11a6/175/9456bbd6-47a6-47ad-9747-73b9e1a6aa0e,ffb42c27-03ae-48c6-9b36-12ec72f48321/156/351672a6-a60c-4c58-aac9-605009fc07c5
34|df4bcf8a-0b04-456e-a40e-0b56e433abf6/143/fd777eeb-19b6-43d5-96b2-c30fffd5d508,7f224ff9-f7ee-4530-b254-4bb9995498d8/215/79276cff-7176-45a5-9943-bb4d6c9d99d5,c220a0fa-1a67-49f7-9665-24a9f7e46b37/99/708c85c5-824d-4b31-8bb9-b4c730e062a6,df4bcf8a-0b04-456e-a40e-0b56e433abf6/151/88153da1-e1a4-4319-87a8-00c3a187cf3d,0ceba816-2e4b-4313-ad33-c1bb5a3e9b06/73/83758813-73f3-4fd3-b9fb-74955e301fa5,934c6966-4fdd-494b-b9e3-bf38fee3ad66/249/ab8daca6-a320-427b-9fd6-7f7e4bbe5df6,e3564821-fe73-4aa9-85ae-d19cc08b1c59/282/3c4216b9-3ede-47e9-b53f-48722d3bd24a,bb44c72c-b551-4ab6-b6e8-865169f12512/101/a5ca7a1a-46f4-4be0-b5a4-06c424c6ec7b,c220a0fa-1a67-49f7-9665-24a9f7e46b37/88/fb5843fa-88c9-423b-b7e0-d75523927f14,27ba0f4c-e51b-4554-a26f-71709eb21a42/146/25b2e71c-e29e-45f1-a3d7-b9061f6f04b6
35|0ceba816-2e4b-4313-ad33-c1bb5a3e9b06/73/83758813-73f3-4fd3-b9fb-74955e301fa5,ffb42c27-03ae-48c6-9b36-12ec72f48321/166/80836908-d6cc-4ebd-aa8e-aae8acc5f87c,df4bcf8a-0b04-456e-a40e-0b56e433abf6/136/57ecea7e-7ec1-4d94-b229-5ca61aaf4042,c220a0fa-1a67-49f7-9665-24a9f7e46b37/88/fb5843fa-88c9-423b-b7e0-d75523927f14,5776956e-1511-4f2d-8852-452c93821243/145/7319e3e0-7c7f-4df5-a3c1-7ddcc628b600,83f42c87-5271-4914-a95a-0a83325edf5d/165/28649bd9-ad4b-469d-82db-fdd3d74963a9,aa27f070-a8a7-459a-973d-860ac3b9e9a9/124/83db24a4-77c6-4c6d-854a-67adf404b542,82a34c0a-2e90-4319-8092-c6768cbfb13a/304/31ba9127-1299-4642-8b2d-c50a4e4dfbd2,ffb42c27-03ae-48c6-9b36-12ec72f48321/154/a7f79ff8-60d1-49b6-ab25-1be76735b1ff,0c2ebc03-f4b2-4e98-b50b-c859b86ac6d5/202/f1fa3a03-b48d-4195-8300-f1ed4192c60f
36|00064f77-a013-4042-9955-4d4681dc99ff/130/6969e5a3-0641-49ea-8ac2-e4b8ce7acd79,dad1f654-08b9-4f99-b67d-97df70c6a572/117/e785616c-b1a0-4873-85d9-fcdf197703e7,81e10a51-bc5c-4230-ae5a-cabd6aac3ea4/214/c395a4f9-956f-4678-9e00-388ec1c5c999,00064f77-a013-4042-9955-4d4681dc99ff/32/a33afbc6-5392-4b9e-b485-7ce14ccd4539,a18b44b7-5e87-4665-ba1b-2c22ec1d1315/238/2272b7e4-722b-4217-8d1e-82214be54421,a55b9929-ffa8-425d-a5c2-1d9c10c410ba/35/20a07797-8951-4320-9fc3-00c0f58c5105,15e9a58f-5499-48e7-8c26-d6c4d526a3ea/136/991df4b5-da1d-4fd2-b706-3a61942edfa7,00064f77-a013-4042-9955-4d4681dc99ff/116/b25f641a-307c-4012-ae2c-04389951f263,7100b775-d67e-4f12-b33f-8ba02150fc25/129/b8440b41-0c62-480d-abc9-55af97ac712c,547e2d58-9cf2-40e6-a76e-dead6f939f95/53/ad05e06d-0618-4415-b3f1-85c1abe58d0f
`.trim();

async function filesRecursive(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesRecursive(file);
    return entry.isFile() && entry.name.endsWith(".json") ? [file] : [];
  }))).flat();
}

function canonicalYandexUrl(value) {
  if (typeof value !== "string" || !value.includes("yandex.ru/archive/catalog/")) return null;
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`.replace(/\/$/, "");
  } catch { return null; }
}

function collectUrls(value, urls = new Set()) {
  if (typeof value === "string") {
    const url = canonicalYandexUrl(value);
    if (url) urls.add(url);
  } else if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, urls);
  } else if (value && typeof value === "object") {
    for (const item of Object.values(value)) collectUrls(item, urls);
  }
  return urls;
}

const sourcesByUrl = new Map();
for (const file of await filesRecursive(path.join(root, "data/genealogy/sources"))) {
  let source;
  try { source = JSON.parse(await readFile(file, "utf8")); } catch { continue; }
  if (!source.sourceId) continue;
  const evidencePaths = [source.evidence?.path]
    .concat(source.evidence?.fragments?.map((fragment) => fragment.path) ?? [])
    .filter(Boolean);
  for (const url of collectUrls(source)) {
    const linked = sourcesByUrl.get(url) ?? [];
    linked.push({
      sourceId: source.sourceId,
      sourceFile: path.relative(root, file),
      evidencePaths,
      isRecord: source.isRecord ?? null,
      publicCore: source.publicCore ?? null,
      documentOnlyVisuallyConfirmed: source.evidence?.quality?.documentOnlyVisuallyConfirmed === true,
      targetRowsVisuallyConfirmed: source.evidence?.quality?.targetRowsVisuallyConfirmed === true,
      legacyEvidenceConfirmed: source.evidence?.quality?.originalImageDownloaded === true
        && source.evidence?.quality?.headerAndTargetGeneratedFromOriginal === true
        && source.evidence?.quality?.targetCropLocatedFromTextCoordinates === true,
      reviewedNoMatch: source.review?.status === "primary-scan-reviewed-no-match",
    });
    sourcesByUrl.set(url, linked);
  }
}

const rows = inventory.split("\n").flatMap((line) => {
  const [pageText, entriesText] = line.split("|");
  const page = Number(pageText);
  return entriesText.split(",").map((entry, index) => {
    const [catalogId, scanNumberText, nodeId] = entry.split("/");
    const scanNumber = Number(scanNumberText);
    const documentUrl = `https://yandex.ru/archive/catalog/${catalogId}/${scanNumber}`;
    const linked = sourcesByUrl.get(documentUrl) ?? [];
    const visuallyConfirmed = linked.some((item) => (
      (item.documentOnlyVisuallyConfirmed && item.targetRowsVisuallyConfirmed)
      || item.legacyEvidenceConfirmed
      || item.reviewedNoMatch
    ) && item.evidencePaths.length >= 2);
    return {
      absolutePosition: (page - 1) * 10 + index + 1,
      page,
      position: index + 1,
      catalogId,
      scanNumber,
      nodeId,
      documentUrl,
      status: linked.length ? (visuallyConfirmed ? "existing-visually-confirmed" : "existing-needs-visual-audit") : "pending-new-source",
      sourceIds: [...new Set(linked.map((item) => item.sourceId))].sort(),
      sourceFiles: [...new Set(linked.map((item) => item.sourceFile))].sort(),
      evidencePaths: [...new Set(linked.flatMap((item) => item.evidencePaths))].sort(),
    };
  });
});

const seen = new Set();
for (const row of rows) {
  if (seen.has(row.documentUrl)) row.status = "duplicate-position-in-range";
  else seen.add(row.documentUrl);
}
const uniqueRows = rows.filter((row) => row.status !== "duplicate-position-in-range");
const pending = uniqueRows.filter((row) => row.status === "pending-new-source");
const needsAudit = uniqueRows.filter((row) => row.status === "existing-needs-visual-audit");
const manifest = {
  schemaVersion: 1,
  searchRunId: "yandex-archive-anpilogov-exact-2026-09-12-pages-019-036",
  status: pending.length || needsAudit.length ? "in-progress" : "complete",
  capturedAt: "2026-09-12",
  query: { text: "Анпилогов", dateFrom: 1899, isDigitized: false, index: "archive", searchZone: ["name", "sheet"], updateDate: false, rankMode: "by_date", sortOrder: "ascending", excludeSeen: false, url: searchUrl },
  liveSearch: { reportedResultCount: 724, reportedPageCount: 73, reviewedPageRange: [19, 36], rowsPerPage: 10 },
  policy: { manuallyReadPrimaryScans: true, yandexOcrUsedOnlyForNavigation: true, fullHeaderTargetEvidenceRequired: true, privateVercelBlobBackupRequired: true, publicCutoffYear: 1950 },
  progress: {
    pagesInventoried: 18,
    rowsFound: rows.length,
    uniqueScansInRange: uniqueRows.length,
    duplicatePositions: rows.length - uniqueRows.length,
    existingVisuallyConfirmed: uniqueRows.filter((row) => row.status === "existing-visually-confirmed").length,
    existingNeedsVisualAudit: needsAudit.length,
    pendingNewSources: pending.length,
  },
  pages: Array.from({ length: 18 }, (_, index) => {
    const page = index + 19;
    const pageRows = rows.filter((row) => row.page === page);
    return { page, reviewStatus: pageRows.every((row) => row.status === "existing-visually-confirmed" || row.status === "duplicate-position-in-range") ? "complete" : "in-progress", rows: pageRows.length, uniqueScans: new Set(pageRows.map((row) => row.documentUrl)).size, refs: pageRows.map((row) => `${row.catalogId}/${row.scanNumber}`) };
  }),
  results: rows,
};

await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest.progress));
for (const row of [...needsAudit, ...pending]) console.log(`${row.status}\t${row.page}:${row.position}\t${row.catalogId}/${row.scanNumber}\t${row.sourceIds.join(",")}`);

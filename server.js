require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');

dotenv.config();

const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');
const getSubscriptionUrl = require('./server/getSubscriptionUrl');
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST } = process.env;

//Add the app to your server file
app.prepare().then(() => {
    //Add your routing middleware and koa server
    const server = new Koa();
    const router = new Router();
    server.use(session({ secure: true, sameSite: 'none' }, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];

    //Add the createShopifyAuth middleware
    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            scopes: ['read_products', 'write_products'],
            async afterAuth(ctx) {
                const { shop, accessToken } = ctx.session;
                ctx.cookies.set('shopOrigin', shop, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });
                console.log("ctx.session");
                console.log(ctx.session);
                console.log("ctx.session");

                const registration = await registerWebhook({
                    address: `${HOST}/webhooks/products/create`,
                    topic: 'PRODUCTS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October19
                });

                if (registration.success) {
                    console.log("===================product create==========================");
                    console.log(registration);
                    console.log("===================product create==========================");
                    console.log('Successfully registered webhook!');
                } else {
                    console.log('Failed to register webhook', registration.result);
                }

                const productUpdate = await registerWebhook({
                    address: `${HOST}/webhooks/products/update`,
                    topic: 'PRODUCTS_UPDATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October19
                });

                if (productUpdate.success) {
                    console.log("===================product updation==========================");
                    console.log(productUpdate);
                    console.log("===================product updation==========================");
                    console.log('Successfully product Update webhook!');
                } else {
                    console.log('Failed to register webhook', productUpdate.result);
                }

                const productDelete = await registerWebhook({
                    address: `${HOST}/webhooks/products/delete`,
                    topic: 'PRODUCTS_DELETE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October19
                });

                if (productDelete.success) {
                    console.log("===================product delete==========================");
                    console.log(productDelete);
                    console.log("===================product delete==========================");
                    console.log('Successfully product delete webhook!');
                } else {
                    console.log('Failed to register webhook', productUpdate.result);
                }

                //ctx.redirect('/');
                await getSubscriptionUrl(ctx, accessToken, shop);
            },
        }),
    );

    const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });

    router.post('/webhooks/products/create', webhook, (ctx) => {
        console.log("webhook product create------------------------------------");
        console.log(webhook);
        console.log('received webhook: ', ctx.state.webhook);
        console.log("webhook product create------------------------------------");
    });

    router.post('/webhooks/products/update', webhook, (ctx) => {
        console.log("webhook product update***************************************");
        console.log(webhook);
        console.log('received webhook: ', ctx.state.webhook);
        console.log("webhook product update***************************************");
    });

    router.post('/webhooks/products/delete', webhook, (ctx) => {
        console.log("webhook product delete~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
        console.log(webhook);
        console.log('received webhook: ', ctx.state.webhook);
        console.log("webhook product delete~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    });

    //graphQLProxy middleware
    server.use(graphQLProxy({ version: ApiVersion.October19 }));

    //verifyRequest middleware
    // server.use(verifyRequest());

    // server.use(async (ctx) => {
    //     await handle(ctx.req, ctx.res);
    //     ctx.respond = false;
    //     ctx.res.statusCode = 200;
    //     return
    // });

    router.get('*', verifyRequest(), async (ctx) => {
        // console.log("==================response =====================");
        // console.log(ctx.res);
        // console.log("==================response =====================");
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    });
    server.use(router.allowedMethods());
    server.use(router.routes());

    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});

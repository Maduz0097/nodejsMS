const ROUTES = [
    {
        url: '/auth',
        proxy: {
            target: "http://localhost:3001",
            changeOrigin: true,
            pathRewrite: {
                [`^/auth`]: '',
            },
        }
    },
    {
        url: '/item',
        proxy: {
            target: "http://localhost:3002",
            changeOrigin: true,
            pathRewrite: {
                [`^/item`]: '',
            },
        }
    },
    {
        url: '/order',
        proxy: {
            target: "http://localhost:3003",
            changeOrigin: true,
            pathRewrite: {
                [`^/order`]: '',
            },
        }
    }
]

exports.ROUTES = ROUTES;
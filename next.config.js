module.exports = {
    async headers() {
        return [
            {
                source: "/api/:path*", // Apply to all API routes
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "http://localhost:8081" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
                ],
            },
        ];
    },
}
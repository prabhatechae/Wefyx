export default {
  server: {
    proxy: {
      "/api": {
        // Use IPv4 explicitly: on Windows, `localhost` can try both ::1 and
        // 127.0.0.1, which makes a stopped API appear as an AggregateError.
        // The Spring Boot application listens on 8080 by default (see
        // backend/src/main/resources/application.yml). Pointing Vite at 8081
        // made every registration request fail with a 502 when no override
        // was supplied.
        target: process.env.VITE_API_PROXY_TARGET || "http://127.0.0.1:8080",
        changeOrigin: true,
      },
    },
  },
};

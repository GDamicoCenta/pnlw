

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/market/proxy/intraday",
        destination: "http://50.17.242.174:8122/get_data_intraday",
      },
      {
        source: "/api/market/proxy/last",
        destination: "http://50.17.242.174:8122/get_data_ultimas",
      }, 
      {
        source: "/api/market/proxy/crypto",
        destination: "http://50.17.242.174:8122/get_data_crypto",
      },
      {
        source: "/api/market/proxy/pendientes",
        destination: "http://50.17.242.174:8122/get_data_pendientes",
      },
    ];
  },
};

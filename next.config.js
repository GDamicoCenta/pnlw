

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
    ];
  },
};

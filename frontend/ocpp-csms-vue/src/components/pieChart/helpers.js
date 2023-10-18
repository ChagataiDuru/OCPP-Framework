export const CHART_CONF = {
  headers: ["", ""],
  options: {
    pieHole: 0.4,
    colors: [],
    legend: "right",
  },
  initialize(options) {
    Object.assign(this.options, options);
  },
  updateData(chartData, counters, colors) {
    chartData.value = [this.headers];
    for (let pkey in colors) {
      for (let rkey in counters) {
        if (pkey === rkey) {
          chartData.value.push([pkey, counters[rkey]]);
        }
      }
    }
  },
};

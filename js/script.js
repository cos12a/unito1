
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
//     // 注册成功
//     console.log('Service Worker 注册成功:', registration);
//   }).catch(function(error) {
//     // 注册失败
//     console.error('Service Worker 注册失败:', error);
//   });
// }

// main.js (在你的主页面脚本中)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
              console.log('Service Worker registered:', registration);
          })
          .catch(error => {
              console.log('Service Worker registration failed:', error);
          });
  });
}


// 初始图表数据
const gaugeData = [
  // ...（省略原始数据，与问题中的相同）
  {
    value: 0,
    name: "冷水温度",
    itemStyle: {
      // 添加这一行来定义'Good'指针的颜色
      color: "blue",
      // width: 80
    },
    title: {
      offsetCenter: ["-40%", "80%"],
    },
    detail: {
      offsetCenter: ["-40%", "95%"],
    },
  },
  {
    value: 0,
    name: "热水温度",
    itemStyle: {
      // 添加这一行来定义'Good'指针的颜色
      color: "red",
      //   width: 80
    },
    title: {
      offsetCenter: ["40%", "80%"],
    },
    detail: {
      offsetCenter: ["40%", "95%"],
    },
  },
];

// 初始化ECharts图表
const myChart = echarts.init(document.getElementById("gaugeChart"));

// 准备图表配置项
const option = {
  // ...（省略原始配置项，与问题中的相同）
  title: {
    text: "当前温度",
  },
  series: [
    {
      type: "gauge",
      anchor: {
        show: true,
        showAbove: true,
        size: 18,
        itemStyle: {
          color: "#FAC858",
        },
      },
      pointer: {
        icon: "path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z",
        width: 8,
        length: "80%",
        offsetCenter: [0, "8%"],
      },
      progress: {
        show: true,
        overlap: true,
        roundCap: true,
        width: 20,
      },
      axisLine: {
        roundCap: true,
      },
      data: gaugeData,
      title: {
        fontSize: 20,
      },
      detail: {
        width: 80,
        height: 28,
        fontSize: 24,
        color: "#fff",
        backgroundColor: "inherit",
        borderRadius: 8,
        formatter: "{value}°C",
      },
    },
  ],
};

// 初始化ECharts图表
const myChart2 = echarts.init(document.getElementById("timeChart"));

let data = [];
let data2 = [];

// 初始化图表配置
let option2 = {
  title: {
    text: "温度曲线图",
  },

  xAxis: {
    type: "time",
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: "value",
    boundaryGap: [0, "50%"],
    splitLine: {
      show: false,
    },
  },
  series: [
    {
      name: "Line 1",
      type: "line",
      showSymbol: false,
      smooth: true, // 设置为 true 即可显示曲线
      hoverAnimation: false,
      color: "blue",
      data: data,
    },
    {
      name: "Line 2",
      type: "line",
      showSymbol: false,
      smooth: true, // 设置为 true 即可显示曲线
      hoverAnimation: false,
      color: "red",
      data: data2,
    },
  ],
};
// 使用准备好的配置项和数据显示图表
myChart.setOption(option);
myChart2.setOption(option2);

// // 获取 Canvas 元素
const canvas = document.getElementById("mycanvas");
// 创建 Smoothie 图表实例
const smoothie = new SmoothieChart();
const line1 = new TimeSeries();
const line2 = new TimeSeries();
// 配置 Smoothie 图表
smoothie.addTimeSeries(line1, { lineWidth: 3, strokeStyle: "blue" });
smoothie.addTimeSeries(line2, { lineWidth: 3, strokeStyle: "red" });
// 开始更新图表
smoothie.streamTo(canvas, 2000); // 更新频率为每秒一次

let base = +new Date();
function updateData(val1, val2) {
  const now = new Date((base += 1000)); // 每隔一秒添加一个新的数据点

  data.push({
    name: now.toString(),
    value: [now, val1],
  });
  data2.push({
    name: now.toString(),
    value: [now, val2],
  });
  // 仅保留最近的 50 个数据
  if (data.length > 30) {
    data.shift();
    data2.shift();
  }
  myChart2.setOption({
    series: [
      {
        data: data,
      },
      {
        data: data2,
      },
    ],
  });

  line1.append(Date.now(), val1);
  line2.append(Date.now(), val2);
}
updateData(0, 0);
// 创建WebSocket连接

let socket = null;
let wsTime;

// 重新连接 WebSocket
function reconnect() {
  console.log("尝试重新连接 WebSocket...");
  if (socket !== null && socket.readyState !== WebSocket.CLOSED) {
    socket.close();
    socket = null;
  }
  createWebSocket();
}

// 定时检测 WebSocket 连接状态的函数
function checkWebSocketStatus() {
  console.log(`当前 WebSocket 连接状态: ${socket.readyState}`);
  switch (socket.readyState) {
    case WebSocket.CONNECTING:
      console.log("WebSocket 正在连接...");
      break;
    case WebSocket.OPEN:
      console.log("WebSocket 状态检测连接的");
      break;
    case WebSocket.CLOSING:
      console.log("WebSocket 正在关闭...");
      break;
    case WebSocket.CLOSED:
      console.log("WebSocket 已关闭");
      // 尝试重新连接
      console.log("尝试重新连接 WebSocket...");
      reconnect();
      break;
    default:
      console.error("未知的 WebSocket 状态");
      reconnect();
      break;
  }
}

function startTimer(callback) {
  let count = 0;
  const intervalId = setInterval(function () {
    count++;
    console.log(`执行定时器，count=${count} 次`);
    if (callback && typeof callback === "function") {
      callback(); // 执行回调函数
    }
  }, 5000); // 每5秒执行一次
  // 返回 intervalId，以便需要时可以清除定时器
  return intervalId;
}

function createWebSocket() {
  // let location = window.location.hostname;
  // let port = window.location.port;
  console.log("连接websocket...");
  let location = "localhost";
  let port = "3000";
  // document.addEventListener("visibilitychange", handleVisibilityChange, false);

  try {
    // socket = new WebSocket("ws://" + location + "/ws");
    if (port != "" || port != 80 || port != 443) {
      console.log("连接带端口的");
      socket = new WebSocket("ws://" + location + ":" + port + "/ws");
    } else {
      console.log("连接没有端口的");
      socket = new WebSocket("ws://" + location + "/ws");
    }
  } catch (exception) {
    console.error(exception);
  }
  socket.addEventListener("message", messageEventHandler);
  // 监听WebSocket连接打开事件
  socket.addEventListener("open", function (event) {
    console.log("WebSocket 连接已开启。");
    wsTime = startTimer(checkWebSocketStatus);
  });
  // 监听WebSocket错误事件
  socket.addEventListener("error", function (event) {
    console.error("WebSocket 连接发生错误:", event);
    // reconnect();
  });

  // 监听WebSocket关闭事件
  socket.addEventListener("close", function (event) {
    console.log("WebSocket 连接已关闭。");
    // reconnect();
  });
}

// document.addEventListener("DOMContentLoaded", function () {
// 在这里编写你的事件监听器和其他操作
createWebSocket();
// 监听WebSocket消息事件
// socket.addEventListener("message", function (event)
function messageEventHandler(event) {
  console.log(`接收数据: ${event.data}`);
  try {
    JSON.parse(event.data);
  } catch (Event) {
    console.error(Event);
    console.info("start the update over again");
    return;
  }
  const newData = JSON.parse(event.data);
  // 假设服务器发送的数据格式为JSON数组
  gaugeData.forEach((item, index) => {
    gaugeData[index].value = newData[index];
  });

  // 更新图表数据
  myChart.setOption({
    series: [
      {
        data: gaugeData,
      },
    ],
  });
  // 更新图表
  updateData(newData[0], newData[1]);
}
// document.visibilityState 属性可以告诉你页面当前的可见性状态，可能的取值有：
// 'visible'：页面当前处于活动状态，即用户正在查看页面。
// 'hidden'：页面当前处于非活动状态，即页面不在用户的视野中（例如用户切换到了其他标签页或者最小化了浏览器）。
// 'prerender'：页面处于预渲染状态，即页面正在加载但并未完全显示给用户。
// 页面可见状态变化监听
document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden") {
    // 页面离开时执行的操作
    console.log("页面离开，关闭 WebSocket");
    clearInterval(wsTime);
    if (socket !== null && socket.readyState !== WebSocket.CLOSED) {
      socket.close();
      socket = null;
    }
  } else {
    // 页面进入时执行的操作
    console.log("页面进入，重新连接 WebSocket");
    reconnect();
  }
});
// });

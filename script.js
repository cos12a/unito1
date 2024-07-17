// 获取页面元素
const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");
const receivedText = document.getElementById("receivedText");
const sendText = document.getElementById("sendText");
const sendButton = document.getElementById("sendButton");

let port;
let reader;
// 循环读取串口数据
async function readLoop(reader) {
  try {
    while (true && port.open) {
      const { value, done } = await reader.read();
      if (done) {
        console.log("Read operation done");
        reader.releaseLock();
        break;
      }
      if (value) {
        const decoder = new TextDecoder();
        console.log("Received data:", decoder.decode(value));
        receivedText.value += decoder.decode(value);
      }
    }
  } catch (err) {
    console.log("Error reading from serial port:", err);
    // port.onFail();
  } finally {
    reader.releaseLock();
    // return;
  }
  console.log("这里是不是又退出了一次");
  //   port.close();
}

// 连接到串口设备
connectButton.addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 9600 }); // 设置波特率

    connectButton.disabled = true;
    disconnectButton.disabled = false;
    // port.onSuccess();
    // 监听串口数据
    reader = port.readable.getReader();
    readLoop(reader);
  } catch (err) {
    console.error("没有选择打开串口号:", err);
  } finally {
    console.log("串口打开成功");
  }
});

// 停止读取操作
async function stopReading() {
  try {
    if (port && port.readable) {
      if (reader) {
        reader.releaseLock();
        reader = null;
      }
      await port.readableStreamClosed;
      await port.readable.cancel();

      console.log("Read operation cancelled successfully.");
    }
  } catch (error) {
    console.error("Error stopping reading:", error);
  }
}
// 关闭串口连接
async function closePort() {
  if (port && port.readable) {
    await stopReading(); // 停止读取操作
    if (port && port.readable) {
      try {
        // 检查读取器和写入器是否已关闭
        // if (
        //   port.readable.getReader().closed &&
        //   port.writable.getWriter().closed
        // ) {
        //   console.log("Reader and writer are both closed");
        // }
        await port.close();
        console.log("Port closed successfully!");
        // 清除事件监听器
        port.onReceive = null;
        port.onDataReceived = null;
        port.onError = null;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      } catch (error) {
        console.error("Error closing port:", error);
      }
    }
  } else {
    console.warn("Port is not open or not readable.");
  }
}
disconnectButton.addEventListener("click", closePort);

// 发送数据到串口
sendButton.addEventListener("click", async () => {
  if (port && port.writable) {
    const writer = port.writable.getWriter();
    const encoder = new TextEncoder();
    const data = encoder.encode(sendText.value + "\n");
    try {
      // 使用 writer 的 write 方法发送数据
      await writer.write(data);
      console.log("Data sent successfully");
    } catch (error) {
      console.error("Error sending data:", error);
    } finally {
      // 发送完成后，你可能需要释放 writer
      writer.releaseLock();
    }
  }
});

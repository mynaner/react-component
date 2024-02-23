/*
 * @Date: 2024-02-23 14:26:11
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-23 14:26:14
 * @FilePath: /yzt-react-component/src/components/utils.ts
 */

import dayjs from "dayjs";
import { isString } from "lodash";

/**
 * @description: 创建blob对象，并利用浏览器打开url进行下载
 * @param {string} name
 * @param {BlobPart} data
 * @return {*}
 */
export const downloadFile = (
  name: string = "未知",
  data: BlobPart | string,
  suffix?: "xlsx" | "zip"
) => {
  // 下载类型 xls
  let downloadLink = document.createElement("a");
  if (isString(data)) {
    downloadLink.href = data;
  } else {
    downloadLink.href = window.URL.createObjectURL(
      new Blob([data], { type: "application/ms-excel" })
    );
  }
  downloadLink.setAttribute(
    "download",
    name + dayjs().format("YYYY-MM-DD HH:mm:ss") + "." + (suffix ?? "xlsx")
  );
  document.body.appendChild(downloadLink);
  downloadLink.click();
};

/*
 * @Date: 2024-02-07 17:48:19
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-23 14:26:42
 * @FilePath: /yzt-react-component/src/components/ExportButton/index.tsx
 */
import { isArrayBuffer, isBuffer } from "lodash";
import { Button, ButtonProps, message } from "antd";
import { VerticalAlignBottomOutlined } from "@ant-design/icons";
import { downloadFile } from "../utils";

interface YExportButtonProps<T> extends ButtonProps {
  exportFunc: (params?: T) => Promise<ArrayBuffer | null>;
  formState?: T;
  title?: string;
}
interface Paging {
  pageNum?: number;
  pageSize?: number;
}

export const ExportButton = <T extends object>({
  exportFunc,
  formState,
  title,
  icon,
  ...props
}: YExportButtonProps<T>) => {
  const [messageApi, contextHolder] = message.useMessage();
  /// 导出excel表格
  const onExport = async () => {
    const key = exportFunc.name;
    messageApi.open({
      key,
      type: "loading",
      content: "下载中,请稍后...",
      duration: 0,
    });
    const { pageNum, pageSize, ...data } = (formState ?? {}) as T & Paging;
    const res = await exportFunc(data as T);
    if (res && (isBuffer(res) || isArrayBuffer(res))) {
      downloadFile(title, res);
      messageApi.open({
        key,
        type: "success",
        content: "下载成功",
        duration: 2,
      });
    } else {
      messageApi.open({ key, type: "error", content: "下载失败", duration: 2 });
    }
  };

  return (
    <div>
      {contextHolder}
      <Button
        type="primary"
        onClick={onExport}
        icon={icon ?? <VerticalAlignBottomOutlined />}
        {...props}
      >
        {props.children ?? "Excel导出"}
      </Button>
    </div>
  );
};

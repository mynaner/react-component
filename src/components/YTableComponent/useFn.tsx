/*
 * @Date: 2022-11-24 22:16:52
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-23 11:10:10
 * @FilePath: /yzt-react-component/src/components/YTableComponent/useFn.tsx
 */
import { Tooltip, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { YColumnGroupType, YColumnsType } from ".";
import { MsgType } from "../types/index";
import { FC } from "react";
import { TooltipTitleComponent } from "../TooltipTitleComponent";

export const columnTypefn = <T,>(columns: YColumnsType<T>): ColumnsType<T> => {
  return columns
    .filter((e) => e.auth != false || e.show)
    .map((item) => {
      const { textType, ...res } = item as YColumnGroupType<T>;
      if (res.children) res.children = columnTypefn(res.children);
      if (res.render) return res;
      const ellipsis = !!res.ellipsis;
      if (textType == "money") {
        res.render = (val) => {
          const str = `${(val ?? 0) / 100}元`;
          return <EenderChild ellipsis={ellipsis} str={str} />;
        };
      } else if (textType == "msgType") {
        res.render = (msg: MsgType) => {
          const str = msg?.node ?? "--";
          return <EenderChild ellipsis={ellipsis} str={str} />;
        };
      } else if (textType == "num") {
        res.render = (val) => val ?? 0;
      } else if (textType == "null") {
        res.render = (val: string) => {
          if (!val) return "--";
          return <EenderChild ellipsis={ellipsis} str={val} />;
        };
      } else if (textType == "copy") {
        res.render = (val: string) => {
          if (!val) return "--";
          return (
            <EenderChild ellipsis={ellipsis} str={val}>
              <Typography.Paragraph ellipsis copyable>
                {val}
              </Typography.Paragraph>
            </EenderChild>
          );
        };
      } else if (ellipsis) {
        res.render = (val: string) => {
          if (!val) return "--";
          return <EenderChild ellipsis={ellipsis} str={val} />;
        };
      }

      if (res.tip) {
        res.title = <TooltipTitleComponent title={res.title} tip={res.tip} />;
      }
      return res;
    });
};

const EenderChild: FC<{
  ellipsis?: boolean;
  str: string;
  children?: JSX.Element;
}> = ({ ellipsis, str, children }) => {
  if (ellipsis) {
    return (
      <Tooltip placement="topLeft" title={str}>
        {children ?? str}
      </Tooltip>
    );
  }
  return children ?? str;
};

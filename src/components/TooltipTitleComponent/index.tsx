import { QuestionCircleOutlined } from "@ant-design/icons";
import { Tooltip } from "antd";
import { ColumnTitle } from "antd/lib/table/interface";

/*
 * @Date: 2023-11-18 11:46:30
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-23 11:14:54
 * @FilePath: /yzt-react-component/src/components/TooltipTitleComponent/index.tsx
 */
export interface TooltipTitleProps {
  title: ColumnTitle<any>;
  tip: string;
}

export const TooltipTitleComponent: React.FC<TooltipTitleProps> = (props) => {
  const { title, tip } = props;
  const style = { cursor: "pointer", color: "gray", marginLeft: "2px" };

  return (
    <Tooltip title={tip}>
      <>{title}</>
      <QuestionCircleOutlined style={style} />
    </Tooltip>
  );
};

/*
 * @Date: 2023-11-20 15:28:04
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-03-01 14:08:14
 * @FilePath: /yzt-react-component/src/components/TypographyLinkComponent/index.tsx
 */

import { App, Typography } from "antd";
import { LegacyButtonType } from "antd/es/button/button";
import { LinkProps } from "antd/es/typography/Link";
export interface TypographyLinkComponentProps<P>
  extends Partial<Omit<LinkProps, "onClick">> {
  /// 选择 数据的时候会执行,并传入选中的结果 和选中的数据
  onReset?: () => void;
  /// getTreeFn 的参数
  params?: P;
  /// getTreeFn 请求树结构的方法
  actionFn?: (params?: P) => Promise<boolean>;
  /// 提示语句
  modalContent?: React.ReactNode;
  modalOkType?: LegacyButtonType;
  modalSuccessMsg?: string;
}

export const TypographyLinkComponent = <P extends object>(
  props: TypographyLinkComponentProps<P>
) => {
  const {
    onReset,
    params,
    actionFn,
    modalContent,
    modalSuccessMsg,
    modalOkType,
    ...res
  } = props;

  const { modal, message } = App.useApp();

  const onClick = () => {
    if (!actionFn) {
      message.error("请传入接口函数");
    }
    modal.confirm({
      title: "温馨提示",
      content: modalContent,
      okType: modalOkType,
      onOk: async () => {
        const res = await actionFn?.(params);
        if (res) {
          message.success(modalSuccessMsg ?? "操作成功");
          onReset?.();
        }
      },
    });
  };

  return <Typography.Link onClick={onClick} {...res} />;
};

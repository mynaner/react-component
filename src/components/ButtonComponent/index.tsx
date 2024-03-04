/*
 * @Date: 2023-11-20 15:28:04
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-03-01 14:18:48
 * @FilePath: /yzt-react-component/src/components/ButtonComponent/index.tsx
 */

import { useBoolean } from "ahooks";
import { App, Button, ButtonProps } from "antd";
import { LegacyButtonType } from "antd/es/button/button";
export interface ButtonComponentProps<P>
  extends Partial<Omit<ButtonProps, "loading" | "onClick">> {
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

export const ButtonComponent = <P extends object>(
  props: ButtonComponentProps<P>
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

  const [loading, setLoading] = useBoolean();

  const onClick = () => {
    if (!actionFn) {
      message.error("请传入接口函数");
    }
    modal.confirm({
      title: "温馨提示",
      content: modalContent,
      okType: modalOkType,
      onOk: async () => {
        setLoading.setTrue();
        try {
          const res = await actionFn?.(params);
          if (res) {
            message.success(modalSuccessMsg ?? "操作成功");
            onReset?.();
          }
        } finally {
          setLoading.setFalse();
        }
      },
    });
  };

  return <Button loading={loading} onClick={onClick} {...res} />;
};

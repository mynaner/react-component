/*
 * @Date: 2023-11-20 15:28:04
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-03-01 11:09:03
 * @FilePath: /yzt-react-component/src/components/SwitchComponent/index.tsx
 */

import { useBoolean } from "ahooks";
import { App, Switch, SwitchProps } from "antd";
import { isFunction } from "lodash";
interface SwitchComponentProps<P>
  extends Partial<Omit<SwitchProps, "loading" | "onChange">> {
  /// 选择切换成功后刷新用
  onReset: () => void;
  /// 自定义提示语句
  content?: string;
  /// 参数
  params?: P | ((e: boolean) => P);
  /// 方法
  switchFn?: (params?: P) => Promise<boolean>;
}

export const SwitchComponent = <P extends object>(
  props: SwitchComponentProps<P>
) => {
  const { onReset, content, switchFn, params, ...res } = props;
  const { modal, message } = App.useApp();
  const [loading, setLoading] = useBoolean();

  const onChange = (e: boolean) => {
    if (!switchFn) {
      message.error("请传入接口函数");
    }
    modal.confirm({
      title: "温馨提示",
      content: content ?? `是否切换?`,
      okType: "danger",
      onOk: async () => {
        try {
          setLoading.setTrue();
          const res = await switchFn?.(isFunction(params) ? params(e) : params);
          if (res) {
            message.success("操作成功");
            onReset();
          }
        } finally {
          setLoading.setFalse();
        }
      },
    });
  };

  return <Switch loading={loading} onChange={onChange} {...res} />;
};

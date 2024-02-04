/*
 * @Description:
 * @Version: 1.0
 * @Author: Knight
 * @Date: 2024-01-03 17:00:48
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-03 15:19:13
 */
import { InputNumber, InputNumberProps } from "antd";
import { FC } from "react";

export const MoneyInputComponent: FC<InputNumberProps<number>> = (props) => {
  const { value, onChange, ...args } = props;

  const _onChange = (value: number | null) => {
    onChange?.(value ? value * 100 : value);
  };

  return (
    <InputNumber
      value={value ? value / 100 : value}
      onChange={_onChange}
      {...args}
    />
  );
};

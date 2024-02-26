/*
 * @Description:
 * @Version: 1.0
 * @Author: Knight
 * @Date: 2024-01-03 17:00:48
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-26 16:42:55
 */
import { InputNumber, InputNumberProps } from "antd";
import { FC } from "react";

export const MoneyInputComponent: FC<InputNumberProps<number>> = (props) => {
  return (
    <InputNumber<number>
      min={0}
      formatter={(value) => `${(value ?? 0) / 100}`}
      parser={(value) => (Number(value) ?? 0) * 100}
      {...props}
    />
  );
};

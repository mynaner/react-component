/*
 * @Date: 2022-11-24 16:11:50
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-03 10:34:55
 * @FilePath: /yzt-react-component/src/components/DatePickerComponent/index.tsx
 */
import { DatePicker, DatePickerProps } from "antd";
import { FC } from "react";
import dayjs from "dayjs";
export const DatePickerComponent: FC<DatePickerProps> = (props) => {
  const disabledDate = (current: dayjs.Dayjs) =>
    current && current > dayjs().endOf("day");
  return (
    <DatePicker disabledDate={props.disabledDate ?? disabledDate} {...props} />
  );
};

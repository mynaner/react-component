/*
 * @Date: 2022-11-24 16:11:50
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-07-23 17:34:50
 * @FilePath: /yzt-react-component/src/components/DatePickerRangePickerComponent/index.tsx
 */
import { DatePicker } from "antd";
import { RangePickerProps } from "antd/lib/date-picker/index";
import { FC, useMemo } from "react";
import dayjs from "dayjs";

export const DatePickerRangePickerComponent: FC<RangePickerProps> = (props) => {
  const disabledDate = (current: dayjs.Dayjs) =>
    current && current > dayjs().endOf("day");
  const presets: RangePickerProps["presets"] = useMemo(() => {
    switch (props?.picker) {
      case "year":
        return [
          { label: "今年", value: [dayjs().startOf("years"), dayjs()] },
          {
            label: "去年",
            value: [
              dayjs().add(-1, "year").startOf("year"),
              dayjs().add(-1, "year").endOf("year"),
            ],
          },
        ];
      case "month":
        return [
          { label: "本月", value: [dayjs().startOf("month"), dayjs()] },
          {
            label: "上月",
            value: [
              dayjs().add(-1, "month").startOf("month"),
              dayjs().add(-1, "month").endOf("month"),
            ],
          },
          { label: "今年", value: [dayjs().startOf("years"), dayjs()] },
          {
            label: "去年",
            value: [
              dayjs().add(-1, "year").startOf("year"),
              dayjs().add(-1, "year").endOf("year"),
            ],
          },
        ];
      default:
        return [
          { label: "本周", value: [dayjs().startOf("week"), dayjs()] },
          {
            label: "上周",
            value: [
              dayjs().add(-1, "week").startOf("week"),
              dayjs().add(-1, "week").endOf("week"),
            ],
          },
          { label: "本月", value: [dayjs().startOf("month"), dayjs()] },
          {
            label: "上月",
            value: [
              dayjs().add(-1, "month").startOf("month"),
              dayjs().add(-1, "month").endOf("month"),
            ],
          },
          { label: "今年", value: [dayjs().startOf("years"), dayjs()] },
          {
            label: "去年",
            value: [
              dayjs().add(-1, "year").startOf("year"),
              dayjs().add(-1, "year").endOf("year"),
            ],
          },
        ];
    }
  }, [props.picker]);
  return (
    <DatePicker.RangePicker
      disabledDate={props.disabledDate ?? disabledDate}
      presets={props.presets ?? presets}
      {...props}
    />
  );
};

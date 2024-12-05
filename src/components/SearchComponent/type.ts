/*
 * @Date: 2022-11-23 08:14:25
 * @LastEditors: myclooe 994386508@qq.com
 * @LastEditTime: 2024-12-05 16:11:35
 * @FilePath: /yzt-react-component/src/components/SearchComponent/type.ts
 */
import { FormItemProps } from "antd";

export interface FormOptionSettingType {
  allowClear?: boolean;
  placeholder?: string;
  width?: number | string;
  request?: "param" | "body";
}

/// name 使用 * 进行分割,前面的为数据后面的为时间格式化
export interface FormOptionType<T = any> extends FormItemProps<T> {
  children?:
  | JSX.Element
  | "input"
  | "inputNumber"
  | "YDatePicker"
  | "YDatePickerRangePicker"
  | "YDatePickerRangePickerShowTime"
  | "YMoneyInput";
  setting?: FormOptionSettingType;
  list?: Partial<Omit<FormOptionType<T>, "label" | "tooltip">>[];
}

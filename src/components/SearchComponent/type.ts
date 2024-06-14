/*
 * @Date: 2022-11-23 08:14:25
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-06-14 11:44:04
 * @FilePath: /yzt-react-component/src/components/SearchComponent/type.ts
 */
import { FormItemProps } from "antd";

export interface FormOptionSettingType {
  allowClear?: boolean;
  placeholder?: string;
  width?: number | string;
  request?: "param" | "body";
}
export interface FormOptionType<T = any> extends FormItemProps<T> {
  children?:
    | JSX.Element
    | "input"
    | "inputNumber"
    | "YDatePicker"
    | "YDatePickerRangePicker"
    | "YMoneyInput";
  setting?: FormOptionSettingType;
  list?: Partial<Omit<FormOptionType<T>, "label" | "tooltip">>[];
}

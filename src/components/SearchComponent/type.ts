/*
 * @Date: 2022-11-23 08:14:25
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-20 10:54:42
 * @FilePath: /yzt-react-component/src/components/SearchComponent/type.ts
 */
import { FormItemProps } from "antd";

export interface FormOptionSettingType {
  allowClear?: boolean;
  placeholder?: string;
  width?: number | string;
  request?: "param" | "body";
}
export interface FormOptionType extends FormItemProps {
  children?:
    | JSX.Element
    | "input"
    | "inputNumber"
    | "YDatePicker"
    | "YDatePickerRangePicker"
    | "YMoneyInput";
  setting?: FormOptionSettingType;
  list?: Partial<Omit<FormOptionType, "label" | "tooltip">>[];
}

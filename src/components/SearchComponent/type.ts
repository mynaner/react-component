/*
 * @Date: 2022-11-23 08:14:25
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-03 15:45:53
 * @FilePath: /yzt-react-component/src/components/SearchComponent/type.d.ts
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

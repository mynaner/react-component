/*
 * @Date: 2022-11-23 08:08:23
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-04-30 14:47:49
 * @FilePath: /yzt-react-component/src/components/SearchComponent/index.tsx
 */
import { FilterFilled } from "@ant-design/icons";
import {
  Button,
  ColProps,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  InputNumber,
  Space,
} from "antd";
import { FC, cloneElement, useImperativeHandle, useState } from "react";
import { FormOptionSettingType, FormOptionType } from "./type";
import { isArray, isObject, isString } from "lodash";
import { isDayjs } from "dayjs";
import { DatePickerComponent } from "../DatePickerComponent";
import { DatePickerRangePickerComponent } from "../DatePickerRangePickerComponent";
import { MoneyInputComponent } from "../MoneyInputComponent";

export interface SearchComponentRefType {
  onSearch?: () => void;
  onReset?: () => void;
}
export interface SearchComponentType<T> {
  /// 对外暴露的两个方法
  cRef?: React.MutableRefObject<SearchComponentRefType | undefined>;
  /// 配置
  options: FormOptionType[];
  /// 显示数量,其余收入弹窗里面
  count: number;
  /// 是否显示 重置按钮
  showReset?: boolean;
  /// 点击搜索
  onChange: (p?: T) => void;
}

type WithOther<T> = T | { [key: string]: any };

export const SearchComponent = <T,>(props: SearchComponentType<T>) => {
  const { count, showReset = true, options, onChange } = props;
  if (count < 0) throw new Error("如果需要 showNum 必须大于1");
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<WithOther<T>>();
  const [isSelect, setIsSelect] = useState(false);
  const isCount = count < options?.filter((e) => e.children || e.list).length;

  /// 过滤隐藏参数
  const optionList = options.filter((e) => e.children || e.list);

  const onFinish = async (res: WithOther<T>) => {
    const da: WithOther<T> = {};
    options
      .filter((e) => !(e.children || e.list))
      .forEach((e) => {
        da[e.name] = e.initialValue;
      });

    onChange(changeData({ ...da, ...res }));

    if (optionList.length) {
      onClose();
    }
  };

  const changeData = (e: any) => {
    const values: { [key: string]: any } = {};
    for (const key in e) {
      if (Object.prototype.hasOwnProperty.call(e, key)) {
        const element = e[key];
        const keys = key.split(/_|:/);

        if (isArray(element)) {
          if (keys.length - 1 === element.length) {
            element.forEach((e, i) => {
              if (isDayjs(e)) {
                values[keys[i]] = e.format(keys.at(-1));
              }
            });
          } else if (keys.length == 1) {
            values[keys[0]] = element;
          } else {
            element.forEach((e, i) => {
              if (isDayjs(e)) {
                values[keys[i]] = e.format("YYYY-MM-DD");
              } else {
                values[keys[i]] = e;
              }
            });
          }
        } else {
          const [k, format] = keys;
          if (isDayjs(element)) {
            values[k] = element.format(format ?? "YYYY-MM-DD");
          } else {
            values[k] = element;
          }
        }
      }
    }

    return values as T;
  };

  const onReset = () => {
    if (optionList.length) {
      form.resetFields();
      form.submit();
    } else {
      onFinish({});
    }
  };

  const onClose = () => {
    const values = form.getFieldsValue() as any;
    const keys: string[] = [];
    optionList.slice(count).forEach((e) => {
      if (isArray(e)) {
        e.forEach((v) => {
          if (isString(v.name) && v.name.trim() != "") {
            keys.push(v.name);
          }
        });
      } else if (isObject(e)) {
        if (isString(e.name) && e.name.trim() != "") {
          keys.push(e.name);
        }
      }
    });
    setIsSelect(false);
    for (const key in values) {
      if (
        keys.includes(key) &&
        values.hasOwnProperty(key) &&
        values[key] != undefined
      ) {
        setIsSelect(true);
        break;
      }
    }
    setOpen(false);
  };

  /// 对外暴露 函数
  useImperativeHandle(props.cRef, () => ({
    onReset: onReset,
    onSearch: form.submit,
  }));

  if (!optionList.length) return <></>;
  return (
    <Form
      form={form}
      style={{ maxWidth: "none" }}
      layout="inline"
      autoComplete="off"
      onFinish={onFinish}
    >
      <Flex wrap="wrap" gap="8px 0">
        {getSearchOptionComponent({
          options: optionList.slice(0, isCount ? count : optionList.length),
          isOther: false,
        })}

        <Form.Item>
          <Space>
            <Button type="primary" onClick={form.submit}>
              搜索
            </Button>
            {showReset && (
              <Button htmlType="button" onClick={onReset}>
                重置
              </Button>
            )}
          </Space>
        </Form.Item>
        {isCount ? (
          <Form.Item>
            <FilterFilled
              onClick={() => setOpen(true)}
              style={{
                color: isSelect ? "rgb(51,167,255)" : "",
                cursor: "pointer",
              }}
            />
            <Drawer
              title="更多条件查询"
              placement="right"
              onClose={onClose}
              open={open}
              width={500}
              footer={
                <Space split={<Divider type="vertical" />}>
                  <Button type="primary" onClick={form.submit}>
                    确认
                  </Button>
                  <Button onClick={onClose}>取消</Button>
                </Space>
              }
            >
              {getSearchOptionComponent({
                options: optionList.slice(count),
                isOther: true,
                labelCol: { span: 5 },
              })}
            </Drawer>
          </Form.Item>
        ) : null}
      </Flex>
    </Form>
  );
};

// 解析通过数据生成表单
const getSearchOptionComponent: FC<{
  options: FormOptionType[];
  isOther: boolean;
  labelCol?: ColProps;
}> = ({ options, isOther, labelCol }) => {
  const listElemet: JSX.Element[] = [];
  options.map((e, i) => {
    if (e.list?.length) {
      listElemet.push(
        <Form.Item
          labelCol={labelCol}
          label={e.label}
          tooltip={e.tooltip}
          key={i + "00001"}
        >
          <Space split="~">
            {e.list?.map((v, n) => {
              return (
                <Form.Item key={i + "00001" + n} noStyle {...v}>
                  {elementAddProps(v, "150px")}
                </Form.Item>
              );
            })}
          </Space>
        </Form.Item>
      );
    } else {
      const item = e as FormOptionType;
      if (item.children) {
        listElemet.push(
          <Form.Item key={i + "00002"} labelCol={labelCol} {...item}>
            {elementAddProps(item, isOther ? "100%" : "150px")}
          </Form.Item>
        );
      }
    }
  });
  return listElemet;
};

const elementAddProps = (item: FormOptionType, width: string = "100%") => {
  const { children, setting } = item;
  if (!children) return;
  const prpos: FormOptionSettingType = {
    allowClear: true,
    width,
    placeholder: "请输入" + (item.label ?? ""),
  };
  if (isString(children)) {
    if (["input"].includes(children)) {
      return (
        <Input
          style={{ width: setting?.width ?? prpos.width }}
          {...prpos}
          {...setting}
        />
      );
    } else if (children == "inputNumber") {
      const { allowClear, ...ev } = prpos;
      return (
        <InputNumber
          style={{ width: setting?.width ?? ev.width }}
          {...ev}
          {...setting}
        />
      );
    } else if (children == "YDatePicker") {
      prpos.allowClear = false;
      return (
        <DatePickerComponent
          placeholder="选择日期"
          style={{ width: setting?.width ?? prpos.width }}
          {...prpos}
          {...setting}
        />
      );
    } else if (children == "YDatePickerRangePicker") {
      const { placeholder, ...ev } = prpos;
      ev.allowClear = false;
      return (
        <DatePickerRangePickerComponent
          style={{ width: setting?.width ?? "100%" }}
          {...ev}
        />
      );
    } else if (children == "YMoneyInput") {
      const { allowClear, ...ev } = prpos;
      return (
        <MoneyInputComponent
          prefix="¥"
          style={{ width: setting?.width ?? prpos.width }}
          {...ev}
          {...setting}
        />
      );
    }
  }

  const child = children as JSX.Element;
  const type = (child?.type["displayName"] as string) ?? child?.type["name"];

  if (["Input"].includes(type)) {
    /// 默认值
  } else if (
    ["Select", "CascaderComponent", "SelectComponent"].includes(type)
  ) {
    prpos.placeholder = "请选择" + (item.label ?? "");
  }
  return cloneElement(child, {
    style: {
      width: setting?.width ?? child.props?.["style"]?.["width"] ?? prpos.width,
    },
    ...prpos,
    ...setting,
  });
};

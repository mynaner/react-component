/*
 * @Date: 2022-11-27 23:32:29
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-26 18:15:46
 * @FilePath: /yzt-react-component/src/components/CascaderComponent/index.tsx
 */
import { Cascader, CascaderProps } from "antd";
import { isNumber, isString } from "lodash";
import { useEffect, useMemo, useState } from "react";

export type CascaderValueType = NonNullable<CascaderProps["value"]>;

export type ValueType = string | number | (string | number)[];

export interface CascaderComponentProps<T, P>
  extends Partial<Omit<CascaderProps, "onChange">> {
  params?: P;
  getTreeFn?: (params?: P) => Promise<T[]>;
  /// 重组树结构的方法
  getTreeData?: (e: T[]) => any;
  onChange?: (e?: ValueType | CascaderValueType) => void;
  formatResult?: (e: CascaderValueType, selectOptions: T[]) => ValueType;
}

export const CascaderComponent = <T extends Record<string, any>, P = object>(
  props: CascaderComponentProps<T, P>
) => {
  const {
    getTreeFn,
    getTreeData,
    formatResult,
    onChange,
    params,
    value,
    ...res
  } = props;
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const getParentId = (
    list: T[],
    id?: string | number
  ): (string | number)[] => {
    for (let element of list) {
      const value = element[res.fieldNames?.value ?? "value"];
      const children = element[res.fieldNames?.children ?? "children"];

      if (value === id) {
        return [value];
      }
      if (children) {
        let node = getParentId(children, id);
        if (node.length) {
          node?.unshift(value);
          return node;
        }
      }
    }
    return [];
  };

  const _value = useMemo(() => {
    if (!options.length) {
      return;
    }

    if (res.multiple) {
      return (value as (string | number)[])?.map((id) =>
        getParentId(options, id)
      );
    }

    return isString(value) || isNumber(value)
      ? getParentId(options, value)
      : undefined;
  }, [value, options, res.fieldNames]);

  const onDropdownVisibleChange = async () => {
    if (options.length === 0) {
      try {
        setLoading(true);
        const res = await getTreeFn?.(params);
        res && setOptions(getTreeData?.(res) ?? res);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (value) {
      onDropdownVisibleChange();
    }
  }, [value]);

  const filter = (inputValue: string, path: T[]) =>
    path.some((option) => {
      const name: JSX.Element | string =
        option[res.fieldNames?.label ?? "label"];
      if (isString(name)) {
        return name.toLowerCase().indexOf(inputValue.toLowerCase()) > -1;
      } else {
        return (
          name.props.children[1]
            .toLowerCase()
            .indexOf(inputValue.toLowerCase()) > -1
        );
      }
    });

  const _onChange = (val: CascaderValueType, selectOptions: T[]) => {
    onChange?.((val && formatResult?.(val, selectOptions)) ?? val);
  };

  return (
    // @ts-ignore
    <Cascader<T>
      showSearch={{ filter }}
      loading={loading}
      options={options}
      value={_value}
      placeholder="请选择"
      onChange={_onChange}
      onDropdownVisibleChange={onDropdownVisibleChange}
      {...res}
    />
  );
};

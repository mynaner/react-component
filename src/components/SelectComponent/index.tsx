/*
 * @Date: 2022-11-27 23:32:29
 * @LastEditors: myclooe 994386508@qq.com
 * @LastEditTime: 2025-02-21 11:44:30
 * @FilePath: /yzt-react-component/src/components/SelectComponent/index.tsx
 */
import { Select, SelectProps } from "antd";
import { isUndefined } from "lodash";
import { useEffect, useState } from "react";

export interface SelectComponentProps<T, P>
  extends Partial<Omit<SelectProps, "options">> {
  getDataFn?: (params?: P) => Promise<T[]>;
  /// 重组树结构的方法
  getTreeData?: (e: T[]) => any;
  params?: P;
}

export const SelectComponent = <T extends object, P = object>(
  props: SelectComponentProps<T, P>
) => {
  const {
    getDataFn,
    getTreeData,
    params,
    fieldNames = { value: "id", label: "name" },
    filterOption,
    ...res
  } = props;

  const [list, setList] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const onDropdownVisibleChange = async () => {
    if (list.length == 0) {
      try {
        setLoading(true);
        const res = await getDataFn?.(params);
        setList(getTreeData ? getTreeData(res ?? []) : res ?? []);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (res.value) {
      onDropdownVisibleChange();
    }
  }, [res.value]);

  return (
    <Select<T>
      loading={loading}
      options={list}
      filterOption={
        isUndefined(filterOption)
          ? (input, option) =>
            (option?.[fieldNames.label ?? ""] ?? "")
              .toLowerCase()
              .includes(input.toLowerCase())
          : filterOption
      }
      fieldNames={getTreeData ? undefined : fieldNames}
      onDropdownVisibleChange={onDropdownVisibleChange}
      placeholder={"请选择"}
      {...res}
    />
  );
};

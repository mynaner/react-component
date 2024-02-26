/*
 * @Date: 2022-11-27 23:32:29
 * @LastEditors: Knight
 * @LastEditTime: 2024-02-26 15:28:32
 * @FilePath: /yzt-react-component/src/components/SelectComponent/index.tsx
 */
import { Select, SelectProps } from "antd";
import { useEffect, useState } from "react";

export interface SelectComponentProps<T, P>
  extends Partial<Omit<SelectProps, "onChange" | "value" | "options">> {
  onChange?: (val: string, e: T) => void;
  value?: any;
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
  }, [res?.value]);

  return (
    <Select<T>
      loading={loading}
      // @ts-ignore
      options={list}
      fieldNames={getTreeData ? undefined : fieldNames}
      onDropdownVisibleChange={onDropdownVisibleChange}
      placeholder={"请选择"}
      {...res}
    />
  );
};

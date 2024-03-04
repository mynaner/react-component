/*
 * @Date: 2022-11-27 23:32:29
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-03-01 17:18:25
 * @FilePath: /yzt-react-component/src/components/TreeSelectComponent/index.tsx
 */
import { TreeSelect, TreeSelectProps } from "antd";
import { isArray, isString } from "lodash";
import { useEffect, useMemo, useState } from "react";

export interface TreeSelectComponentProps<T, P>
  extends Partial<
    Omit<
      TreeSelectProps<string>,
      "loading" | "treeData" | "onDropdownVisibleChange" | "filterTreeNode"
    >
  > {
  getTreeFn?: (params?: P) => Promise<T[]>;
  /// 重组树结构的方法
  getTreeData?: (e: T[]) => any;
  params?: P;
  onChange?: TreeSelectProps["onChange"];
  moreChange?: (
    e: string | undefined,
    v: React.ReactNode[]
  ) => (string | undefined)[];
}
export const TreeSelectComponent = <T extends object, P = object>(
  props: TreeSelectComponentProps<T, P>
) => {
  const {
    getTreeFn,
    getTreeData,
    params,
    fieldNames = { value: "id", label: "name" },
    treeCheckable,
    onChange,
    showCheckedStrategy = TreeSelect.SHOW_CHILD,
    moreChange,
    value,
    ...res
  } = props;
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const onDropdownVisibleChange = async () => {
    if (options.length == 0) {
      try {
        setLoading(true);
        const res = await getTreeFn?.(params);
        setOptions(getTreeData ? getTreeData(res ?? []) : res ?? []);
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

  const _value = useMemo(() => {
    return !treeCheckable && isArray(value)
      ? value.find((e) => {
          console.log(e);

          return e;
        })
      : value;
  }, [value]);

  return (
    <TreeSelect<string>
      treeCheckable={treeCheckable}
      showCheckedStrategy={showCheckedStrategy}
      loading={loading}
      filterTreeNode={(input, treeNode) => {
        const name: JSX.Element | string =
          treeNode[fieldNames?.label ?? "label"];
        if (isString(name)) {
          return name.toLowerCase().indexOf(input.toLowerCase()) > -1;
        } else {
          return (
            name.props.children[1].toLowerCase().indexOf(input.toLowerCase()) >
            -1
          );
        }
      }}
      value={_value}
      fieldNames={fieldNames}
      onDropdownVisibleChange={onDropdownVisibleChange}
      treeData={options}
      onChange={(e, v, d) =>
        onChange?.(moreChange ? moreChange?.(e, v) : e, v, d)
      }
      {...res}
    />
  );
};

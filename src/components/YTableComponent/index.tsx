/*
 * @Date: 2022-11-23 22:47:04
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-03-20 16:35:53
 * @FilePath: /yzt-react-component/src/components/YTableComponent/index.tsx
 */
import { add, isNumber, isString } from "lodash";
import { BarsOutlined } from "@ant-design/icons";
import { Button, Space, Table, Typography } from "antd";
import { TablePaginationConfig } from "antd/es/table";
import { ColumnType } from "antd/lib/table/interface";
import { useId } from "react";
import { columnTypefn } from "./useFn";
import { TableProps } from "antd/lib";

export interface YColumnType<T> extends ColumnType<T> {
  /**
   * 字段类型
   *
   * money 会除100 并携带 元 结尾
   *
   * msgType 会取 msg?.node 下的字符 如果字符长度大于4会 加省略号并移入现在完整信息 默认值 '--'
   *
   * mum 单纯数字 默认值为0
   *
   * null 默认值 '--'
   */
  textType?: "money" | "msgType" | "null" | "num" | "copy";
  /**
   * 统计
   *
   * money 单纯数字累加 然后 会除100 并 "元" 结尾
   *
   * mum 单纯数字累加 无单位
   *
   * time 单纯数字累加 "次" 结尾
   *
   * hide 使用统计, (解决在统计字符在children中,无法发现的问题,该字符应该在第一个column下)
   */
  summary?: "money" | "num" | "time" | "hide";
  ///
  tip?: string;
  /**
   * 是否隐藏列表字段
   */
  show?: boolean;
  /**
   * 权限 通过权限字段校验是否展示该列
   */
  auth?: boolean;
}

export interface YColumnGroupType<RecordType>
  extends Omit<YColumnType<RecordType>, "dataIndex"> {
  children: YColumnsType<RecordType>;
}
export type YColumnsType<RecordType = unknown> = (
  | YColumnGroupType<RecordType>
  | YColumnType<RecordType>
)[];

export interface YTablePaginationProps {
  total?: number;
  pageSize?: number;
  pageNum?: number;
}

interface YTableComponentProps<T>
  extends Omit<TableProps<T>, "title" | "columns"> {
  columns: YColumnsType<T>;
  title?: String | false;
  headerRight?: JSX.Element;
  pagination?: YTablePaginationProps;
}

export const YTable = <T extends unknown>(props: YTableComponentProps<T>) => {
  const {
    pagination,
    headerRight,
    title,
    columns,
    size = "middle",
    ...res
  } = props;
  const tableTitle = () => {
    return (
      <div className="flex justify-between items-center">
        <div className="text-base font-medium">
          <BarsOutlined className="text-base mr-1" />
          {title}
        </div>
        <Space>{headerRight}</Space>
      </div>
    );
  };

  const keyId = useId();
  return (
    <Table
      size={size}
      rowKey={(item?: any) =>
        item?.id ?? `${keyId}_${Math.random().toString(36).substring(2, 10)}`
      }
      title={tableTitle}
      pagination={getPagination(pagination)}
      columns={columnTypefn(columns)}
      summary={(dataSource) => getSummary(dataSource, columnTypefn(columns))}
      {...res}
    />
  );
};

const getPagination = (
  pagination?: YTablePaginationProps
): false | TablePaginationConfig => {
  if (!pagination) return false;
  return {
    position: ["bottomCenter"],
    total: pagination.total,
    showTotal: (total) => `共 ${total} 条`,
    showSizeChanger: true,
    current: pagination.pageNum,
    pageSize: pagination.pageSize,
    itemRender: (_, type, originalElement) =>
      type === "prev" ? (
        <Button className="mx-2" size="small">
          上一页
        </Button>
      ) : type === "next" ? (
        <Button className="mx-2" size="small">
          下一页
        </Button>
      ) : (
        originalElement
      ),
  };
};

const getSummary = <T,>(dataSource: readonly T[], columns: YColumnsType<T>) => {
  if (dataSource.length == 0 || columns.length == 0) return;
  if (!columns.map((e) => e.summary).find((e) => e != undefined)) return;

  const keys: { name?: string; summary?: string }[] = [];
  columns?.forEach((el) => {
    if (!(el as YColumnGroupType<T>)?.children) {
      keys.push({
        name: (el as YColumnType<T>).dataIndex as string,
        summary: el.summary,
      });
    }
    (el as YColumnGroupType<T>)?.children?.forEach((item: any) => {
      keys.push({ name: item.dataIndex, summary: item.summary });
    });
  });
  let list: (number | string)[] = ["统计"];
  dataSource?.forEach((data) => {
    keys.forEach((key, i) => {
      if (!isString(key.name)) return;
      const d = (data as { [key: string]: string })[key.name] as string;
      if (i == 0) {
      } else if (!key.summary) {
        list[i] = "--" as never;
      } else if (list[i]) {
        list[i] = add(list[i] as number, parseFloat(d ?? 0));
      } else {
        list[i] = parseFloat(d ?? 0);
      }
    });
  });
  keys?.forEach((key, i) => {
    if (i != 0) {
      const d = list[i];
      if (key?.summary == "money") {
        if (isNumber(d)) {
          list[i] = (d / 100).toString().match(/^\d+(?:\.\d{0,4})?/) + "元";
        }
      } else if (key?.summary == "time") {
        list[i] = d.toString().match(/^\d+(?:\.\d{0,4})?/) + "次";
      } else if (key?.summary == "num") {
        if (isNumber(d)) {
          list[i] = d.toString().match(/^\d+(?:\.\d{0,4})?/) + "";
        }
      }
    }
  });
  return (
    <Table.Summary.Row>
      {list.map((text, key) => (
        <Table.Summary.Cell key={key} index={key}>
          <Typography.Text type="danger">{text}</Typography.Text>
        </Table.Summary.Cell>
      ))}
    </Table.Summary.Row>
  );
};

import React, { useState, useEffect, useImperativeHandle, useRef } from "react";
import { isArray, isEmpty, isFunction, isObject, isString } from "lodash";
import { Flex, TableProps } from "antd";
import { Key } from "antd/lib/table/interface";
import { IPage, Paging } from "../types/index";
import { useBoolean } from "ahooks";
import {
  YColumnsType,
  YTable,
  YTablePaginationProps,
} from "../YTableComponent";
import { SearchComponent, SearchComponentRefType } from "../SearchComponent";
import { FormOptionType } from "../SearchComponent/type";
import { FilterValue } from "antd/es/table/interface";

export interface TablePageLayoutRefProps<P extends Object = Object> {
  getFormState: () => {
    params?: P;
    data?: P;
  };
  // 重新请求数据
  getTableList: (e?: {
    data?: P;
    param?: P;
    // 是否重置分页参数
    isResetPage?: boolean;
    // 是否重置表单参数
    isResetForm?: boolean;
    // 是否重置Const
    isResetConst?: boolean;
  }) => void;
}
interface TablePageLayoutProps<T, P extends Object>
  extends Omit<TableProps<T>, "title" | "columns" | "children" | "pagination"> {
  columns: YColumnsType<T>;
  searchReset?: () => void;
  /// 表格头部右边模块
  headerRight?:
  | JSX.Element
  | ((e: {
    search?: { params?: P; data?: P };
    dataSource?: T[];
  }) => JSX.Element);
  // 约束该函数类型 继承 Paging
  getTableFn?: (
    params: P,
    data?: Object
  ) => Promise<IPage<T> | T[] | undefined>;
  /// 搜索对象
  searchOptions?: FormOptionType[];
  title?: React.ReactNode;
  /// 搜索条件数量(大于该数的会隐藏到侧边栏)
  showNum?: number;
  cRef?: React.MutableRefObject<TablePageLayoutRefProps<P> | undefined>;
  ///
  children?:
  | JSX.Element
  | ((e: {
    search?: { params?: P; data?: P };
    dataSource?: T[];
  }) => JSX.Element);
  /// 是否自动执行请求 默认true
  isRequest?: boolean;
  // 默认每页条数
  initPageSize?: number;
  // 排序 key 字段
  orderByName?: string;
  // 
  searchClassName?: string;
}

/**
 * T getTableFn 返回参数
 * P getTableFn 接收参数 
 * @param props
 * @returns
 */
export const YLayoutTable = <
  T extends Object,
  P extends Object = Object,
>(
  props: TablePageLayoutProps<T, P>
) => {
  const {
    searchOptions,
    getTableFn,
    headerRight,
    showNum = 4,
    title,
    children,
    isRequest = true,
    initPageSize = 10,
    onChange,
    searchReset,
    ...res
  } = props;

  /// 是否有分页
  const [isPagination, setIsPagination] = useBoolean(true);

  /// 外部查询参数 | 分页,排序,重置,搜索 不会更改该数据 | 只有对外暴露的 getTableList 函数可以修改该对象
  const constState = useRef<{ param: P | { [key: string]: any }, data: P | { [key: string]: any } }>();
  /// 表单的参数 | 分页,排序时 使用该数据继续查询,|  getTableList ,重置,查询 | 会重置该对象 查询会以新值覆盖,
  const formState = useRef<P>();
  /// 分页参数以及 排序,或表格头筛选参数, |  getTableList 重置 |会重置该对象
  const paginationRef = useRef<YTablePaginationProps>({
    pageNum: 1,
    pageSize: initPageSize,
  });
  /// 请求状态
  const [loading, setLoading] = useState<boolean>();
  /// 缓冲当前请求的参数
  const [serachData, setSearchData] = useState<{ params?: P; data?: P }>({
    params: undefined,
    data: undefined,
  });

  /// 表格数据
  const [dataSource, setDataSource] = useState<T[]>([]);

  const searchRef = useRef<SearchComponentRefType>();

  /// 查询表格数据 搜索 切换分页,第一次进入的查询
  const getTable = async () => {
    /// 查询条件不需要total
    const { total, ...page } = paginationRef.current;
    /// 根据情况重组数据 tips 主要是初始数据
    const fParams = getFParams(formState.current as Paging, searchOptions);

    try {
      setLoading(true);
      setSearchData({
        params: { ...fParams.param, ...page, ...constState.current?.param } as P,
        data: { ...fParams.data as P, ...constState.current?.data },
      });
      const res = await getTableFn?.(
        { ...fParams.param, ...page, ...constState.current?.param } as P,
        { ...fParams.data, ...constState.current?.data }
      );
      if (isArray(res)) {
        setDataSource(res ?? []);
        setIsPagination.setFalse();
      } else {
        setDataSource((res as IPage<T>)?.records ?? []);
        /// 请求成功后再改变分页数据
        paginationRef.current.total = (res as IPage<T>)?.total ?? 0;
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  /// 页面初始化后获取图表数据
  useEffect(() => {
    if (isRequest) searchRef.current?.onSearch?.();
  }, []);


  /// 对外暴露 函数
  useImperativeHandle(
    props.cRef,
    (): TablePageLayoutRefProps<P> => ({
      getFormState: () => serachData,
      getTableList: (e) => {
        if (e) {
          const { data, param, isResetConst, isResetForm, isResetPage } = e;
          if (data || param || isResetConst)
            constState.current = { data: { ...constState.current?.data, ...data }, param: { ...constState.current?.param, ...param } };
          if (isResetPage) paginationRef.current.pageNum = 1;

          if (isResetForm) {
            searchRef.current?.onReset?.();
            return;
          }
        }
        getTable();
      },
    })
  );

  return (
    <Flex vertical gap="middle">
      <SearchComponent<P>
        className={`px-2 py-4 rounded-lg shadow-sm ${props.searchClassName ?? res.className}`}
        cRef={searchRef}
        onResetfn={(e) => {
          formState.current = e;
          paginationRef.current = {
            pageNum: 1,
            pageSize: initPageSize,
          };
          searchReset?.();
          getTable();
        }}
        options={searchOptions ?? []}
        count={showNum}
        onChange={(e) => {
          formState.current = e;
          paginationRef.current.pageNum = 1;
          getTable();
        }}
      />
      {isFunction(children)
        ? children?.({
          search: serachData,
          dataSource,
        })
        : children}
      <YTable<T>
        dataSource={dataSource}
        pagination={isPagination ? paginationRef.current : undefined}
        loading={loading}
        onChange={(e, c, d, v) => {
          let orderBy: string | undefined = undefined;
          if (isObject(d) && !isEmpty(d) && !isArray(d)) {
            // 多列排序,暂时不支持 因为 orderBy 非数组
            orderBy = d.order ? `${d.field} ${d.order == "descend" ? "desc" : "asc"}` : "";
          }
          let fromat: {
            [key: string]: FilterValue | Key | boolean | undefined;
          } = {};
          if (c) {
            for (const key in c) {
              if (Object.prototype.hasOwnProperty.call(c, key)) {
                const element = c[key];
                if (element) {
                  fromat[key] = element?.length == 1 ? element[0] : element;
                } else {
                  fromat[key] = undefined;
                }
              }
            }
          }
          paginationRef.current = {
            pageNum: e.current,
            pageSize: e.pageSize,
            [props.orderByName ?? 'orderBy']: orderBy,
            total: e.total,
            ...fromat,
          };

          getTable();
          onChange?.(e, c, d, v);
        }}
        headerRight={
          isFunction(headerRight)
            ? headerRight?.({
              search: serachData,
              dataSource,
            })
            : headerRight
        }
        title={title}
        className={`rounded-lg shadow-sm ${res.className}`}
        {...res}
      />
    </Flex>
  );
};

const getFParams = (fParams: Paging, options?: FormOptionType[]) => {
  const param: Paging = {};
  const data: Paging = {};
  options?.forEach((el) => {
    if (isString(el.name)) {
      el.name
        .split("*")[0]
        .split("_")
        .forEach((e) => {
          if (el.setting?.request == "body") {
            data[e] = fParams ? fParams[e] : el.initialValue;
          } else {
            param[e] = fParams ? fParams[e] : el.initialValue;
          }
        });
    } else if (el.list?.length) {
      el.list.forEach((el) => {
        if (isString(el.name)) {
          el.name
            .split("*")[0]
            .split("_")
            .forEach((e) => {
              if (el.setting?.request == "body") {
                data[e] = fParams ? fParams[e] : el.initialValue;
              } else {
                param[e] = fParams ? fParams[e] : el.initialValue;
              }
            });
        }
      });
    }
  });

  return { param, data };
};

import React, { useState, useEffect, useImperativeHandle, useRef } from "react";
import { isArray, isFunction, isString } from "lodash";
import { Flex, TableProps } from "antd";
import { SorterResult } from "antd/lib/table/interface";
import { IPage, Paging } from "../types/index";
import { useBoolean } from "ahooks";
import {
  YColumnsType,
  YTable,
  YTablePaginationProps,
} from "../YTableComponent";
import { SearchComponent, SearchComponentRefType } from "../SearchComponent";
import { FormOptionType } from "../SearchComponent/type";

export interface TablePageLayoutRefProps<P extends Object = Object> {
  onSearch?: SearchComponentRefType["onSearch"];
  getFormState: () => {
    param?: P;
    data?: P;
  };
  // 重新请求数据 isResetPage 是否重置分页参数然后请求数据
  getTableList: (e?: P, isResetPage?: boolean) => void;
}
interface TablePageLayoutProps<T, P extends Object, C>
  extends Omit<TableProps<T>, "title" | "columns" | "children" | "pagination"> {
  ///
  columns: YColumnsType<T>;
  /// 表格数据完成后的回调
  onCallBack?: (e: { search?: P; dataSource?: T[] }) => void;
  /// 表格头部右边模块
  headerRight?:
    | JSX.Element
    | ((e: { search?: P; dataSource?: T[] }) => JSX.Element);
  // 约束该函数类型 继承 Paging
  getTableFn?: (
    params: P,
    data?: Object
  ) => Promise<IPage<T> | T[] | undefined>;
  /// 图表方法
  getCahrtDataFn?: ((params: Object) => Promise<C | undefined>) | false;
  /// 搜索对象
  searchOptions?: FormOptionType[];
  title?: React.ReactNode;
  /// 搜索条件数量(大于该数的会隐藏到侧边栏)
  showNum?: number;
  cRef?: React.MutableRefObject<TablePageLayoutRefProps<P> | undefined>;
  ///
  children?:
    | JSX.Element
    | JSX.Element[]
    | ((e: { loading?: boolean; chartData?: C }) => JSX.Element);
  /// 是否自动执行请求 默认true
  isRequest?: boolean;
  initPageSize?: number;
}

/**
 * T getTableFn 返回参数
 * P getTableFn 接收参数
 * C getCahrtDataFn 返回参数
 * @param props
 * @returns
 */
export const YLayoutTable = <
  T extends Object,
  P extends Object = Object,
  C extends Object = Object
>(
  props: TablePageLayoutProps<T, P, C>
) => {
  const {
    searchOptions,
    getTableFn,
    headerRight,
    showNum,
    title,
    children,
    getCahrtDataFn,
    isRequest = true,
    onCallBack,
    initPageSize,
    ...res
  } = props;

  /// 是否有分页
  const [isPagination, setIsPagination] = useBoolean(true);

  const constState = useRef<P | { [key: string]: any }>();
  /// 存储查询表单的参数
  const [formState, setFormState] = useState<P>();
  /// 请求状态
  const [loading, setLoading] = useState<boolean>();
  /// 图表的请求状态
  const [charLoading, setCharLoading] = useState<boolean>();
  /// 图表请求到的数据
  const [chartData, setChartData] = useState<C>();
  /// 分页数据
  const [pagination, setPagination] = useState<YTablePaginationProps>({
    pageNum: 1,
    pageSize: initPageSize ?? 10,
  });
  /// 表格数据
  const [dataSource, setDataSource] = useState<T[]>([]);

  const searchRef = useRef<SearchComponentRefType>();

  /// 查询表格数据 搜索 切换分页,第一次进入的查询
  const getTable = async (pag: Paging, e?: Paging) => {
    /// 查询条件不需要total
    const { total, ...page } = pagination;
    /// 合并查询条件 e 代表表单数据
    const params: Paging = { ...page, ...(e ?? formState) };

    /// 根据情况重组数据 tips 主要是初始数据
    const fParams = getFParams(params, searchOptions);

    try {
      /// 当分页 pageNum 为1 的时候 并且有children 再获取图表数据
      if (page.pageNum == 1) getCahrtData(fParams);

      setLoading(true);

      const res = await getTableFn?.(
        { ...fParams.param, ...pag, ...constState.current } as P,
        fParams.data
      );
      if (isArray(res)) {
        setDataSource(res ?? []);
        setIsPagination.setFalse();
        onCallBack?.({ search: params as P, dataSource: res });
      } else {
        setDataSource((res as IPage<T>)?.records ?? []);
        /// 请求成功后再改变分页数据
        setPagination({
          ...pagination,
          ...pag,
          total: (res as IPage<T>)?.total ?? 0,
        });
        onCallBack?.({ search: params as P, dataSource: res?.records });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  /// 点击搜索查询数据
  const onChangeSearch = (e?: P, isReset?: boolean) => {
    setFormState(e);
    if (isReset) {
      getTable(pagination, e);
    } else {
      getTable({ pageNum: 1, pageSize: 10 }, e);
    }
  };

  /// 页面初始化后获取图表数据
  useEffect(() => {
    if (isRequest) initGetData();
  }, []);

  /// 获取图表数据
  const getCahrtData = async (data: Paging) => {
    if (getCahrtDataFn == false) return;
    const { pageNum, pageSize, ...params } = data;

    try {
      setCharLoading(true);
      const res = await getCahrtDataFn?.({ ...params.param, ...params.data });
      setChartData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setCharLoading(false);
    }
  };

  const initGetData = () => {
    if (searchOptions?.filter((e) => e.children || e.list)?.length) {
      searchRef.current?.onSearch?.();
    } else {
      const ls = searchOptions?.filter((e) => !(e.children || e.list));
      const keyValue: P | { [key: string]: any } = {};
      ls?.forEach((e) => {
        keyValue[e.name] = e.initialValue;
      });
      // @ts-expect-error
      onChangeSearch(keyValue);
    }
  };

  /// 对外暴露 函数
  useImperativeHandle(
    props.cRef,
    (): TablePageLayoutRefProps<P> => ({
      onSearch: searchRef.current?.onSearch,
      getFormState: () => {
        const fParams = getFParams({ ...formState }, searchOptions);
        return fParams as {
          param?: P;
          data?: P;
        };
      },
      getTableList: (e, isReset = false) => {
        constState.current = e;
        if (isReset) {
          onChangeSearch(formState, isReset);
        } else {
          initGetData();
        }
      },
    })
  );

  return (
    <Flex vertical gap="middle">
      <SearchComponent<P>
        cRef={searchRef}
        options={searchOptions ?? []}
        count={showNum ?? 4}
        onChange={onChangeSearch}
      />
      {isFunction(children)
        ? isFunction(getCahrtDataFn)
          ? children({ loading: charLoading, chartData })
          : undefined
        : children}
      <YTable<T>
        dataSource={dataSource}
        pagination={isPagination ? pagination : undefined}
        loading={loading}
        onChange={(e, _, d) => {
          if (d && (d as SorterResult<T>).order) {
            let order = "asc";
            // @ts-ignore
            if (d.order == "descend") order = "desc";
            getTable({
              pageNum: e.current,
              pageSize: e.pageSize,
              // @ts-ignore
              orderBy: `${d.field} ${order}`,
            });
          } else {
            getTable({
              pageNum: e.current,
              pageSize: e.pageSize,
              orderBy: undefined,
            });
          }
        }}
        headerRight={
          isFunction(headerRight)
            ? headerRight?.({ search: formState, dataSource })
            : headerRight
        }
        title={title}
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
        .split(":")[0]
        .split("_")
        .forEach((e) => {
          if (el.setting?.request == "body") {
            data[e] = fParams[e];
          } else {
            param[e] = fParams[e];
          }
        });
    } else if (el.list?.length) {
      el.list.forEach((el) => {
        if (isString(el.name)) {
          el.name
            .split(":")[0]
            .split("_")
            .forEach((e) => {
              if (el.setting?.request == "body") {
                data[e] = fParams[e];
              } else {
                param[e] = fParams[e];
              }
            });
        }
      });
    }
  });

  return { param, data };
};

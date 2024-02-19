/*
 * @Date: 2024-02-07 16:13:45
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-07 16:14:08
 * @FilePath: /yzt-react-component/src/components/types/index.ts
 */
export interface Paging {
  pageNum?: number;
  pageSize?: number;
  [key: string]: any;
}

export interface IPage<T> {
  current: number;
  pages: number;
  records: T[];
  size: number;
  total: number;
}

export interface MsgType {
  node: string;
  type: number;
  value?: number;
}

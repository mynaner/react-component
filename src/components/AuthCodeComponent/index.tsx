/*
 * @Date: 2022-06-30 15:21:50
 * @LastEditors: dengxin 994386508@qq.com
 * @LastEditTime: 2024-02-02 10:32:06
 * @FilePath: /yzt-react-component/src/components/AuthCodeComponent/index.tsx
 */
import { useEffect, useState } from "react";
import { Row, Col, Input, Button, message } from "antd";

let timer: NodeJS.Timeout;

export interface AuthCodeComponentProps<T> {
  value?: string;
  onChange?: (e: string) => void;
  getDataFn?: (params?: T) => Promise<boolean | undefined>;
  params?: T;
}
export const AuthCodeComponent = <T,>(props: AuthCodeComponentProps<T>) => {
  const { value, onChange, getDataFn, params } = props;
  const [loading, setLoading] = useState(false);

  const [time, setTime] = useState(0);

  const batchStatus = async () => {
    setLoading(true);
    const res = await getDataFn?.(params);
    setLoading(false);
    if (res) {
      message.success("验证码发送成功");
      //直接使用
      setTime(60);
    }
  };

  useEffect(() => {
    timer && clearInterval(timer);
    return () => {
      timer && clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (time === 60) timer = setInterval(() => setTime((time) => --time), 1000);
    else if (time === 0) {
      clearInterval(timer);
    }
  }, [time]);

  return (
    <Row gutter={8}>
      <Col span={16}>
        <Input
          placeholder="请输入验证码"
          value={value}
          onChange={(e) => {
            onChange?.(e.target.value);
          }}
        />
      </Col>
      <Col span={8}>
        <Button loading={loading} disabled={time > 0} onClick={batchStatus}>
          {time ? `${time}s` : "获取验证码"}
        </Button>
      </Col>
    </Row>
  );
};
